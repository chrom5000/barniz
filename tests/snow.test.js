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
