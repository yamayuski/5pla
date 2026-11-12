import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「引っ越し前夜の空き部屋」の演出データ。
 * 書棚2列の間の通路、本 fall-book（棚から落ちる）、通路奥の人影 peeker、帳場の店主 inside、
 * 入荷本 fusuma（interact）、入口 front-door、照明 group flat / closet。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "move-out",
  title: "引っ越し前夜の空き部屋",
  intro: [
    "明日、この部屋を出る。荷物はすべて段ボールの中。",
    "最後の夜をひとりで過ごすだけ。……のはずだった。",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [0, 1.4, 8] },
  fog: { color: [0.03, 0.025, 0.02], density: 0.02 },
  ambient: { intensity: 0.09, color: [0.9, 0.8, 0.65] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 10, color: [1, 0.95, 0.85] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "がらんとした部屋。冷蔵庫のない静けさが耳に痛い。", duration: 5 },
        { type: "objective", text: "部屋を見て回る" },
      ],
    },
    {
      id: "box-fall",
      when: { type: "time", at: 50 },
      actions: [
        { type: "custom", name: "boxFall" },
        { type: "subtitle", text: "積んだ段ボールが一つ、勝手に落ちた。", duration: 4 },
      ],
    },
    {
      id: "peek-1",
      when: { type: "time", at: 95 },
      actions: [
        { type: "visible", target: "peeker", visible: true },
        { type: "sound", sound: "whisper", at: { node: "peeker" }, volume: 0.5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "peek-away",
      when: { type: "lookAway", target: "peeker", minAngleDeg: 30 },
      requires: ["peek-1"],
      actions: [
        { type: "visible", target: "peeker", visible: false },
        { type: "subtitle", text: "通路の奥に、長い髪の人が立っていた……目を逸らすと、もういない。", duration: 5 },
      ],
    },
    {
      id: "peek-auto",
      when: { type: "time", at: 110 },
      actions: [{ type: "visible", target: "peeker", visible: false }],
    },
    {
      id: "page-whisper",
      when: { type: "time", at: 150 },
      actions: [
        { type: "sound", sound: "rattle", at: [2.9, 1.0, 3], volume: 0.6 },
        { type: "sound", sound: "whisper", at: [-2.5, 1.2, 6], volume: 0.6 },
        { type: "subtitle", text: "壁に、小さな手形が浮かんでいる。外から、爪で壁をなぞる音がする。", duration: 6 },
        { type: "visible", target: "handprint", visible: true },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "clock",
      when: { type: "time", at: 190 },
      actions: [
        { type: "sound", sound: "bell", at: [0, 1.5, 3], volume: 0.7 },
        { type: "subtitle", text: "インターホンが鳴った。モニターには誰も映っていない。", duration: 4 },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 215 },
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "door", door: "front-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "lights", group: "flat", on: false },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "玄関が閉まり、部屋の明かりが落ちた。押入れの中だけが薄明るい。", duration: 5 },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.4 },
        { type: "flashlight", state: "on" },
        { type: "fog", density: 0.05, duration: 5 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 108 },
        { type: "subtitle", text: "押入れの襖が、指一本ぶん開いている。中から、こちらを見ている気配。", duration: 6 },
        { type: "objective", text: "押入れを確かめる" },
      ],
    },
    {
      id: "fusuma-open",
      when: { type: "interact", target: "fusuma", label: "襖を開ける", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "lights", group: "closet", on: false },
        { type: "visible", target: "fusuma", visible: false },
        { type: "visible", target: "inside", visible: true },
        { type: "sound", sound: "breath", at: { node: "inside" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "襖を開けた。中に、白い服の女が正座している。", duration: 6 },
      ],
    },
    {
      id: "fusuma-auto",
      when: { type: "after", trigger: "blackout", delay: 40 },
      unless: ["fusuma-open", ...SCARES],
      actions: [
        { type: "lights", group: "closet", on: false },
        { type: "visible", target: "fusuma", visible: false },
        { type: "visible", target: "inside", visible: true },
        { type: "sound", sound: "breath", at: { node: "inside" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "襖がひとりでに開き、中の女が立ち上がった。", duration: 5 },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "after", trigger: "fusuma-open", delay: 3 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "inside" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "inside" }],
    },
    {
      id: "scare-auto",
      when: { type: "after", trigger: "fusuma-auto", delay: 4 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "inside" }],
    },
    ...[...SCARES, "scare-auto"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "引っ越し前夜の空き部屋",
          text: "引っ越し当日の朝、業者が見たのは、空っぽの部屋と、押入れの中でうずくまる前の住人の荷物だった。\n部屋の主だけが、どこにもいなかった。",
        },
      ],
    })),
  ],
};
