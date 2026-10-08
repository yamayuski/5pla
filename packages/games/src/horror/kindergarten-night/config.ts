import type { HorrorConfig } from "./kit/types";

/**
 * 「ひよこ組」の演出データ。
 * 遊戯室は x=-6〜6, z=0〜12（入口 z=0 の room-door）。北の壁にピアノ（piano）、壁に園児の絵（draw-a / draw-b）、
 * 小さなテーブルに座る園児の人影（kid-0〜3、背中向き）。最後はピアノを弾く先生（teacher）が振り向く。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];
const KIDS = [0, 1, 2, 3];

export const config: HorrorConfig = {
  slug: "kindergarten-night",
  title: "ひよこ組",
  intro: [
    "幼稚園の宿直の夜。見回りの最後は、一番奥の遊戯室「ひよこ組」。",
    "おもちゃを片付けて、戸締まりをするだけだ。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.0, 9] },
  fog: { color: [0.05, 0.04, 0.06], density: 0.015 },
  ambient: { intensity: 0.1, color: [1, 0.9, 0.85] },
  flashlight: {
    enabled: true,
    intensity: 0.6,
    angleDeg: 42,
    range: 11,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.08,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 見回り ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "小さな椅子と、小さな机。壁にはクレヨンの絵がびっしり貼られている。",
        },
        { type: "objective", text: "床の積み木をおもちゃ箱に片付ける" },
      ],
    },
    {
      id: "tidy",
      when: {
        type: "interact",
        target: "blocks",
        label: "積み木を片付ける",
        maxDistance: 2.4,
      },
      actions: [
        { type: "visible", target: "blocks", visible: false },
        { type: "sound", sound: "rattle", at: { node: "blocks" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "からから、と積み木を箱に戻す。一つだけ、赤い積み木の裏に「みつけた」と書いてあった。",
          duration: 6,
        },
        { type: "objective", text: "戸締まりをして帰る" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "piano",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 1, 11], volume: 0.6 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "奥のピアノから、「ど」「み」「そ」と、たどたどしい三つの音。蓋は、閉じているのに。",
          duration: 5,
        },
      ],
    },
    {
      id: "piano-2",
      when: { type: "after", trigger: "piano", delay: 2.5 },
      actions: [{ type: "sound", sound: "chime", at: [0, 1, 11], volume: 0.7 }],
    },
    {
      id: "drawings",
      when: { type: "time", at: 110 },
      actions: [
        { type: "visible", target: "draw-a", visible: false },
        { type: "visible", target: "draw-b", visible: true },
        { type: "sound", sound: "creak", at: [-5.9, 1.4, 6], volume: 0.5 },
        {
          type: "subtitle",
          text: "壁の絵が違う。「おかあさん」のはずが、長い髪の黒い影の絵に。どの絵にも、先生の顔が描かれている。",
          duration: 6,
        },
      ],
    },
    {
      id: "kids",
      when: { type: "time", at: 150 },
      actions: [
        ...KIDS.map((i) => ({
          type: "visible" as const,
          target: `kid-${i}`,
          visible: true,
        })),
        { type: "sound", sound: "giggle", at: [0, 0.6, 6], volume: 0.6 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "小さな机に、園児が四人座っている。みんな壁のほうを向いて、じっとお絵かきをしている。",
          duration: 5,
        },
      ],
    },
    {
      id: "kids-turn",
      when: { type: "time", at: 185 },
      actions: [
        ...KIDS.map((i) => ({
          type: "face" as const,
          target: `kid-${i}`,
        })),
        { type: "sound", sound: "giggle", at: [0, 0.6, 6], volume: 0.9 },
        {
          type: "subtitle",
          text: "くすくす、という笑い声。四人が同時に、ぐるりとこちらを向いた。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 210 },
      actions: [
        { type: "door", door: "room-door", state: "slam" },
        { type: "door", door: "room-door", state: "lock" },
        { type: "lights", group: "room", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "sound", sound: "chime", at: [0, 1, 11], volume: 1 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "遊戯室の戸が閉まり、灯りが落ちた。ピアノの音だけが、だんだん大きくなる。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "teacher",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "visible", target: "teacher", visible: true },
        { type: "sound", sound: "chime", at: [0, 1, 11], volume: 0.9 },
        { type: "sound", sound: "chime", at: [0, 1, 11], volume: 0.9 },
        { type: "heartbeat", bpm: 120 },
        {
          type: "subtitle",
          text: "ピアノの前に、エプロン姿の先生が座っている。背中を向けたまま、鍵盤を叩き続けている。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: 先生が振り向く ----
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "teacher",
        maxAngleDeg: 24,
        maxDistance: 14,
      },
      requires: ["teacher"],
      unless: SCARES,
      actions: [
        { type: "face", target: "teacher" },
        { type: "sound", sound: "slam", at: [0, 1, 11], volume: 1 },
        { type: "jumpscare", figure: "teacher" },
      ],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "teacher", delay: 22 },
      unless: SCARES,
      actions: [
        { type: "face", target: "teacher" },
        { type: "jumpscare", figure: "teacher" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "teacher" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "ひよこ組",
          text: "翌朝、遊戯室の机の上に、新しいクレヨンの絵が五枚、置かれていた。\nどれも、エプロン姿の「せんせい」の絵。\n\n園の記録に、ひよこ組の担任だった先生の名前は、一人も残っていない。",
        },
      ],
    })),
  ],
};
