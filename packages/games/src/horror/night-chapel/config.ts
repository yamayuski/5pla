import type { HorrorConfig } from "./kit/types";

/**
 * 「告解室」の演出データ。
 * 礼拝堂は x=-5〜5, z=0〜20（入口 z=0 の church-door）。北に祭壇（燭台 candle-l / candle-r）、
 * 西の壁際に告解室（conf-door）。石像 statue が勝手にこちらを向き、祈る人影 kneel-0〜2 が増える。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];
const KNEEL = [0, 1, 2];

export const config: HorrorConfig = {
  slug: "night-chapel",
  title: "告解室",
  intro: [
    "町外れの古い教会の、夜の戸締まり当番。",
    "祭壇のろうそくを消して、扉の鍵をかけるだけでいい。",
  ],
  spawn: { position: [0, 1.6, 1.5], lookAt: [0, 1.8, 17] },
  fog: { color: [0.03, 0.03, 0.05], density: 0.016 },
  ambient: { intensity: 0.08, color: [0.75, 0.8, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.55,
    angleDeg: 40,
    range: 13,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.08,
  droneLevel: 0.06,
  triggers: [
    // ---- 0〜1分: 戸締まり ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "ステンドグラスから青い月明かり。祭壇の二本のろうそくだけが、まだ燃えている。",
        },
        { type: "objective", text: "祭壇のろうそくを消す" },
      ],
    },
    {
      id: "candle-l",
      when: {
        type: "interact",
        target: "candle-l",
        label: "ろうそくを消す",
        maxDistance: 2.6,
      },
      actions: [
        { type: "lights", group: "candle-l", on: false },
        {
          type: "sound",
          sound: "breath",
          at: { node: "candle-l" },
          volume: 0.3,
        },
        { type: "subtitle", text: "ふっ、と左の炎が消えた。", duration: 3 },
      ],
    },
    {
      id: "candle-r",
      when: {
        type: "interact",
        target: "candle-r",
        label: "ろうそくを消す",
        maxDistance: 2.6,
      },
      actions: [
        { type: "lights", group: "candle-r", on: false },
        {
          type: "sound",
          sound: "breath",
          at: { node: "candle-r" },
          volume: 0.3,
        },
        {
          type: "subtitle",
          text: "右の炎も消した。礼拝堂が一段と暗くなる。",
          duration: 4,
        },
        { type: "objective", text: "扉に鍵をかけて帰る" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "organ",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 3, 19], volume: 0.7 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "誰もいないはずのパイプオルガンが、一音だけ鳴った。低く、長く。",
          duration: 5,
        },
      ],
    },
    {
      id: "organ-2",
      when: { type: "after", trigger: "organ", delay: 3 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 3, 19], volume: 0.8 },
        { type: "sound", sound: "rumble", at: [0, 3, 19], volume: 0.4 },
      ],
    },
    {
      id: "statue-turn",
      when: { type: "time", at: 115 },
      actions: [
        { type: "face", target: "statue" },
        { type: "sound", sound: "creak", at: { node: "statue" }, volume: 0.9 },
        {
          type: "subtitle",
          text: "祭壇の脇の聖母像が、いつの間にかこちらを向いている。……さっきは、背を向けていたはずなのに。",
          duration: 6,
        },
      ],
    },
    {
      id: "kneelers",
      when: { type: "time", at: 155 },
      actions: [
        ...KNEEL.map((i) => ({
          type: "visible" as const,
          target: `kneel-${i}`,
          visible: true,
        })),
        { type: "sound", sound: "whisper", at: [0, 1, 9], volume: 0.7 },
        {
          type: "subtitle",
          text: "前のほうの長椅子に、黒い人影が三つ。俯いて、ぶつぶつと祈っている。",
          duration: 5,
        },
        { type: "drone", level: 0.2 },
      ],
    },
    {
      id: "conf-knock",
      when: { type: "time", at: 185 },
      actions: [
        { type: "sound", sound: "knock", at: [-4.2, 1.2, 8], volume: 0.9 },
        {
          type: "subtitle",
          text: "壁際の告解室から、内側からのノック。「……告白を……お聞きします……」",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "church-door", state: "slam" },
        { type: "door", door: "church-door", state: "lock" },
        { type: "lights", group: "glass", on: false },
        ...KNEEL.map((i) => ({
          type: "face" as const,
          target: `kneel-${i}`,
        })),
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口の大扉が閉まり、月明かりも消えた。祈っていた人影が、全員こちらを振り返っている。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "conf-open",
      when: { type: "after", trigger: "lock", delay: 12 },
      actions: [
        { type: "door", door: "conf-door", state: "open" },
        { type: "visible", target: "priest", visible: true },
        { type: "face", target: "priest" },
        { type: "sound", sound: "creak", at: [-3.5, 1, 8], volume: 1 },
        { type: "heartbeat", bpm: 125 },
        {
          type: "subtitle",
          text: "告解室の戸が、ひとりでに開いた。暗がりの中に、黒い司祭服の男が座っている。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: 告解 ----
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "priest",
        maxAngleDeg: 24,
        maxDistance: 16,
      },
      requires: ["conf-open"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "priest" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "conf-open", delay: 12 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "priest" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "priest" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "告解室",
          text: "翌朝、教会の神父は告解室の中で、見知らぬ男の告白の記録を見つけた。\n日付は、五十年前。最後の一行は「次は、あなたの番です」。\n\n祭壇のろうそくは、二本とも、まだ温かかった。",
        },
      ],
    })),
  ],
};
