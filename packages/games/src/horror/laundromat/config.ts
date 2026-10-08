import type { HorrorConfig } from "./kit/types";

/**
 * 「乾燥機の中」の演出データ。
 * 店内は x=-4〜4, z=-6〜6。入口（ドア）は南 z=-6、洗濯機は西壁、乾燥機は東壁（z=-3,-1.5,0,1.5,3）。
 * 3 番乾燥機（dryer-3, z=0）が今夜の「あれ」の住処。
 */
const SCARES = ["scare", "scare-late", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "laundromat",
  title: "乾燥機の中",
  intro: [
    "深夜一時、二十四時間営業のコインランドリー。",
    "洗濯物はあと四十分で終わる。ほかに客はいない。",
  ],
  spawn: { position: [1.2, 1.6, -3.6], lookAt: [-2, 1.4, -2] },
  fog: { color: [0.02, 0.025, 0.025], density: 0.012 },
  ambient: { intensity: 0.1, color: [0.8, 0.9, 0.85] },
  flashlight: {
    enabled: false,
    intensity: 1.0,
    angleDeg: 48,
    range: 12,
    color: [0.92, 0.97, 1],
  },
  walkSpeed: 0.09,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 退屈な待ち時間 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "洗濯機のランプは「あと38分」。……漫画でも持ってくればよかった。",
        },
        { type: "objective", text: "1番の洗濯機に洗濯物を入れる" },
        { type: "sound", sound: "buzz", at: [0, 2.7, 0], volume: 0.25 },
      ],
    },
    {
      id: "start-wash",
      when: {
        type: "interact",
        target: "washer-1",
        label: "洗濯機を回す",
        maxDistance: 2.4,
      },
      unless: ["wash-done"],
      actions: [
        { type: "custom", name: "washer1On" },
        {
          type: "sound",
          sound: "rumble",
          at: { node: "washer-1" },
          volume: 0.35,
        },
        { type: "subtitle", text: "ゴウン、と洗濯機が回りはじめた。" },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "wash-auto",
      when: { type: "time", at: 40 },
      unless: ["start-wash"],
      actions: [
        { type: "custom", name: "washer1On" },
        {
          type: "sound",
          sound: "rumble",
          at: { node: "washer-1" },
          volume: 0.35,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "dryer-start",
      when: { type: "time", at: 70 },
      actions: [
        { type: "custom", name: "dryer3On" },
        {
          type: "sound",
          sound: "rumble",
          at: { node: "dryer-3" },
          volume: 0.45,
        },
        {
          type: "subtitle",
          text: "3番の乾燥機が、勝手に回りはじめた。……誰も入れていないのに。",
          duration: 4,
        },
        { type: "objective", text: "3番の乾燥機を見る" },
      ],
    },
    {
      id: "dryer-peek",
      when: {
        type: "look",
        target: "dryer-3",
        maxAngleDeg: 22,
        maxDistance: 7,
      },
      requires: ["dryer-start"],
      actions: [
        { type: "visible", target: "handprint", visible: true },
        { type: "sound", sound: "knock", at: { node: "dryer-3" }, volume: 0.9 },
        {
          type: "subtitle",
          text: "窓ガラスの内側に、濡れた手形。",
          duration: 3.5,
        },
        { type: "heartbeat", bpm: 70 },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "tube-a-out",
      when: { type: "time", at: 115 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "lights", group: "tube-a", on: false },
        { type: "sound", sound: "buzz", at: [0, 2.7, -3], volume: 0.6 },
        { type: "subtitle", text: "入口側の蛍光灯が、一本落ちた。" },
      ],
    },
    {
      id: "wet-steps",
      when: { type: "time", at: 140 },
      actions: [
        { type: "visible", target: "footprints", visible: true },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        {
          type: "subtitle",
          text: "濡れた足跡が、入口から乾燥機まで続いている。……さっきまで、なかった。",
          duration: 4.5,
        },
        { type: "drone", level: 0.25 },
      ],
    },
    {
      id: "washers-roar",
      when: { type: "time", at: 170 },
      actions: [
        { type: "custom", name: "allWashersOn" },
        { type: "sound", sound: "rumble", at: "player", volume: 0.8 },
        { type: "heartbeat", bpm: 84 },
        {
          type: "subtitle",
          text: "洗濯機が全部、同時に唸りだした。",
          duration: 3.5,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "door-lock",
      when: { type: "time", at: 190 },
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "flicker", duration: 1.6 },
        { type: "lights", group: "tube-b", on: false },
        { type: "lights", group: "tube-c", on: false },
        { type: "flashlight", state: "dim" },
        { type: "drone", level: 0.55 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "入口のドアが勝手に閉まった。押しても引いても開かない。",
          duration: 4.5,
        },
        { type: "objective", text: "出口を探す" },
      ],
    },
    {
      id: "whisper",
      when: { type: "after", trigger: "door-lock", delay: 20 },
      actions: [
        {
          type: "sound",
          sound: "whisper",
          at: { node: "dryer-3" },
          volume: 0.9,
        },
        { type: "subtitle", text: "『……おせんたく、おわったよ』", duration: 4 },
      ],
    },
    {
      id: "washer-done",
      when: { type: "after", trigger: "whisper", delay: 10 },
      actions: [
        {
          type: "sound",
          sound: "chime",
          at: { node: "washer-1" },
          volume: 0.8,
        },
        {
          type: "subtitle",
          text: "1番の洗濯機が終了ブザーを鳴らした。まだ十分も経っていないのに。",
          duration: 4.5,
        },
        { type: "objective", text: "洗濯物を取り出す" },
        { type: "custom", name: "allWashersOff" },
      ],
    },
    {
      id: "wash-done",
      when: { type: "after", trigger: "washer-done", delay: 0.1 },
      actions: [],
    },
    {
      id: "washer-open",
      when: {
        type: "interact",
        target: "washer-1",
        label: "洗濯物を取り出す",
        maxDistance: 2.4,
      },
      requires: ["wash-done"],
      actions: [
        {
          type: "sound",
          sound: "creak",
          at: { node: "washer-1" },
          volume: 0.6,
        },
        {
          type: "subtitle",
          text: "中身は空だった。かわりに、長い濡れた髪が絡みついている。",
          duration: 4.5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "dryer-stop",
      when: { type: "after", trigger: "washer-done", delay: 20 },
      actions: [{ type: "custom", name: "dryer3Stop" }],
    },
    // ---- 4〜5分: 3番乾燥機 ----
    {
      id: "silence",
      when: { type: "after", trigger: "dryer-stop", delay: 0.1 },
      actions: [
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 118 },
        { type: "lights", group: "dryer-glow", on: true },
        {
          type: "subtitle",
          text: "すべての機械が止まった。3番の乾燥機だけが、中から光っている。",
          duration: 4.5,
        },
        { type: "objective", text: "3番の乾燥機を見る" },
      ],
    },
    {
      id: "dryer-knock",
      when: { type: "after", trigger: "silence", delay: 8 },
      actions: [
        { type: "sound", sound: "knock", at: { node: "dryer-3" }, volume: 1 },
        { type: "sound", sound: "knock", at: { node: "dryer-3" }, volume: 1 },
      ],
    },
    {
      id: "scare",
      when: {
        type: "look",
        target: "dryer-3",
        maxAngleDeg: 28,
        maxDistance: 7,
      },
      requires: ["dryer-knock"],
      unless: SCARES,
      actions: [
        { type: "custom", name: "dryer3Burst" },
        { type: "jumpscare", figure: "drowned" },
      ],
    },
    {
      id: "scare-late",
      when: { type: "after", trigger: "dryer-knock", delay: 30 },
      unless: SCARES,
      actions: [
        { type: "custom", name: "dryer3Burst" },
        { type: "jumpscare", figure: "drowned" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "drowned" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "乾燥機の中",
          text: "翌朝、店長が3番の乾燥機から、ぐっしょり濡れた長い髪を取り出した。\nその機械は、先月から故障中の貼り紙が出ていたという。\n\n洗濯機の中には、持ち主のいない洗濯物が、まだ回っていた。",
        },
      ],
    })),
  ],
};
