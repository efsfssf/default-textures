import * as THREE from 'three';
import { Physics } from './Physics';
import type { VoxelAccessor } from './Physics';

export interface InputState {
  forward: number;
  right: number;
  jump: boolean;
  crouch: boolean;
  run: boolean;
  lookDeltaX: number;
  lookDeltaY: number;
}

export class PlayerController {
  position = new THREE.Vector3(0, 80, 0);
  velocity = new THREE.Vector3();
  yaw = 0;
  pitch = 0;
  halfSize = new THREE.Vector3(0.35, 0.9, 0.35);
  speed = 6;
  runMultiplier = 1.6;
  crouchMultiplier = 0.5;
  jumpVelocity = 8; // tuned to allow 1-block jump
  onGround = false;
  physics = new Physics();

  update(dt: number, input: InputState, world: VoxelAccessor) {
    // Look
    this.yaw -= input.lookDeltaX * 0.002;
    this.pitch -= input.lookDeltaY * 0.002;
    this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));

    // Movement
    const dir = new THREE.Vector3();
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    dir.addScaledVector(forward, input.forward).addScaledVector(right, input.right);
    if (dir.lengthSq() > 0) dir.normalize();

    let moveSpeed = this.speed;
    if (input.run) moveSpeed *= this.runMultiplier;
    if (input.crouch) moveSpeed *= this.crouchMultiplier;

    this.velocity.x = dir.x * moveSpeed;
    this.velocity.z = dir.z * moveSpeed;

    // Jump if on ground
    if (input.jump && this.onGround) {
      this.velocity.y = this.jumpVelocity;
      this.onGround = false;
    }

    const oldY = this.position.y;
    this.physics.integrateAABB(this.position, this.velocity, this.halfSize, dt, world, 1);
    this.onGround = this.position.y === oldY && this.velocity.y === 0;
  }

  getCameraPosition(): THREE.Vector3 {
    return new THREE.Vector3(this.position.x, this.position.y + 0.7, this.position.z);
  }
}