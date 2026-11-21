import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「点検は二人一組」の演出データ。
 * 入口 entry-door（z=0）、調べる対象 signal-box、人影 figure / behind。
 * 照明グループ front（手前）/ back（奥）。
 */
const SCARES = ["open-signal", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "track-inspection",
  title: "点検は二人一組",
  intro: ["終電後の地下鉄で、保線の夜間点検に入った。", "相棒は「先に行く」と言ったきり、姿が見えない。"],
  spawn: { position: [0, 1.6, 2], lookAt: [0, 1.4, 8] },
  fog: { color: [0.03, 0.03, 0.04], density: 0.02 },
  ambient: { intensity: 0.2, color: [0.85, 0.88, 0.95] },
  flashlight: { enabled: false, intensity: 0.7, angleDeg: 42, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "トンネルの風が、ゆっくりと吹き抜けていく。遠くで水の滴る音。", duration: 5 },
        { type: "objective", text: "通路沿いの設備を点検して相棒を探す" },
      ],
    },
    {
      id: "anomaly-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "static", at: [0, 1.5, 6], volume: 0.5 },
        { type: "subtitle", text: "無線に雑音。「……そっち、見える？」誰の声かわからない。", duration: 6 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 78 },
        { type: "subtitle", text: "照明が瞬いた。線路の向こうから、足音が一つ近づいてくる。", duration: 5 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "flicker", duration: 0.4 },
        { type: "subtitle", text: "通路の奥に、作業服の人影が背を向けて立っていた。", duration: 4 },
      ],
    },
    {
      id: "glimpse-gone",
      when: { type: "after", trigger: "glimpse", delay: 1.2 },
      actions: [{ type: "visible", target: "behind", visible: false }],
    },
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "entry-door", state: "slam" },
        { type: "door", door: "entry-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "通路の防火扉が閉まり、ロックされた。", duration: 5 },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "front", on: false },
        { type: "flashlight", state: "on" },
        { type: "fog", density: 0.05, duration: 5 },
        { type: "drone", level: 0.3 },
        { type: "heartbeat", bpm: 104 },
        { type: "sound", sound: "whisper", at: "behind", volume: 0.6 },
        { type: "objective", text: "奥の信号機の箱を確かめる" },
        { type: "subtitle", text: "手前の灯りが落ちた。無線が告げる。「信号機の箱を開けてくれ。俺はそこにいる」", duration: 7 },
      ],
    },
    {
      id: "open-signal",
      when: { type: "interact", target: "signal-box", label: "信号機の箱を開ける", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "点検は二人一組",
          text: "翌朝、保線区の点呼で係長が言った。「昨夜の入線は、あなた一人です」\n信号機の箱の中から、相棒のヘルメットが見つかった。内側に、あなたの名前が書いてあった。",
        },
      ],
    })),
  ],
};
