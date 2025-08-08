/// <reference lib="webworker" />
import { makeNoise2D, makeNoise3D } from 'open-simplex-noise';
import { BlockId } from '../world/BlockId';
import { CHUNK_SIZE_X, CHUNK_SIZE_Y, CHUNK_SIZE_Z } from '../core/Types';

export type GenRequest = {
  seed: string;
  cx: number;
  cz: number;
  seaLevel: number;
};

export type GenResponse = {
  cx: number;
  cz: number;
  voxels: ArrayBuffer;
};

function strToSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function generateChunk(seedStr: string, cx: number, cz: number, seaLevel: number): Uint16Array {
  const seed = strToSeed(seedStr);
  const noise2 = makeNoise2D(seed);
  const noise3 = makeNoise3D(seed ^ 0x9e3779b9);

  const voxels = new Uint16Array(CHUNK_SIZE_X * CHUNK_SIZE_Y * CHUNK_SIZE_Z);
  const idx = (x: number, y: number, z: number) => x + z * CHUNK_SIZE_X + y * CHUNK_SIZE_X * CHUNK_SIZE_Z;

  for (let x = 0; x < CHUNK_SIZE_X; x++) {
    for (let z = 0; z < CHUNK_SIZE_Z; z++) {
      const wx = cx * CHUNK_SIZE_X + x;
      const wz = cz * CHUNK_SIZE_Z + z;

      const biomeVal = noise2(wx * 0.0008, wz * 0.0008);
      const hills = noise2(wx * 0.002, wz * 0.002);
      const baseHeight = Math.floor(64 + hills * 12 + biomeVal * 8);
      const forestness = (noise2(wx * 0.01, wz * 0.01) + 1) * 0.5;

      for (let y = 0; y < CHUNK_SIZE_Y; y++) {
        voxels[idx(x, y, z)] = BlockId.Air;
      }

      for (let y = 0; y <= baseHeight; y++) {
        if (y === baseHeight) {
          if (baseHeight <= seaLevel + 1) voxels[idx(x, y, z)] = BlockId.Sand;
          else voxels[idx(x, y, z)] = BlockId.Grass;
        } else if (baseHeight - y <= 3) {
          voxels[idx(x, y, z)] = BlockId.Dirt;
        } else {
          const n = noise3(wx * 0.02, y * 0.02, wz * 0.02);
          if (y < 60 && n > 0.58) voxels[idx(x, y, z)] = BlockId.CoalOre;
          else if (y < 40 && n > 0.68) voxels[idx(x, y, z)] = BlockId.IronOre;
          else voxels[idx(x, y, z)] = BlockId.Stone;
        }
      }

      for (let y = 10; y < baseHeight - 2; y++) {
        const c = noise3(wx * 0.013, y * 0.013, wz * 0.013);
        if (c > 0.62) {
          voxels[idx(x, y, z)] = BlockId.Air;
        }
      }

      for (let y = baseHeight + 1; y <= seaLevel; y++) {
        voxels[idx(x, y, z)] = BlockId.Water;
      }

      const canTree = baseHeight > seaLevel + 1 && forestness > 0.55 && noise2(wx * 0.1, wz * 0.1) > 0.7;
      if (canTree) {
        const height = 4 + Math.floor((noise2(wx * 0.2, wz * 0.2) + 1) * 2);
        for (let ty = 1; ty <= height; ty++) {
          voxels[idx(x, baseHeight + ty, z)] = BlockId.Log;
        }
        const radius = 2;
        for (let lx = -radius; lx <= radius; lx++) {
          for (let lz = -radius; lz <= radius; lz++) {
            for (let ly = -radius; ly <= radius; ly++) {
              if (lx * lx + lz * lz + ly * ly <= radius * radius + 1) {
                const yy = baseHeight + height + ly;
                if (yy >= 0 && yy < CHUNK_SIZE_Y) {
                  const xx = x + lx;
                  const zz = z + lz;
                  if (xx >= 0 && xx < CHUNK_SIZE_X && zz >= 0 && zz < CHUNK_SIZE_Z) {
                    const a = voxels[idx(xx, yy, zz)];
                    if (a === BlockId.Air) voxels[idx(xx, yy, zz)] = BlockId.Leaves;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return voxels;
}

self.onmessage = (ev: MessageEvent<GenRequest>) => {
  const { seed, cx, cz, seaLevel } = ev.data;
  const voxels = generateChunk(seed, cx, cz, seaLevel);
  const resp: GenResponse = { cx, cz, voxels: voxels.buffer };
  (self as any).postMessage(resp, [resp.voxels]);
};