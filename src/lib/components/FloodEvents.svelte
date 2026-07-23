<script>
  import { scaleLinear } from "d3-scale";

  // Deaths in the three defining flood disasters of the 2020s, as horizontal
  // bars — the names carry the story, so they get the left column and the
  // bars stay one hue (water = blue).
  let { data, highlightId = null } = $props();

  const events = $derived(data.events);
  const max = 260;
  const x = $derived(scaleLinear([0, max], [0, 100]));
</script>

<figure class="chart">
  <figcaption>Deaths in Europe's defining flood disasters, 2021–2024</figcaption>
  <div class="rows" role="img" aria-label="Bar chart of flood deaths: 2021 Western Europe floods 243 deaths, 2024 Storm Boris 27 deaths, 2024 Valencia DANA 223 deaths.">
    {#each events as e}
      <div class="row" class:dimmed={highlightId && highlightId !== e.id}>
        <div class="meta">
          <p class="name">{e.name} <span class="year">{e.year}</span></p>
          <p class="region">{e.region} · {e.costLabel}</p>
        </div>
        <div class="track">
          <div class="bar" style="width: {x(e.deaths)}%" title="{e.name}: {e.deaths} deaths"></div>
          <span class="value">{e.deaths}</span>
        </div>
      </div>
    {/each}
  </div>
  <p class="legend">Reported deaths; damage estimates approximate, rounded.</p>
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
    margin-bottom: 12px;
  }
  .rows {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .row {
    transition: opacity 0.3s ease;
    min-width: 0;
  }
  .row.dimmed {
    opacity: 0.35;
  }
  .meta {
    margin-bottom: 5px;
  }
  .name {
    font-size: 14.5px;
    font-weight: 700;
    color: var(--text-primary);
  }
  .year {
    font-weight: 600;
    color: var(--text-muted);
    margin-left: 4px;
  }
  .region {
    font-size: 12.5px;
    color: var(--text-muted);
  }
  .track {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .bar {
    height: 22px;
    border-radius: 0 4px 4px 0;
    background: var(--series-blue);
    min-width: 3px;
    transition: width 0.5s ease;
  }
  .value {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--ink-blue);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .legend {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 10px;
  }
</style>
