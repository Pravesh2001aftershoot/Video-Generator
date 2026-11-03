import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Copy } from '@phosphor-icons/react';
import { BriefState, FORMATS, RefVideo, buildBrief } from './lib/brief';
import { estimateRun } from './lib/estimate';
import { useDraft } from './hooks/useDraft';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { Header } from './components/Header';
import { SourceCard } from './components/SourceCard';
import { OutputCard } from './components/OutputCard';
import { SoundCard } from './components/SoundCard';
import { BriefPanel, Check, Progress, countLabel } from './components/BriefPanel';

export default function App() {
  const { theme, setTheme } = useTheme();
  const [state, setState] = useDraft();
  const [refVideo, setRefVideo] = useState<RefVideo | null>(null);
  const { msg, show, toast } = useToast();

  const set = useCallback(<K extends keyof BriefState>(k: K, v: BriefState[K]) => setState((s) => ({ ...s, [k]: v })), [setState]);
  const update = useCallback((patch: Partial<BriefState>) => setState((s) => ({ ...s, ...patch })), [setState]);

  const brief = useMemo(() => buildBrief(state, refVideo), [state, refVideo]);
  const estimate = useMemo(() => estimateRun(brief, state), [brief, state]);

  const checks: Check[] = [
    { ok: brief.refOk, label: 'Reference video' },
    {
      ok: brief.repo || (!!brief.url && /^https?:\/\//i.test(brief.url)),
      label: brief.repo ? 'Runs from codebase' : 'Platform URL',
    },
    { ok: !!brief.r, label: state.aspect === 'ref' ? 'Reference aspect' : 'Aspect ratio' },
    { ok: !(FORMATS[state.format].audio && state.audio === 'custom' && !state.songPath.trim()), label: 'Music track' },
  ];

  const copy = async (fallback?: () => void) => {
    try {
      await navigator.clipboard.writeText(brief.text);
      toast('Prompt copied');
    } catch {
      fallback?.();
      toast('Selected — press Ctrl/⌘ C');
    }
  };

  const download = () => {
    const blob = new Blob([brief.text], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'motion-video-prompt.md';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
    toast('Saved');
  };

  // Hide the mobile dock while the panel's own Copy button is on screen.
  const actionsRef = useRef<HTMLDivElement>(null);
  const [actionsVisible, setActionsVisible] = useState(false);
  useEffect(() => {
    const el = actionsRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setActionsVisible(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className="wrap">
        <Header theme={theme} setTheme={setTheme} />
        <div className="grid">
          <form className="brief-form" autoComplete="off" noValidate onSubmit={(e) => e.preventDefault()}>
            <SourceCard state={state} set={set} update={update} refVideo={refVideo} onRefVideo={setRefVideo} />
            <OutputCard state={state} set={set} update={update} brief={brief} />
            <SoundCard state={state} set={set} />
          </form>
          <BriefPanel ref={actionsRef} brief={brief} estimate={estimate} checks={checks} onCopy={copy} onDownload={download} />
        </div>
      </div>

      <div className="dock" data-hidden={actionsVisible} aria-hidden={actionsVisible}>
        <div className="meta">
          <span className="count">
            {countLabel(checks)} · {brief.d ? `${brief.d[0]}×${brief.d[1]}` : '—'} · {brief.fps} fps · {brief.dur}s
          </span>
          <Progress checks={checks} />
        </div>
        <button type="button" className="btn primary" tabIndex={actionsVisible ? -1 : 0} onClick={() => copy()}>
          <Copy className="i" />
          Copy prompt
        </button>
      </div>

      <div className={`toast${show ? ' show' : ''}`} role="status" aria-live="polite">
        {msg}
      </div>
    </>
  );
}
