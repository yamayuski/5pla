import type { HorrorConfig } from "./kit/types";

/**
 * 「理科室の標本」の演出データ。
 * 理科室 x=-5〜5, z=0〜14。ノートは z=9 の実験台、標本棚は東壁。最後は棚の大きな標本瓶(big-jar)。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "science-lab",
  title: "理科室の標本",
  intro: [
    "夜の校舎。忘れ物のノートを取りに、理科室へ入った。",
    "標本棚の瓶が、月明かりで緑に光っている。",
  ],
  spawn: { position: [-3.5, 1.6, 1.2], lookAt: [-1, 1.4, 9] },
  fog: { color: [0.04, 0.06, 0.05], density: 0.018 },
  ambient: { intensity: 0.09, color: [0.8, 1, 0.9] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 40,
    range: 12,
    color: [0.95, 1, 0.95],
  },
  walkSpeed: 0.085,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "薬品のにおい。奥の実験台に、自分のノートが置いてある。",
        },
        { type: "objective", text: "奥の実験台のノートを取る" },
      ],
    },
    {
      id: "notebook",
      when: {
        type: "interact",
        target: "notebook",
        label: "ノートを取る",
        maxDistance: 2.6,
      },
      actions: [
        {
          type: "sound",
          sound: "rattle",
          at: { node: "notebook" },
          volume: 0.5,
        },
        {
          type: "subtitle",
          text: "ノートの最後のページに、書いた覚えのない字。「出席番号 0番　まだ、帰ってない」",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "skeleton-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "skeleton", visible: true },
        { type: "sound", sound: "rattle", at: [-4.2, 1, 12.8], volume: 0.8 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "カタカタ、と骨の鳴る音。奥の隅の人体骨格が、顎を小さく動かしている。",
          duration: 6,
        },
      ],
    },
    {
      id: "eyes",
      when: { type: "time", at: 110 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "visible", target: "jar-eye-0", visible: false },
        { type: "visible", target: "jar-open-0", visible: true },
        { type: "visible", target: "jar-eye-1", visible: false },
        { type: "visible", target: "jar-open-1", visible: true },
        { type: "sound", sound: "whisper", at: [4, 1.5, 4.5], volume: 0.5 },
        {
          type: "subtitle",
          text: "標本瓶の目が、ぱちりと開いた。瓶の中の何かが、こちらを見ている。",
          duration: 6,
        },
      ],
    },
    {
      id: "flame",
      when: { type: "time", at: 150 },
      actions: [
        { type: "lights", group: "flame", on: true },
        { type: "sound", sound: "static", at: [2, 1, 4.5], volume: 0.5 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "誰も触っていないガスバーナーが、青い炎をあげた。",
          duration: 5,
        },
      ],
    },
    {
      id: "skeleton-2",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "move", target: "skeleton", to: [-2.6, 0, 11.5], duration: 4 },
        {
          type: "sound",
          sound: "rattle",
          at: { node: "skeleton" },
          volume: 0.8,
        },
        {
          type: "subtitle",
          text: "照明が瞬くと、骨格が台から降りて、教卓の前まで来ている。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "lab-door", state: "slam" },
        { type: "door", door: "lab-door", state: "lock" },
        { type: "lights", group: "lab", on: false },
        { type: "lights", group: "flame", on: false },
        { type: "visible", target: "skeleton", visible: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "出入口の扉が閉まった。照明が消え、骨格の姿もない。棚の大きな瓶の中で、何かが動いた。",
          duration: 7,
        },
        { type: "objective", text: "棚の大きな標本瓶を確かめる" },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "interact",
        target: "big-jar",
        label: "瓶をのぞく",
        maxDistance: 3,
      },
      requires: ["lock"],
      unless: SCARES,
      actions: [
        { type: "sound", sound: "thud", at: { node: "big-jar" }, volume: 1 },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "lock", delay: 55 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "thud", at: { node: "big-jar" }, volume: 1 },
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
          title: "理科室の標本",
          text: "翌朝、理科の教師は、標本棚の大きな瓶が割れて、液体が床に広がっているのを見つけた。\n瓶のラベルには「出席番号 0番」とだけあり、中身は何だったのか、誰も覚えていない。\n\n濡れた足跡は、廊下の奥へ続いていたという。",
        },
      ],
    })),
  ],
};
