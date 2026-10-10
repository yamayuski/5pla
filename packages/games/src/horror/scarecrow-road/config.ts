import type { HorrorConfig } from "./kit/types";

/** 「かかしの道」の演出データ。畑のかかしが一体ずつ増えて道へ近づき、最後に振り向く。 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "scarecrow-road",
  title: "かかしの道",
  intro: [
    "終バスを逃し、街灯の少ない夜の田舎道を歩いて帰る。",
    "畑には、古いかかしが何本か立っている。",
  ],
  spawn: { position: [0, 1.6, 0.8], lookAt: [0, 1.6, 30] },
  fog: { color: [0.02, 0.02, 0.03], density: 0.02 },
  ambient: { intensity: 0.08, color: [0.8, 0.85, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.6,
    angleDeg: 40,
    range: 14,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.08,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "道の先に「行き止まり」の看板が見える。" },
        { type: "objective", text: "道の先の民家まで歩く" },
      ],
    },
    {
      id: "tick",
      when: { type: "time", at: 60 },
      actions: [
        {
          type: "sound",
          sound: "chime",
          at: [0, 1, 14],
          volume: 0.5,
        },
        { type: "heartbeat", bpm: 70 },
        {
          type: "subtitle",
          text: "畑の奥で、藁がこすれるような音がする。",
          duration: 5,
        },
      ],
    },
    {
      id: "portrait",
      when: { type: "time", at: 105 },
      actions: [
        { type: "visible", target: "sc2", visible: true },
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "whisper", at: "behind", volume: 0.5 },
        {
          type: "subtitle",
          text: "さっきより、かかしが道に近い気がする。",
          duration: 5,
        },
      ],
    },
    {
      id: "piano-note",
      when: { type: "time", at: 150 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 1, 30], volume: 0.8 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "背後で、何かが一歩、土を踏んだ。",
          duration: 4,
        },
      ],
    },
    {
      id: "sc-appear",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "visible", target: "sc1", visible: true },
        { type: "sound", sound: "chime", at: [0, 1, 30], volume: 0.9 },
        {
          type: "subtitle",
          text: "道のすぐ脇に、かかしが立っている。さっきは無かった。",
          duration: 6,
        },
      ],
    },
    {
      id: "lock",
      when: { type: "time", at: 215 },
      actions: [
        { type: "sound", sound: "slam", at: [0, 1, 0], volume: 0.9 },
        { type: "lights", group: "road", on: false },
        { type: "flashlight", state: "dim" },
        { type: "visible", target: "sc3", visible: true },
        { type: "heartbeat", bpm: 110 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "街灯が一斉に消えた。畑のかかしが、全員こちらを向いている。",
          duration: 6,
        },
      ],
    },
    {
      id: "come",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "custom", name: "none" },
        { type: "sound", sound: "stinger", at: [0, 1, 30], volume: 0.5 },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "道の先に、三体目のかかしが立ち塞がっている。顔が、ゆっくり上がる。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "sc3",
        maxAngleDeg: 20,
        maxDistance: 30,
      },
      requires: ["come"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "come", delay: 18 },
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
          title: "かかしの道",
          text: "翌朝、畑のかかしは一本多かった。\n新しい一本は、あなたの靴を履いていた。",
        },
      ],
    })),
  ],
};
