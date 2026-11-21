import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「懺悔室」の演出データ。
 * 入口 entry-door（z=0）、調べる対象 confession-door、人影 figure / behind。
 * 照明グループ front（手前）/ back（奥）。
 */
const SCARES = ["open-confession", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "church-confession",
  title: "懺悔室",
  intro: ["夜の教会で、戸締まりの確認を頼まれた。", "長椅子の列の向こうで、蝋燭が一本だけ揺れている。"],
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
        { type: "subtitle", text: "冷たい石の床。ステンドグラスが月明かりで暗く光る。", duration: 5 },
        { type: "objective", text: "礼拝堂の戸締まりを確認する" },
      ],
    },
    {
      id: "anomaly-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "whisper", at: [4.8, 1.2, 15], volume: 0.5 },
        { type: "subtitle", text: "懺悔室から、低いささやき声が聞こえる。誰もいないはずなのに。", duration: 6 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 78 },
        { type: "subtitle", text: "灯りが瞬いた。長椅子の列の間を、足音が通り過ぎた。", duration: 5 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "flicker", duration: 0.4 },
        { type: "subtitle", text: "祭壇の前に、黒い服の人が祈っていた。", duration: 4 },
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
        { type: "subtitle", text: "正面の扉が閉まり、閂の落ちる音がした。", duration: 5 },
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
        { type: "objective", text: "懺悔室の扉を確かめる" },
        { type: "subtitle", text: "手前の灯りが落ちた。懺悔室の扉の隙間から、声が呼んでいる。「次の方、どうぞ」", duration: 7 },
      ],
    },
    {
      id: "open-confession",
      when: { type: "interact", target: "confession-door", label: "懺悔室の扉を開ける", maxDistance: 2.6 },
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
          title: "懺悔室",
          text: "翌朝、神父は懺悔室の記録帳を開いた。\n昨夜の最後の告白者の欄に、あなたの名前と、まだ犯していない罪が書かれていた。",
        },
      ],
    })),
  ],
};
