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
  // iOS: Web Audio schweigt bei gestelltem Stummschalter, es sei denn, die
  // Seite meldet sich als Wiedergabe an (Safari 17+). Der Ton wird ohnehin
  // nur auf ausdrückliches Tippen gestartet.
  if (navigator.audioSession) {
    try { navigator.audioSession.type = 'playback'; } catch { /* ältere Safari */ }
  }
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
    if (!nodes) {
      try { nodes = build(); } catch { return; } // kein Web Audio: Schalter bleibt wirkungslos
    }
    on = !on;
    button.setAttribute('aria-pressed', String(on));
    button.textContent = on ? 'Ton aus' : 'Ton an';
    const { ctx, master } = nodes;
    if (on) {
      await ctx.resume();
      if (!on) return;
      master.gain.setTargetAtTime(MASTER, ctx.currentTime, 0.3);
      apply();
    } else {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      setTimeout(() => { if (!on) ctx.suspend(); }, 700);
    }
  }

  button.addEventListener('click', toggle);

  return {
    setLevels(next) {
      const same = ['wind', 'water', 'bass'].every(k => Math.abs(next[k] - levels[k]) < 0.002);
      if (same) return;
      levels = next;
      apply();
    },
  };
}
