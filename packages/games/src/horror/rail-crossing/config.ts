import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「開かずの踏切」の演出データ。
 * 線路は z=10 を東西に走る。遮断機 gate-s/gate-n（フック gateDown/gateUp）、押しボタン button、
 * 北の柵扉 fence-door、遠景の人影 far（x=-9）、線路上の人影 girl（x=0, z=10）、警報灯 group alarm、街灯 group street。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "rail-crossing",
  title: "開かずの踏切",
  intro: [
    "終電のあと、近道のために古い踏切を渡る。",
    "この踏切では、昔から「渡りきる前に数を数えるな」と言われている。",
  ],
  spawn: { position: [0, 1.6, 1.5], lookAt: [0, 1.4, 12] },
  fog: { color: [0.02, 0.022, 0.03], density: 0.035 },
  ambient: { intensity: 0.07, color: [0.7, 0.75, 0.95] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "虫の声と、遠くの犬。電車の気配はない。", duration: 5 },
        { type: "objective", text: "踏切を渡って北の道へ" },
      ],
    },
    {
      id: "alarm",
      when: { type: "time", at: 55 },
      actions: [
        { type: "custom", name: "gateDown" },
        { type: "sound", sound: "buzz", at: [0, 3, 10], volume: 0.7 },
        { type: "lights", group: "alarm", on: true },
        { type: "heartbeat", bpm: 76 },
        { type: "subtitle", text: "警報機が鳴り出した。遮断機が降りる。……電車の音は、しない。", duration: 6 },
      ],
    },
    {
      id: "far-glimpse",
      when: { type: "time", at: 105 },
      actions: [
        { type: "visible", target: "far", visible: true },
        { type: "flicker", duration: 0.5 },
        { type: "subtitle", text: "線路の遠くに、白い服の人が立っている。こちらを向いて。", duration: 5 },
      ],
    },
    {
      id: "far-gone",
      when: { type: "after", trigger: "far-glimpse", delay: 1.6 },
      actions: [{ type: "visible", target: "far", visible: false }],
    },
    {
      id: "silence",
      when: { type: "time", at: 150 },
      actions: [
        { type: "custom", name: "gateUp" },
        { type: "lights", group: "alarm", on: false },
        { type: "drone", level: 0.12 },
        { type: "sound", sound: "whisper", at: "behind", volume: 0.5 },
        { type: "subtitle", text: "警報が止んだ。遮断機が上がる。誰かが、後ろで数を数えている。「……いち、にい」", duration: 6 },
      ],
    },
    {
      id: "lock",
      when: { type: "time", at: 195 },
      actions: [
        { type: "door", door: "fence-door", state: "slam" },
        { type: "door", door: "fence-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 22], volume: 0.8 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "北の扉が勝手に閉まった。押しボタンに「非常停止」と書いてある。", duration: 5 },
        { type: "objective", text: "押しボタンで非常停止する" },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.6 },
        { type: "lights", group: "street", on: false },
        { type: "flashlight", state: "on" },
        { type: "custom", name: "gateDown" },
        { type: "lights", group: "alarm", on: true },
        { type: "fog", density: 0.07, duration: 5 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        { type: "subtitle", text: "街灯が落ちた。警報の赤だけが線路を照らす。「……さん、しい」", duration: 6 },
      ],
    },
    {
      id: "press",
      when: { type: "interact", target: "button", label: "非常停止ボタンを押す", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "sound", sound: "buzz", at: { node: "button" }, volume: 0.6 },
        { type: "visible", target: "girl", visible: true },
        { type: "sound", sound: "breath", at: { node: "girl" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "ボタンを押した途端、警報が止んだ。線路の真ん中に、女の子が立っている。", duration: 6 },
      ],
    },
    {
      id: "press-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["press", ...SCARES],
      actions: [
        { type: "visible", target: "girl", visible: true },
        { type: "sound", sound: "breath", at: { node: "girl" }, volume: 0.9 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "警報が突然止んだ。線路の真ん中に、女の子が立っている。「……ご、ろく」", duration: 6 },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "look", target: "girl", maxAngleDeg: 20, maxDistance: 14 },
      requiresAny: ["press", "press-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "girl" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "girl" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "開かずの踏切",
          text: "翌朝、踏切の脇に懐中電灯が落ちていた。\n警報機のカウンターは、一晩で数え終わったように「10」を示していた。",
        },
      ],
    })),
  ],
};
