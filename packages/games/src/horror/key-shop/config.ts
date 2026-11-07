import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「合鍵」の演出データ。
 * 駅前の合鍵屋（x=-4〜4, z=0〜14）、入口シャッター shutter、合鍵マシン meter、店の電話 phone、
 * 奥の作業台の人影 figure-w、照明 group garage。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "key-shop",
  title: "合鍵",
  intro: [
    "深夜、閉店後の合鍵屋で店番を任された。",
    "店主は「朝まで戸締まりを頼む」と帰ってしまった。",
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
        { type: "subtitle", text: "壁一面に鍵がぶら下がっている。まずは合鍵マシンの電源を確認しよう。", duration: 5 },
        { type: "objective", text: "合鍵マシンを確認する" },
      ],
    },
    {
      id: "check",
      when: { type: "interact", target: "meter", label: "マシンを確認", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "meter" }, volume: 0.5 },
        { type: "subtitle", text: "画面は「待機中」。なのに、刃が勝手に回り始めた。", duration: 5 },
        { type: "objective", text: "" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "phone",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "phone" }, volume: 0.7 },
        { type: "subtitle", text: "店の電話が鳴った。「合鍵、できましたか。……あなたの家の」", duration: 5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "knock",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "knock", at: [0, 1.2, 10.5], volume: 0.8 },
        { type: "subtitle", text: "奥の作業台から、鍵を削る音が聞こえてくる。", duration: 4 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 1.4, 11], volume: 0.6 },
        { type: "subtitle", text: "「……開けてください。もう中にいますから」", duration: 5 },
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
        { type: "subtitle", text: "作業台に人影が立っている。マシンの赤い表示が増え続ける。止めなければ。", duration: 7 },
        { type: "objective", text: "マシンを止める" },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "interact", target: "meter", label: "マシンを止める", maxDistance: 2.6 },
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
          title: "合鍵",
          text: "翌朝、店主は無人の店を見つけた。\n作業台には削りたての合鍵が一本。店主の家の鍵と、同じ形をしていた。",
        },
      ],
    })),
  ],
};
