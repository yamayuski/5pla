import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「しまい忘れた雛」の演出データ。
 * 奥座敷の七段飾り（人形 doll-* とお雛様 ohina、最上段の座布団 hina-seat）、襖 fusuma、
 * 行灯 andon（group andon）、雪洞 group bonbori、非常の赤 group red。最後は等身大の hina-big。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "hina-room",
  title: "しまい忘れた雛",
  intro: [
    "三月も半ばを過ぎた。祖母の家の奥座敷には、まだ雛人形が飾られたままだった。",
    "「しまい遅れると嫁に行き遅れる」。祖母に頼まれ、夜のうちに片付けることにした。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.2, 5] },
  fog: { color: [0.03, 0.02, 0.015], density: 0.03 },
  ambient: { intensity: 0.05, color: [1, 0.85, 0.7] },
  flashlight: {
    enabled: false,
    intensity: 0.45,
    angleDeg: 40,
    range: 8,
    color: [1, 0.95, 0.85],
  },
  walkSpeed: 0.06,
  droneLevel: 0.03,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "雪洞の灯りに、十五の白い顔が並んでいる。",
          duration: 5,
        },
        { type: "objective", text: "行灯を点ける" },
      ],
    },
    {
      id: "andon-on",
      when: { type: "interact", target: "andon", label: "行灯を点ける", maxDistance: 2.4 },
      actions: [
        { type: "lights", group: "andon", on: true },
        { type: "sound", sound: "creak", at: { node: "andon" }, volume: 0.3 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "行灯が点いた。箱は廊下に出してある。上の段から順に片付けよう。",
          duration: 5,
        },
      ],
    },
    {
      id: "andon-auto",
      when: { type: "time", at: 40 },
      unless: ["andon-on"],
      actions: [
        { type: "lights", group: "andon", on: true },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "行灯に、ひとりでに灯が入った。",
          duration: 4,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "turn-away",
      when: { type: "time", at: 75 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "custom", name: "dollsTurnAway" },
        {
          type: "subtitle",
          text: "灯りが揺れたあと、人形がみんな、壁の方を向いていた。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "ohina-gone",
      when: { type: "time", at: 120 },
      actions: [
        { type: "visible", target: "ohina", visible: false },
        { type: "sound", sound: "step", at: [1.5, 0.1, 3], volume: 0.5 },
        { type: "sound", sound: "step", at: [1.8, 0.1, 2], volume: 0.4 },
        {
          type: "subtitle",
          text: "最上段の右が空いている。お雛様がいない。畳の上を、小さな足音が遠ざかった。",
          duration: 6,
        },
        { type: "drone", level: 0.1 },
      ],
    },
    {
      id: "face",
      when: { type: "time", at: 165 },
      actions: [
        { type: "custom", name: "dollsFace" },
        { type: "sound", sound: "giggle", at: "behind", volume: 0.5 },
        {
          type: "subtitle",
          text: "かたかたかた。人形が一斉にこちらを向いた。背後で、くすくすと笑う声。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 90 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "fusuma", state: "slam" },
        { type: "door", door: "fusuma", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1, 0], volume: 0.8 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        {
          type: "subtitle",
          text: "ぴしゃり。襖が閉まった。引いても、外から押さえられているように動かない。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "andon", on: false },
        { type: "lights", group: "bonbori", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "on" },
        { type: "fog", density: 0.05, duration: 4 },
        { type: "sound", sound: "whisper", at: { node: "hina-seat" }, volume: 0.6 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "灯りが消えた。最上段の空いた座布団の方から、か細い声。「……しまわないで……」",
          duration: 6,
        },
        { type: "objective", text: "空いた座布団を確かめる" },
      ],
    },
    {
      id: "seat",
      when: { type: "interact", target: "hina-seat", label: "座布団に触れる", maxDistance: 2.8 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "hina-big", visible: true },
        { type: "face", target: "hina-big" },
        { type: "sound", sound: "creak", at: { node: "hina-big" }, volume: 0.7 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "座布団はまだ温かい。……部屋の隅で、衣擦れの音がした。",
          duration: 6,
        },
      ],
    },
    {
      id: "seat-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["seat", ...SCARES],
      actions: [
        { type: "visible", target: "hina-big", visible: true },
        { type: "face", target: "hina-big" },
        { type: "sound", sound: "creak", at: { node: "hina-big" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "部屋の隅で、重たい衣擦れの音がした。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "hina-big", maxAngleDeg: 22, maxDistance: 12 },
      requiresAny: ["seat", "seat-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "hina-big" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "hina-big" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "しまい忘れた雛",
          text: "翌朝、祖母は閉めきった奥座敷の襖を開けた。雛人形はすべて箱に収まっていた。\n最上段の座布団には、お雛様の代わりに、見慣れた顔の人形が一つ座っていた。",
        },
      ],
    })),
  ],
};
