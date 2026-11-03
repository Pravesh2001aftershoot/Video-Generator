import { useEffect, useState } from 'react';
import { BriefState, DEFAULT_STATE } from '../lib/brief';

const KEY = 'motion-brief-draft-v3';
/** Never persisted: credentials stay in memory only. */
const SECRET: (keyof BriefState)[] = ['credUser', 'credPass'];

function load(): BriefState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const data = JSON.parse(raw) as Partial<BriefState>;
    const merged = { ...DEFAULT_STATE };
    (Object.keys(DEFAULT_STATE) as (keyof BriefState)[]).forEach((k) => {
      if (SECRET.includes(k)) return;
      if (k in data && typeof data[k] === typeof DEFAULT_STATE[k]) {
        (merged as Record<string, unknown>)[k] = data[k];
      }
    });
    return merged;
  } catch {
    return DEFAULT_STATE;
  }
}

export function useDraft() {
  const [state, setState] = useState<BriefState>(load);

  useEffect(() => {
    try {
      const copy: Partial<BriefState> = { ...state };
      SECRET.forEach((k) => delete copy[k]);
      localStorage.setItem(KEY, JSON.stringify(copy));
    } catch {
      /* storage unavailable */
    }
  }, [state]);

  return [state, setState] as const;
}
