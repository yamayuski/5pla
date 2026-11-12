import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「値付け前」の演出データ。
 * 書棚2列の間の通路、本 fall-book（棚から落ちる）、通路奥の人影 peeker、帳場の店主 owner、
 * 入荷本 new-book（interact）、入口 front-door、照明 group shop / desk。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "used-bookstore",
  title: "値付け前",
  intro: [
    "雨宿りに入った古書店。閉店まであと十分と、帳場の老人は言った。",
    "ふと気づくと、老人の姿は見えない。店の奥まで、一冊探してみよう。",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [0, 1.4, 8] },
  fog: { color: [0.03, 0.025, 0.02], density: 0.02 },
  ambient: { intensity: 0.09, color: [0.9, 0.8, 0.65] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 10, color: [1, 0.95, 0.85] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "紙とカビの匂い。時計の音だけが聞こえる。", duration: 5 },
        { type: "objective", text: "店の奥へ進む" },
      ],
    },
    {
      id: "book-fall",
      when: { type: "time", at: 50 },
      actions: [
        { type: "custom", name: "bookFall" },
        { type: "subtitle", text: "棚から、本が一冊だけ落ちた。誰も触れていないのに。", duration: 4 },
      ],
    },
    {
      id: "peek-1",
      when: { type: "time", at: 95 },
      actions: [
        { type: "visible", target: "peeker", visible: true },
        { type: "sound", sound: "whisper", at: { node: "peeker" }, volume: 0.5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "peek-away",
      when: { type: "lookAway", target: "peeker", minAngleDeg: 30 },
      requires: ["peek-1"],
      actions: [
        { type: "visible", target: "peeker", visible: false },
        { type: "subtitle", text: "通路の奥に、長い髪の人が立っていた……目を逸らすと、もういない。", duration: 5 },
      ],
    },
    {
      id: "peek-auto",
      when: { type: "time", at: 110 },
      actions: [{ type: "visible", target: "peeker", visible: false }],
    },
    {
      id: "page-whisper",
      when: { type: "time", at: 150 },
      actions: [
        { type: "sound", sound: "rattle", at: [1.7, 1.2, 5.5], volume: 0.6 },
        { type: "sound", sound: "whisper", at: [-1.7, 1.2, 6], volume: 0.6 },
        { type: "subtitle", text: "両側の棚の本が、ひとりでにめくれている。ページの擦れる音が、ささやきに聞こえる。", duration: 6 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "clock",
      when: { type: "time", at: 190 },
      actions: [
        { type: "sound", sound: "bell", at: [0, 2, 9], volume: 0.7 },
        { type: "subtitle", text: "帳場の柱時計が、閉店の鐘を鳴らした。", duration: 4 },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 215 },
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "door", door: "front-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "lights", group: "shop", on: false },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "入口が閉まり、店の明かりが落ちた。帳場の灯りだけが残っている。", duration: 5 },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.4 },
        { type: "flashlight", state: "on" },
        { type: "fog", density: 0.05, duration: 5 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 108 },
        { type: "subtitle", text: "帳場に、見覚えのない本が一冊置かれている。値札には「本日の入荷」。", duration: 6 },
        { type: "objective", text: "帳場の本を調べる" },
      ],
    },
    {
      id: "book-open",
      when: { type: "interact", target: "new-book", label: "本を開く", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "lights", group: "desk", on: false },
        { type: "visible", target: "owner", visible: true },
        { type: "sound", sound: "breath", at: { node: "owner" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "表紙の題名は、あなたの名前だった。顔を上げると、帳場に老人が立っている。", duration: 6 },
      ],
    },
    {
      id: "book-auto",
      when: { type: "after", trigger: "blackout", delay: 40 },
      unless: ["book-open", ...SCARES],
      actions: [
        { type: "lights", group: "desk", on: false },
        { type: "visible", target: "owner", visible: true },
        { type: "sound", sound: "breath", at: { node: "owner" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "帳場の灯りが消え、暗闇に老人が立っている。", duration: 5 },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "after", trigger: "book-open", delay: 3 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "owner" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "owner" }],
    },
    {
      id: "scare-auto",
      when: { type: "after", trigger: "book-auto", delay: 4 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "owner" }],
    },
    ...[...SCARES, "scare-auto"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "値付け前",
          text: "翌朝、古書店の帳場に、値札のない新しい本が一冊置かれていた。\n題名は、昨夜閉店間際に入った客の名前。背表紙は、まだ温かかった。",
        },
      ],
    })),
  ],
};
