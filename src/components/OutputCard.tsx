import { Brief, BriefState, FormatKey, FpsPick, USE_CASES } from '../lib/brief';
import { Card, RadioChips, Row, Warn } from './ui';

interface Props {
  state: BriefState;
  set: <K extends keyof BriefState>(k: K, v: BriefState[K]) => void;
  update: (patch: Partial<BriefState>) => void;
  brief: Brief;
}

const DURATIONS = [6, 10, 14, 20, 30];

export function OutputCard({ state, set, update, brief: b }: Props) {
  const active = USE_CASES.find((u) => b.hasCap && u.cap === b.cap && u.format === b.fk);

  const capHint = active
    ? active.why
    : b.hasCap && b.vKbps && ['mp4', 'webm', 'mov'].includes(b.fk)
      ? `≈ ${b.vKbps} kbps over ${b.dur}s`
      : b.hasCap
        ? ''
        : 'Leave empty for no limit';

  let capMsg = '';
  if (b.hasCap && b.fk === 'mov') capMsg = `ProRes can't fit ${b.cap} MB, so H.264 goes inside the .mov.`;
  else if (b.hasCap && b.fk === 'gif' && b.cap <= 2 && b.dur > 10) capMsg = `${b.dur}s is long for a ${b.cap} MB GIF. Try 6–10s.`;
  else if (b.hasCap && ['mp4', 'webm'].includes(b.fk) && (b.vKbps ?? 0) < 800) capMsg = `Only ≈ ${b.vKbps} kbps. Shorten it or raise the cap.`;

  const fpsHint =
    b.fpsPick !== 'auto' && b.fps !== b.sugFps
      ? b.fps > b.sugFps
        ? `${b.sugWhy} 50 fps may look soft.`
        : `${b.sugWhy} 30 fps is safe, slightly less smooth.`
      : b.sugWhy;

  return (
    <Card step={2} title="Output">
      <Row label="Used for">
        <div className="chips">
          {USE_CASES.map((u) => {
            const on = active === u;
            return (
              <button
                key={u.label}
                type="button"
                className="chip"
                aria-pressed={on}
                onClick={() => (on ? set('sizeCap', '') : update({ sizeCap: String(u.cap), format: u.format }))}
              >
                {u.label}{' '}
                <small>
                  {u.cap} MB · {u.format.toUpperCase()}
                </small>
              </button>
            );
          })}
        </div>
      </Row>

      <Row label="Format">
        <RadioChips<FormatKey>
          name="format"
          label="Output format"
          value={state.format}
          onChange={(v) => set('format', v)}
          options={[
            { value: 'mp4', label: 'MP4' },
            { value: 'mov', label: 'MOV' },
            { value: 'webm', label: 'WEBM' },
            { value: 'webp', label: 'WEBP' },
            { value: 'gif', label: 'GIF' },
            { value: 'lottie', label: 'Lottie' },
          ]}
        />
      </Row>

      <Row label="Size cap">
        <div className="inline">
          <div className="field sm">
            <input
              type="number"
              inputMode="decimal"
              min={0.2}
              max={500}
              step={0.1}
              placeholder="None"
              aria-label="Maximum size in MB"
              value={state.sizeCap}
              onChange={(e) => set('sizeCap', e.target.value)}
            />
            <span className="unit">MB</span>
          </div>
          {capHint && <p className="tiny">{capHint}</p>}
        </div>
        <Warn>{capMsg}</Warn>
      </Row>

      <Row
        label="Aspect"
        info={{
          gif: 'aspect-ratio.gif',
          alt: 'The same scene reframed at 16:9, 9:16, 1:1, 4:5 and 3:2',
          text: 'Sets the render size, with a 1920 px long side or 1440 x 1440 for a square. Landscape puts content side by side and portrait stacks it.',
        }}
      >
        <RadioChips<string>
          name="aspect"
          label="Aspect ratio"
          value={state.aspect}
          onChange={(v) => set('aspect', v)}
          options={[
            ...['16:9', '9:16', '1:1', '4:5', '3:2'].map((v) => ({ value: v, label: v })),
            { value: 'ref', label: 'Match reference' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
        {state.aspect === 'custom' && (
          <div className="field sm">
            <input
              type="text"
              placeholder="21:9"
              aria-label="Custom ratio W:H"
              value={state.customAspect}
              onChange={(e) => set('customAspect', e.target.value)}
            />
          </div>
        )}
      </Row>

      <Row
        label="Frame rate"
        info={{
          gif: 'frame-rate.gif',
          alt: '30 fps and 50 fps side by side at 0.4x speed',
          text: '50 fps moves more smoothly. 30 fps leaves more bits for each frame when there is a size cap.',
        }}
      >
        <RadioChips<FpsPick>
          name="fps"
          label="Frame rate"
          value={state.fps}
          onChange={(v) => set('fps', v)}
          options={[
            { value: 'auto', label: `Auto · ${b.sugFps}` },
            { value: '30', label: '30 fps', suggested: b.sugFps === 30 },
            { value: '50', label: '50 fps', suggested: b.sugFps === 50 },
          ]}
        />
        <p className="tiny">{fpsHint}</p>
      </Row>

      <Row label="Length">
        <div className="inline">
          <div className="chips">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                className="chip"
                aria-pressed={b.rawDur === d}
                onClick={() => set('duration', String(d))}
              >
                {d}s
              </button>
            ))}
          </div>
          <div className="field sm">
            <input
              type="number"
              inputMode="numeric"
              min={4}
              max={120}
              step={1}
              aria-label="Length in seconds"
              value={state.duration}
              onChange={(e) => set('duration', e.target.value)}
            />
            <span className="unit">sec</span>
          </div>
        </div>
        <p className="tiny">
          {b.rawDur !== b.dur ? `Snapped to ${b.dur}s · ${b.bars} bars at 120 BPM` : `${b.bars} bars at 120 BPM`}
        </p>
      </Row>

      <Row
        label="Playback"
        info={{
          gif: 'playback.gif',
          alt: 'A seamless loop next to a video that plays once and stops',
          text: 'A loop ends exactly where it started. Plays once ends on a settled state held for at least one bar.',
        }}
      >
        <RadioChips<'yes' | 'no'>
          name="loop"
          label="Loop"
          value={state.loop ? 'yes' : 'no'}
          onChange={(v) => set('loop', v === 'yes')}
          options={[
            { value: 'yes', label: 'Seamless loop' },
            { value: 'no', label: 'Plays once' },
          ]}
        />
      </Row>
    </Card>
  );
}
