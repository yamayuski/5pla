import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「合鍵」の演出データ。
 * ゴンドラ内部、扉 shutter、非常ボタン meter、インターホン phone、向かいの座席の人影 figure-w、照明 group garage。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "ferris-wheel",
  title: "最後のゴンドラ",
  intro: [
    "閉園間際の遊園地。最後の観覧車に、一人で乗り込んだ。",
    "係員は「一周で終わりです」と扉を閉めた。",
  ],
  spawn: { position: [0, 1.6, -1.5], lookAt: [0, 1.4, 8] },
  fog: { color: [0.03, 0.03, 0.04], density: 0.02 },
  ambient: { intensity: 0.08, color: [0.8, 0.85, 1] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "ゆっくり地面が遠ざかる。夜景がきれいだ。非常ボタンの位置を確認しておこう。", duration: 5 },
        { type: "objective", text: "非常ボタンを確認する" },
      ],
    },
    {
      id: "check",
      when: { type: "interact", target: "meter", label: "ボタンを確認", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "meter" }, volume: 0.5 },
        { type: "subtitle", text: "ランプは緑。なのに、ゴンドラが小さく揺れ始めた。", duration: 5 },
        { type: "objective", text: "" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "phone",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "phone" }, volume: 0.7 },
        { type: "subtitle", text: "インターホンが鳴った。「お客様、二名様で……よろしいですね」", duration: 5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "knock",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "knock", at: [0, 1.2, 4.5], volume: 0.8 },
        { type: "subtitle", text: "向かいの座席から、誰かが座り直す軋みが聞こえた。", duration: 4 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 1.4, 4.8], volume: 0.6 },
        { type: "subtitle", text: "「……ずっと、乗ってましたよ」", duration: 5 },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "shutter", state: "slam" },
        { type: "door", door: "shutter", state: "lock" },
        { type: "lights", group: "garage", on: false },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "flashlight", state: "on" },
        { type: "subtitle", text: "扉の鍵が掛かり、照明が落ちた。", duration: 5 },
        { type: "heartbeat", bpm: 104 },
      ],
    },
    {
      id: "dark",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.4 },
        { type: "visible", target: "figure-w", visible: true },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "subtitle", text: "向かいの座席に人影が座っている。ボタンを押して係員を呼ぼう。", duration: 7 },
        { type: "objective", text: "非常ボタンを押す" },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "interact", target: "meter", label: "非常ボタンを押す", maxDistance: 2.6 },
      requires: ["dark"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure-w" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure-w" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "最後のゴンドラ",
          text: "地上に戻ったゴンドラは空だった。\n係員は首をかしげた。「お客様は、最初から二名分の切符でしたよ」",
        },
      ],
    })),
  ],
};
