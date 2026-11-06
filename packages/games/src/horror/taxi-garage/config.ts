import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「回送」の演出データ。
 * タクシー車庫（x=-4〜4, z=0〜14）、入口シャッター shutter、運賃メーター meter、事務所の電話 phone、
 * 後部座席の人影 figure-w、照明 group garage。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "taxi-garage",
  title: "回送",
  intro: [
    "深夜三時、タクシー会社の車庫で仮眠明けの点検を任された。",
    "他の乗務員はもう出払っている。車庫には自分の車だけが残っている。",
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
        { type: "subtitle", text: "蛍光灯の下で黄色い車が待っている。まずは運賃メーターを点検しよう。", duration: 5 },
        { type: "objective", text: "運賃メーターを確認する" },
      ],
    },
    {
      id: "check",
      when: { type: "interact", target: "meter", label: "メーターを確認", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "meter" }, volume: 0.5 },
        { type: "subtitle", text: "表示は「回送」。異常なし。……のはずが、料金が一円ずつ上がっている。", duration: 5 },
        { type: "objective", text: "" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "phone",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "phone" }, volume: 0.7 },
        { type: "subtitle", text: "事務所の電話が鳴った。取ると、「迎車お願いします。もう車の中です」", duration: 5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "knock",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "knock", at: [0, 1.2, 9.5], volume: 0.8 },
        { type: "subtitle", text: "車の中から、窓を内側から叩く音。", duration: 4 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 1.4, 10], volume: 0.6 },
        { type: "subtitle", text: "「……運転手さん、出してください」", duration: 5 },
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
        { type: "subtitle", text: "後部座席に人影が座っている。メーターの数字だけが赤く増え続ける。止めなければ。", duration: 7 },
        { type: "objective", text: "メーターを止める" },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "interact", target: "meter", label: "メーターを止める", maxDistance: 2.6 },
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
          title: "回送",
          text: "翌朝、車庫の点検係は無人のタクシーを見つけた。\n運賃メーターは「回送」のまま、料金だけが夜通し上がり続けていた。",
        },
      ],
    })),
  ],
};
