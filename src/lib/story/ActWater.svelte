<script>
  import Scrolly from "../components/Scrolly.svelte";
  import FloodEvents from "../components/FloodEvents.svelte";
  import StatTiles from "../components/StatTiles.svelte";

  let { data } = $props();
  let currentStep = $state(0);

  const highlightId = $derived(
    currentStep === 0 ? "ahr" : currentStep === 1 ? "boris" : currentStep === 2 ? "valencia" : null
  );

  const e24 = $derived(data.floods.esotc2024);
  const tiles = $derived([
    { num: e24.peopleAffected.toLocaleString("en-US"), label: "people affected by storms and floods in Europe in 2024", accent: "var(--series-blue)" },
    { num: String(e24.livesLost), label: "lives lost to storms and floods in 2024", accent: "var(--series-red)" },
    { num: `${e24.riverNetworkShareAboveHighFlood}%`, label: "of Europe's river network exceeded the 'high' flood threshold", accent: "var(--series-blue)" },
    { num: `€${e24.stormAndFloodCostBnEUR} bn+`, label: "estimated storm and flood damage in 2024 alone", accent: "var(--series-blue)" },
  ]);
</script>

<section class="act" aria-label="Act 4: Water" style="--act-accent: var(--ink-blue);">
  <div class="act-head">
    <p class="act-kicker">Act Four</p>
    <h2>Water</h2>
    <p class="act-dek">
      Each degree of warming lets the air hold about 7% more moisture.
      When it lets go, it lets go all at once.
    </p>
  </div>

  <Scrolly onStepChange={(i) => (currentStep = i)}>
    {#snippet visual()}
      <div class="visual-frame-stack" style="--stack-height: 480px; --stack-height-mobile: 400px;">
        <div class="frame" class:is-active={currentStep <= 2}>
          <FloodEvents data={data.floods} {highlightId} />
        </div>
        <div class="frame" class:is-active={currentStep === 3}>
          <StatTiles {tiles} />
        </div>
      </div>
    {/snippet}

    <section class="scrolly-step">
      <p class="kicker">July 2021 · Germany &amp; Belgium</p>
      <h3>Two months of rain in two days</h3>
      <p>
        The Ahr valley and its neighbours took up to two months' rain in
        48 hours. <strong>243 people</strong> died — 134 in the Ahr valley
        alone — and total damage approached <strong>$54&nbsp;billion</strong>,
        among the costliest disasters in European history.
      </p>
      <p>
        Attribution analysis found climate change made rainfall like this
        1.2–9× more likely, and up to 19% more intense.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">September 2024 · Central Europe</p>
      <h3>Storm Boris parks over five countries</h3>
      <p>
        A slow-moving low soaked Austria, Czechia, Poland, Romania and their
        neighbours with record rainfall — 27 deaths, billions in damage, and
        the opening act of Europe's most widespread flood year in over a
        decade.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">October 2024 · Valencia</p>
      <h3>A year's rain in eight hours</h3>
      <p>
        Then came the DANA. The town of Chiva measured
        <strong>491&nbsp;mm of rain in eight hours</strong> — roughly a
        year's worth. Flash floods through Valencia's suburbs killed
        <strong>223 people</strong> and displaced 15,000, with damage
        running to tens of billions of euros.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">2024 in total</p>
      <h3>The most widespread flooding since 2013</h3>
      <p>
        Nearly a third of Europe's river network breached high-flood
        thresholds in 2024. Storms and floods touched over 400,000 people,
        took 335 lives and cost upwards of €18&nbsp;billion — in Europe's
        warmest year on record. The two records are not a coincidence;
        they're the same story.
      </p>
    </section>
  </Scrolly>
</section>
