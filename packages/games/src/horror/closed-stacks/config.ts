import type { HorrorConfig } from "./kit/types";

/**
 * 「閉架書庫」の演出データ。
 * 書庫 x=-6〜6, z=0〜14。書架は x=-4,-2,0,2,4（z=4〜12）、東の壁際に固定書架。
 * 一番東の通路（x≈4.9）が「913」の棚で、最後はここで両側の書架が迫ってくる。
 */
const SCARES = ["crush", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "closed-stacks",
  title: "閉架書庫",
  intro: [
    "閉館後の大学図書館。アルバイトの最後の仕事は、地下の閉架書庫に本を一冊戻すこと。",
    "請求記号は 913。一番奥の通路だ。",
  ],
  spawn: { position: [0, 1.6, 1.6], lookAt: [0, 1.5, 8] },
  fog: { color: [0.05, 0.045, 0.04], density: 0.03 },
  ambient: { intensity: 0.06, color: [1, 0.95, 0.85] },
  flashlight: {
    enabled: true,
    intensity: 0.75,
    angleDeg: 40,
    range: 11,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.07,
  droneLevel: 0.03,
  triggers: [
    // ---- 0〜1分: いつもの閉館作業 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "空調の低い音と、古い紙の匂い。さっさと戻して帰ろう。",
        },
        { type: "objective", text: "「913」の棚に本を戻す（東端の通路）" },
      ],
    },
    {
      id: "return-book",
      when: {
        type: "interact",
        target: "slot-913",
        label: "本を戻す",
        maxDistance: 2,
      },
      actions: [
        { type: "sound", sound: "thud", at: { node: "slot-913" }, volume: 0.3 },
        {
          type: "subtitle",
          text: "ぴったり収まった。……隙間の奥に、誰かの目が見えた気がした。",
          duration: 4,
        },
        { type: "objective", text: "入口へ戻る" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "book-fall",
      when: { type: "time", at: 66 },
      actions: [
        { type: "sound", sound: "thud", at: [-3, 1, 9], volume: 0.9 },
        {
          type: "subtitle",
          text: "バサッ。西の通路で、本が一冊落ちた。",
          duration: 4,
        },
      ],
    },
    {
      id: "crank",
      when: { type: "time", at: 104 },
      actions: [
        { type: "sound", sound: "rattle", at: [-2, 1.1, 4], volume: 0.9 },
        { type: "sound", sound: "rumble", at: [-2, 1, 8], volume: 0.5 },
        { type: "move", target: "shelf--2", to: [-1.8, 0, 8], duration: 2.5 },
        {
          type: "subtitle",
          text: "誰も触っていない書架のハンドルが回り、書架がわずかに動いた。",
          duration: 4,
        },
        { type: "heartbeat", bpm: 80 },
      ],
    },
    {
      id: "desk-book",
      when: { type: "time", at: 140 },
      actions: [
        { type: "visible", target: "book-desk", visible: true },
        { type: "sound", sound: "whisper", at: [-3.6, 1, 1.4], volume: 0.5 },
        {
          type: "subtitle",
          text: "受付の机の上に、赤い表紙の本。……さっき棚に戻したはずの本だ。",
          duration: 5,
        },
      ],
    },
    {
      id: "reading",
      when: { type: "time", at: 172 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 1.4, 12.5], volume: 0.8 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "書架の奥から、ぶつぶつと本を音読する声がする。",
          duration: 4,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "entrance", state: "slam" },
        { type: "door", door: "entrance", state: "lock" },
        { type: "lights", group: "entrance", on: false },
        { type: "lights", group: "stacks-a", on: false },
        { type: "lights", group: "stacks-b", on: false },
        { type: "flicker", duration: 1.0 },
        { type: "drone", level: 0.45 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "入口の扉が閉まり、照明が落ちた。外から鍵をかけられた？",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "shelves",
      when: { type: "after", trigger: "lock", delay: 6 },
      actions: [
        { type: "sound", sound: "rattle", at: [-4, 1.1, 4] },
        { type: "sound", sound: "rumble", at: [-3, 1, 8], volume: 0.9 },
        { type: "move", target: "shelf--4", to: [-4.2, 0, 8], duration: 3 },
        { type: "move", target: "shelf-0", to: [0.2, 0, 8], duration: 3 },
        { type: "shake", intensity: 0.02, duration: 1.5 },
        {
          type: "subtitle",
          text: "暗闇のあちこちで、書架がひとりでに動き出した。",
          duration: 4,
        },
      ],
    },
    {
      id: "exit-sign",
      when: { type: "after", trigger: "lock", delay: 12 },
      actions: [
        {
          type: "subtitle",
          text: "913 の通路の一番奥に、非常口の緑の明かりが見える。",
          duration: 4,
        },
        { type: "objective", text: "913 の通路の奥、非常口へ" },
      ],
    },
    // ---- 4〜5分: 通路が閉じる ----
    {
      id: "crush",
      when: { type: "zone", center: [4.9, 1.6, 8], radius: 1.4 },
      requires: ["exit-sign"],
      unless: SCARES,
      actions: [
        { type: "move", target: "shelf-4", to: [4.25, 0, 8], duration: 2.4 },
        { type: "sound", sound: "rattle", at: [4, 1.1, 4], volume: 1 },
        { type: "sound", sound: "rumble", at: "player", volume: 1 },
        { type: "shake", intensity: 0.035, duration: 2.2 },
        { type: "lights", group: "exit", on: false },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 150 },
        {
          type: "subtitle",
          text: "書架が迫ってくる。通路が、閉じる。耳元で「……しずかに」",
          duration: 2.2,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "crush", delay: 2.4 },
      actions: [{ type: "jumpscare", figure: "librarian" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "librarian" }],
    },
    ...["scare-hit", "scare-timeout"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "閉架書庫",
          text: "翌朝、913 の棚に、見覚えのない赤い本が一冊増えていた。\n奥付の著者名は、あなたの名前だった。\n\n貸出記録は、一度も無い。",
        },
      ],
    })),
  ],
};
