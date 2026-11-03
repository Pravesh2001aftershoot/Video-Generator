import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle, Play } from '@phosphor-icons/react';
import { EXAMPLES, RefExample, VideoType, mediaUrl } from '../lib/references';

function ExampleCard({ ex, selected, onPick }: { ex: RefExample; selected: boolean; onPick: () => void }) {
  const vid = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);
  const playing = hover || selected;

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else {
      v.pause();
      v.currentTime = 0;
    }
  }, [playing]);

  return (
    <div className={`ex${selected ? ' on' : ''}`}>
      <button
        type="button"
        className="ex-pick"
        aria-pressed={selected}
        aria-label={`Use ${ex.title} as the reference`}
        onClick={onPick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        <span className="ex-media">
          <video
            ref={vid}
            src={mediaUrl(ex.id, 'preview')}
            poster={mediaUrl(ex.id, 'poster')}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
          />
          {!playing && (
            <span className="ex-play">
              <Play weight="fill" className="i" />
            </span>
          )}
          <span className="ex-dur">{Math.round(ex.duration)}s</span>
          {selected && (
            <span className="ex-check">
              <CheckCircle weight="fill" className="i" />
            </span>
          )}
        </span>
        <span className="ex-text">
          <b>{ex.title}</b>
          <small>{ex.notes}</small>
        </span>
      </button>
      <a className="ex-open" href={mediaUrl(ex.id, 'full')} target="_blank" rel="noopener noreferrer">
        Full video <ArrowUpRight className="i" />
      </a>
    </div>
  );
}

export function ExampleGallery({
  type,
  selected,
  onPick,
}: {
  type: VideoType;
  selected: string;
  onPick: (id: string) => void;
}) {
  const list = EXAMPLES.filter((e) => e.type === type);
  return (
    <div className="exs" aria-label="Style examples">
      {list.map((ex) => (
        <ExampleCard key={ex.id} ex={ex} selected={selected === ex.id} onPick={() => onPick(selected === ex.id ? '' : ex.id)} />
      ))}
    </div>
  );
}
