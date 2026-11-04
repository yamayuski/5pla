import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「閉園後の見回り」の演出データ。
 * 通路の左右に檻（赤い目 eyes-*、フック eyesOn1 / eyesAll / eyesOff）、入口ゲート gate（slam）、
 * 最後の右の檻に座る keeper。最後に飛び出すのは keeper-face。
 */
const SCARES = ["scare-hit", "scare-late", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "night-zoo",
  title: "閉園後の見回り",
  intro: [
    "動物園の夜間警備のアルバイト初日。閉園後に園内を一周して戻ってくるだけの簡単な仕事だと聞いた。",
    "「動物は全部、昼のうちに寝かせてあるから」と、先輩は言った。",
  ],
  spawn: { position: [0, 1.6, 0.5], lookAt: [0, 1.4, 12] },
  fog: { color: [0.02, 0.03, 0.025], density: 0.04 },
  ambient: { intensity: 0.05, color: [0.7, 0.8, 0.7] },
  flashlight: { enabled: true, intensity: 0.5, angleDeg: 38, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.07,
  droneLevel: 0.07,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "通路の左右に、空っぽに見える檻がずらりと並んでいる。どの檻にも「飼育中」の札。",
          duration: 5,
        },
        { type: "objective", text: "通路の一番奥まで見回る" },
      ],
    },
    {
      id: "walked",
      when: { type: "time", at: 40 },
      actions: [
        { type: "sound", sound: "rattle", at: { node: "plate-l0" }, volume: 0.3 },
        { type: "subtitle", text: "動物の気配がない。寝息すら聞こえない。", duration: 5 },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "eyes1",
      when: { type: "time", at: 75 },
      actions: [
        { type: "custom", name: "eyesOn1" },
        { type: "sound", sound: "breath", at: { node: "plate-l0" }, volume: 0.5 },
        { type: "subtitle", text: "最初の檻の奥で、赤い目がふたつ、こちらを見ていた。……札には何の動物かも書いていない。", duration: 6 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "steps",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "step", at: "behind", volume: 0.6 },
        { type: "sound", sound: "rattle", at: "behind", volume: 0.5 },
        { type: "subtitle", text: "背後で、鉄格子を爪でなぞる音。ずっと、ついてくる。", duration: 6 },
        { type: "drone", level: 0.15 },
      ],
    },
    {
      id: "eyes-all",
      when: { type: "time", at: 165 },
      actions: [
        { type: "custom", name: "eyesAll" },
        { type: "sound", sound: "whisper", at: { node: "keeper" }, volume: 0.5 },
        { type: "subtitle", text: "すべての檻に赤い目が並んだ。みんな、通路の奥を見ている。最後の檻だけ、人が座っている。", duration: 6 },
        { type: "heartbeat", bpm: 90 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "gate-slam",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "gate", state: "slam" },
        { type: "door", door: "gate", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1, 2], volume: 1 },
        { type: "shake", intensity: 0.03, duration: 1 },
        { type: "fog", density: 0.07, duration: 5 },
        { type: "subtitle", text: "入口のゲートが落ちた。戻れない。", duration: 5 },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "gate-slam", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "lantern", on: false },
        { type: "custom", name: "eyesOff" },
        { type: "flashlight", state: "dim" },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 108 },
        { type: "subtitle", text: "街灯が消え、赤い目も消えた。檻の奥の人影が、立ち上がった気がする。", duration: 6 },
        { type: "objective", text: "出口を探す" },
      ],
    },
    {
      id: "call",
      when: { type: "after", trigger: "blackout", delay: 14 },
      actions: [
        { type: "sound", sound: "giggle", at: "behind", volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "subtitle", text: "「ねえ。ずっと見てたよ。あなたが、動物だって」", duration: 6 },
      ],
    },
    // ---- ジャンプスケア：目を逸らした瞬間 ----
    {
      id: "scare-hit",
      when: { type: "lookAway", target: "keeper", minAngleDeg: 100 },
      requires: ["call"],
      unless: SCARES,
      actions: [{ type: "visible", target: "keeper", visible: false }, { type: "jumpscare", figure: "keeper-face" }],
    },
    {
      id: "scare-late",
      when: { type: "after", trigger: "call", delay: 40 },
      unless: SCARES,
      actions: [{ type: "visible", target: "keeper", visible: false }, { type: "jumpscare", figure: "keeper-face" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "visible", target: "keeper", visible: false }, { type: "jumpscare", figure: "keeper-face" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "閉園後の見回り",
          text: "翌朝、新しい檻が一つ増えていた。札には「新入り・目を逸らすと出てきます」とある。\n先輩は言う。「最初の夜に、必ず一人入るんだ」",
        },
      ],
    })),
  ],
};
