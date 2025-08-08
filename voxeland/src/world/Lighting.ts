import { CHUNK_SIZE_X, CHUNK_SIZE_Y, CHUNK_SIZE_Z } from '../core/Types';
import { Chunk } from './Chunk';
import { BlockId, isOpaque } from './BlockId';

export function computeSunlight(chunk: Chunk, getNeighbor: (x: number, y: number, z: number) => BlockId) {
  for (let x = 0; x < CHUNK_SIZE_X; x++) {
    for (let z = 0; z < CHUNK_SIZE_Z; z++) {
      let lightLevel = 15;
      for (let y = CHUNK_SIZE_Y - 1; y >= 0; y--) {
        const id = getNeighbor(x + chunk.cx * CHUNK_SIZE_X, y, z + chunk.cz * CHUNK_SIZE_Z);
        if (isOpaque(id)) {
          lightLevel = Math.max(0, lightLevel - 1);
        }
        chunk.setLight(x, y, z, lightLevel);
      }
    }
  }
}