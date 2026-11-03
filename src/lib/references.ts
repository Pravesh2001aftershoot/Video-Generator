/**
 * Preferred video styles, with WhatShips examples for each.
 * Media lives in public/references/{full,preview,poster}/<id>.{mp4,jpg}.
 */

export type VideoType = 'whats-new' | 'tutorial' | 'walkthrough';

export interface TypeInfo {
  label: string;
  blurb: string;
  /** Applied to the brief when this type is picked. The user can still change them afterwards. */
  defaults: { duration: string; loop: boolean };
  /** Direction added to the prompt for this type. */
  style: string[];
}

export const VIDEO_TYPES: Record<VideoType, TypeInfo> = {
  'whats-new': {
    label: "What's New",
    blurb: 'Short launch clip: a headline, the new feature in a few quick UI moments, then an end card.',
    defaults: { duration: '20', loop: false },
    style: [
      'Open on one short kinetic headline on a plain, calm background ("Introducing …"), words arriving one at a time, with the key word in the product\'s accent colour.',
      'Reveal the new feature in 3 to 5 quick UI moments. Between moments, a one-line headline names the benefit, not the button.',
      'Keep UI large and cropped to the part that changed. Floating cards over the background, never a full browser window.',
      'End on the product name or a short call to action, held for at least one bar.',
    ],
  },
  tutorial: {
    label: 'Tutorial',
    blurb: 'Step-by-step how-to: a short caption for each step, then the real UI doing it.',
    defaults: { duration: '30', loop: false },
    style: [
      'Structure it as 3 to 5 numbered steps in the order a user would do them. Each step opens with a short imperative caption ("Talk through it.", "Sync them to GitHub") before the UI acts it out.',
      'The cursor performs every step for real: clicks, typing and menus open where they actually live. Zoom the camera into the control being used, then pull back to show the result.',
      'Keep one consistent background and frame across steps so the viewer always knows where they are.',
      'Finish by showing the finished result of the last step, then a short end card.',
    ],
  },
  walkthrough: {
    label: 'Product walkthrough',
    blurb: 'Longer tour: the full app window on a soft background, the cursor moving through the main screens.',
    defaults: { duration: '60', loop: false },
    style: [
      'Frame the full app window, with window chrome, on a soft gradient or tinted background, and keep that frame steady for the whole tour.',
      'Tour 6 to 10 main screens in the order of a typical workflow. The cursor navigates between them through the real sidebar or tabs, never cuts.',
      'Push the camera gently into the area being used on each screen, then ease back out before moving on.',
      'Bookend the tour with a headline card at the start ("So much needs you…") and a product or tagline card at the end.',
    ],
  },
};

export interface RefExample {
  id: string;
  type: VideoType;
  title: string;
  brand: string;
  duration: number;
  fps: number;
  w: number;
  h: number;
  /** What to borrow from this clip. */
  notes: string;
}

export const EXAMPLES: RefExample[] = [
  {
    id: 'whats-new-photon',
    type: 'whats-new',
    title: 'Photon 2.0 launch',
    brand: 'Photon',
    duration: 21.9,
    fps: 30,
    w: 1920,
    h: 1080,
    notes: 'White background, large type that builds word by word with a gradient accent word, quick bursts of real UI (inbox rows, chat bubbles, call pills) between headlines, URL end card.',
  },
  {
    id: 'whats-new-mercury-payroll',
    type: 'whats-new',
    title: 'Mercury Payroll',
    brand: 'Mercury',
    duration: 37.1,
    fps: 30,
    w: 1920,
    h: 1080,
    notes: 'Warm grey background, soft-focus headline transitions, cropped UI cards (tables, charts, approve dialog) that float in, cursor clicking a primary button, logo end card.',
  },
  {
    id: 'tutorial-loom-record-for-agent',
    type: 'tutorial',
    title: 'Loom: Record for Agent',
    brand: 'Loom',
    duration: 28.9,
    fps: 60,
    w: 1920,
    h: 1080,
    notes: 'Each step is a caption then the action: open the toolbar, record while talking, get the prompt, send it to an agent. Camera follows the cursor into menus; the toolbar is the shared element across steps.',
  },
  {
    id: 'tutorial-notion-skills',
    type: 'tutorial',
    title: 'Notion skills',
    brand: 'Notion',
    duration: 23.8,
    fps: 30,
    w: 1920,
    h: 1080,
    notes: 'Off-white background, bold step headlines alternating with zoomed UI: edit in Notion, sync to GitHub, use in Claude. Ends on the logo.',
  },
  {
    id: 'walkthrough-agent-workspace',
    type: 'walkthrough',
    title: 'Agent workspace tour',
    brand: 'Agent workspace app',
    duration: 88.4,
    fps: 60,
    w: 1920,
    h: 1080,
    notes: 'Full macOS app window on a purple gradient, cursor moving through Up next, Inbox, Support, Agents, Mail and Settings via the sidebar, with headline cards at the start and end.',
  },
  {
    id: 'walkthrough-capture-app',
    type: 'walkthrough',
    title: 'Capture app tour',
    brand: 'Screen capture app',
    duration: 58.3,
    fps: 60,
    w: 1920,
    h: 1080,
    notes: 'Feature-by-feature tour (screenshot, annotate, blur, record, trim, share) using a large custom cursor, blurred-to-sharp transitions and colourful wallpaper backgrounds, with a dark end card.',
  },
];

export const exampleById = (id: string) => EXAMPLES.find((e) => e.id === id) ?? null;

export const mediaUrl = (id: string, kind: 'full' | 'preview' | 'poster') =>
  `${import.meta.env.BASE_URL}references/${kind}/${id}.${kind === 'poster' ? 'jpg' : 'mp4'}`;

/** Absolute URL, so a Claude task can fetch the original once the site is deployed. */
export const absoluteMediaUrl = (id: string) =>
  typeof window !== 'undefined' ? new URL(mediaUrl(id, 'full'), window.location.href).href : mediaUrl(id, 'full');
