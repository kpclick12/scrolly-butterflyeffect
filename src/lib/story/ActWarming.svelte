<script>
  import Scrolly from "../components/Scrolly.svelte";
  import WarmingChart from "../components/WarmingChart.svelte";
  import StatTiles from "../components/StatTiles.svelte";

  let { data } = $props();
  let currentStep = $state(0);

  const tiles = $derived([
    { num: "2024", label: "Europe's warmest year on record", accent: "var(--series-amber)" },
    { num: "4 in a row", label: "years European seas set a new surface-temperature record, through 2025", accent: "var(--series-blue)" },
    { num: "95%", label: "of the continent ran above-average temperatures in 2025", accent: "var(--series-amber)" },
    { num: `+${data.warming.fiveYearMean.arctic}°C`, label: "warming in the Arctic — the fastest-warming region on Earth", accent: "var(--series-blue)" },
  ]);
</script>

<section class="act" aria-label="Act 2: The Nudge" style="--act-accent: var(--ink-amber);">
  <div class="act-head">
    <p class="act-kicker">Act Two</p>
    <h2>The Nudge</h2>
    <p class="act-dek">
      Every continent has warmed. None has warmed like Europe — the
      fastest-warming continent on Earth.
    </p>
  </div>

  <Scrolly onStepChange={(i) => (currentStep = i)}>
    {#snippet visual()}
      <div class="visual-frame-stack" style="--stack-height: 500px; --stack-height-mobile: 400px;">
        <div class="frame" class:is-active={currentStep <= 2}>
          <WarmingChart data={data.warming} step={currentStep} />
        </div>
        <div class="frame" class:is-active={currentStep === 3}>
          <StatTiles {tiles} />
        </div>
      </div>
    {/snippet}

    <section class="scrolly-step">
      <p class="kicker">The world</p>
      <h3>The planet warmed by a degree and a half</h3>
      <p>
        Since the pre-industrial 1800s, the world as a whole has warmed by
        about 1.4&nbsp;°C — most of it since the 1980s. On the chart, that's
        the <span class="badge badge-blue">blue</span> line: a slow creep,
        decade by decade.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">The continent</p>
      <h3>Europe warmed twice as fast</h3>
      <p>
        Add Europe and the picture changes. Over the past 30 years the
        continent has warmed at about <strong>0.56&nbsp;°C per decade</strong> —
        more than double the global rate of 0.27&nbsp;°C.
      </p>
      <div class="callout">
        <p class="callout-num">2×</p>
        <p class="callout-label">
          Europe's warming rate vs the world's, over the past three decades
          (Copernicus / WMO)
        </p>
      </div>
    </section>

    <section class="scrolly-step">
      <p class="kicker">The gap</p>
      <h3>+2.5 °C — and pulling away</h3>
      <p>
        Europe now sits about <strong>2.5&nbsp;°C</strong> above
        pre-industrial temperatures, against 1.4&nbsp;°C globally. A big
        share of the continent is land (which warms faster than ocean), and
        it reaches toward the Arctic — the fastest-warming region on the
        planet.
      </p>
      <p>
        Remember Lorenz: his two futures diverged from a difference of
        0.00001. Europe's nudge is a hundred thousand times larger, and it
        never stops pushing.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">The 2020s</p>
      <h3>The records now fall yearly</h3>
      <p>
        2024 was Europe's warmest year on record. The seas around the
        continent have set a new surface-temperature record four years
        running. In 2025, 95% of the continent ran warmer than average.
      </p>
      <p>
        A warmer atmosphere holds roughly 7% more moisture per degree —
        more fuel for downpours. Warmer, drier summers cure forests into
        kindling. The nudge doesn't just raise averages; it rewrites the
        extremes. The next three acts are what that looks like.
      </p>
    </section>
  </Scrolly>
</section>
