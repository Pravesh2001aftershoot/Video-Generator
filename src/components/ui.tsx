import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Info, WarningCircle } from '@phosphor-icons/react';

export function Card({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <section className="card" aria-labelledby={`step-${step}`}>
      <h2 id={`step-${step}`}>
        <span className="step">{step}</span>
        {title}
      </h2>
      <div className="body">{children}</div>
    </section>
  );
}

export interface RowInfo {
  /** GIF in public/settings/ */
  gif: string;
  alt: string;
  text: string;
}

export function Row({ label, info, children }: { label: string; info?: RowInfo; children: ReactNode }) {
  return (
    <div className="r">
      <div className="lbl">
        {label}
        {info && <InfoTip label={label} info={info} />}
      </div>
      <div className="ctl">{children}</div>
    </div>
  );
}

const GIF_HEIGHT: Record<string, number> = { 'aspect-ratio.gif': 520, 'frame-rate.gif': 380, 'playback.gif': 400, 'product-theme.gif': 340 };

/** Info icon that shows a GIF preview on hover or focus, and toggles on tap. */
export function InfoTip({ label, info }: { label: string; info: RowInfo }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const id = useId();
  const show = open || pinned;

  useEffect(() => {
    if (!pinned) return;
    const away = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setPinned(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [pinned]);

  return (
    <span
      ref={wrap}
      className="tip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setOpen(false);
          setPinned(false);
        }
      }}
    >
      <button
        type="button"
        className="tip-btn"
        aria-label={`How ${label.toLowerCase()} changes the video`}
        aria-expanded={show}
        aria-controls={id}
        onClick={() => setPinned((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Info className="i" weight={show ? 'fill' : 'regular'} />
      </button>
      {show && (
        <span className="tip-pop" id={id} role="tooltip">
          <img src={`${import.meta.env.BASE_URL}settings/${info.gif}`} alt={info.alt} width={880} height={GIF_HEIGHT[info.gif] ?? 440} />
          <span className="tip-text">{info.text}</span>
          <span className="tip-note">Illustration rendered in code, not a generated video.</span>
        </span>
      )}
    </span>
  );
}

export interface ChipOption<T extends string> {
  value: T;
  label: ReactNode;
  suggested?: boolean;
}

export function RadioChips<T extends string>({
  name,
  label,
  value,
  options,
  onChange,
  disabled,
  children,
}: {
  name: string;
  label: string;
  value: T;
  options: ChipOption<T>[];
  onChange: (v: T) => void;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="chips" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <label key={o.value}>
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            disabled={disabled}
            onChange={() => onChange(o.value)}
          />
          <span data-sug={o.suggested ? '1' : undefined}>{o.label}</span>
        </label>
      ))}
      {children}
    </div>
  );
}

export function Warn({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div className="warn" role="note">
      <WarningCircle className="i" />
      <span>{children}</span>
    </div>
  );
}
