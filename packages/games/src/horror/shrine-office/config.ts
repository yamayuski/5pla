import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 授与所の演出データ。
 * おみくじ筒 omikuji（interact）、巫女 miko、入口 front-door、照明 group office / counter。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "shrine-office",
  title: "授与所の夜",
  intro: [
    "年の瀬の神社。閉めたはずの授与所の戸が、少し開いている。",
    "忘れ物を取りに入るだけ。すぐに出よう。",
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
        { type: "subtitle", text: "冷えた木の匂い。遠くで鈴の紐が揺れている。", duration: 5 },
        { type: "objective", text: "授与所を見て回る" },
      ],
    },
    {
      id: "suzu-swing",
      when: { type: "time", at: 50 },
      actions: [
        { type: "custom", name: "suzuSwing" },
        { type: "subtitle", text: "誰もいないのに、天井の鈴がひとりでに鳴り出した。", duration: 4 },
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
        { type: "sound", sound: "rattle", at: [-2.9, 1.4, 3], volume: 0.6 },
        { type: "sound", sound: "whisper", at: [2.5, 1.2, 6], volume: 0.6 },
        { type: "subtitle", text: "絵馬掛けに、見覚えのない新しい絵馬。願い事は「あなたがここにいますように」。", duration: 6 },
        { type: "visible", target: "ema-new", visible: true },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "clock",
      when: { type: "time", at: 190 },
      actions: [
        { type: "sound", sound: "bell", at: [0, 2, 9], volume: 0.7 },
        { type: "subtitle", text: "境内の太鼓が、一度だけ低く鳴った。", duration: 4 },
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
        { type: "lights", group: "office", on: false },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "戸が閉まり、授与所の明かりが落ちた。カウンターの灯りだけが残る。", duration: 5 },
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
        { type: "subtitle", text: "カウンターのおみくじ筒が、からからと鳴っている。誰かが引くのを待っている。", duration: 6 },
        { type: "objective", text: "おみくじを引く" },
      ],
    },
    {
      id: "omi-open",
      when: { type: "interact", target: "omikuji", label: "おみくじを引く", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "lights", group: "counter", on: false },
        { type: "visible", target: "miko", visible: true },
        { type: "sound", sound: "breath", at: { node: "miko" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "筒から出た紙には「凶　うしろ」。顔を上げると、カウンターの奥に巫女が立っている。", duration: 6 },
      ],
    },
    {
      id: "omi-auto",
      when: { type: "after", trigger: "blackout", delay: 40 },
      unless: ["omi-open", ...SCARES],
      actions: [
        { type: "lights", group: "counter", on: false },
        { type: "visible", target: "miko", visible: true },
        { type: "sound", sound: "breath", at: { node: "miko" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "筒から紙が飛び出し、灯りが消え、暗闇に巫女が立っている。", duration: 5 },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "after", trigger: "omi-open", delay: 3 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "miko" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "miko" }],
    },
    {
      id: "scare-auto",
      when: { type: "after", trigger: "omi-auto", delay: 4 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "miko" }],
    },
    ...[...SCARES, "scare-auto"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "授与所の夜",
          text: "元日の朝、参拝客が授与所のカウンターで見つけたのは、一枚のおみくじだった。\n「凶　うしろ」。名前の書かれた絵馬が、そのすぐ隣に増えていた。",
        },
      ],
    })),
  ],
};
