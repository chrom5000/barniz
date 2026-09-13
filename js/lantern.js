// Lichtkegel am Zeiger (Desktop) bzw. Finger (Touch). Schreibt --lx/--ly in px
// auf das Wurzelelement; CSS positioniert Schein und Masken damit.
// Nichts hängt funktional davon ab (Spec Abschnitt 3).
export function createLantern() {
  const root = document.documentElement;
  const fine = matchMedia('(pointer: fine)').matches;
  const rest = () => ({ x: innerWidth * 0.5, y: innerHeight * 0.58 });
  let target = rest();
  const pos = { ...target };
  let restTimer = 0;

  if (fine) {
    addEventListener('pointermove', e => { target = { x: e.clientX, y: e.clientY }; }, { passive: true });
  }
  addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (!t) return;
    target = { x: t.clientX, y: t.clientY };
    clearTimeout(restTimer);
  }, { passive: true });
  addEventListener('touchend', () => {
    clearTimeout(restTimer);
    restTimer = setTimeout(() => { target = rest(); }, 1500);
  }, { passive: true });
  addEventListener('resize', () => { if (!fine) target = rest(); });

  function tick() {
    pos.x += (target.x - pos.x) * 0.12;
    pos.y += (target.y - pos.y) * 0.12;
    root.style.setProperty('--lx', `${pos.x.toFixed(1)}px`);
    root.style.setProperty('--ly', `${pos.y.toFixed(1)}px`);
    requestAnimationFrame(tick);
  }

  root.classList.add('has-lantern');
  tick();
}
