import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「布をめくらないで」の演出データ。
 * 東西のショーケースの動物 pet-*（フック petsStare / petsHide）、北壁の大型ケージと布 cloth・札 cage-tag、
 * エサ棚 food、店の入口 shop-door、照明 group shop / cases / red。最後は大型ケージの中の crouch。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "pet-shop",
  title: "布をめくらないで",
  intro: [
    "モールのペットショップでアルバイトを始めて一週間。今夜は初めての閉店作業。",
    "店長のメモ：「ごはんを配って消灯。奥の大型ケージの布は、絶対にめくらないこと」",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [0, 1.0, 6] },
  fog: { color: [0.02, 0.02, 0.025], density: 0.02 },
  ambient: { intensity: 0.08, color: [0.9, 0.9, 1] },
  flashlight: {
    enabled: false,
    intensity: 0.45,
    angleDeg: 42,
    range: 9,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.07,
  droneLevel: 0.03,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "閉店後のモールは静かだ。ケースの中で、子犬たちが小さく身じろぎしている。",
          duration: 5,
        },
        { type: "objective", text: "エサ棚からごはんを配る" },
      ],
    },
    {
      id: "feed",
      when: { type: "interact", target: "food", label: "ごはんを配る", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "rattle", at: { node: "food" }, volume: 0.4 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ケースを一つずつ開けて、ごはんを入れていく。",
          duration: 4,
        },
      ],
    },
    {
      id: "feed-auto",
      when: { type: "time", at: 45 },
      unless: ["feed"],
      actions: [
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ごはんを配り終えた。あとは消灯して帰るだけ。",
          duration: 4,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "stare",
      when: { type: "time", at: 75 },
      actions: [
        { type: "custom", name: "petsStare" },
        { type: "drone", level: 0 },
        {
          type: "subtitle",
          text: "急に静かになった。動物たちが一斉に、奥の布を掛けたケージを見つめて固まっている。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 72 },
      ],
    },
    {
      id: "scratch",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "rattle", at: { node: "cloth" }, volume: 0.7 },
        { type: "sound", sound: "breath", at: { node: "cloth" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "布の下から、ケージの格子を引っかく音。……大型犬は、入っていないはずだ。",
          duration: 6,
        },
        { type: "drone", level: 0.1 },
      ],
    },
    {
      id: "hide",
      when: { type: "time", at: 160 },
      actions: [
        { type: "custom", name: "petsHide" },
        { type: "lights", group: "cases", on: false },
        { type: "sound", sound: "whisper", at: { node: "cloth" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "動物たちがケースの奥に縮こまり、背中を向けた。布の下から、人の声。「……あけて……」",
          duration: 6,
        },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "shop-door", state: "slam" },
        { type: "door", door: "shop-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.8 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        {
          type: "subtitle",
          text: "店の入口のガラス戸が閉まり、モールの防犯シャッターの下りる音が遠くで響いた。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "shop", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "on" },
        { type: "sound", sound: "knock", at: { node: "cloth" }, volume: 0.8 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "照明が落ちた。暗闇の奥で、ケージが内側から叩かれている。",
          duration: 6,
        },
        { type: "objective", text: "布をめくって確かめる" },
      ],
    },
    {
      id: "lift",
      when: { type: "interact", target: "cloth", label: "布をめくる", maxDistance: 2.4 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "cloth", visible: false },
        { type: "visible", target: "crouch", visible: true },
        { type: "face", target: "crouch" },
        { type: "sound", sound: "breath", at: { node: "crouch" }, volume: 0.9 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ケージの中に、膝を抱えた人がうずくまっている。首輪をつけて。",
          duration: 6,
        },
      ],
    },
    {
      id: "lift-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["lift", ...SCARES],
      actions: [
        { type: "visible", target: "cloth", visible: false },
        { type: "visible", target: "crouch", visible: true },
        { type: "face", target: "crouch" },
        { type: "sound", sound: "slam", at: { node: "crouch" }, volume: 0.6 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "布が、内側から引きずり落とされた。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "crouch", maxAngleDeg: 22, maxDistance: 12 },
      requiresAny: ["lift", "lift-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "crouch" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "crouch" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "布をめくらないで",
          text: "翌朝、店長は大型ケージに新しい布を掛け直した。\n札の「大型犬用」の下に、昨日のアルバイトの名前を書き足して。",
        },
      ],
    })),
  ],
};
