// Scroll-Motor: misst die Szenen, schreibt --p und data-state, meldet die
// aktive Szene pro Frame. Rechnet höchstens einmal pro Animationsframe.
import { progress, sceneState } from './progress.js';

export function createScrollEngine({ sections, onFrame }) {
  const items = [...sections].map((el, i, arr) => ({
    el,
    id: el.dataset.scene,
    top: 0,
    height: 0,
    state: null,
    p: -1,
    first: i === 0,
    last: i === arr.length - 1,
  }));
  let ticking = false;
  let lastY = window.scrollY;
  let lastT = performance.now();
  let velocity = 0;

  function measure() {
    for (const it of items) {
      const rect = it.el.getBoundingClientRect();
      it.top = Math.round(rect.top + window.scrollY);
      it.height = Math.round(rect.height);
    }
    update();
  }

  function update() {
    ticking = false;
    const y = window.scrollY;
    const now = performance.now();
    const dt = Math.max(1, now - lastT) / 1000;
    velocity += ((y - lastY) / dt - velocity) * 0.25;
    lastY = y;
    lastT = now;
    document.documentElement.style.setProperty('--vel', velocity.toFixed(1));
    const vh = window.innerHeight;
    let current = null;
    for (const it of items) {
      const state = sceneState(it.top, it.height, y, { first: it.first, last: it.last });
      const range = it.last ? Math.max(1, it.height - vh) : it.height;
      const p = state === 'active' ? progress(it.top, range, y) : (state === 'before' ? 0 : 1);
      if (state !== it.state) {
        it.el.dataset.state = state;
        it.state = state;
      }
      if (p !== it.p) {
        it.el.style.setProperty('--p', p.toFixed(4));
        it.p = p;
      }
      if (state === 'active') current = { id: it.id, p };
    }
    if (current) onFrame({ current: current.id, p: current.p, velocity });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  /** Springt zu Szene `id` bei Fortschritt `p` – für Prüfung und Entwicklung. */
  function jump(id, p = 0) {
    const it = items.find(x => x.id === id);
    if (!it) return;
    const range = it.last ? Math.max(1, it.height - window.innerHeight) : it.height;
    window.scrollTo(0, it.top + range * p);
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', measure);
  addEventListener('load', measure);
  measure();

  return { measure, jump };
}
