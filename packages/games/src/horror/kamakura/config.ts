import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 広場の演出データ。
 * 奥のろうそく ticket（interact）、白い女 patient、入口 front-door、照明 group hall / desk。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "kamakura",
  title: "かまくらの灯り",
  intro: [
    "かまくらの灯り。付き添いで来たが、広場に誰もいない。",
    "最後のろうそくを確かめて帰ろう。",
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
        { type: "subtitle", text: "しんしんと雪が降る。遠くで除雪車の音が止んだ。", duration: 5 },
        { type: "objective", text: "広場のろうそくを見て回る" },
      ],
    },
    {
      id: "suzu-swing",
      when: { type: "time", at: 50 },
      actions: [
        { type: "custom", name: "lampSwing" },
        { type: "subtitle", text: "風もないのに、吊るした雪洞がゆっくり揺れはじめた。", duration: 4 },
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
        { type: "subtitle", text: "かまくらの入口に、小さな子が座っていた……目を逸らすと、もういない。", duration: 5 },
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
        { type: "subtitle", text: "立て札に見覚えのない名前。「あなた」と書いてある。", duration: 6 },
        { type: "visible", target: "board-new", visible: true },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "clock",
      when: { type: "time", at: 190 },
      actions: [
        { type: "sound", sound: "bell", at: [0, 2, 9], volume: 0.7 },
        { type: "subtitle", text: "どこかで鐘が一度だけ鳴った。", duration: 4 },
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
        { type: "subtitle", text: "門が閉まり、広場の灯りが落ちた。奥のかまくらの灯りだけが残る。", duration: 5 },
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
        { type: "subtitle", text: "奥のかまくらのろうそくが揺れている。誰かが消すのを待っている。", duration: 6 },
        { type: "objective", text: "ろうそくを吹き消す" },
      ],
    },
    {
      id: "btn-open",
      when: { type: "interact", target: "ticket", label: "ろうそくを吹き消す", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "lights", group: "desk", on: false },
        { type: "visible", target: "patient", visible: true },
        { type: "sound", sound: "breath", at: { node: "patient" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "ろうそくを消すと、かまくらの奥に誰かが座っている。", duration: 6 },
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
        { type: "subtitle", text: "ろうそくがひとりでに消え、暗闇に誰かが立っている。", duration: 5 },
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
          title: "かまくらの灯り",
          text: "翌朝、雪かきの人が見つけたのは、かまくらの中の消えたろうそくだった。\n入口の足跡は、中へ入るものだけが残っていた。",
        },
      ],
    })),
  ],
};
