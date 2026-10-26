import type { HorrorConfig } from "./kit/types";

/**
 * 「景品はあなた」の演出データ。
 * 深夜のゲームセンター（x=-6〜6, z=0〜14）。入口 z=0 のシャッター(shutter)。
 * 中央の列にクレーンゲーム台が3台（claw-0〜2、x=-3,0,3 / z=7）。3台目 claw-2 の景品ボックスの中に女(inner)が入っている。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "arcade-claw",
  title: "景品はあなた",
  intro: [
    "終電を逃した深夜、24時間営業のゲームセンターに入った。",
    "店員はおらず、騒がしいBGMだけが流れている。",
  ],
  spawn: { position: [0, 1.6, 1.5], lookAt: [0, 1.4, 8] },
  fog: { color: [0.04, 0.02, 0.06], density: 0.014 },
  ambient: { intensity: 0.1, color: [0.9, 0.8, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.55,
    angleDeg: 42,
    range: 11,
    color: [1, 0.97, 0.95],
  },
  walkSpeed: 0.08,
  droneLevel: 0.07,
  triggers: [
    // ---- 0〜1分: ひとりでクレーンゲーム ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "ネオンと電子音。誰もいないフロアで、クレーンゲームだけが明るく光っている。",
        },
        { type: "objective", text: "手前のクレーンゲームで遊ぶ" },
      ],
    },
    {
      id: "play",
      when: {
        type: "interact",
        target: "claw-0",
        label: "プレイする",
        maxDistance: 2.4,
      },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "claw-0" }, volume: 0.6 },
        { type: "sound", sound: "chime", at: { node: "claw-0" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "アームが降りて、ぬいぐるみをつかんで……落とした。惜しい。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "arms-on",
      when: { type: "time", at: 70 },
      actions: [
        { type: "custom", name: "armsOn" },
        { type: "sound", sound: "buzz", at: [0, 1.5, 7], volume: 0.8 },
        { type: "heartbeat", bpm: 74 },
        {
          type: "subtitle",
          text: "誰も操作していないのに、台のアームが一斉に動きだした。",
          duration: 5,
        },
      ],
    },
    {
      id: "screens",
      when: { type: "time", at: 115 },
      actions: [
        { type: "visible", target: "screens-a", visible: false },
        { type: "visible", target: "screens-b", visible: true },
        { type: "sound", sound: "chime", at: [3, 1.5, 7], volume: 0.7 },
        {
          type: "subtitle",
          text: "全部の画面の表示が変わった。「あそんで」「あそんで」「あそんで」",
          duration: 5,
        },
      ],
    },
    {
      id: "outlet",
      when: { type: "time", at: 155 },
      actions: [
        { type: "sound", sound: "thud", at: [3, 0.4, 6.5], volume: 1 },
        { type: "sound", sound: "giggle", at: [3, 0.5, 6.5], volume: 0.5 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "一番奥の台の取り出し口で、ごとん、と何かが落ちた。笑い声が、少しだけ聞こえた。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: シャッターが降りる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "shutter", state: "slam" },
        { type: "door", door: "shutter", state: "lock" },
        { type: "lights", group: "arcade", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "sound", sound: "rumble", at: [0, 2, 0], volume: 0.9 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口のシャッターが降りた。フロアの照明が落ち、台の画面だけが光っている。",
          duration: 5,
        },
      ],
    },
    {
      id: "inner",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "visible", target: "inner", visible: true },
        { type: "sound", sound: "knock", at: [3, 1.2, 6.8], volume: 1 },
        {
          type: "subtitle",
          text: "一番奥の台の景品ボックスの中で、何かが動いた。ガラスを内側から叩いている。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: ボックスの中 ----
    {
      id: "scare-hit",
      when: { type: "look", target: "inner", maxAngleDeg: 22, maxDistance: 14 },
      requires: ["inner"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "inner", visible: false },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "inner", delay: 28 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "inner", visible: false },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "inner", visible: false },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "景品はあなた",
          text: "翌朝、店長がクレーンゲームの景品の補充に行くと、一番奥の台の景品の中に、見覚えのないスマートフォンが一つ紛れ込んでいた。\nロック画面の通知は、百件を超える不在着信だった。",
        },
      ],
    })),
  ],
};
