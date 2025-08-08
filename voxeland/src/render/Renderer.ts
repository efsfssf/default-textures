import * as THREE from 'three';

export class Renderer {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;

  constructor(container: HTMLElement, fov: number) {
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    // Ensure crisp rendering and a visible sky background instead of default black
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setClearColor(0x87ceeb, 1); // sky blue
    this.scene.background = new THREE.Color(0x87ceeb);
    container.appendChild(this.renderer.domElement);

    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.012);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(1, 2, 1);
    this.scene.add(dir);

    window.addEventListener('resize', () => this.onResize(container));
  }

  onResize(container: HTMLElement) {
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}