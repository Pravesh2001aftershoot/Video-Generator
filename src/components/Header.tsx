import { FilmStrip, Moon, Sun } from '@phosphor-icons/react';
import type { Theme } from '../hooks/useTheme';

export function Header({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <header className="top">
      <div className="brand">
        <div className="logo">
          <FilmStrip className="i" />
        </div>
        <div>
          <h1>Motion Video Brief</h1>
          <p className="sub">Pick your settings, copy the prompt, generate in Claude.</p>
        </div>
      </div>
      <div className="theme" role="group" aria-label="Theme">
        <button type="button" aria-label="Light theme" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
          <Sun className="i" />
        </button>
        <button type="button" aria-label="Dark theme" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
          <Moon className="i" />
        </button>
      </div>
    </header>
  );
}
