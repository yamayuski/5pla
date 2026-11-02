import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「空きカプセル」の演出データ。
 * 就寝フロア：自分のカプセル pod-me、他の客のカーテン curtain-<列>-<lo|hi>（フック curtainSway で3列目下段が内側から揺れる）、
 * 出入口 shutter、自販機 vending、スリッパ slippers、通路の奥に立つ客 guest。最後に出るのは pod-face（自分のカプセルの中）。
 */
const SCARES = ["scare-hit", "scare-auto", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "capsule-hotel",
  title: "空きカプセル",
  intro: [
    "終電を逃し、駅前のカプセルホテルに泊まることにした。",
    "フロントで渡された鍵の番号は101。通路の一番手前、下段のカプセルだ。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.4, 10] },
  fog: { color: [0.03, 0.03, 0.03], density: 0.02 },
  ambient: { intensity: 0.12, color: [1, 0.95, 0.85] },
  flashlight: {
    enabled: true,
    intensity: 0.45,
    angleDeg: 40,
    range: 10,
    color: [1, 0.97, 0.9],
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
          text: "消灯後の就寝フロア。カーテンの向こうから寝息やいびきが聞こえる。",
          duration: 5,
        },
        { type: "objective", text: "通路のスリッパを揃える" },
      ],
    },
    {
      id: "slippers",
      when: { type: "interact", target: "slippers", label: "スリッパを揃える", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "rattle", at: { node: "slippers" }, volume: 0.3 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "誰かの脱ぎ散らかしたスリッパを揃えた。さて、寝よう。", duration: 4 },
      ],
    },
    {
      id: "slippers-auto",
      when: { type: "time", at: 40 },
      unless: ["slippers"],
      actions: [{ type: "objective", text: "" }],
    },
    // ---- 小さな異変 ----
    {
      id: "sway",
      when: { type: "time", at: 75 },
      actions: [
        { type: "custom", name: "curtainSway" },
        { type: "sound", sound: "whisper", at: [1.0, 1.0, 6.3], volume: 0.5 },
        {
          type: "subtitle",
          text: "103のカーテンが内側から揺れている。さっきまで聞こえていたいびきが、止まった。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "open-upper",
      when: { type: "time", at: 120 },
      actions: [
        { type: "custom", name: "curtainStop" },
        { type: "visible", target: "curtain-1-hi", visible: false },
        { type: "sound", sound: "rattle", at: [1.0, 1.9, 3.9], volume: 0.7 },
        {
          type: "subtitle",
          text: "202のカーテンがひとりでに開いた。中は、空っぽだ。布団が、まだ温かそうに丸く凹んでいる。",
          duration: 6,
        },
        { type: "drone", level: 0.15 },
      ],
    },
    {
      id: "guest-far",
      when: { type: "time", at: 165 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "visible", target: "guest", visible: true },
        { type: "sound", sound: "step", at: [0, 0, 11.5], volume: 0.5 },
        {
          type: "subtitle",
          text: "照明が瞬いた。通路の奥に、浴衣の客が立っている。……こちらを向いて。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    {
      id: "guest-gone",
      when: { type: "after", trigger: "guest-far", delay: 3 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "visible", target: "guest", visible: false },
        { type: "sound", sound: "drip", at: "behind", volume: 0.5 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "shutter",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "shutter", state: "slam" },
        { type: "door", door: "shutter", state: "lock" },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        {
          type: "subtitle",
          text: "出口のシャッターが、轟音とともに閉まった。「朝まで、開きません」と貼り紙にある。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "shutter", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "hall", on: false },
        { type: "flashlight", state: "dim" },
        { type: "fog", density: 0.05, duration: 4 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "フロアが真っ暗になった。ここにいるのは危ない。自分のカプセルなら、カーテンを閉められる。",
          duration: 6,
        },
        { type: "objective", text: "101に戻って、カーテンを閉める" },
      ],
    },
    {
      id: "crawl",
      when: { type: "after", trigger: "blackout", delay: 15 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "step", at: "behind", volume: 0.7 },
        { type: "sound", sound: "breath", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 120 },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "interact", target: "pod-me", label: "カーテンを閉める", maxDistance: 2.2 },
      requires: ["blackout"],
      unless: SCARES.filter((s) => s !== "scare-hit"),
      actions: [
        { type: "sound", sound: "rattle", at: "player", volume: 0.5 },
        { type: "objective", text: "" },
        { type: "jumpscare", figure: "pod-face" },
      ],
    },
    {
      id: "scare-auto",
      when: { type: "after", trigger: "blackout", delay: 40 },
      unless: SCARES.filter((s) => s !== "scare-auto"),
      actions: [{ type: "objective", text: "" }, { type: "jumpscare", figure: "pod-face" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES.filter((s) => s !== "scare-timeout"),
      actions: [{ type: "jumpscare", figure: "pod-face" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "空きカプセル",
          text: "翌朝、フロントは言った。「101号室は、昨夜から誰も泊まっていませんが」\n布団は、人の形に凹んだまま温かかったという。",
        },
      ],
    })),
  ],
};
