import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCENES } from '../js/scenes.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const body = html.slice(html.indexOf('<body'), html.indexOf('</body>'));
const text = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');

test('Szenen stehen in Spec-Reihenfolge im Markup', () => {
  const ids = [...body.matchAll(/data-scene="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(ids, SCENES.map(s => s.id));
});

test('der Name fällt im Body genau einmal', () => {
  assert.equal((text.match(/Barniz/g) ?? []).length, 1);
});

test('Szenenhöhen im Markup entsprechen der Konfiguration', () => {
  for (const s of SCENES) {
    const re = new RegExp(`data-scene="${s.id}"[^>]*--h:\\s*${s.height}\\b`);
    assert.ok(re.test(body), `${s.id}: --h: ${s.height} fehlt`);
  }
});

test('keine absoluten Pfade in href/src', () => {
  const abs = [...html.matchAll(/(?:href|src)="\/(?!\/)[^"]*"/g)].map(m => m[0]);
  assert.deepEqual(abs, []);
});

test('Sprache, Titel, Beschreibung', () => {
  assert.match(html, /<html lang="de">/);
  assert.match(html, /<title>Barniz\?<\/title>/);
  assert.match(html, /name="description" content="Ein Winter an der Schlei\. Und eine Frage\."/);
});
