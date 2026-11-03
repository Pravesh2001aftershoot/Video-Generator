import { forwardRef, useRef, type ReactNode } from 'react';
import { CaretDown, CheckCircle, Circle, Copy, Cpu, DownloadSimple, Globe, Sparkle, TerminalWindow } from '@phosphor-icons/react';
import type { Brief } from '../lib/brief';
import { type Estimate, fmtTokens } from '../lib/estimate';

export interface Check {
  ok: boolean;
  label: string;
}

interface Props {
  brief: Brief;
  estimate: Estimate;
  checks: Check[];
  onCopy: (fallback: () => void) => void;
  onDownload: () => void;
}

/** Highlight unfilled [placeholders] in the prompt preview. */
function highlight(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[[^\]\n]{2,60}\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<mark key={m.index}>{m[0]}</mark>);
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

export function Progress({ checks }: { checks: Check[] }) {
  const done = checks.filter((c) => c.ok).length;
  return (
    <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={checks.length} aria-valuenow={done}>
      <i style={{ width: `${(done / checks.length) * 100}%` }} />
    </div>
  );
}

export const countLabel = (checks: Check[]) => {
  const done = checks.filter((c) => c.ok).length;
  return done === checks.length ? 'Ready' : `${done} of ${checks.length}`;
};

export const BriefPanel = forwardRef<HTMLDivElement, Props>(function BriefPanel({ brief: b, estimate: e, checks, onCopy, onDownload }, actionsRef) {
  const pv = useRef<HTMLDetailsElement>(null);
  const pre = useRef<HTMLPreElement>(null);

  const selectPrompt = () => {
    if (pv.current) pv.current.open = true;
    const sel = window.getSelection();
    if (!sel || !pre.current) return;
    const range = document.createRange();
    range.selectNodeContents(pre.current);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const spec: [string, string][] = [
    ['Canvas', b.d ? `${b.d[0]}×${b.d[1]}` : '—'],
    ['Frame rate', `${b.fps} fps`],
    ['Length', `${b.dur}s · ${b.loop ? 'loop' : 'once'}`],
    ['Size cap', b.hasCap ? `< ${b.cap} MB` : 'none'],
    ['File', b.out],
    ['Plan', b.plan ? 'review first' : 'build directly'],
  ];
  const themeTok = b.product === 'galleries' ? 'Light tokens' : b.product === 'core' ? 'Dark tokens' : 'Site theme';

  return (
    <aside className="out" aria-label="Your brief">
      <div className="card">
        <div className="sum">
          <div className="sumhead">
            <h2>Your brief</h2>
            <span className="count">{countLabel(checks)}</span>
          </div>
          <Progress checks={checks} />
          <ul className="todo">
            {checks.map((c) => (
              <li key={c.label} className={c.ok ? 'ok' : ''}>
                {c.ok ? <CheckCircle className="i" /> : <Circle className="i" />}
                {c.label}
              </li>
            ))}
          </ul>
          <dl className="spec">
            {spec.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <section className="est" aria-label="Estimated usage">
            <div className="est-head">
              <h3>Estimated usage</h3>
              <span className="count">rough guide</span>
            </div>
            <p className="est-num">
              ≈ {fmtTokens(e.low)}–{fmtTokens(e.high)} <span>tokens</span>
            </p>
            <p className="tiny">
              ~{fmtTokens(e.output)} output · ~{e.turns} turns · most input is cached context re-read each turn
            </p>
            <div className="est-model">
              <Cpu className="i" />
              <span>
                Recommended: <b>{e.model}</b> · <b>{e.effort} effort</b>
              </span>
            </div>
            <p className="tiny">{e.why}</p>
          </section>
          <div className="rails">
            {['Geist', themeTok, 'Phosphor icons'].map((t) => (
              <span key={t} className="rail">
                {t}
              </span>
            ))}
          </div>
          <div className="actions" ref={actionsRef}>
            <button type="button" className="btn primary" onClick={() => onCopy(selectPrompt)}>
              <Copy className="i" />
              Copy prompt
            </button>
            <button type="button" className="btn" aria-label="Save as Markdown" title="Save as Markdown" onClick={onDownload}>
              <DownloadSimple className="i" />
            </button>
          </div>
        </div>
        <details className="pv" ref={pv}>
          <summary>
            <Sparkle className="i" />
            Preview prompt
            <CaretDown className="i car" />
          </summary>
          <pre className="prompt" tabIndex={0} ref={pre}>
            {highlight(b.text)}
          </pre>
        </details>
      </div>
      <p className="foot">
        {b.repo ? (
          <>
            <TerminalWindow className="i" /> Paste into Claude Code inside the app repo.
          </>
        ) : (
          <>
            <Globe className="i" /> Paste into a new Claude task with a folder connected.
          </>
        )}
      </p>
    </aside>
  );
});
