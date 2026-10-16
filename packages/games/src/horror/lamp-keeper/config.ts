import type { HorrorConfig } from "./kit/types";

/** 「灯台の夜」の演出データ。管理室 x=-3〜3, z=0〜6。beacon(0,5.3)、keeper は最後に装置の前へ現れる。 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "lamp-keeper",
  title: "灯台の夜",
  intro: [
    "嵐の夜、無人の灯台に代理の番として入った。",
    "灯りを回し続ければ、朝には交代が来る。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.5, 5] },
  fog: { color: [0.05, 0.06, 0.08], density: 0.02 },
  ambient: { intensity: 0.07, color: [0.75, 0.85, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.7,
    angleDeg: 42,
    range: 12,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.08,
  droneLevel: 0.07,
  triggers: [
    // ---- 0〜1分: 避難小屋で火を入れる ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "波の音と風の唸り。灯室の装置は止まったままだ。",
        },
        { type: "objective", text: "薪灯りを点ける" },
      ],
    },
    {
      id: "beacon-on",
      when: {
        type: "interact",
        target: "beacon",
        label: "灯りを点ける",
        maxDistance: 2.2,
      },
      actions: [
        { type: "lights", group: "desk", on: true },
        { type: "sound", sound: "rattle", at: { node: "beacon" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "ぱち、と薪がはぜた。橙色の灯りが、小屋の壁をゆっくり照らしていく。",
          duration: 5,
        },
        { type: "objective", text: "夜明けを待つ" },
      ],
    },
    {
      id: "beacon-auto",
      when: { type: "time", at: 55 },
      unless: ["beacon-on"],
      actions: [
        { type: "lights", group: "desk", on: true },
        {
          type: "subtitle",
          text: "かじかむ手で、どうにかストーブに火が回った。",
          duration: 4,
        },
        { type: "objective", text: "夜明けを待つ" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "window-knock",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "knock", at: [3.9, 1.6, 4], volume: 0.8 },
        {
          type: "subtitle",
          text: "コン、コン。ここは最上階なのに、窓が外から叩かれた。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "prints-a",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "step", at: "behind", volume: 0.5 },
        {
          type: "subtitle",
          text: "階段の下から、濡れた足音が一段ずつ上ってくる。",
          duration: 6,
        },
      ],
    },
    {
      id: "radio",
      when: { type: "time", at: 160 },
      actions: [
        { type: "sound", sound: "static", at: { node: "radio" }, volume: 0.7 },
        { type: "sound", sound: "whisper", at: { node: "radio" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "無線機が勝手に鳴った。「……交代は……もう……上にいる……」",
          duration: 5,
        },
        { type: "drone", level: 0.18 },
      ],
    },
    // ---- 3〜4分: 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "stair-door", state: "slam" },
        { type: "door", door: "stair-door", state: "lock" },
        { type: "sound", sound: "rumble", at: [0, 2, 0], volume: 0.7 },
        { type: "shake", intensity: 0.03, duration: 1.2 },
        { type: "fog", density: 0.04, duration: 4 },
        {
          type: "subtitle",
          text: "突風。階段の扉が勝手に閉まり、動かなくなった。足音が、すぐ外まで来ている。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 96 },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "beacon-out",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "desk", on: false },
        { type: "flashlight", state: "dim" },
        { type: "sound", sound: "breath", at: "behind", volume: 0.8 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "灯りが、ふっと消えた。背後で、誰かが息をしている。",
          duration: 5,
        },
        { type: "objective", text: "装置を調べて灯りを戻す" },
      ],
    },
    // ---- 4〜5分: 火を戻した先に ----
    {
      id: "relight",
      when: {
        type: "interact",
        target: "beacon",
        label: "もう一度灯す",
        maxDistance: 2.4,
      },
      requires: ["beacon-out"],
      unless: SCARES,
      actions: [
        { type: "lights", group: "desk", on: true },
        { type: "flashlight", state: "on" },
        { type: "visible", target: "keeper", visible: true },
        { type: "face", target: "keeper" },
        { type: "sound", sound: "creak", at: { node: "keeper" }, volume: 0.7 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "灯りが戻った。装置の前に、ずぶ濡れの灯台守が立っている。……さっきまで、いなかった。",
          duration: 5,
        },
      ],
    },
    {
      id: "relight-auto",
      when: { type: "after", trigger: "beacon-out", delay: 35 },
      unless: ["relight", ...SCARES],
      actions: [
        { type: "lights", group: "desk", on: true },
        { type: "visible", target: "keeper", visible: true },
        { type: "face", target: "keeper" },
        { type: "sound", sound: "creak", at: { node: "keeper" }, volume: 0.7 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "灯りが勝手に回りだした。装置の前に、ずぶ濡れの灯台守が立っている。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "keeper",
        maxAngleDeg: 22,
        maxDistance: 20,
      },
      requiresAny: ["relight", "relight-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "keeper" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "keeper" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "灯台の夜",
          text: "夜明けに交代が着いたとき、灯台の灯りは消えていた。\n日誌の最後の行には「異常なし」と、濡れた文字が増えていたという。",
        },
      ],
    })),
  ],
};
