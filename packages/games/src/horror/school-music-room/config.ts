import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「三小節目」の演出データ。
 * 入口 entry-door（z=0）、調べる対象 piano-keys、人影 figure / behind。
 * 照明グループ front（手前）/ back（奥）。
 */
const SCARES = ["touch", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "school-music-room",
  title: "三小節目",
  intro: ["忘れ物を取りに、夜の音楽室へ入った。", "グランドピアノの蓋が、少しだけ開いている。"],
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
        { type: "subtitle", text: "ベートーヴェンの肖像が、じっとこちらを見ている。", duration: 5 },
        { type: "objective", text: "机の上の楽譜を探す" },
      ],
    },
    {
      id: "anomaly-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 1, 14], volume: 0.5 },
        { type: "subtitle", text: "ピアノが、二小節だけ鳴った。そしてまた、同じ二小節。", duration: 6 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 78 },
        { type: "subtitle", text: "照明が瞬いた。鳴り止んだピアノの前で、椅子が引かれる音。", duration: 5 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "flicker", duration: 0.4 },
        { type: "subtitle", text: "ピアノの前に、制服の人影が座っていた。", duration: 4 },
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
        { type: "subtitle", text: "音楽室の扉が閉まり、鍵がかかった。", duration: 5 },
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
        { type: "objective", text: "ピアノの鍵盤を確かめる" },
        { type: "subtitle", text: "手前の灯りが落ちた。ピアノが三小節目を弾き始めた。続きを知っている人にしか弾けない曲。", duration: 7 },
      ],
    },
    {
      id: "touch",
      when: { type: "interact", target: "piano-keys", label: "ピアノの鍵盤に触れる", maxDistance: 2.6 },
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
          title: "三小節目",
          text: "翌朝、音楽の先生がピアノの蓋を開けた。\n鍵盤の上に、まだ温かい指の跡が、十本ぶん残っていた。",
        },
      ],
    })),
  ],
};
