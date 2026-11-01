import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「うしろの正面」の演出データ。
 * 竹林の小径、広場の地蔵 jizo（灯り group lantern）、手まり temari、倒れて道を塞ぐ竹 fallen-s / fallen-n、
 * 子どもの輪 ring（正面役 ring-child-0、フック ringForm / ringStop）、月明かり group moon。最後は背後の ghost。
 */
const SCARES = ["scare-hit", "scare-late", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "bamboo-kagome",
  title: "うしろの正面",
  intro: [
    "夏祭りの帰り道。近道をしようと、裏山の竹林の小径に入った。",
    "祖母がよく言っていた。「あの竹林で、子どもの歌が聞こえても振り向いちゃいけないよ」",
  ],
  spawn: { position: [0, 1.6, 1.8], lookAt: [0, 1.4, 10] },
  fog: { color: [0.015, 0.02, 0.02], density: 0.06 },
  ambient: { intensity: 0.05, color: [0.6, 0.7, 0.9] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 40,
    range: 11,
    color: [1, 0.96, 0.88],
  },
  walkSpeed: 0.07,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "笹の葉が風に鳴っている。小径の先、竹林の中ほどに小さな灯りが見える。",
          duration: 5,
        },
        { type: "objective", text: "広場のお地蔵さんに手を合わせる" },
      ],
    },
    {
      id: "pray",
      when: { type: "interact", target: "jizo", label: "手を合わせる", maxDistance: 2.2 },
      actions: [
        { type: "sound", sound: "bell", at: { node: "jizo" }, volume: 0.4 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "赤いよだれかけのお地蔵さん。足元に、小さな草履が六足並べてある。",
          duration: 5,
        },
      ],
    },
    {
      id: "pray-auto",
      when: { type: "time", at: 50 },
      unless: ["pray"],
      actions: [
        { type: "sound", sound: "bell", at: { node: "jizo" }, volume: 0.4 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "どこかで、ちりん、と鈴が鳴った。",
          duration: 4,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "laugh",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "giggle", at: [-4, 1, 6], volume: 0.6 },
        { type: "drone", level: 0 },
        {
          type: "subtitle",
          text: "風が止んだ。竹林の奥で、子どもの笑い声。こんな時間に。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "temari",
      when: { type: "time", at: 120 },
      actions: [
        { type: "visible", target: "temari", visible: true },
        { type: "move", target: "temari", to: [0, 0.09, 11.5], duration: 4 },
        { type: "sound", sound: "step", at: [-3, 0.1, 13], volume: 0.4 },
        {
          type: "subtitle",
          text: "竹の間から、手まりが転がってきた。小径の真ん中で、ぴたりと止まる。",
          duration: 6,
        },
        { type: "drone", level: 0.1 },
      ],
    },
    {
      id: "song",
      when: { type: "time", at: 160 },
      actions: [
        { type: "sound", sound: "whisper", at: [-3, 1, 10], volume: 0.5 },
        { type: "sound", sound: "whisper", at: [3, 1, 12], volume: 0.5 },
        {
          type: "subtitle",
          text: "四方から、歌が聞こえる。「かごめ　かごめ　かごのなかのとりは……」",
          duration: 6,
        },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "fall",
      when: { type: "time", at: 205 },
      actions: [
        { type: "visible", target: "fallen-s", visible: true },
        { type: "visible", target: "fallen-n", visible: true },
        { type: "sound", sound: "slam", at: [0, 1, 1.2], volume: 0.8 },
        { type: "sound", sound: "slam", at: [0, 1, 18.8], volume: 0.8 },
        { type: "shake", intensity: 0.03, duration: 0.8 },
        {
          type: "subtitle",
          text: "めきめきと音を立てて、小径の入口と出口に竹が倒れた。どちらへも抜けられない。",
          duration: 6,
        },
      ],
    },
    {
      id: "ring",
      when: { type: "after", trigger: "fall", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "lights", group: "lantern", on: false },
        { type: "flashlight", state: "dim" },
        { type: "custom", name: "ringForm" },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 110 },
        {
          type: "subtitle",
          text: "灯りが消えた。気がつくと、着物の子どもたちが手をつないで、自分の周りを回っている。",
          duration: 6,
        },
        { type: "objective", text: "動かずに、歌が終わるのを待つ" },
      ],
    },
    {
      id: "verse",
      when: { type: "after", trigger: "ring", delay: 8 },
      actions: [
        {
          type: "subtitle",
          text: "「よあけのばんに　つるとかめがすべった……」",
          duration: 6,
        },
        { type: "sound", sound: "whisper", at: "player", volume: 0.6 },
      ],
    },
    {
      id: "stop",
      when: { type: "after", trigger: "ring", delay: 18 },
      actions: [
        { type: "custom", name: "ringStop" },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "輪が止まった。正面の子が、にいっと笑う。「……うしろの正面、だあれ」",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア：振り向いた瞬間（振り向かなくても8秒後に背後から） ----
    {
      id: "scare-hit",
      when: { type: "lookAway", target: "ring-child-0", minAngleDeg: 100 },
      requires: ["stop"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "ring", visible: false },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-late",
      when: { type: "after", trigger: "stop", delay: 8 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "breath", at: "behind", volume: 0.9 },
        { type: "visible", target: "ring", visible: false },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "ring", visible: false },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "うしろの正面",
          text: "翌朝、竹林の地蔵の前で、祭りの帰りの子が一人見つかった。眠ったまま、何も覚えていなかった。\n地蔵の足元の草履は、七足に増えていた。",
        },
      ],
    })),
  ],
};
