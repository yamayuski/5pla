import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「自転車は一台ずつ」の演出データ。
 * 地下駐輪場（x=-4〜4, z=0〜14）、入口シャッター shutter、精算機 meter、管理室電話 phone、
 * 奥の作業台の人影 figure-w、照明 group garage。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "bike-lot",
  title: "自転車は一台ずつ",
  intro: [
    "終電後、駅前の地下駐輪場に自転車を取りに来た。",
    "自分の区画は、13番。",
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
        { type: "subtitle", text: "自転車がずらりと並ぶ。精算機で自分の13番を確認しよう。", duration: 5 },
        { type: "objective", text: "精算機で13番を確認する" },
      ],
    },
    {
      id: "check",
      when: { type: "interact", target: "meter", label: "精算機を操作する", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "meter" }, volume: 0.5 },
        { type: "subtitle", text: "画面に「13番　出庫済み」と出た。自分の自転車は、まだここにあるのに。", duration: 5 },
        { type: "objective", text: "" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "phone",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "phone" }, volume: 0.7 },
        { type: "subtitle", text: "管理室の電話が鳴った。「13番のお客様、お帰りは一台ずつです」", duration: 5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "knock",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "knock", at: [0, 1.2, 10.5], volume: 0.8 },
        { type: "subtitle", text: "奥の自転車が、一台ずつ、ひとりでに倒れていく。", duration: 4 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 1.4, 11], volume: 0.6 },
        { type: "subtitle", text: "「……のせて。もう、あるけない」", duration: 5 },
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
        { type: "subtitle", text: "シャッターが落ち、蛍光灯が消えた。", duration: 5 },
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
        { type: "subtitle", text: "列の奥に人影が立っている。自分の自転車の後ろが、重く沈んでいる。精算を止めなければ。", duration: 7 },
        { type: "objective", text: "精算を止める" },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "interact", target: "meter", label: "精算を止める", maxDistance: 2.6 },
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
          title: "自転車は一台ずつ",
          text: "翌朝、駐輪場の精算機には「13番　出庫済み」と表示されていた。\n自転車の荷台には、濡れた手形が二つ、残っていた。",
        },
      ],
    })),
  ],
};
