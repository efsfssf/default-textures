export type Vec3 = { x: number; y: number; z: number };

export const CHUNK_SIZE_X = 16;
export const CHUNK_SIZE_Z = 16;
export const CHUNK_SIZE_Y = 256;

export type ChunkCoords = { cx: number; cz: number };

export const BLOCK_AIR = 0;

export type VoxelId = number;

export type Seed = string;

export type WorldId = string;

export interface ChunkKey {
  worldId: WorldId;
  cx: number;
  cz: number;
}

export function chunkKeyToString(key: ChunkKey): string {
  return `${key.worldId}:${key.cx}:${key.cz}`;
}

export function worldToChunk(x: number, z: number) {
  const cx = Math.floor(x / CHUNK_SIZE_X);
  const cz = Math.floor(z / CHUNK_SIZE_Z);
  return { cx, cz } as ChunkCoords;
}

export function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}