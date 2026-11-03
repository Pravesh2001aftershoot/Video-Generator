/**
 * Aftershoot design-system colour tokens (L1 semantic), resolved per theme.
 * Source: design-system repo, libs/ds-theme/src/assets/css/tokens/new (generated 2026-11-03).
 *   core      = Aftershoot app, :root[data-theme='dark']
 *   galleries = Aftershoot Galleries, :root[data-theme='light']
 *
 * Only tokens defined in both themes are listed, grouped by the role they play in a video,
 * so the brief works for people who don't have the codebase.
 */

export type TokenTheme = 'core' | 'galleries';

export interface ColorToken {
  /** CSS variable name */
  v: string;
  /** what to use it for in the video */
  use: string;
  core: string;
  galleries: string;
}

export interface TokenGroup {
  title: string;
  tokens: ColorToken[];
}

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    title: 'Surfaces (backgrounds)',
    tokens: [
      { v: '--ui-surface-0', use: 'video canvas / page background', core: '#111111', galleries: '#fafafa' },
      { v: '--ui-surface-1', use: 'cards, panels, modals, buttons at rest', core: '#1c1c1c', galleries: '#ffffff' },
      { v: '--ui-surface-2', use: 'inputs, chips, tags, popovers, tab bars', core: '#242424', galleries: '#f6f6f6' },
      { v: '--ui-surface-3', use: 'raised or hovered surfaces, progress and switch tracks', core: '#303030', galleries: '#e4e4e7' },
      { v: '--ui-surface-secondary', use: 'secondary button', core: '#303030', galleries: '#e4e4e7' },
      { v: '--ui-surface-secondary--default--hover', use: 'secondary button hover', core: '#474747', galleries: '#e2e2e2' },
      { v: '--ui-surface-1--inverse', use: 'toasts, keys, active tab pill (inverse)', core: '#ffffff', galleries: '#09090b' },
      { v: '--ui-surface-2--inverse', use: 'tooltips (inverse)', core: '#f6f6f6', galleries: '#242424' },
    ],
  },
  {
    title: 'Accent and actions',
    tokens: [
      { v: '--ui-surface-accent', use: 'primary button, checked checkbox/radio/switch, selected state', core: '#2563eb', galleries: '#2563eb' },
      { v: '--ui-surface-accent--default--hover', use: 'primary hover', core: '#3b82f6', galleries: '#3b82f6' },
      { v: '--ui-surface-accent--default--active', use: 'primary pressed (use on the click frame)', core: '#1d4ed8', galleries: '#1d4ed8' },
      { v: '--ui-surface-accent--default--disable', use: 'primary disabled', core: '#1e2a45', galleries: '#bfdbfe' },
      { v: '--ui-type-white', use: 'text and icons on accent or negative fills', core: '#ffffff', galleries: '#ffffff' },
      { v: '--ui-type-accent', use: 'links, accent text and icons', core: '#3b82f6', galleries: '#3b82f6' },
      { v: '--ui-surface-negative', use: 'destructive button', core: '#dc2626', galleries: '#dc2626' },
      { v: '--ui-surface-negative--default--hover', use: 'destructive hover', core: '#ef4444', galleries: '#ef4444' },
      { v: '--ui-surface-negative--default--active', use: 'destructive pressed', core: '#b91c1c', galleries: '#b91c1c' },
    ],
  },
  {
    title: 'Text',
    tokens: [
      { v: '--ui-type-0', use: 'headlines, strongest text', core: '#ffffff', galleries: '#181818' },
      { v: '--ui-type-1', use: 'body text, labels, button text', core: '#e2e2e2', galleries: '#474747' },
      { v: '--ui-type-2', use: 'secondary text, descriptions, icons at rest', core: '#ababab', galleries: '#71717a' },
      { v: '--ui-type-3', use: 'placeholders, captions, muted meta', core: '#777777', galleries: '#919191' },
      { v: '--ui-type-accent--default--disable', use: 'disabled text', core: '#474747', galleries: '#dbeafe' },
      { v: '--ui-type-0--inverse', use: 'strong text on inverse surfaces', core: '#181818', galleries: '#ffffff' },
      { v: '--ui-type-1--inverse', use: 'text on toasts, tooltips, active tab pill', core: '#474747', galleries: '#e2e2e2' },
    ],
  },
  {
    title: 'Edges (borders, dividers, focus)',
    tokens: [
      { v: '--ui-edge-4', use: 'input, button and dropdown borders', core: '#5e5e5e', galleries: '#d4d4d8' },
      { v: '--ui-edge-5', use: 'card, popover and chip borders', core: '#474747', galleries: '#e2e2e2' },
      { v: '--ui-edge-6', use: 'subtle borders: modals, checkbox/radio outlines', core: '#303030', galleries: '#e4e4e7' },
      { v: '--ui-edge-3', use: 'stronger outlines, unchecked controls', core: '#777777', galleries: '#777777' },
      { v: '--ui-edge-accent--default--focus', use: 'focus ring', core: '#8aacf5', galleries: '#8aacf5' },
      { v: '--ui-surface-transparent--overlay3', use: 'dividers, hover wash on rows/tabs', core: 'rgba(226, 226, 226, 0.1)', galleries: 'rgba(17, 17, 17, 0.1)' },
      { v: '--ui-surface-transparent--overlay0', use: 'modal scrim / photo overlay', core: 'rgba(17, 17, 17, 0.85)', galleries: 'rgba(17, 17, 17, 0.85)' },
    ],
  },
  {
    title: 'Status',
    tokens: [
      { v: '--ui-type-accent--default--success', use: 'success text, icons, badges', core: '#16a34a', galleries: '#16a34a' },
      { v: '--ui-type-accent--default--warning', use: 'warning text, icons, badges', core: '#eab308', galleries: '#eab308' },
      { v: '--ui-type-accent--default--error', use: 'error text, icons, badges', core: '#ef4444', galleries: '#ef4444' },
      { v: '--ui-surface-transparent--input--success', use: 'success banner / field fill', core: 'rgba(21, 128, 61, 0.12)', galleries: 'rgba(21, 128, 61, 0.1)' },
      { v: '--ui-surface-transparent--input--error', use: 'error banner / field fill', core: 'rgba(220, 38, 38, 0.1)', galleries: 'rgba(220, 38, 38, 0.1)' },
      { v: '--ui-surface-transparent--warning', use: 'warning banner fill', core: 'rgba(202, 138, 4, 0.4)', galleries: 'rgba(202, 138, 4, 0.4)' },
    ],
  },
  {
    title: 'Photo culling labels (use only for these meanings)',
    tokens: [
      { v: '--ui-surface-selected', use: 'selected / kept photo', core: '#15803d', galleries: '#15803d' },
      { v: '--ui-edge-accent--selected', use: 'selected photo outline', core: '#16a34a', galleries: '#15803d' },
      { v: '--ui-surface-transparent--blurred', use: 'blurred photo tint (edge: --ui-edge-accent--blurred #ef4444)', core: 'rgba(239, 68, 68, 0.4)', galleries: 'rgba(239, 68, 68, 0.4)' },
      { v: '--ui-surface-closedeyes', use: 'closed eyes', core: '#8b5cf6', galleries: '#a855f7' },
      { v: '--ui-surface-duplicates', use: 'duplicates', core: '#ca8a04', galleries: '#ca8a04' },
      { v: '--ui-edge-accent--highlights', use: 'highlights outline', core: '#007bd5', galleries: '#2563eb' },
      { v: '--ui-surface-transparent--highlights', use: 'highlights tint', core: 'rgba(37, 99, 235, 0.4)', galleries: 'rgba(37, 99, 235, 0.4)' },
      { v: '--ui-surface-unrated', use: 'unrated', core: '#5e5e5e', galleries: '#5e5e5e' },
    ],
  },
];

/** Lines for the <theme_tokens> block of the brief. */
export function tokenLines(theme: TokenTheme): string[] {
  const label = theme === 'galleries' ? "Aftershoot Galleries, light theme (data-theme='light')" : "Aftershoot app, dark theme (data-theme='dark')";
  const L: string[] = [
    `Colour tokens for ${label}, from the Aftershoot design system. These are the only colours allowed in the video: backgrounds, shapes, text, borders, cursor highlights and anything else you draw. Pick by role, not by look. Any colour sampled from the site snaps to the closest token here; a colour that matches none is a bug to flag, not a new colour. Photos and video from the product keep their own colours.`,
  ];
  for (const g of TOKEN_GROUPS) {
    L.push(`${g.title}:`);
    for (const t of g.tokens) L.push(`- ${t.v} ${t[theme]}: ${t.use}`);
  }
  return L;
}
