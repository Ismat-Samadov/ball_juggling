/**
 * sound.ts
 * Procedural audio via Web Audio API — no external assets needed.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/** Resume context on first user gesture (required by browsers). */
export function resumeAudio(): void {
  const ctx = getCtx();
  if (ctx && ctx.state === "suspended") ctx.resume();
}

// ─── SFX generators ───────────────────────────────────────────────────────────

function playTone(
  freq: number,
  type: OscillatorType,
  gainPeak: number,
  duration: number,
  freqEnd?: number
): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);
  }

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(gainPeak, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

/** Ball hits paddle */
export function playHitSound(combo: number, enabled: boolean): void {
  if (!enabled) return;
  const freq = 220 + combo * 30;
  playTone(Math.min(freq, 880), "sine", 0.25, 0.12, Math.min(freq * 1.5, 1100));
}

/** Ball lost / miss */
export function playMissSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(200, "sawtooth", 0.3, 0.4, 60);
}

/** Game over */
export function playGameOverSound(enabled: boolean): void {
  if (!enabled) return;
  [400, 300, 200, 120].forEach((f, i) => {
    setTimeout(() => playTone(f, "square", 0.2, 0.35), i * 150);
  });
}

/** New ball spawned */
export function playSpawnSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(660, "sine", 0.15, 0.2, 990);
}

/** Combo milestone */
export function playComboSound(combo: number, enabled: boolean): void {
  if (!enabled || combo < 3) return;
  const base = 330 + combo * 20;
  playTone(base, "triangle", 0.2, 0.25);
  setTimeout(() => playTone(base * 1.5, "sine", 0.15, 0.2), 100);
}

// ─── Background music (simple arpeggiated loop) ───────────────────────────────

let musicNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let musicInterval: ReturnType<typeof setInterval> | null = null;
let stepIdx = 0;

const SCALE = [130.81, 146.83, 164.81, 196.0, 220.0, 246.94, 261.63, 293.66];

export function startMusic(): void {
  stopMusic();
  const ctx = getCtx();
  if (!ctx) return;

  stepIdx = 0;
  musicInterval = setInterval(() => {
    const freq = SCALE[stepIdx % SCALE.length];
    stepIdx++;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    musicNodes.push({ osc, gain });
    // Keep list lean
    if (musicNodes.length > 10) musicNodes.shift();
  }, 200);
}

export function stopMusic(): void {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  musicNodes.forEach(({ osc }) => {
    try { osc.stop(); } catch { /* already stopped */ }
  });
  musicNodes = [];
}
