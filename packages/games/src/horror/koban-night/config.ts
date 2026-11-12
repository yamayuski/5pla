import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「巡回中」の演出データ。
 * 電話 phone（机の上）、無線機 radio（北東）、掲示板 poster-a/poster-b（西壁）、
 * 入口 front-door、仮眠室の戸 back-door、照明 group koban / rest、警官 officer（机の向こう）。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "koban-night",
  title: "巡回中",
  intro: [
    "雨が強くなってきた。最終電車を逃した帰り道、明かりのついた交番に飛び込んだ。",
    "「ただいま巡回中」の札。机の上の電話だけが、静かに光っている。",
  ],
  spawn: { position: [-1.4, 1.6, 1.0], lookAt: [0, 1.2, 3.4] },
  fog: { color: [0.02, 0.025, 0.03], density: 0.012 },
  ambient: { intensity: 0.1, color: [0.7, 0.75, 0.9] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 10, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "蛍光灯の唸りと、雨音。巡回の警官が戻るまで待たせてもらおう。", duration: 5 },
        { type: "objective", text: "警官が戻るのを待つ" },
      ],
    },
    {
      id: "ring",
      when: { type: "time", at: 25 },
      actions: [
        { type: "custom", name: "phoneShake" },
        { type: "subtitle", text: "机の電話が鳴り出した。誰も出る気配がない。", duration: 4 },
        { type: "objective", text: "電話に出る" },
      ],
    },
    {
      id: "phone-pick",
      when: { type: "interact", target: "phone", label: "受話器を取る", maxDistance: 2.4 },
      requires: ["ring"],
      actions: [
        { type: "sound", sound: "static", at: { node: "phone" }, volume: 0.5 },
        { type: "sound", sound: "whisper", at: { node: "phone" }, volume: 0.5 },
        { type: "subtitle", text: "受話器「……交番ですか。いま、そこの机の向こうに、誰か座っていませんか」", duration: 6 },
        { type: "objective", text: "" },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "phone-auto",
      when: { type: "time", at: 60 },
      unless: ["phone-pick"],
      actions: [
        { type: "sound", sound: "static", at: { node: "phone" }, volume: 0.5 },
        { type: "subtitle", text: "呼び出し音が止まった。受話器の向こうで、誰かが息をしている。", duration: 5 },
        { type: "objective", text: "" },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "poster-swap",
      when: { type: "time", at: 95 },
      actions: [
        { type: "visible", target: "poster-a", visible: false },
        { type: "visible", target: "poster-b", visible: true },
        { type: "flicker", duration: 0.5 },
        { type: "subtitle", text: "掲示板の手配書の文字が、いつの間にか変わっている。", duration: 5 },
      ],
    },
    {
      id: "back-open",
      when: { type: "time", at: 140 },
      actions: [
        { type: "door", door: "back-door", state: "open" },
        { type: "sound", sound: "creak", at: { node: "back-door" }, volume: 0.7 },
        { type: "sound", sound: "footsteps", at: [1.8, 1, 7.5], volume: 0.5 },
        { type: "subtitle", text: "仮眠室の戸が、ひとりでに開いた。奥で畳を踏む音がする。", duration: 5 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "radio-call",
      when: { type: "time", at: 185 },
      actions: [
        { type: "sound", sound: "static", at: { node: "radio" }, volume: 0.7 },
        { type: "sound", sound: "whisper", at: { node: "radio" }, volume: 0.6 },
        { type: "subtitle", text: "無線「……各局。交番内に、本官以外の者が一名。繰り返す、本官は、すでに……」", duration: 7 },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 215 },
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "door", door: "front-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "lights", group: "koban", on: false },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "入口の戸が叩きつけられるように閉まり、蛍光灯が落ちた。", duration: 5 },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.4 },
        { type: "lights", group: "rest", on: false },
        { type: "flashlight", state: "on" },
        { type: "fog", density: 0.04, duration: 5 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 108 },
        { type: "subtitle", text: "ガラスの向こうは雨で何も見えない。戸は、びくともしない。", duration: 6 },
        { type: "objective", text: "入口を調べる" },
      ],
    },
    {
      id: "officer-show",
      when: { type: "after", trigger: "blackout", delay: 14 },
      actions: [
        { type: "visible", target: "officer", visible: true },
        { type: "sound", sound: "breath", at: { node: "officer" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "机の向こうの椅子に、制服の男が座っている。いつからそこにいた？", duration: 6 },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "officer", maxAngleDeg: 22, maxDistance: 10 },
      requires: ["officer-show"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "officer" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "officer-show", delay: 25 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "officer" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "officer" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "巡回中",
          text: "翌朝、無人の交番で、机に伏せた状態の制服の男性が見つかった。\n死後数年。日誌の最後の行には、昨夜の日付で「来訪者一名、待機中」とあった。",
        },
      ],
    })),
  ],
};
