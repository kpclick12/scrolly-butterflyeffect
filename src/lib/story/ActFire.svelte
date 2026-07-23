<script>
  import Scrolly from "../components/Scrolly.svelte";
  import FireBars from "../components/FireBars.svelte";

  let { data } = $props();
  let currentStep = $state(0);

  const highlightYear = $derived(
    currentStep === 0 ? "2017" : currentStep === 1 ? "2022" : currentStep >= 2 ? "2025" : null
  );
</script>

<section class="act" aria-label="Act 5: Fire" style="--act-accent: var(--ink-orange);">
  <div class="act-head">
    <p class="act-kicker">Act Five</p>
    <h2>Fire</h2>
    <p class="act-dek">
      Heat and drought cure forests into fuel. Then one spark — a
      different kind of butterfly — sets off the storm.
    </p>
  </div>

  <Scrolly onStepChange={(i) => (currentStep = i)}>
    {#snippet visual()}
      <FireBars data={data.fire} {highlightYear} />
    {/snippet}

    <section class="scrolly-step">
      <p class="kicker">2017</p>
      <h3>The old benchmark</h3>
      <p>
        Portugal's catastrophic 2017 season pushed the EU's burnt area near
        a million hectares — the worst in EFFIS records, and the kind of
        year that was supposed to be exceptional.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">2022 · 2023</p>
      <h3>The exceptional becomes regular</h3>
      <p>
        2022's drought-driven season burnt over 800,000 hectares. In 2023,
        a single fire near Evros in Greece consumed about
        <strong>96,000 hectares</strong> — the largest single wildfire ever
        recorded in the EU.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">2025</p>
      <h3>The record year</h3>
      <p>
        7,783 fires burnt <strong>1.08 million hectares</strong> across the
        EU — the worst season ever mapped, nearly double the long-term
        average. During one three-week August heatwave, 22 very large fires
        in Portugal and Spain burnt 460,000 hectares — 43% of the year's
        total, in a single burst.
      </p>
      <div class="callout">
        <p class="callout-num">1.08 M ha</p>
        <p class="callout-label">
          burnt in the EU in 2025 — an area roughly the size of Cyprus,
          in one season
        </p>
      </div>
    </section>
  </Scrolly>
</section>
