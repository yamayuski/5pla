import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「残業中」の演出データ。
 * 自分の席の画面 my-pc / my-pc-b、複合機 printer と散らばる紙 prints・拾う一枚 print-face、課長席 boss-chair、
 * ガラス扉 glass-door、天井灯 group row-1〜3（奥から消える）と非常口の緑 red。最後は自分の席に立つ colleague。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "overtime-office",
  title: "残業中",
  intro: [
    "午前二時のオフィス。締め切りは朝九時。フロアに残っているのは自分だけ。",
    "人感センサーの照明は、動かないと奥から順に消えていく。",
  ],
  spawn: { position: [-4.4, 1.6, 4.4], lookAt: [-2.8, 1.0, 4.4] },
  fog: { color: [0.02, 0.02, 0.025], density: 0.02 },
  ambient: { intensity: 0.06, color: [0.85, 0.9, 1] },
  flashlight: {
    enabled: false,
    intensity: 0.45,
    angleDeg: 42,
    range: 10,
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
          text: "空調の唸りとキーボードの音。窓の外の夜景だけが明るい。",
          duration: 5,
        },
        { type: "objective", text: "報告書を保存する" },
      ],
    },
    {
      id: "save",
      when: { type: "interact", target: "my-pc", label: "保存する", maxDistance: 2.2 },
      actions: [
        { type: "sound", sound: "chime", at: { node: "my-pc" }, volume: 0.4 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "保存完了。あとは複合機で印刷して帰るだけだ。",
          duration: 4,
        },
      ],
    },
    {
      id: "save-auto",
      when: { type: "time", at: 45 },
      unless: ["save"],
      actions: [
        { type: "sound", sound: "chime", at: { node: "my-pc" }, volume: 0.4 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "自動保存の音が鳴った。",
          duration: 4,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "row3-off",
      when: { type: "time", at: 75 },
      actions: [
        { type: "lights", group: "row-3", on: false },
        { type: "sound", sound: "buzz", at: [0, 2.6, 10], volume: 0.4 },
        {
          type: "subtitle",
          text: "奥の照明が消えた。……センサーは、動くものに反応するはずなのに、今は消えるだけだ。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 72 },
      ],
    },
    {
      id: "print",
      when: { type: "time", at: 120 },
      actions: [
        { type: "visible", target: "prints", visible: true },
        { type: "sound", sound: "rattle", at: { node: "printer" }, volume: 0.7 },
        { type: "sound", sound: "buzz", at: { node: "printer" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "誰も操作していない複合機が、紙を吐き出し始めた。床に散らばっていく。",
          duration: 6,
        },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "pc-msg",
      when: { type: "time", at: 165 },
      actions: [
        { type: "visible", target: "my-pc", visible: false },
        { type: "visible", target: "my-pc-b", visible: true },
        { type: "sound", sound: "creak", at: { node: "boss-chair" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "画面に社内チャット。「おつかれさまです　まだいますか」。課長席の椅子が、きい、と回った。",
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
        { type: "door", door: "glass-door", state: "slam" },
        { type: "door", door: "glass-door", state: "lock" },
        { type: "lights", group: "row-2", on: false },
        { type: "sound", sound: "slam", at: [-4, 1, 0], volume: 0.8 },
        { type: "sound", sound: "chime", at: [-4, 2, 0], volume: 0.6 },
        {
          type: "subtitle",
          text: "「セキュリティを開始します」。ガラス扉が閉まり、ロックが掛かった。中に人がいるのに。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "row-1", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "on" },
        { type: "visible", target: "print-face", visible: true },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "最後の照明が消えた。複合機の前に、一枚だけ表を向いた紙が落ちている。",
          duration: 6,
        },
        { type: "objective", text: "複合機の前の紙を拾う" },
      ],
    },
    {
      id: "pick",
      when: { type: "interact", target: "printer", label: "紙を拾う", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "colleague", visible: true },
        { type: "face", target: "colleague" },
        { type: "sound", sound: "breath", at: { node: "colleague" }, volume: 0.7 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "防犯カメラの画像だった。デスクで画面を見つめる自分と、その真後ろに立つ人。撮影時刻は、今。",
          duration: 7,
        },
      ],
    },
    {
      id: "pick-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["pick", ...SCARES],
      actions: [
        { type: "visible", target: "colleague", visible: true },
        { type: "face", target: "colleague" },
        { type: "sound", sound: "creak", at: { node: "colleague" }, volume: 0.7 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "自分の席の方で、椅子の軋む音がした。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "colleague", maxAngleDeg: 20, maxDistance: 16 },
      requiresAny: ["pick", "pick-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "colleague" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "colleague" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "残業中",
          text: "朝、出社した同僚たちは、きちんと保存された報告書を見つけた。\n防犯カメラには、午前二時から朝まで、デスクの前に立ち続ける二人の姿が映っていた。",
        },
      ],
    })),
  ],
};
