import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「出席番号13番」の演出データ。
 * 夜の昇降口（x=-4〜4, z=0〜14）、入口シャッター shutter、合鍵マシン meter、店の電話 phone、
 * 奥の作業台の人影 figure-w、照明 group garage。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "shoe-lockers",
  title: "出席番号13番",
  intro: [
    "忘れ物を取りに、夜の学校の昇降口に入った。",
    "自分の下駄箱は、出席番号13番。",
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
        { type: "subtitle", text: "下駄箱がずらりと並ぶ。自分の13番を確認しよう。", duration: 5 },
        { type: "objective", text: "自分の下駄箱を確認する" },
      ],
    },
    {
      id: "check",
      when: { type: "interact", target: "meter", label: "下駄箱を開ける", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "meter" }, volume: 0.5 },
        { type: "subtitle", text: "中の上履きが濡れている。名札は知らない名前だ。", duration: 5 },
        { type: "objective", text: "" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "phone",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "phone" }, volume: 0.7 },
        { type: "subtitle", text: "校内放送が鳴った。「出席番号13番、まだ帰っていませんね」", duration: 5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "knock",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "knock", at: [0, 1.2, 10.5], volume: 0.8 },
        { type: "subtitle", text: "奥の下駄箱が、一つずつ内側から叩かれていく。", duration: 4 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 1.4, 11], volume: 0.6 },
        { type: "subtitle", text: "「……出して。ここ、せまい」", duration: 5 },
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
        { type: "subtitle", text: "扉が閉まり、蛍光灯が消えた。", duration: 5 },
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
        { type: "subtitle", text: "列の奥に人影が立っている。13番の扉が内側から軋む。閉めなければ。", duration: 7 },
        { type: "objective", text: "13番を閉める" },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "interact", target: "meter", label: "13番を閉める", maxDistance: 2.6 },
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
          title: "出席番号13番",
          text: "翌朝、昇降口には誰もいなかった。\n13番の下駄箱には、あなたの上履きだけが、きちんと揃えて入っていた。",
        },
      ],
    })),
  ],
};
