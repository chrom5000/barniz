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
