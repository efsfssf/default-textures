export function HUD() {
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
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {new Array(9).fill(0).map((_, i) => (
          <div key={i} style={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.2)', borderRadius: 4 }} />
        ))}
      </div>
    </div>
  );
}