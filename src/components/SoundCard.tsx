import { CaretDown, Lock, SpeakerHigh } from '@phosphor-icons/react';
import { AudioSrc, BriefState, FORMATS } from '../lib/brief';
import { Card, RadioChips, Row, Warn } from './ui';

interface Props {
  state: BriefState;
  set: <K extends keyof BriefState>(k: K, v: BriefState[K]) => void;
}

export function SoundCard({ state, set }: Props) {
  const fmt = FORMATS[state.format];
  const noAudio = !fmt.audio;

  return (
    <Card step={3} title="Sound & review">
      <Row label="Music">
        <RadioChips<AudioSrc>
          name="audio"
          label="Audio source"
          value={state.audio}
          onChange={(v) => set('audio', v)}
          disabled={noAudio}
          options={[
            { value: 'reference', label: 'From reference' },
            { value: 'custom', label: 'My track' },
            { value: 'none', label: 'None' },
          ]}
        >
          <label>
            <input
              type="checkbox"
              checked={state.clicks}
              disabled={noAudio}
              onChange={(e) => set('clicks', e.target.checked)}
            />
            <span>UI clicks</span>
          </label>
        </RadioChips>
        {state.audio === 'custom' && (
          <div className="field">
            <SpeakerHigh className="i" />
            <input
              type="text"
              placeholder="Path to track, ~120 BPM"
              aria-label="Path to music track"
              value={state.songPath}
              onChange={(e) => set('songPath', e.target.value)}
            />
          </div>
        )}
        <Warn>{noAudio ? `${fmt.label} has no audio, so music and clicks are skipped.` : ''}</Warn>
      </Row>

      <Row label="Before build">
        <RadioChips<'yes' | 'no'>
          name="plan"
          label="Plan review"
          value={state.plan ? 'yes' : 'no'}
          onChange={(v) => set('plan', v === 'yes')}
          options={[
            { value: 'yes', label: 'Review plan first' },
            { value: 'no', label: 'Build directly' },
          ]}
        />
      </Row>

      <details className="more">
        <summary>
          <Lock className="i" />
          Login details <span className="tiny">optional, never saved</span>
          <CaretDown className="i car" />
        </summary>
        <div className="in">
          <div className="field">
            <input
              type="text"
              autoComplete="off"
              placeholder="Email or username"
              aria-label="Email or username"
              value={state.credUser}
              onChange={(e) => set('credUser', e.target.value)}
            />
          </div>
          <div className="field">
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Password"
              aria-label="Password"
              value={state.credPass}
              onChange={(e) => set('credPass', e.target.value)}
            />
          </div>
        </div>
      </details>
    </Card>
  );
}
