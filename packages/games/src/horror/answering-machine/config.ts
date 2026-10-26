import type { HorrorConfig } from "./kit/types";

/**
 * 「留守電」の演出データ。1Kの部屋 x=-3〜3, z=0〜8。玄関(entry-door)は z=0。
 * 机の留守番電話(machine)を再生すると、自分の声の録音が流れる。
 * 最後は部屋の隅の女(woman)を見るか、振り向いた瞬間に目の前に現れる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "answering-machine",
  title: "留守電",
  intro: [
    "残業を終えて帰宅した。ドアを閉める前に、背後で何かが動いた気がした。",
    "部屋の奥で、留守番電話の赤いランプが点滅している。",
  ],
  spawn: { position: [0, 1.6, 1.0], lookAt: [0, 1.2, 7] },
  fog: { color: [0.03, 0.03, 0.035], density: 0.03 },
  ambient: { intensity: 0.1, color: [1, 0.9, 0.8] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 38,
    range: 10,
    color: [1, 0.95, 0.85],
  },
  walkSpeed: 0.08,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "一人暮らしの1K。電気をつけたまま出たはずなのに、部屋は少し薄暗い。",
        },
        { type: "objective", text: "奥の机の留守番電話を確認する" },
      ],
    },
    {
      id: "play1",
      when: {
        type: "interact",
        target: "machine",
        label: "留守電を再生する",
        maxDistance: 2.4,
      },
      unless: ["play1"],
      actions: [
        { type: "sound", sound: "static", at: [1, 1, 7.5], volume: 0.6 },
        { type: "sound", sound: "phone", at: [1, 1, 7.5], volume: 0.6 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "『…ねえ、今、家にいるよね。さっきからずっと、ドアの前にいるんだけど』——自分の声だ。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "knock",
      when: { type: "after", trigger: "play1", delay: 45 },
      actions: [
        { type: "sound", sound: "knock", at: [0, 1.2, 0], volume: 0.9 },
        {
          type: "subtitle",
          text: "『…三件目』。再生は一件目で止めたはずなのに、機械が勝手に次を流しはじめた。",
          duration: 5,
        },
      ],
    },
    {
      id: "whisper",
      when: { type: "after", trigger: "play1", delay: 85 },
      actions: [
        { type: "sound", sound: "whisper", at: [-1.6, 1.4, 7.6], volume: 0.8 },
        { type: "lights", group: "room", on: false },
        { type: "flicker", duration: 1 },
        {
          type: "subtitle",
          text: "『…うしろ』。囁きとともに、部屋の明かりが一度落ちて、また点いた。",
          duration: 5,
        },
        { type: "drone", level: 0.2 },
      ],
    },
    {
      id: "lock",
      when: { type: "after", trigger: "play1", delay: 130 },
      actions: [
        { type: "door", door: "entry-door", state: "slam" },
        { type: "door", door: "entry-door", state: "lock" },
        { type: "lights", group: "room", on: false },
        { type: "flashlight", state: "dim" },
        { type: "fog", density: 0.05, duration: 4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "玄関のドアが、ひとりでに閉まった。『…やっと、気づいた』。電気は戻らない。",
          duration: 6,
        },
      ],
    },
    {
      id: "appear",
      when: { type: "after", trigger: "lock", delay: 20 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "woman", visible: true },
        { type: "sound", sound: "breath", at: [-1.6, 1.4, 7.6], volume: 0.9 },
        { type: "heartbeat", bpm: 130 },
        {
          type: "subtitle",
          text: "ベッドの脇の暗がりに、髪の長い女が壁を向いて立っている。……この部屋は、一人暮らしのはずだ。",
          duration: 6,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "look", target: "woman", maxAngleDeg: 24, maxDistance: 12 },
      requires: ["appear"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "appear", delay: 10 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "留守電",
          text: "翌朝、管理人が部屋を訪れると、留守番電話の再生ランプが点滅していた。\n録音は、昨夜の日付で一件だけ。\n\nそこには、部屋の中を歩き回る足音と、「やっと、気づいた」という自分の声が残っていた。",
        },
      ],
    })),
  ],
};
