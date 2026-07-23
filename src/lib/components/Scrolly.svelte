<script>
  import { onMount } from "svelte";

  let { visual, children, onStepChange } = $props();
  let container;

  // Always the simplest path to an answer: which step's midpoint is closest
  // to the viewport's center right now. This avoids "dead zones" between
  // steps that a thin IntersectionObserver slice can otherwise create when
  // the gaps between cards are large.
  onMount(() => {
    const stepEls = [...container.querySelectorAll(".scrolly-step")];
    let ticking = false;

    function updateActiveStep() {
      ticking = false;
      const viewportCenter = window.innerHeight / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;
      stepEls.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elCenter - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });
      stepEls.forEach((el, i) => el.classList.toggle("is-active", i === closestIndex));
      onStepChange?.(closestIndex);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateActiveStep);
      }
    }

    updateActiveStep();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  });
</script>

<div class="scrolly" bind:this={container}>
  <div class="scrolly-sticky">
    {@render visual()}
  </div>
  <div class="scrolly-steps">
    {@render children()}
  </div>
</div>

<style>
  .scrolly {
    position: relative;
    display: grid;
    /* Bare `1fr` is really `minmax(auto, 1fr)` — the `auto` minimum lets a
       track grow to fit its content's min-content width even past the
       container's own width, which is how one unbreakable/fixed-width
       element deep in either column (long nowrap text, a fixed-width SVG,
       a chart that won't shrink) can force this whole grid — and the page
       around it — wider than the viewport. `minmax(0, 1fr)` removes that
       content-driven floor so the track always respects the available
       space; anything that still doesn't fit clips/wraps locally instead
       of blowing out the page. */
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 32px;
    align-items: start;
  }
  .scrolly-sticky {
    position: sticky;
    top: 0;
    height: 100svh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--page-plane);
    min-width: 0;
  }
  .scrolly-steps {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 60svh;
    padding-top: 30svh;
    padding-bottom: 60svh;
    /* The column sits on top of the sticky panel (especially on mobile,
       where the cards slide over it). Without this, the empty space
       between cards would eat every click — tabs and chart nodes would
       become unreachable. Let the pointer pass through the container,
       but keep it working inside the cards themselves. */
    pointer-events: none;
  }
  .scrolly-steps > :global(*) {
    pointer-events: auto;
  }
  @media (max-width: 860px) {
    .scrolly {
      grid-template-columns: minmax(0, 1fr);
    }
    /* The panel hugs its content — a tall chart gets room, a short one
       leaves more space for the text. Never taller than the screen. */
    .scrolly-sticky {
      height: auto;
      min-height: 40svh;
      max-height: 92svh;
      top: 0;
      padding: 14px 16px;
    }
    .scrolly-steps {
      padding-top: 6svh;
    }
  }
</style>
