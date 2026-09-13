import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Regressionsschutz für den iOS-Absturz (GPU-Speicher): inaktive Szenen dürfen
// keine Compositing-Ebenen halten, Vollbild-Blendmodi und die maskierten
// Laternen-Kopien sind auf Touch-Geräten tabu.
const scenes = readFileSync(new URL('../css/scenes.css', import.meta.url), 'utf8');
const base = readFileSync(new URL('../css/base.css', import.meta.url), 'utf8');

test('inaktive Bühnen und Textzeilen sind display: none, nicht nur unsichtbar', () => {
  assert.match(scenes, /\.stage,\s*\.lines\s*\{[^}]*display:\s*none/);
  assert.doesNotMatch(scenes, /\.stage,\s*\.lines\s*\{[^}]*visibility:\s*hidden/);
});

test('keine Vollbild-Blendmodi (mix-blend-mode) im CSS', () => {
  assert.equal((base + scenes).match(/mix-blend-mode/g), null);
});

test('auf Touch-Geräten keine Laternen-Kopien und kein Text-Blur', () => {
  const coarse = scenes.match(/@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(coarse, 'kein @media (pointer: coarse)-Block');
  assert.match(coarse[1], /\.lit\s*\{[^}]*display:\s*none/);
  assert.match(coarse[1], /\.line\s*\{[^}]*filter:\s*none/);
});

test('Korn bewegt sich per Transform, nicht per Repaint', () => {
  const grain = readFileSync(new URL('../js/grain.js', import.meta.url), 'utf8');
  assert.match(grain, /style\.transform/);
  assert.doesNotMatch(grain, /backgroundPosition/);
});
