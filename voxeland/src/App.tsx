import { useEffect, useRef, useState } from 'react';
import { Game } from './app/Game';
import { HUD } from './ui/HUD';
import { MainMenu } from './ui/MainMenu';
import { Options } from './ui/Options';
import type { OptionsData } from './ui/Options';
import { WorldSelect } from './ui/WorldSelect';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [screen, setScreen] = useState<'menu' | 'worlds' | 'options' | 'game' | 'pause'>('menu');
  const [world, setWorld] = useState<{ id: string; name: string; seed: string } | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [options, setOptions] = useState<OptionsData>({ sensitivity: 1.0, fov: 90, renderDistance: 6 });

  useEffect(() => {
    if (screen === 'game' && containerRef.current && world) {
      const game = new Game({ container: containerRef.current, worldId: world.id, seed: world.seed, fov: options.fov, loadRadius: options.renderDistance });
      game.input.sensitivity = options.sensitivity;
      game.start();
      gameRef.current = game;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setScreen((s) => (s === 'pause' ? 'game' : 'pause'));
      };
      window.addEventListener('keydown', onKey);
      return () => {
        window.removeEventListener('keydown', onKey);
        game.stop();
        gameRef.current = null;
      };
    }
    return;
  }, [screen, world, options]);

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      {screen === 'menu' && (
        <MainMenu onSingleplayer={() => setScreen('worlds')} onOptions={() => setScreen('options')} onQuit={() => alert('Закрыть вкладку для выхода.')} />
      )}
      {screen === 'options' && <Options options={options} onChange={setOptions} onBack={() => setScreen('menu')} />}
      {screen === 'worlds' && (
        <WorldSelect
          onLoad={(w) => {
            setWorld(w);
            setScreen('game');
          }}
          onBack={() => setScreen('menu')}
        />
      )}
      {screen === 'game' && <HUD />}
      {screen === 'pause' && (
        <div>
          <HUD />
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ background: '#0b1e2c', padding: 20, border: '2px solid #1b3b52', borderRadius: 8, color: '#e0f7fa' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => setScreen('game')}>Вернуться</button>
                <button onClick={() => setScreen('options')}>Опции</button>
                <button onClick={() => setScreen('menu')}>Главное меню</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
