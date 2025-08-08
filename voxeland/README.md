# Voxeland

A browser-based voxel sandbox inspired by block games. Built with Vite + React + TypeScript and Three.js. Unique UI and procedural assets, no copyrighted content.

## Features
- Infinite procedural world with 16×16×256 chunks
- Seeded terrain with plains/forest/hills, caves, ores, trees, ocean level
- Web Workers for generation and meshing (non-blocking UI)
- Texture atlas generated procedurally at runtime
- Basic sunlight, fog, mipmapping
- AABB physics, 1-block jump, step offset
- Block breaking/placing, crosshair, hotbar
- World saves per chunk in IndexedDB

## Controls
- WASD to move, Space to jump, Shift to crouch, Ctrl to run
- Mouse to look (click canvas to capture pointer)
- Left click break, Right click place (dirt)
- Esc pause menu

## Requirements
- Modern Chromium or Firefox

## Setup
```
npm install
npm run dev
```

Open the shown local URL. Create a world in Singleplayer and play.

## Build
```
npm run build
npm run preview
```

## Architecture
- `core/`: engine loop, events, shared types
- `world/`: blocks, chunks, lighting, chunk manager, save store
- `render/`: renderer, texture atlas
- `physics/`: physics, player controller
- `input/`: input manager
- `ui/`: menus, HUD
- `workers/`: generator and mesher
- `app/Game.ts`: composition root

## License
All code in this repo is original. Procedural textures are generated at runtime and are not derived from third-party assets. UI mimics common UX patterns but uses unique visual design and naming.
