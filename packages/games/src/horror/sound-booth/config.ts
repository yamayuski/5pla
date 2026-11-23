import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「録り直し」の演出データ。
 * 入口 entry-door（z=0）、調べる対象 booth-door、人影 figure / behind。
 * 照明グループ front（手前）/ back（奥）。
 */
const SCARES = ["open-booth", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "sound-booth",
  title: "録り直し",
  intro: ["夜のスタジオで、ナレーションの録り直しをしている。", "防音の壁が、外の音を完全に消している。"],
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
        { type: "subtitle", text: "機材の熱と埃のにおい。防音室は耳が詰まるほど静かだ。", duration: 5 },
        { type: "objective", text: "原稿を読んで録り直す" },
      ],
    },
    {
      id: "anomaly-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "thud", at: [-3, 0.5, 7], volume: 0.5 },
        { type: "subtitle", text: "譜面台が、ひとりでに倒れた。", duration: 6 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 78 },
        { type: "subtitle", text: "照明が瞬いた。再生した声の後ろで、誰かが息を吸った。", duration: 5 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "flicker", duration: 0.4 },
        { type: "subtitle", text: "調整室のガラスの陰に、ヘッドホンの人影が立っていた。", duration: 4 },
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
        { type: "subtitle", text: "スタジオの扉が閉まり、録音中のランプが点いた。", duration: 5 },
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
        { type: "objective", text: "録音ブースの扉を確かめる" },
        { type: "subtitle", text: "手前の灯りが落ちた。ブースの扉の奥から、あなたの声が原稿の続きを読んでいる。", duration: 7 },
      ],
    },
    {
      id: "open-booth",
      when: { type: "interact", target: "booth-door", label: "ブースの扉を開ける", maxDistance: 2.6 },
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
          title: "録り直し",
          text: "翌朝、ミキサーは録音データに数分の無音を見つけた。\nその最後に、小さく「録り直し」と、あなたの声が入っていた。",
        },
      ],
    })),
  ],
};
