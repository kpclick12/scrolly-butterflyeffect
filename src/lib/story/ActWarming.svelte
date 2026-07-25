<script>
  import Scrolly from "../components/Scrolly.svelte";
  import WarmingBars from "../components/WarmingBars.svelte";
  import StatTiles from "../components/StatTiles.svelte";

  let { data } = $props();
  let currentStep = $state(0);

  const w = $derived(data.warming);
  const byId = $derived(Object.fromEntries(w.regions.map((r) => [r.id, r])));

  // Which panel leads, and which region is picked out, per step.
  const metric = $derived(currentStep === 0 ? "total" : currentStep === 1 ? "rate" : "total");
  const highlight = $derived(
    currentStep === 0 ? "world" : currentStep === 1 ? "europe" : currentStep === 2 ? "europe" : null
  );

  const tiles = $derived([
    { num: String(w.warmestYearOnRecord), label: "Europe's warmest year on record", accent: "var(--series-amber)" },
    { num: `${w.seaRecordYearsInARow} in a row`, label: "years European seas set a new surface-temperature record, through 2025", accent: "var(--series-blue)" },
    { num: `${w.shareOfContinentAboveAverage2025}%`, label: "of the continent ran above-average temperatures in 2025", accent: "var(--series-amber)" },
    { num: `+${byId.arctic.abovePreIndustrial}°C`, label: "warming in the Arctic — the fastest-warming region on Earth", accent: "var(--series-aqua)" },
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
      <div class="visual-frame-stack" style="--stack-height: 500px; --stack-height-mobile: 420px;">
        <div class="frame" class:is-active={currentStep <= 2}>
          <WarmingBars data={w} {metric} {highlight} />
        </div>
        <div class="frame" class:is-active={currentStep === 3}>
          <StatTiles {tiles} />
        </div>
      </div>
    {/snippet}

    <section class="scrolly-step">
      <p class="kicker">The world</p>
      <h3>The planet has warmed by 1.4 °C</h3>
      <p>
        Measured against the pre-industrial world of 1850–1900, the global
        average temperature is now about
        <strong>1.4&nbsp;°C</strong> higher — most of that added since the
        1980s. That is the <span class="badge badge-blue">world</span> bar:
        the number every climate target is written against.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">The continent</p>
      <h3>Europe is warming twice as fast</h3>
      <p>
        Over the past 30 years Europe has warmed at about
        <strong>0.56&nbsp;°C per decade</strong> — more than double the
        global rate of 0.27&nbsp;°C. Only the Arctic, at 0.75&nbsp;°C per
        decade, is warming faster, and Europe reaches into it.
      </p>
      <div class="callout">
        <p class="callout-num">2×</p>
        <p class="callout-label">
          Europe's warming rate against the world's, over the past three
          decades (Copernicus / WMO)
        </p>
      </div>
    </section>

    <section class="scrolly-step">
      <p class="kicker">The gap</p>
      <h3>+2.5 °C — and pulling away</h3>
      <p>
        Sustained for three decades, that faster rate compounds into a
        different climate: Europe now sits about
        <strong>2.5&nbsp;°C</strong> above pre-industrial temperatures
        against 1.4&nbsp;°C globally. Much of the continent is land, which
        warms faster than ocean, and it reaches toward the Arctic — where
        the loss of snow and ice lets the ground absorb what it used to
        reflect.
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
