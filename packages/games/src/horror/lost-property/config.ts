import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「預かり品番号000」の演出データ。
 * フロア（x=-4〜4, z=0〜16）、窓口シャッター shutter、受付台 wagon と預かり票、傘 ride-ghost、
 * 奥の裏口 exit と向こうに立つ figure-w、照明 group floor。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "lost-property",
  title: "預かり品番号000",
  intro: [
    "駅の遺失物取扱所に忘れ物を取りに来たら、受付の係員がいないまま照明が落ち始めた。",
    "保管庫の奥の裏口から、駅の構内へ出られるはずだ。",
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
        { type: "subtitle", text: "棚の並ぶ保管庫。受付台に、自分の名前が書かれた預かり票が置かれている。", duration: 5 },
        { type: "objective", text: "受付台の預かり票を見る" },
      ],
    },
    {
      id: "wagon",
      when: { type: "interact", target: "wagon", label: "預かり票を見る", maxDistance: 2.6 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "wagon" }, volume: 0.4 },
        { type: "subtitle", text: "品名の欄に「あなた」。受取期限は、今夜になっている。", duration: 5 },
        { type: "objective", text: "奥の裏口へ向かう" },
      ],
    },
    {
      id: "wagon-auto",
      when: { type: "time", at: 40 },
      unless: ["wagon"],
      actions: [
        { type: "subtitle", text: "預かり票の文字が、いつの間にか書き換わっている。", duration: 5 },
        { type: "objective", text: "奥の裏口へ向かう" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "music-slow",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 2.8, 6], volume: 0.5 },
        { type: "subtitle", text: "構内放送の発車メロディが、テープが伸びたようにゆっくりになっていく。", duration: 5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "ride",
      when: { type: "time", at: 125 },
      actions: [
        { type: "visible", target: "ride-ghost", visible: true },
        { type: "sound", sound: "knock", at: [2.4, 0.8, 9], volume: 0.7 },
        { type: "subtitle", text: "棚の傘が一本だけ、ひとりでに倒れた。そこに誰かの手が見えた気がした。", duration: 5 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "pa",
      when: { type: "time", at: 170 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 2.8, 8], volume: 0.7 },
        { type: "subtitle", text: "構内放送。「お預かりのお客様は、至急、窓口までお越しください」", duration: 6 },
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
        { type: "subtitle", text: "入口の窓口シャッターが降り、音が止まった。", duration: 5 },
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
        { type: "subtitle", text: "残る出口は奥の裏口だけ。棚の向こうから、袋のこすれる音が近づく。", duration: 6 },
        { type: "objective", text: "裏口を開ける" },
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
          title: "預かり品番号000",
          text: "翌朝、遺失物台帳の最後の行に「お渡し済み」と記されていた。\n品名は、昨夜この駅を訪れた人の名前だった。受取人の欄は、空白のままだ。",
        },
      ],
    })),
  ],
};
