import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「歯医者の閉店後」の演出データ。
 * 部屋は x=-3〜3, z=0〜7。扉 room-door（南）、テーブルの mic / switch、北のモニター xray-a / xray-b。
 * 最後は doctor（ソファに座る白い服の女）が現れる。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "dental-clinic",
  title: "閉院後の診察室",
  intro: [
    "急な歯痛で、閉院間際の歯科医院に駆け込んだ。",
    "受付にも待合室にも、もう誰もいない。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.5, 6] },
  fog: { color: [0.03, 0.02, 0.05], density: 0.015 },
  ambient: { intensity: 0.08, color: [0.8, 0.7, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 45,
    range: 10,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.08,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "どこかで、ドリルの音が薄く響いている。",
        },
        { type: "objective", text: "診察台のライトを点ける" },
      ],
    },
    {
      id: "disco-on",
      when: {
        type: "interact",
        target: "switch",
        label: "ライトを点ける",
        maxDistance: 2.4,
      },
      actions: [
        { type: "lights", group: "disco", on: true },
        { type: "sound", sound: "chime", at: { node: "switch" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "無影灯が点いた。先生はまだ来ない。",
          duration: 4,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "disco-auto",
      when: { type: "time", at: 40 },
      unless: ["disco-on"],
      actions: [
        { type: "lights", group: "disco", on: true },
        {
          type: "subtitle",
          text: "無影灯がひとりでに点いた。",
          duration: 4,
        },
        { type: "objective", text: "" },
      ],
    },
    // 小さな異変
    {
      id: "wall-knock",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "knock", at: [-3, 1.5, 3], volume: 0.8 },
        {
          type: "subtitle",
          text: "ドリルの音が止んだ。……壁を、内側から叩く音。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "tv-glitch",
      when: { type: "time", at: 125 },
      actions: [
        { type: "visible", target: "xray-a", visible: false },
        { type: "visible", target: "xray-b", visible: true },
        { type: "sound", sound: "static", at: { node: "xray-b" }, volume: 0.7 },
        {
          type: "subtitle",
          text: "レントゲン画像が、見たことのない影に変わった。",
          duration: 5,
        },
      ],
    },
    {
      id: "mic-whisper",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "whisper", at: { node: "mic" }, volume: 0.7 },
        {
          type: "subtitle",
          text: "器具トレイから、ささやきが漏れた。「……あーん……して……」",
          duration: 5,
        },
        { type: "drone", level: 0.18 },
      ],
    },
    // 逃げ道が塞がる
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "room-door", state: "slam" },
        { type: "door", door: "room-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1, 0], volume: 0.8 },
        { type: "shake", intensity: 0.03, duration: 1 },
        { type: "fog", density: 0.035, duration: 4 },
        {
          type: "subtitle",
          text: "扉が勝手に閉まった。内線は鳴りっぱなしで、誰も出ない。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 96 },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "disco", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "dim" },
        { type: "sound", sound: "breath", at: "behind", volume: 0.8 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "照明が赤に変わった。トレイの器具が、ひとりでに転がる。",
          duration: 5,
        },
        { type: "objective", text: "器具トレイを確かめる" },
      ],
    },
    {
      id: "mic-take",
      when: {
        type: "interact",
        target: "mic",
        label: "トレイを整える",
        maxDistance: 2.4,
      },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "doctor", visible: true },
        { type: "face", target: "doctor" },
        { type: "sound", sound: "giggle", at: { node: "doctor" }, volume: 0.7 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "診察台の向こうに、白衣の人影が立っている。……ドリルを握って。",
          duration: 5,
        },
      ],
    },
    {
      id: "mic-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["mic-take", ...SCARES],
      actions: [
        { type: "visible", target: "doctor", visible: true },
        { type: "face", target: "doctor" },
        { type: "sound", sound: "giggle", at: { node: "doctor" }, volume: 0.7 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "診察台の向こうに、白衣の人影が立っている。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "doctor",
        maxAngleDeg: 22,
        maxDistance: 20,
      },
      requiresAny: ["mic-take", "mic-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "doctor" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "doctor" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "閉院後の診察室",
          text: "翌朝、出勤した衛生士は、倒れたままの診察台を見つけた。\nカルテには、十年前に閉院した医院の患者として、あなたの名前が書かれていた。",
        },
      ],
    })),
  ],
};
