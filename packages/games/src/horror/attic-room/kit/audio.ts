import type { SoundName } from "./types";

type Pos = { x: number; y: number; z: number };

/** 1 つの効果音を組み立てる関数。out に繋げば鳴る */
type Recipe = (a: HorrorAudio, out: AudioNode, t: number) => void;

/**
 * 外部アセットを使わず WebAudio だけで鳴らす効果音・環境音。
 * 3D 位置付きの音は PannerNode(HRTF) で鳴らす。
 */
export class HorrorAudio {
  public readonly ctx: AudioContext;
  private readonly master: GainNode;
  private readonly droneGain: GainNode;
  private readonly heartGain: GainNode;
  private noise: AudioBuffer;
  private heartbeatTimer: number | null = null;

  public constructor() {
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -10;
    this.master.connect(comp).connect(this.ctx.destination);
    this.noise = this.createNoise(3);
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0;
    this.droneGain.connect(this.master);
    this.heartGain = this.ctx.createGain();
    this.heartGain.gain.value = 0.7;
    this.heartGain.connect(this.master);
    this.startDrone();
  }

  public async resume(): Promise<void> {
    if (this.ctx.state !== "running") {
      await this.ctx.resume();
    }
  }

  public dispose(): void {
    this.setHeartbeat(0);
    void this.ctx.close();
  }

  private createNoise(seconds: number): AudioBuffer {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }

  private startDrone(): void {
    const t = this.ctx.currentTime;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 220;
    lp.connect(this.droneGain);
    for (const f of [41.2, 41.9, 61.7]) {
      const o = this.ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.value = 0.12;
      o.connect(g).connect(lp);
      o.start(t);
    }
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise;
    n.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 300;
    bp.Q.value = 0.7;
    const ng = this.ctx.createGain();
    ng.gain.value = 0.15;
    n.connect(bp).connect(ng).connect(this.droneGain);
    // 風のようにゆっくり揺らす
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain).connect(bp.frequency);
    lfo.start(t);
    n.start(t);
  }

  /** ドローン（不穏な低音）の音量を 0〜1 で変える */
  public setDrone(level: number, seconds = 2): void {
    const t = this.ctx.currentTime;
    this.droneGain.gain.cancelScheduledValues(t);
    this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, t);
    this.droneGain.gain.linearRampToValueAtTime(
      Math.max(0, level) * 0.5,
      t + seconds,
    );
  }

  /** 心音。bpm=0 で停止 */
  public setHeartbeat(bpm: number): void {
    if (this.heartbeatTimer !== null) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (bpm <= 0) {
      return;
    }
    const beat = () => {
      RECIPES.heartbeat(this, this.heartGain, this.ctx.currentTime);
    };
    beat();
    this.heartbeatTimer = window.setInterval(beat, 60000 / bpm);
  }

  public updateListener(pos: Pos, forward: Pos, up: Pos): void {
    const l = this.ctx.listener;
    const t = this.ctx.currentTime;
    if (l.positionX) {
      l.positionX.setValueAtTime(pos.x, t);
      l.positionY.setValueAtTime(pos.y, t);
      l.positionZ.setValueAtTime(pos.z, t);
      l.forwardX.setValueAtTime(forward.x, t);
      l.forwardY.setValueAtTime(forward.y, t);
      l.forwardZ.setValueAtTime(forward.z, t);
      l.upX.setValueAtTime(up.x, t);
      l.upY.setValueAtTime(up.y, t);
      l.upZ.setValueAtTime(up.z, t);
    } else {
      l.setPosition(pos.x, pos.y, pos.z);
      l.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
    }
  }

  /** 効果音を鳴らす。pos を渡すとその位置から聞こえる */
  public play(name: SoundName, pos: Pos | null = null, volume = 1): void {
    const g = this.ctx.createGain();
    g.gain.value = volume;
    if (pos) {
      const p = this.ctx.createPanner();
      p.panningModel = "HRTF";
      p.distanceModel = "inverse";
      p.refDistance = 1.5;
      p.rolloffFactor = 1.2;
      p.positionX.value = pos.x;
      p.positionY.value = pos.y;
      p.positionZ.value = pos.z;
      g.connect(p).connect(this.master);
    } else {
      g.connect(this.master);
    }
    RECIPES[name](this, g, this.ctx.currentTime);
  }

  // ---- 部品 ----

  public osc(
    out: AudioNode,
    type: OscillatorType,
    t: number,
    dur: number,
    f0: number,
    f1: number,
    peak: number,
    attack = 0.005,
  ): OscillatorNode {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  }

  public noiseBurst(
    out: AudioNode,
    t: number,
    dur: number,
    filter: BiquadFilterType,
    freq: number,
    peak: number,
    attack = 0.005,
    q = 1,
  ): void {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noise;
    s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = this.ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(out);
    s.start(t, Math.random() * 1.5);
    s.stop(t + dur + 0.05);
  }
}

const RECIPES: Record<SoundName, Recipe> = {
  knock: (a, out, t) => {
    for (let i = 0; i < 3; i++) {
      const s = t + i * 0.22;
      a.osc(out, "sine", s, 0.18, 140, 60, 0.9);
      a.noiseBurst(out, s, 0.06, "bandpass", 900, 0.5);
    }
  },
  creak: (a, out, t) => {
    const o = a.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(160, t);
    for (let i = 1; i < 12; i++) {
      o.frequency.linearRampToValueAtTime(
        150 + Math.random() * 90,
        t + i * 0.11,
      );
    }
    const bp = a.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900;
    bp.Q.value = 8;
    const g = a.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.6, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.connect(bp).connect(g).connect(out);
    o.start(t);
    o.stop(t + 1.5);
  },
  slam: (a, out, t) => {
    a.noiseBurst(out, t, 0.7, "lowpass", 500, 1.4, 0.002);
    a.osc(out, "sine", t, 0.6, 70, 35, 1.2, 0.002);
  },
  whisper: (a, out, t) => {
    for (let i = 0; i < 5; i++) {
      const s = t + i * 0.28 + Math.random() * 0.1;
      a.noiseBurst(
        out,
        s,
        0.22,
        "bandpass",
        2500 + Math.random() * 2000,
        0.35,
        0.06,
        3,
      );
    }
  },
  footsteps: (a, out, t) => {
    for (let i = 0; i < 4; i++) {
      const s = t + i * 0.55;
      a.noiseBurst(out, s, 0.14, "lowpass", 350, 0.9, 0.004);
      a.osc(out, "sine", s, 0.12, 90, 50, 0.5);
    }
  },
  heartbeat: (a, out, t) => {
    a.osc(out, "sine", t, 0.16, 62, 40, 1);
    a.osc(out, "sine", t + 0.22, 0.2, 55, 35, 0.7);
  },
  stinger: (a, out, t) => {
    for (const f of [311, 330, 466, 494, 698, 740]) {
      const o = a.osc(out, "sawtooth", t, 1.8, f, f * 1.6, 0.35, 0.01);
      o.detune.value = Math.random() * 30;
    }
    a.noiseBurst(out, t, 1.2, "highpass", 1500, 1.2, 0.003);
    a.osc(out, "square", t, 0.5, 50, 30, 1.2, 0.002);
  },
  static: (a, out, t) => {
    a.noiseBurst(out, t, 1.6, "highpass", 1200, 0.5, 0.02);
    for (let i = 0; i < 10; i++) {
      a.noiseBurst(out, t + Math.random() * 1.5, 0.03, "bandpass", 3000, 0.6);
    }
  },
  chime: (a, out, t) => {
    const notes = [659, 523, 587, 392, 392, 587, 659, 523];
    notes.forEach((f, i) => {
      a.osc(out, "sine", t + i * 0.32, 0.9, f, f, 0.35, 0.01);
    });
  },
  drip: (a, out, t) => {
    a.osc(out, "sine", t, 0.12, 1400, 500, 0.4, 0.002);
  },
  breath: (a, out, t) => {
    a.noiseBurst(out, t, 1.1, "lowpass", 900, 0.6, 0.5);
    a.noiseBurst(out, t + 1.3, 1.4, "lowpass", 700, 0.5, 0.2);
  },
  thud: (a, out, t) => {
    a.osc(out, "sine", t, 0.35, 90, 40, 1.1, 0.003);
    a.noiseBurst(out, t, 0.2, "lowpass", 300, 0.8);
  },
  buzz: (a, out, t) => {
    for (let i = 0; i < 6; i++) {
      a.osc(out, "sawtooth", t + i * 0.12, 0.1, 100, 100, 0.12, 0.002);
    }
  },
  bell: (a, out, t) => {
    for (const [f, v] of [
      [220, 0.6],
      [440, 0.3],
      [587, 0.2],
      [880, 0.12],
    ] as const) {
      a.osc(out, "sine", t, 4, f, f * 0.998, v, 0.005);
    }
  },
  rattle: (a, out, t) => {
    for (let i = 0; i < 8; i++) {
      a.noiseBurst(
        out,
        t + i * 0.07 + Math.random() * 0.02,
        0.05,
        "bandpass",
        1200,
        0.7,
      );
    }
  },
  giggle: (a, out, t) => {
    for (let i = 0; i < 5; i++) {
      const s = t + i * 0.16;
      const f = 700 + Math.random() * 120 - i * 30;
      a.osc(out, "triangle", s, 0.13, f, f * 0.8, 0.25, 0.01);
    }
  },
  rumble: (a, out, t) => {
    a.noiseBurst(out, t, 3.5, "lowpass", 160, 1.0, 1.2);
    a.osc(out, "sine", t, 3.5, 38, 30, 0.6, 1.2);
  },
  step: (a, out, t) => {
    a.noiseBurst(out, t, 0.12, "lowpass", 420, 0.35, 0.004);
  },
  phone: (a, out, t) => {
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < 10; i++) {
        const s = t + r * 1.2 + i * 0.05;
        a.osc(out, "square", s, 0.045, 1300, 1300, 0.12, 0.002);
        a.osc(out, "square", s + 0.025, 0.02, 1600, 1600, 0.08, 0.002);
      }
    }
  },
};
