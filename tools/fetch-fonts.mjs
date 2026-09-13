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
