import type { HorrorConfig } from "./kit/types";

/**
 * 「閉館後のリンク」の演出データ。
 * スケート場は x=-9〜9, z=0〜26。手前 z=0〜6 がロビー兼貸し靴コーナー、z=6 のフェンスの奥が氷のリンク(z=6〜26)。
 * リンクの奥から、回り続けるスケーター(skater)が照明の明滅のたびに近づいてくる。最後は回転が止まりこちらを向く。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "ice-rink",
  title: "閉館後のリンク",
  intro: [
    "閉館後のスケートリンクのアルバイト。貸し靴の鍵箱を、事務所へ返して帰るだけ。",
    "白い息が出るほど寒い。リンクの照明だけが、まだ点いている。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.4, 14] },
  fog: { color: [0.05, 0.07, 0.1], density: 0.018 },
  ambient: { intensity: 0.09, color: [0.75, 0.85, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 40,
    range: 12,
    color: [0.95, 0.98, 1],
  },
  walkSpeed: 0.085,
  droneLevel: 0.06,
  triggers: [
    // ---- 0〜1分: 閉館後のロビー ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "氷を削る機械の音も止まり、リンクは鏡のように静まっている。",
        },
        { type: "objective", text: "貸し靴の鍵箱を事務所に返す" },
      ],
    },
    {
      id: "keybox",
      when: {
        type: "interact",
        target: "key-box",
        label: "鍵箱を戻す",
        maxDistance: 2.5,
      },
      actions: [
        {
          type: "sound",
          sound: "rattle",
          at: { node: "key-box" },
          volume: 0.5,
        },
        {
          type: "subtitle",
          text: "鍵が一本足りない。貸し出し帳の最後は、閉館時刻のあとの時間で「24番」。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "music",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 4, 16], volume: 0.6 },
        { type: "visible", target: "skater", visible: true },
        { type: "custom", name: "spinOn" },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "止まったはずのオルゴール調のBGM。リンクの一番奥で、誰かが氷の上を回っている。",
          duration: 6,
        },
      ],
    },
    {
      id: "slide-1",
      when: { type: "time", at: 110 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "move", target: "skater", to: [0, 0, 16], duration: 7 },
        { type: "sound", sound: "static", at: [0, 3, 16], volume: 0.5 },
        {
          type: "subtitle",
          text: "照明が一瞬瞬いた。回っている人影が、さっきより近い。",
          duration: 4,
        },
      ],
    },
    {
      id: "zamboni",
      when: { type: "time", at: 150 },
      actions: [
        { type: "lights", group: "zam", on: true },
        { type: "move", target: "zamboni", to: [6, 0, 10], duration: 14 },
        { type: "sound", sound: "rumble", at: [6, 1, 22], volume: 0.8 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "整氷車が、運転席に誰もいないまま、ひとりでに走りだした。",
          duration: 5,
        },
      ],
    },
    {
      id: "slide-2",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.3 },
        { type: "move", target: "skater", to: [0, 0, 11.5], duration: 7 },
        { type: "sound", sound: "breath", at: "behind", volume: 0.6 },
        {
          type: "subtitle",
          text: "もう一度、明滅。氷を滑る刃の音が、すぐそこで聞こえる。",
          duration: 4,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "rink-door", state: "slam" },
        { type: "door", door: "rink-door", state: "lock" },
        { type: "lights", group: "rink", on: false },
        { type: "lights", group: "zam", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "move", target: "skater", to: [0, 0, 7.2], duration: 10 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "出口の自動ドアが閉まった。リンクの照明が全て落ち、回る人影だけがぼうっと白い。",
          duration: 6,
        },
      ],
    },
    // ---- 4〜5分: 回転が止まる ----
    {
      id: "stop",
      when: { type: "after", trigger: "lock", delay: 12 },
      unless: SCARES,
      actions: [
        { type: "custom", name: "spinOff" },
        { type: "face", target: "skater" },
        { type: "sound", sound: "slam", at: { node: "skater" }, volume: 0.8 },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "刃の音が止んだ。フェンスのすぐ向こうで、女がこちらを向いて立っている。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "skater",
        maxAngleDeg: 28,
        maxDistance: 15,
      },
      requires: ["stop"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "skater" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "stop", delay: 8 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "skater" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "skater" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "閉館後のリンク",
          text: "翌朝、整氷車で氷を削っていた職員は、リンクの中央にくっきりと残る円形の跡に気づいた。\n何度削っても、その跡だけは消えなかったという。\n\n貸し靴の24番は、いまも戻っていない。",
        },
      ],
    })),
  ],
};
