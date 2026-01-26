(() => {
  const canvas = document.getElementById("bg-waves");
  const ctx = canvas.getContext("2d", { alpha: true });

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let w = 0, h = 0;

  const pointer = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    active: false,
    strength: 0
  };

  const waves = {
    count: 10,
    spacing: 36,
    amp: 18,
    speed: 0.55,
    freq: 0.0105,
    noise: 0.35,
    lineWidth: 1
  };

  function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function hexToRgba(hex, a) {
    const h = hex.replace("#", "").trim();
    const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    const n = parseInt(full, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = Math.floor(rect.width);
    h = Math.floor(rect.height);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function onMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    pointer.tx = x;
    pointer.ty = y;
    pointer.active = true;
    pointer.strength = 1;
  }

  function onLeave() {
    pointer.active = false;
  }

  function onTouch(e) {
    if (!e.touches || !e.touches[0]) return;
    pointer.tx = e.touches[0].clientX;
    pointer.ty = e.touches[0].clientY;
    pointer.active = true;
    pointer.strength = 1;
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseleave", onLeave, { passive: true });
  window.addEventListener("touchstart", onTouch, { passive: true });
  window.addEventListener("touchmove", onTouch, { passive: true });
  window.addEventListener("touchend", onLeave, { passive: true });

  resize();

  const teal = cssVar("--teal", "#78BAC2");
  const blue = cssVar("--blue", "#4D9AB9");

  function draw(t) {
    const time = t * 0.001;

    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;
    pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * 0.06;

    ctx.clearRect(0, 0, w, h);

    const baseY = h * 0.18;
    const totalHeight = Math.max(h * 0.8, waves.count * waves.spacing + 160);
    const startY = clamp(baseY, 40, h - totalHeight - 40);

    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, hexToRgba(teal, 0.75));
    grad.addColorStop(1, hexToRgba(blue, 0.75));

    for (let i = 0; i < waves.count; i++) {
      const y0 = startY + i * waves.spacing;

      const alpha = 0.10 + (i / (waves.count - 1)) * 0.12;
      ctx.strokeStyle = grad;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = waves.lineWidth;

      ctx.beginPath();

      const phase = i * 0.65 + time * waves.speed;
      const amp = waves.amp * (0.75 + i * 0.04);

      const rippleRadius = 220;
      const ripplePower = 34 * pointer.strength;

      for (let x = 0; x <= w; x += 8) {
        const nx = x * waves.freq;

        const yWave =
          Math.sin(nx + phase) * amp +
          Math.sin(nx * 0.55 + phase * 1.2) * (amp * 0.55);

        const drift = Math.sin((nx * 0.25) + time * 0.35 + i) * (amp * waves.noise);

        let y = y0 + yWave + drift;

        if (pointer.strength > 0.02) {
          const dx = x - pointer.x;
          const dy = y0 - pointer.y;
          const dist = Math.hypot(dx, dy);

          if (dist < rippleRadius) {
            const k = 1 - dist / rippleRadius;
            const rip = Math.sin(dist * 0.06 - time * 3.2) * ripplePower * k * k;
            y += rip;
          }
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
