import type { HorrorConfig } from "./kit/types";

/**
 * 「17番」の演出データ。
 * 通路は x=-3〜3, z=0〜22。西壁のロッカー群の 17 番が z=12.5。最後に 17 番の扉が内側から開く。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];
const LOCKED = ["lock"];

export const config: HorrorConfig = {
  slug: "coin-locker",
  title: "17番",
  intro: [
    "終電を逃した夜、駅のコインロッカーに預けた荷物を取りに来た。",
    "鍵には「17」と書かれている。誰もいない通路に、蛍光灯の音だけが響く。",
  ],
  spawn: { position: [0, 1.6, 1.3], lookAt: [-2.4, 1.3, 12.5] },
  fog: { color: [0.05, 0.06, 0.05], density: 0.02 },
  ambient: { intensity: 0.1, color: [0.85, 1, 0.9] },
  flashlight: {
    enabled: true,
    intensity: 0.45,
    angleDeg: 40,
    range: 11,
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
          text: "西側の壁一面にロッカーが並んでいる。17番は、通路のちょうど真ん中あたり。",
        },
        { type: "objective", text: "17番のロッカーを開ける" },
      ],
    },
    {
      id: "try",
      when: {
        type: "interact",
        target: "locker-17",
        label: "鍵を回す",
        maxDistance: 2.5,
      },
      unless: LOCKED,
      actions: [
        {
          type: "sound",
          sound: "rattle",
          at: { node: "locker-17" },
          volume: 0.6,
        },
        {
          type: "subtitle",
          text: "鍵は回る。なのに、扉が開かない。内側から、誰かが押さえているみたいに。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "knock",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "knock", at: [-2.4, 1.1, 12.5], volume: 0.8 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "コン、コン。17番のロッカーの中から、控えめなノックの音。",
          duration: 5,
        },
      ],
    },
    {
      id: "open-a",
      when: { type: "time", at: 110 },
      actions: [
        { type: "flicker", duration: 1.0 },
        {
          type: "move",
          target: "locker-a",
          to: [-1.9, 1.1, 6.1],
          duration: 1.5,
        },
        {
          type: "sound",
          sound: "creak",
          at: { node: "locker-a" },
          volume: 0.8,
        },
        {
          type: "subtitle",
          text: "手前の扉が一枚、ひとりでに開いた。中は空っぽで、内側に爪でひっかいた跡がある。",
          duration: 6,
        },
      ],
    },
    {
      id: "open-bcd",
      when: { type: "time", at: 150 },
      actions: [
        {
          type: "move",
          target: "locker-b",
          to: [-1.9, 0.4, 9.1],
          duration: 1.2,
        },
        {
          type: "move",
          target: "locker-c",
          to: [-1.9, 1.8, 16.1],
          duration: 1.6,
        },
        { type: "sound", sound: "thud", at: [-2.4, 1, 9.5], volume: 0.7 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "また二枚。扉が次々と開いていく。開くたびに、17番へ近づいているような気がする。",
          duration: 6,
        },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        {
          type: "move",
          target: "locker-d",
          to: [-1.9, 1.1, 19.1],
          duration: 1.2,
        },
        { type: "sound", sound: "whisper", at: [-2.4, 1.1, 12.5], volume: 0.6 },
        {
          type: "subtitle",
          text: "「……出して……」。17番の中から、かすれた声。時刻表の最終電車は、とうに出ている。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "gate", state: "slam" },
        { type: "door", door: "gate", state: "lock" },
        { type: "lights", group: "hall", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "shake", intensity: 0.3, duration: 0.6 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口のシャッターが落ちた。照明が全て消える。17番のロッカーが、内側から激しく叩かれている。",
          duration: 7,
        },
        { type: "objective", text: "17番の扉を押さえる" },
      ],
    },
    {
      id: "pound",
      when: { type: "after", trigger: "lock", delay: 6 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "thud", at: [-2.4, 1.1, 12.5], volume: 1 },
        { type: "shake", intensity: 0.2, duration: 0.4 },
        { type: "heartbeat", bpm: 135 },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "interact",
        target: "locker-17",
        label: "扉を押さえる",
        maxDistance: 3,
      },
      requires: LOCKED,
      unless: SCARES,
      actions: [
        {
          type: "move",
          target: "locker-17",
          to: [-0.8, 1.1, 12.1],
          duration: 0.15,
        },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "lock", delay: 55 },
      unless: SCARES,
      actions: [
        {
          type: "move",
          target: "locker-17",
          to: [-0.8, 1.1, 12.1],
          duration: 0.15,
        },
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
          title: "17番",
          text: "翌朝、駅員が17番のロッカーを開けると、中は空だった。\n扉の内側には、数えきれないほどの爪の跡と、指の長さほどの小さな手形が残されていたという。\n\n預け入れ期限は、三年前の今日になっていた。",
        },
      ],
    })),
  ],
};
