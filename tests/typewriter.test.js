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
