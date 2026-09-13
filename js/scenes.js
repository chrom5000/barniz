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
