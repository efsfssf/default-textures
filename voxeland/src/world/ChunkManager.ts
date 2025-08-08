import * as THREE from 'three';
import { CHUNK_SIZE_X, CHUNK_SIZE_Z, CHUNK_SIZE_Y, worldToChunk } from '../core/Types';
import { Chunk } from './Chunk';
import { computeSunlight } from './Lighting';
import { BlockId } from './BlockId';
import { putChunk, getChunk } from './SaveStore';
import type { WorldId } from '../core/Types';

export type ChunkMeshData = {
  mesh: THREE.Mesh;
  bounds: THREE.Box3;
};

export type ChunkManagerOptions = {
  worldId: WorldId;
  seed: string;
  loadRadius: number;
  seaLevel: number;
  atlas: { texture: THREE.Texture; tilesPerRow: number };
  scene: THREE.Scene;
};

export class ChunkManager {
  private chunks = new Map<string, Chunk>();
  private meshes = new Map<string, ChunkMeshData>();
  private lru: string[] = [];
  private generatorWorker: Worker;
  private mesherWorker: Worker;

  constructor(private opts: ChunkManagerOptions) {
    this.generatorWorker = new Worker(new URL('../workers/generator.worker.ts', import.meta.url), { type: 'module' });
    this.mesherWorker = new Worker(new URL('../workers/mesher.worker.ts', import.meta.url), { type: 'module' });
    this.generatorWorker.onmessage = (e) => this.onGenerated(e.data);
    this.mesherWorker.onmessage = (e) => this.onMeshed(e.data);
  }

  private key(cx: number, cz: number) {
    return `${cx}:${cz}`;
  }

  private updateLRU(key: string) {
    const i = this.lru.indexOf(key);
    if (i !== -1) this.lru.splice(i, 1);
    this.lru.unshift(key);
    while (this.lru.length > 512) {
      const k = this.lru.pop()!;
      this.unloadByKey(k);
    }
  }

  async ensureChunk(cx: number, cz: number) {
    const k = this.key(cx, cz);
    if (this.chunks.has(k)) return;
    // Try load from DB
    const saved = await getChunk({ worldId: this.opts.worldId, cx, cz });
    if (saved) {
      const chunk = new Chunk(cx, cz);
      chunk.voxels.set(new Uint16Array(saved.voxels));
      chunk.light.set(new Uint8Array(saved.light));
      this.chunks.set(k, chunk);
      this.requestMesh(chunk);
      this.updateLRU(k);
      return;
    }
    // Request generation
    this.generatorWorker.postMessage({ seed: this.opts.seed, cx, cz, seaLevel: this.opts.seaLevel });
  }

  private async onGenerated(data: { cx: number; cz: number; voxels: ArrayBuffer }) {
    const { cx, cz, voxels } = data;
    const k = this.key(cx, cz);
    const chunk = new Chunk(cx, cz);
    chunk.voxels.set(new Uint16Array(voxels));
    // compute sunlight
    const get = (x: number, y: number, z: number) => this.getBlock(x, y, z);
    computeSunlight(chunk, get);
    this.chunks.set(k, chunk);
    this.updateLRU(k);
    // persist
    putChunk({ key: { worldId: this.opts.worldId, cx, cz }, voxels: chunk.voxels.buffer.slice(0), light: chunk.light.buffer.slice(0), version: 1 });
    this.requestMesh(chunk);
  }

  private requestMesh(chunk: Chunk) {
    this.mesherWorker.postMessage({
      cx: chunk.cx,
      cz: chunk.cz,
      voxels: chunk.voxels.buffer,
      light: chunk.light.buffer,
      tilesPerRow: this.opts.atlas.tilesPerRow,
    });
  }

  private onMeshed(data: { cx: number; cz: number; positions: ArrayBuffer; normals: ArrayBuffer; uvs: ArrayBuffer; colors: ArrayBuffer; indices: ArrayBuffer }) {
    const { cx, cz } = data;
    const k = this.key(cx, cz);
    const positions = new Float32Array(data.positions);
    const normals = new Float32Array(data.normals);
    const uvs = new Float32Array(data.uvs);
    const colors = new Float32Array(data.colors);
    const indices = new Uint32Array(data.indices);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setIndex(new THREE.BufferAttribute(indices, 1));

    const material = new THREE.MeshLambertMaterial({ map: this.opts.atlas.texture, vertexColors: true, fog: true, transparent: true, alphaTest: 0.1 });
    const mesh = new THREE.Mesh(geom, material);
    mesh.frustumCulled = true;
    const bounds = new THREE.Box3().setFromBufferAttribute(geom.getAttribute('position') as THREE.BufferAttribute);

    const prev = this.meshes.get(k);
    if (prev) {
      this.opts.scene.remove(prev.mesh);
      prev.mesh.geometry.dispose();
      (prev.mesh.material as THREE.Material).dispose();
    }

    this.meshes.set(k, { mesh, bounds });
    this.opts.scene.add(mesh);
  }

  unloadFar(center: THREE.Vector3) {
    const radius = this.opts.loadRadius * Math.max(CHUNK_SIZE_X, CHUNK_SIZE_Z);
    for (const [k, data] of this.meshes) {
      if (data.bounds.distanceToPoint(center) > radius * 2) {
        this.unloadByKey(k);
      }
    }
  }

  private unloadByKey(k: string) {
    const mesh = this.meshes.get(k);
    if (mesh) {
      this.opts.scene.remove(mesh.mesh);
      mesh.mesh.geometry.dispose();
      (mesh.mesh.material as THREE.Material).dispose();
      this.meshes.delete(k);
    }
  }

  updateAround(position: THREE.Vector3) {
    const center = worldToChunk(position.x, position.z);
    for (let dz = -this.opts.loadRadius; dz <= this.opts.loadRadius; dz++) {
      for (let dx = -this.opts.loadRadius; dx <= this.opts.loadRadius; dx++) {
        const d2 = dx * dx + dz * dz;
        if (d2 > this.opts.loadRadius * this.opts.loadRadius) continue;
        const cx = center.cx + dx;
        const cz = center.cz + dz;
        this.ensureChunk(cx, cz);
      }
    }
  }

  getBlock(x: number, y: number, z: number): BlockId {
    const cx = Math.floor(x / CHUNK_SIZE_X);
    const cz = Math.floor(z / CHUNK_SIZE_Z);
    const k = this.key(cx, cz);
    const chunk = this.chunks.get(k);
    if (!chunk) return BlockId.Air;
    const lx = x - cx * CHUNK_SIZE_X;
    const lz = z - cz * CHUNK_SIZE_Z;
    if (y < 0 || y >= CHUNK_SIZE_Y) return BlockId.Air;
    return chunk.get(lx, y, lz);
  }

  setBlock(x: number, y: number, z: number, id: BlockId) {
    const cx = Math.floor(x / CHUNK_SIZE_X);
    const cz = Math.floor(z / CHUNK_SIZE_Z);
    const k = this.key(cx, cz);
    const chunk = this.chunks.get(k);
    if (!chunk) return;
    const lx = x - cx * CHUNK_SIZE_X;
    const lz = z - cz * CHUNK_SIZE_Z;
    chunk.set(lx, y, lz, id);
    this.requestMesh(chunk);
    putChunk({ key: { worldId: this.opts.worldId, cx, cz }, voxels: chunk.voxels.buffer.slice(0), light: chunk.light.buffer.slice(0), version: 1 });
    if (lx === 0) this.ensureChunk(cx - 1, cz);
    if (lx === CHUNK_SIZE_X - 1) this.ensureChunk(cx + 1, cz);
    if (lz === 0) this.ensureChunk(cx, cz - 1);
    if (lz === CHUNK_SIZE_Z - 1) this.ensureChunk(cx, cz + 1);
  }

  raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number) {
    let x = Math.floor(origin.x);
    let y = Math.floor(origin.y);
    let z = Math.floor(origin.z);
    const stepX = dir.x > 0 ? 1 : -1;
    const stepY = dir.y > 0 ? 1 : -1;
    const stepZ = dir.z > 0 ? 1 : -1;
    const tDeltaX = Math.abs(1 / dir.x);
    const tDeltaY = Math.abs(1 / dir.y);
    const tDeltaZ = Math.abs(1 / dir.z);
    let tMaxX = ((x + (dir.x > 0 ? 1 : 0)) - origin.x) / dir.x;
    let tMaxY = ((y + (dir.y > 0 ? 1 : 0)) - origin.y) / dir.y;
    let tMaxZ = ((z + (dir.z > 0 ? 1 : 0)) - origin.z) / dir.z;

    for (let t = 0; t <= maxDist; ) {
      const id = this.getBlock(x, y, z);
      if (id !== BlockId.Air && id !== BlockId.Water && id !== BlockId.Leaves) {
        return { x, y, z, t } as const;
      }
      if (tMaxX < tMaxY) {
        if (tMaxX < tMaxZ) {
          x += stepX;
          t = tMaxX;
          tMaxX += tDeltaX;
        } else {
          z += stepZ;
          t = tMaxZ;
          tMaxZ += tDeltaZ;
        }
      } else {
        if (tMaxY < tMaxZ) {
          y += stepY;
          t = tMaxY;
          tMaxY += tDeltaY;
        } else {
          z += stepZ;
          t = tMaxZ;
          tMaxZ += tDeltaZ;
        }
      }
      if (t > maxDist) break;
    }

    return null;
  }
}