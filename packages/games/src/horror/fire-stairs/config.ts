import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「降りても降りても」の演出データ。
 * 非常階段の踊り場（x=-2〜2, z=0〜14）、入口の防火扉 shutter、階数表示 meter、壁の非常電話 phone、
 * 階段下の人影 figure-w、照明 group garage。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "fire-stairs",
  title: "降りても降りても",
  intro: [
    "停電でエレベーターが止まり、非常階段で十二階から降りることにした。",
    "階数表示は降りるたびに「12」のまま変わらない。",
  ],
  spawn: { position: [0, 1.6, 0.8], lookAt: [0, 1.4, 12] },
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
        { type: "subtitle", text: "非常灯の下、階数表示が「12」を指している。まず確認しよう。", duration: 5 },
        { type: "objective", text: "階数表示を確認する" },
      ],
    },
    {
      id: "check",
      when: { type: "interact", target: "meter", label: "階数表示を見る", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "meter" }, volume: 0.5 },
        { type: "subtitle", text: "表示は「降りても降りても」。異常なし。……のはずが、料金が一円ずつ上がっている。", duration: 5 },
        { type: "objective", text: "" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "phone",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "phone" }, volume: 0.7 },
        { type: "subtitle", text: "壁の非常電話が鳴った。取ると、「そこは何階ですか。上の階にいます」", duration: 5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "knock",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "knock", at: [0, 1.2, 9.5], volume: 0.8 },
        { type: "subtitle", text: "階段の下から、手すりを叩きながら上ってくる音。", duration: 4 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 1.4, 10], volume: 0.6 },
        { type: "subtitle", text: "「……一緒に降りてください」", duration: 5 },
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
        { type: "subtitle", text: "背後の防火扉が閉まり、非常灯が消えた。", duration: 5 },
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
        { type: "subtitle", text: "階段の下に人影が立っている。表示の数字が「13」「14」と増えていく。止めなければ。", duration: 7 },
        { type: "objective", text: "表示を止める" },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "interact", target: "meter", label: "表示を止める", maxDistance: 2.6 },
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
          title: "降りても降りても",
          text: "翌朝、管理人は十二階の非常階段で、階数表示だけが夜通し数字を増やし続けているのを見つけた。\n降りたはずの住人は、まだ見つかっていない。",
        },
      ],
    })),
  ],
};
