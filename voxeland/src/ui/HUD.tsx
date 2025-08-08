import { debugState } from '../core/Debug';

export function HUD() {
  const d = debugState;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 14,
          height: 14,
          marginLeft: -7,
          marginTop: -7,
          borderLeft: '2px solid rgba(255,255,255,0.8)',
          borderTop: '2px solid rgba(255,255,255,0.8)',
          borderRight: '2px solid rgba(255,255,255,0.8)',
          borderBottom: '2px solid rgba(255,255,255,0.8)',
          borderRadius: 2,
        }}
      />
      {/* debug overlay */}
      <div style={{ position: 'absolute', top: 8, left: 8, padding: '6px 8px', background: 'rgba(0,0,0,0.45)', color: '#e0f7fa', fontFamily: 'monospace', fontSize: 12, borderRadius: 4 }}>
        <div>pos: {d.player.x.toFixed(2)} {d.player.y.toFixed(2)} {d.player.z.toFixed(2)}</div>
        <div>rot: yaw {d.player.yaw.toFixed(2)} pitch {d.player.pitch.toFixed(2)}</div>
        <div>chunks: gen {d.chunks.generated} mesh {d.chunks.meshed}</div>
        <div>active: chunks {d.chunks.activeChunkCount} meshes {d.chunks.activeMeshCount}</div>
        <div>last: gen {d.chunks.lastGen ? `${d.chunks.lastGen.cx},${d.chunks.lastGen.cz}` : '-'}</div>
        <div>last: mesh {d.chunks.lastMesh ? `${d.chunks.lastMesh.cx},${d.chunks.lastMesh.cz}` : '-'}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {new Array(9).fill(0).map((_, i) => (
          <div key={i} style={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.2)', borderRadius: 4 }} />
        ))}
      </div>
    </div>
  );
}