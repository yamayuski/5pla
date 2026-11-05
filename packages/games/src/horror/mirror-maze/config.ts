import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「鏡の迷路」の演出データ。
 * フロア（x=-4〜4, z=0〜16）、入口の鉄扉 shutter、台 wagon とスマホ、鏡パネル群と影 ride-ghost、
 * 奥の非常口 exit と向こうに立つ figure-w、照明 group floor。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "mirror-maze",
  title: "鏡の迷路",
  intro: [
    "夜の遊園地のミラーハウスで、友達とはぐれたまま閉園のチャイムが鳴った。",
    "奥の非常口まで行けば、外へ出られるはずだ。",
  ],
  spawn: { position: [0, 1.6, -1.5], lookAt: [0, 1.4, 7] },
  fog: { color: [0.03, 0.03, 0.04], density: 0.015 },
  ambient: { intensity: 0.09, color: [1, 0.93, 0.85] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "無数の鏡が並ぶ館内。台の上に、はぐれた友達のスマホが置かれている。", duration: 5 },
        { type: "objective", text: "台の上のスマホを見る" },
      ],
    },
    {
      id: "wagon",
      when: { type: "interact", target: "wagon", label: "画面を見る", maxDistance: 2.6 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "wagon" }, volume: 0.4 },
        { type: "subtitle", text: "画面には「うしろ」とだけ打ちかけのメッセージ。送信先は、自分だった。", duration: 5 },
        { type: "objective", text: "奥の非常口へ向かう" },
      ],
    },
    {
      id: "wagon-auto",
      when: { type: "time", at: 40 },
      unless: ["wagon"],
      actions: [
        { type: "subtitle", text: "スマホの画面が、いつの間にか自分のメッセージで埋まっている。", duration: 5 },
        { type: "objective", text: "奥の非常口へ向かう" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "music-slow",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 2.8, 6], volume: 0.5 },
        { type: "subtitle", text: "園内に流れるワルツが、テープが伸びたようにゆっくりになっていく。", duration: 5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "ride",
      when: { type: "time", at: 125 },
      actions: [
        { type: "visible", target: "ride-ghost", visible: true },
        { type: "sound", sound: "knock", at: [2.4, 0.8, 9], volume: 0.7 },
        { type: "subtitle", text: "鏡の中の自分だけが、半歩遅れて動いた気がする。振り向くと、もう揃っている。", duration: 5 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "pa",
      when: { type: "time", at: 170 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 2.8, 8], volume: 0.7 },
        { type: "subtitle", text: "園内放送。「お連れ様の、お迎えにあがりました」", duration: 6 },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "shutter", state: "slam" },
        { type: "door", door: "shutter", state: "lock" },
        { type: "lights", group: "floor", on: false },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "flashlight", state: "on" },
        { type: "subtitle", text: "入口の鉄扉が閉まり、音楽が止まった。", duration: 5 },
        { type: "heartbeat", bpm: 104 },
      ],
    },
    {
      id: "dark",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.4 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "subtitle", text: "残る出口は奥の非常口だけ。鏡の一枚一枚に、自分ではない誰かが映っている。", duration: 6 },
        { type: "objective", text: "非常口を開ける" },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "open-exit",
      when: { type: "interact", target: "exit", label: "扉を押す", maxDistance: 2.6 },
      requires: ["dark"],
      unless: SCARES,
      actions: [
        { type: "door", door: "exit", state: "open" },
        { type: "visible", target: "figure-w", visible: true },
        { type: "sound", sound: "creak", at: [0, 1.2, 13], volume: 0.8 },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "open-exit", delay: 1.2 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure-w" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "visible", target: "figure-w", visible: true }, { type: "jumpscare", figure: "figure-w" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "鏡の迷路",
          text: "翌朝、ミラーハウスの清掃員は、閉館後の鏡が一枚、内側から曇っているのを見つけた。\n指でなぞった跡は「みつけた」と読める。友達は、今も見つかっていない。",
        },
      ],
    })),
  ],
};
