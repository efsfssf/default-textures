export class InputManager {
  private keys = new Set<string>();
  private _lookDX = 0;
  private _lookDY = 0;
  sensitivity = 1.0;

  constructor(element: HTMLElement) {
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));

    element.addEventListener('click', () => element.requestPointerLock());
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === element) {
        document.addEventListener('mousemove', this.onMouseMove, false);
      } else {
        document.removeEventListener('mousemove', this.onMouseMove, false);
      }
    });
  }

  private onMouseMove = (e: MouseEvent) => {
    this._lookDX += e.movementX * this.sensitivity;
    this._lookDY += e.movementY * this.sensitivity;
  };

  consumeLookDelta() {
    const dx = this._lookDX;
    const dy = this._lookDY;
    this._lookDX = 0;
    this._lookDY = 0;
    return { dx, dy };
  }

  get forward() {
    return (this.keys.has('KeyW') ? 1 : 0) + (this.keys.has('KeyS') ? -1 : 0);
  }
  get right() {
    return (this.keys.has('KeyD') ? 1 : 0) + (this.keys.has('KeyA') ? -1 : 0);
  }
  get jump() {
    return this.keys.has('Space');
  }
  get crouch() {
    return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }
  get run() {
    return this.keys.has('ControlLeft') || this.keys.has('ControlRight');
  }
}