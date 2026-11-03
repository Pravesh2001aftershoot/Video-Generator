import { useRef, useState } from 'react';
import { ArrowUpRight, Globe, Link, TerminalWindow, VideoCamera } from '@phosphor-icons/react';
import { BriefState, Product, RefVideo, RunIn, fmtBytes } from '../lib/brief';
import { Card, RadioChips, Row } from './ui';
import { ExampleGallery } from './ExampleGallery';
import { EXAMPLES, VIDEO_TYPES, VideoType } from '../lib/references';

interface Props {
  state: BriefState;
  set: <K extends keyof BriefState>(k: K, v: BriefState[K]) => void;
  update: (patch: Partial<BriefState>) => void;
  refVideo: RefVideo | null;
  onRefVideo: (r: RefVideo | null) => void;
}

function readVideo(f: File, done: (r: RefVideo) => void) {
  const base: RefVideo = { name: f.name, size: f.size, w: 0, h: 0, dur: 0 };
  done(base);
  const url = URL.createObjectURL(f);
  const v = document.createElement('video');
  v.preload = 'metadata';
  v.muted = true;
  v.onloadedmetadata = () => {
    done({ ...base, w: v.videoWidth, h: v.videoHeight, dur: v.duration });
    URL.revokeObjectURL(url);
  };
  v.onerror = () => URL.revokeObjectURL(url);
  v.src = url;
}

export function SourceCard({ state, set, update, refVideo, onRefVideo }: Props) {
  const fileIn = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const repo = state.runin === 'repo';

  const take = (f?: File | null) => {
    if (!f) return;
    set('refExample', '');
    readVideo(f, onRefVideo);
  };

  const pickType = (t: VideoType) => {
    const own = !!refVideo || !!state.refPath.trim();
    update({
      videoType: t,
      ...VIDEO_TYPES[t].defaults,
      refExample: own ? '' : (EXAMPLES.find((e) => e.type === t)?.id ?? ''),
    });
  };

  const pickExample = (id: string) => {
    if (id) onRefVideo(null);
    set('refExample', id);
  };
  const browse = () => fileIn.current?.click();

  const meta = refVideo
    ? [fmtBytes(refVideo.size), refVideo.w ? `${refVideo.w}×${refVideo.h}` : '', refVideo.dur && isFinite(refVideo.dur) ? refVideo.dur.toFixed(1) + 's' : '']
        .filter(Boolean)
        .join(' · ')
    : '';

  const setProduct = (p: Product) => update({ product: p, runin: p === 'core' ? 'repo' : 'task' });

  const detectProduct = () => {
    const u = state.url.toLowerCase();
    if (!/aftershoot/.test(u)) return;
    setProduct(/galler/.test(u) ? 'galleries' : 'core');
  };

  return (
    <Card step={1} title="Source">
      <Row label="Video type">
        <RadioChips<VideoType>
          name="videoType"
          label="Video type"
          value={state.videoType}
          onChange={pickType}
          options={(Object.keys(VIDEO_TYPES) as VideoType[]).map((t) => ({ value: t, label: VIDEO_TYPES[t].label }))}
        />
        <p className="tiny">{VIDEO_TYPES[state.videoType].blurb}</p>
      </Row>

      <Row label="Reference">
        <p className="tiny">Preferred {VIDEO_TYPES[state.videoType].label} style. Pick one, or use your own video below.</p>
        <ExampleGallery type={state.videoType} selected={refVideo ? '' : state.refExample} onPick={pickExample} />
        {refVideo ? (
          <div className="file">
            <VideoCamera className="i ic" />
            <div className="grow">
              <span className="nm">{refVideo.name}</span>
              <span className="meta">{meta}</span>
            </div>
            <button type="button" className="btn sm" onClick={browse}>
              Replace
            </button>
          </div>
        ) : (
          <div
            className={`drop${over ? ' over' : ''}`}
            tabIndex={0}
            role="button"
            aria-label="Choose or drop a reference video"
            onClick={browse}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                browse();
              }
            }}
            onDragEnter={(e) => (e.preventDefault(), setOver(true))}
            onDragOver={(e) => (e.preventDefault(), setOver(true))}
            onDragLeave={(e) => (e.preventDefault(), setOver(false))}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              take(e.dataTransfer.files?.[0]);
            }}
          >
            <div className="ic">
              <VideoCamera className="i" />
            </div>
            <div>
              <b>Drop a reference video</b>
              <span>or click to browse · MP4, MOV, WEBM</span>
            </div>
          </div>
        )}
        <input
          ref={fileIn}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => {
            take(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <div className="field">
          <Link className="i" />
          <input
            type="text"
            placeholder="Or paste a path or link"
            aria-label="Reference path or link"
            value={state.refPath}
            onChange={(e) => update({ refPath: e.target.value, ...(e.target.value.trim() ? { refExample: '' } : {}) })}
          />
        </div>
        <div className="find" aria-label="Find a reference">
          <a href="https://whatships.com/?page=2" target="_blank" rel="noopener noreferrer">
            <span className="fav">
              <VideoCamera className="i" />
            </span>
            <span>
              <b>WhatShips</b> <small>· product launch videos</small>
            </span>
            <ArrowUpRight className="i go" />
          </a>
        </div>
      </Row>

      <Row label="Platform">
        <div className="field">
          <Globe className="i" />
          <input
            type="url"
            inputMode="url"
            aria-label="Platform URL"
            placeholder={repo ? 'Local URL, e.g. http://localhost:5173 (optional)' : 'https://aftershoot.com/galleries'}
            value={state.url}
            onChange={(e) => set('url', e.target.value)}
            onBlur={detectProduct}
          />
        </div>
        <RadioChips<Product>
          name="product"
          label="Product"
          value={state.product}
          onChange={setProduct}
          options={[
            { value: 'galleries', label: 'Galleries · light' },
            { value: 'core', label: 'Core app · dark' },
            { value: 'other', label: 'Other site' },
          ]}
        />
      </Row>

      <Row label="Run in">
        <RadioChips<RunIn>
          name="runin"
          label="Where to run the prompt"
          value={state.runin}
          onChange={(v) => set('runin', v)}
          options={[
            { value: 'task', label: 'Claude task · live URL' },
            { value: 'repo', label: 'Codebase · Claude Code' },
          ]}
        />
        <div className="cue">
          {repo ? (
            <>
              <span className="ci">
                <TerminalWindow className="i" />
              </span>
              <div>
                <b>Run it in the codebase</b>
                <span>
                  Open Claude Code in the {state.product === 'core' ? 'Aftershoot app' : 'product'} repo and paste the prompt. It
                  starts the app locally and reads tokens, copy and components from source. Output lands in <code>motion/</code>.
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="ci">
                <Globe className="i" />
              </span>
              <div>
                <b>Run it in a Claude task</b>
                <span>
                  Paste the prompt into a new task with a folder connected. It captures the live URL
                  {state.product === 'galleries' ? ', so anyone can run it without repo access' : ''}.
                </span>
              </div>
            </>
          )}
        </div>
      </Row>
    </Card>
  );
}
