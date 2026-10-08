import type { HorrorConfig } from "./kit/types";

/**
 * 「地下街の閉店」の演出データ。
 * 地下街の通路は x=-3〜3, z=0〜44（出口の階段は北 z=44）。左（西）にショーケース4つ（case-0〜3 / z=10,18,26,34）、
 * 中のマネキン m0〜m3。右（東）は閉店のシャッター。z=40 のシャッター(exit-shutter)が最後に降りる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "underground-mall",
  title: "地下街の閉店",
  intro: [
    "終電間際の地下街。閉店のアナウンスが流れ、シャッターが次々に降りている。",
    "地上への階段まで、一本道を歩くだけだ。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.5, 30] },
  fog: { color: [0.05, 0.05, 0.06], density: 0.016 },
  ambient: { intensity: 0.1, color: [0.85, 0.9, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 40,
    range: 13,
    color: [0.95, 0.98, 1],
  },
  walkSpeed: 0.09,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 閉店の地下街 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "蛍光灯の唸りと、自分の足音だけ。左のショーケースのマネキンが、通路のほうを向いて並んでいる。",
        },
        { type: "objective", text: "突き当たりの出口の階段まで歩く" },
      ],
    },
    {
      id: "announce",
      when: { type: "time", at: 40 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 3, 20], volume: 0.7 },
        {
          type: "subtitle",
          text: "「本日の営業は終了いたしました。お客様は、お近くの出口から、お急ぎください」",
          duration: 5,
        },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "turn-1",
      when: { type: "time", at: 75 },
      actions: [
        { type: "face", target: "m0" },
        { type: "face", target: "m1" },
        { type: "sound", sound: "creak", at: [-2.4, 1, 14], volume: 0.7 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "手前の二体のマネキンが、こちらに首をひねっている。さっきは、通路を向いていたはずなのに。",
          duration: 5,
        },
      ],
    },
    {
      id: "gone-1",
      when: { type: "time", at: 115 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "move", target: "m1", to: [0.8, 0, 30], duration: 0.1 },
        { type: "sound", sound: "static", at: [0, 3, 18], volume: 0.5 },
        {
          type: "subtitle",
          text: "蛍光灯が瞬いた。二番目のケースが、空になっている。……通路の先に、立っている。",
          duration: 5,
        },
      ],
    },
    {
      id: "gone-2",
      when: { type: "time", at: 155 },
      actions: [
        { type: "flicker", duration: 1.3 },
        { type: "move", target: "m2", to: [-0.8, 0, 35], duration: 0.1 },
        { type: "face", target: "m1" },
        { type: "sound", sound: "step", at: "behind", volume: 0.6 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "また瞬いた。三体目も消えた。先に立っている二体は、全員こちらを向いている。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 出口が閉じる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        {
          type: "move",
          target: "exit-shutter",
          to: [0, 1.6, 40],
          duration: 0.5,
        },
        { type: "sound", sound: "slam", at: [0, 1.5, 40], volume: 1 },
        { type: "lights", group: "tube", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "shake", intensity: 0.04, duration: 1 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "通路の先で、出口のシャッターが降りた。蛍光灯が全部落ち、非常口の緑だけが光っている。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "walk",
      when: { type: "after", trigger: "lock", delay: 6 },
      actions: [
        { type: "move", target: "m3", to: [0, 0, 8], duration: 36 },
        { type: "move", target: "m1", to: [0.6, 0, 20], duration: 30 },
        { type: "visible", target: "m3", visible: true },
        { type: "sound", sound: "footsteps", at: [0, 0, 34], volume: 0.9 },
        {
          type: "subtitle",
          text: "通路の闇の奥から、マネキンが関節を鳴らして、一歩ずつ歩いてくる。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: 目の前に ----
    {
      id: "near",
      when: { type: "after", trigger: "walk", delay: 30 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "rattle", at: "behind", volume: 0.9 },
        { type: "heartbeat", bpm: 135 },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "look", target: "m3", maxAngleDeg: 24, maxDistance: 14 },
      requires: ["near"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "m3" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "near", delay: 8 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "m3" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "m3" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "地下街の閉店",
          text: "翌朝、地下街のショーケースには、マネキンが四体、何事もなかったように並んでいた。\nただし、一体だけ、昨日まで着ていなかった会社員のスーツを着ていたという。",
        },
      ],
    })),
  ],
};
