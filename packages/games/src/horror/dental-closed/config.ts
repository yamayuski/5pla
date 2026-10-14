import type { HorrorConfig } from "./kit/types";

/**
 * 「閉院のあと」の演出データ。診察室 x=-4〜4, z=0〜8、出入口 clinic-door は南壁。
 * 診察台は(2,4.5)。歯科医 dentist は最後に診察台へ現れる。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "dental-closed",
  title: "閉院のあと",
  intro: [
    "診察券を忘れて、閉院後の歯科医院に戻ってきた。",
    "受付の奥で、鍵は開いたままだ。",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [0, 1.5, 6] },
  fog: { color: [0.05, 0.07, 0.07], density: 0.015 },
  ambient: { intensity: 0.08, color: [0.8, 1, 0.95] },
  flashlight: {
    enabled: true,
    intensity: 0.7,
    angleDeg: 42,
    range: 12,
    color: [1, 0.98, 0.95],
  },
  walkSpeed: 0.08,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "lights", group: "room", on: true },
        {
          type: "subtitle",
          text: "消毒液のにおい。蛇口から水が一滴ずつ落ちる音だけがする。",
        },
        { type: "objective", text: "受付の電話の横にある診察券を探す" },
      ],
    },
    {
      id: "card",
      when: {
        type: "interact",
        target: "phone",
        label: "診察券を探す",
        maxDistance: 2.2,
      },
      actions: [
        { type: "sound", sound: "chime", at: { node: "phone" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "あった。……でも、これは自分の名前ではない。",
          duration: 5,
        },
        { type: "objective", text: "帰る" },
      ],
    },
    {
      id: "drip",
      when: { type: "time", at: 40 },
      actions: [{ type: "sound", sound: "drip", at: "behind", volume: 0.6 }],
    },
    // 小さな異変
    {
      id: "drill",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "tray" }, volume: 0.8 },
        {
          type: "subtitle",
          text: "診察室のほうで、ドリルが一瞬だけ唸って止まった。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "chair-turn",
      when: { type: "time", at: 120 },
      actions: [
        { type: "lights", group: "dental", on: true },
        { type: "sound", sound: "creak", at: [2, 1, 4.5], volume: 0.7 },
        {
          type: "subtitle",
          text: "無影灯が点いた。誰も座っていない診察台が、ゆっくり向きを変えている。",
          duration: 6,
        },
      ],
    },
    {
      id: "xray-on",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "whisper", at: { node: "xray" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "壁のレントゲン写真が目に入る。「歯が一本多い」。……自分の名前が書いてある。",
          duration: 6,
        },
        { type: "drone", level: 0.18 },
      ],
    },
    // 逃げ道
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "clinic-door", state: "slam" },
        { type: "door", door: "clinic-door", state: "lock" },
        { type: "shake", intensity: 0.03, duration: 1 },
        { type: "fog", density: 0.035, duration: 4 },
        {
          type: "subtitle",
          text: "出入口が叩きつけるように閉まった。鍵が、内側から掛かる音。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 100 },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "room", on: false },
        { type: "flashlight", state: "dim" },
        { type: "sound", sound: "breath", at: "behind", volume: 0.8 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "停電。暗闇の中で、無影灯だけが診察台を照らしている。「次の方、どうぞ」",
          duration: 6,
        },
        { type: "objective", text: "診察台の様子を確かめる" },
      ],
    },
    {
      id: "dentist-appear",
      when: { type: "after", trigger: "blackout", delay: 25 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "dentist", visible: true },
        { type: "face", target: "dentist" },
        { type: "sound", sound: "buzz", at: { node: "dentist" }, volume: 0.8 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "診察台に、マスクの歯科医が座っている。ドリルが回り始めた。",
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
      requires: ["dentist-appear"],
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
          text: "翌朝、診察室には誰もいなかった。\nただ診察台には、まだ温かい来院記録が一枚。今夜の患者の欄には、あなたの名前があった。",
        },
      ],
    })),
  ],
};
