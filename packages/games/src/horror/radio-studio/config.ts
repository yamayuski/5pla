import type { HorrorConfig } from "./kit/types";

/**
 * 「深夜ラジオ 午前2時」の演出データ。
 * 調整室 z=0〜8、ブース z=8〜13、ガラス窓(studio-glass)が z=8。ブースの女(dj)は最初は背を向けて座っている。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "radio-studio",
  title: "深夜ラジオ 午前2時",
  intro: [
    "深夜ラジオ局の見習いディレクター。今夜は生放送の最後のコーナーを、ひとりで回している。",
    "ブースのパーソナリティは、ガラスの向こうでマイクに向かっている。",
  ],
  spawn: { position: [-2.5, 1.6, 1.2], lookAt: [0, 1.5, 8] },
  fog: { color: [0.04, 0.04, 0.06], density: 0.012 },
  ambient: { intensity: 0.1, color: [0.85, 0.9, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.4,
    angleDeg: 40,
    range: 11,
    color: [0.95, 0.97, 1],
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
          text: "ミキサーの小さなランプだけが、規則正しく瞬いている。",
        },
        { type: "objective", text: "ミキサーのフェーダーを上げて放送を始める" },
      ],
    },
    {
      id: "fader",
      when: {
        type: "interact",
        target: "mixer",
        label: "フェーダーを上げる",
        maxDistance: 2.8,
      },
      actions: [
        { type: "visible", target: "on-air-off", visible: false },
        { type: "visible", target: "on-air", visible: true },
        { type: "sound", sound: "chime", at: { node: "mixer" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "「ON AIR」が点灯した。ブースの女は、背を向けたまま、静かに語りはじめる。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "dj-in",
      when: { type: "time", at: 50 },
      actions: [
        { type: "visible", target: "dj", visible: true },
        { type: "sound", sound: "whisper", at: [0, 1.4, 11], volume: 0.4 },
        {
          type: "subtitle",
          text: "「こんばんは。今夜も、眠れない方のために……」。声はスピーカーから、少し遅れて聞こえる。",
          duration: 6,
        },
      ],
    },
    {
      id: "phone",
      when: { type: "time", at: 90 },
      actions: [
        { type: "sound", sound: "phone", at: [-1.5, 1, 6.5], volume: 0.8 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "リクエスト回線が鳴った。受話器を取らなくても、スピーカーから息づかいが聞こえる。",
          duration: 6,
        },
      ],
    },
    {
      id: "blink",
      when: { type: "time", at: 130 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "visible", target: "on-air", visible: false },
        { type: "visible", target: "on-air-off", visible: true },
        { type: "sound", sound: "static", at: [0, 2.4, 6], volume: 0.6 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "ON AIR のランプが消えた。それでも、女の声は途切れず、続いている。",
          duration: 6,
        },
      ],
    },
    {
      id: "turn",
      when: { type: "time", at: 180 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "face", target: "dj" },
        { type: "sound", sound: "creak", at: [0, 0.5, 11], volume: 0.7 },
        {
          type: "subtitle",
          text: "椅子がきしんだ。女がゆっくりこちらを向く。マイクの前で、口だけが動いている。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "studio-door", state: "slam" },
        { type: "door", door: "studio-door", state: "lock" },
        { type: "lights", group: "ctrl", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "move", target: "dj", to: [0, 0, 8.7], duration: 12 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "調整室の扉が閉まった。灯りが落ち、ブースだけが明るい。女が椅子を立って、ガラスのほうへ歩いてくる。",
          duration: 7,
        },
      ],
    },
    {
      id: "glass",
      when: { type: "after", trigger: "lock", delay: 13 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "thud", at: [0, 1.5, 8], volume: 1 },
        { type: "shake", intensity: 0.3, duration: 0.5 },
        { type: "heartbeat", bpm: 140 },
        {
          type: "subtitle",
          text: "女が、ガラスの向こうに立った。顔が、窓いっぱいに貼りついている。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "dj",
        maxAngleDeg: 28,
        maxDistance: 10,
      },
      requires: ["glass"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "studio-glass", visible: false },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "glass", delay: 9 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "studio-glass", visible: false },
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
          title: "深夜ラジオ 午前2時",
          text: "翌朝、局の録音庫には、午前2時から5分間の放送が残されていた。\nパーソナリティは三年前に番組を降板していて、その時間、ブースには誰も入っていない。\n\n録音の最後には、ディレクターの名前を呼ぶ声が入っていたという。",
        },
      ],
    })),
  ],
};
