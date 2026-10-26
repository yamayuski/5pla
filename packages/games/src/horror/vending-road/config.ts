import type { HorrorConfig } from "./kit/types";

/**
 * 「自販機の灯り」の演出データ。
 * 夜の田舎道（x=-2.5〜2.5, z=-3〜34）。右手（東）の路肩に自販機が3台（vm-0〜2 / z=8, 18, 28）。
 * 最後の vm-2 で飲み物を買うと、取り出し口から女の手が伸び、そのまま飛び出す。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "vending-road",
  title: "自販機の灯り",
  intro: [
    "終バスを逃して、バス停まで歩いて帰る夜道。",
    "道沿いには自動販売機が点々と光っているだけだ。",
  ],
  spawn: { position: [0, 1.6, -1.5], lookAt: [0, 1.5, 12] },
  fog: { color: [0.03, 0.035, 0.05], density: 0.04 },
  ambient: { intensity: 0.06, color: [0.75, 0.8, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 38,
    range: 12,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.085,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 自販機で一息 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "虫の声と、遠くの踏切の音。最初の自販機の白い灯りが、道を照らしている。",
        },
        { type: "objective", text: "自販機で温かい飲み物を買う" },
      ],
    },
    {
      id: "buy-0",
      when: {
        type: "interact",
        target: "vm-0",
        label: "ボタンを押す",
        maxDistance: 2.4,
      },
      unless: ["dark"],
      actions: [
        { type: "sound", sound: "thud", at: { node: "vm-0" }, volume: 0.8 },
        {
          type: "subtitle",
          text: "ガコン。取り出し口の缶は「あたたか〜い」のはずなのに、氷みたいに冷たかった。",
          duration: 5,
        },
        { type: "objective", text: "家の方へ歩く" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "drops",
      when: { type: "time", at: 90 },
      actions: [
        { type: "sound", sound: "thud", at: { node: "vm-1" }, volume: 0.9 },
        { type: "sound", sound: "thud", at: { node: "vm-1" }, volume: 0.9 },
        { type: "sound", sound: "thud", at: { node: "vm-1" }, volume: 1 },
        { type: "heartbeat", bpm: 74 },
        {
          type: "subtitle",
          text: "二台目の自販機が、誰も触っていないのに缶を吐き出し続けている。全部の商品が「売切」。",
          duration: 5,
        },
      ],
    },
    {
      id: "behind",
      when: { type: "time", at: 130 },
      actions: [
        { type: "lights", group: "vm-0", on: false },
        { type: "sound", sound: "step", at: "behind", volume: 0.6 },
        {
          type: "subtitle",
          text: "背後の最初の自販機の灯りが消えた。濡れた足音が、一つだけ近づいてくる。",
          duration: 5,
        },
      ],
    },
    {
      id: "hand-1",
      when: { type: "time", at: 170 },
      actions: [
        { type: "visible", target: "hand-1", visible: true },
        { type: "sound", sound: "rattle", at: { node: "vm-1" }, volume: 0.8 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "二台目の取り出し口の蓋が、内側から押し開けられている。白い指が、縁にかかった。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 灯りが消える ----
    {
      id: "dark",
      when: { type: "time", at: 205 },
      actions: [
        { type: "lights", group: "vm-1", on: false },
        { type: "visible", target: "hand-1", visible: false },
        { type: "flashlight", state: "dim" },
        { type: "fog", density: 0.06, duration: 4 },
        { type: "flicker", duration: 1.2 },
        { type: "drone", level: 0.4 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "二台目の灯りも消えた。前方で光っているのは、最後の一台だけ。道は、そこまでしか見えない。",
          duration: 6,
        },
        { type: "objective", text: "最後の自販機に近づく" },
      ],
    },
    // ---- 4〜5分: 最後の一台 ----
    {
      id: "buy-2",
      when: {
        type: "interact",
        target: "vm-2",
        label: "ボタンを押す",
        maxDistance: 2.4,
      },
      requires: ["dark"],
      unless: SCARES,
      actions: [
        { type: "sound", sound: "thud", at: { node: "vm-2" }, volume: 1 },
        { type: "visible", target: "hand-2", visible: true },
        { type: "heartbeat", bpm: 140 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ガコン。取り出し口の蓋が、ゆっくり持ち上がる。暗い隙間から、白い指が這い出してくる。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "buy-2", delay: 1.8 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "dark", delay: 60 },
      unless: [...SCARES, "buy-2"],
      actions: [
        { type: "sound", sound: "thud", at: { node: "vm-2" }, volume: 1 },
        { type: "jumpscare", figure: "woman" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "自販機の灯り",
          text: "翌朝、道沿いの三台の自動販売機は、どれも電源が抜かれたままだった。\nそのうち一台の取り出し口には、昭和の頃の古い缶が一本、温かいまま残っていたという。",
        },
      ],
    })),
  ],
};
