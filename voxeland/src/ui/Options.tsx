export interface OptionsData {
  sensitivity: number;
  fov: number;
  renderDistance: number;
}

export function Options(props: { options: OptionsData; onChange: (o: OptionsData) => void; onBack: () => void }) {
  const { options, onChange } = props;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)' }}>
      <div style={{ background: '#0b1e2c', padding: 20, border: '2px solid #1b3b52', borderRadius: 8, color: '#e0f7fa', width: 420 }}>
        <h2>Опции</h2>
        <label>Чувствительность мыши: {options.sensitivity.toFixed(2)}</label>
        <input type="range" min={0.2} max={2} step={0.1} value={options.sensitivity} onChange={(e) => onChange({ ...options, sensitivity: Number(e.target.value) })} />
        <label>FOV: {options.fov}</label>
        <input type="range" min={60} max={110} step={1} value={options.fov} onChange={(e) => onChange({ ...options, fov: Number(e.target.value) })} />
        <label>Радиус прогрузки: {options.renderDistance}</label>
        <input type="range" min={4} max={10} step={1} value={options.renderDistance} onChange={(e) => onChange({ ...options, renderDistance: Number(e.target.value) })} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={props.onBack} style={{ ...btn, background: '#455a64' }}>Назад</button>
        </div>
      </div>
    </div>
  );
}

const btn = {
  padding: '10px 14px',
  fontSize: 16,
  border: '2px solid #1b3b52',
  color: '#e0f7fa',
  borderRadius: 6,
  cursor: 'pointer',
} as const;