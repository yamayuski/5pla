import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「仕込みの時間」の演出データ。
 * 入口 entry-door（z=0）、調べる対象 oven-door、人影 figure / behind。
 * 照明グループ front（手前）/ back（奥）。
 */
const SCARES = ["open-oven", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "closed-bakery",
  title: "仕込みの時間",
  intro: ["午前三時のパン屋で、一人で仕込みを始める。", "作業台の粉が、白く舞っている。"],
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
        { type: "subtitle", text: "小麦と酵母のにおい。発酵器の中でゆっくり何かが膨らむ。", duration: 5 },
        { type: "objective", text: "生地をこねて成形する" },
      ],
    },
    {
      id: "anomaly-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "thud", at: [-3, 0.5, 7], volume: 0.5 },
        { type: "subtitle", text: "麺棒が、作業台から床へ転がった。", duration: 6 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 78 },
        { type: "subtitle", text: "照明が瞬いた。発酵器の生地が、人の手の形に膨らんだ。", duration: 5 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "flicker", duration: 0.4 },
        { type: "subtitle", text: "粉まみれの人影が、ラックの陰に立っていた。", duration: 4 },
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
        { type: "subtitle", text: "搬入口のシャッターが降り、鍵が掛かった。", duration: 5 },
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
        { type: "objective", text: "窯の扉の奥を確かめる" },
        { type: "subtitle", text: "手前の灯りが落ちた。窯の扉の奥から、焼ける音と呻き声がする。", duration: 7 },
      ],
    },
    {
      id: "open-oven",
      when: { type: "interact", target: "oven-door", label: "窯の扉を開ける", maxDistance: 2.6 },
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
          title: "仕込みの時間",
          text: "翌朝、開店前の店に並んだパンは、どれも人の手の形をしていた。\n窯の前に、あなたのエプロンだけが落ちていた。",
        },
      ],
    })),
  ],
};
