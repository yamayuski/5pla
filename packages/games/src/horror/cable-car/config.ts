import type { HorrorConfig } from "./kit/types";

/**
 * 「宙づり」の演出データ。
 * ゴンドラ内は x=-1.5〜1.5, z=-2〜2。東の窓（x=+1.5）の外に、向かいのゴンドラ(gondola-b)と逆さの女(hanger)。
 * 最後はその逆さ顔を見た瞬間、別個体 ghost が目の前に出る。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "cable-car",
  title: "宙づり",
  intro: [
    "最終便のロープウェイ。山頂の夜景を見に、乗客は自分ひとり。",
    "ゴンドラは谷をゆっくり登っていく。",
  ],
  spawn: { position: [0, 1.6, -1.0], lookAt: [0, 1.5, 2] },
  fog: { color: [0.03, 0.04, 0.07], density: 0.035 },
  ambient: { intensity: 0.08, color: [0.8, 0.85, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.6,
    angleDeg: 42,
    range: 9,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.05,
  droneLevel: 0.09,
  triggers: [
    // ---- 0〜1分: 夜景のゴンドラ ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "足元の遠くに、麓の町の灯り。風でゴンドラが小さく軋む。",
        },
        { type: "objective", text: "窓の外の夜景を眺める" },
      ],
    },
    {
      id: "intercom",
      when: {
        type: "interact",
        target: "intercom",
        label: "インターホンを押す",
        maxDistance: 2.2,
      },
      unless: ["stop"],
      actions: [
        {
          type: "sound",
          sound: "chime",
          at: { node: "intercom" },
          volume: 0.5,
        },
        {
          type: "subtitle",
          text: "「ご乗車ありがとうございます。山頂までおよそ七分です」……録音の声だ。",
          duration: 5,
        },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "stop",
      when: { type: "time", at: 55 },
      actions: [
        { type: "sound", sound: "thud", at: [0, 3, 0], volume: 0.9 },
        { type: "sound", sound: "rumble", at: "player", volume: 0.5 },
        { type: "shake", intensity: 0.04, duration: 1.6 },
        { type: "drone", level: 0.2 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ガクン、とゴンドラが止まった。谷の上で宙づりのまま、風で揺れている。",
          duration: 5,
        },
      ],
    },
    {
      id: "pass",
      when: { type: "time", at: 100 },
      actions: [
        { type: "visible", target: "gondola-b", visible: true },
        { type: "move", target: "gondola-b", to: [7, 0, 30], duration: 16 },
        { type: "sound", sound: "rumble", at: [7, 1, -6], volume: 0.6 },
        { type: "heartbeat", bpm: 74 },
        {
          type: "subtitle",
          text: "向かいの下りゴンドラが、すぐそばをすれ違う。その窓に、誰かが張り付いている。顔だけがこちらを向いている。",
          duration: 7,
        },
      ],
    },
    {
      id: "pass-end",
      when: { type: "after", trigger: "pass", delay: 17 },
      actions: [{ type: "visible", target: "gondola-b", visible: false }],
    },
    {
      id: "roof",
      when: { type: "time", at: 140 },
      actions: [
        { type: "sound", sound: "footsteps", at: [0, 3, 0], volume: 0.8 },
        { type: "sound", sound: "thud", at: [0, 3, -1], volume: 0.7 },
        {
          type: "subtitle",
          text: "屋根の上を、誰かが歩いている。ゴンドラが、その重みでわずかに傾いた。",
          duration: 5,
        },
      ],
    },
    {
      id: "intercom-2",
      when: { type: "time", at: 175 },
      actions: [
        {
          type: "sound",
          sound: "static",
          at: { node: "intercom" },
          volume: 0.8,
        },
        {
          type: "sound",
          sound: "whisper",
          at: { node: "intercom" },
          volume: 0.8,
        },
        {
          type: "subtitle",
          text: "インターホンが勝手に鳴る。「……そこからは……おりられません……」",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 暗転と逆さの顔 ----
    {
      id: "dark",
      when: { type: "time", at: 205 },
      actions: [
        { type: "lights", group: "cabin", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "shake", intensity: 0.03, duration: 2 },
        { type: "fog", density: 0.05, duration: 4 },
        { type: "visible", target: "hanger", visible: true },
        { type: "sound", sound: "knock", at: [1.7, 1.6, 0], volume: 0.9 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "車内の灯りが消えた。東の窓を、外からこつ、こつと叩く音。見ないほうがいい。……でも。",
          duration: 6,
        },
      ],
    },
    {
      id: "knock-more",
      when: { type: "after", trigger: "dark", delay: 12 },
      actions: [
        { type: "sound", sound: "knock", at: [1.7, 1.6, 0.4], volume: 1 },
        { type: "sound", sound: "breath", at: [1.6, 1.6, 0], volume: 0.7 },
        {
          type: "subtitle",
          text: "窓の外の暗がりに、逆さまにぶら下がった白い顔の輪郭が見える。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: 目が合う ----
    {
      id: "scare-hit",
      when: { type: "look", target: "hanger", maxAngleDeg: 24, maxDistance: 9 },
      requires: ["dark"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "dark", delay: 42 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "knock", at: [1.7, 1.6, 0], volume: 1 },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "宙づり",
          text: "翌朝、運行を再開したロープウェイの山頂駅で、一台のゴンドラの窓に、外側からびっしりと手形が残されているのが見つかった。\n中に乗っていたはずの人は、どこにもいなかった。",
        },
      ],
    })),
  ],
};
