import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「蛍の光」の演出データ。
 * 売り場：ラジオ radio（フック radioOn）、従業員口のシャッター shutter（フック shutterDown）、
 * 蛍光灯 group hall / レジ照明 group counter、レジ奥に背を向けた clerk。最後に飛び出すのは clerk-face。
 */
const SCARES = ["scare-hit", "scare-auto", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "home-center",
  title: "蛍の光",
  intro: [
    "閉店後のホームセンターで、棚卸しのアルバイト。",
    "店長は「朝までに終わらせて」と言って先に帰った。店内にはもう誰もいないはずだ。",
  ],
  spawn: { position: [0, 1.6, 3], lookAt: [0, 1.3, 12] },
  fog: { color: [0.03, 0.03, 0.035], density: 0.02 },
  ambient: { intensity: 0.1, color: [0.8, 0.85, 1] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "蛍光灯が低く唸る。レジの奥に、店員が一人だけ立っている。", duration: 5 },
        { type: "objective", text: "売り場を見て回る" },
      ],
    },
    {
      id: "walk",
      when: { type: "time", at: 40 },
      actions: [
        { type: "subtitle", text: "「……閉店時間をすぎました」。レジの方から、機械のような声。", duration: 5 },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "radio-on",
      when: { type: "time", at: 75 },
      actions: [
        { type: "custom", name: "radioOn" },
        { type: "subtitle", text: "棚のラジオが勝手についた。「蛍の光」が、ゆっくり、ひどく間延びして流れている。", duration: 6 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "cart-steps",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "rattle", at: "behind", volume: 0.6 },
        { type: "sound", sound: "step", at: "behind", volume: 0.6 },
        { type: "subtitle", text: "背後の通路を、カートが一台、ゆっくり押されていく音。振り向いても、誰もいない。", duration: 6 },
        { type: "drone", level: 0.15 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 165 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "sound", sound: "buzz", at: "player", volume: 0.5 },
        { type: "subtitle", text: "蛍光灯が一瞬だけ消えた。レジの店員の頭が、さっきと違う方向を向いている気がする。", duration: 6 },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "shutter",
      when: { type: "time", at: 205 },
      actions: [
        { type: "custom", name: "shutterDown" },
        { type: "shake", intensity: 0.02, duration: 1 },
        { type: "subtitle", text: "背後で、従業員口のシャッターが轟音とともに降りた。出口は、もうレジの先しかない。", duration: 6 },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "shutter", delay: 9 },
      actions: [
        { type: "lights", group: "hall", on: false },
        { type: "flashlight", state: "dim" },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        { type: "subtitle", text: "売り場の照明が落ちた。レジの明かりだけが、背を向けた店員を照らしている。", duration: 6 },
        { type: "objective", text: "レジの店員に、出口の鍵を頼む" },
      ],
    },
    {
      id: "talk",
      when: { type: "interact", target: "clerk", label: "声をかける", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "face", target: "clerk" },
        { type: "sound", sound: "breath", at: { node: "clerk" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "「あの……」。店員は、首だけを、ぐるりと後ろへ回した。", duration: 5 },
      ],
    },
    {
      id: "talk-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["talk", ...SCARES],
      actions: [
        { type: "face", target: "clerk" },
        { type: "sound", sound: "breath", at: { node: "clerk" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "店員が、ゆっくりとこちらを振り向いた。", duration: 5 },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "after", trigger: "talk", delay: 1.8 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "clerk", visible: false },
        { type: "jumpscare", figure: "clerk-face" },
      ],
    },
    {
      id: "scare-auto",
      when: { type: "after", trigger: "talk-auto", delay: 4 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "clerk", visible: false },
        { type: "jumpscare", figure: "clerk-face" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "clerk", visible: false },
        { type: "jumpscare", figure: "clerk-face" },
      ],
    },
    ...["scare-hit", "scare-auto", "scare-timeout"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "蛍の光",
          text: "翌朝、開店前の売り場で、棚卸しの端末だけが見つかった。\n防犯カメラには、レジに立つ二人目の店員が、閉店から開店までずっと映っていたという。",
        },
      ],
    })),
  ],
};
