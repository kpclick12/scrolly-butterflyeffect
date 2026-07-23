<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  // Scroll-driven 3D prologue: a yellow butterfly over a sunlit meadow that
  // the reader scrolls into a full thunderstorm. Everything is procedural —
  // no model files — so the whole scene ships as code.
  //
  // One number drives it all: `storm` in [0,1], eased toward the reader's
  // scroll position through the tall wrapper. Sky, fog, grass color, wind
  // strength, cloud cover, rain density, lightning and the butterfly's
  // behavior all read that single value, so scrubbing the scrollbar scrubs
  // the weather.

  let wrap;
  let canvas;
  let cardEls = [];
  let webglFailed = $state(false);

  // Overlay copy: [start, end] are storm-progress bands, faded at the edges.
  const cards = [
    {
      band: [0.0, 0.16],
      eyebrow: "A visual essay on Europe's new extreme weather",
      title: "The Flap of a Wing",
      body: "A meadow, a butterfly, a perfect summer day. Keep scrolling.",
      hint: true,
    },
    {
      band: [0.24, 0.42],
      quote:
        "“Does the flap of a butterfly's wings in Brazil set off a tornado in Texas?”",
      cite: "Edward Lorenz, meteorologist, 1972",
    },
    {
      band: [0.5, 0.68],
      body:
        "Lorenz's point was not about butterflies. It was that in a chaotic system — and weather is the textbook example — a change almost too small to measure can transform everything downstream.",
    },
    {
      band: [0.78, 0.96],
      body:
        "Europe's atmosphere has been given its own nudge: about 2.5 °C of warming since pre-industrial times, more than any other continent. This is the story of what that flap set off.",
    },
  ];

  function bandOpacity(p, [a, b]) {
    const fade = 0.055;
    if (p <= a - fade || p >= b + fade) return 0;
    if (p < a) return (p - (a - fade)) / fade;
    if (p > b) return (b + fade - p) / fade;
    return 1;
  }

  onMount(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch {
      webglFailed = true;
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
    camera.position.set(0, 1.6, 6);

    // --- Palette endpoints: everything lerps between "day" and "storm". ---
    const daySky = new THREE.Color("#8ec8ee");
    const stormSky = new THREE.Color("#141c2a");
    const flashSky = new THREE.Color("#cdd7e8");
    const dayGround = new THREE.Color("#6c9c50");
    const stormGround = new THREE.Color("#1b2418");
    const dayBase = new THREE.Color("#3d7a2f");
    const dayTip = new THREE.Color("#a3d05f");
    const stormBase = new THREE.Color("#17250f");
    const stormTip = new THREE.Color("#41562e");
    const dayCloud = new THREE.Color("#f2f7fb");
    const stormCloud = new THREE.Color("#232e40");

    scene.background = daySky.clone();

    // --- Ground ---
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(40, 40),
      new THREE.MeshBasicMaterial({ color: dayGround.clone() })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // --- Grass: one instanced draw call, wind computed in the vertex shader
    // so thousands of blades sway without touching a matrix per frame. ---
    const BLADES = window.innerWidth < 700 ? 1100 : 2200;
    const blade = new THREE.PlaneGeometry(0.055, 1, 1, 4);
    blade.translate(0, 0.5, 0);
    {
      // Taper toward the tip and lean the blade forward slightly.
      const pos = blade.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        pos.setX(i, pos.getX(i) * (1 - y * 0.85));
        pos.setZ(i, y * y * 0.18);
      }
    }
    const grassUniforms = {
      uTime: { value: 0 },
      uWind: { value: 0 },
      uBase: { value: dayBase.clone() },
      uTip: { value: dayTip.clone() },
      uFog: { value: daySky.clone() },
    };
    const grassMat = new THREE.ShaderMaterial({
      uniforms: grassUniforms,
      side: THREE.DoubleSide,
      vertexShader: `
        uniform float uTime;
        uniform float uWind;
        attribute float aPhase;
        varying float vH;
        varying float vDepth;
        void main() {
          vH = uv.y;
          vec4 world = instanceMatrix * vec4(position, 1.0);
          float bend = vH * vH;
          float sway = sin(uTime * (1.6 + uWind * 5.0) + aPhase) * (0.05 + uWind * 0.38);
          float gust = sin(uTime * 0.6 + aPhase * 0.37) * uWind * 0.22;
          world.x += (sway + gust) * bend;
          world.z += cos(uTime * (1.1 + uWind * 4.2) + aPhase * 1.7) * (0.03 + uWind * 0.2) * bend;
          vec4 view = viewMatrix * world;
          vDepth = -view.z;
          gl_Position = projectionMatrix * view;
        }
      `,
      fragmentShader: `
        uniform vec3 uBase;
        uniform vec3 uTip;
        uniform vec3 uFog;
        varying float vH;
        varying float vDepth;
        void main() {
          vec3 c = mix(uBase, uTip, vH);
          float f = smoothstep(9.0, 30.0, vDepth);
          gl_FragColor = vec4(mix(c, uFog, f), 1.0);
        }
      `,
    });
    const grass = new THREE.InstancedMesh(blade, grassMat, BLADES);
    {
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const up = new THREE.Vector3(0, 1, 0);
      const phases = new Float32Array(BLADES);
      for (let i = 0; i < BLADES; i++) {
        // Denser near the camera, thinning with distance.
        const r = Math.pow(Math.random(), 0.65) * 16;
        const a = Math.random() * Math.PI * 2;
        const x = Math.sin(a) * r;
        const z = Math.cos(a) * r * 0.75 + 1.5;
        if (z > 5.6) {
          phases[i] = Math.random() * Math.PI * 2;
          m.makeScale(0, 0, 0); // behind the camera — collapse instead of draw
          grass.setMatrixAt(i, m);
          continue;
        }
        q.setFromAxisAngle(up, Math.random() * Math.PI * 2);
        const s = 0.55 + Math.random() * 0.8;
        m.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(1, s, 1));
        grass.setMatrixAt(i, m);
        phases[i] = Math.random() * Math.PI * 2;
      }
      blade.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
    }
    scene.add(grass);

    // --- A few flowers so the meadow reads "alive" before the storm. ---
    const flowers = new THREE.Group();
    {
      const petal = new THREE.CircleGeometry(0.05, 8);
      const white = new THREE.MeshBasicMaterial({ color: "#f5f2e4", side: THREE.DoubleSide });
      const gold = new THREE.MeshBasicMaterial({ color: "#e8b83a", side: THREE.DoubleSide });
      for (let i = 0; i < 26; i++) {
        const f = new THREE.Mesh(petal, Math.random() < 0.5 ? white : gold);
        const r = 1.5 + Math.random() * 8;
        const a = Math.random() * Math.PI * 2;
        f.position.set(Math.sin(a) * r, 0.35 + Math.random() * 0.4, Math.cos(a) * r * 0.7);
        f.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
        if (f.position.z > 5) f.visible = false;
        flowers.add(f);
      }
    }
    scene.add(flowers);

    // --- Sun: a soft radial glow that the storm swallows. ---
    function glowTexture(inner, outer) {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d");
      const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
      grad.addColorStop(0, inner);
      grad.addColorStop(1, outer);
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 256);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }
    const sun = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture("rgba(255,244,200,1)", "rgba(255,244,200,0)"),
        transparent: true,
        depthWrite: false,
      })
    );
    sun.position.set(-5.5, 7.5, -9);
    sun.scale.setScalar(7);
    scene.add(sun);

    // --- Clouds: billboarded soft blobs that thicken and darken. ---
    const cloudTex = glowTexture("rgba(255,255,255,0.95)", "rgba(255,255,255,0)");
    const clouds = [];
    for (let i = 0; i < 10; i++) {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          color: dayCloud.clone(),
        })
      );
      s.position.set(-14 + Math.random() * 28, 5.5 + Math.random() * 3.5, -8 - Math.random() * 4);
      s.scale.set(9 + Math.random() * 8, 4.5 + Math.random() * 3, 1);
      s.userData.drift = 0.1 + Math.random() * 0.25;
      scene.add(s);
      clouds.push(s);
    }

    // --- Rain: short vertical streaks (line segments read as falling rain
    // where round points read as static specks). ---
    const RAIN = 1600;
    const STREAK = 0.28;
    const rainGeom = new THREE.BufferGeometry();
    const rainPos = new Float32Array(RAIN * 6);
    for (let i = 0; i < RAIN; i++) {
      const x = -9 + Math.random() * 18;
      const yy = Math.random() * 11;
      const z = -6 + Math.random() * 11;
      rainPos.set([x, yy, z, x + 0.04, yy + STREAK, z], i * 6);
    }
    rainGeom.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.LineBasicMaterial({
      color: "#a9c2d8",
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const rain = new THREE.LineSegments(rainGeom, rainMat);
    scene.add(rain);

    // --- Butterfly: canvas-painted wings on two hinged planes. ---
    function wingTexture() {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const g = c.getContext("2d");
      g.clearRect(0, 0, 256, 256);
      // Forewing + hindwing silhouette, hinge at the left edge, pointing +x.
      g.beginPath();
      g.moveTo(8, 128);
      g.bezierCurveTo(40, 20, 200, 0, 246, 60);
      g.bezierCurveTo(250, 105, 190, 128, 120, 130);
      g.bezierCurveTo(190, 150, 220, 180, 190, 220);
      g.bezierCurveTo(140, 250, 40, 210, 8, 138);
      g.closePath();
      g.fillStyle = "#f4c531";
      g.fill();
      g.lineWidth = 10;
      g.strokeStyle = "#2e2618";
      g.stroke();
      // Veins
      g.lineWidth = 3.5;
      g.strokeStyle = "rgba(46,38,24,0.55)";
      for (const [x, y] of [[210, 55], [230, 90], [170, 125], [180, 200], [120, 215]]) {
        g.beginPath();
        g.moveTo(14, 130);
        g.quadraticCurveTo((x + 20) / 2, y * 0.8, x, y);
        g.stroke();
      }
      // Spots
      g.fillStyle = "#2e2618";
      g.beginPath();
      g.arc(196, 78, 13, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.85)";
      g.beginPath();
      g.arc(200, 74, 4.5, 0, Math.PI * 2);
      g.fill();
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }
    const butterfly = new THREE.Group();
    const wingMap = wingTexture();
    const wingMat = new THREE.MeshBasicMaterial({
      map: wingMap,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.15,
    });
    // Wing planes lie flat (XZ); flapping rotates them around the body's
    // forward axis (z). Geometry is shifted so the hinge sits at x = 0.
    const wingGeomR = new THREE.PlaneGeometry(0.46, 0.46);
    wingGeomR.rotateX(-Math.PI / 2);
    wingGeomR.translate(0.23, 0, 0);
    const wingGeomL = wingGeomR.clone();
    wingGeomL.scale(-1, 1, 1);
    const wingR = new THREE.Mesh(wingGeomR, wingMat);
    const wingL = new THREE.Mesh(wingGeomL, wingMat);
    butterfly.add(wingR, wingL);
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.022, 0.3, 3, 6),
      new THREE.MeshBasicMaterial({ color: "#2e2618" })
    );
    body.rotation.x = Math.PI / 2;
    butterfly.add(body);
    butterfly.position.set(0, 1.6, 1);
    scene.add(butterfly);

    // --- Lightning: a jagged polyline, regenerated per flash. ---
    const boltMat = new THREE.LineBasicMaterial({ color: "#eef2ff", transparent: true, opacity: 0 });
    let bolt = new THREE.Line(new THREE.BufferGeometry(), boltMat);
    scene.add(bolt);
    function rebuildBolt() {
      const pts = [];
      let x = -6 + Math.random() * 12;
      let z = -7 + Math.random() * 3;
      let y = 10;
      pts.push(new THREE.Vector3(x, y, z));
      while (y > 0.8) {
        y -= 0.7 + Math.random() * 0.9;
        x += (Math.random() - 0.5) * 1.4;
        pts.push(new THREE.Vector3(x, y, z));
      }
      bolt.geometry.dispose();
      bolt.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    }

    // --- Scroll → storm progress ---
    let targetStorm = 0;
    let storm = 0;
    function onScroll() {
      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      targetStorm = Math.min(1, Math.max(0, -rect.top / total));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function resize() {
      const w = wrap.clientWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    // Only render while the hero is on screen.
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(wrap);

    const clock = new THREE.Clock();
    let elapsed = 0;
    let flash = 0;
    let nextFlashIn = 2;
    let raf;
    const skyNow = new THREE.Color();
    const tmpColor = new THREE.Color();

    function frame() {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      elapsed += dt * (reduceMotion ? 0.15 : 1);
      storm += (targetStorm - storm) * Math.min(1, dt * 5);
      const t = elapsed;

      // Atmosphere
      skyNow.copy(daySky).lerp(stormSky, storm);
      if (flash > 0) skyNow.lerp(flashSky, flash * 0.55);
      scene.background.copy(skyNow);
      grassUniforms.uFog.value.copy(skyNow);
      grassUniforms.uTime.value = t;
      grassUniforms.uWind.value = reduceMotion ? storm * 0.25 : storm;
      grassUniforms.uBase.value.copy(dayBase).lerp(stormBase, storm);
      grassUniforms.uTip.value.copy(dayTip).lerp(stormTip, storm);
      ground.material.color.copy(dayGround).lerp(stormGround, storm);
      sun.material.opacity = Math.max(0, 1 - storm * 1.7);
      flowers.children.forEach((f, i) => {
        f.rotation.z = Math.sin(t * 1.3 + i) * (0.05 + storm * 0.3);
      });

      // Clouds
      tmpColor.copy(dayCloud).lerp(stormCloud, storm);
      for (const c of clouds) {
        c.material.opacity = Math.min(0.95, Math.max(0, (storm - 0.08) * 1.6));
        c.material.color.copy(tmpColor);
        c.position.x += c.userData.drift * dt * (0.4 + storm * 2.4);
        if (c.position.x > 16) c.position.x = -16;
      }

      // Rain
      rainMat.opacity = Math.max(0, (storm - 0.55) / 0.45) * (reduceMotion ? 0.25 : 0.45);
      if (rainMat.opacity > 0) {
        const p = rainGeom.attributes.position.array;
        const fall = dt * (7 + storm * 6);
        const drift = dt * storm * 2.2;
        for (let i = 0; i < RAIN; i++) {
          const o = i * 6;
          const dy = fall * (0.8 + ((i * 37) % 10) / 18);
          p[o + 1] -= dy;
          p[o + 4] -= dy;
          p[o] += drift;
          p[o + 3] += drift;
          if (p[o + 1] < 0) {
            const x = -9 + Math.random() * 18;
            const yy = 10 + Math.random();
            p[o] = x;
            p[o + 1] = yy;
            p[o + 3] = x + 0.04;
            p[o + 4] = yy + STREAK;
          }
          if (p[o] > 9) {
            p[o] -= 18;
            p[o + 3] -= 18;
          }
        }
        rainGeom.attributes.position.needsUpdate = true;
      }

      // Lightning
      if (!reduceMotion && storm > 0.72) {
        nextFlashIn -= dt;
        if (nextFlashIn <= 0) {
          rebuildBolt();
          flash = 1;
          nextFlashIn = 1.8 + Math.random() * 3.2;
        }
      }
      flash = Math.max(0, flash - dt * 3.2);
      boltMat.opacity = flash > 0.55 ? (flash - 0.55) * 2.2 : 0;

      // Butterfly: carefree loops in the sun; buffeted as wind rises; drops
      // into the grass to shelter as the storm peaks.
      const shelter = Math.max(0, (storm - 0.78) / 0.22);
      const agitation = storm * (1 - shelter);
      const fx = Math.sin(t * 0.45) * 1.5 + Math.sin(t * 1.7) * 0.15 * agitation * 4;
      const fy =
        1.55 + Math.sin(t * 1.1) * (0.3 + agitation * 0.35) - shelter * 1.15;
      const fz = 0.9 + Math.cos(t * 0.3) * 0.7;
      butterfly.position.set(fx, Math.max(0.42, fy), fz);
      const flapHz = 9 + agitation * 7 - shelter * 5.5;
      const flap = Math.sin(t * flapHz) * (0.95 - shelter * 0.55);
      wingR.rotation.z = flap;
      wingL.rotation.z = -flap;
      butterfly.rotation.y = Math.atan2(Math.cos(t * 0.45) * 1.5 * 0.45, -Math.sin(t * 0.3) * 0.7 * 0.3);
      butterfly.rotation.z = Math.sin(t * 0.9) * 0.12 * (1 + agitation * 2);

      // Camera: a slow breath, plus a slight pull-back as the storm grows.
      camera.position.x = Math.sin(t * 0.05) * 0.25;
      camera.position.y = 1.6 + storm * 0.25;
      camera.position.z = 6 + storm * 0.8;
      camera.lookAt(0, 1.35, 0);

      // Overlay cards follow the same storm value.
      cardEls.forEach((el, i) => {
        if (!el) return;
        const o = bandOpacity(storm, cards[i].band);
        el.style.opacity = o;
        el.style.visibility = o === 0 ? "hidden" : "visible";
      });

      renderer.render(scene, camera);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      io.disconnect();
      renderer.dispose();
      blade.dispose();
      grassMat.dispose();
      rainGeom.dispose();
      rainMat.dispose();
      bolt.geometry.dispose();
      boltMat.dispose();
      wingMap.dispose();
      cloudTex.dispose();
    };
  });
</script>

<div
  class="hero3d"
  bind:this={wrap}
  role="img"
  aria-label="Animated scene: a yellow butterfly flutters over a sunny meadow. As you scroll, clouds gather, wind bends the grass, rain falls and lightning flashes — the meadow becomes a thunderstorm."
>
  <div class="hero3d-sticky">
    {#if webglFailed}
      <div class="hero3d-fallback">
        <p class="eyebrow">A visual essay on Europe's new extreme weather</p>
        <h1>The Flap of a Wing</h1>
        <p>
          A butterfly in a meadow, a gathering storm — and the data on how
          Europe's weather turned extreme. Scroll on for the story.
        </p>
      </div>
    {:else}
      <canvas bind:this={canvas} aria-hidden="true"></canvas>
      {#each cards as card, i}
        <div class="hero3d-card" class:title-card={card.title} bind:this={cardEls[i]}>
          {#if card.eyebrow}<p class="eyebrow">{card.eyebrow}</p>{/if}
          {#if card.title}<h1>{card.title}</h1>{/if}
          {#if card.quote}<blockquote><p class="quote">{card.quote}</p><cite>— {card.cite}</cite></blockquote>{/if}
          {#if card.body}<p class="card-body">{card.body}</p>{/if}
          {#if card.hint}<p class="scroll-hint">Scroll<span class="scroll-tick">|</span></p>{/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .hero3d {
    /* Tall scroll runway: the sticky viewport inside plays the storm as the
       reader moves through it. */
    height: 460svh;
    position: relative;
  }
  .hero3d-sticky {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
    background: var(--hero-ink-deep);
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  .hero3d-card {
    position: absolute;
    left: 50%;
    bottom: 12svh;
    transform: translateX(-50%);
    width: min(620px, calc(100% - 48px));
    padding: 22px 28px;
    border-radius: 10px;
    background: rgba(12, 22, 38, 0.72);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    color: #ffffff;
    text-align: center;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }
  .hero3d-card.title-card {
    bottom: auto;
    top: 50%;
    transform: translate(-50%, -50%);
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .eyebrow {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--hero-gold);
    font-weight: 700;
    margin: 0 0 18px;
  }
  h1 {
    font-family: var(--serif);
    font-weight: 700;
    font-size: clamp(46px, 9vw, 92px);
    text-wrap: balance;
    line-height: 1.02;
    margin: 0 0 18px;
    color: #ffffff;
    text-shadow: 0 2px 24px rgba(12, 22, 38, 0.55);
  }
  .title-card .card-body {
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 1px 12px rgba(12, 22, 38, 0.65);
  }
  blockquote {
    margin: 0;
  }
  .quote {
    font-family: var(--serif);
    font-style: italic;
    font-size: clamp(19px, 3vw, 26px);
    line-height: 1.45;
    color: #ffffff;
    margin: 0 0 10px;
  }
  cite {
    font-style: normal;
    font-size: 13.5px;
    letter-spacing: 0.04em;
    color: var(--hero-gold);
  }
  .card-body {
    font-size: 16.5px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.94);
    margin: 0;
  }
  .scroll-hint {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    color: rgba(255, 255, 255, 0.75);
    margin: 26px 0 0;
  }
  .scroll-tick {
    display: block;
    margin-top: 6px;
    animation: bob 2s ease-in-out infinite;
  }
  @keyframes bob {
    0%, 100% { transform: translateY(0); opacity: 0.4; }
    50% { transform: translateY(6px); opacity: 1; }
  }
  .hero3d-fallback {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 32px;
    background: radial-gradient(120% 90% at 80% 10%, var(--hero-ink) 0%, var(--hero-ink-deep) 100%);
  }
  .hero3d-fallback p {
    max-width: 560px;
    color: rgba(255, 255, 255, 0.92);
  }
  @media (max-width: 700px) {
    .hero3d-card {
      padding: 16px 18px;
      bottom: 9svh;
    }
  }
</style>
