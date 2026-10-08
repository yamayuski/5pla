import type { HorrorConfig } from "./kit/types";

/**
 * 「かかしの道」の演出データ。
 * 田んぼ道は x=-2.5〜2.5, z=0〜50（北の奥 z≈48 に農家の灯り）。道の両脇の田んぼにかかし sc-0〜9（左 sc-0〜4 / 右 sc-5〜9）が背を向けて立つ。
 * 異変のたびに、かかしが「こちらを向く」。最後は道の真ん中に立つ blocker が、近づいてくる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];
const turn = (ids: number[]) =>
  ids.map((i) => ({ type: "face" as const, target: `sc-${i}` }));

export const config: HorrorConfig = {
  slug: "scarecrow-road",
  title: "かかしの道",
  intro: [
    "実家に帰る夜道。バス停から家までは、田んぼに挟まれた一本道を二十分歩く。",
    "道の両脇には、秋祭りのかかしが並んでいる。",
  ],
  spawn: { position: [0, 1.6, 1], lookAt: [0, 1.5, 30] },
  fog: { color: [0.03, 0.035, 0.05], density: 0.024 },
  ambient: { intensity: 0.07, color: [0.75, 0.82, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.6,
    angleDeg: 40,
    range: 15,
    color: [0.95, 0.98, 1],
  },
  walkSpeed: 0.085,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 田んぼ道 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "蛙の声と、風に鳴る稲穂。道の両脇に、麦わら帽子のかかしが点々と立っている。みんな、田んぼのほうを向いて。",
        },
        { type: "objective", text: "奥の農家の灯りまで歩く" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "turn-1",
      when: { type: "time", at: 70 },
      actions: [
        ...turn([0, 1, 5, 6]),
        { type: "sound", sound: "rattle", at: "behind", volume: 0.6 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "手前の四体のかかしが、さっきと逆の向きに立っている。……道のほうを向いている。",
          duration: 5,
        },
      ],
    },
    {
      id: "crow",
      when: { type: "time", at: 110 },
      actions: [
        { type: "sound", sound: "whisper", at: [-4.5, 1.4, 20], volume: 0.7 },
        { type: "sound", sound: "rattle", at: [4.5, 1.4, 20], volume: 0.5 },
        {
          type: "subtitle",
          text: "田んぼの奥から、かさかさと藁の擦れる音と、囁き声。蛙の声が、ぴたりと止んでいる。",
          duration: 5,
        },
      ],
    },
    {
      id: "turn-2",
      when: { type: "time", at: 145 },
      actions: [
        ...turn([2, 3, 7, 8]),
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "中ほどのかかしも向きが変わった。振り返るたびに、全員がこちらを見ている。",
          duration: 5,
        },
      ],
    },
    {
      id: "blocker",
      when: { type: "time", at: 180 },
      actions: [
        { type: "visible", target: "blocker", visible: true },
        { type: "sound", sound: "creak", at: [0, 1, 36], volume: 0.8 },
        {
          type: "subtitle",
          text: "遠く、道の真ん中にかかしが一体立っている。さっきまで、あんなところには無かった。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 灯りが消える ----
    {
      id: "dark",
      when: { type: "time", at: 205 },
      actions: [
        { type: "lights", group: "farm", on: false },
        ...turn([4, 9]),
        { type: "flashlight", state: "dim" },
        { type: "fog", density: 0.045, duration: 4 },
        { type: "flicker", duration: 1.3 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "奥の農家の灯りが消えた。田んぼの闇の中で、全員のかかしがこちらに顔を向けている。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "approach",
      when: { type: "after", trigger: "dark", delay: 5 },
      actions: [
        { type: "move", target: "blocker", to: [0, 0, 14], duration: 34 },
        { type: "sound", sound: "footsteps", at: [0, 0, 36], volume: 0.8 },
        {
          type: "subtitle",
          text: "道の真ん中のかかしが、棒の足で、一歩ずつ近づいてくる。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: 目の前に ----
    {
      id: "near",
      when: { type: "after", trigger: "approach", delay: 30 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "breath", at: "behind", volume: 0.9 },
        { type: "heartbeat", bpm: 135 },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "blocker",
        maxAngleDeg: 24,
        maxDistance: 14,
      },
      requires: ["near"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "blocker" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "near", delay: 8 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "blocker" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "blocker" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "かかしの道",
          text: "翌朝、田んぼ道に並ぶかかしは、十体のはずが十一体になっていた。\n一体だけ、麦わら帽子の下に、本物の人間の髪が生えていたという。\n\n実家の玄関の鍵は、内側から開いていた。",
        },
      ],
    })),
  ],
};
