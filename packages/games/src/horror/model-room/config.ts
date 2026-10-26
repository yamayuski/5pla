import type { HorrorConfig } from "./kit/types";

/**
 * 「格安物件の内見」の演出データ。
 * 1LDK x=-4〜4, z=0〜11。玄関 front-door(z=0)。西壁にクローゼット、東壁に窓とカーテン。
 * 最後に、閉まった玄関が開き、不動産屋(realtor-return)が戻ってくる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "model-room",
  title: "格安物件の内見",
  intro: [
    "駅から徒歩5分、家賃4.8万円。相場の半額のワンルームの内見にやってきた。",
    "不動産屋の男は、にこやかに言った。「ごゆっくり、ご覧ください」",
  ],
  spawn: { position: [0, 1.6, 0.8], lookAt: [0, 1.5, 8] },
  fog: { color: [0.08, 0.07, 0.06], density: 0.01 },
  ambient: { intensity: 0.12, color: [1, 0.95, 0.85] },
  flashlight: {
    enabled: true,
    intensity: 0.35,
    angleDeg: 40,
    range: 10,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.085,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "日当たりのいい、広い部屋。家具は何もない。",
        },
        { type: "objective", text: "部屋の設備を確認する" },
      ],
    },
    {
      id: "leave",
      when: { type: "time", at: 25 },
      actions: [
        { type: "visible", target: "realtor", visible: false },
        { type: "sound", sound: "step", at: [0, 0, 1], volume: 0.5 },
        {
          type: "subtitle",
          text: "「少し、電話をしてきます」。男は玄関から出ていき、静かにドアが閉まった。",
          duration: 5,
        },
      ],
    },
    {
      id: "tap",
      when: {
        type: "interact",
        target: "tap",
        label: "蛇口をひねる",
        maxDistance: 2.6,
      },
      actions: [
        { type: "sound", sound: "drip", at: { node: "tap" }, volume: 0.7 },
        {
          type: "subtitle",
          text: "水が出る。……最初の数秒だけ、赤茶色に濁っていた。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "closet",
      when: { type: "time", at: 75 },
      actions: [
        { type: "door", door: "closet-door", state: "open" },
        { type: "sound", sound: "creak", at: [-4, 1, 7], volume: 0.8 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "西側のクローゼットの戸が、ひとりでに開いた。中は真っ暗だ。",
          duration: 5,
        },
      ],
    },
    {
      id: "curtain",
      when: { type: "time", at: 115 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "move", target: "curtain", to: [3.8, 1.1, 6.6], duration: 3 },
        {
          type: "sound",
          sound: "whisper",
          at: { node: "curtain" },
          volume: 0.5,
        },
        {
          type: "subtitle",
          text: "窓のカーテンが、風もないのにゆっくり端へ寄せられた。誰かが隣に立って、引いたみたいに。",
          duration: 6,
        },
      ],
    },
    {
      id: "phone",
      when: { type: "time", at: 155 },
      actions: [
        { type: "sound", sound: "phone", at: [-5, 1, 7], volume: 0.8 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "クローゼットの奥で、携帯の着信音が鳴りだした。この部屋は、空室のはずなのに。",
          duration: 6,
        },
      ],
    },
    {
      id: "steps",
      when: { type: "time", at: 190 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.6 },
        {
          type: "subtitle",
          text: "背後の床板がきしむ。壁際に残った家具の跡が、一つ増えている。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "door", door: "front-door", state: "lock" },
        { type: "lights", group: "room", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "玄関のドアが閉まった。鍵のかかる音。部屋の明かりが、全部消えた。",
          duration: 6,
        },
      ],
    },
    {
      id: "knock",
      when: { type: "after", trigger: "lock", delay: 12 },
      actions: [
        { type: "sound", sound: "knock", at: [0, 1.5, 0], volume: 0.9 },
        {
          type: "subtitle",
          text: "コン、コン。「いかがでしたか？」。ドアの外から、あの男の明るい声。",
          duration: 5,
        },
      ],
    },
    {
      id: "open",
      when: { type: "after", trigger: "knock", delay: 8 },
      actions: [
        { type: "lights", group: "corridor", on: true },
        { type: "door", door: "front-door", state: "unlock" },
        { type: "door", door: "front-door", state: "open" },
        { type: "visible", target: "realtor-return", visible: true },
        {
          type: "move",
          target: "realtor-return",
          to: [0, 0, 1.6],
          duration: 6,
        },
        { type: "heartbeat", bpm: 140 },
        {
          type: "subtitle",
          text: "鍵が回り、ドアが開く。逆光の中に、男が立っている。口が、笑ったまま動かない。",
          duration: 6,
        },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "realtor-return",
        maxAngleDeg: 28,
        maxDistance: 14,
      },
      requires: ["open"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "open", delay: 9 },
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
          title: "格安物件の内見",
          text: "後日、不動産会社に問い合わせると、「その物件も、そんな社員も、うちにはいません」と言われた。\n部屋の住所は、三年前に取り壊された建物のものだった。\n\n契約書には、あなたのサインが、すでに入っていたという。",
        },
      ],
    })),
  ],
};
