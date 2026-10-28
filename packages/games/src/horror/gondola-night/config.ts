import type { HorrorConfig } from "@5pla/horror-kit/types";

/** 「てっぺんの手前」。ゴンドラは3m×3m。窓は東西。向かいの席 rider が最後に現れる。 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "gondola-night",
  title: "てっぺんの手前",
  intro: [
    "閉園間際の観覧車。係員は「お一人ですね」と笑って扉を閉めた。",
    "一周15分。ただ座っていればいい。",
  ],
  spawn: { position: [0, 1.6, 0.9], lookAt: [0, 1.5, 3] },
  fog: { color: [0.02, 0.02, 0.05], density: 0.03 },
  ambient: { intensity: 0.12, color: [0.8, 0.8, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 45,
    range: 6,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.05,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "ゴンドラがきしみながら昇っていく。街の灯りが遠くなる。",
        },
        { type: "objective", text: "向かいの席を調べて、座って待つ" },
      ],
    },
    {
      id: "sit",
      when: { type: "time", at: 50 },
      actions: [
        { type: "sound", sound: "creak", at: [0, 2, 1.5], volume: 0.5 },
        { type: "subtitle", text: "鉄骨の軋む音。風が出てきた。", duration: 4 },
      ],
    },
    {
      id: "hand-a",
      when: { type: "time", at: 75 },
      actions: [
        { type: "visible", target: "hand", visible: true },
        { type: "sound", sound: "knock", at: [1.5, 1.5, 1.2], volume: 0.8 },
        {
          type: "subtitle",
          text: "コン。窓の外に、手形が一つ。ここは地上40メートルだ。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "hand-b",
      when: { type: "time", at: 125 },
      actions: [
        { type: "visible", target: "hand2", visible: true },
        { type: "sound", sound: "giggle", at: [1.5, 1.5, 1.9], volume: 0.5 },
        {
          type: "subtitle",
          text: "手形が増えた。さっきより、近い。",
          duration: 4,
        },
      ],
    },
    {
      id: "light-flick",
      when: { type: "time", at: 165 },
      actions: [
        { type: "flicker", duration: 2 },
        { type: "sound", sound: "buzz", at: [0, 2, 1.5], volume: 0.6 },
        {
          type: "subtitle",
          text: "照明が明滅する。ゴンドラが、止まった。",
          duration: 4,
        },
        { type: "drone", level: 0.2 },
      ],
    },
    {
      id: "stuck",
      when: { type: "time", at: 200 },
      actions: [
        { type: "lights", group: "bulb", on: false },
        { type: "flashlight", state: "dim" },
        { type: "sound", sound: "breath", at: "behind", volume: 0.8 },
        { type: "fog", density: 0.06, duration: 4 },
        {
          type: "subtitle",
          text: "停電。無線もつながらない。向かいの席から、息づかいがする。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 100 },
        { type: "objective", text: "向かいの席を照らす" },
      ],
    },
    {
      id: "rider-on",
      when: { type: "time", at: 250 },
      actions: [
        { type: "lights", group: "bulb", on: true },
        { type: "visible", target: "rider", visible: true },
        { type: "face", target: "rider" },
        { type: "sound", sound: "creak", at: { node: "rider" }, volume: 0.7 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "灯りが戻った。向かいの席に、白い服の女が俯いて座っている。……乗ったのは、一人のはず。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "look", target: "rider", maxAngleDeg: 22, maxDistance: 10 },
      requires: ["rider-on"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "rider" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 300 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "rider" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "てっぺんの手前",
          text: "係員は降りてきたゴンドラを確認した。乗客は一人のはずだったが、座席には濡れた足跡が二人分、並んでいたという。",
        },
      ],
    })),
  ],
};
