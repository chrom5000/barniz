// Schnee auf einem fixen Canvas. Dichte und Wind kommen je Frame aus
// levels.snowFor, Böen aus der Scrollgeschwindigkeit (Spec Abschnitt 3).
// Auf Modulebene kein DOM-Zugriff, damit flakeCount unter Node testbar ist.
import { clamp } from './progress.js';

const AREA_PER_FLAKE = 6000;
const MAX_FLAKES = 400;
const GUST_TAU = 0.8;

export function flakeCount(w, h, density) {
  return Math.min(MAX_FLAKES, Math.round((w * h / AREA_PER_FLAKE) * density));
}

export function createSnow(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let flakes = [];
  let target = { density: 0, wind: 0 };
  let gust = 0;
  let last = performance.now();
  let running = true;

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#9FB4C7';
  }

  function spawn(fromTop) {
    return {
      x: Math.random() * w,
      y: fromTop ? -10 : Math.random() * h,
      r: 0.8 + Math.random() * 1.8,
      vy: 25 + Math.random() * 45,
      phase: Math.random() * Math.PI * 2,
      drift: 8 + Math.random() * 14,
      a: 0.5 + Math.random() * 0.4,
    };
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    gust -= gust * (dt / GUST_TAU);

    const n = flakeCount(w, h, target.density);
    while (flakes.length < n) flakes.push(spawn(true));
    let excess = flakes.length - n;

    const wind = target.wind + gust;
    ctx.clearRect(0, 0, w, h);
    const keep = [];
    for (const f of flakes) {
      f.phase += dt * 1.5;
      f.x += (wind + Math.sin(f.phase) * f.drift) * dt;
      f.y += f.vy * dt;
      if (f.y > h + 10) {
        if (excess > 0) { excess--; continue; }
        Object.assign(f, spawn(true));
      }
      if (f.x < -10) f.x = w + 10;
      else if (f.x > w + 10) f.x = -10;
      ctx.globalAlpha = f.a;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      keep.push(f);
    }
    flakes = keep;
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });
  addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);

  return {
    /** Zielwerte der aktiven Szene; velocity in px/s, positiv = nach unten gescrollt. */
    setTarget(next, velocity = 0) {
      target = next;
      const g = clamp(-velocity * 0.4, -120, 120);
      if (Math.abs(g) > Math.abs(gust)) gust = g;
    },
  };
}
