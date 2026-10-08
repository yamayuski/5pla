import type { HorrorConfig } from "./kit/types";

/**
 * 「夜のプール」の演出データ。
 * 室内プール：デッキ x=-8〜8, z=0〜22、水面 x=-3.5〜3.5, z=5〜19。更衣室は z<0。
 * 水底に沈む女 swimmer（仰向けで水中を移動）と、浮上して飛び出す ghost（ジャンプスケア用）。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "school-pool",
  title: "夜のプール",
  intro: [
    "部活の帰りに、プールサイドへゴーグルを置き忘れたことに気づいた。",
    "夜の校舎に忍び込んで、さっと取って帰るだけ。",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [3.5, 1.2, 12] },
  fog: { color: [0.02, 0.05, 0.06], density: 0.018 },
  ambient: { intensity: 0.07, color: [0.7, 0.9, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.6,
    angleDeg: 42,
    range: 13,
    color: [0.95, 1, 1],
  },
  walkSpeed: 0.08,
  droneLevel: 0.06,
  triggers: [
    // ---- 0〜1分: 忘れ物を取りに ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "塩素の匂い。非常灯と、水の中の青い照明だけが灯っている。",
        },
        { type: "objective", text: "プールサイドのゴーグルを取る" },
      ],
    },
    {
      id: "goggles",
      when: {
        type: "interact",
        target: "goggles",
        label: "ゴーグルを拾う",
        maxDistance: 2.2,
      },
      actions: [
        { type: "visible", target: "goggles", visible: false },
        { type: "sound", sound: "drip", at: [0, 0, 12], volume: 0.7 },
        {
          type: "subtitle",
          text: "あった。さっさと帰ろう。……水面が、さっきより静かすぎる。",
          duration: 5,
        },
        { type: "objective", text: "更衣室へ戻る" },
      ],
    },
    // ---- 1〜3分: 水の底 ----
    {
      id: "swimmer",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "swimmer", visible: true },
        { type: "sound", sound: "drip", at: [0, 0, 17], volume: 0.8 },
        {
          type: "subtitle",
          text: "水の底に、誰かが仰向けに沈んでいる。顔は、真上を向いたまま。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "swim-1",
      when: { type: "time", at: 85 },
      actions: [
        { type: "move", target: "swimmer", to: [0, -1.2, 12], duration: 100 },
      ],
    },
    {
      id: "whistle",
      when: { type: "time", at: 135 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 3, 20], volume: 0.7 },
        { type: "sound", sound: "rumble", at: [0, -1, 12], volume: 0.4 },
        {
          type: "subtitle",
          text: "ピーッ、と笛の音。誰もいないはずの更衣室のほうから。",
          duration: 4,
        },
      ],
    },
    {
      id: "pool-flicker",
      when: { type: "time", at: 170 },
      actions: [
        { type: "flicker", duration: 1.6 },
        { type: "sound", sound: "thud", at: [3.5, 0, 12], volume: 0.7 },
        { type: "drone", level: 0.22 },
        {
          type: "subtitle",
          text: "水中の照明がちかちか瞬く。コースロープが、勝手に揺れている。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 出口が閉じる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "pool-door", state: "slam" },
        { type: "door", door: "pool-door", state: "lock" },
        { type: "lights", group: "deck", on: false },
        { type: "flashlight", state: "dim" },
        { type: "fog", density: 0.04, duration: 4 },
        { type: "drone", level: 0.4 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "更衣室の扉が叩きつけられた。デッキの灯りが消え、青い水の光だけが残る。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "approach",
      when: { type: "after", trigger: "lock", delay: 5 },
      actions: [
        { type: "move", target: "swimmer", to: [0, -1.2, 6.2], duration: 32 },
        { type: "sound", sound: "breath", at: [0, -0.5, 8], volume: 0.7 },
        {
          type: "subtitle",
          text: "沈んでいた人影が、水の底をすべるようにこちらの岸へ寄ってくる。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: 浮上 ----
    {
      id: "surface",
      when: { type: "after", trigger: "lock", delay: 38 },
      unless: SCARES,
      actions: [
        {
          type: "sound",
          sound: "whisper",
          at: { node: "swimmer" },
          volume: 0.9,
        },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "水面がゆっくり盛り上がる。真上を向いていた目が、ぱちりと開いた。",
          duration: 4,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "swimmer",
        maxAngleDeg: 30,
        maxDistance: 25,
      },
      requires: ["surface"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "surface", delay: 8 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
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
          title: "夜のプール",
          text: "翌朝、水泳部の顧問がプールの底から拾い上げたのは、三十年前の古いゴーグルだった。\nレンズの内側は、なぜかまだ濡れていた。\n\n更衣室の扉には、内側から無数の爪の跡が残っていたという。",
        },
      ],
    })),
  ],
};
