import type { HorrorConfig } from "./kit/types";

/**
 * 「閉館後の水族館」の演出データ。
 * 大水槽ホール x=-2〜2, z=-10〜10（南端がシアター）。北の z=10〜22 が水槽トンネル、z=22 が出口。
 * トンネル西側のガラスの向こう（x<-1.6）は大水槽で、女（tank-woman）が現れる。
 */
const SCARES = ["scare", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "night-aquarium",
  title: "閉館後の水族館",
  intro: [
    "シアターの暗がりで、うたた寝をしてしまった。",
    "目を覚ますと、館内の音楽はもう止まっていた。",
  ],
  spawn: { position: [0, 1.6, -8.5], lookAt: [0, 1.5, 4] },
  fog: { color: [0.0, 0.03, 0.07], density: 0.035 },
  ambient: { intensity: 0.08, color: [0.5, 0.7, 1] },
  flashlight: {
    enabled: false,
    intensity: 1.0,
    angleDeg: 44,
    range: 12,
    color: [0.9, 0.95, 1],
  },
  walkSpeed: 0.085,
  droneLevel: 0.08,
  triggers: [
    // ---- 0〜1分: 閉館後の静かな館内 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "閉館時間を過ぎている。……スマホの電池も切れた。",
        },
        { type: "objective", text: "水槽トンネルの先の出口へ向かう" },
        { type: "sound", sound: "rumble", at: [2, 1, 0], volume: 0.2 },
      ],
    },
    {
      id: "pump",
      when: { type: "time", at: 35 },
      actions: [
        { type: "sound", sound: "drip", at: [-2, 2, 2], volume: 0.5 },
        {
          type: "subtitle",
          text: "ポンプの音と、水の滴る音だけがする。",
          duration: 3,
        },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "fish-gone",
      when: { type: "time", at: 70 },
      actions: [
        { type: "custom", name: "fishVanish" },
        { type: "sound", sound: "drip", at: [2, 1.5, 0], volume: 0.7 },
        {
          type: "subtitle",
          text: "……水槽の魚が、一匹もいない。さっきまで泳いでいたのに。",
          duration: 4,
        },
      ],
    },
    {
      id: "hand",
      when: { type: "time", at: 115 },
      actions: [
        { type: "visible", target: "handprint", visible: true },
        { type: "sound", sound: "thud", at: [-2, 1.4, -2], volume: 1 },
        { type: "shake", intensity: 0.02, duration: 0.4 },
        {
          type: "subtitle",
          text: "ドン、と水槽の内側から何かがガラスを叩いた。",
          duration: 4,
        },
        { type: "heartbeat", bpm: 80 },
      ],
    },
    {
      id: "dark-tank",
      when: { type: "time", at: 155 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "lights", group: "tank-a", on: false },
        { type: "custom", name: "tanksDark" },
        { type: "sound", sound: "whisper", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.25 },
        {
          type: "subtitle",
          text: "水槽の照明が落ちた。……背後で、濡れた息づかい。",
          duration: 4,
        },
      ],
    },
    // ---- 3〜4分: 出口が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 195 },
      actions: [
        { type: "door", door: "exit-door", state: "slam" },
        { type: "lights", group: "exit", on: false },
        { type: "lights", group: "hall", on: false },
        { type: "flashlight", state: "on" },
        { type: "visible", target: "tank-woman", visible: true },
        { type: "drone", level: 0.5 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "出口のシャッターが落ちた。開かない。",
          duration: 4,
        },
        { type: "objective", text: "トンネルの大水槽を確かめる" },
      ],
    },
    {
      id: "spot",
      when: {
        type: "look",
        target: "tank-woman",
        maxAngleDeg: 14,
        maxDistance: 14,
      },
      requires: ["lock"],
      unless: SCARES,
      actions: [
        { type: "custom", name: "womanDrift" },
        { type: "heartbeat", bpm: 124 },
        { type: "sound", sound: "breath", at: { node: "tank-woman" } },
        {
          type: "subtitle",
          text: "大水槽の中に、女が立っている。……目を離しちゃいけない。",
          duration: 5,
        },
        { type: "objective", text: "目を離さないで" },
      ],
    },
    {
      id: "armed",
      when: { type: "after", trigger: "spot", delay: 5 },
      actions: [{ type: "sound", sound: "rattle", at: [-1.6, 1.5, 16] }],
    },
    // ---- 4〜5分: 目を逸らした瞬間 ----
    {
      id: "scare",
      when: { type: "lookAway", target: "tank-woman", minAngleDeg: 55 },
      requires: ["armed"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "tank-woman", visible: false },
        { type: "sound", sound: "slam", at: "behind", volume: 1 },
        { type: "jumpscare", figure: "drowned" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "tank-woman", visible: false },
        { type: "jumpscare", figure: "drowned" },
      ],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "閉館後の水族館",
          text: "翌朝、清掃員がトンネル水槽のガラスに手形を見つけた。\n手形は、水槽の内側についていた。\n\nその大水槽には、二十年前から魚しか入れていない。",
        },
      ],
    })),
  ],
};
