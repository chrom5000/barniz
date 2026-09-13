import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const size = p => statSync(new URL(p, root)).size;
const dirSize = (dir, filter = () => true) =>
  readdirSync(new URL(dir, root)).filter(filter).reduce((sum, f) => sum + size(`${dir}${f}`), 0);

test('Seite inklusive Schriften unter 300 kB', () => {
  const total =
    size('index.html') +
    size('assets/favicon.svg') +
    dirSize('css/') +
    dirSize('js/') +
    dirSize('assets/fonts/', f => f.endsWith('.woff2'));
  assert.ok(total < 300_000, `Gesamt ${total} Bytes`);
});

test('Impressum-Platzhalter existiert und verlinkt zurück', () => {
  assert.ok(size('impressum.html') > 200);
  const html = readFileSync(new URL('impressum.html', root), 'utf8');
  assert.ok(html.includes('href="./"'), 'Rücklink fehlt');
});
