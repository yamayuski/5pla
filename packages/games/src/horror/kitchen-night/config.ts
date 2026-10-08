import type { HorrorConfig } from "./kit/types";

/**
 * 「冷蔵庫の中身」の演出データ。
 * 部屋 x=-3〜3, z=0〜8。冷蔵庫は (1.5, 7.65)。上段の扉 fridge-top、下段の扉 freezer-door を `move` で横へ開く。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "kitchen-night",
  title: "冷蔵庫の中身",
  intro: [
    "一人暮らしの深夜二時。喉が渇いて、台所の冷蔵庫に麦茶を取りに来た。",
    "電気はつけない。冷蔵庫の灯りだけで足りる。",
  ],
  spawn: { position: [-0.5, 1.6, 2.4], lookAt: [1.5, 1.4, 7.5] },
  fog: { color: [0.06, 0.06, 0.07], density: 0.012 },
  ambient: { intensity: 0.1, color: [0.9, 0.95, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.35,
    angleDeg: 40,
    range: 9,
    color: [1, 0.97, 0.92],
  },
  walkSpeed: 0.075,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "壁の時計が、カチ、カチ、と鳴っている。" },
        { type: "objective", text: "冷蔵庫の上段を開けて、麦茶を取る" },
      ],
    },
    {
      id: "open-top",
      when: {
        type: "interact",
        target: "fridge-top",
        label: "冷蔵庫を開ける",
        maxDistance: 2.6,
      },
      actions: [
        {
          type: "move",
          target: "fridge-top",
          to: [2.25, 1.4, 6.9],
          duration: 0.6,
        },
        { type: "lights", group: "fridge", on: true },
        {
          type: "sound",
          sound: "creak",
          at: { node: "fridge-top" },
          volume: 0.6,
        },
        {
          type: "subtitle",
          text: "麦茶のとなりに、見覚えのない弁当箱。ふたに、自分の字で「今日の分」と書いてある。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "hum",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "buzz", at: [1.5, 1, 7.6], volume: 0.5 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "冷蔵庫のモーターが、人の唸り声のような低い音をたてはじめた。",
          duration: 5,
        },
      ],
    },
    {
      id: "close",
      when: { type: "time", at: 115 },
      actions: [
        { type: "flicker", duration: 1.0 },
        {
          type: "move",
          target: "fridge-top",
          to: [1.5, 1.4, 7.28],
          duration: 0.15,
        },
        { type: "sound", sound: "slam", at: [1.5, 1.4, 7.3], volume: 0.9 },
        {
          type: "subtitle",
          text: "上段の扉が、ひとりでに閉まった。誰かが内側から引いたみたいに。",
          duration: 5,
        },
      ],
    },
    {
      id: "knock",
      when: { type: "time", at: 155 },
      actions: [
        { type: "sound", sound: "knock", at: [1.5, 0.45, 7.4], volume: 0.9 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "コン、コン。下段の冷凍庫の中から、ノックの音。",
          duration: 5,
        },
      ],
    },
    {
      id: "clock",
      when: { type: "time", at: 190 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "sound", sound: "whisper", at: [1.5, 0.45, 7.4], volume: 0.5 },
        {
          type: "subtitle",
          text: "「……出して……さむい……」。時計の音が止まった。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "door", door: "front-door", state: "lock" },
        { type: "lights", group: "room", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "玄関のドアが閉まって、鍵がかかった。電気が消え、冷凍庫を叩く音だけが大きくなる。",
          duration: 6,
        },
        { type: "objective", text: "冷凍庫の中を確かめる" },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "interact",
        target: "freezer-door",
        label: "冷凍庫を開ける",
        maxDistance: 3,
      },
      requires: ["lock"],
      unless: SCARES,
      actions: [
        {
          type: "move",
          target: "freezer-door",
          to: [2.3, 0.45, 6.9],
          duration: 0.1,
        },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "lock", delay: 55 },
      unless: SCARES,
      actions: [
        {
          type: "move",
          target: "freezer-door",
          to: [2.3, 0.45, 6.9],
          duration: 0.1,
        },
        { type: "jumpscare", figure: "ghost" },
      ],
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
          title: "冷蔵庫の中身",
          text: "翌朝、管理人が部屋を訪ねると、台所の冷蔵庫の扉が開いたままだった。\n中の食べものはすべて凍りつき、麦茶のボトルの横に「今日の分」と書かれた弁当箱が、ひとつだけ残っていたという。\n\n部屋の住人は、見つかっていない。",
        },
      ],
    })),
  ],
};
