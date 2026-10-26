import type { HorrorConfig } from "./kit/types";

/**
 * 「返却ビデオ」の演出データ。
 * 店内 x=-5〜5, z=0〜14。カウンターのビデオデッキ(vcr)で返却テープを再生すると、テレビ(tv)の看板 tv-0〜tv-3 が防犯映像に変わる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "video-rental",
  title: "返却ビデオ",
  intro: [
    "閉店後のレンタルビデオ店でバイトの棚卸しをしている。",
    "返却ボックスに、ラベルのない黒いテープが一本入っていた。",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [0, 1.5, 12] },
  fog: { color: [0.06, 0.04, 0.07], density: 0.014 },
  ambient: { intensity: 0.1, color: [1, 0.85, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.4,
    angleDeg: 40,
    range: 11,
    color: [1, 0.95, 1],
  },
  walkSpeed: 0.085,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "店内に流れているのは、ノイズだけの古いBGM。",
        },
        {
          type: "objective",
          text: "カウンターのデッキで、黒いテープを再生してみる",
        },
      ],
    },
    {
      id: "play",
      when: {
        type: "interact",
        target: "vcr",
        label: "テープを再生する",
        maxDistance: 3,
      },
      actions: [
        { type: "visible", target: "tv-0", visible: false },
        { type: "visible", target: "tv-1", visible: true },
        { type: "sound", sound: "static", at: { node: "vcr" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "映ったのは、この店の防犯映像。ホラーの棚の前に、人が立っている。……自分と同じ服だ。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "auto-play",
      when: { type: "time", at: 50 },
      unless: ["play"],
      actions: [
        { type: "visible", target: "tv-0", visible: false },
        { type: "visible", target: "tv-1", visible: true },
        { type: "sound", sound: "static", at: { node: "vcr" }, volume: 0.6 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "デッキが勝手にテープを飲み込み、再生を始めた。画面には、この店のホラーの棚が映っている。",
          duration: 6,
        },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "behind",
      when: { type: "time", at: 105 },
      actions: [
        { type: "visible", target: "tv-1", visible: false },
        { type: "visible", target: "tv-2", visible: true },
        { type: "sound", sound: "whisper", at: { node: "tv" }, volume: 0.5 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "映像の中の自分の背後に、もう一人。顔を隠すように、髪が垂れている。",
          duration: 6,
        },
      ],
    },
    {
      id: "fall",
      when: { type: "time", at: 150 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "sound", sound: "thud", at: [-3, 1.2, 4], volume: 0.9 },
        { type: "sound", sound: "rattle", at: [0, 1.0, 6], volume: 0.6 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "ホラーの棚から、テープが何本も落ちた。映像のなかの人影も、棚の前にしゃがんでいる。",
          duration: 6,
        },
      ],
    },
    {
      id: "live",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "visible", target: "tv-2", visible: false },
        { type: "visible", target: "tv-3", visible: true },
        { type: "sound", sound: "stinger", at: { node: "tv" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "映像の隅に「REC ● 現在」の文字。これは、今の映像だ。自分の背中に、顔が近づいている。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "shop-door", state: "slam" },
        { type: "door", door: "shop-door", state: "lock" },
        { type: "lights", group: "shop", on: false },
        { type: "flashlight", state: "off" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "出入口のシャッターが落ちた。店内の灯りが消え、テレビの光だけが残った。",
          duration: 6,
        },
        { type: "objective", text: "画面を見たまま、動かない" },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "watch",
      when: {
        type: "look",
        target: "tv",
        maxAngleDeg: 30,
        maxDistance: 14,
      },
      requires: ["lock"],
      unless: SCARES,
      actions: [
        { type: "sound", sound: "breath", at: "behind", volume: 0.9 },
        { type: "heartbeat", bpm: 140 },
        {
          type: "subtitle",
          text: "画面の中の自分の真後ろに、顔が重なった。……画面を見ている自分の背後に、息がかかる。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "lookAway", target: "tv", minAngleDeg: 50 },
      requires: ["watch"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "watch", delay: 9 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
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
          title: "返却ビデオ",
          text: "翌朝、店長が返却ボックスを確認すると、黒いテープが一本もなくなっていた。\n防犯カメラの映像には、閉店後の店内で、棚の前に立つ人影と、その背後に重なるもう一つの人影が、朝まで映り続けていたという。\n\nその映像は、再生するたびに、人影が一歩ずつ近づく。",
        },
      ],
    })),
  ],
};
