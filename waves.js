(() => {
  const canvas = document.getElementById("bg-waves");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let w = 0;
  let h = 0;

  const pointer = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    active: false,
    strength: 0
  };

  const waves = {
    count: 12,
    spacing: 34,
    amp: 16,
    speed: 0.45,
    freq: 0.010,
    noise: 0.30,
    lineWidth: 0.9
  };

  function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return v || fallback;
  }

  function hexToRgba(hex, a) {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    const n = parseInt(full, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function onMove(e) {
    pointer.tx = e.clientX;
    pointer.ty = e.clientY;
    pointer.active = true;
    pointer.strength = 1;
  }

  function onLeave() {
    pointer.active = false;
  }

  function onTouch(e) {
    if (!e.touches[0]) return;
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

    const startY = Math.max(60, h * 0.18);
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, hexToRgba(teal, 0.90));
    grad.addColorStop(1, hexToRgba(blue, 0.90));

    for (let i = 0; i < waves.count; i++) {
      const yBase = startY + i * waves.spacing;
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.globalAlpha = 0.14 + i * 0.012;
      ctx.lineWidth = waves.lineWidth;

      const phase = time * waves.speed + i * 0.6;
      const rippleRadius = 220;
      const ripplePower = 22 * pointer.strength;

      for (let x = 0; x <= w; x += 8) {
        const nx = x * waves.freq;
        let y =
          yBase +
          Math.sin(nx + phase) * waves.amp +
          Math.sin(nx * 0.6 + phase) * waves.amp * 0.4;

        if (pointer.strength > 0.01) {
          const dx = x - pointer.x;
          const dy = yBase - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < rippleRadius) {
            const k = 1 - dist / rippleRadius;
            y += Math.sin(dist * 0.05 - time * 3) * ripplePower * k * k;
          }
        }

        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
