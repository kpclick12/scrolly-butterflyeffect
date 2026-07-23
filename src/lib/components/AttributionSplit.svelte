<script>
  // Summer 2025, 854 European cities: how many of the estimated heat deaths
  // were added by human-caused warming. One proportional bar, two segments,
  // a 2px surface gap between them, every segment direct-labeled.
  let { data } = $props();

  const total = $derived(data.totalDeaths);
  const cc = $derived(data.fromClimateChange);
  const rest = $derived(total - cc);
  const ccPct = $derived(Math.round((cc / total) * 100));
  const fmt = (n) => n.toLocaleString("en-US");
</script>

<figure class="chart">
  <figcaption>
    Summer 2025 heat deaths across {data.cities} European cities — with and
    without the warming
  </figcaption>
  <div
    class="split"
    role="img"
    aria-label="Of an estimated {fmt(total)} heat deaths in summer 2025 across {data.cities} European cities, about {fmt(cc)} — {ccPct} percent — are attributed to human-caused climate change."
  >
    <div class="seg cc" style="flex-grow: {cc}">
      <p class="seg-num">{fmt(cc)}</p>
      <p class="seg-label">added by climate change · {ccPct}%</p>
    </div>
    <div class="seg base" style="flex-grow: {rest}">
      <p class="seg-num">{fmt(rest)}</p>
      <p class="seg-label">expected in a cooler climate</p>
    </div>
  </div>
  <p class="legend">
    ≈{fmt(total)} estimated heat deaths in total, June–August 2025. Imperial
    College London / LSHTM rapid attribution analysis.
  </p>
</figure>

<style>
  .chart {
    margin: 0;
    width: min(600px, 100%);
  }
  figcaption {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 10px;
  }
  .split {
    display: flex;
    gap: 2px;
    width: 100%;
    border-radius: 6px;
    overflow: hidden;
  }
  .seg {
    min-width: 0;
    padding: 18px 14px;
    flex-basis: 0;
  }
  .seg.cc {
    background: var(--series-red);
  }
  .seg.base {
    background: var(--series-blue);
    opacity: 0.55;
  }
  .seg-num {
    font-family: var(--serif);
    font-size: clamp(22px, 3.4vw, 32px);
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 4px;
    font-variant-numeric: tabular-nums;
  }
  .seg-label {
    font-size: 12px;
    line-height: 1.35;
    color: rgba(255, 255, 255, 0.95);
  }
  .legend {
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-muted);
    margin-top: 8px;
  }
</style>
