<script>
  import { scaleLinear } from "d3-scale";

  // Two small multiples of the same three regions: how fast they are
  // warming, and how far they have already warmed. Every number here is a
  // published ESOTC 2025 figure — this chart deliberately plots only values
  // that exist in the source, with no interpolated points between them.
  //
  // Bars rather than a time series precisely because the sourced record is
  // three rates and three anomalies, not an annual series we hold.
  let { data, metric = "rate", highlight = null } = $props();

  const regions = $derived(data.regions);
  const colorOf = { arctic: "var(--series-aqua)", europe: "var(--series-amber)", world: "var(--series-blue)" };
  const inkOf = { arctic: "var(--ink-aqua)", europe: "var(--ink-amber)", world: "var(--ink-blue)" };

  const panels = $derived([
    {
      id: "rate",
      title: "How fast it is warming",
      unit: "°C per decade, past ~30 years",
      key: "ratePerDecade",
      max: 0.85,
      fmt: (v) => `+${v.toFixed(2)}`,
    },
    {
      id: "total",
      title: "How far it has already warmed",
      unit: "°C above 1850–1900, latest 5-year average",
      key: "abovePreIndustrial",
      max: 3.6,
      fmt: (v) => `+${v.toFixed(1)}`,
    },
  ]);

  const w = (panel, v) => `${(v / panel.max) * 100}%`;
</script>

<figure class="chart">
  {#each panels as panel}
    <div class="panel" class:is-muted={metric !== panel.id}>
      <figcaption>
        {panel.title}
        <span class="unit">{panel.unit}</span>
      </figcaption>
      <div
        class="rows"
        role="img"
        aria-label={panel.id === "rate"
          ? "Warming rate per decade over the past thirty years: Arctic 0.75 °C, Europe 0.56 °C, world 0.27 °C."
          : "Warming above pre-industrial levels, latest five-year average: Arctic 3.2 °C, Europe 2.5 °C, world 1.4 °C."}
      >
        {#each regions as r}
          <div class="row" class:is-dim={highlight && highlight !== r.id}>
            <p class="name" style="color: {inkOf[r.id]}">{r.label}</p>
            <div class="track">
              <div
                class="bar"
                style="width: {w(panel, r[panel.key])}; background: {colorOf[r.id]}"
              ></div>
              <span class="value" style="color: {inkOf[r.id]}">
                {panel.fmt(r[panel.key])}°
              </span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
  <p class="source">
    Copernicus Climate Change Service / WMO, <em>European State of the
    Climate 2025</em>. Arctic values over land only (ERA5).
  </p>
</figure>

<style>
  .chart {
    margin: 0;
    width: min(600px, 100%);
    display: flex;
    flex-direction: column;
    gap: 26px;
  }
  .panel {
    transition: opacity 0.4s ease;
  }
  /* The inactive panel stays visible — the comparison between the two is
     the point — but recedes so the active one leads. */
  .panel.is-muted {
    opacity: 0.42;
  }
  figcaption {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
  .unit {
    display: block;
    font-weight: 400;
    font-size: 12.5px;
    color: var(--text-muted);
    margin-top: 2px;
  }
  .rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .row {
    display: grid;
    grid-template-columns: 68px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    transition: opacity 0.3s ease;
  }
  .row.is-dim {
    opacity: 0.35;
  }
  .name {
    font-size: 13.5px;
    font-weight: 700;
    margin: 0;
    text-align: right;
  }
  .track {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .bar {
    height: 20px;
    border-radius: 0 4px 4px 0;
    min-width: 2px;
    transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .value {
    font-size: 13.5px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .source {
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-muted);
    margin: 0;
  }
  @media (max-width: 860px) {
    .chart {
      gap: 18px;
    }
    .row {
      grid-template-columns: 58px minmax(0, 1fr);
    }
  }
</style>
