import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「閉院のあと」の演出データ。
 * 部屋は x=-4〜4, z=0〜8。出入口 clinic-door（南壁）。診察台 chair(0,5)、器具トレイ tray、ラジオ radio、洗面 basin。
 * 歯科医 dentist は最後に診察台に現れる（look型）。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "dental-closed",
  title: "閉院のあと",
  intro: [
    "忘れ物を取りに、閉院後の歯科医院に入った。",
    "診察台の脇の鞄を持って、すぐ帰るだけだ。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.5, 6] },
  fog: { color: [0.08, 0.1, 0.1], density: 0.015 },
  ambient: { intensity: 0.1, color: [0.85, 0.95, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.6,
    angleDeg: 42,
    range: 12,
    color: [1, 1, 0.95],
  },
  walkSpeed: 0.08,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "消毒液のにおい。無影灯だけが点いていて、診察台を白く照らしている。",
        },
        { type: "objective", text: "診察台のそばの鞄を調べる" },
      ],
    },
    {
      id: "bag",
      when: {
        type: "interact",
        target: "chair",
        label: "鞄を探す",
        maxDistance: 2.4,
      },
      actions: [
        { type: "sound", sound: "rattle", at: { node: "chair" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "鞄はない。診察台の上に、誰かの抜けた歯が一本、置かれていた。",
          duration: 5,
        },
        { type: "objective", text: "帰る" },
      ],
    },
    // 小さな異変
    {
      id: "drip",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "drip", at: { node: "basin" }, volume: 0.8 },
        {
          type: "subtitle",
          text: "洗面台の水が、ひとりでに流れ始めた。",
          duration: 4,
        },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "drill",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "tray" }, volume: 0.8 },
        { type: "shake", intensity: 0.01, duration: 1 },
        {
          type: "subtitle",
          text: "トレイの上で、ドリルが唸りながら回っている。誰も触っていない。",
          duration: 5,
        },
      ],
    },
    {
      id: "radio",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "static", at: { node: "radio" }, volume: 0.7 },
        { type: "sound", sound: "whisper", at: { node: "radio" }, volume: 0.6 },
        { type: "visible", target: "xray", visible: true },
        {
          type: "subtitle",
          text: "ラジオから囁き声。奥の壁のモニターに「あーん」と文字が浮かんだ。",
          duration: 5,
        },
        { type: "drone", level: 0.2 },
      ],
    },
    // 逃げ道が塞がる
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "clinic-door", state: "slam" },
        { type: "door", door: "clinic-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1, 0], volume: 0.9 },
        { type: "shake", intensity: 0.03, duration: 1 },
        { type: "fog", density: 0.035, duration: 4 },
        {
          type: "subtitle",
          text: "背後でドアが叩きつけられた。鍵が回る音。もう開かない。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 100 },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 12 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "dental", on: false },
        { type: "sound", sound: "breath", at: "behind", volume: 0.8 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "無影灯が消えた。暗闇で、金属の器具がかちゃりと鳴る。",
          duration: 5,
        },
        { type: "objective", text: "診察台を照らして確かめる" },
      ],
    },
    {
      id: "reveal",
      when: { type: "after", trigger: "blackout", delay: 22 },
      actions: [
        { type: "lights", group: "dental", on: true },
        { type: "visible", target: "dentist", visible: true },
        { type: "face", target: "dentist" },
        { type: "sound", sound: "creak", at: { node: "dentist" }, volume: 0.7 },
        { type: "heartbeat", bpm: 135 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "無影灯が点いた。診察台に、白衣の歯科医が座ってこちらを向いている。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "dentist",
        maxAngleDeg: 22,
        maxDistance: 20,
      },
      requires: ["reveal"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "dentist" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "dentist" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "閉院のあと",
          text: "翌朝、診察台で眠る患者が見つかった。口の中の歯は、すべて抜かれていた。\nその医院は、三年前に閉院している。",
        },
      ],
    })),
  ],
};
