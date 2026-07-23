# The Flap of a Wing

A scrollytelling visual essay on the butterfly effect and Europe's new
extreme weather. It opens with a scroll-driven 3D scene — a yellow
butterfly over a sunlit meadow that the reader scrolls into a full
thunderstorm — then walks through the data: Lorenz's chaos experiment
(computed live), why Europe is the fastest-warming continent, and what
that nudge has unleashed in heat, floods and fire.

Live: https://kpclick12.github.io/scrolly-butterflyeffect/

## Tech stack

- **[Svelte 5](https://svelte.dev)** (runes: `$state`, `$derived`,
  `$props`) + **[Vite](https://vite.dev)** for the build
- **[Three.js](https://threejs.org)** for the hero: procedural instanced
  grass with a wind vertex shader, canvas-textured butterfly wings,
  sprite clouds, particle rain and polyline lightning — all driven by a
  single scroll-eased `storm` value, no model files
- **[d3-scale](https://d3js.org)** for chart scales — charts themselves
  are hand-built SVG, so every mark can be styled and animated with
  ordinary CSS/Svelte transitions
- No UI framework, no CSS framework — one shared stylesheet
  (`src/app.css`) holds all design tokens (color, type, the shared
  `.scrolly-step` card and `.visual-frame-stack` sticky-panel pattern)
- Self-hosted variable-weight Playfair Display (`public/fonts/`) — no
  third-party font requests

## Project structure

```
src/
  App.svelte              hero, act order, closing, methodology/sources
  app.css                 design tokens: color, type, shared step-card styles
  data/                   one JSON file per dataset (see Data sources below)
  lib/
    components/           ButterflyStorm (3D hero), Scrolly, LorenzScene,
                           WarmingChart, HeatBars, AttributionSplit,
                           FloodEvents, FireBars, StatTiles
    story/                one Svelte component per narrative act
                           (ActChaos, ActWarming, ActHeat, ActWater, ActFire)
    data/load.js           imports and re-exports every data/*.json file
```

Each act follows the same pattern as
[scrolly-wealth](https://github.com/kpclick12/scrolly-wealth): a
`Scrolly.svelte` wrapper pairs a sticky visual panel with a column of
step cards; scrolling past a step's midpoint marks it active and drives
which chart, highlight or mode the sticky panel shows. Visuals never
remount between steps — a single chart instance persists and only its
highlight/mode changes.

## npm scripts

```
npm install       install dependencies
npm run dev       start the Vite dev server
npm run build     production build to dist/
npm run preview   serve the production build locally (respects the
                   GitHub Pages /scrolly-butterflyeffect/ base path)
```

## Data sources

Every figure on the page is an **approximation, rounded for
readability**. Full sourcing detail lives in the "Methodology & sources"
section at the bottom of the page itself; in short:

- **Warming rates and anomalies** — Copernicus Climate Change Service /
  WMO, *European State of the Climate* reports (2024, 2025)
- **Heat mortality 2022–2024** — Ballester et al. and follow-ups,
  *Nature Medicine*; **2003** — Robine et al. (older methodology,
  flagged in the chart)
- **Summer 2025 attribution** — Imperial College London / LSHTM rapid
  attribution analyses
- **June 2026 French heatwave** — Santé publique France provisional
  excess-mortality reporting; Météo-France (hottest June since 1947)
- **Floods** — Munich Re damage estimates, World Weather Attribution,
  AEMET, ESOTC 2024
- **Wildfire burnt area** — EFFIS / JRC annual mapping, EU-27
- The Lorenz attractor in Act One is computed live from the equations in
  Lorenz (1963), *Deterministic Nonperiodic Flow*

## Deploy

Deployed to GitHub Pages via `.github/workflows/deploy.yml`, which builds
with `npm run build` and publishes `dist/` on every push to `main`. The
Vite base path (`/scrolly-butterflyeffect/`) is set in `vite.config.js`
for both the production build and `vite preview`.
