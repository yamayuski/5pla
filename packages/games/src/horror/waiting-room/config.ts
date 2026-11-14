import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 待合室の演出データ。
 * 発券機 ticket（interact）、患者 patient、入口 front-door、照明 group hall / desk。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "waiting-room",
  title: "夜間救急の待合室",
  intro: [
    "夜間救急の待合室。付き添いで来たが、受付に誰もいない。",
    "番号札を取って、呼ばれるまで待とう。",
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
        { type: "subtitle", text: "消毒液のにおい。遠くで救急車のサイレンが止まった。", duration: 5 },
        { type: "objective", text: "受付が来るのを待つ" },
      ],
    },
    {
      id: "suzu-swing",
      when: { type: "time", at: 50 },
      actions: [
        { type: "custom", name: "lampSwing" },
        { type: "subtitle", text: "誰もいないのに、天井の蛍光灯がゆっくり揺れはじめた。", duration: 4 },
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
        { type: "subtitle", text: "長椅子の端に、小さな人が座っていた……目を逸らすと、もういない。", duration: 5 },
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
        { type: "subtitle", text: "呼出表示に見覚えのない番号。患者名は「あなた」。", duration: 6 },
        { type: "visible", target: "board-new", visible: true },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "clock",
      when: { type: "time", at: 190 },
      actions: [
        { type: "sound", sound: "bell", at: [0, 2, 9], volume: 0.7 },
        { type: "subtitle", text: "院内放送が一度だけ「お待たせしました」と鳴った。", duration: 4 },
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
        { type: "lights", group: "hall", on: false },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "戸が閉まり、待合室の明かりが落ちた。受付の灯りだけが残る。", duration: 5 },
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
        { type: "subtitle", text: "発券機が緑に点滅している。誰かが取るのを待っている。", duration: 6 },
        { type: "objective", text: "番号札を取る" },
      ],
    },
    {
      id: "btn-open",
      when: { type: "interact", target: "ticket", label: "番号札を取る", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "lights", group: "desk", on: false },
        { type: "visible", target: "patient", visible: true },
        { type: "sound", sound: "breath", at: { node: "patient" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "番号札に「000番　あなた」。顔を上げると、受付の奥に患者が立っている。", duration: 6 },
      ],
    },
    {
      id: "btn-auto",
      when: { type: "after", trigger: "blackout", delay: 40 },
      unless: ["btn-open", ...SCARES],
      actions: [
        { type: "lights", group: "desk", on: false },
        { type: "visible", target: "patient", visible: true },
        { type: "sound", sound: "breath", at: { node: "patient" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "番号札が吐き出され、灯りが消え、暗闇に患者が立っている。", duration: 5 },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "after", trigger: "btn-open", delay: 3 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "patient" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "patient" }],
    },
    {
      id: "scare-auto",
      when: { type: "after", trigger: "btn-auto", delay: 4 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "patient" }],
    },
    ...[...SCARES, "scare-auto"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "夜間救急の待合室",
          text: "翌朝、交代の看護師が受付で見つけたのは、一枚の番号札だった。\n「000番　あなた」。診察記録には、昨夜の付き添いの名前が一件増えていた。",
        },
      ],
    })),
  ],
};
