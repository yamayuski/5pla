import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「ベビーモニター」の演出データ。
 * モニター mon-a/b/c（リビングのテーブル）、玄関 front-door、子ども部屋の扉 nursery-door、
 * ベッド crib、人影 watcher、照明 group living / nursery。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "baby-monitor",
  title: "ベビーモニター",
  intro: [
    "ベビーシッターのバイト初日。依頼主の夫婦は、夜の外出に出かけた。",
    "「寝かしつけは済んでます。モニターだけ見ていてください」",
  ],
  spawn: { position: [0, 1.6, 1.6], lookAt: [-1.8, 1, 4.6] },
  fog: { color: [0.02, 0.02, 0.025], density: 0.02 },
  ambient: { intensity: 0.08, color: [0.8, 0.8, 0.95] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "静かなリビング。モニターの緑のランプだけが点いている。", duration: 5 },
        { type: "objective", text: "モニターを見守る" },
      ],
    },
    {
      id: "monitor-hint",
      when: { type: "interact", target: "monitor", label: "モニターを見る", maxDistance: 2.6 },
      actions: [
        { type: "subtitle", text: "赤ちゃんは、ベッドで丸まっている。寝息が聞こえる。", duration: 4 },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "cry",
      when: { type: "time", at: 60 },
      actions: [
        { type: "sound", sound: "whisper", at: { node: "monitor" }, volume: 0.5 },
        { type: "subtitle", text: "モニターから、小さく歌うような声。赤ちゃんの声ではない。", duration: 5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "sway",
      when: { type: "time", at: 110 },
      actions: [
        { type: "visible", target: "mon-a", visible: false },
        { type: "visible", target: "mon-b", visible: true },
        { type: "custom", name: "cribRock" },
        { type: "subtitle", text: "モニターの中で、ベッドのメリーが勝手に回っている。", duration: 5 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "door-slam",
      when: { type: "time", at: 165 },
      actions: [
        { type: "door", door: "nursery-door", state: "slam" },
        { type: "sound", sound: "slam", at: [0, 1.2, 6], volume: 0.8 },
        { type: "shake", intensity: 0.015, duration: 0.6 },
        { type: "subtitle", text: "子ども部屋の扉が、ひとりでに閉まった。", duration: 4 },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "door", door: "front-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "lights", group: "living", on: false },
        { type: "visible", target: "mon-b", visible: false },
        { type: "visible", target: "mon-c", visible: true },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "玄関が閉まり、明かりが落ちた。モニターには、ベッドの横に立つ2つ目の影。", duration: 6 },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.4 },
        { type: "flashlight", state: "on" },
        { type: "fog", density: 0.06, duration: 5 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 108 },
        { type: "subtitle", text: "鍵が開かない。赤ちゃんだけでも確かめなければ。", duration: 5 },
        { type: "objective", text: "子ども部屋のベッドを確かめる" },
      ],
    },
    {
      id: "crib-check",
      when: { type: "interact", target: "crib", label: "ベッドをのぞく", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "watcher", visible: true },
        { type: "sound", sound: "breath", at: { node: "watcher" }, volume: 0.8 },
        { type: "heartbeat", bpm: 134 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "ベッドは空だった。毛布が、まだあたたかい。横に、誰かいる。", duration: 5 },
      ],
    },
    {
      id: "crib-auto",
      when: { type: "after", trigger: "blackout", delay: 40 },
      unless: ["crib-check", ...SCARES],
      actions: [
        { type: "visible", target: "watcher", visible: true },
        { type: "sound", sound: "knock", at: { node: "crib" }, volume: 0.8 },
        { type: "heartbeat", bpm: 134 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "ベッドの方から、ことり、と音。そこに、誰かが立っている。", duration: 5 },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "after", trigger: "crib-check", delay: 2.6 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "watcher" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "crib-auto", delay: 3 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "watcher" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "watcher" }],
    },
    ...["scare-hit", "scare-fallback", "scare-timeout"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "ベビーモニター",
          text: "帰宅した夫婦は言った。「うちに、子どもはいませんよ」\nモニターの電源は、とっくに抜かれていた。",
        },
      ],
    })),
  ],
};
