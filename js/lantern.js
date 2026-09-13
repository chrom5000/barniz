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
  let rafId = 0;

  function write() {
    root.style.setProperty('--lx', `${pos.x.toFixed(1)}px`);
    root.style.setProperty('--ly', `${pos.y.toFixed(1)}px`);
  }

  function tick() {
    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
      pos.x = target.x;
      pos.y = target.y;
      write();
      rafId = 0;
      return;
    }
    pos.x += dx * 0.12;
    pos.y += dy * 0.12;
    write();
    rafId = requestAnimationFrame(tick);
  }

  function wake() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  if (fine) {
    addEventListener('pointermove', e => { target = { x: e.clientX, y: e.clientY }; wake(); }, { passive: true });
  }
  addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (!t) return;
    target = { x: t.clientX, y: t.clientY };
    clearTimeout(restTimer);
    wake();
  }, { passive: true });
  addEventListener('touchend', () => {
    clearTimeout(restTimer);
    restTimer = setTimeout(() => { target = rest(); wake(); }, 1500);
  }, { passive: true });
  addEventListener('resize', () => { if (!fine) { target = rest(); wake(); } });

  root.classList.add('has-lantern');
  write();
  wake();
}
