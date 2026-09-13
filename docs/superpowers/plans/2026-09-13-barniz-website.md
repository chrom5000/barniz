# Barniz-Website – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine abhängigkeitsfreie Scroll-Seite, die durch eine illustrierte Winterlandschaft an der Schlei nach Arnis führt und mit einem Känguru endet, das fragt „Gibt es Barniz?“; gehostet auf GitHub Pages unter `https://chrom5000.github.io/barniz/`.

**Architecture:** Reines HTML/CSS/JS ohne Build. Jede Szene ist ein Scroll-Abstandhalter (`section.scene`) mit einer fixen Bühne (`.stage`) und fixen Textzeilen (`.lines`), die nur bei `data-state="active"` sichtbar sind. Ein kleiner Scroll-Motor schreibt den Fortschritt `--p` (0–1) pro Szene als CSS-Variable; alle Bewegungen sind CSS-`calc()` auf `--p`. Landschaftsebenen sind SVG-Symbole in einem Sprite, Schnee ist ein Canvas, Ton kommt synthetisiert aus der Web Audio API. Die reinen Rechenmodule (Fortschritt, Szenenkonfiguration, Koordinaten, Pegel, Tipp-Effekt) sind DOM-frei und mit `node:test` getestet.

**Tech Stack:** HTML5, CSS (Custom Properties, `calc()`, `clamp()`, `abs()`, `sin()`, `mask-image`), ES-Module, Canvas 2D, Web Audio API, `node:test` (Node ≥ 20), `gh` CLI, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-13-barniz-website-design.md` – der Plan argumentiert aus der Spec; Ausführende lesen beides.

## Global Constraints

- Keine Abhängigkeiten, kein Build-Schritt, keine externen Anfragen zur Laufzeit (kein CDN, keine Analytics, keine Fonts von Dritten). `package.json` enthält nur `"type": "module"` und Skripte.
- Alle Pfade in HTML/CSS relativ (kein führender `/`), damit die Seite unter `/barniz/` und später unter eigener Domain läuft.
- Der Name „Barniz“ steht im Body von `index.html` genau **einmal** (in der letzten Frage). Der `<title>` ist „Barniz?“.
- Die einzige warme Farbe ist `--amber: #F2B84B`; sie erscheint nur an Laterne, flackerndem Fenster, Türspalt und Känguru-Augen. Ferne Lichter sind `--ice`.
- Schwansen ist immer „drüben“, Arnis liegt in Angeln am Nordufer der Schlei. Keine Daten, Öffnungszeiten, Betreiber, Kontaktmöglichkeiten.
- Schriften selbst gehostet als Latin-Subset woff2 in `assets/fonts/`, jede Datei zwischen 5 kB und 80 kB, OFL-Lizenztexte daneben.
- Gesamtgewicht der Seite unter 300 kB inklusive Schriften.
- `prefers-reduced-motion: reduce`: kein Canvas, keine Parallaxe, kein Korn-Versatz, keine Nebeldrift, kein Tipp-Effekt; alle Texte lesbar.
- Sprache der Seite und aller Texte: Deutsch. `lang="de"`.
- Commit-Nachrichten auf Deutsch, jeweils mit den Attributionszeilen aus der Sitzung (Co-Authored-By und Claude-Session).
- Lokal ansehen: `python3 -m http.server 8080` im Projektroot, dann `http://localhost:8080/`. Tests: `node --test tests/`.

## Dateistruktur

| Datei | Verantwortung |
|---|---|
| `index.html` | Markup: Sprite mit allen SVG-Symbolen, acht Szenen, Fußzeile, fixe Ebenen (Schnee, Laterne, Korn, Vignette), HUD, Ton-Schalter |
| `impressum.html` | Platzhalterseite |
| `css/tokens.css` | Farben, Schriftfamilien, Größen, Safe-Area als Custom Properties |
| `css/base.css` | `@font-face`, Reset, Typografie, `.mono`, `.sr-only`, fixe Ebenen (Korn, Vignette, Laterne, HUD, Ton-Schalter, Fußzeile) |
| `css/scenes.css` | `.scene`/`.stage`/`.lines`, Ebenen mit Parallaxe, Textzeilen, Nebel, Vorhang, szenenspezifische Effekte (Fenster, Türspalt, Känguru), reduced-motion |
| `js/progress.js` | `progress(top, range, scrollY)`, `sceneState(...)`, `clamp` – rein |
| `js/scenes.js` | `SCENES`-Konfiguration, `sceneById`, `sceneIndex`, `BLEND_START` – rein |
| `js/levels.js` | `snowFor(id, p)`, `audioFor(id, p)`, `lerp` – rein |
| `js/coords.js` | `coordsFor(id, p)`, `formatCoords`, `lerpCoords`, `DASHES` – rein |
| `js/typewriter.js` | `typewriterSchedule(text, totalMs)`, `createTypewriter({...})` – rein (Timer injizierbar) |
| `js/scroll.js` | `createScrollEngine({ sections, onFrame })` – DOM |
| `js/snow.js` | `createSnow(canvas)` → `{ setTarget(snow, velocity) }` – DOM |
| `js/lantern.js` | `createLantern()` – DOM, schreibt `--lx`/`--ly` |
| `js/audio.js` | `createAudio(button)` → `{ setLevels(levels) }` – Web Audio |
| `js/grain.js` | `startGrain(el)` – DOM |
| `js/main.js` | verdrahtet alles |
| `tools/fetch-fonts.mjs` | lädt die Schriften einmalig |
| `tools/og.html` | Vorlage für `assets/og.png` |
| `tests/*.test.js` | `node:test` |

---

### Task 1: Projektgerüst, Schriften, Tokens und Basis-CSS

**Files:**
- Create: `package.json`, `.gitignore`, `.nojekyll`, `README.md`, `tools/fetch-fonts.mjs`, `css/tokens.css`, `css/base.css`, `assets/fonts/*` (per Skript), `assets/favicon.svg`
- Test: `tests/assets.test.js`

**Interfaces:**
- Produces: CSS-Tokens (`--night`, `--night-2`, `--fog-1`, `--fog-2`, `--fog-3`, `--ice`, `--snow`, `--amber`, `--mute`, `--font-serif`, `--font-mono`, `--text-size`, `--mono-size`, `--gutter`, `--safe-*`), Klassen `.mono`, `.sr-only`, `.grain`, `.vignette`, `.lantern`, `.snow`, `.hud`, `.hud--coords`, `.hud--sound`, `.foot`. Alle späteren Tasks bauen darauf auf.

- [ ] **Step 1: Failing Test schreiben**

`tests/assets.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';

const fonts = ['fraunces-300.woff2', 'fraunces-300-italic.woff2', 'jetbrains-mono-400.woff2'];

for (const f of fonts) {
  test(`Schrift ${f} liegt im Repo und ist ein Latin-Subset (5–80 kB)`, () => {
    const s = statSync(new URL(`../assets/fonts/${f}`, import.meta.url));
    assert.ok(s.size > 5_000 && s.size < 80_000, `Größe ${s.size} Bytes`);
  });
}

test('OFL-Lizenztexte liegen bei den Schriften', () => {
  for (const f of ['OFL-Fraunces.txt', 'OFL-JetBrainsMono.txt']) {
    const s = statSync(new URL(`../assets/fonts/${f}`, import.meta.url));
    assert.ok(s.size > 1_000, `${f} ist leer`);
  }
});
```

- [ ] **Step 2: package.json und Test laufen lassen (muss fehlschlagen)**

`package.json`:

```json
{
  "name": "barniz",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/",
    "serve": "python3 -m http.server 8080"
  }
}
```

Run: `node --test tests/`
Expected: 4 Tests FAIL mit `ENOENT` (Dateien fehlen).

- [ ] **Step 3: Schriften-Skript schreiben und ausführen**

`tools/fetch-fonts.mjs`:

```js
// Lädt einmalig die Latin-Subsets von Fraunces (300, 300 italic) und
// JetBrains Mono (400) über die Google-Fonts-CSS-API und legt sie unter
// assets/fonts/ ab. Danach lädt die Seite nichts mehr von Google.
// Ausführen: node tools/fetch-fonts.mjs
import { writeFile, mkdir } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const API = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;1,300&family=JetBrains+Mono:wght@400&display=swap';

const wanted = {
  'Fraunces|normal|300': 'fraunces-300.woff2',
  'Fraunces|italic|300': 'fraunces-300-italic.woff2',
  'JetBrains Mono|normal|400': 'jetbrains-mono-400.woff2',
};

const css = await (await fetch(API, { headers: { 'User-Agent': UA } })).text();
const dir = new URL('../assets/fonts/', import.meta.url);
await mkdir(dir, { recursive: true });

// Die API liefert pro Subset einen Block: "/* latin */ @font-face { ... }"
const re = /\/\* ([\w-]+) \*\/\s*@font-face\s*\{([^}]*)\}/g;
let m;
let found = 0;
while ((m = re.exec(css))) {
  const [, subset, body] = m;
  if (subset !== 'latin') continue;
  const family = body.match(/font-family:\s*'([^']+)'/)[1];
  const style = body.match(/font-style:\s*(\w+)/)[1];
  const weight = body.match(/font-weight:\s*(\d+)/)[1];
  const url = body.match(/url\(([^)]+)\)/)[1];
  const file = wanted[`${family}|${style}|${weight}`];
  if (!file) continue;
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  await writeFile(new URL(file, dir), buf);
  console.log(file, buf.length, 'Bytes');
  found++;
}
if (found !== 3) {
  console.error(`Erwartet 3 Dateien, gefunden ${found}. CSS-Antwort:\n${css.slice(0, 600)}`);
  process.exit(1);
}
```

Run:
```bash
node tools/fetch-fonts.mjs
curl -fsSL https://raw.githubusercontent.com/undercasetype/Fraunces/master/OFL.txt -o assets/fonts/OFL-Fraunces.txt
curl -fsSL https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/OFL.txt -o assets/fonts/OFL-JetBrainsMono.txt
ls -la assets/fonts/
```
Expected: drei woff2-Dateien (je grob 20–60 kB) und zwei OFL-Texte. Falls eine OFL-URL 404 liefert: die Datei `OFL.txt` aus dem jeweiligen GitHub-Repo (undercasetype/Fraunces bzw. JetBrains/JetBrainsMono) im Browser öffnen und den Text speichern.

- [ ] **Step 4: Test laufen lassen (muss bestehen)**

Run: `node --test tests/`
Expected: 4 Tests PASS.

- [ ] **Step 5: Tokens und Basis-CSS schreiben**

`css/tokens.css`:

```css
:root {
  --night: #070B14;
  --night-2: #0C1322;
  --fog-1: #18202F;
  --fog-2: #28323F;
  --fog-3: #3A4552;
  --ice: #9FB4C7;
  --snow: #E6EEF5;
  --amber: #F2B84B;
  --mute: #5B6673;

  --font-serif: 'Fraunces', Georgia, serif;
  --font-mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;

  --text-size: clamp(1.6rem, 4.5vw + 0.5rem, 3.4rem);
  --mono-size: 0.7rem;
  --gutter: clamp(1rem, 4vw, 3rem);

  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);

  /* Laternenposition, schreibt lantern.js */
  --lx: 50vw;
  --ly: 58vh;
}
```

`css/base.css`:

```css
@font-face {
  font-family: 'Fraunces';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('../assets/fonts/fraunces-300.woff2') format('woff2');
}
@font-face {
  font-family: 'Fraunces';
  font-style: italic;
  font-weight: 300;
  font-display: swap;
  src: url('../assets/fonts/fraunces-300-italic.woff2') format('woff2');
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../assets/fonts/jetbrains-mono-400.woff2') format('woff2');
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  background: var(--night);
  color: var(--snow);
  color-scheme: dark;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-serif);
  font-weight: 300;
  line-height: 1.25;
  min-height: 100vh;
  touch-action: pan-y;
  overflow-x: hidden;
}

a { color: inherit; }

.mono {
  font-family: var(--font-mono);
  font-size: var(--mono-size);
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--mute);
  line-height: 1.6;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- fixe Ebenen, Stapelreihenfolge siehe Spec Abschnitt 4 ---- */

.snow {
  position: fixed;
  inset: 0;
  z-index: 20;
  pointer-events: none;
}

.lantern {
  position: fixed;
  left: 0;
  top: 0;
  width: 400px;
  height: 400px;
  z-index: 15;
  pointer-events: none;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(242, 184, 75, 0.10) 0%, rgba(242, 184, 75, 0.04) 40%, transparent 70%);
  mix-blend-mode: screen;
  transform: translate(calc(var(--lx) - 200px), calc(var(--ly) - 200px));
  opacity: 0;
}
html.has-lantern .lantern { opacity: 1; }

.grain {
  position: fixed;
  inset: -10%;
  z-index: 30;
  pointer-events: none;
  opacity: 0.06;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");
  background-size: 300px 300px;
}

.vignette {
  position: fixed;
  inset: 0;
  z-index: 31;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 45%, rgba(7, 11, 20, 0.55) 100%);
}

.hud {
  position: fixed;
  z-index: 40;
}

.hud--coords {
  left: calc(var(--gutter) + var(--safe-left));
  bottom: calc(var(--gutter) + var(--safe-bottom));
  display: flex;
  flex-direction: column;
  gap: 0.15em;
  pointer-events: none;
  white-space: pre;
}

.hud--sound {
  right: calc(var(--gutter) + var(--safe-right));
  top: calc(var(--gutter) + var(--safe-top));
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0.5em 0.2em;
}
.hud--sound:focus-visible {
  outline: 1px solid var(--ice);
  outline-offset: 3px;
}

.foot {
  position: relative;
  z-index: 26;
  min-height: 20vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8em;
  padding: var(--gutter);
  text-align: center;
}
.foot a { text-decoration: none; border-bottom: 1px solid var(--fog-3); }
.foot a:focus-visible { outline: 1px solid var(--ice); outline-offset: 3px; }
```

- [ ] **Step 6: Hilfsdateien anlegen**

`.gitignore`:
```
.DS_Store
node_modules/
*.log
```

`.nojekyll`: leere Datei (`touch .nojekyll`).

`assets/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#070B14"/><text x="32" y="47" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#9FB4C7">?</text></svg>
```

`README.md`:
```markdown
# Barniz?

Ein Winter an der Schlei. Und eine Frage. Eine Scroll-Seite ohne Abhängigkeiten und ohne Build.

Lokal ansehen: `python3 -m http.server 8080` im Projektroot, dann <http://localhost:8080/>.
Tests: `node --test tests/` (Node ≥ 20).
Schriften neu laden (nur nötig, wenn `assets/fonts/` fehlt): `node tools/fetch-fonts.mjs`.
```

- [ ] **Step 7: Commit**

```bash
git add package.json .gitignore .nojekyll README.md tools/fetch-fonts.mjs css/tokens.css css/base.css assets/fonts assets/favicon.svg tests/assets.test.js
git commit -m "Projektgerüst, Schriften, Tokens und Basis-CSS"
```

---

### Task 2: Fortschritt und Szenenzustand (`js/progress.js`)

**Files:**
- Create: `js/progress.js`
- Test: `tests/progress.test.js`

**Interfaces:**
- Produces: `progress(top: number, range: number, scrollY: number): number` (0–1); `sceneState(top, height, scrollY, { first = false, last = false } = {}): 'before' | 'active' | 'after'`; `clamp(v, lo, hi)`. Verwendet von `scroll.js` (Task 7) und `snow.js` (Task 12).

- [ ] **Step 1: Failing Test schreiben**

`tests/progress.test.js`:

```js
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
```

- [ ] **Step 2: Test laufen lassen (muss fehlschlagen)**

Run: `node --test tests/progress.test.js`
Expected: FAIL mit `Cannot find module '.../js/progress.js'`.

- [ ] **Step 3: Implementieren**

`js/progress.js`:

```js
// Reine Rechenfunktionen für den Scroll-Motor. Kein DOM.

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Fortschritt einer Szene: 0 an ihrem Anfang (top), 1 nach `range` Pixeln.
 * `range` ist normalerweise die Abschnittshöhe; bei der letzten Szene
 * `Abschnittshöhe − Viewporthöhe`, damit 1 vor der Fußzeile erreichbar ist.
 */
export function progress(top, range, scrollY) {
  if (range <= 0) return scrollY < top ? 0 : 1;
  return clamp((scrollY - top) / range, 0, 1);
}

/**
 * Genau eine Szene ist aktiv: die, deren Abschnitt scrollY enthält.
 * Die erste Szene fängt Überscrollen nach oben ab, die letzte bleibt
 * hinter der Fußzeile stehen.
 */
export function sceneState(top, height, scrollY, { first = false, last = false } = {}) {
  if (scrollY < top) return first ? 'active' : 'before';
  if (scrollY >= top + height) return last ? 'active' : 'after';
  return 'active';
}
```

- [ ] **Step 4: Test laufen lassen (muss bestehen)**

Run: `node --test tests/progress.test.js`
Expected: 7 Tests PASS.

- [ ] **Step 5: Commit**

```bash
git add js/progress.js tests/progress.test.js
git commit -m "Scroll-Fortschritt und Szenenzustand als reine Funktionen"
```

---

### Task 3: Szenen-Konfiguration (`js/scenes.js`)

**Files:**
- Create: `js/scenes.js`
- Test: `tests/scenes.test.js`

**Interfaces:**
- Produces: `SCENES: Array<{ id, label, height, snow: { density, wind, rampIn?, rampOut? }, audio: { wind, water, bass }, coords: { lat: [d, m, s], lon: [d, m, s] } | null }>`; `BLEND_START = 0.85`; `sceneIndex(id): number` (−1 wenn unbekannt); `sceneById(id)`. Verwendet von `levels.js`, `coords.js`, `main.js`, `html.test.js`.

- [ ] **Step 1: Failing Test schreiben**

`tests/scenes.test.js`:

```js
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
```

- [ ] **Step 2: Test laufen lassen (muss fehlschlagen)**

Run: `node --test tests/scenes.test.js`
Expected: FAIL mit `Cannot find module '.../js/scenes.js'`.

- [ ] **Step 3: Implementieren**

`js/scenes.js`:

```js
// Alle Zahlen stammen aus der Spec (Abschnitte 2 und 3). Höhe in vh,
// Schneedichte in Flocken pro 6000 px², Wind in px/s, Audio-Pegel 0–1,
// Koordinaten als [Grad, Minuten, Sekunden].

export const BLEND_START = 0.85;

export const SCENES = [
  { id: 'prolog', label: '', height: 150,
    snow: { density: 0.6, wind: 0, rampIn: 0.55 },
    audio: { wind: 0.15, water: 0.00, bass: 0 },
    coords: null },
  { id: 'schlei', label: 'Schlei', height: 250,
    snow: { density: 0.8, wind: -20 },
    audio: { wind: 0.35, water: 0.30, bass: 0 },
    coords: { lat: [54, 37, 30], lon: [9, 54, 50] } },
  { id: 'damm', label: 'Damm', height: 250,
    snow: { density: 1.2, wind: -60 },
    audio: { wind: 0.60, water: 0.20, bass: 0 },
    coords: { lat: [54, 38, 5], lon: [9, 55, 15] } },
  { id: 'lange-strasse', label: 'Lange Strasse', height: 250,
    snow: { density: 0.7, wind: -15 },
    audio: { wind: 0.25, water: 0.05, bass: 0 },
    coords: { lat: [54, 37, 52], lon: [9, 55, 40] } },
  { id: 'faehrberg', label: 'Fährberg', height: 250,
    snow: { density: 0.6, wind: -10 },
    audio: { wind: 0.25, water: 0.15, bass: 0.10 },
    coords: { lat: [54, 37, 40], lon: [9, 56, 0] } },
  { id: 'tuer', label: 'Tür', height: 250,
    snow: { density: 0.3, wind: 0 },
    audio: { wind: 0.10, water: 0.05, bass: 0.45 },
    coords: { lat: [54, 37, 40], lon: [9, 56, 0] } },
  { id: 'drueben', label: 'Drüben', height: 250,
    snow: { density: 1.0, wind: -35 },
    audio: { wind: 0.40, water: 0.35, bass: 0.05 },
    coords: { lat: [54, 37, 38], lon: [9, 56, 10] } },
  { id: 'kaenguru', label: '?', height: 200,
    snow: { density: 0.5, wind: 0, rampOut: 0.45 },
    audio: { wind: 0.30, water: 0.00, bass: 0 },
    coords: null },
];

export function sceneIndex(id) {
  return SCENES.findIndex(s => s.id === id);
}

export function sceneById(id) {
  return SCENES[sceneIndex(id)] ?? null;
}
```

- [ ] **Step 4: Test laufen lassen (muss bestehen)**

Run: `node --test tests/scenes.test.js`
Expected: 6 Tests PASS.

- [ ] **Step 5: Commit**

```bash
git add js/scenes.js tests/scenes.test.js
git commit -m "Szenen-Konfiguration aus der Spec"
```

---

### Task 4: Schnee- und Audio-Zielwerte mit Überblendung (`js/levels.js`)

**Files:**
- Create: `js/levels.js`
- Test: `tests/levels.test.js`

**Interfaces:**
- Consumes: `SCENES`, `sceneIndex`, `BLEND_START` aus `js/scenes.js`.
- Produces: `lerp(a, b, t)`; `snowFor(id, p): { density, wind }`; `audioFor(id, p): { wind, water, bass }`. Verwendet von `main.js` (Task 7), `snow.js` (Task 12), `audio.js` (Task 14).

- [ ] **Step 1: Failing Test schreiben**

`tests/levels.test.js`:

```js
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
```

- [ ] **Step 2: Test laufen lassen (muss fehlschlagen)**

Run: `node --test tests/levels.test.js`
Expected: FAIL mit `Cannot find module '.../js/levels.js'`.

- [ ] **Step 3: Implementieren**

`js/levels.js`:

```js
// Zielwerte für Schnee und Ton je Szene und Fortschritt p (0–1).
// Ab BLEND_START wird linear zur nächsten Szene übergeblendet (Spec 3/4).
import { SCENES, sceneIndex, BLEND_START } from './scenes.js';

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

function blendT(p) {
  return p <= BLEND_START ? 0 : (p - BLEND_START) / (1 - BLEND_START);
}

function ownSnow(scene, p) {
  const { density, wind, rampIn, rampOut } = scene.snow;
  let d = density;
  if (rampIn !== undefined) d = p <= rampIn ? 0 : density * (p - rampIn) / (1 - rampIn);
  if (rampOut !== undefined) d = p <= rampOut ? density : density * (1 - (p - rampOut) / (1 - rampOut));
  return { density: d, wind };
}

function blended(id, p, own, keys) {
  const i = sceneIndex(id);
  if (i < 0) return Object.fromEntries(keys.map(k => [k, 0]));
  const here = own(SCENES[i], p);
  const next = SCENES[i + 1];
  if (!next) return here;
  const t = blendT(p);
  const there = own(next, 0);
  return Object.fromEntries(keys.map(k => [k, lerp(here[k], there[k], t)]));
}

export function snowFor(id, p) {
  return blended(id, p, ownSnow, ['density', 'wind']);
}

export function audioFor(id, p) {
  return blended(id, p, scene => scene.audio, ['wind', 'water', 'bass']);
}
```

- [ ] **Step 4: Test laufen lassen (muss bestehen)**

Run: `node --test tests/levels.test.js`
Expected: 7 Tests PASS.

- [ ] **Step 5: Commit**

```bash
git add js/levels.js tests/levels.test.js
git commit -m "Schnee- und Audio-Zielwerte mit Überblendung"
```

---

### Task 5: Koordinaten (`js/coords.js`)

**Files:**
- Create: `js/coords.js`
- Test: `tests/coords.test.js`

**Interfaces:**
- Consumes: `SCENES`, `sceneIndex` aus `js/scenes.js`; `lerp` aus `js/levels.js`.
- Produces: `DASHES` (String), `formatCoords({ lat, lon }): string`, `lerpCoords(a, b, t)`, `coordsFor(id, p): string`. Verwendet von `main.js`.

- [ ] **Step 1: Failing Test schreiben**

`tests/coords.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DASHES, formatCoords, lerpCoords, coordsFor } from '../js/coords.js';

test('formatCoords: Grad ohne Auffüllen, Minuten und Sekunden zweistellig, Prime-Zeichen', () => {
  assert.equal(formatCoords({ lat: [54, 37, 52], lon: [9, 55, 40] }), '54°37′52″ N  9°55′40″ E');
  assert.equal(formatCoords({ lat: [54, 38, 5], lon: [9, 56, 0] }), '54°38′05″ N  9°56′00″ E');
});

test('lerpCoords interpoliert in Sekunden und rundet', () => {
  const a = { lat: [54, 37, 30], lon: [9, 54, 50] };
  const b = { lat: [54, 38, 5], lon: [9, 55, 15] };
  assert.deepEqual(lerpCoords(a, b, 0), a);
  assert.deepEqual(lerpCoords(a, b, 1), b);
  // Mitte: lat 54°37′30″ + 17.5″ → 54°37′48″ (gerundet), lon 9°54′50″ + 12.5″ → 9°55′03″
  assert.deepEqual(lerpCoords(a, b, 0.5), { lat: [54, 37, 48], lon: [9, 55, 3] });
});

test('coordsFor: Prolog zeigt Striche, Schlei steht auf ihrem Wert', () => {
  assert.equal(coordsFor('prolog', 0.3), DASHES);
  assert.equal(coordsFor('schlei', 0), '54°37′30″ N  9°54′50″ E');
  assert.equal(coordsFor('schlei', 1), '54°37′30″ N  9°54′50″ E');
});

test('coordsFor: Damm läuft von der Schlei zu seinem Ziel', () => {
  assert.equal(coordsFor('damm', 0), '54°37′30″ N  9°54′50″ E');
  assert.equal(coordsFor('damm', 1), '54°38′05″ N  9°55′15″ E');
});

test('coordsFor: Känguru zeigt bis 0.45 den letzten Ort, danach ein Fragezeichen', () => {
  assert.equal(coordsFor('kaenguru', 0.2), '54°37′38″ N  9°56′10″ E');
  assert.equal(coordsFor('kaenguru', 0.45), '?');
  assert.equal(coordsFor('kaenguru', 0.9), '?');
});

test('coordsFor: unbekannte Szene zeigt Striche', () => {
  assert.equal(coordsFor('nirgendwo', 0.5), DASHES);
});
```

- [ ] **Step 2: Test laufen lassen (muss fehlschlagen)**

Run: `node --test tests/coords.test.js`
Expected: FAIL mit `Cannot find module '.../js/coords.js'`.

- [ ] **Step 3: Implementieren**

`js/coords.js`:

```js
// Koordinaten-Anzeige unten links: läuft je Szene vom vorigen Ort zum eigenen.
import { SCENES, sceneIndex } from './scenes.js';
import { lerp } from './levels.js';

export const DASHES = '— — ′ — ″ N  — — ′ — ″ E';

const pad = n => String(n).padStart(2, '0');

function toSeconds([d, m, s]) {
  return d * 3600 + m * 60 + s;
}

function fromSeconds(total) {
  const t = Math.round(total);
  return [Math.floor(t / 3600), Math.floor((t % 3600) / 60), t % 60];
}

export function formatCoords({ lat, lon }) {
  return `${lat[0]}°${pad(lat[1])}′${pad(lat[2])}″ N  ${lon[0]}°${pad(lon[1])}′${pad(lon[2])}″ E`;
}

export function lerpCoords(a, b, t) {
  return {
    lat: fromSeconds(lerp(toSeconds(a.lat), toSeconds(b.lat), t)),
    lon: fromSeconds(lerp(toSeconds(a.lon), toSeconds(b.lon), t)),
  };
}

export function coordsFor(id, p) {
  const i = sceneIndex(id);
  if (i < 0) return DASHES;
  const scene = SCENES[i];
  if (scene.id === 'kaenguru') {
    return p >= 0.45 ? '?' : formatCoords(SCENES[i - 1].coords);
  }
  if (!scene.coords) return DASHES;
  const prev = SCENES[i - 1]?.coords ?? scene.coords;
  return formatCoords(lerpCoords(prev, scene.coords, p));
}
```

- [ ] **Step 4: Test laufen lassen (muss bestehen)**

Run: `node --test tests/coords.test.js`
Expected: 6 Tests PASS.

- [ ] **Step 5: Commit**

```bash
git add js/coords.js tests/coords.test.js
git commit -m "Koordinaten-Interpolation und -Formatierung"
```

---

### Task 6: Tipp-Effekt (`js/typewriter.js`)

**Files:**
- Create: `js/typewriter.js`
- Test: `tests/typewriter.test.js`

**Interfaces:**
- Produces: `typewriterSchedule(text, totalMs): Array<{ char, at }>`; `createTypewriter({ text, totalMs, write, schedule? })` → `{ start(): boolean, started: boolean }`. `write(partial: string, done: boolean)` wird pro Zeichen aufgerufen; `schedule(fn, ms)` ist standardmäßig `setTimeout` und im Test injizierbar. Verwendet von `main.js`.

- [ ] **Step 1: Failing Test schreiben**

`tests/typewriter.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { typewriterSchedule, createTypewriter } from '../js/typewriter.js';

test('Zeitplan: 15 Zeichen gleichmäßig über 2200 ms, letztes bei 2200', () => {
  const plan = typewriterSchedule('Gibt es Barniz?', 2200);
  assert.equal(plan.length, 15);
  assert.equal(plan[0].char, 'G');
  assert.equal(plan[14].char, '?');
  assert.equal(plan[14].at, 2200);
  assert.equal(plan[0].at, Math.round(2200 / 15));
  for (let i = 1; i < plan.length; i++) assert.ok(plan[i].at > plan[i - 1].at);
});

test('createTypewriter schreibt wachsende Teilstrings und meldet done beim letzten', () => {
  const calls = [];
  const timers = [];
  const tw = createTypewriter({
    text: 'Gibt es Barniz?',
    totalMs: 2200,
    write: (partial, done) => calls.push([partial, done]),
    schedule: (fn, ms) => timers.push({ fn, ms }),
  });
  assert.equal(tw.started, false);
  assert.equal(tw.start(), true);
  assert.equal(tw.started, true);
  assert.equal(timers.length, 15);
  timers.forEach(t => t.fn());
  assert.deepEqual(calls[0], ['G', false]);
  assert.deepEqual(calls[3], ['Gibt', false]);
  assert.deepEqual(calls[14], ['Gibt es Barniz?', true]);
});

test('start läuft nur einmal', () => {
  const timers = [];
  const tw = createTypewriter({ text: 'ab', totalMs: 100, write: () => {}, schedule: (fn, ms) => timers.push(ms) });
  assert.equal(tw.start(), true);
  assert.equal(tw.start(), false);
  assert.equal(tw.start(), false);
  assert.equal(timers.length, 2);
});
```

- [ ] **Step 2: Test laufen lassen (muss fehlschlagen)**

Run: `node --test tests/typewriter.test.js`
Expected: FAIL mit `Cannot find module '.../js/typewriter.js'`.

- [ ] **Step 3: Implementieren**

`js/typewriter.js`:

```js
// Die letzte Frage tippt sich einmal, Buchstabe für Buchstabe. Timer sind
// injizierbar, damit der Ablauf ohne echte Wartezeit testbar ist.

export function typewriterSchedule(text, totalMs) {
  const chars = Array.from(text);
  const step = totalMs / chars.length;
  return chars.map((char, i) => ({ char, at: Math.round(step * (i + 1)) }));
}

export function createTypewriter({ text, totalMs, write, schedule = (fn, ms) => setTimeout(fn, ms) }) {
  let started = false;
  const chars = Array.from(text);
  return {
    get started() { return started; },
    start() {
      if (started) return false;
      started = true;
      const plan = typewriterSchedule(text, totalMs);
      plan.forEach((step, i) => {
        schedule(() => write(chars.slice(0, i + 1).join(''), i === plan.length - 1), step.at);
      });
      return true;
    },
  };
}
```

- [ ] **Step 4: Test laufen lassen (muss bestehen)**

Run: `node --test tests/typewriter.test.js`
Expected: 3 Tests PASS.

- [ ] **Step 5: Commit**

```bash
git add js/typewriter.js tests/typewriter.test.js
git commit -m "Tipp-Effekt mit injizierbaren Timern"
```

---

### Task 7: Seitengerüst, Scroll-Motor und Textzeilen

Nach diesem Task scrollt die Seite durch acht leere Bühnen, Textzeilen blenden scrollgebunden ein und aus, der Nebelvorhang deckt die Wechsel, Koordinaten laufen mit. Landschaften folgen in Task 8–11.

**Files:**
- Create: `index.html`, `css/scenes.css`, `js/scroll.js`, `js/main.js`
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: `progress`, `sceneState` (Task 2); `coordsFor` (Task 5); `sceneById` (Task 3).
- Produces: Markup-Konvention `section.scene[data-scene][style="--h: N"] > .stage + .lines`; CSS-Variablen `--p` (auf `.scene`), `--in` (auf `.line`), `--fx/--fy/--fs` (auf `.layer`), `--veil-in/--veil-out`; `createScrollEngine({ sections, onFrame })` mit `onFrame({ current, p, velocity })`; `window.barniz.jump(id, p)` als Prüf-Helfer. Die Landschafts-Tasks fügen Symbole in `svg.sprite > defs` ein und Ebenen in die jeweilige `.stage`.

- [ ] **Step 1: Failing Test schreiben**

`tests/html.test.js`:

```js
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
```

- [ ] **Step 2: Test laufen lassen (muss fehlschlagen)**

Run: `node --test tests/html.test.js`
Expected: FAIL mit `ENOENT ... index.html`.

- [ ] **Step 3: index.html schreiben**

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Barniz?</title>
  <meta name="description" content="Ein Winter an der Schlei. Und eine Frage.">
  <meta name="theme-color" content="#070B14">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Barniz?">
  <meta property="og:description" content="Ein Winter an der Schlei. Und eine Frage.">
  <meta property="og:image" content="https://chrom5000.github.io/barniz/assets/og.png">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/scenes.css">
</head>
<body>
  <svg class="sprite" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden">
    <defs>
      <!-- Verläufe, Filter und Landschafts-Symbole (Task 8–11) -->
    </defs>
  </svg>

  <main id="reise">

    <section class="scene" data-scene="prolog" style="--h: 150">
      <div class="stage" aria-hidden="true">
        <div class="veil"></div>
      </div>
      <div class="lines">
        <p class="line" style="--in: 0.10">Was wäre, wenn …</p>
      </div>
    </section>

    <section class="scene" data-scene="schlei" style="--h: 250">
      <div class="stage" aria-hidden="true">
        <div class="veil"></div>
      </div>
      <div class="lines">
        <p class="line" style="--in: 0.15">Ein Winter an der Schlei.</p>
        <p class="line" style="--in: 0.40">Nördliches Ufer. Angeln.</p>
        <p class="line" style="--in: 0.60">Irgendwo hier liegt eine Halbinsel.</p>
      </div>
    </section>

    <section class="scene" data-scene="damm" style="--h: 250">
      <div class="stage" aria-hidden="true">
        <div class="veil"></div>
      </div>
      <div class="lines">
        <p class="line" style="--in: 0.15">Eine Straße, die aufs Wasser führt.</p>
        <p class="line" style="--in: 0.45">Am Ende: die kleinste Stadt Deutschlands.</p>
      </div>
    </section>

    <section class="scene" data-scene="lange-strasse" style="--h: 250">
      <div class="stage" aria-hidden="true">
        <div class="veil"></div>
      </div>
      <div class="lines">
        <p class="line" style="--in: 0.15">Rund dreihundert Menschen. Eine Straße. Eine Kirche.</p>
        <p class="line" style="--in: 0.45">Und im Winter: sehr viel Ruhe.</p>
        <p class="line line--small" style="--in: 0.65">Was wäre, wenn …</p>
      </div>
    </section>

    <section class="scene" data-scene="faehrberg" style="--h: 250">
      <div class="stage" aria-hidden="true">
        <div class="veil"></div>
      </div>
      <div class="lines">
        <p class="line" style="--in: 0.15">Am Fährberg steht ein Haus.</p>
        <p class="line" style="--in: 0.40">Es steht leer.</p>
        <p class="line" style="--in: 0.70">Oder?</p>
      </div>
    </section>

    <section class="scene" data-scene="tuer" style="--h: 250">
      <div class="stage" aria-hidden="true">
        <div class="veil"></div>
      </div>
      <div class="lines">
        <p class="line" style="--in: 0.12">Vielleicht Sessel, die schon drei Leben hatten.</p>
        <p class="line" style="--in: 0.32">Vielleicht ein Plattenspieler.</p>
        <p class="line" style="--in: 0.52">Vielleicht ein Drink, den es so nur hier gäbe.</p>
        <p class="line" style="--in: 0.72">Vielleicht gar nichts.</p>
      </div>
    </section>

    <section class="scene" data-scene="drueben" style="--h: 250">
      <div class="stage" aria-hidden="true">
        <div class="veil"></div>
      </div>
      <div class="lines">
        <p class="line" style="--in: 0.15">Drüben: Schwansen.</p>
        <p class="line" style="--in: 0.35">Hier: Angeln.</p>
        <p class="line" style="--in: 0.55">Dazwischen: das Wasser.</p>
        <p class="line" style="--in: 0.72">Und eine Frage.</p>
      </div>
    </section>

    <section class="scene" data-scene="kaenguru" style="--h: 200">
      <div class="stage" aria-hidden="true">
        <div class="veil"></div>
      </div>
      <div class="lines">
        <p class="line" style="--in: 0.50">Ein Känguru an der Schlei ergibt keinen Sinn.</p>
        <p class="line" style="--in: 0.65">Eine Bar in Arnis im Winter auch nicht.</p>
        <p class="frage"><span class="sr-only">Gibt es Barniz?</span><span class="frage__typed" aria-hidden="true"></span></p>
      </div>
    </section>

  </main>

  <footer class="foot mono">
    <p>Arnis · ein Winter · eine Schnapsidee</p>
    <a href="impressum.html">Impressum</a>
  </footer>

  <canvas class="snow" aria-hidden="true"></canvas>
  <div class="lantern" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>
  <div class="vignette" aria-hidden="true"></div>
  <div class="hud hud--coords mono" aria-hidden="true"><span class="coords"></span><span class="scene-label"></span></div>
  <button class="hud hud--sound mono" type="button" aria-pressed="false">Ton an</button>
  <div class="sr-only" aria-live="polite" id="frage-live"></div>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Test laufen lassen (muss bestehen)**

Run: `node --test tests/html.test.js`
Expected: 5 Tests PASS.

- [ ] **Step 5: scenes.css schreiben**

```css
/* ---- Szene = Scroll-Abstandhalter, Bühne und Text sind fix ---- */

.scene {
  position: relative;
  height: calc(var(--h, 250) * 1vh);
}

.stage,
.lines {
  position: fixed;
  inset: 0;
  visibility: hidden;
}
.scene[data-state="active"] .stage,
.scene[data-state="active"] .lines {
  visibility: visible;
}

.stage {
  z-index: 1;
  overflow: hidden;
  background: var(--night);
}

/* ---- Ebenen mit Parallaxe: Faktoren aus Spec Abschnitt 3 ---- */

.layer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -20vw;
  width: 140vw;
  transform-origin: 50% 100%;
  transform:
    translate3d(calc(var(--p, 0) * var(--fx, 0) * 1vw), calc(var(--p, 0) * var(--fy, 0) * 1vh), 0)
    scale(calc(1 + var(--p, 0) * var(--fs, 0)));
}
.layer > svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  fill: currentColor;
}
.layer--sky   { --fx: 0;   --fy: 0; --fs: 0; }
.layer--far   { --fx: -1;  --fy: 0; --fs: 0.03; color: var(--fog-1); }
.layer--water { --fx: 0;   --fy: 0; --fs: 0.06; color: var(--night-2); }
.layer--mid   { --fx: -3;  --fy: 1; --fs: 0.08; color: var(--night-2); }
.layer--fg    { --fx: -12; --fy: 2; --fs: 0.15; color: var(--night); }
.scene[data-state="active"] .layer { will-change: transform; }

/* ---- Nebel: zwei driftende Verläufe zwischen den Ebenen ---- */

.fog {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -20vw;
  width: 140vw;
  pointer-events: none;
  transform: translate3d(calc(var(--p, 0) * var(--fx) * 1vw), 0, 0);
}
.fog::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 35% at var(--fog-x) var(--fog-y), rgba(58, 69, 82, 0.55), transparent 70%);
  animation: fog-drift var(--fog-dur) ease-in-out infinite alternate;
  animation-delay: var(--fog-delay, 0s);
}
.fog--a { --fx: -4; --fog-x: 35%; --fog-y: 58%; --fog-dur: 46s; }
.fog--b { --fx: 6;  --fog-x: 70%; --fog-y: 66%; --fog-dur: 64s; --fog-delay: -20s; }
@keyframes fog-drift {
  from { transform: translateX(-3%); }
  to   { transform: translateX(3%); }
}

/* ---- Vorhang: deckt den Szenenwechsel bei p 0.85→1 und 0→0.15 ---- */

.veil {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  background: linear-gradient(180deg, var(--fog-2) 0%, var(--fog-3) 60%, var(--fog-2) 100%);
  opacity: max(
    calc(var(--veil-out, 1) * clamp(0, (var(--p, 0) - 0.85) / 0.15, 1)),
    calc(var(--veil-in, 1) * clamp(0, (0.15 - var(--p, 0)) / 0.15, 1))
  );
}
.scene[data-scene="prolog"] .veil { --veil-in: 0; }
.scene[data-scene="kaenguru"] .veil { --veil-out: 0; }

/* ---- Textzeilen: erscheinen bei --in, lösen sich 0.82→0.90 auf ---- */

.lines {
  z-index: 25;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.6em;
  padding:
    calc(var(--gutter) + var(--safe-top))
    calc(var(--gutter) + var(--safe-right))
    calc(20vh + var(--safe-bottom))
    calc(var(--gutter) + var(--safe-left));
  text-align: center;
  font-size: var(--text-size);
  text-wrap: balance;
}

.line {
  max-width: 18em;
  --fade-in: clamp(0, (var(--p, 0) - var(--in, 0)) / 0.08, 1);
  --fade-out: clamp(0, (0.90 - var(--p, 0)) / 0.08, 1);
  --vis: calc(var(--fade-in) * var(--fade-out));
  opacity: var(--vis);
  filter: blur(calc((1 - var(--vis)) * 8px));
  transform: translateY(calc((1 - var(--vis)) * 0.4em));
}
.line--small { font-size: 0.6em; font-style: italic; color: var(--ice); }
.scene[data-scene="kaenguru"] .line { --fade-out: 1; }

.frage {
  margin-top: 0.4em;
  font-size: 1.25em;
  min-height: 1.3em;
}
.frage__typed::after {
  content: '';
  display: inline-block;
  width: 0.05em;
  height: 0.9em;
  margin-left: 0.08em;
  vertical-align: -0.1em;
  background: var(--ice);
  animation: blink 0.9s steps(1) infinite;
}
.frage__typed:empty::after { display: none; }
.frage__typed.is-done::after { display: none; }
@keyframes blink { 50% { opacity: 0; } }
```

- [ ] **Step 6: scroll.js schreiben**

```js
// Scroll-Motor: misst die Szenen, schreibt --p und data-state, meldet die
// aktive Szene pro Frame. Rechnet höchstens einmal pro Animationsframe.
import { progress, sceneState } from './progress.js';

export function createScrollEngine({ sections, onFrame }) {
  const items = [...sections].map((el, i, arr) => ({
    el,
    id: el.dataset.scene,
    top: 0,
    height: 0,
    state: null,
    p: -1,
    first: i === 0,
    last: i === arr.length - 1,
  }));
  let ticking = false;
  let lastY = window.scrollY;
  let lastT = performance.now();
  let velocity = 0;

  function measure() {
    for (const it of items) {
      const rect = it.el.getBoundingClientRect();
      it.top = Math.round(rect.top + window.scrollY);
      it.height = Math.round(rect.height);
    }
    update();
  }

  function update() {
    ticking = false;
    const y = window.scrollY;
    const now = performance.now();
    const dt = Math.max(1, now - lastT) / 1000;
    velocity += ((y - lastY) / dt - velocity) * 0.25;
    lastY = y;
    lastT = now;
    const vh = window.innerHeight;
    let current = null;
    for (const it of items) {
      const state = sceneState(it.top, it.height, y, { first: it.first, last: it.last });
      const range = it.last ? Math.max(1, it.height - vh) : it.height;
      const p = state === 'active' ? progress(it.top, range, y) : (state === 'before' ? 0 : 1);
      if (state !== it.state) {
        it.el.dataset.state = state;
        it.state = state;
      }
      if (p !== it.p) {
        it.el.style.setProperty('--p', p.toFixed(4));
        it.p = p;
      }
      if (state === 'active') current = { id: it.id, p };
    }
    if (current) onFrame({ current: current.id, p: current.p, velocity });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  /** Springt zu Szene `id` bei Fortschritt `p` – für Prüfung und Entwicklung. */
  function jump(id, p = 0) {
    const it = items.find(x => x.id === id);
    if (!it) return;
    const range = it.last ? Math.max(1, it.height - window.innerHeight) : it.height;
    window.scrollTo(0, it.top + range * p);
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', measure);
  addEventListener('load', measure);
  measure();

  return { measure, jump };
}
```

- [ ] **Step 7: main.js schreiben (erste Fassung, wird in Task 11–15 erweitert)**

```js
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
```

- [ ] **Step 8: Im Browser prüfen**

Server starten (im Hintergrund, bleibt für alle weiteren Tasks laufen): `python3 -m http.server 8080` im Projektroot.

In Chrome `http://localhost:8080/` öffnen und prüfen:
1. Konsole: keine Fehler (insbesondere keine 404 für CSS/JS/Fonts).
2. Beim Scrollen wechselt genau eine `section.scene` auf `data-state="active"`; `document.querySelector('[data-scene="damm"]').style.getPropertyValue('--p')` liegt zwischen 0 und 1, während die Damm-Szene aktiv ist.
3. `barniz.jump('schlei', 0.5)`: die beiden ersten Schlei-Zeilen sind sichtbar, die dritte noch nicht; unten links steht `54°37′30″ N  9°54′50″ E` und `SCHLEI`.
4. `barniz.jump('schlei', 0.95)`: Text ist ausgeblendet, die Bühne ist vom Nebelvorhang bedeckt. `barniz.jump('damm', 0.05)`: ebenfalls Vorhang. Zwischen beiden kein sichtbarer Sprung.
5. `barniz.jump('kaenguru', 0.9)`: beide Känguru-Zeilen sichtbar, Koordinaten zeigen `?`, unten kommt die Fußzeile beim Weiterscrollen ins Bild, die Zeilen bleiben stehen.
6. Fenster auf 390 px Breite verkleinern: Zeilen brechen um, nichts scrollt horizontal, Koordinaten und Ton-Schalter sitzen innerhalb des Bildes.

- [ ] **Step 9: Commit**

```bash
git add index.html css/scenes.css js/scroll.js js/main.js tests/html.test.js
git commit -m "Seitengerüst, Scroll-Motor, Textzeilen und Vorhang"
```

---

### Task 8: Landschaft „Die Schlei“ (Szene 1) und Sprite-Grundlagen

**Files:**
- Modify: `index.html` (Sprite-`<defs>`, Bühne der Szene `schlei`), `css/scenes.css` (Randstücke)
- Test: `tests/html.test.js` (ergänzen)

**Interfaces:**
- Produces: Verläufe `#g-sky`, `#g-water`, `#g-amber-glow`, `#g-schwelle`, Filter `#f-blur`; Symbole `#s-schlei-sky`, `#s-schlei-far`, `#s-schlei-water`, `#s-schlei-mid`, `#s-schilf-l`, `#s-schilf-r`; CSS-Klassen `.edge`, `.edge--left`, `.edge--right`.
- Bühnen-Konvention für Flächen und Motive: `.layer.layer--<art> > svg[viewBox="0 0 1400 1000"][preserveAspectRatio="xMidYMax slice"] > use[href="#s-…"]`. Sichtbarer Ausschnitt des viewBox: quer etwa x 200–1200 (oben beschnitten, y ≥ 380 sichtbar), hochkant nur etwa **x 470–930** bei voller Höhe. Motive, die auch auf dem Handy zu sehen sein müssen (Häuserzeile, Fährhaus, Fähre, Laterne, Kirchturm), liegen deshalb im Band x 470–930.
- Bühnen-Konvention für Randstücke (Vordergrund, das immer an der Bildkante sitzen soll: Schilf, Hausecken, Mauer, Poller): innerhalb von `.layer--fg` je ein `div.edge.edge--left` / `div.edge.edge--right` mit `svg[viewBox="0 0 300 600"]` und `preserveAspectRatio="xMinYMax meet"` (links) bzw. `xMaxYMax meet` (rechts). Die Randstücke skalieren mit `meet` in eine Box von 30 vw × 55 vh und sitzen unten an der jeweiligen Bildkante, auf jedem Seitenverhältnis.

- [ ] **Step 1: Test ergänzen (muss fehlschlagen)**

An `tests/html.test.js` anhängen:

```js
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
```

Run: `node --test tests/html.test.js`
Expected: der neue Test FAIL („keine use-Elemente“).

- [ ] **Step 2: Sprite-Grundlagen in `svg.sprite > defs` einsetzen**

Den Kommentar `<!-- Verläufe, Filter und Landschafts-Symbole (Task 8–11) -->` ersetzen durch:

```html
      <!-- Nebel hellt den Horizont auf; Wasser spiegelt ihn. Silhouetten (fg = night, mid = night-2, far = fog-1) brauchen darunter hellere Flächen. -->
      <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color: var(--night)"/>
        <stop offset="0.55" style="stop-color: var(--night-2)"/>
        <stop offset="1" style="stop-color: var(--fog-3)"/>
      </linearGradient>
      <linearGradient id="g-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color: var(--fog-3)"/>
        <stop offset="1" style="stop-color: var(--fog-2)"/>
      </linearGradient>
      <radialGradient id="g-amber-glow">
        <stop offset="0" style="stop-color: var(--amber); stop-opacity: 0.35"/>
        <stop offset="1" style="stop-color: var(--amber); stop-opacity: 0"/>
      </radialGradient>
      <linearGradient id="g-schwelle" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color: var(--amber); stop-opacity: 0"/>
        <stop offset="1" style="stop-color: var(--amber); stop-opacity: 0.5"/>
      </linearGradient>
      <filter id="f-blur" x="-20%" y="-200%" width="140%" height="500%">
        <feGaussianBlur stdDeviation="6"/>
      </filter>

      <!-- Szene 1: Die Schlei. Horizont bei y 620. -->
      <symbol id="s-schlei-sky" viewBox="0 0 1400 1000">
        <rect x="0" y="0" width="1400" height="620" fill="url(#g-sky)"/>
        <rect x="0" y="620" width="1400" height="380" fill="url(#g-water)"/>
      </symbol>
      <symbol id="s-schlei-far" viewBox="0 0 1400 1000">
        <path d="M0 618 C120 606 260 622 400 610 C540 598 680 616 820 606 C960 596 1100 614 1240 604 C1300 600 1360 606 1400 604 L1400 660 L0 660 Z"/>
        <g style="fill: var(--ice)" fill-opacity="0.6">
          <circle cx="330" cy="611" r="2.2"/><circle cx="612" cy="608" r="1.8"/><circle cx="905" cy="604" r="2.4"/><circle cx="1060" cy="607" r="1.6"/>
        </g>
      </symbol>
      <symbol id="s-schlei-water" viewBox="0 0 1400 1000">
        <g style="fill: var(--ice)" fill-opacity="0.10">
          <rect x="300" y="650" width="70" height="2"/><rect x="590" y="668" width="50" height="2"/><rect x="880" y="655" width="90" height="2"/><rect x="860" y="690" width="60" height="2"/><rect x="320" y="700" width="40" height="2"/><rect x="1040" y="672" width="45" height="2"/><rect x="600" y="730" width="120" height="2"/><rect x="870" y="760" width="80" height="2"/>
        </g>
        <path style="fill: var(--ice)" fill-opacity="0.12" d="M0 1000 L0 905 L120 918 L215 892 L330 922 L470 903 L565 936 L700 908 L820 942 L960 912 L1100 946 L1250 918 L1400 950 L1400 1000 Z"/>
      </symbol>
      <symbol id="s-schlei-mid" viewBox="0 0 1400 1000">
        <rect x="884" y="690" width="14" height="230" rx="3"/><rect x="912" y="712" width="12" height="208" rx="3"/>
      </symbol>
      <!-- Randstücke (viewBox 300×600, Boden bei y 600): Schilf links und rechts, wiederverwendet in Szene 2 und 6 -->
      <symbol id="s-schilf-l" viewBox="0 0 300 600">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="7">
          <path d="M20 600 L46 120"/><path d="M62 600 L104 60"/><path d="M96 600 L132 190"/><path d="M140 600 L196 110"/><path d="M178 600 L214 230"/><path d="M226 600 L268 160"/><path d="M262 600 L290 300"/>
        </g>
        <ellipse cx="104" cy="62" rx="8" ry="32" transform="rotate(8 104 62)"/><ellipse cx="196" cy="112" rx="7" ry="28" transform="rotate(10 196 112)"/><ellipse cx="268" cy="162" rx="7" ry="26" transform="rotate(6 268 162)"/>
      </symbol>
      <symbol id="s-schilf-r" viewBox="0 0 300 600">
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="7">
          <path d="M280 600 L250 140"/><path d="M240 600 L206 80"/><path d="M198 600 L176 240"/><path d="M150 600 L110 180"/><path d="M90 600 L70 320"/>
        </g>
        <ellipse cx="206" cy="82" rx="8" ry="32" transform="rotate(-6 206 82)"/><ellipse cx="110" cy="182" rx="7" ry="28" transform="rotate(-10 110 182)"/>
      </symbol>
```

- [ ] **Step 2b: Randstück-CSS an `css/scenes.css` anhängen (nach dem `.layer--fg`-Block)**

```css
/* ---- Randstücke: Vordergrund, das auf jedem Seitenverhältnis an der Bildkante sitzt ---- */
.edge {
  position: absolute;
  bottom: 0;
  height: 55vh;
  width: 30vw;
}
.edge--left  { left: 20vw; }
.edge--right { right: 20vw; }
.edge > svg {
  display: block;
  width: 100%;
  height: 100%;
  fill: currentColor;
}
```

(`left: 20vw` innerhalb der um 20 vw nach links verschobenen Ebene ist die linke Bildkante; `right: 20vw` entsprechend die rechte.)

- [ ] **Step 3: Bühne der Schlei-Szene füllen**

In `index.html` die `.stage` der Szene `schlei` ersetzen durch:

```html
      <div class="stage" aria-hidden="true">
        <div class="layer layer--sky"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-schlei-sky"/></svg></div>
        <div class="layer layer--far"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-schlei-far"/></svg></div>
        <div class="fog fog--a"></div>
        <div class="layer layer--water"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-schlei-water"/></svg></div>
        <div class="layer layer--mid"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-schlei-mid"/></svg></div>
        <div class="fog fog--b"></div>
        <div class="layer layer--fg">
          <div class="edge edge--left"><svg viewBox="0 0 300 600" preserveAspectRatio="xMinYMax meet"><use href="#s-schilf-l"/></svg></div>
          <div class="edge edge--right"><svg viewBox="0 0 300 600" preserveAspectRatio="xMaxYMax meet"><use href="#s-schilf-r"/></svg></div>
        </div>
        <div class="veil"></div>
      </div>
```

- [ ] **Step 4: Test laufen lassen**

Run: `node --test tests/html.test.js`
Expected: der neue Test schlägt jetzt nur noch für die Szenen `damm`, `lange-strasse`, `faehrberg`, `tuer`, `drueben`, `kaenguru` fehl („keine Ebenen“). Das ist erwartet; die Tasks 9–11 schließen das. Alle anderen Tests PASS.

- [ ] **Step 5: Im Browser prüfen**

`barniz.jump('schlei', 0.3)` quer und hochkant (`tools/mobile.html`), jeweils Screenshot:
- Dunkles Wasser unten, hellerer Nebelhorizont, ferne Uferlinie mit vier winzigen kühlen Lichtern, zwei Dalben rechts der Mitte, Schilf als dunkle Silhouette in beiden unteren Ecken, Eisränder als hellere Zacken am unteren Rand.
- Hochkant: Schilf in beiden unteren Ecken, Dalben im Bild, keine leeren Ränder.
- Beim Scrollen von 0.2 auf 0.6 bewegt sich das Schilf spürbar nach links, das Ufer kaum.

- [ ] **Step 6: Commit**

```bash
git add index.html css/scenes.css tests/html.test.js
git commit -m "Landschaft Schlei und Sprite-Grundlagen"
```

---

### Task 9: Landschaften „Der Damm“ (Szene 2) und „Die Lange Straße“ (Szene 3)

**Files:**
- Modify: `index.html` (Sprite, Bühnen `damm` und `lange-strasse`)

**Interfaces:**
- Consumes: Verläufe und Bühnen-Konvention aus Task 8.
- Produces: Symbole `#s-damm-sky`, `#s-damm-far`, `#s-damm-water`, `#s-damm-mid`, `#s-strasse-sky`, `#s-strasse-far`, `#s-strasse-water`, `#s-strasse-mid`, `#s-haus-ecke-l`, `#s-haus-ecke-r`. Der Damm nutzt als Randstücke `#s-schilf-l`/`#s-schilf-r` aus Task 8.

- [ ] **Step 1: Symbole in `svg.sprite > defs` anhängen (nach `#s-schilf-r`)**

```html
      <!-- Szene 2: Der Damm. Straße von Grödersby auf die Halbinsel, Wasser beidseits. Horizont y 640. -->
      <symbol id="s-damm-sky" viewBox="0 0 1400 1000">
        <rect x="0" y="0" width="1400" height="640" fill="url(#g-sky)"/>
        <rect x="0" y="640" width="1400" height="360" fill="url(#g-water)"/>
      </symbol>
      <symbol id="s-damm-far" viewBox="0 0 1400 1000">
        <!-- Halbinsel: niedrige Häuser, in der Mitte der Kirchturm -->
        <path d="M430 640 L430 626 L470 626 L470 606 L500 588 L530 606 L530 626 L575 626 L575 600 L605 580 L635 600 L635 626 L680 626 L680 612 L705 596 L730 612 L730 626 L748 626 L748 560 L760 520 L772 560 L772 626 L800 626 L800 604 L830 586 L860 604 L860 626 L905 626 L905 610 L930 594 L955 610 L955 626 L990 626 L990 640 Z"/>
        <path d="M0 640 C150 630 300 636 430 632 L430 660 L0 660 Z"/>
        <path d="M990 632 C1120 628 1280 634 1400 630 L1400 660 L990 660 Z"/>
        <g style="fill: var(--ice)" fill-opacity="0.6"><circle cx="512" cy="616" r="1.8"/><circle cx="618" cy="612" r="2"/><circle cx="842" cy="614" r="1.8"/></g>
      </symbol>
      <symbol id="s-damm-water" viewBox="0 0 1400 1000">
        <path style="fill: var(--fog-3)" d="M-200 1000 L660 638 L740 638 L1600 1000 Z"/>
        <path style="fill: var(--ice)" fill-opacity="0.08" d="M-200 1000 L660 638 L672 638 L-120 1000 Z"/>
        <path style="fill: var(--ice)" fill-opacity="0.08" d="M728 638 L740 638 L1600 1000 L1520 1000 Z"/>
        <g style="fill: var(--ice)" fill-opacity="0.10"><rect x="120" y="700" width="90" height="2"/><rect x="1150" y="690" width="70" height="2"/><rect x="60" y="780" width="60" height="2"/><rect x="1260" y="760" width="110" height="2"/></g>
      </symbol>
      <symbol id="s-damm-mid" viewBox="0 0 1400 1000">
        <path d="M0 720 C120 700 260 712 400 690 C480 678 560 672 640 660 L640 700 L0 720 Z"/>
        <path d="M760 660 C840 672 920 680 1000 694 C1140 716 1280 704 1400 724 L1400 760 L760 700 Z"/>
      </symbol>

      <!-- Szene 3: Die Lange Straße. Häuserzeile mit Kirchturm am Ende (im Handy-Band), Laterne rechts der Mitte, Hausecken als Randstücke. Horizont y 700. -->
      <symbol id="s-strasse-sky" viewBox="0 0 1400 1000">
        <rect x="0" y="0" width="1400" height="700" fill="url(#g-sky)"/>
        <rect x="0" y="700" width="1400" height="300" style="fill: var(--fog-2)"/>
      </symbol>
      <symbol id="s-strasse-far" viewBox="0 0 1400 1000">
        <path d="M300 700 L300 640 L340 640 L340 610 L380 585 L420 610 L420 640 L470 640 L470 620 L505 596 L540 620 L540 640 L600 640 L600 600 L650 570 L700 600 L700 640 L712 640 L712 580 L724 530 L736 580 L736 640 L760 640 L760 616 L795 594 L830 616 L830 640 L890 640 L890 606 L935 578 L980 606 L980 640 L1040 640 L1040 700 Z"/>
      </symbol>
      <symbol id="s-strasse-water" viewBox="0 0 1400 1000">
        <path style="fill: var(--fog-3)" d="M-200 1000 L560 700 L800 700 L1600 1000 Z"/>
        <path style="fill: var(--ice)" fill-opacity="0.06" d="M-200 1000 L560 700 L580 700 L-100 1000 Z"/>
      </symbol>
      <symbol id="s-strasse-mid" viewBox="0 0 1400 1000">
        <!-- zwei Häuser in mittlerer Entfernung, quer sichtbar; Laterne im Handy-Band -->
        <path d="M210 1000 L210 520 L290 480 L370 520 L370 1000 Z"/>
        <path d="M1030 1000 L1030 500 L1110 460 L1190 500 L1190 1000 Z"/>
        <g style="fill: var(--night)">
          <rect x="245" y="560" width="26" height="40"/><rect x="305" y="560" width="26" height="40"/>
          <rect x="1065" y="545" width="26" height="40"/><rect x="1125" y="545" width="26" height="40"/>
        </g>
        <g fill="none" stroke="#9FB4C7" stroke-opacity="0.25" stroke-width="4" stroke-linecap="round">
          <path d="M210 520 L290 480 L370 520"/><path d="M1030 500 L1110 460 L1190 500"/>
        </g>
        <!-- Laterne: Schein, Mast, Kopf, Licht -->
        <circle cx="900" cy="629" r="120" fill="url(#g-amber-glow)"/>
        <rect x="896" y="640" width="8" height="360" style="fill: var(--night)"/>
        <rect x="883" y="612" width="34" height="34" rx="4" style="fill: var(--night)"/>
        <rect x="889" y="618" width="22" height="22" rx="2" style="fill: var(--amber)"/>
      </symbol>
      <!-- Randstücke: Hausecken links und rechts (viewBox 300×600) -->
      <symbol id="s-haus-ecke-l" viewBox="0 0 300 600">
        <path d="M0 600 L0 40 L60 20 L300 190 L300 600 Z"/>
        <rect x="140" y="300" width="60" height="90" style="fill: var(--night-2)"/>
      </symbol>
      <symbol id="s-haus-ecke-r" viewBox="0 0 300 600">
        <path d="M300 600 L300 60 L240 40 L0 210 L0 600 Z"/>
        <rect x="100" y="320" width="60" height="90" style="fill: var(--night-2)"/>
      </symbol>
```

- [ ] **Step 2: Bühnen füllen**

`.stage` der Szene `damm`:

```html
      <div class="stage" aria-hidden="true">
        <div class="layer layer--sky"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-damm-sky"/></svg></div>
        <div class="layer layer--far"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-damm-far"/></svg></div>
        <div class="fog fog--a"></div>
        <div class="layer layer--water"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-damm-water"/></svg></div>
        <div class="layer layer--mid"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-damm-mid"/></svg></div>
        <div class="fog fog--b"></div>
        <div class="layer layer--fg">
          <div class="edge edge--left"><svg viewBox="0 0 300 600" preserveAspectRatio="xMinYMax meet"><use href="#s-schilf-l"/></svg></div>
          <div class="edge edge--right"><svg viewBox="0 0 300 600" preserveAspectRatio="xMaxYMax meet"><use href="#s-schilf-r"/></svg></div>
        </div>
        <div class="veil"></div>
      </div>
```

`.stage` der Szene `lange-strasse`:

```html
      <div class="stage" aria-hidden="true">
        <div class="layer layer--sky"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-strasse-sky"/></svg></div>
        <div class="layer layer--far"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-strasse-far"/></svg></div>
        <div class="fog fog--a"></div>
        <div class="layer layer--water"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-strasse-water"/></svg></div>
        <div class="layer layer--mid"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-strasse-mid"/></svg></div>
        <div class="fog fog--b"></div>
        <div class="layer layer--fg">
          <div class="edge edge--left"><svg viewBox="0 0 300 600" preserveAspectRatio="xMinYMax meet"><use href="#s-haus-ecke-l"/></svg></div>
          <div class="edge edge--right"><svg viewBox="0 0 300 600" preserveAspectRatio="xMaxYMax meet"><use href="#s-haus-ecke-r"/></svg></div>
        </div>
        <div class="veil"></div>
      </div>
```

- [ ] **Step 3: Test laufen lassen**

Run: `node --test tests/html.test.js`
Expected: der Ebenen-Test schlägt nur noch für `faehrberg`, `tuer`, `drueben`, `kaenguru` fehl.

- [ ] **Step 4: Im Browser prüfen**

`barniz.jump('damm', 0.3)` und `barniz.jump('lange-strasse', 0.3)` quer und hochkant (`tools/mobile.html`), Screenshots:
- Damm: hellere Straße läuft aus dem Vordergrund auf die Halbinsel in der Mitte zu, Wasser links und rechts, Häuser und Kirchturm winzig am Ende, drei kühle Lichter, Schilf in beiden unteren Ecken groß im Vordergrund. Beim Scrollen 0.2 → 0.7 zieht das Schilf deutlich nach links (12 vw).
- Lange Straße: Häuserzeile mit Kirchturm am Ende, hellere Schneestraße, zwei Häusergiebel mit dunklen Fenstern und Schnee auf den Firsten (quer links und rechts der Straße sichtbar), die Laterne rechts der Mitte mit warmem Schein, dunkle Hausecken in beiden unteren Ecken. Der Laternenschein ist der einzige warme Fleck.
- Hochkant: Kirchturm, Straßenende und Laterne sichtbar, Hausecken in beiden unteren Ecken.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Landschaften Damm und Lange Straße"
```

---

### Task 10: Landschaften „Der Fährberg“ (Szene 4) und „Die Tür“ (Szene 5)

**Files:**
- Modify: `index.html` (Sprite, Bühnen `faehrberg` und `tuer`), `css/scenes.css` (Fenster-Flackern, Türspalt)

**Interfaces:**
- Consumes: Verläufe `#g-amber-glow`, `#g-schwelle`, Filter `#f-blur` (Task 8).
- Produces: Symbole `#s-faehrberg-sky`, `#s-faehrberg-far`, `#s-faehrberg-water`, `#s-faehrberg-haus`, `#s-mauer-l`, `#s-tuer-wand`; CSS-Klassen `.fenster`, `.schwelle`, `.layer--wand`. Das Fährhaus liegt bei x 520–960, damit es auch hochkant im Bild ist. Elemente, die per CSS auf `--p` reagieren, stehen **direkt** in der Bühne (nicht in einem Symbol), weil CSS-Selektoren nicht in den Schattenbaum eines `<use>` greifen.

- [ ] **Step 1: Symbole anhängen (nach `#s-haus-ecke-r`)**

```html
      <!-- Szene 4: Der Fährberg. Straße fällt nach links zum Wasser ab, rechts das Fährhaus. Horizont y 600. -->
      <symbol id="s-faehrberg-sky" viewBox="0 0 1400 1000">
        <rect x="0" y="0" width="1400" height="600" fill="url(#g-sky)"/>
        <rect x="0" y="600" width="1400" height="400" fill="url(#g-water)"/>
      </symbol>
      <symbol id="s-faehrberg-far" viewBox="0 0 1400 1000">
        <!-- Schwansener Ufer, drüben -->
        <path d="M0 596 C200 590 400 598 600 592 C700 590 760 594 800 592 L800 620 L0 620 Z"/>
        <g style="fill: var(--ice)" fill-opacity="0.5"><circle cx="150" cy="592" r="1.6"/><circle cx="520" cy="590" r="1.4"/></g>
      </symbol>
      <symbol id="s-faehrberg-water" viewBox="0 0 1400 1000">
        <g style="fill: var(--ice)" fill-opacity="0.10"><rect x="80" y="640" width="90" height="2"/><rect x="260" y="668" width="60" height="2"/><rect x="140" y="720" width="120" height="2"/><rect x="400" y="700" width="50" height="2"/></g>
        <path style="fill: var(--fog-3)" d="M-200 1000 L-200 860 L500 780 L1600 700 L1600 1000 Z"/>
        <path style="fill: var(--ice)" fill-opacity="0.07" d="M-200 860 L1600 700 L1600 712 L-200 872 Z"/>
      </symbol>
      <symbol id="s-faehrberg-haus" viewBox="0 0 1400 1000">
        <!-- Fährhaus: zwei Geschosse, Satteldach, Giebel zur Straße; alle Fenster dunkel. Liegt im Handy-Band x 520–960. -->
        <path d="M520 760 L520 520 L740 380 L960 520 L960 760 Z"/>
        <rect x="860" y="420" width="30" height="80"/>
        <g style="fill: var(--night)">
          <rect x="560" y="560" width="42" height="60"/><rect x="640" y="560" width="42" height="60"/><rect x="800" y="560" width="42" height="60"/><rect x="880" y="560" width="42" height="60"/>
          <rect x="560" y="660" width="42" height="60"/><rect x="640" y="660" width="42" height="60"/><rect x="800" y="660" width="42" height="60"/><rect x="880" y="660" width="42" height="60"/>
          <rect x="710" y="640" width="60" height="120"/>
        </g>
        <path fill="none" stroke="#9FB4C7" stroke-opacity="0.22" stroke-width="4" stroke-linecap="round" d="M520 520 L740 380 L960 520"/>
      </symbol>
      <!-- Randstück: niedrige Mauer links (viewBox 300×600) -->
      <symbol id="s-mauer-l" viewBox="0 0 300 600">
        <path d="M0 600 L0 420 L300 440 L300 600 Z"/>
        <path fill="none" stroke="#9FB4C7" stroke-opacity="0.2" stroke-width="5" stroke-linecap="round" d="M0 420 L300 440"/>
      </symbol>

      <!-- Szene 5: Die Tür. Nahaufnahme: Wand, Rahmen, Türblatt mit vier Füllungen, Griff. -->
      <symbol id="s-tuer-wand" viewBox="0 0 1400 1000">
        <rect x="0" y="0" width="1400" height="1000" style="fill: var(--fog-1)"/>
        <rect x="380" y="120" width="640" height="880" style="fill: var(--fog-2)"/>
        <rect x="420" y="160" width="560" height="840" style="fill: var(--night-2)"/>
        <g style="fill: var(--fog-1)">
          <rect x="470" y="210" width="200" height="300"/><rect x="730" y="210" width="200" height="300"/>
          <rect x="470" y="560" width="200" height="360"/><rect x="730" y="560" width="200" height="360"/>
        </g>
        <rect x="880" y="600" width="18" height="70" rx="6" style="fill: var(--fog-3)"/>
      </symbol>
```

- [ ] **Step 2: Bühnen füllen**

`.stage` der Szene `faehrberg` (das flackernde Fenster liegt als eigenes SVG in derselben `.layer--mid`, damit es exakt über dem Haus sitzt):

```html
      <div class="stage" aria-hidden="true">
        <div class="layer layer--sky"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-faehrberg-sky"/></svg></div>
        <div class="layer layer--far"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-faehrberg-far"/></svg></div>
        <div class="fog fog--a"></div>
        <div class="layer layer--water"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-faehrberg-water"/></svg></div>
        <div class="layer layer--mid">
          <svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-faehrberg-haus"/></svg>
          <svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice" class="fenster">
            <circle cx="821" cy="590" r="90" fill="url(#g-amber-glow)"/>
            <rect x="800" y="560" width="42" height="60" style="fill: var(--amber)"/>
          </svg>
        </div>
        <div class="fog fog--b"></div>
        <div class="layer layer--fg">
          <div class="edge edge--left"><svg viewBox="0 0 300 600" preserveAspectRatio="xMinYMax meet"><use href="#s-mauer-l"/></svg></div>
        </div>
        <div class="veil"></div>
      </div>
```

`.stage` der Szene `tuer`:

```html
      <div class="stage" aria-hidden="true">
        <div class="layer layer--wand">
          <svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-tuer-wand"/></svg>
          <svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice" class="schwelle">
            <rect x="420" y="900" width="560" height="100" fill="url(#g-schwelle)"/>
            <rect x="420" y="992" width="560" height="8" style="fill: var(--amber)" filter="url(#f-blur)"/>
          </svg>
        </div>
        <div class="fog fog--b"></div>
        <div class="veil"></div>
      </div>
```

- [ ] **Step 3: CSS für Fenster und Türspalt an `css/scenes.css` anhängen**

```css
/* ---- Szene 4: ein Fenster flackert zwischen p 0.55 und 0.62 ---- */
.fenster {
  opacity: calc(
    clamp(0, 1 - abs(var(--p, 0) - 0.585) / 0.035, 1)
    * (0.55 + 0.45 * sin(var(--p, 0) * 900))
  );
}

/* ---- Szene 5: Nahaufnahme, kaum Parallaxe; Türspalt wird mit p heller ---- */
.layer--wand { --fx: -2; --fy: 0; --fs: 0.05; }
.schwelle { opacity: calc(0.25 + var(--p, 0) * 0.45); }
```

- [ ] **Step 4: Test laufen lassen**

Run: `node --test tests/html.test.js`
Expected: der Ebenen-Test schlägt nur noch für `drueben` und `kaenguru` fehl.

- [ ] **Step 5: Im Browser prüfen**

- `barniz.jump('faehrberg', 0.3)`: Wasser links mit fernem Schwansener Ufer, die Straße fällt von rechts nach links ab, das Fährhaus rechts der Mitte mit acht dunklen Fenstern und Tür, Schnee auf dem First, Mauer links unten. Kein warmes Licht. Hochkant (`tools/mobile.html`): Fährhaus vollständig im Bild.
- `barniz.jump('faehrberg', 0.585)`: das Fenster oben rechts im Haus leuchtet bernsteinfarben mit weichem Schein. `barniz.jump('faehrberg', 0.60)` und `0.57`: Helligkeit sichtbar anders (Flackern). `barniz.jump('faehrberg', 0.7)`: wieder dunkel.
- `barniz.jump('tuer', 0.2)`: Tür füllt die Mitte, vier Füllungen, Griff rechts, unten ein schwacher warmer Streifen. `barniz.jump('tuer', 0.8)`: Streifen deutlich heller. Hochkant: Tür füllt fast die ganze Breite, Griff sichtbar.

- [ ] **Step 6: Commit**

```bash
git add index.html css/scenes.css
git commit -m "Landschaften Fährberg mit flackerndem Fenster und Tür mit Lichtspalt"
```

---

### Task 11: „Der Blick nach drüben“ (Szene 6), „Das Känguru“ (Szene 7) und die letzte Frage

**Files:**
- Modify: `index.html` (Sprite, Bühnen `drueben` und `kaenguru`), `css/scenes.css` (Känguru), `js/main.js` (Tipp-Effekt)

**Interfaces:**
- Consumes: `createTypewriter` (Task 6); `onFrame` des Scroll-Motors (Task 7).
- Produces: Symbole `#s-drueben-sky`, `#s-drueben-far`, `#s-drueben-water`, `#s-drueben-mid`, `#s-drueben-steg`, `#s-poller-l`; Klassen `.layer--nebel`, `.kangaroo`, `.kangaroo__body`, `.kangaroo__eye`. Die Fähre liegt bei x 640–940 (Handy-Band); Randstücke: Poller links, Schilf rechts (`#s-schilf-r` aus Task 8). Die Känguru-Silhouette steht direkt in der Bühne (kein Symbol), damit Körper und Augen getrennt per CSS auf `--p` reagieren.

- [ ] **Step 1: Symbole anhängen (nach `#s-tuer-wand`)**

```html
      <!-- Szene 6: Der Blick nach drüben. Anleger, stille Fähre, gegenüber Schwansen. Horizont y 520. -->
      <symbol id="s-drueben-sky" viewBox="0 0 1400 1000">
        <rect x="0" y="0" width="1400" height="520" fill="url(#g-sky)"/>
        <rect x="0" y="520" width="1400" height="480" fill="url(#g-water)"/>
      </symbol>
      <symbol id="s-drueben-far" viewBox="0 0 1400 1000">
        <path d="M0 526 C100 520 200 528 300 522 L330 508 L350 522 L520 522 L540 500 L556 522 L620 520 C760 514 900 526 1040 518 L1060 502 L1078 518 L1400 520 L1400 560 L0 560 Z"/>
        <g style="fill: var(--ice)" fill-opacity="0.5"><circle cx="420" cy="519" r="1.6"/><circle cx="1200" cy="517" r="1.4"/></g>
      </symbol>
      <symbol id="s-drueben-water" viewBox="0 0 1400 1000">
        <g style="fill: var(--ice)" fill-opacity="0.10"><rect x="380" y="560" width="80" height="2"/><rect x="1160" y="556" width="90" height="2"/><rect x="200" y="640" width="120" height="2"/><rect x="1000" y="700" width="70" height="2"/><rect x="150" y="820" width="90" height="2"/><rect x="1180" y="860" width="140" height="2"/></g>
      </symbol>
      <symbol id="s-drueben-mid" viewBox="0 0 1400 1000">
        <!-- Fähre, still am Anleger (Handy-Band x 640–940): flacher Rumpf, Steuerhaus, Mast; zwei Dalben -->
        <path d="M640 548 L654 566 L926 566 L940 548 Z"/>
        <rect x="640" y="540" width="300" height="8"/>
        <rect x="750" y="500" width="76" height="48" rx="2"/>
        <rect x="770" y="482" width="10" height="18"/>
        <rect x="590" y="520" width="12" height="70" rx="3"/><rect x="960" y="516" width="12" height="76" rx="3"/>
      </symbol>
      <symbol id="s-drueben-steg" viewBox="0 0 1400 1000">
        <!-- Steg mit Planken, läuft aufs Wasser zu -->
        <path d="M260 1000 L620 560 L780 560 L1140 1000 Z"/>
        <g fill="none" stroke="#9FB4C7" stroke-opacity="0.10" stroke-width="3">
          <path d="M290 964 L1110 964"/><path d="M340 900 L1060 900"/><path d="M385 846 L1015 846"/><path d="M425 796 L975 796"/><path d="M462 750 L938 750"/><path d="M495 710 L905 710"/><path d="M525 672 L875 672"/><path d="M552 640 L848 640"/><path d="M576 610 L824 610"/><path d="M598 586 L802 586"/>
        </g>
      </symbol>
      <!-- Randstück: Poller links (viewBox 300×600) -->
      <symbol id="s-poller-l" viewBox="0 0 300 600">
        <path d="M60 600 L60 400 C60 370 150 370 150 400 L150 600 Z"/>
      </symbol>
```

- [ ] **Step 2: Bühnen füllen**

`.stage` der Szene `drueben`:

```html
      <div class="stage" aria-hidden="true">
        <div class="layer layer--sky"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-drueben-sky"/></svg></div>
        <div class="layer layer--far"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-drueben-far"/></svg></div>
        <div class="fog fog--a"></div>
        <div class="layer layer--water"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-drueben-water"/></svg></div>
        <div class="layer layer--mid"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-drueben-mid"/></svg></div>
        <div class="fog fog--b"></div>
        <div class="layer layer--fg">
          <svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-drueben-steg"/></svg>
          <div class="edge edge--left"><svg viewBox="0 0 300 600" preserveAspectRatio="xMinYMax meet"><use href="#s-poller-l"/></svg></div>
          <div class="edge edge--right"><svg viewBox="0 0 300 600" preserveAspectRatio="xMaxYMax meet"><use href="#s-schilf-r"/></svg></div>
        </div>
        <div class="veil"></div>
      </div>
```

`.stage` der Szene `kaenguru`:

```html
      <div class="stage" aria-hidden="true">
        <div class="layer layer--sky layer--nebel"></div>
        <div class="fog fog--a"></div>
        <div class="fog fog--b"></div>
        <svg class="kangaroo" viewBox="0 0 400 600" preserveAspectRatio="xMidYMax meet">
          <path class="kangaroo__body" d="M120 152 C132 124 160 98 190 90 C184 62 176 32 170 10 C190 30 206 60 210 80 C220 76 232 76 242 80 C250 58 258 32 268 12 C274 42 264 68 256 88 C264 112 272 150 276 190 C300 250 328 330 320 410 C336 452 366 520 398 582 C372 568 336 536 306 500 C290 540 272 570 252 582 L78 584 C96 566 140 560 196 566 C172 540 142 508 126 476 C110 442 114 402 136 380 C140 340 146 300 160 270 C148 262 140 248 150 238 C160 218 170 200 178 182 C168 170 142 160 120 152 Z"/>
          <circle class="kangaroo__eye" cx="196" cy="120" r="7"/>
          <circle class="kangaroo__eye" cx="228" cy="116" r="7"/>
        </svg>
        <div class="veil"></div>
      </div>
```

- [ ] **Step 3: CSS für das Känguru an `css/scenes.css` anhängen**

```css
/* ---- Szene 7: nur Nebel, dann Augen (p 0.30), dann Silhouette (p 0.45–0.60) ---- */
.layer--nebel {
  background: linear-gradient(180deg, var(--fog-1) 0%, var(--fog-3) 50%, var(--fog-2) 100%);
}
.kangaroo {
  position: absolute;
  left: 55%;
  bottom: 22%;
  height: 55vh;
  width: auto;
  transform: translateX(-50%);
  overflow: visible;
}
@media (orientation: portrait) {
  .kangaroo { height: 45vh; }
}
.kangaroo__body {
  fill: var(--fog-1);
  opacity: clamp(0, (var(--p, 0) - 0.45) / 0.15, 1);
}
.kangaroo__eye {
  fill: var(--amber);
  opacity: clamp(0, (var(--p, 0) - 0.30) / 0.06, 1);
  filter: drop-shadow(0 0 6px var(--amber));
}
```

- [ ] **Step 4: Tipp-Effekt in `js/main.js` verdrahten**

`js/main.js` vollständig ersetzen durch:

```js
import { createScrollEngine } from './scroll.js';
import { coordsFor } from './coords.js';
import { sceneById } from './scenes.js';
import { createTypewriter } from './typewriter.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduced', reduced);

const coordsEl = document.querySelector('.coords');
const labelEl = document.querySelector('.scene-label');
const typedEl = document.querySelector('.frage__typed');
const liveEl = document.getElementById('frage-live');

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
  onFrame({ current, p }) {
    coordsEl.textContent = coordsFor(current, p);
    labelEl.textContent = sceneById(current)?.label ?? '';
    if (current === 'kaenguru' && p >= 0.85 && frage.start()) {
      liveEl.textContent = FRAGE;
    }
  },
});

window.barniz = { jump: engine.jump };
```

- [ ] **Step 5: Tests laufen lassen**

Run: `node --test tests/`
Expected: alle Tests PASS (der Ebenen-Test findet jetzt in jeder Szene Ebenen).

- [ ] **Step 6: Im Browser prüfen**

- `barniz.jump('drueben', 0.3)`: viel Himmel, gegenüber das flache Schwansener Ufer mit drei Baumspitzen, der Steg läuft aus dem Vordergrund ins Wasser, am Stegende die Fähre mit Steuerhaus zwischen zwei Dalben, links unten der Poller, rechts unten Schilf. Hochkant (`tools/mobile.html`): Fähre und Stegende im Bild.
- `barniz.jump('kaenguru', 0.2)`: nur Nebel, keine Augen. `0.36`: zwei warme Augen ohne Körper. `0.6`: Silhouette steht rechts der Mitte, Fußpunkt bei rund 78 % der Höhe, liest sich als Känguru (Ohren, Schnauze, runder Rücken, Schwanz auf dem Boden, langer Fuß nach vorn). Wenn nicht: einzelne Kontrollpunkte des Pfads anpassen (Ohren länger, Rücken runder, Fuß länger), neu laden, bis die Form stimmt.
- `barniz.jump('kaenguru', 0.86)`, dann 3 s warten: „Gibt es Barniz?“ tippt sich in etwa 2 s, Cursor blinkt während des Tippens und verschwindet danach. Zurückscrollen auf 0.5 und wieder vor: die Frage bleibt vollständig stehen, tippt nicht neu.
- Hochkant (390 px): Känguru 45 vh hoch, vollständig im Bild, Frage bricht nicht um.

- [ ] **Step 7: Commit**

```bash
git add index.html css/scenes.css js/main.js
git commit -m "Blick nach drüben, Känguru und die letzte Frage"
```

---

### Task 12: Schnee (`js/snow.js`)

**Files:**
- Create: `js/snow.js`
- Modify: `js/main.js`
- Test: `tests/snow.test.js`

**Interfaces:**
- Consumes: `clamp` (Task 2), `snowFor` (Task 4), `velocity` aus `onFrame` (Task 7).
- Produces: `flakeCount(w, h, density): number` (rein); `createSnow(canvas)` → `{ setTarget({ density, wind }, velocity) }`.

- [ ] **Step 1: Failing Test schreiben**

`tests/snow.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flakeCount } from '../js/snow.js';

test('flakeCount: eine Flocke je 6000 px² mal Dichte, gerundet', () => {
  assert.equal(flakeCount(390, 844, 1.2), Math.round((390 * 844) / 6000 * 1.2)); // 66
  assert.equal(flakeCount(1440, 900, 0), 0);
});

test('flakeCount: Obergrenze 400', () => {
  assert.equal(flakeCount(2560, 1440, 1.2), 400);
});
```

- [ ] **Step 2: Test laufen lassen (muss fehlschlagen)**

Run: `node --test tests/snow.test.js`
Expected: FAIL mit `Cannot find module '.../js/snow.js'`.

- [ ] **Step 3: Implementieren**

`js/snow.js`:

```js
// Schnee auf einem fixen Canvas. Dichte und Wind kommen je Frame aus
// levels.snowFor, Böen aus der Scrollgeschwindigkeit (Spec Abschnitt 3).
// Auf Modulebene kein DOM-Zugriff, damit flakeCount unter Node testbar ist.
import { clamp } from './progress.js';

const AREA_PER_FLAKE = 6000;
const MAX_FLAKES = 400;
const GUST_TAU = 0.8;

export function flakeCount(w, h, density) {
  return Math.min(MAX_FLAKES, Math.round((w * h / AREA_PER_FLAKE) * density));
}

export function createSnow(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let flakes = [];
  let target = { density: 0, wind: 0 };
  let gust = 0;
  let last = performance.now();
  let running = true;

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#9FB4C7';
  }

  function spawn(fromTop) {
    return {
      x: Math.random() * w,
      y: fromTop ? -10 : Math.random() * h,
      r: 0.8 + Math.random() * 1.8,
      vy: 25 + Math.random() * 45,
      phase: Math.random() * Math.PI * 2,
      drift: 8 + Math.random() * 14,
      a: 0.5 + Math.random() * 0.4,
    };
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    gust -= gust * (dt / GUST_TAU);

    const n = flakeCount(w, h, target.density);
    while (flakes.length < n) flakes.push(spawn(true));
    let excess = flakes.length - n;

    const wind = target.wind + gust;
    ctx.clearRect(0, 0, w, h);
    const keep = [];
    for (const f of flakes) {
      f.phase += dt * 1.5;
      f.x += (wind + Math.sin(f.phase) * f.drift) * dt;
      f.y += f.vy * dt;
      if (f.y > h + 10) {
        if (excess > 0) { excess--; continue; }
        Object.assign(f, spawn(true));
      }
      if (f.x < -10) f.x = w + 10;
      else if (f.x > w + 10) f.x = -10;
      ctx.globalAlpha = f.a;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      keep.push(f);
    }
    flakes = keep;
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });
  addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);

  return {
    /** Zielwerte der aktiven Szene; velocity in px/s, positiv = nach unten gescrollt. */
    setTarget(next, velocity = 0) {
      target = next;
      const g = clamp(-velocity * 0.4, -120, 120);
      if (Math.abs(g) > Math.abs(gust)) gust = g;
    },
  };
}
```

- [ ] **Step 4: Test laufen lassen (muss bestehen)**

Run: `node --test tests/snow.test.js`
Expected: 2 Tests PASS.

- [ ] **Step 5: In `js/main.js` verdrahten**

Imports ergänzen:

```js
import { createSnow } from './snow.js';
import { snowFor } from './levels.js';
```

Nach `const liveEl = …` einfügen:

```js
const snow = reduced ? null : createSnow(document.querySelector('.snow'));
```

In `onFrame` die Signatur auf `onFrame({ current, p, velocity })` erweitern und als erste Zeile im Rumpf einfügen:

```js
    snow?.setTarget(snowFor(current, p), velocity);
```

- [ ] **Step 6: Im Browser prüfen**

- Seite neu laden, ganz oben: kein Schnee. `barniz.jump('prolog', 0.8)`: es beginnt zu schneien. `barniz.jump('damm', 0.4)`: dichter Schnee, zieht nach links. `barniz.jump('tuer', 0.4)`: nur wenige Flocken. `barniz.jump('kaenguru', 0.9)`: kein Schnee mehr.
- Schnell mit dem Mausrad scrollen: Flocken machen eine sichtbare Böe und beruhigen sich in unter einer Sekunde.
- Tab wechseln und zurück: Schnee läuft ohne Sprung weiter.
- Konsole: keine Fehler.

- [ ] **Step 7: Commit**

```bash
git add js/snow.js js/main.js tests/snow.test.js
git commit -m "Schnee mit Dichte, Wind und Böen je Szene"
```

---

### Task 13: Laterne, beleuchtete Ebenen und Korn (`js/lantern.js`, `js/grain.js`)

**Files:**
- Create: `js/lantern.js`, `js/grain.js`
- Modify: `index.html` (`.lit`-Kopien in sechs Bühnen), `css/scenes.css`, `js/main.js`

**Interfaces:**
- Consumes: `--lx`/`--ly` (Tokens, Task 1), `.lantern`/`.grain` (base.css, Task 1), Symbole aus Task 8–11.
- Produces: `createLantern()` (setzt `html.has-lantern`, schreibt `--lx`/`--ly` in px); `startGrain(el)`; Klasse `.lit`.

- [ ] **Step 1: `js/lantern.js` schreiben**

```js
// Lichtkegel am Zeiger (Desktop) bzw. Finger (Touch). Schreibt --lx/--ly in px
// auf das Wurzelelement; CSS positioniert Schein und Masken damit.
// Nichts hängt funktional davon ab (Spec Abschnitt 3).
export function createLantern() {
  const root = document.documentElement;
  const fine = matchMedia('(pointer: fine)').matches;
  const rest = () => ({ x: innerWidth * 0.5, y: innerHeight * 0.58 });
  let target = rest();
  const pos = { ...target };
  let restTimer = 0;

  if (fine) {
    addEventListener('pointermove', e => { target = { x: e.clientX, y: e.clientY }; }, { passive: true });
  }
  addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (!t) return;
    target = { x: t.clientX, y: t.clientY };
    clearTimeout(restTimer);
  }, { passive: true });
  addEventListener('touchend', () => {
    clearTimeout(restTimer);
    restTimer = setTimeout(() => { target = rest(); }, 1500);
  }, { passive: true });
  addEventListener('resize', () => { if (!fine) target = rest(); });

  function tick() {
    pos.x += (target.x - pos.x) * 0.12;
    pos.y += (target.y - pos.y) * 0.12;
    root.style.setProperty('--lx', `${pos.x.toFixed(1)}px`);
    root.style.setProperty('--ly', `${pos.y.toFixed(1)}px`);
    requestAnimationFrame(tick);
  }

  root.classList.add('has-lantern');
  tick();
}
```

- [ ] **Step 2: `js/grain.js` schreiben**

```js
// Filmkorn: springt alle 120 ms um einen Zufallsversatz, pausiert im Hintergrund.
export function startGrain(el) {
  let id = 0;
  const tick = () => {
    el.style.backgroundPosition = `${Math.round(Math.random() * 300)}px ${Math.round(Math.random() * 300)}px`;
  };
  const start = () => { if (!id) id = setInterval(tick, 120); };
  const stop = () => { clearInterval(id); id = 0; };
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
}
```

- [ ] **Step 3: `.lit`-Kopien in die Bühnen einsetzen**

In `index.html` jeweils **vor** `<div class="veil"></div>` einfügen. Szene `schlei`:

```html
        <div class="lit">
          <div class="layer layer--mid"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-schlei-mid"/></svg></div>
          <div class="layer layer--fg">
            <div class="edge edge--left"><svg viewBox="0 0 300 600" preserveAspectRatio="xMinYMax meet"><use href="#s-schilf-l"/></svg></div>
            <div class="edge edge--right"><svg viewBox="0 0 300 600" preserveAspectRatio="xMaxYMax meet"><use href="#s-schilf-r"/></svg></div>
          </div>
        </div>
```

Szene `damm`:

```html
        <div class="lit">
          <div class="layer layer--mid"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-damm-mid"/></svg></div>
          <div class="layer layer--fg">
            <div class="edge edge--left"><svg viewBox="0 0 300 600" preserveAspectRatio="xMinYMax meet"><use href="#s-schilf-l"/></svg></div>
            <div class="edge edge--right"><svg viewBox="0 0 300 600" preserveAspectRatio="xMaxYMax meet"><use href="#s-schilf-r"/></svg></div>
          </div>
        </div>
```

Szene `lange-strasse`:

```html
        <div class="lit">
          <div class="layer layer--mid"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-strasse-mid"/></svg></div>
          <div class="layer layer--fg">
            <div class="edge edge--left"><svg viewBox="0 0 300 600" preserveAspectRatio="xMinYMax meet"><use href="#s-haus-ecke-l"/></svg></div>
            <div class="edge edge--right"><svg viewBox="0 0 300 600" preserveAspectRatio="xMaxYMax meet"><use href="#s-haus-ecke-r"/></svg></div>
          </div>
        </div>
```

Szene `faehrberg`:

```html
        <div class="lit">
          <div class="layer layer--mid"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-faehrberg-haus"/></svg></div>
          <div class="layer layer--fg">
            <div class="edge edge--left"><svg viewBox="0 0 300 600" preserveAspectRatio="xMinYMax meet"><use href="#s-mauer-l"/></svg></div>
          </div>
        </div>
```

Szene `tuer`:

```html
        <div class="lit">
          <div class="layer layer--wand"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-tuer-wand"/></svg></div>
        </div>
```

Szene `drueben`:

```html
        <div class="lit">
          <div class="layer layer--mid"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-drueben-mid"/></svg></div>
          <div class="layer layer--fg">
            <svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMax slice"><use href="#s-drueben-steg"/></svg>
            <div class="edge edge--left"><svg viewBox="0 0 300 600" preserveAspectRatio="xMinYMax meet"><use href="#s-poller-l"/></svg></div>
            <div class="edge edge--right"><svg viewBox="0 0 300 600" preserveAspectRatio="xMaxYMax meet"><use href="#s-schilf-r"/></svg></div>
          </div>
        </div>
```

- [ ] **Step 4: CSS an `css/scenes.css` anhängen**

```css
/* ---- Laterne: Kopien von Mittel- und Vordergrund, nur im Lichtkreis sichtbar ---- */
.lit {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  opacity: 0;
  -webkit-mask-image: radial-gradient(circle 200px at var(--lx) var(--ly), #000 0%, transparent 100%);
  mask-image: radial-gradient(circle 200px at var(--lx) var(--ly), #000 0%, transparent 100%);
}
html.has-lantern .lit { opacity: 0.55; }
.lit .layer { color: var(--fog-3); }
```

- [ ] **Step 5: In `js/main.js` verdrahten**

Imports ergänzen:

```js
import { createLantern } from './lantern.js';
import { startGrain } from './grain.js';
```

Am Ende der Datei (vor `window.barniz = …`) einfügen:

```js
if (!reduced) {
  createLantern();
  startGrain(document.querySelector('.grain'));
}
```

- [ ] **Step 6: Tests und Browser**

Run: `node --test tests/`
Expected: alle PASS (die neuen `use`-Elemente zeigen auf vorhandene Symbole).

Im Browser:
- `barniz.jump('damm', 0.3)`, Maus über das Schilf rechts unten bewegen: im Umkreis von etwa 200 px werden die Halme heller (fog-3), außerhalb bleiben sie dunkel. Ein schwacher warmer Schein folgt dem Zeiger mit leichtem Nachlauf. `getComputedStyle(document.documentElement).getPropertyValue('--lx')` ändert sich mit der Maus.
- `barniz.jump('tuer', 0.4)`: Maus über die Türfüllungen: Kanten werden im Lichtkreis sichtbar.
- Beim Scrollen wandert die beleuchtete Kopie exakt mit ihrer Ebene (kein Versatz zwischen Schilf und hellem Schilf).
- Das Korn flimmert leicht (in einem Screenshot als feine Körnung sichtbar; bei zwei Screenshots im Abstand von 200 ms unterscheidet sich das Muster).
- 390 px Breite mit Touch-Emulation: Beim Wischen folgt das Licht dem Finger; 1,5 s nach dem Loslassen kehrt es in die Ruhelage zurück.

- [ ] **Step 7: Commit**

```bash
git add js/lantern.js js/grain.js index.html css/scenes.css js/main.js
git commit -m "Laterne mit beleuchteten Ebenen und Filmkorn"
```

---

### Task 14: Ton (`js/audio.js`)

**Files:**
- Create: `js/audio.js`
- Modify: `js/main.js`

**Interfaces:**
- Consumes: `audioFor` (Task 4), Button `.hud--sound` (Task 7).
- Produces: `createAudio(button)` → `{ setLevels({ wind, water, bass }) }`. Der `AudioContext` entsteht erst beim ersten Klick.

- [ ] **Step 1: `js/audio.js` schreiben**

```js
// Ambient-Ton, komplett synthetisiert (Spec Abschnitt 4, „Ton“):
// Wind = weißes Rauschen durch einen langsam wandernden Bandpass,
// Wasser = braunes Rauschen durch einen Tiefpass,
// Bass hinter der Tür = drei Sinus-Oszillatoren (A1, E2, A2) durch einen
// Tiefpass mit trägem Puls bei 100 bpm.
const MASTER = 0.5;
const TAU = 1.5;

function noiseBuffer(ctx, brown) {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.5;
    } else {
      d[i] = white;
    }
  }
  return buf;
}

function build() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Wind
  const windSrc = ctx.createBufferSource();
  windSrc.buffer = noiseBuffer(ctx, false);
  windSrc.loop = true;
  const windBp = ctx.createBiquadFilter();
  windBp.type = 'bandpass';
  windBp.Q.value = 0.8;
  windBp.frequency.value = 600;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 300; // 600 ± 300 Hz
  lfo.connect(lfoGain).connect(windBp.frequency);
  const windGain = ctx.createGain();
  windGain.gain.value = 0;
  windSrc.connect(windBp).connect(windGain).connect(master);

  // Wasser
  const waterSrc = ctx.createBufferSource();
  waterSrc.buffer = noiseBuffer(ctx, true);
  waterSrc.loop = true;
  const waterLp = ctx.createBiquadFilter();
  waterLp.type = 'lowpass';
  waterLp.frequency.value = 220;
  const waterGain = ctx.createGain();
  waterGain.gain.value = 0;
  waterSrc.connect(waterLp).connect(waterGain).connect(master);

  // Bass hinter der Tür
  const bassLp = ctx.createBiquadFilter();
  bassLp.type = 'lowpass';
  bassLp.frequency.value = 180;
  const pulse = ctx.createGain();
  pulse.gain.value = 0.65;
  const pulseLfo = ctx.createOscillator();
  pulseLfo.type = 'square';
  pulseLfo.frequency.value = 100 / 60;
  const pulseSmooth = ctx.createBiquadFilter();
  pulseSmooth.type = 'lowpass';
  pulseSmooth.frequency.value = 6;
  const pulseDepth = ctx.createGain();
  pulseDepth.gain.value = 0.175; // ±0.175 um 0.65 → etwa 35 % Tiefe
  pulseLfo.connect(pulseSmooth).connect(pulseDepth).connect(pulse.gain);
  const bassGain = ctx.createGain();
  bassGain.gain.value = 0;
  for (const f of [55, 82.4, 110]) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = 0.33;
    o.connect(g).connect(bassLp);
    o.start();
  }
  bassLp.connect(pulse).connect(bassGain).connect(master);

  windSrc.start();
  waterSrc.start();
  lfo.start();
  pulseLfo.start();

  return { ctx, master, windGain, waterGain, bassGain };
}

export function createAudio(button) {
  let nodes = null;
  let on = false;
  let levels = { wind: 0, water: 0, bass: 0 };

  function apply() {
    if (!nodes || !on) return;
    const t = nodes.ctx.currentTime;
    nodes.windGain.gain.setTargetAtTime(levels.wind, t, TAU);
    nodes.waterGain.gain.setTargetAtTime(levels.water, t, TAU);
    nodes.bassGain.gain.setTargetAtTime(levels.bass, t, TAU);
  }

  async function toggle() {
    if (!nodes) nodes = build();
    on = !on;
    const { ctx, master } = nodes;
    if (on) {
      await ctx.resume();
      master.gain.setTargetAtTime(MASTER, ctx.currentTime, 0.3);
      apply();
    } else {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      setTimeout(() => { if (!on) ctx.suspend(); }, 700);
    }
    button.setAttribute('aria-pressed', String(on));
    button.textContent = on ? 'Ton aus' : 'Ton an';
  }

  button.addEventListener('click', toggle);

  return {
    setLevels(next) {
      levels = next;
      apply();
    },
  };
}
```

- [ ] **Step 2: In `js/main.js` verdrahten**

Imports ergänzen (die `levels.js`-Zeile erweitern):

```js
import { snowFor, audioFor } from './levels.js';
import { createAudio } from './audio.js';
```

Nach `const snow = …` einfügen:

```js
const audio = createAudio(document.querySelector('.hud--sound'));
```

In `onFrame` nach der Schnee-Zeile einfügen:

```js
    audio.setLevels(audioFor(current, p));
```

- [ ] **Step 3: Im Browser prüfen (Ton am Rechner an)**

- Vor dem Klick: kein `AudioContext` (Konsole: `performance.getEntriesByType` ist hier unnötig, es reicht: kein Ton, Schalter zeigt „TON AN“).
- Klick auf „TON AN“: Schalter zeigt „TON AUS“, `aria-pressed="true"`, leiser Wind hörbar, kein Knacken. `barniz.jump('schlei', 0.4)`: Wasser kommt dazu. `barniz.jump('damm', 0.4)`: Wind deutlich stärker. `barniz.jump('tuer', 0.5)`: dumpfer, pulsierender Bass, Wind fast weg. `barniz.jump('kaenguru', 0.9)`: nur noch Wind.
- Klick auf „TON AUS“: Ton blendet in unter einer Sekunde aus, kein Knacken; erneuter Klick schaltet wieder ein.
- Tab wechseln: Ton läuft weiter (gewollt, wie Musik im Hintergrund); Schalter aus beendet ihn.
- Konsole: keine Warnung „AudioContext was not allowed to start“.

- [ ] **Step 4: Commit**

```bash
git add js/audio.js js/main.js
git commit -m "Synthetisierter Ambient-Ton mit Pegeln je Szene"
```

---

### Task 15: Reduced Motion, Zugänglichkeit, Impressum, OG-Bild, Gewicht

**Files:**
- Create: `impressum.html`, `tools/og.html`, `assets/og.png`
- Modify: `css/scenes.css`, `js/main.js`, `README.md`
- Test: `tests/weight.test.js`

**Interfaces:**
- Consumes: alles Bisherige.
- Produces: `html.reduced`-Verhalten, fertige `main.js`, Seitengewicht unter 300 kB.

- [ ] **Step 1: Failing Test schreiben (Gewicht)**

`tests/weight.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';

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
});
```

Run: `node --test tests/weight.test.js`
Expected: erster Test PASS (oder FAIL mit der Zahl, dann sind die SVG-Pfade zu kürzen), zweiter FAIL mit `ENOENT`.

- [ ] **Step 2: `impressum.html` schreiben**

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Impressum</title>
  <meta name="robots" content="noindex">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <style>
    main { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 1.5em; padding: var(--gutter); text-align: center; }
    main a { text-decoration: none; border-bottom: 1px solid var(--fog-3); }
    main a:focus-visible { outline: 1px solid var(--ice); outline-offset: 3px; }
  </style>
</head>
<body>
  <main class="mono">
    <p>Impressum – folgt.</p>
    <a href="./">Zurück</a>
  </main>
</body>
</html>
```

- [ ] **Step 3: Reduced-Motion-Regeln an `css/scenes.css` anhängen**

```css
/* ---- prefers-reduced-motion: keine Parallaxe, kein Nebeltreiben, keine Unschärfe ---- */
@media (prefers-reduced-motion: reduce) {
  .layer, .fog { transform: none !important; }
  .fog::before { animation: none; }
  .line {
    --fade-in: clamp(0, (var(--p, 0) - var(--in, 0)) / 0.02, 1);
    filter: none;
    transform: none;
  }
  .frage__typed::after { display: none; }
  .kangaroo__body { opacity: clamp(0, (var(--p, 0) - 0.30) / 0.05, 1); }
  .kangaroo__eye { filter: none; }
  .fenster { opacity: clamp(0, 1 - abs(var(--p, 0) - 0.585) / 0.035, 1); }
}
html.reduced .snow,
html.reduced .lantern { display: none; }
html.reduced .frage { opacity: clamp(0, (var(--p, 0) - 0.30) / 0.05, 1); }
```

- [ ] **Step 4: `js/main.js` in endgültiger Fassung**

```js
import { createScrollEngine } from './scroll.js';
import { coordsFor } from './coords.js';
import { sceneById } from './scenes.js';
import { createTypewriter } from './typewriter.js';
import { createSnow } from './snow.js';
import { snowFor, audioFor } from './levels.js';
import { createAudio } from './audio.js';
import { createLantern } from './lantern.js';
import { startGrain } from './grain.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduced', reduced);

const coordsEl = document.querySelector('.coords');
const labelEl = document.querySelector('.scene-label');
const typedEl = document.querySelector('.frage__typed');
const liveEl = document.getElementById('frage-live');

const FRAGE = 'Gibt es Barniz?';
const frage = createTypewriter({
  text: FRAGE,
  totalMs: 2200,
  write(partial, done) {
    typedEl.textContent = partial;
    typedEl.classList.toggle('is-done', done);
  },
});
if (reduced) {
  // Ohne Tipp-Effekt: Frage steht sofort, CSS blendet sie ab p 0.30 ein.
  typedEl.textContent = FRAGE;
  typedEl.classList.add('is-done');
}

const snow = reduced ? null : createSnow(document.querySelector('.snow'));
const audio = createAudio(document.querySelector('.hud--sound'));

const engine = createScrollEngine({
  sections: document.querySelectorAll('.scene'),
  onFrame({ current, p, velocity }) {
    snow?.setTarget(snowFor(current, p), velocity);
    audio.setLevels(audioFor(current, p));
    coordsEl.textContent = coordsFor(current, p);
    labelEl.textContent = sceneById(current)?.label ?? '';
    if (!reduced && current === 'kaenguru' && p >= 0.85 && frage.start()) {
      liveEl.textContent = FRAGE;
    }
  },
});

if (!reduced) {
  createLantern();
  startGrain(document.querySelector('.grain'));
}

window.barniz = { jump: engine.jump };
```

- [ ] **Step 5: OG-Bild erzeugen**

`tools/og.html`:

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="../css/tokens.css">
  <link rel="stylesheet" href="../css/base.css">
  <style>
    html, body { width: 1200px; height: 630px; overflow: hidden; }
    body { display: grid; place-items: center; background: var(--night); }
    .q { font-family: var(--font-serif); font-weight: 300; font-style: italic; font-size: 320px; color: var(--ice); line-height: 1; }
    .v { position: fixed; inset: 0; background: radial-gradient(ellipse at center, transparent 40%, rgba(7,11,20,0.7) 100%); }
  </style>
</head>
<body><div class="v"></div><div class="q">?</div></body>
</html>
```

Run (Server aus Task 7 läuft auf 8080):
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1200,630 --screenshot="$PWD/assets/og.png" "http://localhost:8080/tools/og.html"
file assets/og.png
```
Expected: `PNG image data, 1200 x 630`. Bild öffnen: nachtblauer Grund, großes kursives `?` in Eisblau, Vignette. Falls Chrome nicht unter diesem Pfad liegt: die Seite in Chrome bei 1200×630 öffnen und mit den Chrome-Werkzeugen einen Screenshot nach `assets/og.png` sichern.

- [ ] **Step 6: README um Live-Adresse ergänzen**

In `README.md` nach der ersten Zeile einfügen:

```markdown
Live: <https://chrom5000.github.io/barniz/>
```

- [ ] **Step 7: Tests und Browser**

Run: `node --test tests/`
Expected: alle PASS, Gewicht deutlich unter 300 kB (Zahl notieren).

Im Browser:
- DevTools → Rendering → „Emulate CSS prefers-reduced-motion: reduce“, Seite neu laden: kein Canvas sichtbar (`getComputedStyle(document.querySelector('.snow')).display === 'none'`), keine Laterne, Ebenen bewegen sich beim Scrollen nicht, Texte erscheinen ohne Unschärfe, `barniz.jump('kaenguru', 0.4)`: Känguru und Frage stehen vollständig ohne Tipp-Effekt.
- Emulation wieder aus. Tastatur: Tab erreicht zuerst „TON AN“ (Fokusring in Eisblau sichtbar), dann „Impressum“. Enter auf Impressum öffnet die Platzhalterseite, „Zurück“ führt zur Startseite.
- Ohne Ton-Klick: `barniz.jump('kaenguru', 0.9)`, 3 s warten, `document.getElementById('frage-live').textContent === 'Gibt es Barniz?'`.
- Kontrast: Text `#E6EEF5` auf `#070B14` liegt bei rund 17:1, Koordinaten `#5B6673` auf `#070B14` bei rund 4.6:1 (mit einem Kontrastrechner nachprüfen; sollten die Koordinaten unter 4.5:1 liegen, `--mute` auf `#61707E` anheben).
- Netzwerk-Tab: keine Anfrage an fremde Hosts.

- [ ] **Step 8: Commit**

```bash
git add impressum.html tools/og.html assets/og.png css/scenes.css js/main.js README.md tests/weight.test.js
git commit -m "Reduced Motion, Impressum-Platzhalter, OG-Bild und Gewichtstest"
```

---

### Task 16: Veröffentlichung auf GitHub Pages und Live-Prüfung

**Files:**
- Keine neuen Projektdateien; Repo `chrom5000/barniz` auf GitHub.

**Interfaces:**
- Consumes: den vollständigen Stand aus Task 1–15, `gh` angemeldet als `chrom5000`.
- Produces: `https://chrom5000.github.io/barniz/`.

- [ ] **Step 1: Arbeitsbaum sauber, Tests grün**

```bash
git status --short
node --test tests/
```
Expected: keine Änderungen, alle Tests PASS.

- [ ] **Step 2: Repo anlegen und pushen**

```bash
gh repo create chrom5000/barniz --public --source=. --remote=origin --description "Ein Winter an der Schlei. Und eine Frage." --push
gh repo view chrom5000/barniz --json url,visibility
```
Expected: `"visibility": "PUBLIC"`, Branch `main` gepusht.

- [ ] **Step 3: GitHub Pages aktivieren**

```bash
echo '{"source":{"branch":"main","path":"/"}}' | gh api -X POST repos/chrom5000/barniz/pages --input - \
  || echo '{"source":{"branch":"main","path":"/"}}' | gh api -X PUT repos/chrom5000/barniz/pages --input -
gh api repos/chrom5000/barniz/pages --jq '{url: .html_url, status: .status}'
```
Expected: `url` = `https://chrom5000.github.io/barniz/`, `status` = `building` oder `built`.

- [ ] **Step 4: Auf den Build warten**

```bash
for i in $(seq 1 24); do
  code=$(curl -s -o /dev/null -w "%{http_code}" https://chrom5000.github.io/barniz/)
  echo "Versuch $i: HTTP $code"
  [ "$code" = "200" ] && break
  sleep 10
done
curl -sI https://chrom5000.github.io/barniz/assets/fonts/fraunces-300.woff2 | head -1
```
Expected: innerhalb von vier Minuten `HTTP 200`; die Schrift antwortet mit `200`.

- [ ] **Step 5: Live-Seite im Browser prüfen**

`https://chrom5000.github.io/barniz/` in Chrome öffnen:
- Konsole ohne Fehler, Netzwerk: alle Anfragen gehen an `chrom5000.github.io`, keine 404 (insbesondere CSS, JS-Module, Schriften, favicon).
- Komplett durchscrollen bei 1440 px und bei 390 px: alle acht Szenen, Känguru, Frage, Fußzeile, Impressum-Link.
- Einmal von einem echten Handy aufrufen, wenn verfügbar; sonst Chrome-Geräteemulation iPhone-Größe mit Touch.

- [ ] **Step 6: Lighthouse (mobil)**

```bash
npx --yes lighthouse https://chrom5000.github.io/barniz/ --only-categories=performance,accessibility --chrome-flags="--headless=new" --quiet --output=json --output-path="$SCRATCH/lighthouse.json"
node -e 'const r=require(process.argv[1]).categories; console.log("Performance", Math.round(r.performance.score*100), "Accessibility", Math.round(r.accessibility.score*100))' "$SCRATCH/lighthouse.json"
```
(`$SCRATCH` = das Scratchpad-Verzeichnis der Sitzung.)
Expected: Performance ≥ 90, Accessibility ≥ 95. Liegt Performance darunter: im JSON `audits` nach `largest-contentful-paint` und `total-blocking-time` schauen; üblicher Hebel ist `font-display: swap` (ist gesetzt) und die Schneeflockenzahl (MAX_FLAKES in `js/snow.js` auf 300 senken). Liegt Accessibility darunter: die gemeldeten Audits einzeln beheben und erneut messen.

- [ ] **Step 7: Abschluss**

Dem Auftraggeber melden: Live-URL, Lighthouse-Zahlen, Seitengewicht, was nachträglich anpassbar ist (Texte in `index.html`, Zahlen in `js/scenes.js`, Impressum in `impressum.html`, eigene Domain per `CNAME`-Datei im Root plus DNS-Eintrag).

---

## Selbst-Review des Plans

- **Spec-Abdeckung:** Dramaturgie und Texte (Task 7, 11), Farben/Typografie/Textur (Task 1), Landschaften mit Parallaxe-Faktoren und Nebel (Task 7–11), Schnee-Parameter (Task 3, 4, 12), Laterne mit Maskenkopien (Task 13), Koordinaten (Task 5, 7), Känguru mit Augen vor Silhouette (Task 11), Ton-Schalter und Pegel (Task 3, 4, 14), Mobile/Safe-Area/dvh (Task 1, 7), Reduced Motion und aria-live (Task 15), Gewicht < 300 kB (Task 15), Hosting und Lighthouse (Task 16), Impressum-Platzhalter (Task 15), OG-Bild (Task 15), Fußzeile (Task 7).
- **Abweichungen von der Spec, bewusst:** Känguru-Silhouette steht direkt in der Bühne statt als Symbol (CSS kann nicht in `<use>`-Schattenbäume greifen, Körper und Augen brauchen getrennte Deckkraft); gleiche Begründung für Fenster und Türspalt. Die Ebenenklasse für die Tür heißt `.layer--wand` (Nahaufnahme, eigene Faktoren). Die Böe zieht bei Abwärtsscrollen nach links (`-velocity`), passend zu den negativen Grundwinden.
- **Typkonsistenz geprüft:** `onFrame({ current, p, velocity })` (Task 7) wird in Task 12/14/15 gleich verwendet; `snowFor`/`audioFor` liefern `{ density, wind }` bzw. `{ wind, water, bass }` (Task 4) und werden so in `snow.setTarget` und `audio.setLevels` konsumiert; `createTypewriter` → `start(): boolean` (Task 6) wird in Task 11/15 als Bedingung genutzt; `barniz.jump(id, p)` (Task 7) in allen Prüfschritten.
