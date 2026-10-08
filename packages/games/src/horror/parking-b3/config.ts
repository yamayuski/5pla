import type { HorrorConfig } from "./kit/types";

/**
 * 「地下三階」の演出データ。
 * 駐車場 x=-12〜12, z=-15〜15。南壁中央にエレベーター（スポーン地点の背後）、
 * 北西 x=-8 に出口ゲート、北東 x=10, z=10.5 が自分の区画 B3-44。
 */
const SCARES = ["strobe", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "parking-b3",
  title: "地下三階",
  intro: [
    "残業を終えて、ビルの地下三階の駐車場へ降りてきた。",
    "車は奥の B3-44。あとは帰るだけだ。",
  ],
  spawn: { position: [0, 1.6, -12.5], lookAt: [0, 1.5, 0] },
  fog: { color: [0.05, 0.05, 0.05], density: 0.035 },
  ambient: { intensity: 0.05, color: [0.8, 0.9, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.9,
    angleDeg: 40,
    range: 14,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.09,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: いつもの帰り道 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "蛍光灯のうなりだけが響いている。もう誰も残っていない。",
        },
        { type: "objective", text: "北東の区画 B3-44 の車へ" },
        { type: "sound", sound: "buzz", at: [0, 2.8, 4], volume: 0.3 },
      ],
    },
    {
      id: "empty-spot",
      when: { type: "zone", center: [8, 1.6, 9.5], radius: 2.8 },
      unless: ["lock"],
      actions: [
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "……ない。B3-44 に、車がない。確かにここに停めたのに。",
          duration: 5,
        },
        { type: "objective", text: "駐車場を探して回る" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "row-out",
      when: { type: "time", at: 65 },
      actions: [
        { type: "lights", group: "row-w", on: false },
        { type: "sound", sound: "buzz", at: [-8, 2.8, -2], volume: 0.8 },
        { type: "sound", sound: "thud", at: [-8, 2.8, -2], volume: 0.4 },
        {
          type: "subtitle",
          text: "西側の蛍光灯が、ばちん、と音を立てて消えた。",
          duration: 4,
        },
      ],
    },
    {
      id: "steps",
      when: { type: "time", at: 100 },
      actions: [
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        {
          type: "subtitle",
          text: "コンクリートに響く、自分のものではない靴音。止まると、止まる。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 84 },
      ],
    },
    {
      id: "alarm",
      when: { type: "time", at: 138 },
      actions: [
        { type: "sound", sound: "buzz", at: [-10, 1, 4.5], volume: 1 },
        { type: "sound", sound: "rattle", at: [-10, 1, 4.5], volume: 0.8 },
        { type: "flicker", duration: 0.8 },
        {
          type: "subtitle",
          text: "赤い車の防犯ブザーが鳴り、すぐに止んだ。誰も触っていない。",
          duration: 4,
        },
      ],
    },
    {
      id: "elevator",
      when: { type: "time", at: 170 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 2, -15] },
        { type: "door", door: "elevator-door", state: "open" },
        {
          type: "subtitle",
          text: "チン。誰も呼んでいないエレベーターが、B3 で口を開けた。中は空っぽだ。",
          duration: 5,
        },
        { type: "drone", level: 0.2 },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "custom", name: "shutterDown" },
        { type: "sound", sound: "rumble", at: [-8, 2, 15], volume: 1 },
        { type: "sound", sound: "slam", at: [-8, 2, 15], volume: 0.8 },
        { type: "door", door: "elevator-door", state: "slam" },
        { type: "door", door: "elevator-door", state: "lock" },
        { type: "lights", group: "row-c", on: false },
        { type: "lights", group: "row-e", on: false },
        { type: "lights", group: "lobby", on: false },
        { type: "flicker", duration: 1.2 },
        { type: "flashlight", state: "dim" },
        { type: "drone", level: 0.45 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "出口のシャッターが下りた。エレベーターも閉じた。照明が、全部落ちた。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "hazard",
      when: { type: "after", trigger: "lock", delay: 7 },
      actions: [
        { type: "custom", name: "carAppear" },
        { type: "sound", sound: "chime", at: [10, 1, 10.5], volume: 0.6 },
        {
          type: "subtitle",
          text: "北東の奥で、オレンジのハザードが点滅している。……B3-44。自分の車だ。",
          duration: 5,
        },
        { type: "objective", text: "車へ" },
      ],
    },
    // ---- 4〜5分: 点滅の中を ----
    {
      id: "strobe",
      when: { type: "zone", center: [6.8, 1.6, 9], radius: 2.6 },
      requires: ["hazard"],
      unless: SCARES,
      actions: [
        { type: "flashlight", state: "off" },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 0 },
        { type: "visible", target: "woman", visible: true },
        { type: "face", target: "woman" },
        {
          type: "subtitle",
          text: "ライトが消えた。点滅のたびに、車の向こうに……",
          duration: 3,
        },
      ],
    },
    {
      id: "strobe-2",
      when: { type: "after", trigger: "strobe", delay: 1.3 },
      actions: [
        { type: "move", target: "woman", to: [10.5, 0, 12.6], duration: 0.05 },
        { type: "face", target: "woman" },
        { type: "sound", sound: "step", at: { node: "woman" }, volume: 0.7 },
      ],
    },
    {
      id: "strobe-3",
      when: { type: "after", trigger: "strobe", delay: 2.2 },
      actions: [
        { type: "move", target: "woman", to: [8.6, 0, 11.6], duration: 0.05 },
        { type: "face", target: "woman" },
        { type: "sound", sound: "step", at: { node: "woman" }, volume: 0.9 },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "strobe", delay: 3.1 },
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    ...["scare-hit", "scare-timeout"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "地下三階",
          text: "翌朝、B3-44 の白いセダンは、エンジンがかかったまま見つかった。\n運転席は空で、後部座席にだけ、長い髪が残っていた。\n\nこのビルの地下は、二階までしかない。",
        },
      ],
    })),
  ],
};
