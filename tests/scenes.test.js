import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCENES, BLEND_START, sceneIndex, sceneById } from '../js/scenes.js';

const ORDER = ['prolog', 'schlei', 'damm', 'lange-strasse', 'faehrberg', 'tuer', 'drueben', 'kaenguru'];

test('acht Szenen in Spec-Reihenfolge', () => {
  assert.deepEqual(SCENES.map(s => s.id), ORDER);
});

test('jede Szene hat Höhe, Schnee, Wind, Audio-Pegel', () => {
  for (const s of SCENES) {
    assert.ok(s.height >= 150, `${s.id}: Höhe ${s.height}`);
    assert.equal(typeof s.snow.density, 'number');
    assert.equal(typeof s.snow.wind, 'number');
    for (const k of ['wind', 'water', 'bass']) {
      assert.ok(s.audio[k] >= 0 && s.audio[k] <= 1, `${s.id}.audio.${k}`);
    }
  }
});

test('Prolog und Känguru haben keine Koordinaten, alle anderen schon', () => {
  for (const s of SCENES) {
    if (s.id === 'prolog' || s.id === 'kaenguru') assert.equal(s.coords, null);
    else {
      assert.equal(s.coords.lat.length, 3);
      assert.equal(s.coords.lon.length, 3);
    }
  }
});

test('Rampen: Prolog blendet Schnee ab 0.55 ein, Känguru ab 0.45 aus', () => {
  assert.equal(sceneById('prolog').snow.rampIn, 0.55);
  assert.equal(sceneById('kaenguru').snow.rampOut, 0.45);
});

test('Tür hat den höchsten Bass, Damm den stärksten Wind', () => {
  const maxBy = k => SCENES.reduce((a, b) => (b.audio[k] > a.audio[k] ? b : a));
  assert.equal(maxBy('bass').id, 'tuer');
  assert.equal(maxBy('wind').id, 'damm');
});

test('sceneIndex und sceneById', () => {
  assert.equal(sceneIndex('prolog'), 0);
  assert.equal(sceneIndex('kaenguru'), 7);
  assert.equal(sceneIndex('nirgendwo'), -1);
  assert.equal(sceneById('damm').label, 'Damm');
  assert.equal(BLEND_START, 0.85);
});
