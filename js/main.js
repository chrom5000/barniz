import { createScrollEngine } from './scroll.js';
import { coordsFor } from './coords.js';
import { sceneById } from './scenes.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduced', reduced);

const coordsEl = document.querySelector('.coords');
const labelEl = document.querySelector('.scene-label');

const engine = createScrollEngine({
  sections: document.querySelectorAll('.scene'),
  onFrame({ current, p }) {
    coordsEl.textContent = coordsFor(current, p);
    labelEl.textContent = sceneById(current)?.label ?? '';
  },
});

window.barniz = { jump: engine.jump };
