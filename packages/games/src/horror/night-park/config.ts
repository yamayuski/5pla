import type { HorrorConfig } from "./kit/types";

/**
 * 「回る遊具」の演出データ。
 * 夜の児童公園は x=-10〜10, z=0〜24（南の入口 z=0、北の出口の門 z=24 の park-gate）。
 * ブランコ(x=5,z=14)、すべり台(x=-5,z=10)、回転遊具 merry(0,18)。
 * 最後は回転遊具が急に止まり、乗っていた子ども(child)がこちらを向いている。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "night-park",
  title: "回る遊具",
  intro: [
    "終電後の帰り道。家までの近道は、住宅街の小さな公園を抜ける道だ。",
    "北の出口まで、二十秒もかからない。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.4, 20] },
  fog: { color: [0.03, 0.035, 0.05], density: 0.022 },
  ambient: { intensity: 0.08, color: [0.75, 0.82, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.55,
    angleDeg: 40,
    range: 14,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.085,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 公園を抜ける ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "古い水銀灯がじりじり鳴っている。ブランコも、すべり台も、昼の顔とは別の形をしている。",
        },
        { type: "objective", text: "北の出口の門まで公園を抜ける" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "swing",
      when: { type: "time", at: 70 },
      actions: [
        { type: "custom", name: "swingOn" },
        { type: "sound", sound: "creak", at: [5, 2, 14], volume: 0.8 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "風はないのに、右手のブランコが一つ、ぎい、ぎいと揺れはじめた。",
          duration: 5,
        },
      ],
    },
    {
      id: "giggle",
      when: { type: "time", at: 115 },
      actions: [
        { type: "sound", sound: "giggle", at: [-5, 1.4, 10], volume: 0.8 },
        {
          type: "subtitle",
          text: "すべり台の上から、子どもの笑い声。ここにはもう、誰もいないはずなのに。",
          duration: 5,
        },
      ],
    },
    {
      id: "merry",
      when: { type: "time", at: 155 },
      actions: [
        { type: "custom", name: "merryOn" },
        { type: "sound", sound: "rumble", at: [0, 0.4, 18], volume: 0.7 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "正面の回転遊具が、きりきりと軋みながら回りはじめた。誰も、押していない。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 出口が閉じる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "park-gate", state: "slam" },
        { type: "door", door: "park-gate", state: "lock" },
        { type: "lights", group: "park", on: false },
        { type: "custom", name: "merryFast" },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "fog", density: 0.045, duration: 4 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "北の門が、がしゃんと閉まった。水銀灯が全部消え、回転遊具の軋みだけが速くなっていく。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 4〜5分: 回転が止まる ----
    {
      id: "stop",
      when: { type: "after", trigger: "lock", delay: 28 },
      unless: SCARES,
      actions: [
        { type: "custom", name: "merryOff" },
        { type: "visible", target: "child", visible: true },
        { type: "face", target: "child" },
        { type: "sound", sound: "slam", at: [0, 0.4, 18], volume: 0.9 },
        { type: "heartbeat", bpm: 130 },
        {
          type: "subtitle",
          text: "軋みが、ぴたりと止んだ。回転遊具の上に、うつむいた子どもが一人座っている。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "look", target: "child", maxAngleDeg: 26, maxDistance: 25 },
      requires: ["stop"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "child" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "stop", delay: 9 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "child" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "child" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "回る遊具",
          text: "翌朝、公園の回転遊具の上に、赤い靴が片方だけ置かれているのが見つかった。\n近所の人の話では、その遊具は二十年前に撤去されたはずだという。\n\n公園の門は、内側から鍵がかかっていた。",
        },
      ],
    })),
  ],
};
