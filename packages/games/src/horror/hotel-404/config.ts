import type { HorrorConfig } from "./kit/types";

/**
 * 「404号室」の演出データ。
 * 客室は x=-3〜3, z=0〜7（入口 z=0 の room-door、x=2）。北西に浴室（x=-3〜-0.6, z=7〜10.6）、
 * 奥の浴槽にシャワーカーテン(curtain)。カーテン越しに人影(bather)が立つ。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "hotel-404",
  title: "404号室",
  intro: [
    "出張先のビジネスホテル。404号室、シングル。",
    "荷物を置いて、あとはシャワーを浴びて寝るだけ。",
  ],
  spawn: { position: [1.4, 1.6, 1.0], lookAt: [-1, 1.4, 6] },
  fog: { color: [0.04, 0.04, 0.05], density: 0.014 },
  ambient: { intensity: 0.1, color: [1, 0.95, 0.9] },
  flashlight: {
    enabled: true,
    intensity: 0.6,
    angleDeg: 42,
    range: 9,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.075,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: チェックイン ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "壁の薄い安い部屋。エアコンの音と、遠くのエレベーターの音。",
        },
        { type: "objective", text: "浴室を確かめる" },
      ],
    },
    {
      id: "bath-check",
      when: { type: "zone", center: [-1.8, 1.6, 6.2], radius: 1.8 },
      actions: [
        {
          type: "subtitle",
          text: "浴室の扉は閉まっている。隙間から、水の滴る音。",
          duration: 4,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "shower",
      when: { type: "time", at: 70 },
      actions: [
        { type: "lights", group: "bath", on: true },
        { type: "sound", sound: "static", at: [-1.8, 1.5, 9.5], volume: 0.5 },
        { type: "sound", sound: "drip", at: [-1.8, 0.5, 9.5], volume: 0.9 },
        {
          type: "subtitle",
          text: "浴室の電気が点いた。シャワーの水音が、誰もいないのに始まった。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "phone-ring",
      when: { type: "time", at: 110 },
      actions: [
        { type: "sound", sound: "phone", at: { node: "phone" }, volume: 0.9 },
        { type: "objective", text: "電話に出る" },
        {
          type: "subtitle",
          text: "枕元の電話が鳴っている。フロントだろうか。",
          duration: 4,
        },
      ],
    },
    {
      id: "phone",
      when: {
        type: "interact",
        target: "phone",
        label: "受話器を取る",
        maxDistance: 2.2,
      },
      requires: ["phone-ring"],
      unless: ["lock"],
      actions: [
        { type: "sound", sound: "whisper", at: { node: "phone" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "「……お客様。お連れ様が、お風呂でお待ちです」……連れなど、いない。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "tv-on",
      when: { type: "time", at: 150 },
      actions: [
        { type: "visible", target: "tv-lit", visible: true },
        { type: "lights", group: "tv", on: true },
        { type: "sound", sound: "static", at: { node: "tv-lit" }, volume: 0.8 },
        {
          type: "subtitle",
          text: "テレビが勝手についた。砂嵐の中に、ぼんやりと浴室のような映像。",
          duration: 5,
        },
      ],
    },
    {
      id: "bath-open",
      when: { type: "time", at: 175 },
      actions: [
        { type: "door", door: "bath-door", state: "open" },
        { type: "visible", target: "bather", visible: true },
        { type: "sound", sound: "creak", at: [-1.8, 1, 7], volume: 0.8 },
        {
          type: "subtitle",
          text: "浴室の扉がひとりでに開いた。シャワーカーテンの向こうに、人影が立っている。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "room-door", state: "slam" },
        { type: "door", door: "room-door", state: "lock" },
        { type: "lights", group: "room", on: false },
        { type: "lights", group: "tv", on: false },
        { type: "visible", target: "tv-lit", visible: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.2 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.35 },
        {
          type: "subtitle",
          text: "入口のドアが閉まり、チェーンが掛かる音。部屋の電気もテレビも消えた。浴室の明かりだけが残る。",
          duration: 6,
        },
      ],
    },
    {
      id: "press",
      when: { type: "after", trigger: "lock", delay: 6 },
      actions: [
        {
          type: "move",
          target: "bather",
          to: [-1.8, 0.45, 9.55],
          duration: 22,
        },
        { type: "sound", sound: "breath", at: [-1.8, 1.3, 9.5], volume: 0.7 },
        {
          type: "subtitle",
          text: "カーテンの向こうの人影が、ゆっくり前へ。薄いビニールが、顔の形に押し出される。",
          duration: 6,
        },
      ],
    },
    // ---- 4〜5分: カーテン ----
    {
      id: "ready",
      when: { type: "after", trigger: "press", delay: 22 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "whisper", at: { node: "curtain" }, volume: 1 },
        { type: "heartbeat", bpm: 135 },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "curtain",
        maxAngleDeg: 18,
        maxDistance: 9,
      },
      requires: ["ready"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "curtain", visible: false },
        { type: "visible", target: "bather", visible: false },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "ready", delay: 9 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "curtain", visible: false },
        { type: "visible", target: "bather", visible: false },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "curtain", visible: false },
        { type: "visible", target: "bather", visible: false },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "404号室",
          text: "翌朝、チェックアウトの時間になっても出てこない客を、従業員が起こしに行った。\n\n404号室の浴槽には、誰も使っていないはずの湯が、なみなみと張られていた。\nこのホテルに、404号室という部屋はない。",
        },
      ],
    })),
  ],
};
