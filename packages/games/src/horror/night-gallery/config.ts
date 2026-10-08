import type { HorrorConfig } from "./kit/types";

/**
 * 「閉館後の美術館」の演出データ。
 * 展示室は x=-5〜5, z=0〜26。入口(z=0)の exit-door が最後に閉まる。突き当たり(z=26)の「婦人像」が最後に空になる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "night-gallery",
  title: "閉館後の美術館",
  intro: [
    "閉館後の美術館で、夜間警備のアルバイトをしている。",
    "巡回の途中に、肖像画の目が動いた気がした。気のせいだ。",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [0, 1.6, 14] },
  fog: { color: [0.03, 0.02, 0.02], density: 0.012 },
  ambient: { intensity: 0.07, color: [0.9, 0.75, 0.65] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 38,
    range: 13,
    color: [1, 0.95, 0.85],
  },
  walkSpeed: 0.085,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "人のいない展示室。靴音だけがやけに響く。",
        },
        { type: "objective", text: "受付パネルで巡回の記録をつける" },
      ],
    },
    {
      id: "check",
      when: {
        type: "interact",
        target: "check-panel",
        label: "巡回を記録する",
        maxDistance: 2.5,
      },
      actions: [
        {
          type: "sound",
          sound: "chime",
          at: { node: "check-panel" },
          volume: 0.5,
        },
        {
          type: "subtitle",
          text: "「第一展示室　異常なし」。最奥まで歩いて、突き当たりの絵を確認する。",
          duration: 6,
        },
        { type: "objective", text: "展示室の奥まで見回る" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "eyes",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "portrait-a", visible: false },
        { type: "visible", target: "portrait-a-open", visible: true },
        { type: "visible", target: "portrait-b", visible: false },
        { type: "visible", target: "portrait-b-open", visible: true },
        {
          type: "sound",
          sound: "whisper",
          at: { node: "portrait-a" },
          volume: 0.4,
        },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "肖像画の目が、さっきは閉じていた。今は開いて、こちらを見ている。",
          duration: 6,
        },
      ],
    },
    {
      id: "fall",
      when: { type: "time", at: 110 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "visible", target: "portrait-c", visible: false },
        { type: "visible", target: "fallen", visible: true },
        { type: "sound", sound: "thud", at: [-3.2, 0, 13], volume: 0.9 },
        { type: "shake", intensity: 0.2, duration: 0.4 },
        {
          type: "subtitle",
          text: "背後で大きな音。壁の額縁が一枚、床に落ちて割れている。壁には、何も残っていない。",
          duration: 6,
        },
      ],
    },
    {
      id: "statue-1",
      when: { type: "time", at: 150 },
      actions: [
        { type: "visible", target: "statue", visible: true },
        { type: "sound", sound: "step", at: [3.2, 0, 21], volume: 0.5 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "右奥の台座の上に、石像が立っている。……あんな像、あっただろうか。",
          duration: 5,
        },
      ],
    },
    {
      id: "statue-2",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "move", target: "statue", to: [1.2, 0, 15], duration: 6 },
        { type: "sound", sound: "rumble", at: { node: "statue" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "照明が瞬くたび、石像が台座から降りて、こちらへ近づいている。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "exit-door", state: "slam" },
        { type: "door", door: "exit-door", state: "lock" },
        { type: "lights", group: "hall", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        { type: "visible", target: "statue", visible: false },
        {
          type: "subtitle",
          text: "入口の自動ドアが閉まった。照明が落ち、懐中電灯の丸い光だけが頼りだ。石像は、もうそこにいない。",
          duration: 7,
        },
        { type: "objective", text: "最奥の「婦人像」を確認する" },
      ],
    },
    {
      id: "empty",
      when: { type: "zone", center: [0, 1.6, 17], radius: 3.5 },
      requires: ["lock"],
      actions: [
        { type: "visible", target: "lady-portrait", visible: false },
        { type: "visible", target: "lady-empty", visible: true },
        { type: "sound", sound: "stinger", at: [0, 2, 25.8], volume: 0.5 },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "突き当たりの額縁が、空だ。さっきまで、確かに婦人がいたのに。",
          duration: 5,
        },
      ],
    },
    {
      id: "empty-fallback",
      when: { type: "after", trigger: "lock", delay: 25 },
      unless: ["empty"],
      actions: [
        { type: "visible", target: "lady-portrait", visible: false },
        { type: "visible", target: "lady-empty", visible: true },
        { type: "sound", sound: "stinger", at: [0, 2, 25.8], volume: 0.5 },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "突き当たりの額縁が、空だ。さっきまで、確かに婦人がいたのに。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "lady-empty",
        maxAngleDeg: 30,
        maxDistance: 22,
      },
      requiresAny: ["empty", "empty-fallback"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "lock", delay: 45 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "閉館後の美術館",
          text: "翌朝、学芸員が最奥の「婦人像」を見上げて首をかしげた。\n絵の中の婦人は、昨日までと違い、こちらをまっすぐ見ていたという。\n\n夜間警備のアルバイトは、その日から来ていない。",
        },
      ],
    })),
  ],
};
