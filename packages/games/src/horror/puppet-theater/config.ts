import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「幕が上がる前」の演出データ。
 * 入口 entry-door（z=0）、調べる対象 stage-curtain、人影 figure / behind。
 * 照明グループ front（手前）/ back（奥）。
 */
const SCARES = ["draw", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "puppet-theater",
  title: "幕が上がる前",
  intro: ["閉館した人形劇場の最終点検に来た。", "舞台の赤い幕が、わずかに揺れている。"],
  spawn: { position: [0, 1.6, 2], lookAt: [0, 1.4, 8] },
  fog: { color: [0.03, 0.03, 0.04], density: 0.02 },
  ambient: { intensity: 0.2, color: [0.85, 0.88, 0.95] },
  flashlight: { enabled: false, intensity: 0.7, angleDeg: 42, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "客席の埃のにおい。舞台の上で、人形が一体、こちらを向いている。", duration: 5 },
        { type: "objective", text: "客席を回って点検する" },
      ],
    },
    {
      id: "anomaly-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "rattle", at: [0, 1.5, 14], volume: 0.5 },
        { type: "subtitle", text: "舞台の方から、糸の軋む音がした。", duration: 6 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 78 },
        { type: "subtitle", text: "照明が瞬いた。さっきまで舞台にいた人形が、一体減っている。", duration: 5 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "flicker", duration: 0.4 },
        { type: "subtitle", text: "客席の後ろの列に、小さな人影が座っていた。", duration: 4 },
      ],
    },
    {
      id: "glimpse-gone",
      when: { type: "after", trigger: "glimpse", delay: 1.2 },
      actions: [{ type: "visible", target: "behind", visible: false }],
    },
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "entry-door", state: "slam" },
        { type: "door", door: "entry-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "出入口の扉が閉まり、ブザーが鳴った。", duration: 5 },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "front", on: false },
        { type: "flashlight", state: "on" },
        { type: "fog", density: 0.05, duration: 5 },
        { type: "drone", level: 0.3 },
        { type: "heartbeat", bpm: 104 },
        { type: "sound", sound: "whisper", at: "behind", volume: 0.6 },
        { type: "objective", text: "舞台の幕を確かめる" },
        { type: "subtitle", text: "客席の灯りが落ちた。舞台のスポットだけが点き、幕が半分まで上がっている。", duration: 7 },
      ],
    },
    {
      id: "draw",
      when: { type: "interact", target: "stage-curtain", label: "幕を引く", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "幕が上がる前",
          text: "翌朝、館長は言った。「あの劇場の演目は、もう十年前に終わっているよ」\n舞台の中央に、あなたと同じ服を着た新しい人形が一体、座っていた。",
        },
      ],
    })),
  ],
};
