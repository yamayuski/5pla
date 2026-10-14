import type { HorrorConfig } from "./kit/types";

/**
 * 「深夜の歯科医院」の演出データ。
 * 待合室(z=0〜6)から診察室(z=6〜16)へ。診察台は (0,12)、ライトスイッチは奥の壁 (1.6,15.85)。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "dental-clinic",
  title: "深夜の歯科医院",
  intro: [
    "奥歯が割れるように痛んで、深夜の急患受付の看板にすがった。",
    "待合室には、誰もいない。受付のベルを鳴らしてみよう。",
  ],
  spawn: { position: [0, 1.6, 1.3], lookAt: [0, 1.5, 10] },
  fog: { color: [0.05, 0.07, 0.07], density: 0.02 },
  ambient: { intensity: 0.1, color: [0.8, 0.95, 0.95] },
  flashlight: {
    enabled: true,
    intensity: 0.45,
    angleDeg: 40,
    range: 11,
    color: [0.95, 1, 1],
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
          text: "消毒液のにおい。時計の秒針の音だけが聞こえる。",
        },
        { type: "objective", text: "受付のベルを鳴らす" },
      ],
    },
    {
      id: "ring",
      when: {
        type: "interact",
        target: "reception-bell",
        label: "ベルを鳴らす",
        maxDistance: 2.5,
      },
      actions: [
        {
          type: "sound",
          sound: "bell",
          at: { node: "reception-bell" },
          volume: 0.7,
        },
        {
          type: "subtitle",
          text: "チン、と音が響いた。奥から「少々お待ちください」と、くぐもった声がした。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "drill",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "buzz", at: [0, 1.5, 13], volume: 0.7 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "診察室から、ドリルの回る音。誰も治療していないはずの部屋から。",
          duration: 6,
        },
      ],
    },
    {
      id: "chair",
      when: { type: "time", at: 110 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "custom", name: "chairTurn" },
        { type: "sound", sound: "creak", at: [0, 1, 12], volume: 0.8 },
        {
          type: "subtitle",
          text: "診察台が、きしみながらゆっくり回っている。まるで、誰かが座ったみたいに。",
          duration: 6,
        },
      ],
    },
    {
      id: "xray",
      when: { type: "time", at: 150 },
      actions: [
        { type: "visible", target: "xray-base", visible: false },
        { type: "visible", target: "xray", visible: true },
        { type: "sound", sound: "whisper", at: [-3.8, 1.7, 12], volume: 0.5 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "壁のレントゲン写真に、あなたの名前。歯の数が一本、増えている。",
          duration: 6,
        },
      ],
    },
    {
      id: "dentist-1",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.3 },
        { type: "visible", target: "dentist", visible: true },
        {
          type: "sound",
          sound: "breath",
          at: { node: "dentist" },
          volume: 0.6,
        },
        {
          type: "subtitle",
          text: "診察室の隅に、マスクの医師が背を向けて立っている。「口を開けてください」",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "clinic-door", state: "slam" },
        { type: "door", door: "clinic-door", state: "lock" },
        { type: "lights", group: "wait", on: false },
        { type: "lights", group: "room", on: false },
        { type: "visible", target: "dentist", visible: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口の自動ドアが閉まった。全ての照明が落ち、医師の姿も消えている。",
          duration: 6,
        },
        { type: "objective", text: "奥の壁のライトスイッチを入れる" },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "switch",
      when: {
        type: "interact",
        target: "lamp-switch",
        label: "スイッチを入れる",
        maxDistance: 2.5,
      },
      requires: ["lock"],
      unless: ["scare-fallback", "scare-timeout"],
      actions: [
        { type: "lights", group: "op", on: true },
        { type: "sound", sound: "buzz", at: "player", volume: 0.9 },
        { type: "heartbeat", bpm: 140 },
        {
          type: "subtitle",
          text: "無影灯がついた。診察台がこちらを向き、誰かが横たわっている。……起き上がる。",
          duration: 3,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "switch", delay: 2.2 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "lock", delay: 60 },
      unless: SCARES,
      actions: [
        { type: "lights", group: "op", on: true },
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
          title: "深夜の歯科医院",
          text: "翌朝、出勤した歯科医師は、診察台に残る手形に気づいた。\n深夜の急患など、受け付けていないはずなのに、受付のカルテにはひとり分の新しい名前があった。\n\n歯の数は、33本と書かれていた。",
        },
      ],
    })),
  ],
};
