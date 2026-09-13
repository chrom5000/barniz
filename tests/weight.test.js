import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const size = p => statSync(new URL(p, root)).size;
const dirSize = (dir, filter = () => true) =>
  readdirSync(new URL(dir, root)).filter(filter).reduce((sum, f) => sum + size(`${dir}${f}`), 0);

test('Ausgelieferte Seite je Ausrichtung unter 700 kB (ein Plattensatz; ohne og.png und tools/)', () => {
  const basis =
    size('index.html') +
    size('assets/favicon.svg') +
    size('assets/kaenguru.png') +
    dirSize('css/') +
    dirSize('js/') +
    dirSize('assets/fonts/', f => f.endsWith('.woff2'));
  const quer = dirSize('assets/fotos/', f => f.endsWith('.jpg') && !f.endsWith('-h.jpg'));
  const hoch = dirSize('assets/fotos/', f => f.endsWith('-h.jpg'));
  assert.ok(basis + quer < 700_000, `quer ${basis + quer} Bytes`);
  assert.ok(basis + hoch < 700_000, `hochkant ${basis + hoch} Bytes`);
});

test('Bildnachweise nennen jedes Foto und die Känguru-Silhouette', () => {
  const html = readFileSync(new URL('bildnachweis.html', root), 'utf8');
  for (const f of readdirSync(new URL('assets/fotos/', root))) {
    assert.ok(f.endsWith('.jpg'), `fremde Datei in assets/fotos: ${f}`);
  }
  for (const wort of ['Schlei', 'Damm', 'Lange Straße', 'Fährberg', 'Drüben', 'Känguru', 'creativecommons.org']) {
    assert.ok(html.includes(wort), `Bildnachweis ohne „${wort}“`);
  }
});

test('Impressum-Platzhalter existiert und verlinkt zurück', () => {
  assert.ok(size('impressum.html') > 200);
  const html = readFileSync(new URL('impressum.html', root), 'utf8');
  assert.ok(html.includes('href="./"'), 'Rücklink fehlt');
});
