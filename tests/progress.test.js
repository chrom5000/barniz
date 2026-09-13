import { test } from 'node:test';
import assert from 'node:assert/strict';
import { progress, sceneState, clamp } from '../js/progress.js';

test('clamp begrenzt auf [lo, hi]', () => {
  assert.equal(clamp(-1, 0, 1), 0);
  assert.equal(clamp(2, 0, 1), 1);
  assert.equal(clamp(0.3, 0, 1), 0.3);
});

test('progress ist 0 vor der Szene, 1 danach, linear dazwischen', () => {
  assert.equal(progress(1000, 2000, 500), 0);
  assert.equal(progress(1000, 2000, 1000), 0);
  assert.equal(progress(1000, 2000, 2000), 0.5);
  assert.equal(progress(1000, 2000, 3000), 1);
  assert.equal(progress(1000, 2000, 9000), 1);
});

test('progress ist monoton steigend', () => {
  let prev = -1;
  for (let y = 0; y <= 4000; y += 50) {
    const p = progress(1000, 2000, y);
    assert.ok(p >= prev, `bei ${y}: ${p} < ${prev}`);
    prev = p;
  }
});

test('progress mit range 0 springt bei top von 0 auf 1', () => {
  assert.equal(progress(1000, 0, 999), 0);
  assert.equal(progress(1000, 0, 1000), 1);
});

test('sceneState: vor, in und nach dem Abschnitt', () => {
  assert.equal(sceneState(1000, 2000, 999), 'before');
  assert.equal(sceneState(1000, 2000, 1000), 'active');
  assert.equal(sceneState(1000, 2000, 2999), 'active');
  assert.equal(sceneState(1000, 2000, 3000), 'after');
});

test('sceneState: erste Szene ist auch bei negativem scrollY aktiv', () => {
  assert.equal(sceneState(0, 1500, -80, { first: true }), 'active');
  assert.equal(sceneState(0, 1500, -80), 'before');
});

test('sceneState: letzte Szene bleibt über ihr Ende hinaus aktiv', () => {
  assert.equal(sceneState(5000, 2000, 7500, { last: true }), 'active');
  assert.equal(sceneState(5000, 2000, 7500), 'after');
  assert.equal(sceneState(5000, 2000, 4999, { last: true }), 'before');
});
