import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerp, snowFor, audioFor } from '../js/levels.js';

const close = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} ≠ ${b}`);

test('lerp', () => {
  assert.equal(lerp(0, 10, 0.25), 2.5);
  assert.equal(lerp(5, 5, 0.9), 5);
});

test('Prolog: kein Schnee vor 0.55, danach linear bis zum Szenenwert', () => {
  close(snowFor('prolog', 0.2).density, 0, 'bei 0.2');
  close(snowFor('prolog', 0.55).density, 0, 'bei 0.55');
  // Mitte der Rampe (0.775): halbe Dichte 0.3, noch keine Überblendung
  close(snowFor('prolog', 0.775).density, 0.3, 'bei 0.775');
});

test('Überblendung ab 0.85 zur nächsten Szene', () => {
  // damm (1.2, -60) → lange-strasse (0.7, -15), bei p 0.925 ist t = 0.5
  const s = snowFor('damm', 0.925);
  close(s.density, 0.95, 'Dichte');
  close(s.wind, -37.5, 'Wind');
  const a = audioFor('tuer', 0.925); // tuer bass 0.45 → drueben 0.05
  close(a.bass, 0.25, 'Bass');
  close(a.wind, 0.25, 'Wind'); // 0.10 → 0.40
});

test('vor 0.85 gilt der eigene Wert unverändert', () => {
  assert.deepEqual(snowFor('damm', 0.5), { density: 1.2, wind: -60 });
  assert.deepEqual(audioFor('tuer', 0.5), { wind: 0.10, water: 0.05, bass: 0.45 });
});

test('Känguru: Schnee ab 0.45 linear auf 0, keine Überblendung danach', () => {
  close(snowFor('kaenguru', 0.3).density, 0.5, 'bei 0.3');
  close(snowFor('kaenguru', 0.725).density, 0.25, 'bei 0.725');
  close(snowFor('kaenguru', 1).density, 0, 'bei 1');
  assert.deepEqual(audioFor('kaenguru', 1), { wind: 0.30, water: 0, bass: 0 });
});

test('bei p 1 gilt vollständig die nächste Szene', () => {
  const s = snowFor('prolog', 1);
  close(s.density, 0.8, 'Dichte');
  close(s.wind, -20, 'Wind');
});

test('unbekannte Szene liefert Nullwerte', () => {
  assert.deepEqual(snowFor('nirgendwo', 0.5), { density: 0, wind: 0 });
  assert.deepEqual(audioFor('nirgendwo', 0.5), { wind: 0, water: 0, bass: 0 });
});
