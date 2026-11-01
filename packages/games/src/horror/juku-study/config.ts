import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「自習室は22時まで」の演出データ。
 * 自分の席 my-desk（最前列の左）と答案 sheet、ホワイトボード board-a/b、時計 clock-a/b、空席の卓上ライト lamps-on、
 * 扉 class-door、照明 group room / desklamp / 非常口の緑 red。最後はうしろの席の student。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "juku-study",
  title: "自習室は22時まで",
  intro: [
    "受験まであと三か月。塾の自習室に、今夜も最後まで残った。",
    "ほかの生徒はもう帰った。22時になったら消灯して帰るきまりだ。",
  ],
  spawn: { position: [-2.4, 1.6, 4.9], lookAt: [-2.4, 1.0, 6.4] },
  fog: { color: [0.02, 0.02, 0.025], density: 0.02 },
  ambient: { intensity: 0.07, color: [0.85, 0.9, 1] },
  flashlight: {
    enabled: false,
    intensity: 0.45,
    angleDeg: 42,
    range: 8,
    color: [1, 0.97, 0.9],
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
          text: "空調の音。時計は 21:52。あと一問だけ解いて帰ろう。",
          duration: 5,
        },
        { type: "objective", text: "自分の席で問題集を開く" },
      ],
    },
    {
      id: "study",
      when: { type: "interact", target: "my-desk", label: "問題集を開く", maxDistance: 2.2 },
      actions: [
        { type: "lights", group: "desklamp", on: true },
        { type: "sound", sound: "step", at: { node: "my-desk" }, volume: 0.2 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "卓上ライトを点けて、最後の一問に取りかかる。",
          duration: 4,
        },
      ],
    },
    {
      id: "study-auto",
      when: { type: "time", at: 40 },
      unless: ["study"],
      actions: [
        { type: "lights", group: "desklamp", on: true },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "卓上ライトが、ひとりでに点いた。",
          duration: 4,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "clock",
      when: { type: "time", at: 75 },
      actions: [
        { type: "visible", target: "clock-a", visible: false },
        { type: "visible", target: "clock-b", visible: true },
        { type: "sound", sound: "chime", at: { node: "clock-b" }, volume: 0.4 },
        {
          type: "subtitle",
          text: "時計が 21:25 になっている。……戻った？",
          duration: 5,
        },
        { type: "heartbeat", bpm: 72 },
      ],
    },
    {
      id: "pencil",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "whisper", at: [-2.4, 1, 3.8], volume: 0.4 },
        { type: "sound", sound: "rattle", at: [-2.4, 0.9, 4.2], volume: 0.3 },
        {
          type: "subtitle",
          text: "すぐうしろの席から、鉛筆を走らせる音。誰もいなかったはずなのに。",
          duration: 6,
        },
        { type: "drone", level: 0.1 },
      ],
    },
    {
      id: "lamps",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "lamps-on", visible: true },
        { type: "flicker", duration: 0.6 },
        { type: "visible", target: "board-a", visible: false },
        { type: "visible", target: "board-b", visible: true },
        {
          type: "subtitle",
          text: "空席の卓上ライトが、全部点いた。ホワイトボードの字が変わっている。",
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
        { type: "door", door: "class-door", state: "slam" },
        { type: "door", door: "class-door", state: "lock" },
        { type: "sound", sound: "slam", at: [2.8, 1, 0], volume: 0.8 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        {
          type: "subtitle",
          text: "扉が閉まった。廊下で、警備の人が鍵を掛けて遠ざかっていく。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "room", on: false },
        { type: "lights", group: "desklamp", on: false },
        { type: "lights", group: "red", on: true },
        { type: "visible", target: "lamps-on", visible: false },
        { type: "flashlight", state: "on" },
        { type: "visible", target: "sheet", visible: true },
        { type: "sound", sound: "breath", at: [-2.4, 1.4, 3.6], volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "消灯。非常口の緑の灯りの中、机の上に答案用紙が一枚置かれている。",
          duration: 6,
        },
        { type: "objective", text: "答案用紙を読む" },
      ],
    },
    {
      id: "read",
      when: { type: "interact", target: "my-desk", label: "答案用紙を読む", maxDistance: 2.2 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "student", visible: true },
        { type: "sound", sound: "rattle", at: [-2.4, 0.9, 4.2], volume: 0.5 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "「うしろの席を見て」。うしろで、鉛筆を置く音がした。",
          duration: 6,
        },
      ],
    },
    {
      id: "read-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["read", ...SCARES],
      actions: [
        { type: "visible", target: "student", visible: true },
        { type: "sound", sound: "rattle", at: [-2.4, 0.9, 4.2], volume: 0.6 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "うしろの席で、椅子を引く音がした。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "student", maxAngleDeg: 22, maxDistance: 10 },
      requiresAny: ["read", "read-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "student" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "student" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "自習室は22時まで",
          text: "翌日、塾の講師は自習室の最前列に、解きかけの問題集を見つけた。\nそのうしろの席は、十年前の冬から、誰も座らないことになっている。",
        },
      ],
    })),
  ],
};
