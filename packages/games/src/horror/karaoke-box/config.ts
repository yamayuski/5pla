import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「延長しますか？」の演出データ。
 * 部屋は x=-3〜3, z=0〜7。扉 room-door（南）、テーブルの mic / remote、北のモニター tv-a / tv-b。
 * 最後は singer（ソファに座る白い服の女）が現れる。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "karaoke-box",
  title: "延長しますか？",
  intro: [
    "終電を逃して、一人でカラオケに入った。",
    "朝までのフリータイム。ただ静かに過ごしたいだけだった。",
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
          text: "壁越しに、どこかの部屋の歌声が薄く漏れてくる。",
        },
        { type: "objective", text: "リモコンで曲を入れる" },
      ],
    },
    {
      id: "disco-on",
      when: {
        type: "interact",
        target: "remote",
        label: "曲を入れる",
        maxDistance: 2.4,
      },
      actions: [
        { type: "lights", group: "disco", on: true },
        { type: "sound", sound: "chime", at: { node: "remote" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "ミラーボールが回り始めた。でも、歌う気にはなれない。",
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
          text: "予約していた曲が、勝手に流れ始めた。",
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
          text: "隣の歌声が止んだ。……壁を、内側から叩く音。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "tv-glitch",
      when: { type: "time", at: 125 },
      actions: [
        { type: "visible", target: "tv-a", visible: false },
        { type: "visible", target: "tv-b", visible: true },
        { type: "sound", sound: "static", at: { node: "tv-b" }, volume: 0.7 },
        {
          type: "subtitle",
          text: "モニターの歌詞が、見たことのない文字列に変わった。",
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
          text: "テーブルのマイクから、ささやきが漏れた。「……いっしょに……うたお……」",
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
          text: "照明が赤に変わった。マイクが、ひとりでに転がる。",
          duration: 5,
        },
        { type: "objective", text: "マイクを止める" },
      ],
    },
    {
      id: "mic-take",
      when: {
        type: "interact",
        target: "mic",
        label: "マイクを置き直す",
        maxDistance: 2.4,
      },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "singer", visible: true },
        { type: "face", target: "singer" },
        { type: "sound", sound: "giggle", at: { node: "singer" }, volume: 0.7 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "向かいのソファに、白い服の女が座っている。……マイクを握って。",
          duration: 5,
        },
      ],
    },
    {
      id: "mic-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["mic-take", ...SCARES],
      actions: [
        { type: "visible", target: "singer", visible: true },
        { type: "face", target: "singer" },
        { type: "sound", sound: "giggle", at: { node: "singer" }, volume: 0.7 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "向かいのソファに、白い服の女が座っている。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "singer",
        maxAngleDeg: 22,
        maxDistance: 20,
      },
      requiresAny: ["mic-take", "mic-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "singer" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "singer" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "延長しますか？",
          text: "翌朝、清掃の店員は誰もいない個室で、点いたままのモニターを見つけた。\n予約履歴には、深夜から延長された二名分の入室記録だけが残っていた。",
        },
      ],
    })),
  ],
};
