import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「一夜花」の演出データ。
 * 温室の入口 gh-door、通路両側の植物（フック rustle）、最奥の巨大な花 bud → bloom（フック bloomOpen）、
 * 記録用カメラ camera、ガラスの手形 hands、照明 group gh / spot / red。最後は花の中から現れる flower-woman。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "greenhouse",
  title: "一夜花",
  intro: [
    "植物園の熱帯温室。七年に一度しか咲かない巨大な花が、今夜開くという。",
    "記録係として、一人で朝まで見届けることになった。",
  ],
  spawn: { position: [0, 1.6, 1.6], lookAt: [0, 1.6, 14] },
  fog: { color: [0.02, 0.035, 0.025], density: 0.045 },
  ambient: { intensity: 0.07, color: [0.7, 1, 0.8] },
  flashlight: {
    enabled: false,
    intensity: 0.5,
    angleDeg: 40,
    range: 11,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.07,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "むっとする湿気。ガラスの外は真っ暗で、水の滴る音だけが響いている。",
          duration: 5,
        },
        { type: "objective", text: "奥のカメラで録画を始める" },
      ],
    },
    {
      id: "rec",
      when: { type: "interact", target: "camera", label: "録画を始める", maxDistance: 2.4 },
      actions: [
        { type: "lights", group: "spot", on: true },
        { type: "sound", sound: "chime", at: { node: "camera" }, volume: 0.4 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "録画開始。照明に照らされたつぼみは、赤黒く、少し脈打って見えた。",
          duration: 5,
        },
      ],
    },
    {
      id: "rec-auto",
      when: { type: "time", at: 50 },
      unless: ["rec"],
      actions: [
        { type: "lights", group: "spot", on: true },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "タイマーで照明が点き、カメラの赤いランプが灯った。",
          duration: 5,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "hands",
      when: { type: "time", at: 75 },
      actions: [
        { type: "visible", target: "hands", visible: true },
        { type: "sound", sound: "knock", at: [-5, 1.4, 7], volume: 0.6 },
        {
          type: "subtitle",
          text: "西側のガラスを叩く音。曇ったガラスに、手形が並んでいる。……内側から。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "rustle",
      when: { type: "time", at: 120 },
      actions: [
        { type: "custom", name: "rustle" },
        {
          type: "subtitle",
          text: "奥から手前へ、葉が順番に揺れていく。何かが植え込みの中を、こちらへ歩いてくる。",
          duration: 6,
        },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "whisper", at: { node: "bud" }, volume: 0.6 },
        { type: "sound", sound: "heartbeat", at: { node: "bud" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "つぼみの中から、どくん、どくんと鼓動が聞こえる。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "gh-door", state: "slam" },
        { type: "door", door: "gh-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.8 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        {
          type: "subtitle",
          text: "入口のガラス戸が閉まり、自動の施錠音。温度管理の警報が鳴り止んだ。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "gh", on: false },
        { type: "lights", group: "spot", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "on" },
        { type: "fog", density: 0.08, duration: 5 },
        { type: "custom", name: "bloomOpen" },
        { type: "visible", target: "bud", visible: false },
        { type: "visible", target: "bloom", visible: true },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "照明が落ち、霧のような湿気が満ちる。暗がりの奥で、花が開いた。",
          duration: 6,
        },
        { type: "objective", text: "開いた花を確かめる" },
      ],
    },
    {
      id: "look-in",
      when: { type: "interact", target: "planter", label: "花の中を覗く", maxDistance: 2.8 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "flower-woman", visible: true },
        { type: "move", target: "flower-woman", to: [0, 1.0, 14], duration: 2.5 },
        { type: "face", target: "flower-woman" },
        { type: "sound", sound: "breath", at: { node: "bloom" }, volume: 0.9 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "花びらの中心に、濡れた黒髪。……ゆっくりと、頭が持ち上がってくる。",
          duration: 6,
        },
      ],
    },
    {
      id: "look-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["look-in", ...SCARES],
      actions: [
        { type: "visible", target: "flower-woman", visible: true },
        { type: "move", target: "flower-woman", to: [0, 1.0, 14], duration: 2.5 },
        { type: "face", target: "flower-woman" },
        { type: "sound", sound: "breath", at: { node: "bloom" }, volume: 0.9 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "開いた花の中から、何かが立ち上がった。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "flower-woman", maxAngleDeg: 20, maxDistance: 16 },
      requiresAny: ["look-in", "look-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "flower-woman" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "flower-woman" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "一夜花",
          text: "朝、職員が温室に入ると、花はもう閉じていた。録画は午前二時で途切れている。\n花は今年、例年より一回り大きく育ったという。",
        },
      ],
    })),
  ],
};
