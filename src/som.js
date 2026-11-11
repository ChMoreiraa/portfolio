// Som ambiente gerado no navegador (Web Audio): um pad grave e cliques curtos de interface.
let ctx, mestre, ligado = false;

function montar() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  mestre = ctx.createGain();
  mestre.gain.value = 0;
  mestre.connect(ctx.destination);

  const filtro = ctx.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = 520;
  filtro.Q.value = 0.7;
  filtro.connect(mestre);

  // Acorde de Lá menor com 9ª, em oscilações suaves e levemente desafinadas.
  [55, 110, 130.81, 164.81, 246.94].forEach((f, i) => {
    [-4, 4].forEach((cents) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = cents;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.11 : 0.035;
      o.connect(g).connect(filtro);
      o.start();
    });
  });

  // LFO lento abrindo o filtro, para o pad respirar.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 260;
  lfo.connect(lfoG).connect(filtro.frequency);
  lfo.start();
}

export function alternarSom() {
  if (!ctx) montar();
  ligado = !ligado;
  if (ctx.state === 'suspended') ctx.resume();
  const agora = ctx.currentTime;
  mestre.gain.cancelScheduledValues(agora);
  mestre.gain.setTargetAtTime(ligado ? 0.55 : 0, agora, ligado ? 0.8 : 0.25);
  return ligado;
}

export function clique(freq = 880, dur = 0.06, vol = 0.05) {
  if (!ligado || !ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(freq * 0.6, ctx.currentTime + dur);
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + dur + 0.02);
}

export function impacto() {
  if (!ligado || !ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(90, t);
  o.frequency.exponentialRampToValueAtTime(32, t + 1.6);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 400;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.25, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
  o.connect(f).connect(g).connect(ctx.destination);
  o.start();
  o.stop(t + 2);
}

export const somLigado = () => ligado;
