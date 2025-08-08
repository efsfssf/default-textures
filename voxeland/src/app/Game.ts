import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { Renderer } from '../render/Renderer';
import { TextureAtlas } from '../render/TextureAtlas';
import { InputManager } from '../input/InputManager';
import { PlayerController } from '../physics/PlayerController';
import { ChunkManager } from '../world/ChunkManager';
import { BlockId } from '../world/BlockId';
import { debugState } from '../core/Debug';

export type GameOptions = {
  container: HTMLElement;
  worldId: string;
  seed: string;
  fov: number;
  loadRadius: number;
};

export class Game {
  engine = new Engine();
  renderer: Renderer;
  atlas: TextureAtlas;
  input: InputManager;
  player = new PlayerController();
  chunks: ChunkManager;

  constructor(opts: GameOptions) {
    this.renderer = new Renderer(opts.container, opts.fov);
    this.atlas = new TextureAtlas(16, 8);
    const scene = this.renderer.scene;
    const camera = this.renderer.camera;

    this.input = new InputManager(this.renderer.renderer.domElement);

    this.chunks = new ChunkManager({
      worldId: opts.worldId,
      seed: opts.seed,
      loadRadius: opts.loadRadius,
      seaLevel: 62,
      atlas: { texture: this.atlas.texture, tilesPerRow: this.atlas.tilesPerRow },
      scene,
    });

    this.engine.addUpdatable({
      update: (dt: number) => {
        const look = this.input.consumeLookDelta();
        this.player.update(dt, {
          forward: this.input.forward,
          right: this.input.right,
          jump: this.input.jump,
          crouch: this.input.crouch,
          run: this.input.run,
          lookDeltaX: look.dx,
          lookDeltaY: look.dy,
        }, this.chunks);
        camera.position.copy(this.player.getCameraPosition());
        camera.rotation.set(this.player.pitch, this.player.yaw, 0, 'ZYX');
        this.chunks.updateAround(this.player.position);
        this.chunks.unloadFar(this.player.position);

        // Debug updates
        debugState.player.x = this.player.position.x;
        debugState.player.y = this.player.position.y;
        debugState.player.z = this.player.position.z;
        debugState.player.yaw = this.player.yaw;
        debugState.player.pitch = this.player.pitch;
      },
    });

    this.engine.addRenderable({ render: () => this.renderer.render() });

    // Mouse buttons for interact
    this.renderer.renderer.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.breakBlock();
      if (e.button === 2) this.placeBlock();
    });
    this.renderer.renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private breakBlock() {
    const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(this.player.pitch, this.player.yaw, 0, 'ZYX'));
    const hit = this.chunks.raycast(this.player.getCameraPosition(), dir, 6);
    if (!hit) return;
    this.chunks.setBlock(hit.x, hit.y, hit.z, BlockId.Air);
  }

  private placeBlock() {
    const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(this.player.pitch, this.player.yaw, 0, 'ZYX'));
    const hit = this.chunks.raycast(this.player.getCameraPosition(), dir, 6);
    if (!hit) return;
    // Place at adjacent position (simple backstep along dir)
    const nx = hit.x + (dir.x > 0 ? -1 : 1);
    const ny = hit.y + (dir.y > 0 ? -1 : 1);
    const nz = hit.z + (dir.z > 0 ? -1 : 1);
    this.chunks.setBlock(nx, ny, nz, BlockId.Dirt);
  }

  start() {
    this.engine.start();
  }

  stop() {
    this.engine.stop();
  }
}