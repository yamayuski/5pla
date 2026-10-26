import type { HorrorConfig } from "./kit/types";

/**
 * 「天体観測会」の演出データ。
 * 玄関ホール z=-6〜0、ドーム室 z=0〜10（x=-5〜5）。望遠鏡は(0,_,5)。接眼レンズ eyepiece が調べる対象。
 * 最後は接眼レンズをのぞくと、レンズの向こうの「目」がこちら側へ出てくる。
 */
const SCARES = ["scare-hit", "scare-auto", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "observatory",
  title: "天体観測会",
  intro: [
    "公立天文台の閉館後、特別に鍵を借りて一人で観測をさせてもらう夜。",
    "今夜は土星がよく見えるらしい。",
  ],
  spawn: { position: [0, 1.6, -5.2], lookAt: [0, 1.5, 5] },
  fog: { color: [0.02, 0.025, 0.045], density: 0.018 },
  ambient: { intensity: 0.06, color: [0.7, 0.8, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.65,
    angleDeg: 40,
    range: 12,
    color: [1, 0.35, 0.3],
  },
  walkSpeed: 0.08,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 土星をのぞく ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "ドームの天窓から、冷たい夜空が見える。観測の邪魔にならないよう、灯りは赤いライトだけだ。",
        },
        { type: "objective", text: "望遠鏡をのぞいて土星を見る" },
      ],
    },
    {
      id: "scope-1",
      when: {
        type: "interact",
        target: "eyepiece",
        label: "接眼レンズをのぞく",
        maxDistance: 2.2,
      },
      unless: ["lock"],
      actions: [
        { type: "sound", sound: "chime", at: "player", volume: 0.3 },
        {
          type: "subtitle",
          text: "淡い金色の環をもつ星が、くっきりと浮かんでいる。ずっと見ていたくなる静けさだ。",
          duration: 5,
        },
        { type: "objective", text: "朝まで観測を続ける" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "dome-turn",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "rumble", at: [0, 4.5, 5], volume: 0.7 },
        { type: "shake", intensity: 0.01, duration: 2.5 },
        {
          type: "subtitle",
          text: "ごごご……。ドームが、ひとりで回りはじめた。天窓の位置が、ずれていく。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "steps-above",
      when: { type: "time", at: 115 },
      actions: [
        { type: "sound", sound: "footsteps", at: [0, 5.5, 6], volume: 0.7 },
        {
          type: "subtitle",
          text: "ドームの外壁の上を、誰かが歩いている。足音は、ゆっくり円を描いている。",
          duration: 5,
        },
      ],
    },
    {
      id: "chart",
      when: { type: "time", at: 150 },
      actions: [
        { type: "visible", target: "chart-a", visible: false },
        { type: "visible", target: "chart-b", visible: true },
        { type: "sound", sound: "creak", at: [-4.8, 2, 3], volume: 0.5 },
        {
          type: "subtitle",
          text: "壁の星図が、いつの間にか別の紙に替わっている。赤い字で、ただ一言。「うしろ」",
          duration: 5,
        },
      ],
    },
    {
      id: "scope-turn",
      when: { type: "time", at: 180 },
      actions: [
        { type: "custom", name: "scopeTurn" },
        { type: "sound", sound: "rumble", at: [0, 1.5, 5], volume: 0.9 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "望遠鏡が勝手に動き、接眼レンズがこちらを向いた。",
          duration: 4,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "door", door: "front-door", state: "lock" },
        { type: "lights", group: "dome", on: false },
        { type: "visible", target: "scope-glow", visible: true },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "drone", level: 0.4 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "玄関の扉が閉まり、鍵が回る音がした。ドームの灯りも消え、接眼レンズの奥だけが赤く光っている。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "whisper",
      when: { type: "after", trigger: "lock", delay: 12 },
      actions: [
        {
          type: "sound",
          sound: "whisper",
          at: { node: "eyepiece" },
          volume: 0.9,
        },
        {
          type: "sound",
          sound: "breath",
          at: { node: "eyepiece" },
          volume: 0.6,
        },
        {
          type: "subtitle",
          text: "レンズの奥から、囁きが漏れている。「……みつけた……そっちから……みて……」",
          duration: 5,
        },
        { type: "objective", text: "もう一度、のぞく" },
      ],
    },
    // ---- 4〜5分: のぞいた先 ----
    {
      id: "scare-hit",
      when: {
        type: "interact",
        target: "eyepiece",
        label: "接眼レンズをのぞく",
        maxDistance: 2.4,
      },
      requires: ["whisper"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "starer" }],
    },
    {
      id: "scare-auto",
      when: { type: "after", trigger: "whisper", delay: 28 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "knock", at: { node: "eyepiece" }, volume: 1 },
        { type: "jumpscare", figure: "starer" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "starer" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "天体観測会",
          text: "観測日誌の最後のページには、こう記されていた。\n「土星の環の向こうに、こちらを見ている目があった」\n\n翌朝、望遠鏡は接眼レンズを玄関のほうへ向けたまま、どうしても動かせなかったという。",
        },
      ],
    })),
  ],
};
