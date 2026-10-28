import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「案山子の道」: 終バスを降りた夜の田んぼ道。南 z=0 バス停、北 z=58 に自宅の門（呼び鈴）。
 * 案山子が目を離すたびに近づく。最後は門の呼び鈴を押すと、背後の案山子が飛び出す。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "crow-field-road",
  title: "案山子の道",
  intro: [
    "終バスを降りると、家までは田んぼの一本道だった。",
    "道端の案山子が、今夜はやけに多い気がする。",
  ],
  spawn: { position: [0, 1.6, 0.8], lookAt: [0, 1.6, 30] },
  fog: { color: [0.03, 0.04, 0.06], density: 0.03 },
  ambient: { intensity: 0.06, color: [0.8, 0.9, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.8,
    angleDeg: 38,
    range: 14,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.09,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "虫の声と、遠くの門灯。案山子が三体、道の脇に立っている。",
        },
        { type: "objective", text: "家の門まで歩き、呼び鈴を押す" },
      ],
    },
    {
      id: "shift-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "move", target: "sc-1", to: [2.6, 0, 22], duration: 0.4 },
        { type: "sound", sound: "rattle", at: [4.5, 1, 22], volume: 0.6 },
        {
          type: "subtitle",
          text: "さっきより、案山子が道に近い気がする。",
          duration: 4,
        },
      ],
    },
    {
      id: "more",
      when: { type: "time", at: 105 },
      actions: [
        { type: "visible", target: "sc-3", visible: true },
        { type: "visible", target: "sc-4", visible: true },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        {
          type: "subtitle",
          text: "いつの間にか、前方にも案山子が立っている。",
          duration: 4,
        },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "turn",
      when: { type: "time", at: 140 },
      actions: [
        { type: "face", target: "sc-0" },
        { type: "sound", sound: "giggle", at: [-4, 1.5, 12], volume: 0.5 },
        {
          type: "subtitle",
          text: "背後の案山子が、こちらを向いている。",
          duration: 4,
        },
      ],
    },
    {
      id: "shift-2",
      when: { type: "time", at: 170 },
      actions: [
        { type: "visible", target: "sc-5", visible: true },
        { type: "move", target: "sc-2", to: [-2.5, 0, 32], duration: 0.4 },
        { type: "move", target: "sc-4", to: [2.4, 0, 48], duration: 0.4 },
        { type: "sound", sound: "rattle", at: "behind", volume: 0.7 },
        { type: "lights", group: "lamp-b", on: false },
        { type: "drone", level: 0.2 },
      ],
    },
    {
      id: "closed",
      when: { type: "time", at: 205 },
      actions: [
        { type: "move", target: "sc-0", to: [-2.4, 0, 8], duration: 0.4 },
        { type: "move", target: "sc-3", to: [2.4, 0, 40], duration: 0.4 },
        { type: "fog", density: 0.06, duration: 4 },
        { type: "sound", sound: "rumble", at: "player", volume: 0.6 },
        { type: "shake", intensity: 0.04, duration: 1.5 },
        { type: "flicker", duration: 1.5 },
        { type: "drone", level: 0.4 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "案山子が、道の両脇にずらりと並んだ。振り返っても、戻れない。",
          duration: 5,
        },
      ],
    },
    {
      id: "bell",
      when: {
        type: "interact",
        target: "gate-bell",
        label: "呼び鈴を押す",
        maxDistance: 2.2,
      },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "bell", at: "player", volume: 0.8 },
        { type: "lights", group: "lamp-a", on: false },
        { type: "flashlight", state: "off" },
        { type: "drone", level: 0 },
        {
          type: "subtitle",
          text: "ピンポン。……門灯が消えた。背後で、藁の擦れる音。",
          duration: 3,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "bell", delay: 3.2 },
      unless: ["scare-timeout"],
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
          title: "案山子の道",
          text: "その田んぼに、案山子は一体も立てられていない。\n毎年、秋の夜道を歩く人の数だけ、増えるだけだ。\n\n翌朝、道の脇に新しい案山子が一体立っていた。見覚えのある服を着ていた。",
        },
      ],
    })),
  ],
};
