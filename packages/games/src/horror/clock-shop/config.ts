import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「二時十四分」の演出データ。
 * 時計店の壁一面の掛け時計（フック clocksStop / clocksBack）、柱時計 grandfather と扉 gf-door・振り子 pendulum（フック pendulumStop）、
 * 修理台の懐中時計 pocketwatch、ガラス戸 shop-door と外のシャッター shutter、照明 group shop / bench / red。最後は柱時計の中の keeper。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "clock-shop",
  title: "二時十四分",
  intro: [
    "商店街の古い時計店。亡くなった祖父が、四十年前に修理に出したままの懐中時計があるという。",
    "閉店後に店主が「取りに来てください」と鍵を開けておいてくれた。店主の姿は見えない。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.2, 4] },
  fog: { color: [0.02, 0.015, 0.01], density: 0.025 },
  ambient: { intensity: 0.06, color: [1, 0.9, 0.75] },
  flashlight: {
    enabled: false,
    intensity: 0.45,
    angleDeg: 42,
    range: 9,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.06,
  droneLevel: 0.02,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "sound", sound: "step", at: [-3.3, 1.5, 3], volume: 0.15 },
        {
          type: "subtitle",
          text: "壁一面の時計が、少しずつずれた音で時を刻んでいる。柱時計の振り子がゆっくり揺れる。",
          duration: 6,
        },
        { type: "objective", text: "修理台の懐中時計を受け取る" },
      ],
    },
    {
      id: "take",
      when: { type: "interact", target: "pocketwatch", label: "懐中時計を手に取る", maxDistance: 2.2 },
      actions: [
        { type: "visible", target: "pocketwatch", visible: false },
        { type: "sound", sound: "chime", at: [0, 1, 4], volume: 0.4 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ずしりと重い。蓋を開けると、針は二時十四分で止まっていた。",
          duration: 5,
        },
      ],
    },
    {
      id: "take-auto",
      when: { type: "time", at: 45 },
      unless: ["take"],
      actions: [
        { type: "sound", sound: "chime", at: { node: "pocketwatch" }, volume: 0.5 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "修理台の懐中時計の蓋が、ぱちんと開いた。針は二時十四分。",
          duration: 5,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "stop",
      when: { type: "time", at: 75 },
      actions: [
        { type: "custom", name: "clocksStop" },
        { type: "drone", level: 0 },
        {
          type: "subtitle",
          text: "店じゅうの時計が、一斉に止まった。全部、二時十四分を指している。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "backward",
      when: { type: "time", at: 120 },
      actions: [
        { type: "custom", name: "clocksBack" },
        { type: "sound", sound: "rattle", at: [3.3, 1.6, 4], volume: 0.5 },
        { type: "sound", sound: "rattle", at: [-3.3, 1.6, 4], volume: 0.5 },
        {
          type: "subtitle",
          text: "かちかちかち。時計の針が、今度はすごい速さで逆に回り始めた。",
          duration: 5,
        },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "knock",
      when: { type: "time", at: 165 },
      actions: [
        { type: "custom", name: "pendulumStop" },
        { type: "sound", sound: "knock", at: { node: "grandfather" }, volume: 0.8 },
        { type: "sound", sound: "whisper", at: { node: "grandfather" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "柱時計の振り子が止まり、中から、こん、こん、とガラスを叩く音。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "move", target: "shutter", to: [0, 1.4, -0.2], duration: 5 },
        { type: "sound", sound: "rumble", at: [0, 2, -0.3], volume: 0.8 },
        { type: "lights", group: "shop", on: false },
        {
          type: "subtitle",
          text: "ガラス戸の外で、シャッターが下りていく。店主は「開けておく」と言ったのに。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "sound", sound: "slam", at: [0, 1, -0.2], volume: 0.8 },
        { type: "shake", intensity: 0.02, duration: 0.6 },
        { type: "flicker", duration: 1.2 },
        { type: "lights", group: "bench", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "on" },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "シャッターが閉まりきり、修理台の灯りも消えた。柱時計の文字盤だけが、ぼんやり白い。",
          duration: 6,
        },
        { type: "objective", text: "柱時計の扉を開ける" },
      ],
    },
    {
      id: "open",
      when: { type: "interact", target: "gf-door", label: "柱時計の扉を開ける", maxDistance: 2.4 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "door", door: "gf-door", state: "open" },
        { type: "visible", target: "pendulum", visible: false },
        { type: "visible", target: "keeper", visible: true },
        { type: "sound", sound: "creak", at: { node: "gf-door" }, volume: 0.7 },
        { type: "sound", sound: "bell", at: { node: "grandfather" }, volume: 0.9 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ぼーん。二時を打つ音とともに扉が開いた。中に、白髪の老人が立っている。「……お待たせしました」",
          duration: 6,
        },
      ],
    },
    {
      id: "open-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["open", ...SCARES],
      actions: [
        { type: "door", door: "gf-door", state: "open" },
        { type: "visible", target: "pendulum", visible: false },
        { type: "visible", target: "keeper", visible: true },
        { type: "sound", sound: "bell", at: { node: "grandfather" }, volume: 0.9 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ぼーん。柱時計が鳴り、扉がひとりでに開いた。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "keeper", maxAngleDeg: 20, maxDistance: 12 },
      requiresAny: ["open", "open-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "keeper" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "keeper" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "二時十四分",
          text: "時計店の店主は、四十年前の夜、二時十四分に柱時計の前で亡くなっていた。\n翌朝、修理台には動き出した懐中時計と、新しい預かり札が一枚。受取人の欄に、あなたの名前。",
        },
      ],
    })),
  ],
};
