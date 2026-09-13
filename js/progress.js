// Reine Rechenfunktionen für den Scroll-Motor. Kein DOM.

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Fortschritt einer Szene: 0 an ihrem Anfang (top), 1 nach `range` Pixeln.
 * `range` ist normalerweise die Abschnittshöhe; bei der letzten Szene
 * `Abschnittshöhe − Viewporthöhe`, damit 1 vor der Fußzeile erreichbar ist.
 */
export function progress(top, range, scrollY) {
  if (range <= 0) return scrollY < top ? 0 : 1;
  return clamp((scrollY - top) / range, 0, 1);
}

/**
 * Genau eine Szene ist aktiv: die, deren Abschnitt scrollY enthält.
 * Die erste Szene fängt Überscrollen nach oben ab, die letzte bleibt
 * hinter der Fußzeile stehen.
 */
export function sceneState(top, height, scrollY, { first = false, last = false } = {}) {
  if (scrollY < top) return first ? 'active' : 'before';
  if (scrollY >= top + height) return last ? 'active' : 'after';
  return 'active';
}
