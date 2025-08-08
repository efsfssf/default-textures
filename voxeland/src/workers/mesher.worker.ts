/// <reference lib="webworker" />
import { CHUNK_SIZE_X, CHUNK_SIZE_Y, CHUNK_SIZE_Z } from '../core/Types';
import { BlockId } from '../world/BlockId';
import { BLOCKS } from '../world/BlockRegistry';

export type MeshRequest = {
  cx: number;
  cz: number;
  voxels: ArrayBuffer;
  light: ArrayBuffer | null;
  tilesPerRow: number;
};

export type MeshResponse = {
  cx: number;
  cz: number;
  positions: ArrayBuffer;
  normals: ArrayBuffer;
  uvs: ArrayBuffer;
  colors: ArrayBuffer;
  indices: ArrayBuffer;
};

const DIRS = [
  { d: [1, 0, 0], n: [1, 0, 0] },
  { d: [-1, 0, 0], n: [-1, 0, 0] },
  { d: [0, 1, 0], n: [0, 1, 0] },
  { d: [0, -1, 0], n: [0, -1, 0] },
  { d: [0, 0, 1], n: [0, 0, 1] },
  { d: [0, 0, -1], n: [0, 0, -1] },
] as const;

const FACES = [
  // +x
  [
    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 1],
    [1, 0, 1],
  ],
  // -x
  [
    [0, 0, 1],
    [0, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
  // +y
  [
    [0, 1, 1],
    [1, 1, 1],
    [1, 1, 0],
    [0, 1, 0],
  ],
  // -y
  [
    [0, 0, 0],
    [1, 0, 0],
    [1, 0, 1],
    [0, 0, 1],
  ],
  // +z
  [
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 1],
  ],
  // -z
  [
    [0, 1, 0],
    [1, 1, 0],
    [1, 0, 0],
    [0, 0, 0],
  ],
] as const;

function isTransparent(id: BlockId): boolean {
  return id === BlockId.Air || id === BlockId.Water || id === BlockId.Leaves;
}

function buildMesh(
  cx: number,
  cz: number,
  voxels: Uint16Array,
  light: Uint8Array | null,
  tilesPerRow: number,
) {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const idx = (x: number, y: number, z: number) => x + z * CHUNK_SIZE_X + y * CHUNK_SIZE_X * CHUNK_SIZE_Z;

  const get = (x: number, y: number, z: number): BlockId => {
    if (x < 0 || x >= CHUNK_SIZE_X || y < 0 || y >= CHUNK_SIZE_Y || z < 0 || z >= CHUNK_SIZE_Z) return BlockId.Air;
    return voxels[idx(x, y, z)] as BlockId;
  };

  const pushFace = (face: number, x: number, y: number, z: number, tileIndex: number, lightness: number) => {
    const base = positions.length / 3;
    const verts = FACES[face];
    for (let i = 0; i < 4; i++) {
      const vx = x + verts[i][0];
      const vy = y + verts[i][1];
      const vz = z + verts[i][2];
      positions.push(vx, vy, vz);
      const n = DIRS[face].n;
      normals.push(n[0], n[1], n[2]);
      const u = (tileIndex % tilesPerRow) / tilesPerRow;
      const v = Math.floor(tileIndex / tilesPerRow) / tilesPerRow;
      const du = 1 / tilesPerRow;
      const dv = 1 / tilesPerRow;
      // Map corners preserving winding
      const uvOrder = [0, 1, 2, 3];
      const o = uvOrder[i];
      uvs.push(u + (o === 1 || o === 2 ? du : 0), v + (o >= 2 ? dv : 0));
      colors.push(lightness, lightness, lightness);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };

  for (let y = 0; y < CHUNK_SIZE_Y; y++) {
    for (let z = 0; z < CHUNK_SIZE_Z; z++) {
      for (let x = 0; x < CHUNK_SIZE_X; x++) {
        const id = voxels[idx(x, y, z)] as BlockId;
        if (id === BlockId.Air) continue;
        const def = BLOCKS[id];
        for (let f = 0; f < 6; f++) {
          const nx = x + DIRS[f].d[0];
          const ny = y + DIRS[f].d[1];
          const nz = z + DIRS[f].d[2];
          const neighbor = get(nx, ny, nz);
          if (neighbor === BlockId.Air || (isTransparent(neighbor) && neighbor !== id)) {
            const tileIndex = Object.values(def.textures)[f];
            const l = light ? (light[idx(x, y, z)] / 15) * 0.7 + 0.3 : 1.0;
            pushFace(f, x + cx * CHUNK_SIZE_X, y, z + cz * CHUNK_SIZE_Z, tileIndex, l);
          }
        }
      }
    }
  }

  return {
    positions: new Float32Array(positions).buffer,
    normals: new Float32Array(normals).buffer,
    uvs: new Float32Array(uvs).buffer,
    colors: new Float32Array(colors).buffer,
    indices: new Uint32Array(indices).buffer,
  };
}

self.onmessage = (ev: MessageEvent<MeshRequest>) => {
  const { cx, cz, voxels, light, tilesPerRow } = ev.data;
  const v = new Uint16Array(voxels);
  const l = light ? new Uint8Array(light) : null;
  const res = buildMesh(cx, cz, v, l, tilesPerRow);
  const resp: MeshResponse = { cx, cz, ...res };
  (self as any).postMessage(resp, [resp.positions, resp.normals, resp.uvs, resp.colors, resp.indices]);
};