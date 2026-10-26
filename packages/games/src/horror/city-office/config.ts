import type { HorrorConfig } from "./kit/types";

/**
 * 「47番でお待ちの方」の演出データ。
 * 窓口ホールは x=-6〜6, z=0〜14。3番窓口(x=4, z=12)に職員。呼び出し表示 disp-0..3 を visible で切り替える。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "city-office",
  title: "47番でお待ちの方",
  intro: [
    "夜間受付の市役所。急ぎの書類を出しに来たのに、待合は誰もいない。",
    "まずは、発券機で番号札を取ろう。",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [3, 1.5, 8] },
  fog: { color: [0.05, 0.06, 0.05], density: 0.013 },
  ambient: { intensity: 0.1, color: [0.85, 1, 0.9] },
  flashlight: {
    enabled: true,
    intensity: 0.4,
    angleDeg: 40,
    range: 12,
    color: [0.95, 1, 0.95],
  },
  walkSpeed: 0.085,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "蛍光灯のうなり。窓口の奥は、誰も座っていない。",
        },
        { type: "objective", text: "発券機で番号札を取る" },
      ],
    },
    {
      id: "ticket",
      when: {
        type: "interact",
        target: "ticket-machine",
        label: "番号札を取る",
        maxDistance: 2.6,
      },
      actions: [
        {
          type: "sound",
          sound: "chime",
          at: { node: "ticket-machine" },
          volume: 0.6,
        },
        {
          type: "subtitle",
          text: "番号札は「47番」。前に46人も待っているはずなのに、ホールには誰もいない。",
          duration: 6,
        },
        { type: "objective", text: "47番が呼ばれるのを待つ" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "call-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "disp-0", visible: false },
        { type: "visible", target: "disp-1", visible: true },
        { type: "sound", sound: "chime", at: [0, 2.7, 13.9], volume: 0.8 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "ピンポーン。「43番の方、1番窓口へ」。誰も立ち上がらない。窓口にも誰もいない。",
          duration: 6,
        },
      ],
    },
    {
      id: "chairs",
      when: { type: "time", at: 110 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "sound", sound: "creak", at: [-1.5, 0.5, 6], volume: 0.7 },
        { type: "sound", sound: "creak", at: [3.5, 0.5, 7.5], volume: 0.5 },
        {
          type: "subtitle",
          text: "待合の椅子が、一つずつ、座る人もいないのに軋んだ。まるで見えない人が、順番に席を立つように。",
          duration: 6,
        },
      ],
    },
    {
      id: "call-2",
      when: { type: "time", at: 150 },
      actions: [
        { type: "visible", target: "disp-1", visible: false },
        { type: "visible", target: "disp-2", visible: true },
        { type: "sound", sound: "chime", at: [0, 2.7, 13.9], volume: 0.8 },
        { type: "sound", sound: "whisper", at: "behind", volume: 0.5 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "「46番の方、2番窓口へ」。46番の次が、あなただ。背後で、誰かが小さく「はい」と答えた。",
          duration: 6,
        },
      ],
    },
    {
      id: "clerk-1",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "visible", target: "clerk", visible: true },
        { type: "lights", group: "win3", on: true },
        { type: "sound", sound: "breath", at: { node: "clerk" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "3番窓口に灯りがついた。うつむいた職員が、書類に何かを書き続けている。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "visible", target: "disp-2", visible: false },
        { type: "visible", target: "disp-3", visible: true },
        { type: "sound", sound: "chime", at: [0, 2.7, 13.9], volume: 1 },
        { type: "door", door: "entrance", state: "slam" },
        { type: "door", door: "entrance", state: "lock" },
        { type: "lights", group: "hall", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "「47番の方、3番窓口へ」。入口の自動ドアが閉まった。照明が落ち、3番窓口だけが明るい。",
          duration: 7,
        },
        { type: "objective", text: "3番窓口へ番号札を出す" },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "interact",
        target: "pane-3",
        label: "番号札を出す",
        maxDistance: 4,
      },
      requires: ["lock"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "lock", delay: 55 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "stinger", at: "behind", volume: 0.6 },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "47番でお待ちの方",
          text: "翌朝、窓口の職員が番号札の発券機を開けると、47番の札だけが一枚、消えていた。\n夜間受付の記録に、来庁者は一人も残っていない。\n\n待合の47番の席に、まだ温もりが残っていたという。",
        },
      ],
    })),
  ],
};
