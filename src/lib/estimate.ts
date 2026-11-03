import type { Brief, BriefState } from './brief';

export type Model = 'Opus' | 'Sonnet';
export type Effort = 'Medium' | 'High';

export interface Estimate {
  /** rough range of total tokens (input incl. cached context + output) */
  low: number;
  high: number;
  /** output tokens: code, plans and the report Claude writes */
  output: number;
  /** rough number of agent turns (tool calls) the run takes */
  turns: number;
  model: Model;
  effort: Effort;
  why: string;
}

/** Context Claude Code carries on every turn before the brief: system prompt, tools, project files. */
const BASE_CONTEXT = 18_000;
/** Average context added per turn: tool output, frame screenshots, code written. */
const GROWTH_PER_TURN = 1_600;

/**
 * A rough guide to how many tokens one run of the brief takes, plus the model
 * and effort level we recommend for it. Not a quote: real runs vary with the
 * site, how many contact-sheet fixes it needs, and how much the plan changes.
 *
 * Agent runs re-read their whole context every turn, so input grows roughly
 * with turns². Most of that input is cache reads, which cost far less than
 * fresh tokens.
 */
export function estimateRun(b: Brief, s: BriefState): Estimate {
  const steps = s.storyline.split('\n').filter((l) => l.trim()).length;
  const scenes = Math.max(steps, b.dur <= 10 ? 6 : b.dur <= 20 ? 10 : 15);
  const hasLogin = !!(s.credUser.trim() || s.credPass);

  let turns = 18; // explore the site, sample tokens, build, probe, report
  turns += scenes * 1.5; // capture and build each state
  turns += b.engine === 'hyperframes' ? 8 : 4; // tool setup and test render
  turns += 6; // contact-sheet review and fix rounds
  if (b.plan) turns += 2;
  if (b.refOk) turns += 3; // study the reference video
  if (b.hasMusic) turns += 6; // beat detection, mixing, loudness
  if (b.clicks) turns += 2;
  if (hasLogin) turns += 3;
  if (b.hasCap) turns += 3; // re-encode until it fits the cap
  if (b.fk === 'lottie') turns += 10; // hand-built keyframes are slower to get right
  turns = Math.round(turns);

  const small = b.fk === 'gif' || b.fk === 'webp';
  const model: Model = small ? 'Sonnet' : 'Opus';
  const effort: Effort = small && (b.dur > 12 || steps > 4) ? 'High' : 'Medium';

  const prompt = Math.ceil(b.text.length / 4);
  const input = turns * (BASE_CONTEXT + prompt) + (GROWTH_PER_TURN * turns * turns) / 2;
  const output = Math.round((8_000 + scenes * 1_800 + turns * 450) * (effort === 'High' ? 1.3 : 1));
  const total = input + output;

  const why = small
    ? `A short silent ${b.fmt.label} is a small job, so Sonnet handles it well. ${
        effort === 'High'
          ? 'High effort because it runs longer or has more steps than a quick loop.'
          : 'Medium effort is enough; switch to High if it runs past 12 s or has many steps.'
      }`
    : 'Capturing real UI, syncing to the beat and checking frames is where Opus pays off. Medium effort is enough because the prompt already spells out the process.';

  return { low: total * 0.65, high: total * 1.4, output, turns, model, effort, why };
}

export function fmtTokens(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M';
  if (n >= 1e3) return Math.round(n / 1e3) + 'k';
  return String(Math.round(n));
}
