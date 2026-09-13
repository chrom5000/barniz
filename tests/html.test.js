import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { SCENES } from '../js/scenes.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const body = html.slice(html.indexOf('<body'), html.indexOf('</body>'));
const text = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');

// Textzeilen je Szene mit Einblendpunkt `--in`, wörtlich aus Spec Abschnitt 2.
const LINES = {
  prolog: [[0.10, 'Was wäre, wenn …']],
  schlei: [
    [0.15, 'Ein Winter an der Schlei.'],
    [0.40, 'Nördliches Ufer. Angeln.'],
    [0.60, 'Irgendwo hier liegt eine Halbinsel.'],
  ],
  damm: [
    [0.15, 'Eine Straße, die aufs Wasser führt.'],
    [0.45, 'Am Ende: die kleinste Stadt Deutschlands.'],
  ],
  'lange-strasse': [
    [0.15, 'Rund dreihundert Menschen. Eine Straße. Eine Kirche.'],
    [0.45, 'Und im Winter: sehr viel Ruhe.'],
    [0.65, 'Was wäre, wenn …'],
  ],
  faehrberg: [
    [0.15, 'Am Fährberg steht ein Haus.'],
    [0.40, 'Es steht leer.'],
    [0.70, 'Oder?'],
  ],
  tuer: [
    [0.12, 'Vielleicht Sessel, die schon drei Leben hatten.'],
    [0.32, 'Vielleicht ein Plattenspieler.'],
    [0.52, 'Vielleicht ein Drink, den es so nur hier gäbe.'],
    [0.72, 'Vielleicht gar nichts.'],
  ],
  drueben: [
    [0.15, 'Drüben: Schwansen.'],
    [0.35, 'Hier: Angeln.'],
    [0.55, 'Dazwischen: das Wasser.'],
    [0.72, 'Und eine Frage.'],
  ],
  kaenguru: [
    [0.50, 'Ein Känguru an der Schlei ergibt keinen Sinn.'],
    [0.65, 'Eine Bar in Arnis im Winter auch nicht.'],
  ],
};
// Die letzte Frage hat keinen `--in`-Wert (sie wird per Tipp-Effekt gesetzt)
// und steht separat als sr-only-Text in der Känguru-Szene.
const FRAGE_SR_ONLY = 'Gibt es Barniz?';

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

test('jede Szene außer dem Prolog hat Ebenen, und jedes use zeigt auf ein Symbol im Sprite', () => {
  const symbols = new Set([...html.matchAll(/<symbol id="([^"]+)"/g)].map(m => m[1]));
  const uses = [...body.matchAll(/<use href="#([^"]+)"/g)].map(m => m[1]);
  assert.ok(uses.length > 0, 'keine use-Elemente');
  for (const u of uses) assert.ok(symbols.has(u), `Symbol #${u} fehlt im Sprite`);
  for (const s of SCENES) {
    if (s.id === 'prolog') continue;
    const stage = body.match(new RegExp(`data-scene="${s.id}"[\\s\\S]*?<div class="lines">`))[0];
    assert.ok(/class="layer layer--/.test(stage), `${s.id}: keine Ebenen`);
    assert.ok(/class="veil"/.test(stage), `${s.id}: kein Vorhang`);
  }
});

test('Dramaturgie: Textzeilen und Einblendpunkte je Szene entsprechen Spec Abschnitt 2', () => {
  for (const s of SCENES) {
    const scene = body.match(new RegExp(`data-scene="${s.id}"[\\s\\S]*?</section>`))[0];
    const found = [...scene.matchAll(/<p class="line[^"]*" style="--in: ([\d.]+)">([^<]+)<\/p>/g)]
      .map(m => [Number(m[1]), m[2]]);
    assert.deepEqual(found, LINES[s.id], `${s.id}: Zeilen/--in weichen von der Spec ab`);
  }
  const kaenguru = body.match(/data-scene="kaenguru"[\s\S]*?<\/section>/)[0];
  assert.ok(kaenguru.includes(`<span class="sr-only">${FRAGE_SR_ONLY}</span>`), 'letzte Frage fehlt als sr-only-Text');
});

test('Amber-Disziplin: #F2B84B nur in tokens.css, var(--amber) nur an den vier erlaubten Stellen', () => {
  const base = readFileSync(new URL('../css/base.css', import.meta.url), 'utf8');
  const scenesCss = readFileSync(new URL('../css/scenes.css', import.meta.url), 'utf8');

  for (const [name, content] of [['index.html', html], ['css/base.css', base], ['css/scenes.css', scenesCss]]) {
    assert.equal((content.match(/#F2B84B/g) ?? []).length, 0, `${name}: #F2B84B sollte nur in tokens.css stehen`);
  }
  const jsDir = new URL('../js/', import.meta.url);
  for (const f of readdirSync(jsDir)) {
    const content = readFileSync(new URL(f, jsDir), 'utf8');
    assert.equal((content.match(/#F2B84B/g) ?? []).length, 0, `js/${f}: #F2B84B sollte nicht vorkommen`);
  }

  // Fenster (je eine Überlagerung quer und hochkant), Türspalt, zwei Verläufe à 2 Stops
  // (die gezeichnete Laterne entfiel mit der Fotoplatte)
  assert.equal((html.match(/var\(--amber\)/g) ?? []).length, 7, 'index.html: var(--amber) sollte genau 7-mal vorkommen');
  // Augen: fill und drop-shadow
  assert.equal((scenesCss.match(/var\(--amber\)/g) ?? []).length, 2, 'css/scenes.css: var(--amber) sollte genau 2-mal vorkommen');
  assert.equal((base.match(/var\(--amber\)/g) ?? []).length, 0, 'css/base.css: var(--amber) sollte nicht vorkommen');

  // Laterne am Zeiger: bewusst rgba(242, 184, 75, …) statt var(--amber), genau ein Block in .lantern
  assert.equal((base.match(/^\.lantern\s*\{/gm) ?? []).length, 1, 'genau ein .lantern-Block erwartet');
  const lanternBlock = base.match(/^\.lantern\s*\{[^}]*\}/m)[0];
  const rgbaAmberTotal = (base.match(/rgba\(242, 184, 75,/g) ?? []).length;
  const rgbaAmberInLantern = (lanternBlock.match(/rgba\(242, 184, 75,/g) ?? []).length;
  assert.equal(rgbaAmberTotal, rgbaAmberInLantern, 'rgba(242, 184, 75, …) sollte ausschließlich im .lantern-Block stehen');
});

test('Stapelreihenfolge: z-index-Werte entsprechen Spec Abschnitt 4', () => {
  const base = readFileSync(new URL('../css/base.css', import.meta.url), 'utf8');
  const scenesCss = readFileSync(new URL('../css/scenes.css', import.meta.url), 'utf8');
  const baseLayers = [
    ['.lantern', 15],
    ['.snow', 20],
    ['.grain', 30],
    ['.vignette', 31],
    ['.hud', 40],
    ['.foot', 26],
  ];
  for (const [selector, z] of baseLayers) {
    const re = new RegExp(`\\${selector}\\s*\\{[^}]*z-index:\\s*${z};`);
    assert.ok(re.test(base), `${selector}: z-index ${z} fehlt in css/base.css`);
  }
  const sceneLayers = [
    ['.stage', 1],
    ['.lines', 25],
  ];
  for (const [selector, z] of sceneLayers) {
    const re = new RegExp(`\\${selector}\\s*\\{[^}]*z-index:\\s*${z};`);
    assert.ok(re.test(scenesCss), `${selector}: z-index ${z} fehlt in css/scenes.css`);
  }
});
