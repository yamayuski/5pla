import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「先客」の演出データ。
 * 堤防：自分の竿 rod と電気ウキ float（フック floatSink / floatUp）、先客の釣り人 angler（最初から海を向いて座っている）、
 * 先端の灯台 beacon（フック beaconOff）、満ち潮 flood（フック floodIn で陸側が塞がる）、街灯 group street。
 * 最後に飛び出すのは angler-face。
 */
const SCARES = ["scare-hit", "scare-look", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "night-pier",
  title: "先客",
  intro: [
    "眠れない夜、港の外れの堤防に夜釣りに来た。",
    "先客が一人、フードを被って海の方を向いて座っている。軽く会釈したが、返事はなかった。",
  ],
  spawn: { position: [0, 1.6, 6.5], lookAt: [-2, 0.5, 12] },
  fog: { color: [0.02, 0.025, 0.035], density: 0.035 },
  ambient: { intensity: 0.05, color: [0.6, 0.7, 0.9] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 40,
    range: 12,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.07,
  droneLevel: 0.07,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "波がテトラポッドを打つ音。暗い海に、緑の電気ウキがひとつ揺れている。",
          duration: 5,
        },
        { type: "objective", text: "竿を手に取る" },
      ],
    },
    {
      id: "rod",
      when: { type: "interact", target: "rod", label: "竿を手に取る", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "rattle", at: { node: "rod" }, volume: 0.3 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "糸を張り直して、アタリを待つ。先客の竿は、ぴくりとも動かない。",
          duration: 5,
        },
      ],
    },
    {
      id: "rod-auto",
      when: { type: "time", at: 45 },
      unless: ["rod"],
      actions: [
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "時間だけが過ぎていく。先客は、一度も動いていない。",
          duration: 5,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "sink",
      when: { type: "time", at: 75 },
      actions: [
        { type: "custom", name: "floatSink" },
        { type: "sound", sound: "rattle", at: { node: "rod" }, volume: 0.7 },
        {
          type: "subtitle",
          text: "ウキが沈んだ。……引かない。ゆっくり、まっすぐ下へ、底の方へ引き込まれていく。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "float-up",
      when: { type: "after", trigger: "sink", delay: 12 },
      actions: [{ type: "custom", name: "floatUp" }],
    },
    {
      id: "wet-steps",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "step", at: "behind", volume: 0.6 },
        { type: "sound", sound: "drip", at: "behind", volume: 0.6 },
        {
          type: "subtitle",
          text: "背後のコンクリートを、ぺた、ぺた、と濡れた裸足が歩く音。振り向いても、濡れた跡しかない。",
          duration: 6,
        },
        { type: "drone", level: 0.15 },
      ],
    },
    {
      id: "beacon",
      when: { type: "time", at: 165 },
      actions: [
        { type: "custom", name: "beaconOff" },
        { type: "sound", sound: "whisper", at: { node: "angler" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "先端の灯台の灯りが消えた。先客の方から、何かつぶやく声。「……まだ、釣れない……ずっと……」",
          duration: 6,
        },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "flood",
      when: { type: "time", at: 205 },
      actions: [
        { type: "custom", name: "floodIn" },
        { type: "shake", intensity: 0.02, duration: 1 },
        { type: "fog", density: 0.07, duration: 5 },
        {
          type: "subtitle",
          text: "急に潮が満ちてきた。陸へ戻る階段が、黒い水の下に沈んでいく。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "flood", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "street", on: false },
        { type: "flashlight", state: "dim" },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "街灯が消えた。ヘッドライトの弱い光の中、先客だけがじっと海を見ている。",
          duration: 6,
        },
        { type: "objective", text: "先客に声をかける" },
      ],
    },
    {
      id: "talk",
      when: { type: "interact", target: "angler", label: "声をかける", maxDistance: 2.4 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "face", target: "angler" },
        { type: "sound", sound: "breath", at: { node: "angler" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "「あの……」。フードの頭が、首だけで、ゆっくりこちらへ回った。",
          duration: 5,
        },
      ],
    },
    {
      id: "talk-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["talk", ...SCARES],
      actions: [
        { type: "face", target: "angler" },
        { type: "sound", sound: "breath", at: { node: "angler" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "先客が、ゆっくりこちらを振り向いた。",
          duration: 5,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "after", trigger: "talk", delay: 1.8 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "angler", visible: false },
        { type: "jumpscare", figure: "angler-face" },
      ],
    },
    {
      id: "scare-look",
      when: { type: "look", target: "angler", maxAngleDeg: 20, maxDistance: 16 },
      requires: ["talk-auto"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "angler", visible: false },
        { type: "jumpscare", figure: "angler-face" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "angler", visible: false },
        { type: "jumpscare", figure: "angler-face" },
      ],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "先客",
          text: "翌朝、堤防には竿が二本、並んで立てかけてあった。\n地元の釣り人は言う。「あそこには昔から先客がいる。隣に座ると、交代させられるんだ」",
        },
      ],
    })),
  ],
};
