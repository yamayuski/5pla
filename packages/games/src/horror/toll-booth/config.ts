import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 料金所の演出データ。
 * 精算ボタン button（interact）、係員 clerk、入口 front-door、照明 group office / window。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "toll-booth",
  title: "深夜の料金所",
  intro: [
    "廃止予定の高速料金所。深夜の巡回で、事務所の戸が少し開いている。",
    "点検表にサインをするだけ。すぐに出よう。",
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
        { type: "subtitle", text: "冷えた事務所。遠くで通行止めの警告音が鳴っている。", duration: 5 },
        { type: "objective", text: "事務所を点検する" },
      ],
    },
    {
      id: "suzu-swing",
      when: { type: "time", at: 50 },
      actions: [
        { type: "custom", name: "barSwing" },
        { type: "subtitle", text: "誰もいないのに、外のゲートバーが上下しはじめた。", duration: 4 },
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
        { type: "subtitle", text: "ブースの奥に、制服の人が立っていた……目を逸らすと、もういない。", duration: 5 },
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
        { type: "subtitle", text: "通行記録の端末に、見覚えのない今夜の通行車両。ナンバーは「あなたの車」。", duration: 6 },
        { type: "visible", target: "log-new", visible: true },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "clock",
      when: { type: "time", at: 190 },
      actions: [
        { type: "sound", sound: "bell", at: [0, 2, 9], volume: 0.7 },
        { type: "subtitle", text: "料金所の放送が、一度だけ「ご通行ありがとうございました」と鳴った。", duration: 4 },
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
        { type: "lights", group: "office", on: false },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "戸が閉まり、事務所の明かりが落ちた。精算窓口の灯りだけが残る。", duration: 5 },
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
        { type: "subtitle", text: "窓口の精算ボタンが赤く点滅している。誰かが押すのを待っている。", duration: 6 },
        { type: "objective", text: "精算ボタンを押す" },
      ],
    },
    {
      id: "btn-open",
      when: { type: "interact", target: "button", label: "精算ボタンを押す", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "lights", group: "window", on: false },
        { type: "visible", target: "clerk", visible: true },
        { type: "sound", sound: "breath", at: { node: "clerk" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "レシートに「料金　あなた」。顔を上げると、窓の奥に係員が立っている。", duration: 6 },
      ],
    },
    {
      id: "btn-auto",
      when: { type: "after", trigger: "blackout", delay: 40 },
      unless: ["btn-open", ...SCARES],
      actions: [
        { type: "lights", group: "window", on: false },
        { type: "visible", target: "clerk", visible: true },
        { type: "sound", sound: "breath", at: { node: "clerk" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "レシートが吐き出され、灯りが消え、暗闇に係員が立っている。", duration: 5 },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "after", trigger: "btn-open", delay: 3 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "clerk" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "clerk" }],
    },
    {
      id: "scare-auto",
      when: { type: "after", trigger: "btn-auto", delay: 4 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "clerk" }],
    },
    ...[...SCARES, "scare-auto"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "深夜の料金所",
          text: "翌朝、交代の職員が窓口で見つけたのは、一枚のレシートだった。\n「料金　あなた」。通行記録には、昨夜の巡回員の名前が一件増えていた。",
        },
      ],
    })),
  ],
};
