<script>
  import { scalePoint, scaleLinear } from "d3-scale";

  // Two-series line chart: Europe vs the world, decadal warming above the
  // pre-industrial baseline. Direct labels at the line ends carry identity
  // (the amber mark alone doesn't clear 3:1 on this surface — the labels are
  // the documented relief).
  let { data, step = 0 } = $props();

  const W = 560;
  const H = 400;
  const M = { top: 24, right: 96, bottom: 40, left: 48 };

  const decades = $derived(data.decades);
  const x = $derived(
    scalePoint(decades.map((d) => d.label), [M.left, W - M.right]).padding(0.2)
  );
  const y = $derived(scaleLinear([0, 2.6], [H - M.bottom, M.top]));

  const lineOf = (key) => (ds, xs, ys) =>
    ds.map((d, i) => `${i === 0 ? "M" : "L"}${xs(d.label)},${ys(d[key])}`).join("");
  const worldPath = $derived(lineOf("world")(decades, x, y));
  const europePath = $derived(lineOf("europe")(decades, x, y));
  const gapArea = $derived(
    decades.map((d, i) => `${i === 0 ? "M" : "L"}${x(d.label)},${y(d.europe)}`).join("") +
      decades
        .slice()
        .reverse()
        .map((d) => `L${x(d.label)},${y(d.world)}`)
        .join("") +
      "Z"
  );

  const last = $derived(decades[decades.length - 1]);
  const showEurope = $derived(step >= 1);
  const showGap = $derived(step >= 2);

  let hover = $state(null);
  function onMove(e) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestD = Infinity;
    decades.forEach((d, i) => {
      const dist = Math.abs(x(d.label) - mx);
      if (dist < bestD) {
        bestD = dist;
        best = i;
      }
    });
    hover = best;
  }
</script>

<figure class="chart">
  <figcaption>
    Warming above pre-industrial (1850–1900), °C — decade averages
  </figcaption>
  <svg
    viewBox="0 0 {W} {H}"
    role="img"
    aria-label="Line chart of decadal warming above pre-industrial levels. Europe rises from about 0.1 degrees in the 1950s to 2.4 degrees in the 2020s; the world rises from about 0.05 to 1.3 degrees. The gap widens every decade."
    onpointermove={onMove}
    onpointerleave={() => (hover = null)}
  >
    {#each [0, 1, 2] as tick}
      <line class="grid" x1={M.left} x2={W - M.right} y1={y(tick)} y2={y(tick)} />
      <text class="tick" x={M.left - 8} y={y(tick) + 4} text-anchor="end">+{tick}°</text>
    {/each}
    {#each decades as d}
      <text class="tick" x={x(d.label)} y={H - M.bottom + 20} text-anchor="middle">{d.label}</text>
    {/each}

    {#if showGap}
      <path class="gap" d={gapArea} />
      <text class="gap-label" x={x(decades[5].label) + 10} y={(y(1.85) + y(0.75)) / 2}>
        the gap
      </text>
    {/if}

    <path class="line world" d={worldPath} />
    {#if showEurope}
      <path class="line europe" d={europePath} />
    {/if}

    {#each decades as d, i}
      <circle class="dot world" cx={x(d.label)} cy={y(d.world)} r={hover === i ? 5 : 3.2}>
        <title>{d.label}: world +{d.world}°C</title>
      </circle>
      {#if showEurope}
        <circle class="dot europe" cx={x(d.label)} cy={y(d.europe)} r={hover === i ? 5 : 3.2}>
          <title>{d.label}: Europe +{d.europe}°C</title>
        </circle>
      {/if}
    {/each}

    {#if hover !== null}
      <line
        class="crosshair"
        x1={x(decades[hover].label)}
        x2={x(decades[hover].label)}
        y1={M.top}
        y2={H - M.bottom}
      />
      <g class="tip" transform="translate({Math.min(x(decades[hover].label) + 10, W - 176)}, {M.top + 6})">
        <rect width="132" height={showEurope ? 58 : 40} rx="5" />
        <text x="10" y="18" class="tip-head">{decades[hover].label}</text>
        {#if showEurope}
          <text x="10" y="36" class="tip-europe">Europe +{decades[hover].europe}°C</text>
          <text x="10" y="52" class="tip-world">World +{decades[hover].world}°C</text>
        {:else}
          <text x="10" y="34" class="tip-world">World +{decades[hover].world}°C</text>
        {/if}
      </g>
    {/if}

    <text class="end-label world" x={x(last.label) + 12} y={y(last.world) + 4}>
      World +{last.world}°
    </text>
    {#if showEurope}
      <text class="end-label europe" x={x(last.label) + 12} y={y(last.europe) + 4}>
        Europe +{last.europe}°
      </text>
    {/if}
  </svg>
  <p class="legend">
    <span class="swatch europe-bg"></span> Europe
    <span class="swatch world-bg"></span> World ·
    approximate decade means, Copernicus/ERA5 &amp; WMO
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
    stroke-width: 1;
  }
  .tick {
    font-size: 12px;
    fill: var(--text-muted);
  }
  .line {
    fill: none;
    stroke-width: 2.5;
    stroke-linejoin: round;
  }
  .line.world {
    stroke: var(--series-blue);
  }
  .line.europe {
    stroke: var(--series-amber);
  }
  .dot.world { fill: var(--series-blue); }
  .dot.europe { fill: var(--series-amber); }
  .dot {
    stroke: var(--surface-1);
    stroke-width: 1.5;
  }
  .gap {
    fill: var(--series-amber);
    opacity: 0.14;
  }
  .gap-label {
    font-size: 12.5px;
    font-style: italic;
    fill: var(--ink-amber);
  }
  .crosshair {
    stroke: var(--baseline);
    stroke-dasharray: 3 3;
  }
  .tip rect {
    fill: var(--surface-1);
    stroke: var(--border);
  }
  .tip-head {
    font-size: 12px;
    font-weight: 700;
    fill: var(--text-primary);
  }
  .tip-europe {
    font-size: 12px;
    font-weight: 600;
    fill: var(--ink-amber);
  }
  .tip-world {
    font-size: 12px;
    font-weight: 600;
    fill: var(--ink-blue);
  }
  .end-label {
    font-size: 13px;
    font-weight: 700;
  }
  .end-label.world { fill: var(--ink-blue); }
  .end-label.europe { fill: var(--ink-amber); }
  .legend {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12.5px;
    color: var(--text-muted);
    margin-top: 4px;
    flex-wrap: wrap;
  }
  .swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }
  .europe-bg { background: var(--series-amber); }
  .world-bg { background: var(--series-blue); margin-left: 8px; }
</style>
