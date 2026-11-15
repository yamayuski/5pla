import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 広場の演出データ。
 * 奥の人影 rider（lookAway）、背後の女 behind、入口 shutter、照明 group hall。
 */
const SCARES = ["scare-hit", "scare-after", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "escalator-hall",
  title: "動かない階段",
  intro: [
    "閉店後の駅ビル。忘れ物を取りに戻ったが、客は自分ひとりだけ。",
    "吹き抜けを抜けて、奥のエスカレーターを確かめよう。",
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
        { type: "subtitle", text: "館内放送も止まり、足音だけが吹き抜けに響く。", duration: 5 },
        { type: "objective", text: "エスカレーターへ向かう" },
      ],
    },
    {
      id: "lamp-swing",
      when: { type: "time", at: 50 },
      actions: [
        { type: "custom", name: "lampSwing" },
        { type: "subtitle", text: "天井の案内灯が、風もないのにゆっくり揺れはじめた。", duration: 4 },
      ],
    },
    {
      id: "peek-1",
      when: { type: "time", at: 95 },
      actions: [
        { type: "visible", target: "rider", visible: true },
        { type: "sound", sound: "whisper", at: { node: "rider" }, volume: 0.5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "peek-away",
      when: { type: "lookAway", target: "rider", minAngleDeg: 30 },
      requires: ["peek-1"],
      actions: [
        { type: "visible", target: "rider", visible: false },
        { type: "subtitle", text: "止まったエスカレーターの上に、誰かが立っている……目を逸らすと、もういない。", duration: 5 },
      ],
    },
    {
      id: "peek-auto",
      when: { type: "time", at: 110 },
      actions: [{ type: "visible", target: "rider", visible: false }],
    },
    {
      id: "page-whisper",
      when: { type: "time", at: 150 },
      actions: [
        { type: "sound", sound: "rattle", at: [-2.9, 1.4, 3], volume: 0.6 },
        { type: "sound", sound: "whisper", at: [2.5, 1.2, 6], volume: 0.6 },
        { type: "subtitle", text: "フロアガイドに見覚えのない階。「6F 人のいないフロア」。", duration: 6 },
        { type: "visible", target: "board-new", visible: true },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "clock",
      when: { type: "time", at: 190 },
      actions: [
        { type: "sound", sound: "bell", at: [0, 2, 9], volume: 0.7 },
        { type: "subtitle", text: "遠くでエレベーターの到着音が一度だけ鳴った。", duration: 4 },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 215 },
      actions: [
        { type: "door", door: "shutter", state: "slam" },
        { type: "door", door: "shutter", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "lights", group: "hall", on: false },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "シャッターが降り、吹き抜けの灯りが落ちた。", duration: 5 },
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
        { type: "visible", target: "rider", visible: true },
        { type: "subtitle", text: "エスカレーターの上の人影が、こちらを向いている。目を逸らしてはいけない気がする。", duration: 6 },
        { type: "objective", text: "出口を探す" },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "lookAway", target: "rider", minAngleDeg: 35 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "rider", visible: false },
        { type: "visible", target: "behind", visible: true },
        { type: "sound", sound: "breath", at: "behind", volume: 0.9 },
        { type: "jumpscare", figure: "behind" },
      ],
    },
    {
      id: "scare-after",
      when: { type: "after", trigger: "blackout", delay: 40 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "rider", visible: false },
        { type: "visible", target: "behind", visible: true },
        { type: "jumpscare", figure: "behind" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "jumpscare", figure: "behind" },
      ],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "動かない階段",
          text: "翌朝、警備員が見つけたのは、止まったエスカレーターの途中に置かれた忘れ物の鞄だった。\nフロアガイドには、存在しない階が書き足されていた。",
        },
      ],
    })),
  ],
};
