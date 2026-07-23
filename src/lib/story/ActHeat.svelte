<script>
  import Scrolly from "../components/Scrolly.svelte";
  import HeatBars from "../components/HeatBars.svelte";
  import AttributionSplit from "../components/AttributionSplit.svelte";
  import StatTiles from "../components/StatTiles.svelte";

  let { data } = $props();
  let currentStep = $state(0);

  const highlightYear = $derived(
    currentStep === 0 ? "2003" : currentStep === 1 ? "2022" : currentStep === 2 ? "2024" : null
  );

  const f26 = $derived(data.heat.france2026);
  const franceTiles = $derived([
    { num: f26.excessDeaths.toLocaleString("en-US"), label: "excess deaths in France during the June 2026 heatwave — the worst heatwave toll there since 2003", accent: "var(--series-red)" },
    { num: "1947", label: "records begin — and June 2026 was France's hottest June since then", accent: "var(--series-amber)" },
    { num: "+80%", label: "rise in deaths in the Paris region at the peak (Santé publique France)", accent: "var(--series-red)" },
    { num: "2 in 3", label: "of the victims were 75 or older", accent: "var(--series-red)" },
  ]);
</script>

<section class="act" aria-label="Act 3: Heat" style="--act-accent: var(--ink-red);">
  <div class="act-head">
    <p class="act-kicker">Act Three</p>
    <h2>Heat</h2>
    <p class="act-dek">
      The deadliest weather in Europe doesn't roar. It's silent, it arrives
      in summer, and it kills tens of thousands.
    </p>
  </div>

  <Scrolly onStepChange={(i) => (currentStep = i)}>
    {#snippet visual()}
      <div class="visual-frame-stack" style="--stack-height: 500px; --stack-height-mobile: 400px;">
        <div class="frame" class:is-active={currentStep <= 2}>
          <HeatBars data={data.heat} {highlightYear} />
        </div>
        <div class="frame" class:is-active={currentStep === 3}>
          <AttributionSplit data={data.heat.attribution2025} />
        </div>
        <div class="frame" class:is-active={currentStep === 4}>
          <StatTiles tiles={franceTiles} />
        </div>
      </div>
    {/snippet}

    <section class="scrolly-step">
      <p class="kicker">Summer 2003</p>
      <h3>The wake-up call</h3>
      <p>
        The 2003 heatwave killed an estimated <strong>70,000</strong> people
        across Europe — a disaster that finally made governments treat heat
        as a killer, with warning systems and heat-health plans.
      </p>
      <p>
        For a while, it looked like a once-in-centuries outlier.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">Summer 2022</p>
      <h3>The outlier became the pattern</h3>
      <p>
        Europe's hottest summer on record killed an estimated
        <strong>61,672</strong> people between May and September — despite
        two decades of preparation. Italy (≈18,000), Spain (≈11,300) and
        Germany (≈8,200) bore the heaviest tolls.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">2023 · 2024</p>
      <h3>It didn't stop</h3>
      <p>
        Around <strong>47,700</strong> heat deaths in 2023.
        <strong>62,775</strong> in 2024. What was once a generational
        catastrophe now happens more summers than not.
      </p>
      <div class="callout">
        <p class="callout-num">+80%</p>
        <p class="callout-label">
          how much higher the recent toll would be <em>without</em> this
          century's adaptation — proof that protection works, and that the
          heat is outrunning it
        </p>
      </div>
    </section>

    <section class="scrolly-step">
      <p class="kicker">Summer 2025</p>
      <h3>The fingerprint is measurable</h3>
      <p>
        Attribution science can now weigh the butterfly's flap directly. Of
        ≈24,400 heat deaths across 854 European cities in summer 2025,
        about <strong>16,500 — two in three</strong> — were added by
        human-caused warming.
      </p>
      <p>
        In the late-June heatwave alone, climate change made the heat
        1–4&nbsp;°C hotter and tripled the ten-day death toll across twelve
        major cities.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">June 2026 · France</p>
      <h3>The story keeps writing itself</h3>
      <p>
        Last month, France lived its hottest June since records began in
        1947 — June 24 and 25 were the country's hottest average days ever
        measured, in any month. Health authorities counted
        <strong>5,764 excess deaths</strong>, calling the toll
        "unprecedented": the worst heatwave mortality in France since 2003.
      </p>
      <p>
        In the Paris region, deaths rose 80% at the peak; two in three of
        the dead were 75 or older. Every act of this essay was written from
        past records. This one arrived while it was being read.
      </p>
    </section>
  </Scrolly>
</section>
