import type { HorrorConfig } from "./kit/types";

/**
 * 「507号室」の演出データ。
 * 外廊下は x=-2〜28 を東へ一直線（幅 z=0〜2）。西端に階段室、東の突き当たり x=26 が自宅 507。
 * 最後は 507 から出てきた女が、廊下をゆっくり歩いてくる（接近型）。
 */
const SCARES = ["scare-look", "scare-reach", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "danchi-507",
  title: "507号室",
  intro: [
    "古い団地の五階。エレベーターは点検中で、階段を上ってきた。",
    "突き当たりの 507 号室。ひとり暮らしの部屋に帰るだけだ。",
  ],
  spawn: { position: [-4, 1.6, 1], lookAt: [6, 1.5, 1] },
  fog: { color: [0.03, 0.04, 0.06], density: 0.028 },
  ambient: { intensity: 0.06, color: [0.7, 0.8, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.6,
    angleDeg: 42,
    range: 10,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.075,
  droneLevel: 0.04,
  triggers: [
    // ---- 0〜1分: いつもの帰り道 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "どこかの部屋のテレビの音。遠くで犬が鳴いている。",
        },
        { type: "objective", text: "突き当たりの 507 号室へ帰る" },
      ],
    },
    {
      id: "chain",
      when: {
        type: "interact",
        target: "door-507",
        label: "鍵を開ける",
        maxDistance: 2.2,
      },
      unless: ["lock"],
      actions: [
        { type: "sound", sound: "rattle", at: { node: "door-507" } },
        { type: "heartbeat", bpm: 80 },
        {
          type: "subtitle",
          text: "鍵は回った。……数センチで止まる。中からチェーンがかかっている。ひとり暮らしなのに。",
          duration: 6,
        },
        { type: "objective", text: "階段へ戻って、管理人に知らせる" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "flicker-1",
      when: { type: "time", at: 62 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "sound", sound: "buzz", at: [13, 2.5, 1], volume: 0.6 },
        {
          type: "subtitle",
          text: "廊下の蛍光灯が瞬いた。テレビの音が、いつの間にか止んでいる。",
          duration: 4,
        },
      ],
    },
    {
      id: "slot",
      when: { type: "time", at: 100 },
      actions: [
        { type: "sound", sound: "thud", at: { node: "slot-503" }, volume: 0.8 },
        {
          type: "sound",
          sound: "breath",
          at: { node: "slot-503" },
          volume: 0.5,
        },
        {
          type: "subtitle",
          text: "カタン。503 の新聞受けが、内側から押し開けられた。",
          duration: 4,
        },
      ],
    },
    {
      id: "intercom",
      when: { type: "time", at: 138 },
      actions: [
        { type: "sound", sound: "chime", at: [18.7, 1.35, 0.1], volume: 0.8 },
        {
          type: "subtitle",
          text: "ピンポーン。誰もいない 505 の前で、インターホンが鳴った。",
          duration: 4,
        },
        { type: "heartbeat", bpm: 86 },
      ],
    },
    {
      id: "giggle",
      when: { type: "time", at: 168 },
      actions: [
        { type: "sound", sound: "giggle", at: [22.6, 0.5, 0.5], volume: 0.7 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "三輪車のあたりで、子どもが笑った。こんな時間に。",
          duration: 4,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "stair-door", state: "slam" },
        { type: "door", door: "stair-door", state: "lock" },
        { type: "lights", group: "stair", on: false },
        { type: "lights", group: "l1", on: false },
        { type: "lights", group: "l2", on: false },
        { type: "flicker", duration: 1.0 },
        { type: "drone", level: 0.45 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "階段室の鉄扉が閉まった。押しても引いても、びくともしない。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "open-507",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "sound", sound: "rattle", at: { node: "door-507" } },
        { type: "door", door: "door-507", state: "open" },
        {
          type: "subtitle",
          text: "突き当たりで、チェーンの外れる音。507 のドアが、ゆっくり開いた。",
          duration: 5,
        },
      ],
    },
    {
      id: "walk",
      when: { type: "after", trigger: "lock", delay: 13 },
      actions: [
        { type: "visible", target: "woman", visible: true },
        { type: "move", target: "woman", to: [-1.2, 0, 1], duration: 52 },
        {
          type: "sound",
          sound: "footsteps",
          at: { node: "woman" },
          volume: 0.6,
        },
        { type: "heartbeat", bpm: 118 },
        {
          type: "subtitle",
          text: "部屋から、髪の長い女が出てきた。こっちへ、歩いてくる。",
          duration: 5,
        },
        { type: "objective", text: "逃げ場は、ない" },
      ],
    },
    {
      id: "walk-l3",
      when: { type: "after", trigger: "walk", delay: 16 },
      actions: [
        { type: "lights", group: "l3", on: false },
        { type: "flashlight", state: "dim" },
        {
          type: "sound",
          sound: "footsteps",
          at: { node: "woman" },
          volume: 0.8,
        },
      ],
    },
    {
      id: "walk-steps",
      when: { type: "after", trigger: "walk", delay: 32 },
      actions: [
        { type: "sound", sound: "footsteps", at: { node: "woman" }, volume: 1 },
        { type: "heartbeat", bpm: 140 },
      ],
    },
    // ---- 4〜5分: 目の前まで ----
    {
      id: "scare-look",
      when: { type: "look", target: "woman", maxAngleDeg: 30, maxDistance: 3 },
      requires: ["walk"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-reach",
      when: { type: "after", trigger: "walk", delay: 50 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "507号室",
          text: "管理人の記録では、507 号室は三年前から空き部屋になっている。\n郵便受けには今も、あなたの名前の郵便物が届き続けている。\n\n内側から、チェーンをかけたまま。",
        },
      ],
    })),
  ],
};
