import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「最後の一周」の演出データ。
 * 入口 entry-door（z=0）、調べる対象 center-ice、人影 figure / behind。
 * 照明グループ front（手前）/ back（奥）。
 */
const SCARES = ["crack", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "night-skate-rink",
  title: "最後の一周",
  intro: ["閉館後のスケートリンクで、最後の施錠点検に来た。", "氷の上は、磨いたように光っている。"],
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
        { type: "subtitle", text: "息が白い。遠くで、氷を削る音がかすかに続いている。", duration: 5 },
        { type: "objective", text: "リンクの周りを一周して点検する" },
      ],
    },
    {
      id: "anomaly-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "rumble", at: [0, 0.5, 10], volume: 0.5 },
        { type: "subtitle", text: "氷の上に、さっきはなかった足跡が一周ぶん増えている。", duration: 6 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 78 },
        { type: "subtitle", text: "照明が瞬いた。ブレードが氷を滑る音が、背後を通り過ぎた。", duration: 5 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "flicker", duration: 0.4 },
        { type: "subtitle", text: "リンクの反対側に、スケート靴の人影が立っていた。", duration: 4 },
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
        { type: "subtitle", text: "出入口のゲートが閉まり、ロックされた。", duration: 5 },
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
        { type: "objective", text: "リンク中央の氷を確かめる" },
        { type: "subtitle", text: "手前の灯りが落ちた。リンク中央の氷が、ひび割れる音を立てる。", duration: 7 },
      ],
    },
    {
      id: "crack",
      when: { type: "interact", target: "center-ice", label: "中央の氷をのぞく", maxDistance: 2.6 },
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
          title: "最後の一周",
          text: "翌朝、整氷係はリンクの中央に凍りついたスケート靴を見つけた。\n靴の中には、昨夜の点検表を握ったあなたの手袋が残っていた。",
        },
      ],
    })),
  ],
};
