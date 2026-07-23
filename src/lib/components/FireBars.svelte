<script>
  import { scaleBand, scaleLinear } from "d3-scale";

  // Burnt area per year in the EU. A single-hue series (fire = orange-rust,
  // used nowhere else on the page); the 2025 record bar is direct-labeled
  // and flagged, key context years labeled too.
  let { data, highlightYear = null } = $props();

  const W = 560;
  const H = 400;
  const M = { top: 40, right: 16, bottom: 44, left: 46 };

  const years = $derived(data.years);
  const x = $derived(
    scaleBand(years.map((d) => d.year), [M.left, W - M.right]).padding(0.28)
  );
  const y = $derived(scaleLinear([0, 1150], [H - M.bottom, M.top]));
  const labeled = new Set(["2017", "2022", "2025"]);
</script>

<figure class="chart">
  <figcaption>Burnt area per year, EU-27 — thousand hectares (EFFIS)</figcaption>
  <svg
    viewBox="0 0 {W} {H}"
    role="img"
    aria-label="Bar chart of area burnt by wildfires in the EU per year, 2017 to 2025. Most years range between roughly 180 and 500 thousand hectares, with spikes near 990 thousand in 2017 and 840 thousand in 2022 — then a record 1,080 thousand hectares in 2025."
  >
    {#each [0, 250, 500, 750, 1000] as tick}
      <line class="grid" x1={M.left} x2={W - M.right} y1={y(tick)} y2={y(tick)} />
      <text class="tick" x={M.left - 8} y={y(tick) + 4} text-anchor="end">{tick}</text>
    {/each}

    {#each years as d}
      <rect
        class="bar"
        class:record={d.record}
        class:dimmed={highlightYear && highlightYear !== d.year}
        x={x(d.year)}
        y={y(d.kha)}
        width={x.bandwidth()}
        height={H - M.bottom - y(d.kha)}
        rx="4"
      >
        <title>{d.year}: ≈{d.kha},000 hectares burnt{d.record ? " — record" : ""}</title>
      </rect>
      {#if labeled.has(d.year) || highlightYear === d.year}
        <text class="value" x={x(d.year) + x.bandwidth() / 2} y={y(d.kha) - 8} text-anchor="middle">
          {d.kha}
        </text>
      {/if}
      <text class="tick" x={x(d.year) + x.bandwidth() / 2} y={H - M.bottom + 20} text-anchor="middle">
        '{d.year.slice(2)}
      </text>
    {/each}
    <line class="axis" x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} />
    <text class="record-label" x={x("2025") + x.bandwidth() / 2} y={M.top - 12} text-anchor="end">
      2025: worst season on record →
    </text>
  </svg>
  <p class="legend">
    Approximate EFFIS-mapped burnt area, rounded. Records begin in 2006;
    2025's ≈1.08 million ha is the highest ever mapped.
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
    margin-bottom: 6px;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .grid {
    stroke: var(--gridline);
  }
  .axis {
    stroke: var(--baseline);
    stroke-width: 1.5;
  }
  .tick {
    font-size: 12px;
    fill: var(--text-muted);
  }
  .bar {
    /* Fire's lone hue — not part of the categorical set, used only here. */
    fill: #eb6834;
    transition: opacity 0.3s ease;
  }
  .bar.record {
    fill: var(--series-red);
  }
  .bar.dimmed {
    opacity: 0.3;
  }
  .value {
    font-size: 13px;
    font-weight: 700;
    fill: var(--ink-red);
    font-variant-numeric: tabular-nums;
  }
  .record-label {
    font-size: 12.5px;
    font-style: italic;
    font-weight: 600;
    fill: var(--ink-red);
  }
  .legend {
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-muted);
    margin-top: 6px;
  }
  @media (prefers-color-scheme: dark) {
    .bar {
      fill: #d95926;
    }
  }
</style>
