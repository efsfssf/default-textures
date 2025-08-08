export type Updatable = {
  update: (dt: number) => void;
};

export type Renderable = {
  render: () => void;
};

export class Engine {
  private updatables: Set<Updatable> = new Set();
  private renderables: Set<Renderable> = new Set();
  private rafId: number | null = null;
  private accumulator = 0;
  private lastTime = 0;
  private readonly fixedDt = 1 / 60;

  addUpdatable(u: Updatable) {
    this.updatables.add(u);
  }
  removeUpdatable(u: Updatable) {
    this.updatables.delete(u);
  }
  addRenderable(r: Renderable) {
    this.renderables.add(r);
  }
  removeRenderable(r: Renderable) {
    this.renderables.delete(r);
  }

  start() {
    this.lastTime = performance.now() / 1000;
    const loop = () => {
      const now = performance.now() / 1000;
      const frameDt = Math.min(0.25, now - this.lastTime);
      this.lastTime = now;
      this.accumulator += frameDt;

      while (this.accumulator >= this.fixedDt) {
        for (const u of this.updatables) u.update(this.fixedDt);
        this.accumulator -= this.fixedDt;
      }

      for (const r of this.renderables) r.render();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
}