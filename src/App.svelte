<script>
  import { appData as data } from "./lib/data/load.js";
  import ButterflyStorm from "./lib/components/ButterflyStorm.svelte";
  import ActChaos from "./lib/story/ActChaos.svelte";
  import ActWarming from "./lib/story/ActWarming.svelte";
  import ActHeat from "./lib/story/ActHeat.svelte";
  import ActWater from "./lib/story/ActWater.svelte";
  import ActFire from "./lib/story/ActFire.svelte";
</script>

<ButterflyStorm />

<main>
  <ActChaos />
  <ActWarming {data} />
  <ActHeat {data} />
  <ActWater {data} />
  <ActFire {data} />
</main>

<section class="closing" aria-label="Closing">
  <div class="closing-inner">
    <svg class="closing-butterfly" viewBox="0 0 64 48" aria-hidden="true">
      <g transform="translate(32 24)">
        <path d="M-2 -2 C -14 -18, -26 -14, -24 -4 C -23 3, -14 6, -3 3 Z" fill="#f4c531"/>
        <path d="M-2 2 C -12 12, -20 14, -18 5 C -17 0, -10 -1, -2 -1 Z" fill="#e0a821"/>
        <path d="M2 -2 C 14 -18, 26 -14, 24 -4 C 23 3, 14 6, 3 3 Z" fill="#f4c531"/>
        <path d="M2 2 C 12 12, 20 14, 18 5 C 17 0, 10 -1, 2 -1 Z" fill="#e0a821"/>
        <ellipse cx="0" cy="0" rx="1.8" ry="8" fill="#f2e9cf"/>
      </g>
    </svg>
    <h2>If a flap of a wing may change the weather —<br />what can our living cause?</h2>
    <p>
      That is no longer a rhetorical question. Attribution science answers
      it in measured numbers: the warming from our emissions — about
      2.5&nbsp;°C over Europe — tripled the death toll of the June 2025
      heatwave, made the 2021 floods up to nine times more likely, and
      helped cure the forests that burned a record million hectares in one
      season. Not a prophecy of doom; a documented, quantified push on
      every storm in this story.
    </p>
    <p>
      And sensitivity cuts both ways — that is also just how the system
      works. Every tenth of a degree not added blunts a future heatwave,
      lowers a future flood crest, shortens a future fire season. And
      adaptation measurably works already: without this century's heat
      plans and warning systems, recent summers would have killed nearly
      twice as many. In a system this sensitive, no flap is too small to
      count — including ours.
    </p>
  </div>
</section>

<section class="sources" aria-label="Methodology and sources">
  <div class="sources-inner">
    <h2>Methodology &amp; sources</h2>
    <p class="sources-intro">
      Every figure on this page is an <strong>approximation, rounded for
      readability</strong>. This is a work of explanation, not a primary
      research product — treat every number as "roughly," not "exactly."
    </p>
    <ul>
      <li>
        <strong>The opening scene and Act One</strong> are illustrative. The
        Lorenz attractor is computed live from the equations in Lorenz's
        1963 paper <em>Deterministic Nonperiodic Flow</em> (σ=10, ρ=28,
        β=8/3), with two runs whose starting x-values differ by 0.00001.
        The "butterfly flap causes a storm" framing is a metaphor about
        sensitivity, not a claim that any butterfly caused any storm.
      </li>
      <li>
        <strong>Warming rates and anomalies</strong> — Copernicus Climate
        Change Service (C3S) / WMO, <em>European State of the Climate</em>
        reports (2024, 2025): Europe ≈0.56&nbsp;°C per decade vs
        ≈0.27&nbsp;°C globally over the past 30 years; latest five-year
        means ≈2.5&nbsp;°C (Europe), ≈1.4&nbsp;°C (world), ≈3.2&nbsp;°C
        (Arctic) above 1850–1900. The decadal chart interpolates
        approximate decade means consistent with those published rates.
      </li>
      <li>
        <strong>Heat mortality</strong> — 2022–2024: Ballester et al. and
        follow-up studies in <em>Nature Medicine</em> (61,672 · 47,690 ·
        62,775 estimated heat-related deaths; ≈+80% without present-century
        adaptation). 2003: Robine et al.'s classic ≈70,000 estimate, an
        older methodology flagged separately in the chart.
      </li>
      <li>
        <strong>Summer 2025 attribution</strong> — Imperial College London
        / London School of Hygiene &amp; Tropical Medicine rapid analyses:
        ≈16,500 of ≈24,400 heat deaths across 854 cities attributable to
        human-caused warming; the June 23–July 2 episode ≈2,300 deaths in
        12 cities, ≈1,500 attributable.
      </li>
      <li>
        <strong>June 2026 French heatwave</strong> — Santé publique France
        provisional excess-mortality reporting (as of July 2026): 5,764
        excess deaths among people 15 and older, ≈80% rise in deaths in the
        Paris region at the peak, roughly two-thirds of victims aged 75+;
        Météo-France on June 2026 being the hottest June since records
        began in 1947. Provisional figures, subject to revision.
      </li>
      <li>
        <strong>Floods</strong> — 2021: 243 deaths (Germany/Belgium),
        ≈$54&nbsp;bn total damage (Munich Re); likelihood shift 1.2–9×
        (World Weather Attribution). 2024: Storm Boris and the Valencia
        DANA (223 deaths; Chiva 491&nbsp;mm in 8 h, AEMET); year totals
        from ESOTC 2024 (≈413,000 affected, ≥335 lives, ≈30% of the river
        network above high-flood threshold, ≥€18&nbsp;bn damage).
      </li>
      <li>
        <strong>Wildfires</strong> — EFFIS / JRC annual mapping, EU-27,
        approximate and rounded per year; 2025: 1,079,538&nbsp;ha from
        7,783 fires, the record since mapping began in 2006; the 2023
        Evros fire ≈96,000&nbsp;ha, the largest single fire in EU records.
      </li>
      <li>
        The "7% more moisture per degree" rule of thumb is the
        Clausius–Clapeyron relation, as used across the attribution
        literature.
      </li>
    </ul>
  </div>
</section>

<footer>
  <p>
    Built to explain a mechanism, not to forecast doom. If one idea here
    matters more than the rest, it's Lorenz's: in a sensitive system,
    nothing is too small to matter.
  </p>
</footer>

<style>
  main {
    max-width: 1100px;
    margin: 0 auto;
  }

  .closing {
    background: radial-gradient(120% 90% at 50% 0%, var(--hero-ink) 0%, var(--hero-ink-deep) 100%);
    color: #ffffff;
    text-align: center;
  }
  .closing-inner {
    max-width: 640px;
    margin: 0 auto;
    padding: 96px 24px 104px;
  }
  .closing-butterfly {
    width: 84px;
    height: auto;
    margin-bottom: 22px;
  }
  .closing h2 {
    font-family: var(--serif);
    font-size: clamp(30px, 5vw, 42px);
    color: #ffffff;
    margin: 0 0 20px;
  }
  .closing p {
    font-size: 17px;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.92);
    margin: 0 0 16px;
  }
  .closing p:last-child {
    margin-bottom: 0;
  }

  .sources {
    background: var(--surface-1);
    border-top: 1px solid var(--border);
  }
  .sources-inner {
    max-width: 680px;
    margin: 0 auto;
    padding: 64px 24px;
  }
  .sources h2 {
    font-family: var(--serif);
    font-size: 22px;
    margin: 0 0 16px;
    color: var(--text-primary);
  }
  .sources-intro {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0 0 20px;
  }
  .sources ul {
    margin: 0;
    padding-left: 20px;
  }
  .sources li {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--text-muted);
    margin-bottom: 10px;
  }
  .sources li:last-child {
    margin-bottom: 0;
  }
  footer {
    padding: 40px 24px 80px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
    border-top: 1px solid var(--border);
    background: var(--page-plane);
  }
  footer p {
    max-width: 480px;
    margin: 0 auto;
  }
</style>
