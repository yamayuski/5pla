import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「試着は最後のお客様まで」の演出データ。
 * 店内（x=-4〜4, z=0〜14）、入口の自動ドア gate、レジ reg、ラックのハンガー（フック swingHangers）、
 * 奥の試着室カーテン curtain-0/1/2、中央の試着室に立つ figure-w、照明 group shop。
 */
const SCARES = ["scare-hit", "scare-late", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "fitting-room",
  title: "試着は最後のお客様まで",
  intro: [
    "閉店十分前、駆け込みで入った駅ビルの小さな服屋。",
    "店員の姿は見えない。レジのベルを鳴らしてみよう。",
  ],
  spawn: { position: [0, 1.6, -1.5], lookAt: [0, 1.4, 7] },
  fog: { color: [0.04, 0.035, 0.035], density: 0.015 },
  ambient: { intensity: 0.1, color: [1, 0.92, 0.85] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "BGMだけが流れる店内。レジに人はいない。", duration: 5 },
        { type: "objective", text: "レジのベルを鳴らす" },
      ],
    },
    {
      id: "bell",
      when: { type: "interact", target: "reg", label: "ベルを鳴らす", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "reg" }, volume: 0.5 },
        { type: "subtitle", text: "チン。……返事はない。奥の試着室から、衣擦れの音がした気がした。", duration: 5 },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "bell-auto",
      when: { type: "time", at: 40 },
      unless: ["bell"],
      actions: [
        { type: "sound", sound: "buzz", at: { node: "reg" }, volume: 0.5 },
        { type: "subtitle", text: "誰も触れていないレジのベルが、ひとりでに鳴った。", duration: 5 },
        { type: "objective", text: "" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "hangers",
      when: { type: "time", at: 75 },
      actions: [
        { type: "custom", name: "swingHangers" },
        { type: "subtitle", text: "風もないのに、ラックのハンガーが一斉に揺れている。", duration: 5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "curtain-open",
      when: { type: "time", at: 125 },
      actions: [
        { type: "visible", target: "curtain-0", visible: false },
        { type: "sound", sound: "creak", at: [-2.4, 1.2, 12.3], volume: 0.6 },
        { type: "subtitle", text: "左端の試着室のカーテンが開いた。中は空だ。……中央のカーテンだけが、閉まっている。", duration: 6 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 170 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 1.4, 12.5], volume: 0.6 },
        { type: "subtitle", text: "カーテンの中から、小さな声。「……サイズ、ありますか」", duration: 5 },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "gate", state: "slam" },
        { type: "door", door: "gate", state: "lock" },
        { type: "lights", group: "shop", on: false },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "flashlight", state: "on" },
        { type: "subtitle", text: "入口のシャッターが降り、店の明かりが落ちた。", duration: 5 },
        { type: "heartbeat", bpm: 104 },
      ],
    },
    {
      id: "dark",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.4 },
        { type: "visible", target: "curtain-1", visible: false },
        { type: "visible", target: "figure-w", visible: true },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "subtitle", text: "中央のカーテンが消え、白い服の女が立っている。決して、目を離してはいけない気がする。", duration: 7 },
        { type: "objective", text: "出口を探す" },
      ],
    },
    // ---- ジャンプスケア：目を逸らした瞬間 ----
    {
      id: "scare-hit",
      when: { type: "lookAway", target: "figure-w", minAngleDeg: 100 },
      requires: ["dark"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure-w" }],
    },
    {
      id: "scare-late",
      when: { type: "after", trigger: "dark", delay: 45 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure-w" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure-w" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "試着は最後のお客様まで",
          text: "翌朝、開店準備の店員が試着室を開けると、閉店前に入った客の服だけが畳んで置かれていた。\nタグには「お客様のサイズです」と、手書きで。",
        },
      ],
    })),
  ],
};
