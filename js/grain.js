// Filmkorn: springt alle 120 ms um einen Zufallsversatz, pausiert im Hintergrund.
// Versatz per Transform (composited), nicht per background-position: Letzteres
// zeichnet die ganze Ebene neu, achtmal pro Sekunde, was auf dem iPhone die GPU
// überlastet hat.
export function startGrain(el) {
  let id = 0;
  const tick = () => {
    const x = Math.round((Math.random() - 0.5) * 300);
    const y = Math.round((Math.random() - 0.5) * 300);
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const start = () => { if (!id) id = setInterval(tick, 120); };
  const stop = () => { clearInterval(id); id = 0; };
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
}
