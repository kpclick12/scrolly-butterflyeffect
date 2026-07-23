<script>
  import { onMount } from "svelte";
  import * as THREE from "three";

  // Scroll-driven 3D prologue, kept wordless on purpose: a yellow butterfly
  // over a summer meadow, then the storm that takes the scene from it. One
  // eased value drives everything — `storm` in [0,1], following the reader's
  // scroll — so scrubbing the scrollbar scrubs the weather:
  //   0.00–0.25  summer day, light clouds drifting
  //   0.25–0.55  clouds cluster and darken, sun fades, wind rises
  //   0.55–0.75  first rain, the meadow goes grey-green
  //   0.75–0.92  lightning; a gust carries the butterfly out of the scene
  //   0.92–1.00  the storm has the meadow to itself
  // All geometry is procedural — no model files.

  let wrap;
  let canvas;
  let vignetteEl;
  let cardEls = [];
  let webglFailed = $state(false);

  // Two cards only: the title, and a single line that hands over to Act One.
  const cards = [
    {
      band: [0.0, 0.14],
      eyebrow: "A visual essay on Europe's new extreme weather",
      title: "The Flap of a Wing",
      hint: true,
    },
    {
      band: [0.86, 1.01],
      body: "First the butterfly. Then the storm. Europe's atmosphere has been nudged by 2.5 °C — this is the story of what followed.",
    },
  ];

  function bandOpacity(p, [a, b]) {
    const fade = 0.05;
    if (p <= a - fade || p >= b + fade) return 0;
    if (p < a) return (p - (a - fade)) / fade;
    if (p > b) return (b + fade - p) / fade;
    return 1;
  }

  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

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
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 90);
    camera.position.set(0, 1.6, 6);

    // --- Palette endpoints: everything lerps between "day" and "storm". ---
    const dayZenith = new THREE.Color("#4f9fe6");
    const dayHorizon = new THREE.Color("#d9edf9");
    const stormZenith = new THREE.Color("#0b1018");
    const stormHorizon = new THREE.Color("#49525a"); // grey with a sick green cast
    const flashColor = new THREE.Color("#dfe6f2");
    const dayGround = new THREE.Color("#74a355");
    const stormGround = new THREE.Color("#1e2a1c");
    const dayBase = new THREE.Color("#40803a");
    const dayTip = new THREE.Color("#a8d468");
    const stormBase = new THREE.Color("#1a2a14");
    const stormTip = new THREE.Color("#4a5c35");

    // --- Sky: a gradient dome, not a flat color — the horizon stays lighter
    // than the zenith in both weathers, which is most of what makes a sky
    // read as real. ---
    const skyUniforms = {
      uStorm: { value: 0 },
      uFlash: { value: 0 },
      uDayZen: { value: dayZenith },
      uDayHor: { value: dayHorizon },
      uStormZen: { value: stormZenith },
      uStormHor: { value: stormHorizon },
      uFlashCol: { value: flashColor },
      uSunDir: { value: new THREE.Vector3(-0.45, 0.55, -0.7).normalize() },
    };
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(60, 24, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: skyUniforms,
        vertexShader: `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uStorm;
          uniform float uFlash;
          uniform vec3 uDayZen; uniform vec3 uDayHor;
          uniform vec3 uStormZen; uniform vec3 uStormHor;
          uniform vec3 uFlashCol;
          uniform vec3 uSunDir;
          varying vec3 vDir;
          void main() {
            float h = clamp(vDir.y, 0.0, 1.0);
            float g = pow(h, 0.55);
            vec3 day = mix(uDayHor, uDayZen, g);
            // Warm haze around the sun while it is still out.
            float sunGlow = pow(max(dot(normalize(vDir), uSunDir), 0.0), 6.0);
            day += vec3(0.28, 0.2, 0.05) * sunGlow * (1.0 - uStorm);
            vec3 storm = mix(uStormHor, uStormZen, g);
            vec3 c = mix(day, storm, uStorm);
            c = mix(c, uFlashCol, uFlash * 0.55);
            gl_FragColor = vec4(c, 1.0);
          }
        `,
      })
    );
    scene.add(sky);

    // --- Ground ---
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(50, 40),
      new THREE.MeshBasicMaterial({ color: dayGround.clone() })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // --- Grass: one instanced draw call, wind in the vertex shader. ---
    const BLADES = window.innerWidth < 700 ? 1200 : 2400;
    const blade = new THREE.PlaneGeometry(0.055, 1, 1, 4);
    blade.translate(0, 0.5, 0);
    {
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
      uFog: { value: dayHorizon.clone() },
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
        varying float vShade;
        void main() {
          vH = uv.y;
          vShade = 0.88 + 0.24 * fract(aPhase * 7.13);
          vec4 world = instanceMatrix * vec4(position, 1.0);
          float bend = vH * vH;
          // Gusty wind: a base sway plus a slower traveling gust front, both
          // leaning the same way so the whole meadow streams with the storm.
          float sway = sin(uTime * (1.6 + uWind * 5.0) + aPhase) * (0.05 + uWind * 0.3);
          float gust = (0.5 + 0.5 * sin(uTime * 0.9 + world.x * 0.4 + aPhase * 0.3)) * uWind * 0.45;
          world.x += (sway + gust) * bend;
          world.z += cos(uTime * (1.1 + uWind * 4.2) + aPhase * 1.7) * (0.03 + uWind * 0.16) * bend;
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
        varying float vShade;
        void main() {
          vec3 c = mix(uBase, uTip, vH) * vShade;
          float f = smoothstep(9.0, 34.0, vDepth);
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
        const r = Math.pow(Math.random(), 0.65) * 18;
        const a = Math.random() * Math.PI * 2;
        const x = Math.sin(a) * r;
        const z = Math.cos(a) * r * 0.75 + 1.5;
        phases[i] = Math.random() * Math.PI * 2;
        if (z > 5.6) {
          m.makeScale(0, 0, 0); // behind the camera — collapse instead of draw
          grass.setMatrixAt(i, m);
          continue;
        }
        q.setFromAxisAngle(up, Math.random() * Math.PI * 2);
        const s = 0.55 + Math.random() * 0.8;
        m.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(1, s, 1));
        grass.setMatrixAt(i, m);
      }
      blade.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
    }
    scene.add(grass);

    // --- Flowers ---
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

    // --- Sun ---
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
        map: glowTexture("rgba(255,246,214,1)", "rgba(255,246,214,0)"),
        transparent: true,
        depthWrite: false,
      })
    );
    sun.position.set(-9, 11, -14);
    sun.scale.setScalar(9);
    scene.add(sun);

    // --- Clouds: clusters of soft puffs. A few live in the day sky from the
    // start (an empty blue sky reads fake); the storm adds more, drops them
    // lower, and darkens their bases into a deck. ---
    const puffTex = glowTexture("rgba(255,255,255,0.9)", "rgba(255,255,255,0)");
    const dayCloudCol = new THREE.Color("#ffffff");
    const stormCloudTop = new THREE.Color("#39424e");
    const stormCloudBase = new THREE.Color("#20262e");
    const puffs = [];
    function addCluster(cx, cy, cz, n, spread, scale, dayVisible) {
      for (let i = 0; i < n; i++) {
        const s = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: puffTex, transparent: true, opacity: 0, depthWrite: false })
        );
        const ox = (Math.random() - 0.5) * spread;
        const oy = (Math.random() - 0.5) * spread * 0.3;
        s.position.set(cx + ox, cy + oy, cz + (Math.random() - 0.5) * 2);
        const sc = scale * (0.7 + Math.random() * 0.6);
        s.scale.set(sc, sc * 0.5, 1);
        s.userData = {
          drift: 0.08 + Math.random() * 0.2,
          dayO: dayVisible ? 0.5 + Math.random() * 0.25 : 0,
          stormO: 0.85 + Math.random() * 0.15,
          low: oy < 0, // lower puffs get the darker storm base color
          baseY: cy + oy,
          drop: dayVisible ? 1.5 : 2.5 + Math.random() * 1.5,
        };
        scene.add(s);
        puffs.push(s);
      }
    }
    // Fair-weather clouds
    addCluster(-10, 10, -16, 4, 6, 6, true);
    addCluster(7, 12, -18, 5, 7, 7, true);
    addCluster(16, 9, -15, 3, 5, 5, true);
    // Storm-only clusters — the deck that rolls in
    addCluster(-16, 9, -13, 6, 9, 8, false);
    addCluster(0, 10, -14, 7, 12, 9, false);
    addCluster(12, 8.5, -12, 6, 9, 8, false);
    addCluster(-5, 7.5, -10, 5, 10, 7, false);

    // --- Rain: slanted streaks whose lean follows the wind. ---
    const RAIN = 1700;
    const STREAK = 0.3;
    const rainGeom = new THREE.BufferGeometry();
    const rainPos = new Float32Array(RAIN * 6);
    for (let i = 0; i < RAIN; i++) {
      const x = -10 + Math.random() * 20;
      const yy = Math.random() * 12;
      const z = -7 + Math.random() * 12;
      rainPos.set([x, yy, z, x + 0.06, yy + STREAK, z], i * 6);
    }
    rainGeom.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.LineBasicMaterial({
      color: "#aebfcf",
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const rain = new THREE.LineSegments(rainGeom, rainMat);
    scene.add(rain);

    // --- Butterfly: an eastern tiger swallowtail. ONE wing plane per side —
    // forewing and hindwing (with its swallow tail) are painted together on
    // a single canvas, hindwing first so the forewing overlaps it exactly as
    // on the real animal. Two planes flapping in sync read as two wings;
    // separately-hinged segments read as four, which is wrong from any
    // distance. Canvas top = forward (leading edge), bottom = tails.
    const YELLOW = "#f0c838";
    const WBLACK = "#1b1510";
    const wingMap = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d");

      // — Hindwing first (it sits under the forewing) — shifted rearward.
      g.save();
      g.translate(0, 84);
      g.scale(0.8, 0.66);
      g.beginPath();
      g.moveTo(8, 34);
      g.bezierCurveTo(90, 18, 180, 44, 216, 104);
      g.bezierCurveTo(228, 140, 216, 172, 192, 190);
      g.quadraticCurveTo(178, 212, 160, 198);
      g.quadraticCurveTo(152, 244, 136, 258); // the swallow tail
      g.quadraticCurveTo(126, 222, 118, 202);
      g.quadraticCurveTo(96, 214, 82, 196);
      g.quadraticCurveTo(58, 200, 44, 178);
      g.quadraticCurveTo(22, 150, 12, 110);
      g.closePath();
      g.fillStyle = YELLOW;
      g.fill();
      g.save();
      g.clip();
      g.fillStyle = WBLACK;
      g.fillRect(24, 0, 20, 100);
      g.fillRect(70, 6, 18, 78);
      g.fillRect(0, 0, 14, 210);
      g.strokeStyle = WBLACK;
      g.beginPath();
      g.moveTo(216, 104);
      g.bezierCurveTo(228, 140, 216, 172, 192, 190);
      g.quadraticCurveTo(178, 212, 160, 198);
      g.quadraticCurveTo(152, 244, 136, 258);
      g.quadraticCurveTo(126, 222, 118, 202);
      g.quadraticCurveTo(96, 214, 82, 196);
      g.quadraticCurveTo(58, 200, 44, 178);
      g.lineWidth = 46;
      g.stroke();
      // Blue crescents, orange anal spot, yellow edge crescents
      g.fillStyle = "#5b8fc0";
      for (const [bx, by] of [[196, 158], [172, 178], [144, 188], [114, 188], [86, 180], [60, 166]]) {
        g.beginPath();
        g.ellipse(bx, by, 10, 7, 0.4, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = "#e0762e";
      g.beginPath();
      g.ellipse(42, 158, 9, 8, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = YELLOW;
      for (const [ex, ey] of [[212, 134], [200, 178], [166, 202], [100, 204], [58, 190]]) {
        g.beginPath();
        g.ellipse(ex, ey, 5.5, 4, 0.3, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
      g.restore();

      // — Forewing on top.
      g.beginPath();
      g.moveTo(6, 130);
      g.bezierCurveTo(20, 88, 90, 24, 240, 12);
      g.bezierCurveTo(252, 56, 242, 106, 206, 138);
      g.bezierCurveTo(162, 168, 60, 158, 6, 140);
      g.closePath();
      g.fillStyle = YELLOW;
      g.fill();
      g.save();
      g.clip();
      g.fillStyle = WBLACK;
      const bar = (x0, w, len, lean) => {
        g.beginPath();
        g.moveTo(x0, 0);
        g.lineTo(x0 + w, 0);
        g.lineTo(x0 + w + lean, len);
        g.lineTo(x0 + lean, len);
        g.closePath();
        g.fill();
      };
      // Tiger stripes angling back from the leading edge
      bar(30, 17, 120, 5);
      bar(76, 16, 102, 11);
      bar(120, 15, 84, 16);
      bar(162, 14, 62, 18);
      g.strokeStyle = WBLACK;
      // Leading-edge trim
      g.beginPath();
      g.moveTo(6, 130);
      g.bezierCurveTo(20, 88, 90, 24, 240, 12);
      g.lineWidth = 14;
      g.stroke();
      // Broad black outer margin with its row of yellow spots
      g.beginPath();
      g.moveTo(242, 14);
      g.bezierCurveTo(252, 56, 242, 106, 206, 138);
      g.bezierCurveTo(174, 162, 110, 164, 40, 152);
      g.lineWidth = 40;
      g.stroke();
      g.fillStyle = YELLOW;
      for (const [sx, sy] of [[238, 46], [232, 72], [220, 96], [204, 116], [182, 132], [154, 142], [122, 148], [90, 150]]) {
        g.beginPath();
        g.ellipse(sx, sy, 7, 4.5, -0.5, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();

      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    const butterfly = new THREE.Group();
    const wingMat = new THREE.MeshBasicMaterial({
      map: wingMap,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.15,
    });
    const wingGeomR = new THREE.PlaneGeometry(0.55, 0.55);
    wingGeomR.rotateX(-Math.PI / 2);
    wingGeomR.translate(0.275, 0, 0.04);
    const wingGeomL = wingGeomR.clone();
    wingGeomL.scale(-1, 1, 1);
    const wingR = new THREE.Mesh(wingGeomR, wingMat);
    const wingL = new THREE.Mesh(wingGeomL, wingMat);
    butterfly.add(wingR, wingL);
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.024, 0.32, 3, 6),
      new THREE.MeshBasicMaterial({ color: WBLACK })
    );
    body.rotation.x = Math.PI / 2;
    butterfly.add(body);
    // Antennae, angled forward
    const antGeom = new THREE.CylinderGeometry(0.004, 0.004, 0.16, 3);
    const antMat = new THREE.MeshBasicMaterial({ color: WBLACK });
    for (const s of [-1, 1]) {
      const a = new THREE.Mesh(antGeom, antMat);
      a.position.set(s * 0.045, 0.05, -0.24);
      a.rotation.x = -Math.PI / 3;
      a.rotation.z = s * 0.35;
      butterfly.add(a);
    }
    butterfly.position.set(0, 1.6, 1);
    scene.add(butterfly);

    // --- Lightning: a jagged main channel with a couple of branches, the
    // shape real strikes actually have. ---
    const boltMat = new THREE.LineBasicMaterial({ color: "#eef2ff", transparent: true, opacity: 0 });
    const bolt = new THREE.LineSegments(new THREE.BufferGeometry(), boltMat);
    scene.add(bolt);
    function rebuildBolt() {
      const segs = [];
      let x = -6 + Math.random() * 12;
      const z = -8 + Math.random() * 3;
      let y = 11;
      let px = x;
      let py = y;
      while (y > 0.6) {
        y -= 0.6 + Math.random() * 0.8;
        x += (Math.random() - 0.5) * 1.3;
        segs.push(px, py, z, x, y, z);
        if (Math.random() < 0.3 && y > 2.5) {
          let bx = x;
          let by = y;
          const dir = Math.random() < 0.5 ? -1 : 1;
          for (let k = 0; k < 3; k++) {
            const nx = bx + dir * (0.3 + Math.random() * 0.5);
            const ny = by - (0.4 + Math.random() * 0.5);
            segs.push(bx, by, z, nx, ny, z);
            bx = nx;
            by = ny;
          }
        }
        px = x;
        py = y;
      }
      bolt.geometry.dispose();
      bolt.geometry = new THREE.BufferGeometry();
      bolt.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(segs), 3));
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

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(wrap);

    const clock = new THREE.Clock();
    let elapsed = 0;
    let flashT = -1; // time within the current flash envelope; -1 = idle
    let nextFlashIn = 1.5;
    let prevFx = 0;
    let prevFz = 1.6;
    let headingSmooth = Math.PI / 2;
    let raf;
    const tmpColor = new THREE.Color();
    const tmpColor2 = new THREE.Color();

    function frame() {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      elapsed += dt * (reduceMotion ? 0.15 : 1);
      storm += (targetStorm - storm) * Math.min(1, dt * 5);
      const t = elapsed;

      // Lightning: a two-pulse flicker, the way real strikes re-strike.
      let flash = 0;
      if (!reduceMotion && storm > 0.72) {
        nextFlashIn -= dt;
        if (nextFlashIn <= 0 && flashT < 0) {
          rebuildBolt();
          flashT = 0;
          nextFlashIn = 2 + Math.random() * 3.5;
        }
      }
      if (flashT >= 0) {
        flashT += dt;
        const e1 = Math.max(0, 1 - flashT / 0.12);
        const e2 = flashT > 0.16 ? Math.max(0, 1 - (flashT - 0.16) / 0.2) : 0;
        flash = Math.max(e1, e2 * 0.7);
        if (flashT > 0.4) flashT = -1;
      }

      // Atmosphere
      skyUniforms.uStorm.value = storm;
      skyUniforms.uFlash.value = flash;
      grassUniforms.uFog.value.copy(dayHorizon).lerp(stormHorizon, storm);
      grassUniforms.uTime.value = t;
      grassUniforms.uWind.value = (reduceMotion ? 0.25 : 1) * smooth(0.2, 0.85, storm);
      grassUniforms.uBase.value.copy(dayBase).lerp(stormBase, storm);
      grassUniforms.uTip.value.copy(dayTip).lerp(stormTip, storm);
      ground.material.color.copy(dayGround).lerp(stormGround, storm);
      if (flash > 0) ground.material.color.lerp(flashColor, flash * 0.12);
      sun.material.opacity = Math.max(0, 1 - storm * 2.2);
      flowers.children.forEach((f, i) => {
        f.rotation.z = Math.sin(t * 1.3 + i) * (0.05 + storm * 0.35);
      });

      // Clouds
      const cloudIn = smooth(0.12, 0.6, storm);
      tmpColor.copy(dayCloudCol).lerp(stormCloudTop, storm);
      tmpColor2.copy(dayCloudCol).lerp(stormCloudBase, storm);
      for (const c of puffs) {
        const d = c.userData;
        c.material.opacity = d.dayO + (d.stormO - d.dayO) * cloudIn;
        c.material.color.copy(d.low ? tmpColor2 : tmpColor);
        if (flash > 0) c.material.color.lerp(flashColor, flash * (d.low ? 0.5 : 0.3));
        c.position.x += d.drift * dt * (0.4 + storm * 2.6);
        c.position.y = d.baseY - d.drop * cloudIn;
        if (c.position.x > 22) c.position.x = -22;
      }

      // Rain
      rainMat.opacity = Math.max(0, (storm - 0.55) / 0.45) * (reduceMotion ? 0.25 : 0.55);
      if (rainMat.opacity > 0) {
        const p = rainGeom.attributes.position.array;
        const fall = dt * (7.5 + storm * 6);
        const drift = dt * storm * 2.6;
        const lean = 0.06 + storm * 0.14; // streak slant follows the wind
        for (let i = 0; i < RAIN; i++) {
          const o = i * 6;
          const dy = fall * (0.8 + ((i * 37) % 10) / 18);
          p[o + 1] -= dy;
          p[o + 4] -= dy;
          p[o] += drift;
          p[o + 3] += drift;
          p[o + 3] = p[o] + lean;
          p[o + 4] = p[o + 1] + STREAK;
          if (p[o + 1] < 0) {
            const x = -10 + Math.random() * 20;
            const yy = 11 + Math.random();
            p[o] = x;
            p[o + 1] = yy;
            p[o + 3] = x + lean;
            p[o + 4] = yy + STREAK;
          }
          if (p[o] > 10) {
            p[o] -= 20;
            p[o + 3] -= 20;
          }
        }
        rainGeom.attributes.position.needsUpdate = true;
      }
      boltMat.opacity = flash;

      // Butterfly: a calm wandering flight while the day lasts; buffeted as
      // the wind rises; finally caught by a gust and carried out of frame.
      const agitation = smooth(0.3, 0.75, storm);
      const exit = smooth(0.78, 0.93, storm);
      const fx = Math.sin(t * 0.45) * 1.5 + Math.sin(t * 1.7) * 0.5 * agitation + exit * exit * 14;
      const fy = 1.55 + Math.sin(t * 1.1) * (0.3 + agitation * 0.3) + exit * 3.2;
      const fz = 0.9 + Math.cos(t * 0.3) * 0.7 - exit * 2;
      butterfly.visible = exit < 1;
      butterfly.position.set(fx, fy, fz);
      const flapHz = 9 + agitation * 6 + exit * 8;
      const rawFlap = Math.sin(t * flapHz);
      // Downstroke faster than upstroke — the asymmetry sells the flight.
      const flap = (rawFlap > 0 ? Math.pow(rawFlap, 0.7) : rawFlap) * (0.95 + exit * 0.2);
      wingR.rotation.z = flap;
      wingL.rotation.z = -flap;
      butterfly.position.y += Math.abs(flap) * 0.04; // flap-linked bob
      // Face where it is actually going: heading from the measured velocity
      // (the group's nose is -z), smoothed so turns are gradual banks rather
      // than snaps. An analytic guess here is how a butterfly ends up flying
      // backwards.
      const vx = (fx - prevFx) / Math.max(dt, 1e-3);
      const vz = (fz - prevFz) / Math.max(dt, 1e-3);
      prevFx = fx;
      prevFz = fz;
      if (vx * vx + vz * vz > 0.005) {
        const target = Math.atan2(-vx, -vz);
        let dH = target - headingSmooth;
        dH = Math.atan2(Math.sin(dH), Math.cos(dH));
        headingSmooth += dH * Math.min(1, dt * 5);
      }
      butterfly.rotation.y = headingSmooth;
      // Bank into turns; tumble once the gust has it.
      butterfly.rotation.z =
        Math.sin(t * 0.9) * 0.14 * (1 + agitation) + exit * Math.sin(t * 14) * 0.6;

      // Camera: a slow breath; pulls back slightly as the storm grows, and
      // shudders for an instant on each strike.
      camera.position.x = Math.sin(t * 0.05) * 0.25 + flash * 0.05 * Math.sin(t * 70);
      camera.position.y = 1.6 + storm * 0.25;
      camera.position.z = 6 + storm * 0.8;
      camera.lookAt(0, 1.35, 0);
      if (vignetteEl) vignetteEl.style.opacity = storm * 0.6;

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
      sky.geometry.dispose();
      sky.material.dispose();
      rainGeom.dispose();
      rainMat.dispose();
      bolt.geometry.dispose();
      boltMat.dispose();
      wingMap.dispose();
      antGeom.dispose();
      puffTex.dispose();
    };
  });
</script>

<div
  class="hero3d"
  bind:this={wrap}
  role="img"
  aria-label="Animated scene: a yellow butterfly flutters over a sunny meadow. As you scroll, clouds gather and darken, wind bends the grass, rain slants in and lightning flashes — a gust carries the butterfly away and the meadow becomes a thunderstorm."
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
      <div class="vignette" bind:this={vignetteEl} aria-hidden="true"></div>
      {#each cards as card, i}
        <div class="hero3d-card" class:title-card={card.title} bind:this={cardEls[i]}>
          {#if card.eyebrow}<p class="eyebrow">{card.eyebrow}</p>{/if}
          {#if card.title}<h1>{card.title}</h1>{/if}
          {#if card.body}<p class="card-body">{card.body}</p>{/if}
          {#if card.hint}<p class="scroll-hint">Scroll<span class="scroll-tick">|</span></p>{/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .hero3d {
    /* Scroll runway: the sticky viewport inside plays the storm as the
       reader moves through it. Short enough to stay one clean beat —
       butterfly, then storm. */
    height: 320svh;
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
  .vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    background: radial-gradient(ellipse at center, transparent 45%, rgba(5, 8, 14, 0.55) 100%);
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
    text-shadow: 0 1px 10px rgba(12, 22, 38, 0.5);
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
    color: rgba(255, 255, 255, 0.8);
    margin: 26px 0 0;
    text-shadow: 0 1px 10px rgba(12, 22, 38, 0.5);
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
