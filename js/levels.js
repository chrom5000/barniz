// Zielwerte für Schnee und Ton je Szene und Fortschritt p (0–1).
// Ab BLEND_START wird linear zur nächsten Szene übergeblendet (Spec 3/4).
import { SCENES, sceneIndex, BLEND_START } from './scenes.js';

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

function blendT(p) {
  return p <= BLEND_START ? 0 : (p - BLEND_START) / (1 - BLEND_START);
}

function ownSnow(scene, p) {
  const { density, wind, rampIn, rampOut } = scene.snow;
  let d = density;
  if (rampIn !== undefined) d = p <= rampIn ? 0 : density * (p - rampIn) / (1 - rampIn);
  if (rampOut !== undefined) d = p <= rampOut ? density : density * (1 - (p - rampOut) / (1 - rampOut));
  return { density: d, wind };
}

function blended(id, p, own, keys) {
  const i = sceneIndex(id);
  if (i < 0) return Object.fromEntries(keys.map(k => [k, 0]));
  const here = own(SCENES[i], p);
  const next = SCENES[i + 1];
  if (!next) return here;
  const t = blendT(p);
  const there = own(next, 0);
  return Object.fromEntries(keys.map(k => [k, lerp(here[k], there[k], t)]));
}

export function snowFor(id, p) {
  return blended(id, p, ownSnow, ['density', 'wind']);
}

export function audioFor(id, p) {
  return blended(id, p, scene => scene.audio, ['wind', 'water', 'bass']);
}
