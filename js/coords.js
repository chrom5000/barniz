// Koordinaten-Anzeige unten links: läuft je Szene vom vorigen Ort zum eigenen.
import { SCENES, sceneIndex } from './scenes.js';
import { lerp } from './levels.js';

export const DASHES = '— — ′ — ″ N  — — ′ — ″ E';

const pad = n => String(n).padStart(2, '0');

function toSeconds([d, m, s]) {
  return d * 3600 + m * 60 + s;
}

function fromSeconds(total) {
  const t = Math.round(total);
  return [Math.floor(t / 3600), Math.floor((t % 3600) / 60), t % 60];
}

export function formatCoords({ lat, lon }) {
  return `${lat[0]}°${pad(lat[1])}′${pad(lat[2])}″ N  ${lon[0]}°${pad(lon[1])}′${pad(lon[2])}″ E`;
}

export function lerpCoords(a, b, t) {
  return {
    lat: fromSeconds(lerp(toSeconds(a.lat), toSeconds(b.lat), t)),
    lon: fromSeconds(lerp(toSeconds(a.lon), toSeconds(b.lon), t)),
  };
}

export function coordsFor(id, p) {
  const i = sceneIndex(id);
  if (i < 0) return DASHES;
  const scene = SCENES[i];
  if (scene.id === 'kaenguru') {
    return p >= 0.45 ? '?' : formatCoords(SCENES[i - 1].coords);
  }
  if (!scene.coords) return DASHES;
  const prev = SCENES[i - 1]?.coords ?? scene.coords;
  return formatCoords(lerpCoords(prev, scene.coords, p));
}
