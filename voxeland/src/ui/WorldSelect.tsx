import { useEffect, useState } from 'react';
import { deleteWorld, listWorlds, putWorld } from '../world/SaveStore';

export function WorldSelect(props: { onLoad: (w: { id: string; name: string; seed: string }) => void; onBack: () => void }) {
  const [worlds, setWorlds] = useState<Array<{ id: string; name: string; seed: string }>>([]);
  const [name, setName] = useState('Новый мир');
  const [seed, setSeed] = useState('voxeland');

  const refresh = async () => {
    const ws = await listWorlds();
    setWorlds(ws);
  };

  useEffect(() => {
    refresh();
  }, []);

  const create = async () => {
    const id = `${Date.now().toString(36)}`;
    await putWorld({ id, name, seed, createdAt: Date.now(), generatorVersion: 1 });
    await refresh();
  };

  const remove = async (id: string) => {
    await deleteWorld(id);
    await refresh();
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)' }}>
      <div style={{ background: '#0b1e2c', padding: 20, border: '2px solid #1b3b52', borderRadius: 8, color: '#e0f7fa', width: 520 }}>
        <h2>Миры</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя мира" />
          <input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="Seed" />
          <button onClick={create}>Создать</button>
        </div>
        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
          {worlds.map((w) => (
            <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderBottom: '1px solid #1b3b52' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{w.name}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Seed: {w.seed} — {w.id}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => props.onLoad(w)}>Загрузить</button>
                <button onClick={() => remove(w.id)} style={{ background: '#b71c1c', color: 'white' }}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={props.onBack}>Назад</button>
        </div>
      </div>
    </div>
  );
}