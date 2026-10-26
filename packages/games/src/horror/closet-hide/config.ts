import type { HorrorConfig } from "./kit/types";

/**
 * 「かくれんぼのクローゼット」の演出データ。
 * プレイヤーは子ども部屋のクローゼットの中から動けない（スリットごしに部屋をのぞく）。
 * 女(stalker)は北の戸口(z=8)から入り、部屋を歩き回って、最後にクローゼットの前に立つ。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "closet-hide",
  title: "クローゼットの中",
  intro: [
    "「ここに隠れていて。何があっても、声を出さないで」。そう言って母さんは扉を閉めた。",
    "クローゼットのすき間から、暗い子ども部屋が縦じまに見える。",
  ],
  spawn: { position: [0, 1.5, -0.5], lookAt: [0, 1.4, 6] },
  fog: { color: [0.04, 0.04, 0.06], density: 0.02 },
  ambient: { intensity: 0.08, color: [0.7, 0.8, 1] },
  flashlight: {
    enabled: false,
    intensity: 0.2,
    angleDeg: 30,
    range: 3,
    color: [1, 1, 1],
  },
  walkSpeed: 0.05,
  droneLevel: 0.07,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "自分の呼吸の音が、やけに大きい。" },
        { type: "objective", text: "息をひそめて、すき間から様子を見る" },
      ],
    },
    {
      id: "hall-steps",
      when: { type: "time", at: 30 },
      actions: [
        { type: "sound", sound: "footsteps", at: [0, 1, 10], volume: 0.5 },
        {
          type: "subtitle",
          text: "廊下で、床板がきしむ。母さんの足音とは違う、ゆっくりした音。",
          duration: 5,
        },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "door-open",
      when: { type: "time", at: 70 },
      actions: [
        { type: "door", door: "room-door", state: "open" },
        { type: "sound", sound: "creak", at: [0, 1, 8], volume: 0.8 },
        { type: "heartbeat", bpm: 76 },
        {
          type: "subtitle",
          text: "部屋の扉が、ゆっくり開いていく。",
          duration: 4,
        },
      ],
    },
    {
      id: "enter",
      when: { type: "time", at: 105 },
      actions: [
        { type: "visible", target: "stalker", visible: true },
        { type: "move", target: "stalker", to: [1.2, 0, 5.2], duration: 18 },
        { type: "sound", sound: "step", at: { node: "stalker" }, volume: 0.6 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "白い服の女が入ってきた。顔は髪に隠れている。部屋の中を、何かを探すように歩いている。",
          duration: 6,
        },
      ],
    },
    {
      id: "bed",
      when: { type: "time", at: 150 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "move", target: "stalker", to: [-1.8, 0, 4.2], duration: 12 },
        {
          type: "sound",
          sound: "whisper",
          at: { node: "stalker" },
          volume: 0.5,
        },
        {
          type: "subtitle",
          text: "女はベッドの上を撫で、布団をめくった。「……どこ……？」",
          duration: 6,
        },
      ],
    },
    {
      id: "closer",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "move", target: "stalker", to: [0.4, 0, 2.6], duration: 12 },
        {
          type: "sound",
          sound: "breath",
          at: { node: "stalker" },
          volume: 0.6,
        },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "女は部屋の真ん中で動きを止めて、ゆっくりクローゼットのほうへ向きを変えた。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "front",
      when: { type: "time", at: 205 },
      actions: [
        { type: "lights", group: "room", on: false },
        { type: "lights", group: "night", on: false },
        { type: "move", target: "stalker", to: [0, 0, 0.9], duration: 5 },
        { type: "face", target: "stalker" },
        { type: "flicker", duration: 1.4 },
        { type: "drone", level: 0.4 },
        { type: "heartbeat", bpm: 118 },
        {
          type: "subtitle",
          text: "明かりが落ちた。スリットのすぐ向こうに、白い服が立っている。息を止めて。",
          duration: 6,
        },
        { type: "objective", text: "動かない。声を出さない" },
      ],
    },
    {
      id: "wait",
      when: { type: "after", trigger: "front", delay: 14 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "knock", at: [0, 1.3, 0.3], volume: 0.9 },
        { type: "heartbeat", bpm: 140 },
        {
          type: "subtitle",
          text: "コン、コン。スリットが、内側からではなく外から叩かれた。……見てしまう。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "stalker",
        maxAngleDeg: 22,
        maxDistance: 5,
      },
      requires: ["wait"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "wait", delay: 9 },
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
          title: "クローゼットの中",
          text: "翌朝、救急隊員がクローゼットを開けたとき、中の子どもは無事だった。\nただ、一晩中、扉の外の誰かの呼びかけに、小さな声で返事をし続けていたという。\n\n「母さん」を探す声は、まだ廊下で聞こえている。",
        },
      ],
    })),
  ],
};
