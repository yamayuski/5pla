import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「C-15 空室」の演出データ。
 * 自分の席 C-14（東側 z=6〜8）の PC pc と画面 screen-off/on/chat/last、隣の空室 C-15 との仕切り（z=8）、
 * 通路の照明 group aisle / 机の灯り desk / 非常灯 red、出入口 exit-door、ドリンクバー drink-bar。
 * 通路を横切る walker、最後は仕切りの上から覗く peeker。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "net-cafe",
  title: "C-15 空室",
  intro: [
    "終電を逃して、駅前のネットカフェに入った。",
    "受付で渡された伝票には「C-14」。隣は空室だと店員は言っていた。",
  ],
  spawn: { position: [1.6, 1.6, 7], lookAt: [3.7, 1.1, 7] },
  fog: { color: [0.02, 0.02, 0.03], density: 0.02 },
  ambient: { intensity: 0.06, color: [0.7, 0.75, 1] },
  flashlight: {
    enabled: false,
    intensity: 0.45,
    angleDeg: 45,
    range: 8,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.07,
  droneLevel: 0.03,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "空調の音と、どこかのブースのいびき。静かな夜だ。",
          duration: 5,
        },
        { type: "objective", text: "PCを点ける" },
      ],
    },
    {
      id: "pc-on",
      when: { type: "interact", target: "pc", label: "PCを点ける", maxDistance: 2.6 },
      actions: [
        { type: "visible", target: "screen-off", visible: false },
        { type: "visible", target: "screen-on", visible: true },
        { type: "sound", sound: "chime", at: { node: "pc" }, volume: 0.4 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ログイン画面。朝までここで過ごせばいい。",
          duration: 4,
        },
      ],
    },
    {
      id: "pc-auto",
      when: { type: "time", at: 40 },
      unless: ["pc-on"],
      actions: [
        { type: "visible", target: "screen-off", visible: false },
        { type: "visible", target: "screen-on", visible: true },
        { type: "sound", sound: "chime", at: { node: "pc" }, volume: 0.4 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "触れてもいないのに、PCが起動した。",
          duration: 4,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "knock",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "knock", at: [2.6, 1.2, 8.1], volume: 0.8 },
        {
          type: "subtitle",
          text: "コン、コン、コン。空室のはずの C-15 側の仕切りを、誰かが叩いた。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "chat",
      when: { type: "time", at: 120 },
      requiresAny: ["pc-on", "pc-auto"],
      actions: [
        { type: "visible", target: "screen-on", visible: false },
        { type: "visible", target: "screen-chat", visible: true },
        { type: "sound", sound: "chime", at: { node: "pc" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "画面にメッセージ。送り主は C-15。「となり、いますよね」",
          duration: 6,
        },
        { type: "drone", level: 0.1 },
      ],
    },
    {
      id: "walker",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "walker", visible: true },
        { type: "move", target: "walker", to: [0, 0, 1.5], duration: 9 },
        { type: "sound", sound: "footsteps", at: { node: "walker" }, volume: 0.6 },
        { type: "sound", sound: "buzz", at: { node: "drink-bar" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "ドリンクバーが勝手に注ぎ始めた。通路を、誰かが歩いていく。",
          duration: 5,
        },
      ],
    },
    {
      id: "walker-stop",
      when: { type: "after", trigger: "walker", delay: 9.5 },
      actions: [{ type: "visible", target: "walker", visible: false }],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "exit-door", state: "slam" },
        { type: "door", door: "exit-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.8 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        {
          type: "subtitle",
          text: "出口の扉が閉まり、電子錠の鳴る音がした。",
          duration: 5,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "aisle", on: false },
        { type: "lights", group: "desk", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "on" },
        { type: "visible", target: "screen-chat", visible: false },
        { type: "visible", target: "screen-on", visible: false },
        { type: "visible", target: "screen-last", visible: true },
        { type: "sound", sound: "static", at: { node: "pc" }, volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "停電。非常灯の赤だけが残った。画面に、新しいメッセージが一つ。",
          duration: 6,
        },
        { type: "objective", text: "メッセージを開く" },
      ],
    },
    {
      id: "read",
      when: { type: "interact", target: "pc", label: "メッセージを開く", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "peeker", visible: true },
        { type: "sound", sound: "giggle", at: [2.6, 2.1, 8.4], volume: 0.7 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "「うえ」。……頭の上、仕切りの向こうで、くすくすと笑う声。",
          duration: 6,
        },
      ],
    },
    {
      id: "read-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["read", ...SCARES],
      actions: [
        { type: "visible", target: "peeker", visible: true },
        { type: "sound", sound: "giggle", at: [2.6, 2.1, 8.4], volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "仕切りの上から、くすくすと笑う声が降ってくる。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "peeker", maxAngleDeg: 22, maxDistance: 12 },
      requiresAny: ["read", "read-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "peeker" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "peeker" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "C-15 空室",
          text: "朝、清掃に入った店員は C-14 の伝票を見つけた。席には誰もいなかった。\nC-15 は三年前から使われていない。仕切りの上の縁にだけ、指の跡が並んでいる。",
        },
      ],
    })),
  ],
};
