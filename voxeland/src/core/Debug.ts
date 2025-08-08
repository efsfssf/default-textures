export type DebugState = {
  player: { x: number; y: number; z: number; yaw: number; pitch: number };
  chunks: {
    generated: number;
    meshed: number;
    activeChunkCount: number;
    activeMeshCount: number;
    lastGen: { cx: number; cz: number } | null;
    lastMesh: { cx: number; cz: number } | null;
  };
};

export const debugState: DebugState = {
  player: { x: 0, y: 0, z: 0, yaw: 0, pitch: 0 },
  chunks: {
    generated: 0,
    meshed: 0,
    activeChunkCount: 0,
    activeMeshCount: 0,
    lastGen: null,
    lastMesh: null,
  },
};

// Expose to window for quick inspection in devtools
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).__dbg = debugState;