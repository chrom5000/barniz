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
