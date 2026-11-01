import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「23時58分のATM」の演出データ。
 * ATM atm-1/2/3 と画面 scr-*、自動ドア glass-door、シャッター shutter、インターホン interphone、
 * 照明 group booth / street / red。外の人影 outside、最後は背後の woman。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "atm-corner",
  title: "23時58分のATM",
  intro: [
    "家賃の引き落としは明日の朝。残高が足りない。",
    "商店街の角の無人ATMコーナーに駆け込んだ。閉まるのは24時。",
  ],
  spawn: { position: [-1.5, 1.6, 1.2], lookAt: [-1.5, 1.3, 3.5] },
  fog: { color: [0.02, 0.02, 0.025], density: 0.04 },
  ambient: { intensity: 0.08, color: [0.85, 0.9, 1] },
  flashlight: {
    enabled: false,
    intensity: 0.45,
    angleDeg: 45,
    range: 8,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.06,
  droneLevel: 0.03,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "蛍光灯の唸り。シャッターの下りた商店街に、自分の足音だけが響いていた。",
          duration: 5,
        },
        { type: "objective", text: "左端のATMで入金する" },
      ],
    },
    {
      id: "deposit",
      when: { type: "interact", target: "atm-1", label: "入金する", maxDistance: 2.2 },
      actions: [
        { type: "visible", target: "scr-1-idle", visible: false },
        { type: "visible", target: "scr-1-done", visible: true },
        { type: "sound", sound: "rattle", at: { node: "atm-1" }, volume: 0.5 },
        { type: "sound", sound: "chime", at: { node: "atm-1" }, volume: 0.4 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "紙幣を数える音。……間に合った。",
          duration: 4,
        },
      ],
    },
    {
      id: "deposit-auto",
      when: { type: "time", at: 45 },
      unless: ["deposit"],
      actions: [
        { type: "visible", target: "scr-1-idle", visible: false },
        { type: "visible", target: "scr-1-done", visible: true },
        { type: "sound", sound: "chime", at: { node: "atm-1" }, volume: 0.4 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "画面が勝手に進んだ。「カードと明細をお取り忘れなく」",
          duration: 4,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "door-open",
      when: { type: "time", at: 75 },
      actions: [
        { type: "door", door: "glass-door", state: "open" },
        { type: "sound", sound: "chime", at: [0, 2.4, 0], volume: 0.6 },
        {
          type: "subtitle",
          text: "「いらっしゃいませ」。自動ドアが開いた。外には、誰もいない。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 72 },
      ],
    },
    {
      id: "door-close",
      when: { type: "after", trigger: "door-open", delay: 6 },
      actions: [{ type: "door", door: "glass-door", state: "close" }],
    },
    {
      id: "atm3",
      when: { type: "time", at: 120 },
      actions: [
        { type: "visible", target: "scr-3-off", visible: false },
        { type: "visible", target: "scr-3-on", visible: true },
        { type: "sound", sound: "rattle", at: { node: "atm-3" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "「休止中」だった右端のATMが、紙幣を吐き出す音を立てた。誰も立っていないのに。",
          duration: 6,
        },
        { type: "drone", level: 0.1 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "look", target: "glass-door", maxAngleDeg: 25, maxDistance: 10 },
      requires: ["atm3"],
      actions: [
        { type: "visible", target: "outside", visible: true },
        { type: "sound", sound: "breath", at: [-1.6, 1.5, -1.4], volume: 0.5 },
      ],
    },
    {
      id: "glimpse-off",
      when: { type: "after", trigger: "glimpse", delay: 1.4 },
      actions: [
        { type: "visible", target: "outside", visible: false },
        { type: "flicker", duration: 0.4 },
        {
          type: "subtitle",
          text: "ガラスの向こうに、白い服の女が並んでいた……ように見えた。",
          duration: 4,
        },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "whisper", at: { node: "interphone" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "インターホンのスピーカーから、かすれた声。「……まだ……ならんで……」",
          duration: 6,
        },
        { type: "heartbeat", bpm: 86 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "shutter",
      when: { type: "time", at: 200 },
      actions: [
        { type: "move", target: "shutter", to: [0, 1.4, -0.25], duration: 6 },
        { type: "sound", sound: "rumble", at: [0, 2, -0.3], volume: 0.8 },
        { type: "door", door: "glass-door", state: "lock" },
        { type: "lights", group: "street", on: false },
        {
          type: "subtitle",
          text: "まだ二分前なのに、シャッターが下りてくる。自動ドアも開かない。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "shutter", delay: 8 },
      actions: [
        { type: "shake", intensity: 0.02, duration: 0.6 },
        { type: "sound", sound: "slam", at: [0, 1, -0.3], volume: 0.7 },
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "booth", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "on" },
        { type: "drone", level: 0.3 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "シャッターが閉まりきり、照明が落ちた。閉じ込められた。",
          duration: 5,
        },
        { type: "objective", text: "インターホンで警備センターを呼ぶ" },
      ],
    },
    {
      id: "call",
      when: { type: "interact", target: "interphone", label: "警備センターを呼ぶ", maxDistance: 2.2 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "sound", sound: "static", at: { node: "interphone" }, volume: 0.6 },
        { type: "visible", target: "scr-1-done", visible: false },
        { type: "visible", target: "scr-2-idle", visible: false },
        { type: "visible", target: "scr-3-on", visible: false },
        { type: "visible", target: "scr-1-last", visible: true },
        { type: "visible", target: "scr-2-last", visible: true },
        { type: "visible", target: "scr-3-last", visible: true },
        { type: "sound", sound: "breath", at: "behind", volume: 0.8 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "「警備センターです。……防犯カメラには、そちらに二名映っております。あなたの、すぐうしろに」",
          duration: 7,
        },
      ],
    },
    {
      id: "call-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["call", ...SCARES],
      actions: [
        { type: "visible", target: "scr-1-done", visible: false },
        { type: "visible", target: "scr-2-idle", visible: false },
        { type: "visible", target: "scr-3-on", visible: false },
        { type: "visible", target: "scr-1-last", visible: true },
        { type: "visible", target: "scr-2-last", visible: true },
        { type: "visible", target: "scr-3-last", visible: true },
        { type: "sound", sound: "breath", at: "behind", volume: 0.8 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "三台の画面が同時に赤く光った。「うしろの方も お引き出しですか」",
          duration: 7,
        },
      ],
    },
    // ---- ジャンプスケア：振り向いた瞬間 ----
    {
      id: "scare-hit",
      when: { type: "lookAway", target: "atm-2", minAngleDeg: 110 },
      requiresAny: ["call", "call-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-late",
      when: { type: "after", trigger: "call", delay: 25 },
      unless: SCARES,
      actions: [{ type: "sound", sound: "giggle", at: "behind", volume: 0.8 }],
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
          title: "23時58分のATM",
          text: "翌朝、シャッターを開けた警備員は、空のATMコーナーと一枚の明細を見つけた。\n取引時刻 23:58。お引き出し 2名様分。",
        },
      ],
    })),
  ],
};
