import * as THREE from 'three';
import { CHUNK_SIZE_Y } from '../core/Types';
import { BlockId } from '../world/BlockId';

export interface VoxelAccessor {
  getBlock(x: number, y: number, z: number): BlockId;
}

export class Physics {
  gravity = -20;
  terminalVelocity = -50;

  integrateAABB(position: THREE.Vector3, velocity: THREE.Vector3, halfSize: THREE.Vector3, dt: number, world: VoxelAccessor, stepHeight = 1) {
    // Apply gravity
    velocity.y += this.gravity * dt;
    if (velocity.y < this.terminalVelocity) velocity.y = this.terminalVelocity;

    // Move on each axis and resolve collisions
    position.x += velocity.x * dt;
    this.resolveAxis(position, velocity, halfSize, world, 'x', stepHeight);

    position.z += velocity.z * dt;
    this.resolveAxis(position, velocity, halfSize, world, 'z', stepHeight);

    position.y += velocity.y * dt;
    this.resolveAxis(position, velocity, halfSize, world, 'y', stepHeight);

    // clamp to world floor/ceiling
    if (position.y < 0) {
      position.y = 0;
      velocity.y = 0;
    }
    if (position.y > CHUNK_SIZE_Y - 2) {
      position.y = CHUNK_SIZE_Y - 2;
      velocity.y = 0;
    }
  }

  private resolveAxis(position: THREE.Vector3, velocity: THREE.Vector3, halfSize: THREE.Vector3, world: VoxelAccessor, axis: 'x' | 'y' | 'z', stepHeight: number) {
    const sign = Math.sign((velocity as any)[axis]);
    if (sign === 0) return;

    const min = new THREE.Vector3(position.x - halfSize.x, position.y - halfSize.y, position.z - halfSize.z);
    const max = new THREE.Vector3(position.x + halfSize.x, position.y + halfSize.y, position.z + halfSize.z);

    const start = Math.floor((min as any)[axis]);
    const end = Math.floor((max as any)[axis]);

    // Sweep from start to end based on sign
    const step = sign > 0 ? 1 : -1;
    for (let i = start; sign > 0 ? i <= end : i >= end; i += step) {
      // Check voxels overlapping the swept AABB slab
      const x0 = Math.floor(min.x);
      const x1 = Math.floor(max.x);
      const y0 = Math.floor(min.y);
      const y1 = Math.floor(max.y);
      const z0 = Math.floor(min.z);
      const z1 = Math.floor(max.z);

      for (let y = y0; y <= y1; y++) {
        for (let z = z0; z <= z1; z++) {
          for (let x = x0; x <= x1; x++) {
            const id = world.getBlock(x, y, z);
            if (id !== BlockId.Air) {
              // Collision detected; move back along axis
              (position as any)[axis] = sign > 0 ? Math.min((position as any)[axis], (Math.floor((axis === 'x' ? x : axis === 'y' ? y : z)) - (halfSize as any)[axis])) : Math.max((position as any)[axis], (Math.floor((axis === 'x' ? x + 1 : axis === 'y' ? y + 1 : z + 1)) + (halfSize as any)[axis]));
              (velocity as any)[axis] = 0;
              // Step-up logic for x/z collisions
              if ((axis === 'x' || axis === 'z') && stepHeight > 0) {
                const canStep = this.canStepUp(position, halfSize, world, stepHeight);
                if (canStep) {
                  position.y = Math.floor(position.y) + stepHeight + 0.001;
                }
              }
              return;
            }
          }
        }
      }
    }
  }

  private canStepUp(position: THREE.Vector3, halfSize: THREE.Vector3, world: VoxelAccessor, stepHeight: number): boolean {
    // Check space above feet for stepping
    const x0 = Math.floor(position.x - halfSize.x);
    const x1 = Math.floor(position.x + halfSize.x);
    const z0 = Math.floor(position.z - halfSize.z);
    const z1 = Math.floor(position.z + halfSize.z);
    const y = Math.floor(position.y) + 1;

    for (let h = 1; h <= stepHeight; h++) {
      for (let z = z0; z <= z1; z++) {
        for (let x = x0; x <= x1; x++) {
          if (world.getBlock(x, y + h, z) !== BlockId.Air) return false;
        }
      }
    }
    return true;
  }
}