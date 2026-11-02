import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「閉店後のひろば」の演出データ。
 * 玩具店（x=-4〜4, z=0〜12）、入口シャッター shutter、奥のオルゴール musicbox、
 * 棚の目玉看板 eyes、通路の人影 figure-g、照明 group shop。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "toy-store",
  title: "閉店後のひろば",
  intro: [
    "商店街の古い玩具店。店主に頼まれて、閉店後に忘れ物を取りに来た。",
    "奥のオルゴールを持ってきてほしい、とだけ言われている。",
  ],
  spawn: { position: [0, 1.6, -1.5], lookAt: [0, 1.4, 6] },
  fog: { color: [0.04, 0.03, 0.03], density: 0.03 },
  ambient: { intensity: 0.08, color: [1, 0.85, 0.7] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 10, color: [1, 0.95, 0.85] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "棚にはぬいぐるみやブリキの玩具が並んでいる。店の一番奥にオルゴールがあるはずだ。", duration: 5 },
        { type: "objective", text: "奥のオルゴールを探す" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "giggle",
      when: { type: "time", at: 65 },
      actions: [
        { type: "sound", sound: "whisper", at: [-2.4, 1.0, 6], volume: 0.5 },
        { type: "subtitle", text: "棚のほうから、子どもの小さな笑い声がした。", duration: 4 },
        { type: "heartbeat", bpm: 72 },
      ],
    },
    {
      id: "eyes-on",
      when: { type: "time", at: 110 },
      actions: [
        { type: "visible", target: "eyes", visible: true },
        { type: "sound", sound: "knock", at: [-3.5, 1.2, 7.5], volume: 0.6 },
        { type: "subtitle", text: "ぬいぐるみの目が、全部こちらを向いている。", duration: 5 },
        { type: "heartbeat", bpm: 84 },
      ],
    },
    {
      id: "lights-flicker",
      when: { type: "time", at: 155 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "subtitle", text: "背後で、ブリキの玩具がカタカタと歩く音。", duration: 4 },
        { type: "drone", level: 0.14 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "shutter", state: "slam" },
        { type: "door", door: "shutter", state: "lock" },
        { type: "lights", group: "shop", on: false },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "flashlight", state: "on" },
        { type: "subtitle", text: "入口のシャッターが落ち、店の明かりが消えた。", duration: 5 },
        { type: "heartbeat", bpm: 104 },
      ],
    },
    {
      id: "dark",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "visible", target: "figure-g", visible: true },
        { type: "sound", sound: "buzz", at: [0, 1.2, 11.2], volume: 0.6 },
        { type: "drone", level: 0.35 },
        { type: "subtitle", text: "通路の途中に、女の子が立っている。オルゴールが勝手に鳴りはじめた。止めなければ。", duration: 7 },
        { type: "objective", text: "オルゴールを止める" },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "interact", target: "musicbox", label: "オルゴールを止める", maxDistance: 2.4 },
      requires: ["dark"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure-g" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure-g" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "閉店後のひろば",
          text: "翌朝、玩具店のシャッターは閉まったままだった。\n店主は、昨夜は誰にも頼んでいないと言う。奥のオルゴールは、まだ小さく鳴っていた。",
        },
      ],
    })),
  ],
};
