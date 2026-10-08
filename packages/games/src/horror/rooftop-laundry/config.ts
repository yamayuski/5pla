import type { HorrorConfig } from "./kit/types";

/**
 * 「干しっぱなし」の演出データ。
 * 屋上は x=-7〜7, z=0〜12。南西の階段室（hut）から出る。物干しは z=4 / 6.5 / 9 の3列で各5枚。
 * 白いワンピースの女 woman は一番奥の列の向こうから、シーツ越しにゆっくり近づいてくる。
 * 風（windUp / windStill）で全シーツが揺れる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "rooftop-laundry",
  title: "干しっぱなし",
  intro: [
    "夜になって、洗濯物を屋上に出しっぱなしだったことを思い出した。",
    "雨が降る前に、取り込んでしまおう。",
  ],
  spawn: { position: [-4.6, 1.6, 1.5], lookAt: [2, 1.4, 6] },
  fog: { color: [0.05, 0.05, 0.08], density: 0.016 },
  ambient: { intensity: 0.09, color: [0.7, 0.75, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.7,
    angleDeg: 42,
    range: 14,
    color: [1, 0.97, 0.92],
  },
  walkSpeed: 0.085,
  droneLevel: 0.06,
  triggers: [
    // ---- 0〜1分: 洗濯物を取り込む ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "夜風にシーツがばたついている。街の明かりが遠い。",
        },
        { type: "objective", text: "自分の洗濯物を3枚取り込む" },
      ],
    },
    ...[0, 1, 2].map((i) => ({
      id: `bring-${i}`,
      when: {
        type: "interact" as const,
        target: `bring-${i}`,
        label: "取り込む",
        maxDistance: 2.4,
      },
      actions: [
        { type: "visible" as const, target: `bring-${i}`, visible: false },
        {
          type: "sound" as const,
          sound: "rattle" as const,
          at: "player" as const,
          volume: 0.3,
        },
        {
          type: "subtitle" as const,
          text:
            i === 0
              ? "まだ湿っている。……なのに、なぜか冷たい手で握られたみたいに冷たい。"
              : "取り込んだシーツから、知らない柔軟剤の匂いがする。",
          duration: 4,
        },
      ],
    })),
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "feet",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "woman", visible: true },
        { type: "sound", sound: "chime", at: [5.5, 2, 10], volume: 0.6 },
        {
          type: "subtitle",
          text: "一番奥のシーツの下に、白い足が見えた。ほかの洗濯物はもう、そこには無いのに。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "wind-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "custom", name: "windUp" },
        { type: "sound", sound: "rumble", at: "player", volume: 0.5 },
        {
          type: "subtitle",
          text: "風が急に強まった。シーツが一斉に、こちらへ膨らむ。",
          duration: 4,
        },
      ],
    },
    {
      id: "drift",
      when: { type: "time", at: 150 },
      actions: [
        { type: "move", target: "woman", to: [0.5, 0, 10.8], duration: 40 },
        { type: "sound", sound: "footsteps", at: [4, 0, 10.5], volume: 0.5 },
        {
          type: "subtitle",
          text: "白い足が、シーツの列の向こうを横にすべっていく。足音はしない。",
          duration: 5,
        },
      ],
    },
    {
      id: "tank",
      when: { type: "time", at: 180 },
      actions: [
        { type: "sound", sound: "knock", at: [5.5, 1.5, 10], volume: 0.9 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "給水タンクの中から、内側をコン、コンと叩く音。",
          duration: 4,
        },
      ],
    },
    // ---- 3〜4分: 階段室が閉じる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "hut-door", state: "slam" },
        { type: "door", door: "hut-door", state: "lock" },
        { type: "lights", group: "hut", on: false },
        { type: "custom", name: "windStorm" },
        { type: "fog", density: 0.035, duration: 4 },
        { type: "shake", intensity: 0.03, duration: 1 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "階段室の扉が叩きつけられた。取っ手は、びくともしない。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "approach",
      when: { type: "after", trigger: "lock", delay: 6 },
      actions: [
        { type: "move", target: "woman", to: [-1.5, 0, 4.5], duration: 38 },
        { type: "lights", group: "roof", on: false },
        { type: "flashlight", state: "dim" },
        { type: "sound", sound: "whisper", at: [0, 1.2, 9], volume: 0.7 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "屋上の外灯が落ちた。シーツの向こうで、白い裾がこちらへ近づいてくる。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: シーツの向こうから ----
    {
      id: "woman-close",
      when: { type: "after", trigger: "approach", delay: 38 },
      unless: SCARES,
      actions: [
        { type: "custom", name: "windStill" },
        { type: "sound", sound: "breath", at: "behind", volume: 0.8 },
        { type: "heartbeat", bpm: 130 },
        {
          type: "subtitle",
          text: "風が、ぴたりと止んだ。すぐそこに、誰かが立っている。",
          duration: 4,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "woman",
        maxAngleDeg: 30,
        maxDistance: 20,
      },
      requires: ["woman-close"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "woman-close", delay: 7 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "干しっぱなし",
          text: "翌朝、管理人が屋上の物干しに、見覚えのない白いワンピースが一枚だけ干されているのを見つけた。\nまだ、ぐっしょりと濡れていた。\n\n取り込まれなかった洗濯物の持ち主は、三年前から行方不明になっている。",
        },
      ],
    })),
  ],
};
