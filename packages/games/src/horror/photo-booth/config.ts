import type { HorrorConfig } from "./kit/types";

/**
 * 「プリクラ4まい」の演出データ。
 * 4台のプリクラ機(1〜4号機)の撮影ボタン shutter-1..4 を順番に押すと、プリントに写る何かが一枚ごとに近づく。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "photo-booth",
  title: "プリクラ4まい",
  intro: [
    "閉店間際のゲームセンター。友達との約束をすっぽかされて、ひとりでプリクラを撮ることにした。",
    "4台並んだ機械のどれも、「4まい撮りたい」と言っている気がした。",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [0, 1.5, 8] },
  fog: { color: [0.06, 0.03, 0.08], density: 0.015 },
  ambient: { intensity: 0.1, color: [0.9, 0.7, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.4,
    angleDeg: 40,
    range: 10,
    color: [1, 0.95, 1],
  },
  walkSpeed: 0.09,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "ネオンの音楽だけが鳴っている。店員は誰もいない。",
        },
        { type: "objective", text: "1号機の撮影ボタンを押す" },
      ],
    },
    {
      id: "shot-1",
      when: {
        type: "interact",
        target: "shutter-1",
        label: "撮影する",
        maxDistance: 2.6,
      },
      actions: [
        { type: "flicker", duration: 0.4 },
        {
          type: "sound",
          sound: "chime",
          at: { node: "shutter-1" },
          volume: 0.7,
        },
        { type: "visible", target: "print-1", visible: true },
        { type: "objective", text: "2号機の撮影ボタンを押す" },
        {
          type: "subtitle",
          text: "パシャ。1枚目は普通に撮れた。ひとりのはずなのに、ポーズが「2人用」になっている。",
          duration: 6,
        },
      ],
    },
    // ---- 1〜3分（時間でも異変が進む） ----
    {
      id: "jingle",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "giggle", at: "behind", volume: 0.4 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "後ろで、女の子の笑い声。振り返っても、誰もいない。",
          duration: 5,
        },
      ],
    },
    {
      id: "shot-2",
      when: {
        type: "interact",
        target: "shutter-2",
        label: "撮影する",
        maxDistance: 2.6,
      },
      requires: ["shot-1"],
      actions: [
        { type: "flicker", duration: 0.5 },
        {
          type: "sound",
          sound: "chime",
          at: { node: "shutter-2" },
          volume: 0.7,
        },
        { type: "visible", target: "print-2", visible: true },
        { type: "objective", text: "3号機の撮影ボタンを押す" },
        { type: "heartbeat", bpm: 84 },
        {
          type: "subtitle",
          text: "2枚目。自分の肩の向こうに、ぼんやり白いものが写っている。",
          duration: 6,
        },
      ],
    },
    {
      id: "flick",
      when: { type: "time", at: 140 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "sound", sound: "static", at: [0, 2, 8], volume: 0.5 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "プリクラの音声ガイドが勝手に鳴った。「つぎは もっと ちかくで とろうね」",
          duration: 6,
        },
      ],
    },
    {
      id: "shot-3",
      when: {
        type: "interact",
        target: "shutter-3",
        label: "撮影する",
        maxDistance: 2.6,
      },
      requires: ["shot-2"],
      actions: [
        { type: "flicker", duration: 0.6 },
        {
          type: "sound",
          sound: "chime",
          at: { node: "shutter-3" },
          volume: 0.7,
        },
        { type: "visible", target: "print-3", visible: true },
        { type: "objective", text: "4号機の撮影ボタンを押す" },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "3枚目。白いものは、肩のすぐ後ろ。顔の輪郭が見える。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分: 出口が閉まる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      unless: ["lock-early"],
      actions: [
        { type: "door", door: "gate", state: "slam" },
        { type: "door", door: "gate", state: "lock" },
        { type: "lights", group: "arc", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口の自動ドアが閉まった。音楽が止まり、プリクラ機の中だけが明るい。",
          duration: 6,
        },
      ],
    },
    {
      id: "lock-early",
      when: { type: "after", trigger: "shot-3", delay: 4 },
      unless: ["lock"],
      actions: [
        { type: "door", door: "gate", state: "slam" },
        { type: "door", door: "gate", state: "lock" },
        { type: "lights", group: "arc", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口の自動ドアが閉まった。音楽が止まり、プリクラ機の中だけが明るい。",
          duration: 6,
        },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "shot-4",
      when: {
        type: "interact",
        target: "shutter-4",
        label: "撮影する",
        maxDistance: 2.6,
      },
      requires: ["shot-3"],
      unless: SCARES,
      actions: [
        {
          type: "sound",
          sound: "chime",
          at: { node: "shutter-4" },
          volume: 0.8,
        },
        { type: "visible", target: "print-4", visible: true },
        { type: "lights", group: "booth", on: false },
        { type: "heartbeat", bpm: 140 },
        {
          type: "subtitle",
          text: "「3、2、1」。シャッターの音と一緒に、耳元で誰かが息を吸った。",
          duration: 3,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "shot-4", delay: 2.6 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "time", at: 285 },
      unless: SCARES,
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "jumpscare", figure: "ghost" },
      ],
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
          title: "プリクラ4まい",
          text: "翌朝、店員が1号機から4号機までを点検すると、どの機械にも撮影履歴が残っていなかった。\nただ、出力口の下に、プリントが4枚きれいに揃って落ちていた。\n\n4枚目だけは、どう見ても、こちらが見られている写真だったという。",
        },
      ],
    })),
  ],
};
