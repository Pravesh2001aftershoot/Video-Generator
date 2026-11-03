import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
const KEY = 'motion-brief-theme';

const systemTheme = (): Theme =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

function readSaved(): Theme | null {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

/** Explicit light/dark choice persisted per viewer; falls back to the OS preference. */
export function useTheme() {
  const [saved, setSaved] = useState<Theme | null>(readSaved);
  const [system, setSystem] = useState<Theme>(systemTheme);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const on = () => setSystem(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    root.classList.add('noanim');
    root.setAttribute('data-theme', t);
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('noanim')));
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* storage unavailable */
    }
    setSaved(t);
  }, []);

  return { theme: saved ?? system, setTheme };
}
