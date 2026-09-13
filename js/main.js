import { createScrollEngine } from './scroll.js';
import { coordsFor } from './coords.js';
import { sceneById } from './scenes.js';
import { createTypewriter } from './typewriter.js';
import { createSnow } from './snow.js';
import { snowFor, audioFor } from './levels.js';
import { createAudio } from './audio.js';
import { createLantern } from './lantern.js';
import { startGrain } from './grain.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduced', reduced);

const coordsEl = document.querySelector('.coords');
const labelEl = document.querySelector('.scene-label');
const typedEl = document.querySelector('.frage__typed');
const liveEl = document.getElementById('frage-live');

const FRAGE = 'Gibt es Barniz?';
const frage = createTypewriter({
  text: FRAGE,
  totalMs: 2200,
  write(partial, done) {
    typedEl.textContent = partial;
    typedEl.classList.toggle('is-done', done);
  },
});
if (reduced) {
  // Ohne Tipp-Effekt: Frage steht sofort, CSS blendet sie ab p 0.30 ein.
  typedEl.textContent = FRAGE;
  typedEl.classList.add('is-done');
}

const snow = reduced ? null : createSnow(document.querySelector('.snow'));
const audio = createAudio(document.querySelector('.hud--sound'));

const engine = createScrollEngine({
  sections: document.querySelectorAll('.scene'),
  onFrame({ current, p, velocity }) {
    snow?.setTarget(snowFor(current, p), velocity);
    audio.setLevels(audioFor(current, p));
    coordsEl.textContent = coordsFor(current, p);
    labelEl.textContent = sceneById(current)?.label ?? '';
    if (!reduced && current === 'kaenguru' && p >= 0.85 && frage.start()) {
      liveEl.textContent = FRAGE;
    }
  },
});

if (!reduced) {
  createLantern();
  startGrain(document.querySelector('.grain'));
}

window.barniz = { jump: engine.jump };
