import type { HorrorConfig } from "./kit/types";

/**
 * 「開かずの踏切」の演出データ。
 * 夜の住宅街の道（x=-3〜3, z=-4〜40）。踏切は z≈20（線路は x 方向）、遮断機は z=18 と z=22。
 * 遮断機は下りたまま。向こう側に待つ人影(w0〜w4)が増える。電車が通過したあと遮断機が上がり、人影が渡ってくる。
 * 先頭の leader が最後の一発。警報音と赤色灯は level.ts のフックで制御する。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];
const WAITERS = [0, 1, 2, 3, 4];

export const config: HorrorConfig = {
  slug: "railroad-crossing",
  title: "開かずの踏切",
  intro: [
    "残業帰りの夜道。家は踏切の向こう側だ。",
    "遠くから、カンカンカン、と警報機の音が聞こえる。",
  ],
  spawn: { position: [0, 1.6, 0], lookAt: [0, 1.5, 20] },
  fog: { color: [0.03, 0.03, 0.05], density: 0.03 },
  ambient: { intensity: 0.08, color: [0.7, 0.75, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.55,
    angleDeg: 38,
    range: 14,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.085,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 踏切に着く ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "custom", name: "bellOn" },
        {
          type: "subtitle",
          text: "赤い警報灯が、濡れた道路を点滅させている。電車の音は、まだしない。",
        },
        { type: "objective", text: "踏切を渡って帰る" },
      ],
    },
    {
      id: "gate",
      when: { type: "zone", center: [0, 1.6, 16], radius: 2.8 },
      actions: [
        {
          type: "subtitle",
          text: "遮断機は下りたまま。……待つしかない。",
          duration: 4,
        },
      ],
    },
    // ---- 1〜3分: 向こう側に人が増える ----
    {
      id: "waiters-a",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "w0", visible: true },
        { type: "visible", target: "w1", visible: true },
        { type: "visible", target: "w2", visible: true },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "線路の向こう側に、三人。みな、こちらを向いて電車を待っている。",
          duration: 5,
        },
      ],
    },
    {
      id: "waiters-b",
      when: { type: "time", at: 125 },
      actions: [
        { type: "visible", target: "w3", visible: true },
        { type: "visible", target: "w4", visible: true },
        { type: "drone", level: 0.18 },
        {
          type: "subtitle",
          text: "人が増えている。さっき数えたときは三人だったのに。一人も、動かない。",
          duration: 5,
        },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 160 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 0.3, 20], volume: 0.9 },
        {
          type: "subtitle",
          text: "線路の砂利の中から、囁き声。「……かえして……かえして……」",
          duration: 5,
        },
      ],
    },
    {
      id: "bell-fast",
      when: { type: "time", at: 185 },
      actions: [
        { type: "custom", name: "bellFast" },
        { type: "heartbeat", bpm: 96 },
      ],
    },
    // ---- 3〜4分: 電車と、上がる遮断機 ----
    {
      id: "dark",
      when: { type: "time", at: 205 },
      actions: [
        { type: "lights", group: "street", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.2 },
        { type: "fog", density: 0.05, duration: 4 },
        {
          type: "subtitle",
          text: "街灯が消えた。赤い警報灯だけが、規則正しく闇を染める。",
          duration: 4,
        },
      ],
    },
    {
      id: "train",
      when: { type: "time", at: 222 },
      actions: [
        { type: "visible", target: "train", visible: true },
        { type: "move", target: "train", to: [40, 0, 20], duration: 4.5 },
        { type: "sound", sound: "rumble", at: [-20, 1, 20], volume: 1 },
        { type: "shake", intensity: 0.04, duration: 4 },
        { type: "heartbeat", bpm: 110 },
        {
          type: "subtitle",
          text: "轟音。窓の灯りだけを連ねた電車が、人影の前を通り抜けていく。",
          duration: 4,
        },
      ],
    },
    {
      id: "gate-up",
      when: { type: "after", trigger: "train", delay: 5.5 },
      actions: [
        { type: "custom", name: "bellOff" },
        { type: "visible", target: "train", visible: false },
        { type: "visible", target: "gate-bars", visible: false },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "警報音が止んだ。遮断機が上がる。……向こう側の人影が、一斉に、こちらへ歩きだした。",
          duration: 6,
        },
      ],
    },
    {
      id: "approach",
      when: { type: "after", trigger: "gate-up", delay: 0.5 },
      actions: [
        { type: "visible", target: "leader", visible: true },
        ...WAITERS.map((i) => ({
          type: "move" as const,
          target: `w${i}`,
          to: [-2.4 + i * 1.2, 0, 15.5 + (i % 2) * 0.8] as const,
          duration: 14 + i,
        })),
        { type: "move", target: "leader", to: [0, 0, 14.6], duration: 13 },
        { type: "sound", sound: "footsteps", at: [0, 0, 20], volume: 0.9 },
      ],
    },
    // ---- 4〜5分: 目の前に ----
    {
      id: "near",
      when: { type: "after", trigger: "approach", delay: 10 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "breath", at: "behind", volume: 0.8 },
        { type: "heartbeat", bpm: 135 },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "leader",
        maxAngleDeg: 28,
        maxDistance: 20,
      },
      requires: ["near"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "leader" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "near", delay: 8 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "leader" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "leader" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "開かずの踏切",
          text: "翌朝、踏切の警報機は、電車が一本も通っていないのに、夜明けまで鳴り続けていたという。\n\n線路脇の電柱の根元には、会社帰りの鞄が一つ、まだ温かいまま置かれていた。",
        },
      ],
    })),
  ],
};
