<script>
  // The Lorenz attractor, computed live: two trajectories whose starting
  // points differ by one part in 100,000. For the first few thousand steps
  // they are pixel-identical; then they fly apart into different weather.
  // This is the actual system from Lorenz's 1963 paper, not an artist's
  // impression.
  let { step = 0 } = $props();

  const SIGMA = 10;
  const RHO = 28;
  const BETA = 8 / 3;
  const DT = 0.005;
  const N = 6000;

  function simulate(x0) {
    let x = x0, y = 1, z = 1;
    const pts = new Array(N);
    for (let i = 0; i < N; i++) {
      // Two half-steps of plain Euler keep it stable enough at this dt.
      for (let k = 0; k < 2; k++) {
        const dx = SIGMA * (y - x);
        const dy = x * (RHO - z) - y;
        const dz = x * y - BETA * z;
        x += dx * DT * 0.5;
        y += dy * DT * 0.5;
        z += dz * DT * 0.5;
      }
      pts[i] = [x, z];
    }
    return pts;
  }

  const trajA = simulate(1);
  const trajB = simulate(1.00001);

  // Project (x, z) into the viewBox: x in [-22, 22] → [30, 490], z in
  // [0, 52] → [420, 20] (SVG y grows downward).
  const px = (v) => 260 + v * 10.5;
  const py = (v) => 428 - v * 7.8;
  function toPath(pts, n) {
    let d = `M${px(pts[0][0]).toFixed(1)},${py(pts[0][1]).toFixed(1)}`;
    for (let i = 1; i < n; i += 2) {
      d += `L${px(pts[i][0]).toFixed(1)},${py(pts[i][1]).toFixed(1)}`;
    }
    return d;
  }

  // How much of each trajectory each narrative step reveals.
  const reveal = $derived(step === 0 ? { a: 3200, b: 0 } : step === 1 ? { a: 2400, b: 2400 } : { a: N, b: N });
  const pathA = $derived(toPath(trajA, reveal.a));
  const pathB = $derived(reveal.b > 0 ? toPath(trajB, reveal.b) : "");
  const endA = $derived(trajA[reveal.a - 1]);
  const endB = $derived(reveal.b > 0 ? trajB[reveal.b - 1] : null);
</script>

<div class="lorenz-wrap">
  <svg viewBox="0 0 520 460" role="img" aria-label="The Lorenz attractor: two butterfly-wing-shaped loops traced by two simulated weather trajectories. Their starting points differ by 0.00001, yet after a while one trajectory circles the left wing while the other circles the right.">
    <path class="traj traj-a" d={pathA} />
    {#if pathB}
      <path class="traj traj-b" d={pathB} />
    {/if}
    {#if endA}
      <circle class="end end-a" cx={px(endA[0])} cy={py(endA[1])} r="5" />
    {/if}
    {#if endB}
      <circle class="end end-b" cx={px(endB[0])} cy={py(endB[1])} r="5" />
    {/if}
    {#if step >= 1}
      <text class="lbl lbl-a" x="30" y="30">weather A</text>
      <text class="lbl lbl-b" x="30" y="50">weather B — starts 0.00001 away</text>
    {/if}
  </svg>
  <p class="caption">
    {#if step === 0}
      A real simulation of Lorenz's 1963 weather equations — the system that
      founded chaos theory. Its trace draws a butterfly.
    {:else if step === 1}
      Two runs of the same equations. One starting value differs by
      0.00001. The two futures are still identical — for now.
    {:else}
      The same two runs, a little later: one weather is circling the left
      wing while the other circles the right. That is the butterfly effect.
    {/if}
  </p>
</div>

<style>
  .lorenz-wrap {
    width: min(560px, 100%);
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .traj {
    fill: none;
    stroke-width: 1.1;
    stroke-linejoin: round;
    opacity: 0.9;
  }
  .traj-a {
    stroke: var(--series-blue);
  }
  .traj-b {
    stroke: var(--series-amber);
    /* Dashed so trace B stays visible while it is still riding exactly on
       top of trace A — the "identical futures" beat depends on seeing both. */
    stroke-dasharray: 6 4;
  }
  .end {
    stroke: var(--surface-1);
    stroke-width: 2;
  }
  .end-a { fill: var(--series-blue); }
  .end-b { fill: var(--series-amber); }
  .lbl {
    font-size: 13px;
    font-weight: 700;
  }
  .lbl-a { fill: var(--ink-blue); }
  .lbl-b { fill: var(--ink-amber); }
  .caption {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-muted);
    margin-top: 6px;
    text-align: center;
  }
</style>
