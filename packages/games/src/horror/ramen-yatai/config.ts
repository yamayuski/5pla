import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「お連れ様」の演出データ。
 * 屋台のカウンター（客は z≈6）、丼 bowl-1 / bowl-2、勘定の札 bill、品書き menu、店主 cook（最初からうつむいている）、
 * 赤ちょうちん group lantern / 屋台の灯り group cart / 街灯 group street。フック lanternSway / cookLookUp。
 */
const SCARES = ["scare-hit", "scare-hit-auto", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "ramen-yatai",
  title: "お連れ様",
  intro: [
    "残業帰り、川沿いの遊歩道に、見慣れない屋台が一台だけ出ていた。",
    "赤ちょうちんに「中華そば」。店主は手ぬぐいを巻いて、うつむいたまま「いらっしゃい」と言った。",
  ],
  spawn: { position: [-0.6, 1.6, 5.4], lookAt: [0, 1.3, 7.6] },
  fog: { color: [0.02, 0.02, 0.03], density: 0.04 },
  ambient: { intensity: 0.05, color: [0.7, 0.75, 1] },
  flashlight: {
    enabled: false,
    intensity: 0.5,
    angleDeg: 42,
    range: 10,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.07,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "川の音と、寸胴の湯気。湯気の向こうの店主は、一度も顔を上げない。",
          duration: 5,
        },
        { type: "objective", text: "品書きを見て注文する" },
      ],
    },
    {
      id: "order",
      when: { type: "interact", target: "menu", label: "中華そばを一つ", maxDistance: 2.2 },
      actions: [
        { type: "visible", target: "bowl-1", visible: true },
        { type: "sound", sound: "step", at: { node: "bowl-1" }, volume: 0.3 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "「へい、お待ち」。うつむいたまま、丼が差し出された。",
          duration: 4,
        },
      ],
    },
    {
      id: "order-auto",
      when: { type: "time", at: 45 },
      unless: ["order"],
      actions: [
        { type: "visible", target: "bowl-1", visible: true },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "頼んでもいないのに、目の前に丼が置かれた。「へい、お待ち」",
          duration: 4,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "second-bowl",
      when: { type: "time", at: 75 },
      actions: [
        { type: "visible", target: "bowl-2", visible: true },
        { type: "sound", sound: "step", at: { node: "bowl-2" }, volume: 0.3 },
        {
          type: "subtitle",
          text: "隣の空いた席にも、丼が置かれた。「お連れさんの分ね」。……一人で来たのに。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "slurp",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "breath", at: [0.6, 1.4, 6.0], volume: 0.6 },
        { type: "sound", sound: "whisper", at: [0.6, 1.4, 6.0], volume: 0.5 },
        { type: "custom", name: "lanternSway" },
        {
          type: "subtitle",
          text: "隣の丼から、麺をすする音。風もないのに、ちょうちんが揺れている。",
          duration: 6,
        },
        { type: "drone", level: 0.1 },
      ],
    },
    {
      id: "streetlights",
      when: { type: "time", at: 165 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "lights", group: "street", on: false },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        {
          type: "subtitle",
          text: "遊歩道の街灯が消えた。背後を、誰かが何人も通り過ぎていく足音。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "fog-in",
      when: { type: "time", at: 205 },
      actions: [
        { type: "fog", density: 0.12, duration: 6 },
        { type: "sound", sound: "rumble", at: "player", volume: 0.5 },
        { type: "shake", intensity: 0.015, duration: 1 },
        {
          type: "subtitle",
          text: "川から濃い霧が上がってきた。来た道も、橋も、もう見えない。屋台の灯りの外は真っ白だ。",
          duration: 6,
        },
      ],
    },
    {
      id: "bill",
      when: { type: "after", trigger: "fog-in", delay: 9 },
      actions: [
        { type: "lights", group: "cart", on: false },
        { type: "flashlight", state: "on" },
        { type: "visible", target: "bill", visible: true },
        { type: "sound", sound: "bell", at: { node: "cook" }, volume: 0.4 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "屋台の電球が切れた。ちょうちんの赤い灯りの中、勘定の札が置かれる。「二名様で」",
          duration: 6,
        },
        { type: "objective", text: "勘定を払う" },
      ],
    },
    {
      id: "pay",
      when: { type: "interact", target: "bill", label: "勘定を払う", maxDistance: 2.2 },
      requires: ["bill"],
      unless: SCARES,
      actions: [
        { type: "custom", name: "cookLookUp" },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "「お連れさん、ずっと待ってたんですよ。……あんたが来るのを」。店主が、ゆっくり顔を上げた。",
          duration: 6,
        },
      ],
    },
    {
      id: "pay-auto",
      when: { type: "after", trigger: "bill", delay: 35 },
      unless: ["pay", ...SCARES],
      actions: [
        { type: "custom", name: "cookLookUp" },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "「お客さん」。うつむいていた店主が、ゆっくり顔を上げた。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "after", trigger: "pay", delay: 1.6 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "cook" }],
    },
    {
      id: "scare-hit-auto",
      when: { type: "look", target: "cook", maxAngleDeg: 22, maxDistance: 10 },
      requires: ["pay-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "cook" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "cook" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "お連れ様",
          text: "翌朝、川沿いの遊歩道に屋台はなかった。ベンチの上に、冷めた丼が二つだけ並んでいた。\n片方は、きれいに空になっていた。",
        },
      ],
    })),
  ],
};
