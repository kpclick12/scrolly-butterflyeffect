<script>
  import Scrolly from "../components/Scrolly.svelte";
  import LorenzScene from "../components/LorenzScene.svelte";

  let currentStep = $state(0);
</script>

<section class="act" aria-label="Act 1: The Butterfly" style="--act-accent: var(--ink-aqua);">
  <div class="act-head">
    <p class="act-kicker">Act One</p>
    <h2>The Butterfly</h2>
    <p class="act-dek">
      Before it was a movie cliché, the butterfly effect was a discovery
      about weather — made by a meteorologist, on a weather model.
    </p>
  </div>

  <Scrolly onStepChange={(i) => (currentStep = i)}>
    {#snippet visual()}
      <LorenzScene step={currentStep} />
    {/snippet}

    <section class="scrolly-step">
      <p class="kicker">1961, MIT</p>
      <h3>Weather, reduced to a dozen equations</h3>
      <p>
        Edward Lorenz was running one of the first computer weather models.
        One day he restarted a simulation from a printout — typing in
        0.506 instead of the machine's internal 0.506127. A rounding error,
        a fraction of a thousandth. Nothing that should matter.
      </p>
      <p>
        The trace his simplified equations draw is on the left. Look at its
        shape.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">Two futures, 0.00001 apart</p>
      <h3>The rerun that founded chaos theory</h3>
      <p>
        At first, the rerun tracked the original perfectly — two weathers,
        indistinguishable. Then, slowly, tiny differences compounded. Within
        the equivalent of a couple of months, the two forecasts had nothing
        to do with each other.
      </p>
      <p>
        The same experiment is running live on the left: two trajectories,
        starting a hundred-thousandth apart.
      </p>
    </section>

    <section class="scrolly-step">
      <p class="kicker">Sensitive dependence</p>
      <h3>The flap becomes a storm</h3>
      <p>
        By now the two runs have flown apart — one circling the attractor's
        left wing, the other the right. Lorenz's 1972 talk gave the
        phenomenon its name: <em>“Does the flap of a butterfly's wings in
        Brazil set off a tornado in Texas?”</em>
      </p>
      <p>
        Now hold that thought — and consider that Europe hasn't nudged its
        atmosphere by a hundred-thousandth. It has warmed it by about
        <strong>2.5&nbsp;°C</strong>: a persistent shove, applied every day,
        that loads the dice for every heatwave, downpour and fire season
        that follows.
      </p>
    </section>
  </Scrolly>
</section>
