import type { HorrorConfig } from "./kit/types";

/**
 * 「ストライク」の演出データ。
 * ボウリング場は x=-8〜8, z=0〜22（入口 z=0）。レーン4本（x=-3.75, -1.25, 1.25, 3.75）が z=6 から奥の z=20 へ。
 * レーン2(x=-1.25)の奥にマスキングユニット(mask)があり、持ち上がると中に立つ女(pinner)が現れる。
 */
const SCARES = ["scare-hit", "scare-auto", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "bowling-alley",
  title: "ストライク",
  intro: [
    "閉店後のボウリング場。アルバイトの最後の仕事は、レーンのボールを片付けること。",
    "BGMの消えた広いフロアに、機械の低い唸りだけが残っている。",
  ],
  spawn: { position: [0, 1.6, 1.5], lookAt: [-1.25, 1.2, 14] },
  fog: { color: [0.05, 0.02, 0.08], density: 0.014 },
  ambient: { intensity: 0.1, color: [0.85, 0.75, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.55,
    angleDeg: 40,
    range: 13,
    color: [1, 0.97, 0.95],
  },
  walkSpeed: 0.085,
  droneLevel: 0.06,
  triggers: [
    // ---- 0〜1分: 閉店後の片付け ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "レーンの上のネオンだけが、紫に光っている。2番レーンのボールがまだ残っている。",
        },
        { type: "objective", text: "ボールラックのボールを片付ける" },
      ],
    },
    {
      id: "ball-0",
      when: {
        type: "interact",
        target: "ball-rack",
        label: "ボールを戻す",
        maxDistance: 2.6,
      },
      actions: [
        {
          type: "sound",
          sound: "thud",
          at: { node: "ball-rack" },
          volume: 0.7,
        },
        {
          type: "subtitle",
          text: "ごとん。重い。指穴の中に、長い髪の毛が一本からまっていた。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "pins-reset",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "rattle", at: [-1.25, 0.5, 20], volume: 0.9 },
        { type: "sound", sound: "rumble", at: [-1.25, 0.5, 20], volume: 0.5 },
        { type: "heartbeat", bpm: 74 },
        {
          type: "subtitle",
          text: "2番レーンの奥で、ピンのセット音。ガラガラ、ガタン。誰も投げていないのに。",
          duration: 5,
        },
      ],
    },
    {
      id: "score",
      when: { type: "time", at: 110 },
      actions: [
        { type: "visible", target: "score-a", visible: false },
        { type: "visible", target: "score-b", visible: true },
        { type: "sound", sound: "chime", at: [-1.25, 2.4, 5.8], volume: 0.6 },
        {
          type: "subtitle",
          text: "頭上のスコア画面が切り替わった。「プレイヤー2：あなた」。まだ一度も投げていない。",
          duration: 6,
        },
      ],
    },
    {
      id: "ball-return",
      when: { type: "time", at: 145 },
      actions: [
        { type: "sound", sound: "rumble", at: [-1.25, 0.3, 3], volume: 0.9 },
        { type: "visible", target: "ball-ret", visible: true },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "ボールリターンの奥から、ゴロゴロと音が近づく。トレイに、黒いボールが一つ。",
          duration: 5,
        },
      ],
    },
    {
      id: "lane-lights",
      when: { type: "time", at: 180 },
      actions: [
        { type: "lights", group: "lane-a", on: false },
        { type: "sound", sound: "whisper", at: [-1.25, 1.2, 14], volume: 0.7 },
        {
          type: "subtitle",
          text: "奥のレーンの照明が消えていく。暗がりから、囁きが聞こえる。「……つぎは……あなたの……ばん……」",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分: 出口が閉じる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "door", door: "front-door", state: "lock" },
        { type: "lights", group: "lane-b", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "move", target: "mask", to: [-1.25, 3.3, 20.4], duration: 14 },
        { type: "sound", sound: "rumble", at: [-1.25, 1.5, 20.4], volume: 0.8 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口の扉が閉まった。2番レーンの奥のマスキングユニットが、ゆっくり持ち上がっていく。",
          duration: 6,
        },
      ],
    },
    // ---- 4〜5分: レーンの奥から ----
    {
      id: "reveal",
      when: { type: "after", trigger: "lock", delay: 16 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "pinner", visible: true },
        { type: "sound", sound: "slam", at: [-1.25, 1, 20], volume: 0.9 },
        { type: "heartbeat", bpm: 125 },
        {
          type: "subtitle",
          text: "ピンの間に、濡れた髪の女が立っている。じっとこちらを見ている。",
          duration: 5,
        },
      ],
    },
    {
      id: "charge",
      when: {
        type: "look",
        target: "pinner",
        maxAngleDeg: 28,
        maxDistance: 30,
      },
      requires: ["reveal"],
      unless: SCARES,
      actions: [
        { type: "move", target: "pinner", to: [-1.25, 0, 4], duration: 2.4 },
        {
          type: "sound",
          sound: "footsteps",
          at: { node: "pinner" },
          volume: 1,
        },
        { type: "heartbeat", bpm: 150 },
      ],
    },
    {
      id: "charge-auto",
      when: { type: "after", trigger: "reveal", delay: 10 },
      unless: ["charge", ...SCARES],
      actions: [
        { type: "move", target: "pinner", to: [-1.25, 0, 4], duration: 2.4 },
        {
          type: "sound",
          sound: "footsteps",
          at: { node: "pinner" },
          volume: 1,
        },
        { type: "heartbeat", bpm: 150 },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "charge", delay: 2.3 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "pinner" }],
    },
    {
      id: "scare-auto",
      when: { type: "after", trigger: "charge-auto", delay: 2.3 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "pinner" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "pinner" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "ストライク",
          text: "翌朝、2番レーンのスコアには、誰も投げていないはずの「X」が十回、並んでいた。\n\nピンセッターの奥からは、一人分の濡れた足跡が、入口の扉へと続いていたという。",
        },
      ],
    })),
  ],
};
