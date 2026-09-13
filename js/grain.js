// Filmkorn: springt alle 120 ms um einen Zufallsversatz, pausiert im Hintergrund.
export function startGrain(el) {
  let id = 0;
  const tick = () => {
    el.style.backgroundPosition = `${Math.round(Math.random() * 300)}px ${Math.round(Math.random() * 300)}px`;
  };
  const start = () => { if (!id) id = setInterval(tick, 120); };
  const stop = () => { clearInterval(id); id = 0; };
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
}
