import { EXAMPLES, RefExample, VIDEO_TYPES, VideoType, absoluteMediaUrl, exampleById } from './references';

export type Product = 'galleries' | 'core' | 'other';
export type RunIn = 'task' | 'repo';
export type FormatKey = 'mp4' | 'mov' | 'webm' | 'webp' | 'gif' | 'lottie';
export type AudioSrc = 'reference' | 'custom' | 'none';
export type FpsPick = 'auto' | '30' | '50';

export interface BriefState {
  videoType: VideoType;
  /** optional storyline or steps the video should follow, one per line */
  storyline: string;
  /** id of a built-in style example used as the reference, or '' */
  refExample: string;
  refPath: string;
  url: string;
  product: Product;
  runin: RunIn;
  format: FormatKey;
  sizeCap: string;
  aspect: string; // '16:9' | ... | 'ref' | 'custom'
  customAspect: string;
  fps: FpsPick;
  duration: string;
  loop: boolean;
  audio: AudioSrc;
  clicks: boolean;
  songPath: string;
  plan: boolean;
  credUser: string;
  credPass: string;
}

export interface RefVideo {
  name: string;
  size: number;
  w: number;
  h: number;
  dur: number;
}

export const DEFAULT_STATE: BriefState = {
  videoType: 'whats-new',
  storyline: '',
  refExample: 'whats-new-photon',
  refPath: '',
  url: '',
  product: 'galleries',
  runin: 'task',
  format: 'mp4',
  sizeCap: '',
  aspect: '16:9',
  customAspect: '',
  fps: 'auto',
  duration: VIDEO_TYPES['whats-new'].defaults.duration,
  loop: VIDEO_TYPES['whats-new'].defaults.loop,
  audio: 'reference',
  clicks: true,
  songPath: '',
  plan: true,
  credUser: '',
  credPass: '',
};

export const FORMATS: Record<FormatKey, { ext: string; label: string; audio: boolean }> = {
  mp4: { ext: 'mp4', label: 'MP4 · H.264', audio: true },
  mov: { ext: 'mov', label: 'MOV · ProRes 422 HQ', audio: true },
  webm: { ext: 'webm', label: 'WEBM · VP9', audio: true },
  webp: { ext: 'webp', label: 'Animated WEBP', audio: false },
  gif: { ext: 'gif', label: 'GIF', audio: false },
  lottie: { ext: 'json', label: 'Lottie JSON', audio: false },
};

export interface UseCase {
  label: string;
  cap: number;
  format: FormatKey;
  why: string;
}

export const USE_CASES: UseCase[] = [
  { label: "What's New", cap: 2, format: 'gif', why: 'Loads inline in the app, so keep it light.' },
  { label: 'Email', cap: 1, format: 'gif', why: 'Email clients block video, so a small GIF is safest.' },
  { label: 'Help article', cap: 3, format: 'gif', why: 'Help articles embed short silent loops.' },
  { label: 'Landing hero', cap: 5, format: 'mp4', why: 'Autoplays muted; MP4 is sharpest for the weight.' },
  { label: 'Slack / deck', cap: 10, format: 'mp4', why: 'Slack and decks preview MP4 inline.' },
  { label: 'Social', cap: 15, format: 'mp4', why: 'Feeds re-encode, so start from a clean MP4.' },
];

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

export function parseRatio(s: string): [number, number] | null {
  const m = String(s || '')
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*[:x/]\s*(\d+(?:\.\d+)?)$/i);
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : null;
}

export function resolveAspect(s: BriefState, ref: { w: number; h: number } | null): [number, number] | null {
  if (s.aspect === 'ref') return ref && ref.w ? [ref.w, ref.h] : null;
  if (s.aspect === 'custom') return parseRatio(s.customAspect);
  return parseRatio(s.aspect);
}

export function ratioLabel(r: [number, number] | null): string {
  if (!r) return '—';
  const [w, h] = r.map(Math.round);
  const g = gcd(w, h) || 1;
  return `${w / g}:${h / g}`;
}

export function dims(r: [number, number] | null): [number, number] | null {
  if (!r) return null;
  const [w, h] = r;
  if (Math.abs(w - h) < 1e-6) return [1440, 1440];
  return w > h ? [1920, even((1920 * h) / w)] : [even((1920 * w) / h), 1920];
}

export function fmtBytes(b: number): string {
  return b > 1e9 ? (b / 1e9).toFixed(2) + ' GB' : b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : (b / 1e3).toFixed(0) + ' KB';
}

export interface Brief {
  text: string;
  repo: boolean;
  cap: number;
  hasCap: boolean;
  vKbps: number | null;
  fps: number;
  sugFps: number;
  sugWhy: string;
  fpsPick: FpsPick;
  url: string;
  product: Product;
  r: [number, number] | null;
  d: [number, number] | null;
  rawDur: number;
  dur: number;
  bars: number;
  loop: boolean;
  plan: boolean;
  fmt: (typeof FORMATS)[FormatKey];
  fk: FormatKey;
  audioSrc: AudioSrc;
  clicks: boolean;
  hasMusic: boolean;
  refOk: boolean;
  out: string;
  example: RefExample | null;
}

export function buildBrief(s: BriefState, ref: RefVideo | null): Brief {
  const url = s.url.trim();
  const product = s.product;
  // An uploaded file wins over a built-in example.
  const example = ref ? null : exampleById(s.refExample);
  const typeInfo = VIDEO_TYPES[s.videoType];
  const r = resolveAspect(s, ref ?? example);
  const d = dims(r);
  const W: number | string = d ? d[0] : '[width]';
  const H: number | string = d ? d[1] : '[height]';
  const rawDur = Math.max(4, Math.min(120, parseFloat(s.duration) || 14));
  const bars = Math.max(2, Math.round(rawDur / 2));
  const dur = bars * 2;
  const beats = bars * 4;
  const loop = s.loop;
  const plan = s.plan;
  const fk = s.format;
  const fmt = FORMATS[fk];
  const audioSrc = s.audio;
  const clicks = s.clicks && fmt.audio;
  const hasMusic = fmt.audio && audioSrc !== 'none';
  const refPath = s.refPath.trim();
  const refLabel = ref
    ? `${ref.name}${refPath ? ' at ' + refPath : ''} (attached to this task)`
    : example
      ? `${example.title}, a ${VIDEO_TYPES[example.type].label} style example (${example.w}x${example.h}, ${example.duration}s, ${example.fps} fps). Download it from ${absoluteMediaUrl(example.id)}`
      : refPath || '[path to the reference video]';
  const songLabel = !fmt.audio
    ? `none (${fmt.label} carries no audio)`
    : audioSrc === 'reference'
      ? 'the audio track of the reference video'
      : audioSrc === 'custom'
        ? s.songPath.trim() || '[path to an MP3 around 120 BPM]'
        : 'none';
  const out = `motion-video.${fmt.ext}`;
  const user = s.credUser.trim();
  const pass = s.credPass;
  const cap = parseFloat(s.sizeCap);
  const hasCap = cap > 0;
  const withAudio = fmt.audio && (hasMusic || clicks);
  const vKbps = hasCap ? Math.max(150, Math.floor((cap * 8 * 1024 * 0.92) / dur - (withAudio ? 128 : 0))) : null;

  // frame-rate suggestion from the size budget
  const px = d ? d[0] * d[1] : 1920 * 1080;
  let sugFps: number;
  let sugWhy: string;
  if (fk === 'gif' || fk === 'webp') {
    const mbs = hasCap ? cap / dur : 0;
    sugFps = hasCap && mbs >= 1.5 ? 50 : 30;
    sugWhy = !hasCap
      ? `${fmt.label} grows with every frame, so 30 fps is the ceiling.`
      : sugFps === 50
        ? `${mbs.toFixed(2)} MB/s leaves room for 50 fps.`
        : `${mbs.toFixed(2)} MB/s is tight, so 30 fps keeps it in budget.`;
  } else if (fk === 'lottie') {
    sugFps = hasCap && cap / dur < 0.15 ? 30 : 50;
    sugWhy = sugFps === 50 ? 'Room for 50 keyframes a second.' : 'Tight cap, so 30 fps keeps the JSON small.';
  } else {
    const bpp = hasCap ? (vKbps! * 1000) / (px * 50) : 1;
    sugFps = bpp >= 0.04 ? 50 : 30;
    sugWhy = !hasCap
      ? 'No cap, so 50 fps for the smoothest motion.'
      : sugFps === 50
        ? `~${vKbps} kbps keeps 50 fps sharp.`
        : `~${vKbps} kbps is too thin for 50 fps, so 30 keeps frames sharp.`;
  }
  const fpsPick = s.fps;
  const fps = fpsPick === 'auto' ? sugFps : parseInt(fpsPick, 10);
  const lower = [30, 24, 20, 15].filter((x) => x < fps);

  const shape = loop ? `${dur}-second seamless loop` : `${dur}-second piece that plays once`;
  const prodLine =
    product === 'galleries'
      ? 'Aftershoot Galleries (light theme)'
      : product === 'core'
        ? 'Core Aftershoot app (dark theme)'
        : "Other (use the site's own theme)";

  const repo = s.runin === 'repo';
  const L: string[] = [];
  L.push(
    `<role>You are a motion designer and creative developer. You turn a live website into a UI motion video made entirely in code: one shape that morphs through the site's real components${hasMusic ? ' on the beat of a song' : ' on a 120 BPM beat grid'}, driven by a cursor. You check your own frames before you call anything done.</role>`,
    '',
  );
  L.push('<inputs>');
  L.push(
    repo
      ? `Source: this codebase${url ? ` (running at ${url})` : ' (start the app locally)'}`
      : `Website: ${url || '[https://your-site.com]'}`,
  );
  L.push(`Video type: ${typeInfo.label}`);
  L.push(`Product: ${prodLine}`);
  L.push(`Reference video: ${refLabel}`);
  L.push(`Song: ${songLabel}`);
  L.push(`UI click sounds: ${clicks ? 'yes' : 'no'}`);
  L.push(`Format: ${shape}, ${W}x${H}${r ? ` (${ratioLabel(r)})` : ''}, ${fps} fps, delivered as ${fmt.label}`);
  L.push(`File size cap: ${hasCap ? `under ${cap} MB for the final ${out}` : 'none'}`);
  L.push(`Show me the plan before you build: ${plan ? 'yes' : 'no, just build it'}`);
  if (user || pass)
    L.push(
      `Login: ${user || '[username]'} / ${pass ? pass : '[password]'} (use only to sign in during capture; never write these into any file, log or report)`,
    );
  L.push('</inputs>', '');

  L.push('<guardrails>');
  L.push(
    "- Font: Geist for every piece of text (Geist Mono only where the product shows tabular numbers). This overrides the site's own font family. Install it from the geist npm package or Google Fonts and wait for document.fonts.ready before READY.",
  );
  if (product === 'galleries')
    L.push(
      '- Theme: this is Aftershoot Galleries, so use the light theme tokens. If the page loads dark, switch it to light before capture, and sample colours from the light screenshots.',
    );
  else if (product === 'core')
    L.push(
      '- Theme: this is the core Aftershoot app, so use the dark theme tokens. If the page loads light, switch it to dark before capture, and sample colours from the dark screenshots.',
    );
  else
    L.push(
      "- Theme: use the site's own theme. If this turns out to be Aftershoot Galleries use the light theme tokens; if it is the core Aftershoot app use the dark theme tokens.",
    );
  L.push(
    '- Icons: Phosphor only (@phosphor-icons/core SVGs, the weight that matches the product, regular by default). Replace any other icon set with its closest Phosphor equivalent. Never hand-draw icons.',
  );
  L.push('</guardrails>', '');

  L.push('<direction>');
  L.push(
    `One shape, never cut. Every state is the same element changing its size, corner radius and colour while its content swaps with a short blur. A cursor drives each change with real clicks, hovers and drags. The camera zooms so each state fills the ${W}x${H} frame${d && d[1] > d[0] ? ' (portrait: stack content vertically and keep the cursor path inside the centre 80% of the width)' : ''}. Use the site's own components, copy and colours, set in Geist. Springs everywhere, a tiny overshoot at most. ${loop ? 'For a loop, the last frame is the first frame.' : 'It plays once: open from the first state at rest and end on a settled final state held for at least one bar.'}`,
  );
  L.push('Take pacing, transition rhythm and cursor behaviour from the reference video. Do not copy its content, copy or branding.');
  L.push('Banned: bouncy easing, particle bursts, glows, gradients on UI chrome, cuts, invented copy.');
  L.push('</direction>', '');

  L.push(`<style type="${typeInfo.label}">`);
  L.push(`This is a ${typeInfo.label} video. ${typeInfo.blurb}`);
  typeInfo.style.forEach((line) => L.push(`- ${line}`));
  if (example) L.push(`What to take from the reference (${example.title}): ${example.notes}`);
  const others = EXAMPLES.filter((e) => e.type === s.videoType && e.id !== example?.id);
  if (others.length)
    L.push(
      `Other ${typeInfo.label} examples in the same style, for rhythm only: ${others.map((e) => `${e.title} (${absoluteMediaUrl(e.id)})`).join('; ')}.`,
    );
  L.push('</style>', '');

  const story = s.storyline
    .split('\n')
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);
  if (story.length) {
    L.push('<storyline>');
    L.push(
      'Follow this storyline. Each line is a beat of the story, in order. Build the states around it: keep the order, show every step, and fill the gaps between steps with transitions through real components. Use the real UI and copy for each step; if a step needs a screen, feature or copy the site does not have, flag it instead of inventing it.',
    );
    story.forEach((line, i) => L.push(`${i + 1}. ${line}`));
    L.push('</storyline>', '');
  }

  L.push('<process>');
  let n = 1;
  if (repo)
    L.push(
      `${n++}. Codebase. You are inside the product's repository. Read the README and package scripts, then start the app locally (or its Storybook, if it has one) at 1440 px wide${url ? ` — it should come up at ${url}` : ''}. Find the theme token files and use the ${product === 'galleries' ? 'light' : 'dark'} tokens from source as the colour truth, take copy from the source or i18n strings, and reuse the real components. Do all video work in a new motion/ folder at the repo root, add it to .git/info/exclude, and never commit or change product code.`,
    );
  L.push(
    `${n++}. Setup. In ${repo ? 'motion/' : 'this folder'}, check for Node with Playwright and Chromium, Python 3 with numpy and scipy, and ffmpeg${fmt.ext === 'json' ? ', plus lottie-web for checking' : ''}. Install what is missing, plus Geist and @phosphor-icons/core.`,
  );
  L.push(
    `${n++}. Reference. Probe the reference video with ffprobe (size, fps, duration). Extract frames at 4 fps into ref-frames/ and build ref-contact-sheet.png. Write REFERENCE.md: how long each state holds, how transitions move, cursor speed and style, camera moves${audioSrc === 'reference' && fmt.audio ? ', and extract its audio to song.wav with ffmpeg -vn for the Song step' : ''}.`,
  );
  L.push(
    `${n++}. Capture. Open the ${repo ? 'locally running app' : 'site'} in Playwright at 1440 px wide${user || pass ? ' and sign in with the login above first (do not screenshot the login form)' : ''}. Scroll to the bottom in steps first, because some sections only render once they are scrolled into view. Screenshot every section and every state of every interactive part: each tab panel, toggle, accordion and slider. Copy all text verbatim into copy.json. ${repo ? 'Check sampled colours against the token files and prefer the tokens when they differ.' : 'Sample colours from screenshot pixels, not from CSS variables.'} Note which icons appear so you can map them to Phosphor. Write INVENTORY.md with each component's specs, real copy, what it does when touched, and how one shape could become it. Flag any number that looks like sample or placeholder data and leave it out.`,
  );
  const stateCount = dur <= 10 ? '5 to 7' : dur <= 20 ? '8 to 12' : '12 to 18';
  L.push(
    `${n++}. Plan. ${story.length ? `Follow the storyline above: map each of its ${story.length} steps to one or more of ${stateCount} states, in that order, using the real components that show each step, so each one grows out of the one before.` : `Pick ${stateCount} components that show what the product does, ordered so each one grows out of the one before.`} For every change, name a shared element that carries across (a progress bar becomes a volume track, a toggle knob becomes a tab indicator). Put the states on a 120 BPM grid, a beat every 0.5 seconds: ${bars} bars of 4 beats make ${dur} seconds (${beats} beats). At ${fps} fps a beat is exactly ${fps / 2} frames, so every beat lands on a whole frame. Something happens on every beat, with a 4 to 6 second hold on anything with a paragraph or a quote. Save the plan as states.md.${plan ? ' Stop here and show me states.md; wait for my go before building.' : ''}`,
  );
  if (hasMusic) {
    L.push(
      `${n++}. Song. Measure ${audioSrc === 'reference' ? 'song.wav' : 'the song'} with numpy: tempo by autocorrelation of an onset envelope, downbeats by low-band energy, and where the kick starts (10 percent of its peak). Trim it to ${dur} seconds so the kick onsets land on the video's beats, starting on a downbeat${loop ? ', with a short crossfade so the audio loops cleanly' : ', with a 300 ms fade at the end'}. If the tempo is more than 1 BPM away from 120, tell me before you go on.`,
    );
  }
  L.push(`${n++}. Engine. Build scene.html at ${W}x${H}:`);
  L.push('   - seek(t) computes every style from the time t alone. No CSS transitions, no CSS animations, no timers, no state carried between frames.');
  L.push(
    `   - Springs are closed-form step responses. A value that changes target N times is the sum of N step responses;${loop ? ` for a loop of length ${dur} s, also add each step at t + ${dur}, so the last frame matches the first in position and velocity.` : ' the final state must be fully settled before the last frame.'} Damping 0.85 to 0.9.`,
  );
  L.push('   - Every text or icon layer has its own enter, about 70 ms after the shape starts moving, and a faster exit, with about 3 px of blur and a scale between 0.965 and 1.');
  L.push('   - Liquid indicators: the leading edge rides a stiffer spring than the trailing edge.');
  L.push('   - The cursor moves on a 4th-order step, so it starts from rest and never overshoots. Mouse down 80 ms before the beat, release on the beat.');
  L.push('   - Drags: while held, the value is a pure function of the cursor position relative to where it grabbed. On release it springs back from wherever it is.');
  const numW = typeof W === 'number' ? W : 1440;
  const numH = typeof H === 'number' ? H : 1440;
  L.push(
    `   - The camera zooms and pans per state so any text meant to be read is at least ${Math.round((30 * Math.min(numW, numH)) / 1440)} px tall in the frame.`,
  );
  L.push('   - If the site has video worth showing, pre-extract its frames with ffmpeg, decode them to ImageBitmaps before READY, and draw frame floor((t - start) * fps) into a canvas, on a light background.');
  L.push('   - Icons are inline Phosphor SVGs; all text is Geist.');
  L.push('   - Expose window.seek, window.READY and window.SOUNDS (every click, key and tick with its time).');
  L.push('   - Never put will-change on anything the camera scales.');
  L.push(
    `${n++}. Check. Render one still per beat into contact-sheet.png, plus a still in the middle of every transition, and read every one: off the grid, cramped, clipped, too small, cursor off its target, wrong font, wrong theme, non-Phosphor icons. Compare its rhythm against ref-contact-sheet.png. Log every frame's cursor, shape edges and dragged elements, and look for acceleration spikes and any gap between the cursor and what it drags. ${loop ? 'The jump from the last frame to the first must be no bigger than a normal frame step.' : 'The last bar must be still.'} There must be no console errors. Fix and repeat until all of this is clean.`,
  );

  const renderBase = `Playwright with Chrome DevTools Protocol screenshots at ${W}x${H}, 4 subframes per frame centred on the frame time, piped into ffmpeg: tmix=frames=4, keep every 4th frame`;
  const k = vKbps ?? 0;
  const R: Record<FormatKey, string> = {
    mp4: hasCap
      ? `${renderBase}, H.264 at ${fps} fps, two-pass at about ${k} kbps (-b:v ${k}k -maxrate ${Math.round(k * 1.5)}k -bufsize ${k * 2}k, -preset slow), yuv420p, -movflags +faststart. The file must come in under ${cap} MB; if it misses, ${fps > 30 ? 'drop to 30 fps before lowering the bitrate, and ' : ''}lower the bitrate before the resolution.`
      : `${renderBase}, H.264 at ${fps} fps, crf 12, yuv420p, -movflags +faststart.`,
    mov: hasCap
      ? `${renderBase}. ProRes cannot meet a ${cap} MB cap, so encode H.264 inside the .mov instead: ${fps} fps, two-pass at about ${k} kbps, yuv420p. Tell me in the report that ProRes was skipped for size.`
      : `${renderBase}, ProRes 422 HQ at ${fps} fps (prores_ks -profile:v 3, yuv422p10le) in a .mov container.`,
    webm: hasCap
      ? `${renderBase}, VP9 at ${fps} fps, two-pass at about ${k} kbps (libvpx-vp9 -b:v ${k}k -row-mt 1), yuv420p. The file must come in under ${cap} MB; if it misses, ${fps > 30 ? 'drop to 30 fps before lowering the bitrate' : 'lower the bitrate'}.`
      : `${renderBase}, VP9 at ${fps} fps (libvpx-vp9 -crf 18 -b:v 0 -row-mt 1), yuv420p.`,
    webp: `${renderBase}, then encode an animated WebP at ${fps} fps with libwebp_anim (-quality 90 -compression_level 6 -loop ${loop ? 0 : 1}). Keep it under ${hasCap ? cap : 15} MB. If it is over, step down in this order until it fits: ${lower
      .slice(0, 2)
      .map((x) => x + ' fps')
      .join(', then ')}, quality 80, then scale to 80%, then quality 70. Keep text at least 24 px tall after any scaling.`,
    gif: `${renderBase}, then encode a GIF with a two-pass palette (palettegen stats_mode=diff, paletteuse dither=sierra2_4a:diff_mode=rectangle), -loop ${loop ? 0 : -1}. Keep it under ${hasCap ? cap : 15} MB. Encode at ${fps} fps. ${hasCap && cap <= 3 ? `A ${cap} MB GIF is tight: start at ${Math.min(numW, 960)} px on the long side with max_colors=128; the flat UI colours will compress well. ` : ''}If it is over, step down in this order until it fits: ${lower.map((x) => x + ' fps').join(', then ')}, then max_colors 96, then scale to 80%, then 64 colours. Keep text at least 24 px tall after any scaling, and run gifsicle -O3 --lossy=30 as a last pass.`,
    lottie: `Lottie is keyframes, not frames. Sample every animated property from seek(t) at ${fps} fps and write ${out} in the Lottie (bodymovin 5.x) schema at ${W}x${H}, fr ${fps}, ${dur * fps} frames, ${loop ? 'looping' : 'playing once'}: one shape layer per morphing element with its size, radius, colour, position, opacity and blur keyframed; Phosphor icons as shape layers from their SVG paths; text converted to shapes from Geist outlines so no font is needed at playback. Simplify keyframes where values are linear within 0.5 px${hasCap ? `, and keep the JSON under ${cap} MB (strip unused layers, round numbers to 2 decimals, then thin keyframes to ${fps > 30 ? 30 : 24} fps if needed)` : ''}. Then render it with lottie-web in Playwright and compare a still per beat against contact-sheet.png; fix any drift.`,
  };
  L.push(`${n++}. Render. ${R[fk]}`);
  if (withAudio) {
    const parts: string[] = [];
    if (clicks)
      parts.push(
        `Synthesise short, dry UI clicks with numpy (band-passed noise plus a quick sine blip), one per event in window.SOUNDS. Place each by its measured peak${hasMusic ? ', keep them well under the music' : ''}${loop ? ', and wrap them across the loop point' : ''}.`,
      );
    parts.push(
      `Master to -14 LUFS with true peak at or below -1.5 dBTP using two-pass ffmpeg loudnorm, and mux as ${fk === 'webm' ? 'Opus' : fk === 'mov' ? 'AAC (or PCM if I ask)' : 'AAC'}.`,
    );
    L.push(`${n++}. Sound. ${parts.join(' ')}`);
  }
  L.push('</process>', '');

  const reportBits = ['the states used'];
  if (hasMusic) reportBits.push("the song's measured BPM");
  reportBits.push('the probe numbers');
  if (withAudio) reportBits.push('the loudness');
  reportBits.push('the file size', 'anything you left out and why');
  L.push(
    `<output_format>${out} in ${repo ? 'motion/' : 'this folder'}, plus contact-sheet.png and a short report: ${reportBits.join(', ')}.</output_format>`,
    '',
  );
  L.push('<rules>');
  L.push('- Real copy, real colours and real data only. If something is missing, say so. Never invent it.');
  L.push('- Geist, the theme tokens above and Phosphor icons are not negotiable; flag anything that cannot follow them.');
  L.push('- Never start the full render before the contact sheet is clean.');
  L.push('- If a change only works as a crossfade, find a shared element instead.');
  if (hasCap)
    L.push(
      `- ${out} must be under ${cap} MB. Check the real size on disk before you report; never deliver a file over the cap. If it cannot fit without text dropping under 24 px, stop and tell me the smallest size that keeps it readable.`,
    );
  if (user || pass) L.push('- Keep the login out of every file, screenshot, log and the report.');
  L.push('</rules>');

  return {
    text: L.join('\n'),
    repo,
    cap,
    hasCap,
    vKbps,
    fps,
    sugFps,
    sugWhy,
    fpsPick,
    url,
    product,
    r,
    d,
    rawDur,
    dur,
    bars,
    loop,
    plan,
    fmt,
    fk,
    audioSrc,
    clicks,
    hasMusic,
    refOk: !!(ref || example || refPath),
    out,
    example,
  };
}
