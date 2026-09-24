/** Tiny WebAudio synth. Nothing plays until unlock() has been called from a user gesture. */
export type SoundName = "pellet" | "power" | "ghost" | "death" | "level" | "fruit" | "start" | "intro";

let lastIntro = 0;

export class SoundManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private waka = false;
  muted = false;

  constructor() {
    try { this.muted = typeof localStorage !== "undefined" && localStorage.getItem("cp_muted") === "1"; } catch { /* ignore */ }
  }

  /** Call from a click / key handler. Safe to call repeatedly. */
  unlock(): void {
    if (typeof window === "undefined") return;
    try {
      if (!this.ctx) {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") void this.ctx.resume();
    } catch { /* audio is optional */ }
  }

  /** True once the browser has allowed audio to play. */
  get running(): boolean { return this.ctx?.state === "running"; }

  /** Resolves true if audio is (or becomes, within timeoutMs) playable. False means the browser is waiting for a gesture. */
  async whenRunning(timeoutMs = 300): Promise<boolean> {
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) {
      if (this.running) return true;
      await new Promise((r) => setTimeout(r, 30));
    }
    return this.running;
  }

  setMuted(m: boolean): void {
    this.muted = m;
    try { localStorage.setItem("cp_muted", m ? "1" : "0"); } catch { /* ignore */ }
  }

  private tone(freq: number, dur: number, opts: { type?: OscillatorType; vol?: number; at?: number; to?: number } = {}): void {
    if (this.muted || !this.ctx || !this.master || this.ctx.state !== "running") return;
    const t0 = this.ctx.currentTime + (opts.at ?? 0);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = opts.type ?? "square";
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur);
    const vol = opts.vol ?? 0.06;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  play(name: SoundName): void {
    switch (name) {
      case "pellet": this.waka = !this.waka; this.tone(this.waka ? 420 : 560, 0.06, { type: "triangle", vol: 0.07 }); break;
      case "power": this.tone(180, 0.28, { to: 900, vol: 0.07 }); break;
      case "ghost": this.tone(260, 0.3, { to: 1400, vol: 0.07 }); break;
      case "fruit": this.tone(700, 0.08, { vol: 0.07 }); this.tone(1050, 0.14, { at: 0.08, vol: 0.07 }); break;
      case "death": for (let i = 0; i < 6; i++) this.tone(900 - i * 110, 0.2, { at: i * 0.17, to: 500 - i * 60, type: "sawtooth", vol: 0.05 }); break;
      case "level": [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, 0.13, { at: i * 0.11, vol: 0.06 })); break;
      case "intro": {
        // ~3.6 s jingle timed to the intro screen: COUNTERPOINT (0.3s), PRESENTS (0.9s), PAC-MAN (1.6s), subtitle (2.2s), PRESS START (3.2s).
        const now = Date.now();
        if (now - lastIntro < 1500) break; // avoid a double play (e.g. React dev double-mount)
        lastIntro = now;
        this.tone(330, 0.16, { at: 0.3, vol: 0.05 });
        this.tone(440, 0.2, { at: 0.9, vol: 0.05 });
        [262, 330, 392, 523].forEach((f, i) => this.tone(f, 0.16, { at: 1.6 + i * 0.09, vol: 0.06 }));
        this.tone(131, 0.7, { at: 1.6, type: "sawtooth", vol: 0.04 });
        this.tone(659, 0.18, { at: 2.2, vol: 0.05 });
        this.tone(784, 0.14, { at: 2.7, type: "triangle", vol: 0.05 });
        this.tone(880, 0.12, { at: 3.2, vol: 0.06 });
        this.tone(880, 0.22, { at: 3.4, vol: 0.06 });
        break;
      }
      case "start": [392, 523, 392, 523, 659, 784, 659, 523].forEach((f, i) => this.tone(f, 0.14, { at: i * 0.15, type: "square", vol: 0.05 })); break;
    }
  }
}

/** One shared instance so the mute preference and audio unlock survive between games. */
export const sound = new SoundManager();
