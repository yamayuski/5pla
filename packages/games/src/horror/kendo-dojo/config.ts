import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「夜稽古」の演出データ。
 * 道場の引き戸 dojo-door、掃除のバケツ bucket、太鼓 taiko、神棚 kamidana（灯明 group candle）、
 * 名札掛け nafuda-a/b、落ちる竹刀 shinai-fall、照明 group dojo / red。
 * 最後は道場の真ん中に正座する防具姿 kneeler、飛び出すのは armored。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "kendo-dojo",
  title: "夜稽古",
  intro: [
    "町の剣道場。夜の稽古のあと、最後の雑巾がけは一番下の自分の役目だ。",
    "先生は言っていた。「夜中に竹刀の音がしても、道場には入るな」",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [0, 1.6, 10] },
  fog: { color: [0.02, 0.018, 0.015], density: 0.025 },
  ambient: { intensity: 0.06, color: [1, 0.92, 0.8] },
  flashlight: {
    enabled: false,
    intensity: 0.5,
    angleDeg: 42,
    range: 11,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.07,
  droneLevel: 0.03,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "汗と木の匂いが残る道場。西の棚に、面を被せた防具が五つ並んでいる。",
          duration: 5,
        },
        { type: "objective", text: "バケツの雑巾で床を拭く" },
      ],
    },
    {
      id: "wipe",
      when: { type: "interact", target: "bucket", label: "雑巾がけをする", maxDistance: 2.2 },
      actions: [
        { type: "sound", sound: "drip", at: { node: "bucket" }, volume: 0.5 },
        { type: "lights", group: "candle", on: true },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "床を端から端まで拭き、神棚に一礼した。灯明がまだ灯っている。",
          duration: 5,
        },
      ],
    },
    {
      id: "wipe-auto",
      when: { type: "time", at: 45 },
      unless: ["wipe"],
      actions: [
        { type: "lights", group: "candle", on: true },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "神棚の灯明に、ひとりでに火が入った。",
          duration: 4,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "suriashi",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "step", at: [-2, 0.1, 8], volume: 0.5 },
        { type: "sound", sound: "step", at: [-1, 0.1, 7], volume: 0.5 },
        { type: "sound", sound: "knock", at: [0, 1.2, 7], volume: 0.6 },
        {
          type: "subtitle",
          text: "すっ、すっ、と板を擦る足音。続いて、竹刀を打ち合わせる乾いた音。誰もいないのに。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "shinai",
      when: { type: "time", at: 120 },
      actions: [
        { type: "visible", target: "shinai-fall", visible: true },
        { type: "sound", sound: "thud", at: [3.8, 0.1, 9.6], volume: 0.7 },
        { type: "visible", target: "nafuda-a", visible: false },
        { type: "visible", target: "nafuda-b", visible: true },
        {
          type: "subtitle",
          text: "竹刀が一本倒れた。名札掛けを見ると、最後の札が自分の名前に替わっている。",
          duration: 6,
        },
        { type: "drone", level: 0.1 },
      ],
    },
    {
      id: "taiko",
      when: { type: "time", at: 160 },
      actions: [
        { type: "sound", sound: "thud", at: { node: "taiko" }, volume: 1 },
        { type: "shake", intensity: 0.02, duration: 0.5 },
        { type: "sound", sound: "whisper", at: [0, 1.4, 6.5], volume: 0.6 },
        {
          type: "subtitle",
          text: "どん。太鼓が一度だけ鳴った。道場の真ん中から、低い声。「……れい」",
          duration: 6,
        },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "dojo-door", state: "slam" },
        { type: "door", door: "dojo-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1, 0], volume: 0.8 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        {
          type: "subtitle",
          text: "引き戸がぴしゃりと閉まり、外から心張り棒を掛ける音がした。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "dojo", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "on" },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "照明が落ちた。神棚の灯明だけが揺れている。防具棚の面が、一つ足りない。",
          duration: 6,
        },
        { type: "objective", text: "神棚の前で一礼する" },
      ],
    },
    {
      id: "bow",
      when: { type: "interact", target: "kamidana", label: "一礼する", maxDistance: 3.2 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "lights", group: "candle", on: false },
        { type: "visible", target: "kneeler", visible: true },
        { type: "sound", sound: "breath", at: { node: "kneeler" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "頭を上げると灯明が消えていた。背後の、道場の真ん中に、誰かが正座している気配。",
          duration: 6,
        },
      ],
    },
    {
      id: "bow-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["bow", ...SCARES],
      actions: [
        { type: "lights", group: "candle", on: false },
        { type: "visible", target: "kneeler", visible: true },
        { type: "sound", sound: "breath", at: { node: "kneeler" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "灯明が消えた。道場の真ん中で、防具の擦れる音がした。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "kneeler", maxAngleDeg: 22, maxDistance: 14 },
      requiresAny: ["bow", "bow-auto"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "kneeler", visible: false },
        { type: "jumpscare", figure: "armored" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "kneeler", visible: false },
        { type: "jumpscare", figure: "armored" },
      ],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "夜稽古",
          text: "朝稽古に来た先生は、道場の真ん中に一つだけ置かれた面を見つけた。\n名札掛けの一番端には、昔、夜稽古の最中に亡くなった門下生の名が、もう一度掛かっていた。",
        },
      ],
    })),
  ],
};
