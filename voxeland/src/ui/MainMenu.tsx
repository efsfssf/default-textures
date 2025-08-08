import type { CSSProperties } from 'react';

export function MainMenu(props: { onSingleplayer: () => void; onOptions: () => void; onQuit: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, #0e2a47, #123b5f)' }}>
      <div style={{ textAlign: 'center', color: '#e0f7fa', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
        <h1 style={{ fontSize: 48, marginBottom: 24 }}>Voxeland</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300, margin: '0 auto' }}>
          <button onClick={props.onSingleplayer} style={btn}>Одиночная игра</button>
          <button onClick={props.onOptions} style={btn}>Опции</button>
          <button onClick={props.onQuit} style={btn}>Выйти</button>
        </div>
      </div>
    </div>
  );
}

const btn: CSSProperties = {
  padding: '12px 16px',
  fontSize: 18,
  background: 'linear-gradient(180deg, #4db6ac, #00897b)',
  border: '2px solid #004d40',
  color: '#e0f2f1',
  borderRadius: 6,
  cursor: 'pointer',
};