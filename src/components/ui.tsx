import type { ReactNode } from 'react';
import { WarningCircle } from '@phosphor-icons/react';

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

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="r">
      <div className="lbl">{label}</div>
      <div className="ctl">{children}</div>
    </div>
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
