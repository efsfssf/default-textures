import * as THREE from 'three';

export class TextureAtlas {
  texture: THREE.Texture;
  tileSize: number;
  tilesPerRow: number;

  constructor(tileSize = 16, tilesPerRow = 8) {
    this.tileSize = tileSize;
    this.tilesPerRow = tilesPerRow;

    const canvas = document.createElement('canvas');
    canvas.width = tileSize * tilesPerRow;
    canvas.height = tileSize * tilesPerRow;
    const ctx = canvas.getContext('2d')!;

    const drawTile = (idx: number, drawer: (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => void) => {
      const x = (idx % tilesPerRow) * tileSize;
      const y = Math.floor(idx / tilesPerRow) * tileSize;
      drawer(ctx, x, y, tileSize);
    };

    const fillNoise = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, colorA: string, colorB: string) => {
      const img = ctx.createImageData(s, s);
      for (let j = 0; j < s; j++) {
        for (let i = 0; i < s; i++) {
          const n = (Math.sin(i * 0.7 + j * 1.3) + Math.sin(i * 1.9 - j * 0.8)) * 0.25 + 0.5;
          const t = Math.min(1, Math.max(0, n));
          const c1 = new THREE.Color(colorA);
          const c2 = new THREE.Color(colorB);
          const c = c1.clone().lerp(c2, t);
          const k = (i + j * s) * 4;
          img.data[k] = Math.floor(c.r * 255);
          img.data[k + 1] = Math.floor(c.g * 255);
          img.data[k + 2] = Math.floor(c.b * 255);
          img.data[k + 3] = 255;
        }
      }
      ctx.putImageData(img, x, y);
    };

    // 0 grassTop
    drawTile(0, (c, x, y, s) => fillNoise(c, x, y, s, '#3ea73e', '#2e7d2e'));
    // 1 grassSide
    drawTile(1, (c, x, y, s) => {
      fillNoise(c, x, y, s, '#6b4f2e', '#4a351e');
      c.fillStyle = '#3ea73e';
      c.fillRect(x, y, s, Math.floor(s * 0.35));
    });
    // 2 dirt
    drawTile(2, (c, x, y, s) => fillNoise(c, x, y, s, '#6b4f2e', '#4a351e'));
    // 3 stone
    drawTile(3, (c, x, y, s) => fillNoise(c, x, y, s, '#9aa0a6', '#6d7075'));
    // 4 sand
    drawTile(4, (c, x, y, s) => fillNoise(c, x, y, s, '#e5d29f', '#d7c487'));
    // 5 water
    drawTile(5, (c, x, y, s) => fillNoise(c, x, y, s, '#3a7bd5', '#154284'));
    // 6 log side
    drawTile(6, (c, x, y, s) => fillNoise(c, x, y, s, '#795548', '#5d4037'));
    // 7 log top
    drawTile(7, (c, x, y, s) => fillNoise(c, x, y, s, '#a98274', '#8d6e63'));
    // 8 leaves
    drawTile(8, (c, x, y, s) => fillNoise(c, x, y, s, '#6fbf73', '#4caf50'));
    // 9 coal ore
    drawTile(9, (c, x, y, s) => fillNoise(c, x, y, s, '#6d7075', '#44464a'));
    // 10 iron ore
    drawTile(10, (c, x, y, s) => fillNoise(c, x, y, s, '#9aa0a6', '#b0b4b8'));

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestMipMapNearestFilter;
    tex.generateMipmaps = true;
    this.texture = tex;
  }

  getUVs(tileIndex: number): [number, number, number, number] {
    const s = 1 / this.tilesPerRow;
    const u = (tileIndex % this.tilesPerRow) * s;
    const v = Math.floor(tileIndex / this.tilesPerRow) * s;
    return [u, v, s, s];
  }
}