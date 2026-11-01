import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「宛先不明」の演出データ。
 * 作業台の郵便物 tray と小包 parcel（＋ラベル parcel-label）、区分棚 shelf-a/b と宛名ラベル labels-a/b、
 * 夜間投函口 slot と落ちた封筒 dropped-letter、窓口の呼び鈴 counter-bell、通用口 staff-door、
 * 照明 group office / 非常口の緑 red。最後は区分棚の奥の mailman。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "post-office",
  title: "宛先不明",
  intro: [
    "町の小さな郵便局。今夜は一人で、明日の朝便の区分を片付ける。",
    "窓口のシャッターは下ろした。通用口の鍵は、帰るときに閉めればいい。",
  ],
  spawn: { position: [0, 1.6, 2.6], lookAt: [0, 1, 4.5] },
  fog: { color: [0.02, 0.02, 0.02], density: 0.02 },
  ambient: { intensity: 0.07, color: [0.85, 0.9, 1] },
  flashlight: {
    enabled: false,
    intensity: 0.5,
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
          text: "蛍光灯の音と、壁時計の秒針。区分棚の通路の奥は、灯りが届かない。",
          duration: 5,
        },
        { type: "objective", text: "作業台の郵便物を区分する" },
      ],
    },
    {
      id: "sort",
      when: { type: "interact", target: "tray", label: "郵便物を区分する", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "rattle", at: { node: "tray" }, volume: 0.3 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "宛名を見て、棚に振り分けていく。いつもの夜だ。",
          duration: 4,
        },
      ],
    },
    {
      id: "sort-auto",
      when: { type: "time", at: 45 },
      unless: ["sort"],
      actions: [
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "気がつくと、箱の郵便物はほとんど片付いていた。",
          duration: 4,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "slot",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "thud", at: { node: "slot" }, volume: 0.6 },
        { type: "visible", target: "dropped-letter", visible: true },
        {
          type: "subtitle",
          text: "夜間投函口に、ことりと封筒が落ちた。宛名は自分。消印は、明日の日付。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "bell",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "bell", at: { node: "counter-bell" }, volume: 0.7 },
        {
          type: "subtitle",
          text: "チン。シャッターを下ろした窓口の呼び鈴が鳴った。",
          duration: 5,
        },
        { type: "drone", level: 0.1 },
      ],
    },
    {
      id: "bell-2",
      when: { type: "after", trigger: "bell", delay: 3 },
      actions: [{ type: "sound", sound: "bell", at: { node: "counter-bell" }, volume: 0.9 }],
    },
    {
      id: "labels",
      when: { type: "time", at: 160 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "visible", target: "labels-a", visible: false },
        { type: "visible", target: "labels-b", visible: true },
        { type: "sound", sound: "footsteps", at: [-3, 0.2, 7.5], volume: 0.5 },
        {
          type: "subtitle",
          text: "区分棚のラベルが、全部「あなた」に変わっていた。棚の通路の奥で、靴音。",
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
        { type: "door", door: "staff-door", state: "slam" },
        { type: "door", door: "staff-door", state: "lock" },
        { type: "sound", sound: "slam", at: [4, 1, 4], volume: 0.8 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        {
          type: "subtitle",
          text: "通用口が閉まり、外から鍵を回す音がした。鍵は自分のポケットにあるのに。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "office", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "on" },
        { type: "visible", target: "parcel", visible: true },
        { type: "visible", target: "parcel-label", visible: true },
        { type: "sound", sound: "thud", at: { node: "parcel" }, volume: 0.6 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "停電。非常口の緑の灯りの中、作業台に見覚えのない小包が置かれている。",
          duration: 6,
        },
        { type: "objective", text: "小包を開ける" },
      ],
    },
    {
      id: "open",
      when: { type: "interact", target: "parcel", label: "小包を開ける", maxDistance: 2.4 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "sound", sound: "rattle", at: { node: "parcel" }, volume: 0.5 },
        { type: "visible", target: "mailman", visible: true },
        { type: "face", target: "mailman" },
        { type: "sound", sound: "footsteps", at: { node: "mailman" }, volume: 0.7 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "中には写真が一枚。区分棚の前に立つ自分の背中。撮られたのは……今だ。",
          duration: 6,
        },
      ],
    },
    {
      id: "open-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["open", ...SCARES],
      actions: [
        { type: "visible", target: "mailman", visible: true },
        { type: "face", target: "mailman" },
        { type: "sound", sound: "footsteps", at: { node: "mailman" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "区分棚の通路の奥から、靴音が近づいてくる。",
          duration: 6,
        },
      ],
    },
    {
      id: "approach",
      when: { type: "after", trigger: "open", delay: 1 },
      unless: SCARES,
      actions: [{ type: "move", target: "mailman", to: [2.8, 0, 7.5], duration: 7 }],
    },
    {
      id: "approach-auto",
      when: { type: "after", trigger: "open-auto", delay: 1 },
      unless: SCARES,
      actions: [{ type: "move", target: "mailman", to: [2.8, 0, 7.5], duration: 7 }],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "mailman", maxAngleDeg: 20, maxDistance: 14 },
      requiresAny: ["open", "open-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "mailman" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "mailman" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "宛先不明",
          text: "朝便の担当者は、区分を終えた郵便物の中に、宛先のない小包を一つ見つけた。\n差出人の欄には、昨夜の夜勤者の名前が書かれていた。",
        },
      ],
    })),
  ],
};
