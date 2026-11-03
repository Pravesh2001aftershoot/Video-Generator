# Motion Video Brief

A responsive React (Vite + TypeScript) app to pick settings for a UI motion video and copy a ready-to-run prompt for Claude.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Structure

- `src/lib/brief.ts`: the brief state, constants, and `buildBrief()`, a pure function that produces the prompt and derived values (canvas size, fps suggestion, bitrate)
- `src/components/`: `SourceCard`, `OutputCard`, `SoundCard`, `BriefPanel`, `Header`, and shared UI primitives in `ui.tsx`
- `src/hooks/`: theme (light/dark, persisted), draft persistence (localStorage, credentials never saved), toast
- `src/lib/references.ts`: the three video types (What's New, Tutorial, Product walkthrough), with their default settings, the style direction added to the prompt, and the WhatShips example clips for each
- `public/references/`: example media (`full/` originals, `preview/` small silent clips for the gallery, `poster/` thumbnails)
- `src/index.css`: zinc design tokens with light/dark themes and responsive breakpoints at 960px and 560px

## Adding a style example

1. Put the original in `public/references/full/<id>.mp4`.
2. Make a preview and a poster:
   ```bash
   ffmpeg -nostdin -i full/<id>.mp4 -an -vf "scale=640:-2,fps=30" -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart preview/<id>.mp4
   ffmpeg -nostdin -ss 5 -i full/<id>.mp4 -frames:v 1 -vf "scale=640:-2" -q:v 4 poster/<id>.jpg
   ```
3. Add an entry to `EXAMPLES` in `src/lib/references.ts`.
