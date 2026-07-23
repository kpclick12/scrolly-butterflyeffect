<script>
  // A row of headline numbers — for facts whose job is a single value, not a
  // shape. `tiles` is [{ num, label, accent? }].
  let { tiles } = $props();
</script>

<div class="tiles">
  {#each tiles as t}
    <div class="tile" style={t.accent ? `--tile-accent: ${t.accent}` : ""}>
      <p class="num">{t.num}</p>
      <p class="label">{t.label}</p>
    </div>
  {/each}
</div>

<style>
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    width: min(600px, 100%);
  }
  .tile {
    background: var(--surface-1);
    border-radius: 8px;
    border: 1px solid var(--border);
    border-top: 4px solid var(--tile-accent, var(--series-blue));
    padding: 16px 16px 14px;
    min-width: 0;
  }
  .num {
    font-family: var(--serif);
    font-size: clamp(24px, 3.4vw, 34px);
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.05;
    margin: 0 0 8px;
    font-variant-numeric: tabular-nums;
  }
  .label {
    font-size: 12.5px;
    line-height: 1.45;
    color: var(--text-secondary);
  }
</style>
