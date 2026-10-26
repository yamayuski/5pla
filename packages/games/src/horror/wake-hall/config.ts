import type { HorrorConfig } from "./kit/types";

/**
 * 「通夜の番」の演出データ。
 * 斎場の和室（x=-5〜5, z=0〜14、入口 z=0 の hall-door）。北の祭壇に棺（coffin、蓋は lid）と遺影、
 * 手前に線香立て(incense)。蓋が少しずつずれ、最後は中の故人（corpse）が起き上がる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "wake-hall",
  title: "通夜の番",
  intro: [
    "祖母の通夜。親族は皆帰り、夜の番を任された。",
    "「線香を絶やしてはいけないよ」と叔母に言われた。",
  ],
  spawn: { position: [0, 1.6, 1.5], lookAt: [0, 1.3, 12] },
  fog: { color: [0.04, 0.03, 0.03], density: 0.02 },
  ambient: { intensity: 0.07, color: [1, 0.9, 0.8] },
  flashlight: {
    enabled: false,
    intensity: 0.5,
    angleDeg: 40,
    range: 10,
    color: [1, 0.95, 0.85],
  },
  walkSpeed: 0.07,
  droneLevel: 0.06,
  triggers: [
    // ---- 0〜1分: 線香の番 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "線香の匂いと、ろうそくの小さな炎。広い和室に、棺と自分だけ。",
        },
        { type: "objective", text: "祭壇の線香立てに線香をあげる" },
      ],
    },
    {
      id: "incense-1",
      when: {
        type: "interact",
        target: "incense",
        label: "線香をあげる",
        maxDistance: 2.4,
      },
      actions: [
        { type: "sound", sound: "chime", at: { node: "incense" }, volume: 0.4 },
        {
          type: "subtitle",
          text: "手を合わせる。遺影の祖母は、いつもの笑顔のままだ。",
          duration: 5,
        },
        { type: "objective", text: "朝まで番をする" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "portrait",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "portrait-a", visible: false },
        { type: "visible", target: "portrait-b", visible: true },
        { type: "sound", sound: "creak", at: [0, 2.4, 13.5], volume: 0.6 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "遺影の顔が違う。目が黒く窪み、口が耳まで裂けているように見える。……瞬きをすると、元に戻った。",
          duration: 6,
        },
      ],
    },
    {
      id: "knock",
      when: { type: "time", at: 105 },
      actions: [
        { type: "visible", target: "portrait-b", visible: false },
        { type: "visible", target: "portrait-a", visible: true },
        { type: "sound", sound: "knock", at: [0, 0.9, 12], volume: 0.8 },
        {
          type: "subtitle",
          text: "コン、コン、コン。棺の内側から、蓋を叩く音。",
          duration: 4,
        },
      ],
    },
    {
      id: "shoes",
      when: { type: "time", at: 140 },
      actions: [
        { type: "visible", target: "shoes", visible: true },
        { type: "sound", sound: "footsteps", at: [0, 0, -1], volume: 0.6 },
        {
          type: "subtitle",
          text: "入口の土間に、黒い革靴が何足も並んでいる。足音は聞こえなかったのに。",
          duration: 5,
        },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 175 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 0.9, 12], volume: 0.9 },
        { type: "lights", group: "candle-a", on: false },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "左のろうそくが消えた。棺のほうから、掠れた声。「……ありがとう……もう、いいよ……」",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分: 蓋がずれる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "hall-door", state: "slam" },
        { type: "door", door: "hall-door", state: "lock" },
        { type: "lights", group: "candle-b", on: false },
        { type: "flicker", duration: 1.2 },
        { type: "move", target: "lid", to: [0.3, 0, 0], duration: 6 },
        { type: "visible", target: "coffin-hand", visible: true },
        { type: "sound", sound: "rumble", at: [0, 0.8, 12], volume: 0.9 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口の戸が閉まった。ろうそくが全部消え、棺の蓋が、ずず……とずれていく。白い指が、縁を掴んでいる。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 4〜5分: 起き上がる ----
    {
      id: "rise",
      when: { type: "after", trigger: "lock", delay: 22 },
      unless: SCARES,
      actions: [
        { type: "move", target: "lid", to: [1.4, 0, 0], duration: 1.2 },
        { type: "visible", target: "coffin-hand", visible: false },
        { type: "visible", target: "corpse", visible: true },
        { type: "face", target: "corpse" },
        { type: "sound", sound: "slam", at: [0, 0.8, 12], volume: 0.9 },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "蓋が外れて床に落ちた。白い着物の祖母が、ゆっくりと身体を起こす。",
          duration: 4,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "corpse",
        maxAngleDeg: 26,
        maxDistance: 20,
      },
      requires: ["rise"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "corpse" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "rise", delay: 8 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "corpse" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "corpse" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "通夜の番",
          text: "翌朝、叔母が斎場に着くと、祖母の棺は空になっていた。蓋は閉じられたまま、内側から爪で引っかいた跡だけが残っていたという。\n\n線香は、一本も絶えていなかった。",
        },
      ],
    })),
  ],
};
