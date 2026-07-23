<script>
  import { scaleBand, scaleLinear } from "d3-scale";

  // Estimated heat-related deaths per European summer. One hue (heat = red);
  // 2003 comes from an older methodology and wears a dashed outline plus a
  // footnote instead of pretending to be the same series.
  let { data, highlightYear = null } = $props();

  const W = 560;
  const H = 400;
  const M = { top: 34, right: 16, bottom: 44, left: 52 };

  const summers = $derived(data.summers);
  const x = $derived(
    scaleBand(summers.map((d) => d.year), [M.left, W - M.right]).padding(0.32)
  );
  const y = $derived(scaleLinear([0, 75000], [H - M.bottom, M.top]));
  const fmt = (n) => n.toLocaleString("en-US");
</script>

<figure class="chart">
  <figcaption>Estimated heat-related deaths in Europe, by summer</figcaption>
  <svg
    viewBox="0 0 {W} {H}"
    role="img"
    aria-label="Bar chart of estimated heat-related deaths per European summer: about 70,000 in 2003, 61,672 in 2022, 47,690 in 2023 and 62,775 in 2024."
  >
    {#each [0, 25000, 50000, 75000] as tick}
      <line class="grid" x1={M.left} x2={W - M.right} y1={y(tick)} y2={y(tick)} />
      <text class="tick" x={M.left - 8} y={y(tick) + 4} text-anchor="end">{tick / 1000}k</text>
    {/each}

    {#each summers as d}
      <rect
        class="bar"
        class:older={d.differentMethod}
        class:dimmed={highlightYear && highlightYear !== d.year}
        x={x(d.year)}
        y={y(d.deaths)}
        width={x.bandwidth()}
        height={H - M.bottom - y(d.deaths)}
        rx="4"
      >
        <title>Summer {d.year}: ≈{fmt(d.deaths)} heat-related deaths</title>
      </rect>
      <text
        class="value"
        class:dimmed={highlightYear && highlightYear !== d.year}
        x={x(d.year) + x.bandwidth() / 2}
        y={y(d.deaths) - 8}
        text-anchor="middle"
      >
        {d.approx ? "≈" : ""}{fmt(d.deaths)}{d.differentMethod ? "*" : ""}
      </text>
      <text class="tick" x={x(d.year) + x.bandwidth() / 2} y={H - M.bottom + 20} text-anchor="middle">
        {d.year}
      </text>
    {/each}
    <line class="axis" x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} />
  </svg>
  <p class="legend">
    *2003 figure from an older estimation method (Robine et al.); 2022–2024
    from the Nature Medicine excess-mortality series.
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
    fill: var(--series-red);
    transition: opacity 0.3s ease;
  }
  .bar.older {
    fill-opacity: 0.4;
    stroke: var(--series-red);
    stroke-width: 1.6;
    stroke-dasharray: 5 4;
  }
  .bar.dimmed {
    opacity: 0.3;
  }
  .value {
    font-size: 13px;
    font-weight: 700;
    fill: var(--ink-red);
    font-variant-numeric: tabular-nums;
    transition: opacity 0.3s ease;
  }
  .value.dimmed {
    opacity: 0.35;
  }
  .legend {
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-muted);
    margin-top: 6px;
  }
</style>
