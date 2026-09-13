# Barniz – Design-Spec

Datum: 2026-09-13
Status: vom Auftraggeber abgenommen (Dramaturgie, Bildsprache, Technik)

## 1. Zweck

Eine einzige Scroll-Seite, die die Möglichkeit einer Winter-Zwischennutzungs-Bar im leerstehenden Fährhaus am Fährberg in Arnis andeutet. Nichts wird behauptet, nichts versprochen, nichts konkret genannt (kein Datum, keine Öffnungszeit, kein Betreiber, keine Kontaktmöglichkeit). Die Seite führt durch eine rätselhafte Winterlandschaft an der Schlei und endet mit einem Känguru, das fragt: „Gibt es Barniz?“ Danach kommt nichts mehr außer einer grauen Fußzeile.

Der Name „Barniz“ fällt auf der ganzen Seite genau **einmal**, in der letzten Zeile.

### Geografische Leitplanken (nicht verhandelbar)

- Arnis liegt auf einer Halbinsel in der Schlei, Schleswig-Holstein, auf der **Angelner** Seite (Nordufer).
- **Schwansen** liegt gegenüber, auf der anderen Seite des Wassers. Schwansen ist auf dieser Seite immer „drüben“, nie „hier“.
- Man erreicht Arnis über den Damm von Grödersby (Angeln). Die Lange Straße führt über die Halbinsel, der Fährberg fällt zum Wasser ab, dort liegt das Fährhaus und der Anleger der Fähre nach Sundsacker (Schwansen).
- Arnis ist die kleinste Stadt Deutschlands (rund 300 Einwohner), gegründet 1667.

## 2. Dramaturgie

Die Seite ist eine lange, vertikale Scroll-Strecke aus acht Szenen plus Fußzeile. Jede Szene ist ein Bild, das beim Scrollen lebt, mit ein bis vier Zeilen Text. Wiederkehrendes Motiv: **„Was wäre, wenn …“**. Sprache: Deutsch, knapp, keine Anrede.

Textzeilen erscheinen gebunden an den Szenenfortschritt `p` (0 → 1). Jede Zeile hat einen Einblendpunkt; von `p = 0.82` bis `0.90` lösen sich alle Zeilen einer Szene wieder auf (Ausnahme: Szene 7, dort bleibt alles stehen). Einblenden: 0.08 Fortschritt lang, von `opacity 0; filter: blur(8px); translateY(0.4em)` nach `opacity 1; blur 0; translateY 0`.

| # | Kennung | Höhe | Bild | Textzeilen (Einblendpunkt `p`) |
|---|---|---|---|---|
| 0 | `prolog` | 150 vh | Schwarz. Ab `p = 0.55` setzt Schnee ein (Dichte von 0 auf Szenenwert). | 0.10 „Was wäre, wenn …“ |
| 1 | `schlei` | 250 vh | Dunkles Wasser mit Eisrändern, Nebel, ferne Lichter am Nordufer. Langsame Annäherung (Ebenen skalieren minimal). | 0.15 „Ein Winter an der Schlei.“ · 0.40 „Nördliches Ufer. Angeln.“ · 0.60 „Irgendwo hier liegt eine Halbinsel.“ |
| 2 | `damm` | 250 vh | Schmale Straße führt aufs Wasser hinaus, Schilf links und rechts zieht schnell vorbei, vorn Lichter der Halbinsel. | 0.15 „Eine Straße, die aufs Wasser führt.“ · 0.45 „Am Ende: die kleinste Stadt Deutschlands.“ |
| 3 | `lange-strasse` | 250 vh | Niedrige Häusersilhouetten, eine Straße, dunkle Fenster, eine einzige Laterne (warm). | 0.15 „Rund dreihundert Menschen. Eine Straße. Eine Kirche.“ · 0.45 „Und im Winter: sehr viel Ruhe.“ · 0.65 „Was wäre, wenn …“ (kleiner gesetzt) |
| 4 | `faehrberg` | 250 vh | Straße fällt zum Wasser ab. Fährhaus als Silhouette, alle Fenster dunkel. Zwischen `p = 0.55` und `0.62` flackert **ein** Fenster warm auf, dann wieder aus. | 0.15 „Am Fährberg steht ein Haus.“ · 0.40 „Es steht leer.“ · 0.70 „Oder?“ |
| 5 | `tuer` | 250 vh | Ganz nah an der Tür. Unter dem Türspalt ein Hauch warmes Licht, das mit `p` leicht zunimmt. | 0.12 „Vielleicht Sessel, die schon drei Leben hatten.“ · 0.32 „Vielleicht ein Plattenspieler.“ · 0.52 „Vielleicht ein Drink, den es so nur hier gäbe.“ · 0.72 „Vielleicht gar nichts.“ |
| 6 | `drueben` | 250 vh | Der Fähranleger, das Wasser, gegenüber das dunkle Ufer von Schwansen. Die Fähre liegt still am Anleger. | 0.15 „Drüben: Schwansen.“ · 0.35 „Hier: Angeln.“ · 0.55 „Dazwischen: das Wasser.“ · 0.72 „Und eine Frage.“ |
| 7 | `kaenguru` | 200 vh | `0–0.30` Nebel verdichtet sich, Landschaft verschwindet. `0.30` zwei warme Augen. `0.45` Silhouette wird sichtbar (etwas dunklerer Nebel). | 0.50 „Ein Känguru an der Schlei ergibt keinen Sinn.“ · 0.65 „Eine Bar in Arnis im Winter auch nicht.“ · **0.85 „Gibt es Barniz?“** (Tipp-Effekt, bleibt stehen) |
| – | Fußzeile | ~20 vh, normaler Fluss | Grau, winzig, Mono. | „Arnis · ein Winter · eine Schnapsidee“ und ein Link „Impressum“ → `impressum.html` |

Die letzte Frage ist der einzige zeitgesteuerte Effekt: Erreicht `p` in Szene 7 erstmals 0.85, tippt sich „Gibt es Barniz?“ über etwa 2,2 s Buchstabe für Buchstabe (Cursor-Strich blinkt, verschwindet nach dem letzten Zeichen). Der Effekt läuft genau einmal und bleibt danach vollständig sichtbar, auch beim Zurückscrollen.

`impressum.html` ist eine Platzhalterseite im selben Stil (nur Grundfarbe, Mono-Text „Impressum – folgt.“ und ein Link zurück). Der Auftraggeber füllt oder löscht sie später.

## 3. Bildsprache

### Farben (Tokens in `css/tokens.css`)

| Token | Wert | Verwendung |
|---|---|---|
| `--night` | `#070B14` | Grund |
| `--night-2` | `#0C1322` | Himmel unten, Wasser |
| `--fog-1` | `#18202F` | ferne Ebenen |
| `--fog-2` | `#28323F` | Mittelgrund |
| `--fog-3` | `#3A4552` | Nebelverläufe |
| `--ice` | `#9FB4C7` | Eisränder, Schneeflocken (mit Blaustich), Text sekundär |
| `--snow` | `#E6EEF5` | Haupttext |
| `--amber` | `#F2B84B` | die **einzige** warme Farbe: Laterne, Fenster, Türspalt, Augen |
| `--mute` | `#73808E` | Fußzeile, Koordinaten, Ton-Schalter (4,9:1 auf `--night`; `#5B6673` lag bei 3,4:1) |

Warm bedeutet immer „Möglichkeit“. `--amber` kommt sonst nirgends vor.

### Typografie

Beide Schriften **selbst gehostet** in `assets/fonts/` als woff2, Latin-Subset (kein Laden von Google-Servern, DSGVO).

Dateien: `assets/fonts/fraunces-300.woff2`, `assets/fonts/fraunces-300-italic.woff2`, `assets/fonts/jetbrains-mono-400.woff2`, dazu die OFL-Lizenztexte.

- **Fraunces** (SIL OFL), zwei statische Schnitte: Light 300 und Light Italic 300. Für alle Textzeilen der Szenen und die letzte Frage. Größe `clamp(1.6rem, 4.5vw + 0.5rem, 3.4rem)`, Zeilenhöhe 1.25, maximale Zeilenbreite 18em, mittig gesetzt.
- **JetBrains Mono** (SIL OFL), Regular 400. Für Koordinaten, Szenenkennung, Ton-Schalter, Fußzeile, Impressum. Größe 0.7rem, Versalien, `letter-spacing: 0.18em`.

Fallbacks: `Georgia, serif` bzw. `ui-monospace, Menlo, monospace`.

### Textur

- **Korn:** ein fixes, vollflächiges Element mit SVG-`feTurbulence`-Rauschen als `background-image` (Data-URI), `opacity 0.06`, `mix-blend-mode: overlay`. Ohne reduced-motion springt das Korn alle 120 ms per `background-position` um einen Zufallsversatz (JS, `setInterval`, pausiert bei verstecktem Tab).
- **Vignette:** radialer Verlauf von transparent (Mitte) nach `--night` bei 55 % Deckkraft (Rand), fix über allem außer Text und Bedienelementen.

### Landschaft

Jede Szene besteht aus 4–6 inline-SVG-Ebenen (`viewBox` breiter als hoch, `preserveAspectRatio="xMidYMax slice"`, Breite 140 % des Viewports, damit hochkant beschnitten statt gestaucht wird). Ebenen sind reine Silhouetten in den Nebeltönen; keine Details, keine Konturen. Reihenfolge und Parallaxe-Faktor (Verschiebung in vw über die ganze Szene, negativ = nach links/oben):

| Ebene | Faktor x | Faktor y | Skalierung |
|---|---|---|---|
| Himmel / Verlauf | 0 | 0 | 1.00 → 1.00 |
| fernes Ufer | -1 | 0 | 1.00 → 1.03 |
| Wasser / Straße | 0 | 0 | 1.00 → 1.06 |
| Mittelgrund | -3 | 1 | 1.00 → 1.08 |
| Vordergrund (Schilf, Häuser) | -12 | 2 | 1.00 → 1.15 |
| Nebel (2 Verläufe) | -4 / +6 | 0 | 1.00 |

Nebel sind weiche, halbtransparente Ellipsen (`radial-gradient`) zwischen den Ebenen, die zusätzlich zur Scrollbewegung eine langsame CSS-Keyframe-Drift (40–70 s, `translateX` ±3 %) haben.

**Szenenwechsel:** Im Bereich `p 0.85 → 1.0` einer Szene und `0 → 0.15` der nächsten deckt ein Nebel-Overlay (`--fog-3` mit Verlauf) das Bild bis zu 100 % ab und gibt es wieder frei. Es gibt keine harten Schnitte.

### Schnee

Ein fixes Canvas über der Landschaft, unter Text und Bedienelementen. Parameter je Szene (Dichte in Flocken pro 6 000 px² Viewportfläche, Wind in px/s horizontal):

| Szene | Dichte | Wind |
|---|---|---|
| prolog | 0 → 0.6 (ab `p 0.55` linear) | 0 |
| schlei | 0.8 | -20 |
| damm | 1.2 | -60 |
| lange-strasse | 0.7 | -15 |
| faehrberg | 0.6 | -10 |
| tuer | 0.3 | 0 |
| drueben | 1.0 | -35 |
| kaenguru | 0.5 → 0 (ab `p 0.45` linear) | 0 |

Zwischen Szenen wird linear überblendet. Obergrenze 400 Flocken. Scrollgeschwindigkeit addiert eine Böe: `wind += clamp(scrollVelocity * 0.4, -120, 120)`, die mit Zeitkonstante 0.8 s abklingt. Flocken: Radius 0.8–2.6 px (skaliert mit DPR), Fallgeschwindigkeit 25–70 px/s, leichte Sinus-Schlingerbewegung, Farbe `--ice` bei `opacity 0.5–0.9`. `devicePixelRatio` wird auf 2 begrenzt. Bei `document.hidden` pausiert die Animation.

### Laterne

Ein fixes Element `.lantern` (400 px Durchmesser, `radial-gradient` von `rgba(242,184,75,0.10)` in der Mitte nach transparent, `mix-blend-mode: screen`), das dem Zeiger folgt (Nachlauf mit Faktor 0.12 pro Frame). Zusätzlich hellt es die Landschaft auf: Jede Szene hat eine Kopie ihrer Vordergrund- und Mittelgrund-Ebenen in `--fog-3`, die über eine CSS-`mask-image` (radialer Verlauf, positioniert per `--lx`/`--ly`) nur im Lichtkreis sichtbar ist. Auf Touch-Geräten folgt das Licht dem Finger bei `touchmove`, ruht sonst bei 50 % / 58 % des Viewports. Kein Element hängt funktional von der Laterne ab.

### Koordinaten (Fortschrittsanzeige)

Unten links, Mono, `--mute`. Format `54°37′52″ N  9°55′40″ E`. Je Szene ein Zielwert; innerhalb einer Szene wird linear vom vorherigen zum eigenen Ziel interpoliert (Sekunden runden). Die Werte sind Näherungen und müssen nur plausibel und monoton sein:

| Szene | Wert |
|---|---|
| prolog | `— — ′ — ″ N  — — ′ — ″ E` (Striche) |
| schlei | 54°37′30″ N  9°54′50″ E |
| damm | 54°38′05″ N  9°55′15″ E |
| lange-strasse | 54°37′52″ N  9°55′40″ E |
| faehrberg | 54°37′40″ N  9°56′00″ E |
| tuer | 54°37′40″ N  9°56′00″ E |
| drueben | 54°37′38″ N  9°56′10″ E |
| kaenguru | ab `p 0.45` löst sich die Anzeige in ein einzelnes `?` auf |

Unter den Koordinaten steht die Szenenkennung in Mono, ebenfalls `--mute`: `SCHLEI`, `DAMM`, `LANGE STRASSE`, `FÄHRBERG`, `TÜR`, `DRÜBEN`, `?`. Im Prolog steht nichts.

### Das Känguru

Die Silhouette liegt als `<symbol id="s-kaenguru">` im SVG-Sprite am Anfang von `index.html` (alle Landschaftsebenen sind dort als Symbole definiert und werden per `<use>` eingesetzt, damit die Laternen-Kopien keinen doppelten Pfad brauchen): eine anatomisch glaubwürdige Silhouette (aufrecht sitzend, Schwanz am Boden, Ohren gestellt, Kopf leicht zum Betrachter gedreht), ein einziger Pfad, Füllung `--fog-2`. Höhe etwa 55 vh auf Desktop, 45 vh hochkant, leicht rechts der Mitte (55 %), Fußpunkt bei 78 % der Viewporthöhe. Die Augen sind zwei Kreise (`--amber`, Radius 0.35 % der Viewporthöhe) mit weichem `drop-shadow`-Glühen; sie erscheinen vor der Silhouette (`p 0.30`), die Silhouette blendet von `p 0.45` bis `0.60` ein. Kein Gesicht, keine Zeichnungsdetails.

### Ton-Schalter

Oben rechts (unter Berücksichtigung von `env(safe-area-inset-*)`), Mono, `--mute`, Text „TON AN“ / „TON AUS“, `aria-pressed`. Kein Icon. Fokusring sichtbar (`--ice`, 1 px Versatz 3 px).

## 4. Technik

Kein Build-Schritt, keine Abhängigkeiten. Das Repo ist die Seite.

```
index.html            alle Szenen als Markup, SVG-Ebenen inline
impressum.html        Platzhalter
css/tokens.css        Farben, Schriften, Abstände als Custom Properties
css/base.css          Reset, Typografie, Korn, Vignette, Bedienelemente
css/scenes.css        Szenen-Layout, Ebenen, alle --p-gebundenen Bewegungen
js/main.js            Startpunkt, verdrahtet die Module, prüft reduced-motion
js/progress.js        reine Funktion: Szenenfortschritt 0–1 aus Geometrie
js/scenes.js          Szenen-Konfiguration (Höhe, Schnee, Wind, Audio, Koordinaten)
js/scroll.js          liest scrollY, ruft progress.js, schreibt --p und data-state
js/snow.js            Canvas-Schnee
js/lantern.js         Lichtkegel
js/coords.js          Koordinaten-Interpolation und -Formatierung
js/levels.js          reine Funktionen: Schnee- und Audio-Zielwerte je Szene und p, mit Überblendung
js/audio.js           Web-Audio-Ambient
js/typewriter.js      letzte Frage
js/grain.js           Korn-Versatz
package.json          nur "type": "module" und das Test-Skript, keine Abhängigkeiten
assets/fonts/         woff2-Dateien und LICENSE-Dateien der Schriften
assets/og.png
assets/favicon.svg
tools/fetch-fonts.mjs  einmaliges Skript, lädt die Latin-Subsets der Schriften
tools/og.html         Vorlage für das OG-Bild
tests/*.test.js       node:test für progress, coords, scenes, audio-levels, typewriter-timing
.nojekyll
README.md
```

Alle JS-Dateien sind ES-Module (`<script type="module">`). Die reinen Module (`progress.js`, `scenes.js`, `coords.js`, die Pegelberechnung in `audio.js`) greifen nicht auf `window` oder `document` zu und sind unter Node importierbar.

### Scroll-Motor

Markup je Szene:

```html
<section class="scene" data-scene="damm" style="--h: 250">
  <div class="stage">
    <div class="layer layer--sky">…</div>
    …
    <div class="lines">
      <p class="line" style="--in: 0.15">Eine Straße, die aufs Wasser führt.</p>
    </div>
  </div>
</section>
```

- `.scene { position: relative; height: calc(var(--h) * 1vh); }` ist nur ein Scroll-Abstandhalter.
- `.stage` und `.lines` sind `position: fixed; inset: 0` und nur vorhanden (`display: none` sonst; nicht `visibility`, weil Safari auf iOS für jede versteckte 3D-transformierte Ebene GPU-Speicher hält und bei rund 50 Ebenen abstürzt), wenn ihre Szene `data-state="active"` hat. Auf Touch-Geräten (`pointer: coarse`) entfallen die maskierten Laternen-Kopien und der Text-Blur; Korn und Laterne nutzen keinen `mix-blend-mode`. Genau eine Szene ist aktiv: die, deren Abschnitt `scrollY` enthält (die erste auch bei `scrollY < 0`, die letzte auch über ihr Ende hinaus, damit sie hinter der Fußzeile stehen bleibt). Der Wechsel passiert exakt an der Abschnittsgrenze, wo beide Szenen zu 100 % vom Nebelvorhang bedeckt sind (siehe Szenenwechsel); dadurch gibt es keinen sichtbaren Schnitt und keine Schiebe-Strecke wie bei `position: sticky`.
- `progress(top, range, scrollY)` = `clamp((scrollY − top) / range, 0, 1)`. `range` ist die Abschnittshöhe; bei der letzten Szene `Abschnittshöhe − viewportH`, damit `p = 1` erreichbar ist, bevor die Fußzeile ins Bild kommt.
- `scroll.js` misst `top` und `height` aller Szenen bei Start und `resize`, hört auf `scroll` (passiv), rechnet höchstens einmal pro Frame (`requestAnimationFrame`), schreibt `--p` als Inline-Style und `data-state="before|active|after"` nur bei Änderung.
- Stapelreihenfolge (z-index): Bühne 1 < Laterne 15 < Schnee 20 < Textzeilen 25 < Korn 30 < Vignette 31 < Bedienelemente 40.
- Scrollgeschwindigkeit (px/s, geglättet) wird als `--vel` an `document.documentElement` gegeben und an `snow.js` gemeldet.
- Alle Ebenenbewegungen sind CSS: `transform: translate3d(calc(var(--p) * var(--fx) * 1vw), calc(var(--p) * var(--fy) * 1vh), 0) scale(calc(1 + var(--p) * var(--fs)))`. Textzeilen: `opacity: clamp(0, (var(--p) - var(--in)) / 0.08, 1)` multipliziert mit dem Ausblendfaktor `clamp(0, (0.90 - var(--p)) / 0.08, 1)` (in Szene 7 ohne Ausblendfaktor).

### Ton

- Erst beim ersten Klick auf den Schalter wird ein `AudioContext` erzeugt (Autoplay-Regeln). Der Schalter ist vorher trotzdem sichtbar.
- **Wind:** weißes Rauschen (Buffer 2 s, Loop) → Bandpass (Q 0.8), Mittenfrequenz durch LFO (0.07 Hz, Sinus) zwischen 300 und 900 Hz → Gain.
- **Wasser:** braunes Rauschen (Integration von weißem Rauschen, Leck 0.02) → Tiefpass 220 Hz → Gain.
- **Bass hinter der Tür:** drei Oszillatoren (Sinus, 55 Hz, 82.4 Hz, 110 Hz; entspricht A1, E2, A2) → Tiefpass 180 Hz → Gain; darauf ein Puls (Gain-LFO, Rechteck weichgezeichnet, 100 bpm, Tiefe 35 %).
- Zielpegel je Szene (0–1), Übergang mit `setTargetAtTime`, Zeitkonstante 1.5 s:

| Szene | Wind | Wasser | Bass |
|---|---|---|---|
| prolog | 0.15 | 0.00 | 0 |
| schlei | 0.35 | 0.30 | 0 |
| damm | 0.60 | 0.20 | 0 |
| lange-strasse | 0.25 | 0.05 | 0 |
| faehrberg | 0.25 | 0.15 | 0.10 |
| tuer | 0.10 | 0.05 | 0.45 |
| drueben | 0.40 | 0.35 | 0.05 |
| kaenguru | 0.30 | 0.00 | 0 |

- Master-Gain 0.5. „TON AUS“ fährt den Master über 0.6 s auf 0 und `suspend()`ed den Kontext.
- Die Pegelberechnung (`levelsFor(sceneId, p)` mit linearer Überblendung im Wechselbereich `p > 0.85` zur nächsten Szene) liegt in einem reinen, getesteten Modul.

### Mobile

- Mobile-first: Gestaltung für 390 px Breite, dann Skalierung nach oben.
- `100dvh` mit `100vh`-Fallback; Bedienelemente und Koordinaten respektieren `env(safe-area-inset-*)`.
- Landschaftsebenen 140 % Viewportbreite, hochkant stärker beschnitten statt gestaucht.
- Laterne folgt `touchmove`; `touch-action: pan-y` auf dem Body, damit nichts das Scrollen blockiert.
- Textgrößen per `clamp()`, keine Zeile länger als 18em.

### Zugänglichkeit

- `prefers-reduced-motion: reduce`: kein Canvas, keine Parallaxe (`--fx/--fy/--fs` = 0), kein Korn-Versatz, keine Nebeldrift, Textzeilen einfach sichtbar (Ein- und Ausblendung ohne Blur, sofortige Deckkraft), Känguru und Frage ohne Tipp-Effekt sichtbar ab `p 0.3`.
- Alle Texte sind echtes HTML in Lesereihenfolge. Ebenen-SVGs sind `aria-hidden="true"`. Der Schnee-Canvas ist `aria-hidden`.
- Die letzte Frage wird zusätzlich in einem visuell verborgenen `aria-live="polite"`-Element einmal vollständig gesetzt, sobald der Tipp-Effekt startet.
- Ton-Schalter und Impressum-Link sind per Tastatur erreichbar; Fokus sichtbar.
- Kontrast Text/Grund mindestens 7:1 (`--snow` auf `--night`), Koordinaten mindestens 4.5:1.
- `lang="de"`, sinnvoller `<title>` („Barniz?“), `meta description` vage („Ein Winter an der Schlei. Und eine Frage.“). Keine Open-Graph-Bilder, die etwas verraten; ein OG-Bild `assets/og.png` (1200×630) in `--night` mit einem einzelnen `?` in Fraunces reicht; es wird einmalig erzeugt und eingecheckt.

### Performance

- Gesamtgewicht unter 300 kB inklusive Schriften, keine externen Anfragen (kein CDN, keine Analytics, keine Fonts von Dritten).
- SVG-Ebenen inline im HTML, Pfade auf zwei Dezimalstellen gerundet.
- `will-change: transform` nur auf aktiven Szenen-Ebenen (per `data-state`).
- Lighthouse Mobile: Performance ≥ 90, Accessibility ≥ 95.

## 5. Hosting

- Öffentliches Repo `chrom5000/barniz` auf GitHub, angelegt per `gh repo create`.
- GitHub Pages aus Branch `main`, Wurzelverzeichnis; `.nojekyll` im Root. Aktivierung per `gh api -X POST repos/chrom5000/barniz/pages`.
- Adresse: `https://chrom5000.github.io/barniz/`. Alle Pfade relativ, damit später eine eigene Domain per `CNAME`-Datei reicht.
- `README.md`: zwei Absätze (was das ist, wie man lokal ansieht: `python3 -m http.server` oder `npx serve`), Hinweis auf `node --test`.

## 6. Tests und Verifikation

**Automatisch (`node --test tests/`):**
- `progress.test.js`: Randwerte (vor, in, nach der Szene), Clamping, Monotonie, Szenenzustand (erste/letzte Szene bleiben aktiv über ihre Grenzen hinaus).
- `levels.test.js`: Schnee-Zielwerte je Szene inklusive Rampen (Prolog ab 0.55, Känguru ab 0.45) und Überblendung ab `p 0.85`.
- `html.test.js`: `index.html` enthält die acht Szenen in Spec-Reihenfolge, und der Name „Barniz“ steht im Body genau einmal.
- `coords.test.js`: Interpolation zwischen zwei Koordinaten, Formatierung (Nullen, Sekundenrundung, Strich-Variante im Prolog, `?` im Känguru).
- `scenes.test.js`: alle acht Kennungen vorhanden, Reihenfolge, jede Szene hat Höhe, Schnee, Wind, Audio, Koordinaten; Höhen ≥ 150.
- `audio-levels.test.js`: Zielpegel je Szene, lineare Überblendung ab `p 0.85` zur nächsten, letzte Szene blendet nicht weiter.
- `typewriter.test.js`: Zeichenfolge und Zeitpunkte für „Gibt es Barniz?“ bei 2,2 s Gesamtdauer; läuft nur einmal.

**Manuell im Browser (Chrome, vor Abschluss):**
- Jede Szene als Screenshot bei 1440 px und 390 px Breite; Text lesbar, keine kahlen Ränder hochkant.
- Konsole ohne Fehler und Warnungen.
- reduced-motion-Variante (DevTools-Emulation): alles lesbar, kein Canvas.
- Ton-Schalter: an/aus, Pegelwechsel zwischen Szenen hörbar, kein Klicken beim Umschalten.
- Tastatur: Tab erreicht Schalter und Impressum-Link.
- Live-URL nach Deployment im Handy-Viewport prüfen, Lighthouse Mobile laufen lassen.

## 7. Nicht Teil dieses Projekts

- Kein Kontaktformular, kein Newsletter, kein Social-Link, keine Analytics.
- Kein CMS, keine Mehrsprachigkeit, kein Blog.
- Keine echten Fotos, keine Musikdateien.
- Kein Inhalt für `impressum.html` über den Platzhalter hinaus.
