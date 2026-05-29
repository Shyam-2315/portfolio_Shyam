// Lightweight Web Audio synthesizer for OS-style SFX. No assets needed.

let ctx: AudioContext | null = null;
function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = Ctor ? new Ctor() : null;
  }
  return ctx;
}

function blip(freq: number, dur = 0.08, type: OscillatorType = "sine", gain = 0.05) {
  const a = ac();
  if (!a) return;
  if (a.state === "suspended") a.resume().catch(() => {});
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, a.currentTime);
  g.gain.linearRampToValueAtTime(gain, a.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur + 0.02);
}

let muted = false;
export function setSfxMuted(m: boolean) { muted = m; }
export function isSfxMuted() { return muted; }

export const sfx = {
  key: () => !muted && blip(1200 + Math.random() * 400, 0.04, "square", 0.012),
  open: () => {
    if (muted) return;
    blip(440, 0.08, "sine", 0.05);
    setTimeout(() => blip(660, 0.12, "sine", 0.04), 60);
  },
  close: () => !muted && blip(220, 0.1, "triangle", 0.04),
  boot: () => {
    if (muted) return;
    [220, 330, 440, 660, 880].forEach((f, i) =>
      setTimeout(() => blip(f, 0.12, "sine", 0.04), i * 110)
    );
  },
  alert: () => !muted && blip(880, 0.18, "sawtooth", 0.05),
};
