export function PauseMenu(props: { onResume: () => void; onOptions: () => void; onMainMenu: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)' }}>
      <div style={{ background: '#0b1e2c', padding: 20, border: '2px solid #1b3b52', borderRadius: 8, color: '#e0f7fa', width: 360 }}>
        <h2>Пауза</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={props.onResume}>Вернуться в игру</button>
          <button onClick={props.onOptions}>Опции</button>
          <button onClick={props.onMainMenu}>Главное меню</button>
        </div>
      </div>
    </div>
  );
}