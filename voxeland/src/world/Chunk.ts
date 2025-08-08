import { CHUNK_SIZE_X, CHUNK_SIZE_Y, CHUNK_SIZE_Z, mod } from '../core/Types';
import { BlockId } from './BlockId';

export class Chunk {
  readonly voxels: Uint16Array; // store block ids
  readonly light: Uint8Array; // 0..15 sunlight

  constructor(public readonly cx: number, public readonly cz: number) {
    this.voxels = new Uint16Array(CHUNK_SIZE_X * CHUNK_SIZE_Y * CHUNK_SIZE_Z);
    this.light = new Uint8Array(CHUNK_SIZE_X * CHUNK_SIZE_Y * CHUNK_SIZE_Z);
  }

  getIndex(x: number, y: number, z: number): number {
    return x + z * CHUNK_SIZE_X + y * CHUNK_SIZE_X * CHUNK_SIZE_Z;
  }

  get(x: number, y: number, z: number): BlockId {
    if (y < 0 || y >= CHUNK_SIZE_Y) return BlockId.Air;
    const ix = mod(x, CHUNK_SIZE_X);
    const iz = mod(z, CHUNK_SIZE_Z);
    return this.voxels[this.getIndex(ix, y, iz)] as BlockId;
  }

  set(x: number, y: number, z: number, id: BlockId): void {
    if (y < 0 || y >= CHUNK_SIZE_Y) return;
    const ix = mod(x, CHUNK_SIZE_X);
    const iz = mod(z, CHUNK_SIZE_Z);
    this.voxels[this.getIndex(ix, y, iz)] = id;
  }

  setLight(x: number, y: number, z: number, value: number): void {
    if (y < 0 || y >= CHUNK_SIZE_Y) return;
    const ix = mod(x, CHUNK_SIZE_X);
    const iz = mod(z, CHUNK_SIZE_Z);
    this.light[this.getIndex(ix, y, iz)] = value & 0xf;
  }
  getLight(x: number, y: number, z: number): number {
    if (y < 0 || y >= CHUNK_SIZE_Y) return 15;
    const ix = mod(x, CHUNK_SIZE_X);
    const iz = mod(z, CHUNK_SIZE_Z);
    return this.light[this.getIndex(ix, y, iz)];
  }
}