import type { HorrorConfig } from "./kit/types";

/**
 * 「延長しますか」の演出データ。
 * 個室 x=-2.5〜2.5, z=0〜5（北壁 z=5 にモニター、東壁 x=2.5 にフロント直通の内線電話）。
 * 南壁 z=0 のガラス窓つきドア（x=0.8〜1.7）の外が廊下 z=-2.4〜0。廊下の西隣が 6 号室。
 */
const SCARES = ["call-front", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "karaoke-box",
  title: "延長しますか",
  intro: [
    "終電を逃した夜、駅前のカラオケで朝までひとりで過ごすことにした。",
    "7 号室。フリータイム、ドリンクバー付き。",
  ],
  spawn: { position: [-1.4, 1.6, 2.6], lookAt: [0, 1.5, 5] },
  fog: { color: [0.04, 0.02, 0.06], density: 0.02 },
  ambient: { intensity: 0.08, color: [0.7, 0.6, 1] },
  flashlight: {
    enabled: false,
    intensity: 0.7,
    angleDeg: 45,
    range: 9,
    color: [0.9, 0.95, 1],
  },
  walkSpeed: 0.07,
  droneLevel: 0.02,
  triggers: [
    // ---- 0〜1分: いつものカラオケ ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "隣の部屋から、下手な歌が漏れてくる。こっちも何か入れよう。",
        },
        { type: "objective", text: "テーブルのリモコンで曲を入れる" },
      ],
    },
    {
      id: "pick-song",
      when: {
        type: "interact",
        target: "remote",
        label: "曲を入れる",
        maxDistance: 2.2,
      },
      actions: [
        { type: "visible", target: "monitor-idle", visible: false },
        { type: "visible", target: "monitor-song", visible: true },
        { type: "sound", sound: "chime", at: { node: "monitor-song" } },
        {
          type: "subtitle",
          text: "とりあえず、いつもの一曲。……前奏が始まった。",
          duration: 3,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "phone-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "phone", at: { node: "phone" }, volume: 0.9 },
        {
          type: "subtitle",
          text: "内線が鳴っている。まだ 10 分前の電話には早い。",
          duration: 4,
        },
        { type: "objective", text: "内線電話に出る" },
      ],
    },
    {
      id: "phone-1-answer",
      when: {
        type: "interact",
        target: "phone",
        label: "受話器を取る",
        maxDistance: 2,
      },
      requires: ["phone-1"],
      unless: ["lock"],
      actions: [
        { type: "sound", sound: "static", at: "player", volume: 0.35 },
        {
          type: "subtitle",
          text: "「……お連れ様が、お見えです」……ガチャ。連れなんて、いない。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "passer",
      when: { type: "time", at: 112 },
      actions: [
        { type: "visible", target: "passer", visible: true },
        { type: "move", target: "passer", to: [5.5, 0, -1.2], duration: 4.5 },
        { type: "sound", sound: "footsteps", at: [0, 0.2, -1.2], volume: 0.5 },
        {
          type: "subtitle",
          text: "ドアのガラスの向こうを、誰かがゆっくり横切った。",
          duration: 4,
        },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "neighbor-quiet",
      when: { type: "time", at: 140 },
      actions: [
        { type: "sound", sound: "giggle", at: [-4, 1.5, 2.5], volume: 0.6 },
        {
          type: "subtitle",
          text: "隣の歌が止んだ。壁のすぐ向こうで、くすくす笑う声。",
          duration: 4,
        },
      ],
    },
    {
      id: "queued",
      when: { type: "time", at: 165 },
      actions: [
        { type: "visible", target: "monitor-idle", visible: false },
        { type: "visible", target: "monitor-song", visible: false },
        { type: "visible", target: "monitor-queue", visible: true },
        { type: "sound", sound: "buzz", at: { node: "monitor-queue" } },
        { type: "flicker", duration: 0.9 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "入れていない曲が予約されている。曲名は『ふたりで』。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "room-door", state: "slam" },
        { type: "door", door: "room-door", state: "lock" },
        { type: "lights", group: "corridor", on: false },
        { type: "visible", target: "passer", visible: false },
        { type: "lights", group: "room", on: false },
        { type: "flicker", duration: 1.2 },
        { type: "drone", level: 0.45 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "ドアが勢いよく閉まった。廊下も部屋も真っ暗だ。ドアノブが回らない。",
          duration: 5,
        },
        { type: "objective", text: "内線でフロントに知らせる" },
      ],
    },
    {
      id: "knock",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "sound", sound: "knock", at: [-2.5, 1.4, 2.5], volume: 1 },
        {
          type: "subtitle",
          text: "隣との壁を、内側から叩く音。ドン。ドン。",
          duration: 4,
        },
      ],
    },
    {
      id: "duet",
      when: { type: "after", trigger: "lock", delay: 18 },
      actions: [
        { type: "visible", target: "monitor-queue", visible: false },
        { type: "visible", target: "monitor-duet", visible: true },
        { type: "sound", sound: "whisper", at: { node: "monitor-duet" } },
        { type: "heartbeat", bpm: 120 },
        {
          type: "subtitle",
          text: "モニターの歌詞が、勝手に流れはじめた。",
          duration: 4,
        },
      ],
    },
    // ---- 4〜5分: 受話器の向こう ----
    {
      id: "call-front",
      when: {
        type: "interact",
        target: "phone",
        label: "フロントに電話する",
        maxDistance: 2,
      },
      requires: ["lock"],
      unless: SCARES,
      actions: [
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 0 },
        { type: "sound", sound: "static", at: "player", volume: 0.25 },
        {
          type: "subtitle",
          text: "「……お時間です。延長、しますか」受話器の声が、すぐ後ろからも聞こえた。",
          duration: 3,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "call-front", delay: 2.4 },
      actions: [{ type: "jumpscare", figure: "guest" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "guest" }],
    },
    ...["scare-hit", "scare-timeout"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "延長しますか",
          text: "翌朝、7 号室の伝票には「2 名様」と印字されていた。\n店員は誰も、二人目が入るところを見ていない。\n\n6 号室は、ずっと前から使われていない。",
        },
      ],
    })),
  ],
};
