import type { HorrorConfig } from "./kit/types";

/**
 * 「出演者は3名です」の演出データ。
 * 通路 x=-2〜2, z=0〜34。進行はゾーン（zone-1〜3）で進み、時間経過でも自動で進む（auto-*）。
 * 3人目までは作り物の驚かせ役、4人目(actor-4)だけが入口側から歩いてくる。
 */
const SCARES = [
  "scare-hit",
  "scare-fallback",
  "scare-fallback-b",
  "scare-timeout",
];

export const config: HorrorConfig = {
  slug: "haunted-house",
  title: "出演者は3名です",
  intro: [
    "遊園地のお化け屋敷に、ひとりで入ってみた。",
    "入口の張り紙には「本日の出演者は3名です」。出口まで、約5分。",
  ],
  spawn: { position: [0, 1.6, 0.8], lookAt: [0, 1.5, 12] },
  fog: { color: [0.05, 0.02, 0.02], density: 0.03 },
  ambient: { intensity: 0.08, color: [1, 0.7, 0.6] },
  flashlight: {
    enabled: true,
    intensity: 0.35,
    angleDeg: 38,
    range: 9,
    color: [1, 0.9, 0.85],
  },
  walkSpeed: 0.08,
  droneLevel: 0.1,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "提灯の赤い光。作り物の血のりと、古い木のにおい。",
        },
        { type: "objective", text: "出口まで進む" },
      ],
    },
    {
      id: "shut",
      when: { type: "zone", center: [0, 1.6, 4], radius: 2 },
      actions: [
        { type: "door", door: "entrance", state: "slam" },
        { type: "door", door: "entrance", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1, 0], volume: 0.7 },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    // ---- 1人目 ----
    {
      id: "zone-1",
      when: { type: "zone", center: [0, 1.6, 7], radius: 2.5 },
      unless: ["auto-1"],
      actions: [
        { type: "visible", target: "actor-1", visible: true },
        { type: "sound", sound: "stinger", at: [-1, 1.4, 8.5], volume: 0.6 },
        { type: "sound", sound: "giggle", at: [-1, 1.4, 8.5], volume: 0.5 },
        {
          type: "subtitle",
          text: "壁の陰から白い着物の女が飛び出した。……作り物のお化けだ。1人目。",
          duration: 4,
        },
      ],
    },
    {
      id: "auto-1",
      when: { type: "time", at: 55 },
      unless: ["zone-1"],
      actions: [
        { type: "visible", target: "actor-1", visible: true },
        { type: "sound", sound: "stinger", at: [-1, 1.4, 8.5], volume: 0.6 },
        {
          type: "subtitle",
          text: "壁の陰から白い着物の女が顔を出した。1人目。",
          duration: 4,
        },
      ],
    },
    {
      id: "hide-1",
      when: { type: "after", trigger: "zone-1", delay: 5 },
      actions: [{ type: "visible", target: "actor-1", visible: false }],
    },
    {
      id: "hide-1b",
      when: { type: "after", trigger: "auto-1", delay: 5 },
      actions: [{ type: "visible", target: "actor-1", visible: false }],
    },
    // ---- 2人目 ----
    {
      id: "zone-2",
      when: { type: "zone", center: [0, 1.6, 15], radius: 2.5 },
      requiresAny: ["zone-1", "auto-1"],
      unless: ["auto-2"],
      actions: [
        { type: "visible", target: "actor-2", visible: true },
        { type: "sound", sound: "thud", at: [1, 1, 16.5], volume: 0.8 },
        {
          type: "subtitle",
          text: "棺桶の陰から、赤い着物の男が起き上がった。2人目。",
          duration: 4,
        },
      ],
    },
    {
      id: "auto-2",
      when: { type: "time", at: 110 },
      unless: ["zone-2"],
      actions: [
        { type: "visible", target: "actor-2", visible: true },
        { type: "sound", sound: "thud", at: [1, 1, 16.5], volume: 0.8 },
        {
          type: "subtitle",
          text: "棺桶の陰から、赤い着物の男が起き上がった。2人目。",
          duration: 4,
        },
      ],
    },
    {
      id: "hide-2",
      when: { type: "after", trigger: "zone-2", delay: 5 },
      actions: [{ type: "visible", target: "actor-2", visible: false }],
    },
    {
      id: "hide-2b",
      when: { type: "after", trigger: "auto-2", delay: 5 },
      actions: [{ type: "visible", target: "actor-2", visible: false }],
    },
    // ---- 3人目 ----
    {
      id: "zone-3",
      when: { type: "zone", center: [0, 1.6, 23], radius: 2.5 },
      requiresAny: ["zone-2", "auto-2"],
      unless: ["auto-3"],
      actions: [
        { type: "visible", target: "actor-3", visible: true },
        { type: "flicker", duration: 0.6 },
        { type: "sound", sound: "stinger", at: [0, 1.4, 24.5], volume: 0.7 },
        {
          type: "subtitle",
          text: "天井から青い着物の影がぶら下がった。3人目。……これで、出演者は全員だ。",
          duration: 5,
        },
      ],
    },
    {
      id: "auto-3",
      when: { type: "time", at: 165 },
      unless: ["zone-3"],
      actions: [
        { type: "visible", target: "actor-3", visible: true },
        { type: "flicker", duration: 0.6 },
        { type: "sound", sound: "stinger", at: [0, 1.4, 24.5], volume: 0.7 },
        {
          type: "subtitle",
          text: "天井から青い着物の影がぶら下がった。3人目。……これで、出演者は全員だ。",
          duration: 5,
        },
      ],
    },
    {
      id: "hide-3",
      when: { type: "after", trigger: "zone-3", delay: 5 },
      actions: [{ type: "visible", target: "actor-3", visible: false }],
    },
    {
      id: "hide-3b",
      when: { type: "after", trigger: "auto-3", delay: 5 },
      actions: [{ type: "visible", target: "actor-3", visible: false }],
    },
    // ---- 4人目 ----
    {
      id: "zone-4",
      when: { type: "zone", center: [0, 1.6, 29], radius: 2.5 },
      requiresAny: ["zone-3", "auto-3"],
      unless: ["auto-4"],
      actions: [
        { type: "drone", level: 0.4 },
        { type: "heartbeat", bpm: 110 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.8 },
        {
          type: "subtitle",
          text: "出口の前で、背後の足音に気づいた。ゆっくり、こちらへ歩いてくる。出演者は、3名のはずだ。",
          duration: 6,
        },
      ],
    },
    {
      id: "auto-4",
      when: { type: "time", at: 215 },
      unless: ["zone-4"],
      actions: [
        { type: "drone", level: 0.4 },
        { type: "heartbeat", bpm: 110 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.8 },
        {
          type: "subtitle",
          text: "背後で足音がする。ゆっくり、こちらへ歩いてくる。出演者は、3名のはずだ。",
          duration: 6,
        },
      ],
    },
    {
      id: "fourth",
      when: { type: "after", trigger: "zone-4", delay: 3 },
      actions: [
        { type: "visible", target: "actor-4", visible: true },
        { type: "move", target: "actor-4", to: [0, 0, 30], duration: 14 },
        { type: "lights", group: "lantern", on: false },
        { type: "flicker", duration: 1.2 },
        { type: "heartbeat", bpm: 135 },
      ],
    },
    {
      id: "fourth-b",
      when: { type: "after", trigger: "auto-4", delay: 3 },
      actions: [
        { type: "visible", target: "actor-4", visible: true },
        { type: "move", target: "actor-4", to: [0, 0, 30], duration: 14 },
        { type: "lights", group: "lantern", on: false },
        { type: "flicker", duration: 1.2 },
        { type: "heartbeat", bpm: 135 },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "actor-4",
        maxAngleDeg: 28,
        maxDistance: 40,
      },
      requiresAny: ["fourth", "fourth-b"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "fourth", delay: 13 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback-b",
      when: { type: "after", trigger: "fourth-b", delay: 13 },
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
          title: "出演者は3名です",
          text: "後日、お化け屋敷のスタッフに尋ねると、「あの日の出演者は、本当に3名だけでした」と青い顔で答えた。\n\n防犯カメラには、通路を一人で歩く来場者の背後に、白い着物の4人目が、ずっと映っていたという。",
        },
      ],
    })),
  ],
};
