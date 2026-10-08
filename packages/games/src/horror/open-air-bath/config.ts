import type { HorrorConfig } from "./kit/types";

/**
 * 「貸切露天風呂」の演出データ。
 * デッキ z=0〜8、湯船 z=8〜16（入れない）。湯の中の頭 head-1〜3 が少しずつ縁へ寄ってくる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "open-air-bath",
  title: "貸切露天風呂",
  intro: [
    "山の宿の貸切露天風呂。今夜は、ほかに客はいないはずだと言われた。",
    "湯気の向こうの湯船は、静かに揺れている。",
  ],
  spawn: { position: [0, 1.6, 1.5], lookAt: [0, 1.0, 12] },
  fog: { color: [0.18, 0.2, 0.24], density: 0.035 },
  ambient: { intensity: 0.12, color: [0.85, 0.9, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.4,
    angleDeg: 40,
    range: 11,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.08,
  droneLevel: 0.07,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "湯気と硫黄のにおい。月が、湯面に細く映っている。",
        },
        { type: "objective", text: "湯船の縁で、湯加減を見る" },
      ],
    },
    {
      id: "edge",
      when: {
        type: "interact",
        target: "bath-edge",
        label: "湯に手を入れる",
        maxDistance: 3,
      },
      actions: [
        { type: "sound", sound: "drip", at: "player", volume: 0.6 },
        {
          type: "subtitle",
          text: "湯は、ぬるい。指先に、細い髪の毛が一本、絡みついた。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "head-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "head-1", visible: true },
        { type: "sound", sound: "drip", at: [-2.5, 0, 15], volume: 0.7 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "湯船の奥に、黒いものが浮かんでいる。人の頭だ。こちらに背を向けて、静かに湯に浸かっている。",
          duration: 6,
        },
      ],
    },
    {
      id: "head-2",
      when: { type: "time", at: 115 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "visible", target: "head-2", visible: true },
        { type: "sound", sound: "whisper", at: [2.6, 0.3, 13.2], volume: 0.5 },
        {
          type: "subtitle",
          text: "右手にも、もう一つ頭が浮かんでいる。さっきまでは、確かにいなかった。",
          duration: 6,
        },
      ],
    },
    {
      id: "move-1",
      when: { type: "time", at: 155 },
      actions: [
        {
          type: "move",
          target: "head-1",
          to: [-1.5, 0.12, 11.5],
          duration: 10,
        },
        { type: "sound", sound: "drip", at: { node: "head-1" }, volume: 0.8 },
        { type: "drone", level: 0.22 },
        {
          type: "subtitle",
          text: "奥の頭が、湯面を滑るように近づいてくる。波は、立たない。",
          duration: 5,
        },
      ],
    },
    {
      id: "move-2",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "move", target: "head-2", to: [1.5, 0.12, 10.5], duration: 5 },
        { type: "face", target: "head-1" },
        { type: "face", target: "head-2" },
        {
          type: "subtitle",
          text: "明滅のあと、二つの頭がこちらを向いていた。濡れた髪の間から、目だけが覗いている。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "bath-door", state: "slam" },
        { type: "door", door: "bath-door", state: "lock" },
        { type: "lights", group: "lantern", on: false },
        { type: "fog", density: 0.06, duration: 5 },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "脱衣所の戸が閉まった。灯籠が全部消え、湯気だけが白く浮かんでいる。",
          duration: 6,
        },
      ],
    },
    {
      id: "sink",
      when: { type: "after", trigger: "lock", delay: 7 },
      actions: [
        { type: "visible", target: "head-1", visible: false },
        { type: "visible", target: "head-2", visible: false },
        { type: "visible", target: "head-3", visible: true },
        { type: "face", target: "head-3" },
        { type: "move", target: "head-3", to: [0, 0.12, 8.6], duration: 5 },
        { type: "sound", sound: "drip", at: { node: "head-3" }, volume: 0.9 },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "二つの頭が、音もなく沈んだ。かわりに、すぐ目の前の縁に、三つ目の頭が浮かんでいる。",
          duration: 6,
        },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "head-3",
        maxAngleDeg: 35,
        maxDistance: 10,
      },
      requires: ["sink"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "sink", delay: 12 },
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
          title: "貸切露天風呂",
          text: "翌朝、女将が貸切風呂を掃除に行くと、湯船の縁に、濡れた髪の束が山のように溜まっていた。\n宿帳に、昨夜の利用客は「おひとり様」とだけ書かれている。\n\n脱衣所の脱衣籠には、服が三人分、きれいにたたまれて並んでいたという。",
        },
      ],
    })),
  ],
};
