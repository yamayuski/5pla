import type { HorrorConfig } from "./kit/types";

/**
 * 「マネキンは動かない」の演出データ。
 * 売り場は x=-5〜5, z=0〜10。シャッター扉 shutter(南)。奥のレジ台 button-desk のボタンで裏口を開ける。
 * m1〜m4: 最初から立つマネキン。m5: 後から入口側に出現。ghost: 最後の一発用の別個体。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "mannequin-floor",
  title: "マネキンは動かない",
  intro: [
    "閉店後の百貨店で、忘れ物を取りに婦人服フロアへ戻ってきた。",
    "警備員の巡回まで、あと五分。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.5, 6] },
  fog: { color: [0.05, 0.05, 0.06], density: 0.012 },
  ambient: { intensity: 0.12, color: [0.85, 0.9, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.6,
    angleDeg: 40,
    range: 12,
    color: [1, 0.98, 0.92],
  },
  walkSpeed: 0.08,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "非常灯だけの売り場。マネキンたちが、全員こちらに背を向けて立っている。",
        },
        { type: "objective", text: "奥のレジ台で忘れ物を探す" },
      ],
    },
    {
      id: "hum",
      when: { type: "time", at: 40 },
      actions: [
        { type: "sound", sound: "buzz", at: [0, 2.7, 3], volume: 0.4 },
        {
          type: "subtitle",
          text: "蛍光灯のうなり。……マネキンの数は、確か四体だった。",
          duration: 5,
        },
      ],
    },
    {
      id: "turn-m2",
      when: { type: "time", at: 75 },
      actions: [
        { type: "face", target: "m2" },
        { type: "sound", sound: "creak", at: { node: "m2" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "きし、と音がした。右手前のマネキンが、こちらを向いている。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "step-m1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 1 },
        { type: "move", target: "m1", to: [-1.2, 0, 2.2], duration: 0.3 },
        { type: "face", target: "m1" },
        { type: "sound", sound: "step", at: "behind", volume: 0.5 },
        {
          type: "subtitle",
          text: "灯りが瞬いた。左手前のマネキンが、さっきより通路の近くにいる。",
          duration: 5,
        },
      ],
    },
    {
      id: "phone",
      when: { type: "time", at: 160 },
      actions: [
        {
          type: "sound",
          sound: "phone",
          at: { node: "button-desk" },
          volume: 0.7,
        },
        { type: "sound", sound: "whisper", at: "behind", volume: 0.5 },
        {
          type: "subtitle",
          text: "レジ台の電話が鳴った。切れる直前、「……みつけた」と聞こえた。",
          duration: 5,
        },
        { type: "drone", level: 0.18 },
      ],
    },
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "shutter", state: "slam" },
        { type: "door", door: "shutter", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.5, 0], volume: 0.9 },
        { type: "shake", intensity: 0.03, duration: 1 },
        { type: "visible", target: "m5", visible: true },
        { type: "lights", group: "main", on: false },
        { type: "fog", density: 0.03, duration: 4 },
        {
          type: "subtitle",
          text: "シャッターが落ちた。入口のそばに、五体目のマネキンが立っている。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 98 },
      ],
    },
    {
      id: "dark",
      when: { type: "after", trigger: "lock", delay: 12 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "back", on: false },
        { type: "flashlight", state: "dim" },
        { type: "move", target: "m3", to: [-1.0, 0, 5.4], duration: 0.3 },
        { type: "move", target: "m4", to: [1.0, 0, 5.4], duration: 0.3 },
        { type: "face", target: "m3" },
        { type: "face", target: "m4" },
        { type: "sound", sound: "breath", at: "behind", volume: 0.8 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "真っ暗になった。ライトを向けるたび、通路の両脇のマネキンが近づいている。",
          duration: 5,
        },
        { type: "objective", text: "レジ台の裏口ボタンを押す" },
      ],
    },
    {
      id: "button",
      when: {
        type: "interact",
        target: "button-desk",
        label: "裏口ボタンを押す",
        maxDistance: 2.4,
      },
      requires: ["dark"],
      unless: SCARES,
      actions: [
        { type: "flashlight", state: "on" },
        {
          type: "sound",
          sound: "chime",
          at: { node: "button-desk" },
          volume: 0.6,
        },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ボタンが光った。……視界の端のマネキンが、全部、真後ろにいる。",
          duration: 4,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "button", delay: 3 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "stinger", at: "behind", volume: 1 },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "マネキンは動かない",
          text: "翌朝、売り場には五体目のマネキンが増えていた。\n誰も搬入した覚えはなく、顔だけが、あの夜の店員に似ていたという。",
        },
      ],
    })),
  ],
};
