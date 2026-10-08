import type { HorrorConfig } from "./kit/types";

/**
 * 「屋根裏の人形の家」の演出データ。
 * 屋根裏は x=-4〜4, z=0〜10。奥の台(z=8.6)に、この部屋を写した人形の家。中の小さな影が近づいてくる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "attic-room",
  title: "屋根裏の人形の家",
  intro: [
    "祖母の遺品整理。クリスマスの飾りを取りに、家の屋根裏へ上がった。",
    "埃のにおいがする。奥の台に、見覚えのない人形の家がある。",
  ],
  spawn: { position: [-2.5, 1.6, 1.0], lookAt: [0, 1.4, 8] },
  fog: { color: [0.06, 0.05, 0.04], density: 0.02 },
  ambient: { intensity: 0.1, color: [1, 0.85, 0.7] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 40,
    range: 10,
    color: [1, 0.95, 0.85],
  },
  walkSpeed: 0.08,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "古い行李の中に、飾りの箱があるはず。" },
        { type: "objective", text: "手前の行李を開ける" },
      ],
    },
    {
      id: "trunk",
      when: {
        type: "interact",
        target: "old-trunk",
        label: "行李を開ける",
        maxDistance: 2.5,
      },
      actions: [
        {
          type: "sound",
          sound: "creak",
          at: { node: "old-trunk" },
          volume: 0.6,
        },
        {
          type: "subtitle",
          text: "飾りは入っていない。底に、祖母の字のメモ。「あの家の中を、見てはいけません」",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "doll-you",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "mini-you", visible: true },
        { type: "lights", group: "doll", on: true },
        { type: "sound", sound: "giggle", at: [0, 1.2, 8.6], volume: 0.4 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "人形の家の中に、小さな人形がいる。着ているのは、今のあなたと同じ服。",
          duration: 6,
        },
      ],
    },
    {
      id: "rocker",
      when: { type: "time", at: 110 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "custom", name: "rockOn" },
        { type: "sound", sound: "creak", at: [2.6, 0.5, 6.4], volume: 0.8 },
        {
          type: "subtitle",
          text: "揺り椅子が、ひとりでに揺れ始めた。人形の家の中の小さな椅子も、同じ向きに揺れている。",
          duration: 6,
        },
      ],
    },
    {
      id: "mini-appears",
      when: { type: "time", at: 150 },
      actions: [
        { type: "visible", target: "mini-ghost", visible: true },
        { type: "sound", sound: "whisper", at: [0, 1.2, 8.6], volume: 0.5 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "人形の家の奥に、もう一体。長い黒髪の人形が、小さなあなたの後ろに立っている。",
          duration: 6,
        },
      ],
    },
    {
      id: "mini-near",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        {
          type: "move",
          target: "mini-ghost",
          to: [0.25, 0.84, 8.7],
          duration: 4,
        },
        { type: "sound", sound: "step", at: "behind", volume: 0.6 },
        {
          type: "subtitle",
          text: "照明が瞬くたびに、小さな人形が一歩ずつ、小さなあなたに近づく。背後で床板が鳴った。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "attic-door", state: "slam" },
        { type: "door", door: "attic-door", state: "lock" },
        { type: "lights", group: "attic", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        {
          type: "move",
          target: "mini-ghost",
          to: [0.03, 0.84, 8.62],
          duration: 6,
        },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "階段の扉が閉まった。明かりは人形の家の中だけ。小さな人形が、小さなあなたの真後ろに立った。",
          duration: 7,
        },
        { type: "objective", text: "人形の家をもう一度よく見る" },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "mini-ghost",
        maxAngleDeg: 40,
        maxDistance: 6,
      },
      requires: ["lock"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "lock", delay: 45 },
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
          title: "屋根裏の人形の家",
          text: "遺品整理の業者は、屋根裏の台に置かれた人形の家を処分しようとした。\n中には、小さな人形が二体、寄り添うように立っていた。\n\n一体は、行方不明の孫によく似た服を着ていたという。",
        },
      ],
    })),
  ],
};
