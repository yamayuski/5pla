import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「質草」の演出データ。
 * 入口 entry-door（z=0）、調べる対象 safe、人影 figure / behind。
 * 照明グループ front（手前）/ back（奥）。
 */
const SCARES = ["open-safe", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "pawn-shop",
  title: "質草",
  intro: ["閉店後の質屋で、棚卸しを手伝っている。", "ガラスケースの中の品に、一つ一つ質札が付いている。"],
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
        { type: "subtitle", text: "古い時計の針の音が、ばらばらに響いている。", duration: 5 },
        { type: "objective", text: "ガラスケースの質札を台帳と照合する" },
      ],
    },
    {
      id: "anomaly-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "bell", at: [-3, 1, 6], volume: 0.5 },
        { type: "subtitle", text: "ケースの中の腕時計が、すべて同じ時刻で止まった。", duration: 6 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 78 },
        { type: "subtitle", text: "照明が瞬いた。台帳のページが、ひとりでにめくれた。", duration: 5 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "flicker", duration: 0.4 },
        { type: "subtitle", text: "カウンターの奥に、前の店主らしき人影が立っていた。", duration: 4 },
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
        { type: "subtitle", text: "入口のシャッターが降り、鍵がかかった。", duration: 5 },
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
        { type: "objective", text: "奥の金庫を確かめる" },
        { type: "subtitle", text: "手前の灯りが落ちた。台帳の最後に、見覚えのある名前。奥の金庫のダイヤルが、ひとりでに回り出す。", duration: 7 },
      ],
    },
    {
      id: "open-safe",
      when: { type: "interact", target: "safe", label: "金庫を開ける", maxDistance: 2.6 },
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
          title: "質草",
          text: "翌朝、店主は台帳の最後に新しい一行を見つけた。\n「質草：一名。流れ期限なし」。金庫の中の質札には、あなたの名前が書かれていた。",
        },
      ],
    })),
  ],
};
