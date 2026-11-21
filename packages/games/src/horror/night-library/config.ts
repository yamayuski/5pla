import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「返却期限」の演出データ。
 * 入口 entry-door（z=0）、調べる対象 return-box、人影 figure / behind。
 * 照明グループ front（手前）/ back（奥）。
 */
const SCARES = ["open-box", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "night-library",
  title: "返却期限",
  intro: ["閉館後の図書館で、返却本の整理を任された。", "返却ポストのほうから、紙の擦れる音がする。"],
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
        { type: "subtitle", text: "静まり返った書架。カウンターの時計が、閉館時刻で止まっている。", duration: 5 },
        { type: "objective", text: "書架の返却本を戻して回る" },
      ],
    },
    {
      id: "anomaly-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "thud", at: [4.8, 1, 15], volume: 0.5 },
        { type: "subtitle", text: "返却ポストに、本の落ちる音。もう誰も入れないはずなのに。", duration: 6 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 78 },
        { type: "subtitle", text: "照明が瞬いた。書架の向こうで、ページをめくる音がした。", duration: 5 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "flicker", duration: 0.4 },
        { type: "subtitle", text: "書架の隙間から、白い顔がこちらを見ていた。", duration: 4 },
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
        { type: "subtitle", text: "入口の自動扉が閉まり、ロックの音がした。", duration: 5 },
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
        { type: "objective", text: "返却ポストの中を確かめる" },
        { type: "subtitle", text: "手前の灯りが落ちた。ポストの口から、白い指が一本はみ出して動いている。", duration: 7 },
      ],
    },
    {
      id: "open-box",
      when: { type: "interact", target: "return-box", label: "返却ポストを開ける", maxDistance: 2.6 },
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
          title: "返却期限",
          text: "翌朝、返却ポストの中から一冊の貸出カードが見つかった。\n最後の借り手の欄に、あなたの名前と「返却期限：本日」の印があった。",
        },
      ],
    })),
  ],
};
