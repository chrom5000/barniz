import { createScrollEngine } from './scroll.js';
import { coordsFor } from './coords.js';
import { sceneById } from './scenes.js';
import { createTypewriter } from './typewriter.js';
import { createSnow } from './snow.js';
import { snowFor } from './levels.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduced', reduced);

const coordsEl = document.querySelector('.coords');
const labelEl = document.querySelector('.scene-label');
const typedEl = document.querySelector('.frage__typed');
const liveEl = document.getElementById('frage-live');
const snow = reduced ? null : createSnow(document.querySelector('.snow'));

const FRAGE = 'Gibt es Barniz?';
const frage = createTypewriter({
  text: FRAGE,
  totalMs: 2200,
  write(partial, done) {
    typedEl.textContent = partial;
    typedEl.classList.toggle('is-done', done);
  },
});

const engine = createScrollEngine({
  sections: document.querySelectorAll('.scene'),
  onFrame({ current, p, velocity }) {
    snow?.setTarget(snowFor(current, p), velocity);
    coordsEl.textContent = coordsFor(current, p);
    labelEl.textContent = sceneById(current)?.label ?? '';
    if (current === 'kaenguru' && p >= 0.85 && frage.start()) {
      liveEl.textContent = FRAGE;
    }
  },
});

window.barniz = { jump: engine.jump };
