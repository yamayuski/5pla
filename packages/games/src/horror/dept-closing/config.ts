import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「蛍の光が止まるまで」の演出データ。
 * フロア（x=-4〜4, z=0〜16）、防火シャッター shutter、ワゴン wagon と迷子札、遊具 ride-ghost、
 * 奥の従業員用扉 exit と向こうに立つ figure-w、照明 group floor。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "dept-closing",
  title: "蛍の光が止まるまで",
  intro: [
    "百貨店の屋上遊園で落とし物を探していたら、閉店の音楽が流れ始めた。",
    "従業員用の通路を抜ければ、下へ出られるはずだ。",
  ],
  spawn: { position: [0, 1.6, -1.5], lookAt: [0, 1.4, 7] },
  fog: { color: [0.03, 0.03, 0.04], density: 0.015 },
  ambient: { intensity: 0.09, color: [1, 0.93, 0.85] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "閉店の音楽が流れる屋上階。ワゴンの上に迷子札が置かれている。", duration: 5 },
        { type: "objective", text: "ワゴンの迷子札を見る" },
      ],
    },
    {
      id: "wagon",
      when: { type: "interact", target: "wagon", label: "札を見る", maxDistance: 2.6 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "wagon" }, volume: 0.4 },
        { type: "subtitle", text: "「お母様がお待ちです」。今日はもう、迷子のお知らせなど流れていないはずなのに。", duration: 5 },
        { type: "objective", text: "奥の従業員用扉へ向かう" },
      ],
    },
    {
      id: "wagon-auto",
      when: { type: "time", at: 40 },
      unless: ["wagon"],
      actions: [
        { type: "subtitle", text: "迷子札の文字が、いつの間にか書き換わっている。", duration: 5 },
        { type: "objective", text: "奥の従業員用扉へ向かう" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "music-slow",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 2.8, 6], volume: 0.5 },
        { type: "subtitle", text: "蛍の光が、テープが伸びたようにゆっくりになっていく。", duration: 5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "ride",
      when: { type: "time", at: 125 },
      actions: [
        { type: "visible", target: "ride-ghost", visible: true },
        { type: "sound", sound: "knock", at: [2.4, 0.8, 9], volume: 0.7 },
        { type: "subtitle", text: "動かない遊具に、小さな影が乗っている。振り向くと、もういない。", duration: 5 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "pa",
      when: { type: "time", at: 170 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 2.8, 8], volume: 0.7 },
        { type: "subtitle", text: "館内放送。「迷子のお知らせです。……お客様のお連れ様が、お待ちです」", duration: 6 },
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
        { type: "lights", group: "floor", on: false },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "flashlight", state: "on" },
        { type: "subtitle", text: "来た側の防火シャッターが降り、音楽が止まった。", duration: 5 },
        { type: "heartbeat", bpm: 104 },
      ],
    },
    {
      id: "dark",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.4 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "subtitle", text: "残る出口は、奥の従業員用扉だけ。向こうから、かすかに子供の声がする。", duration: 6 },
        { type: "objective", text: "従業員用扉を開ける" },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "open-exit",
      when: { type: "interact", target: "exit", label: "扉を開ける", maxDistance: 2.6 },
      requires: ["dark"],
      unless: SCARES,
      actions: [
        { type: "door", door: "exit", state: "open" },
        { type: "visible", target: "figure-w", visible: true },
        { type: "sound", sound: "creak", at: [0, 1.2, 13], volume: 0.8 },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "open-exit", delay: 1.2 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure-w" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "visible", target: "figure-w", visible: true }, { type: "jumpscare", figure: "figure-w" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "蛍の光が止まるまで",
          text: "翌朝、屋上遊園の迷子札に「みつかりました」と赤ペンで書き足されていた。\nその日から、警備室の迷子名簿には、昨日入館した人の名前が一人分、増えている。",
        },
      ],
    })),
  ],
};
