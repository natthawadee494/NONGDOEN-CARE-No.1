import confetti from 'canvas-confetti';

let audioCtx: AudioContext | null = null;
let isAudioMuted = false;

// Check localStorage for saved mute state
if (typeof window !== 'undefined') {
  try {
    isAudioMuted = localStorage.getItem('nongdoen_care_sound_muted') === 'true';
  } catch {
    isAudioMuted = false;
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isMuted(): boolean {
  return isAudioMuted;
}

export function setMuted(muted: boolean): void {
  isAudioMuted = muted;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('nongdoen_care_sound_muted', String(muted));
    } catch {
      // ignore
    }
  }
}

export function setGlobalAudioEnabled(enabled: boolean): void {
  setMuted(!enabled);
}

export function toggleMuted(): boolean {
  setMuted(!isAudioMuted);
  return isAudioMuted;
}

// Light button click sound
export function playClick(): void {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // ignore
  }
}

// Success arpeggio chime (C - E - G - C)
export function playSuccess(): void {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  } catch {
    // ignore
  }
}

// Timer alarm chime
export function playAlarm(): void {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now + i * 0.2);
      osc.frequency.setValueAtTime(659.25, now + i * 0.2 + 0.1);
      gain.gain.setValueAtTime(0.15, now + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.19);
    }
  } catch {
    // ignore
  }
}

// Classroom bell
export function playBell(): void {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [587.33, 880, 1174.66];
    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.25);
    });
  } catch {
    // ignore
  }
}

// Correct answer Ding
export function playDing(): void {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // ignore
  }
}

// Fanfare / Winner celebration
export function playFanfare(): void {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const melody = [
      { f: 523.25, t: 0.12 },
      { f: 659.25, t: 0.12 },
      { f: 783.99, t: 0.12 },
      { f: 1046.5, t: 0.35 },
    ];
    let offset = 0;
    melody.forEach(({ f, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + offset;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + t);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + t + 0.05);
      offset += t + 0.02;
    });
  } catch {
    // ignore
  }
}

// Trigger celebratory colorful confetti
export function triggerConfetti(): void {
  try {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#e11d48', '#fb7185', '#fda4af', '#f43f5e', '#ec4899', '#f59e0b', '#10b981'],
    });
  } catch {
    // ignore
  }
}
