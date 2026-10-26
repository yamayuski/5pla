import type { HorrorConfig } from "./kit/types";

/** 「廃病院の巡回」。廊下は x=-1.5〜1.5, z=-12〜12。入口は南 z=-12。402号室は北端 z=12 の扉。 */
const SCARES = ["scare", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "hospital-patrol",
  title: "廃病院の巡回",
  intro: [
    "警備員として、閉鎖された病院を見回る夜。",
    "402号室のナースコールが鳴っている、と通報があった。",
  ],
  spawn: { position: [0, 1.6, -10.5], lookAt: [0, 1.4, 5] },
  fog: { color: [0.01, 0.015, 0.015], density: 0.03 },
  ambient: { intensity: 0.06, color: [0.7, 0.85, 0.8] },
  flashlight: {
    enabled: true,
    intensity: 1.2,
    angleDeg: 40,
    range: 14,
    color: [0.95, 0.98, 1],
  },
  walkSpeed: 0.09,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "ひどい埃だ。廊下の奥まで確認しよう。" },
        { type: "objective", text: "廊下の奥へ進む" },
        { type: "sound", sound: "drip", at: [0, 2, 4], volume: 0.5 },
      ],
    },
    {
      id: "wheelchair",
      when: { type: "time", at: 75 },
      actions: [
        { type: "custom", name: "wheelchairMove" },
        {
          type: "sound",
          sound: "creak",
          at: { node: "wheelchair" },
          volume: 0.8,
        },
        {
          type: "subtitle",
          text: "車椅子の位置が変わっている。……さっきは壁際だった。",
          duration: 4,
        },
      ],
    },
    {
      id: "call-light",
      when: { type: "time", at: 120 },
      actions: [
        { type: "lights", group: "call", on: true },
        { type: "custom", name: "callPanel" },
        { type: "sound", sound: "chime", at: [0, 2, 11], volume: 0.8 },
        { type: "subtitle", text: "402号室の上のランプが点いた。" },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "steps",
      when: { type: "time", at: 160 },
      actions: [
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.8 },
        { type: "subtitle", text: "背後で、スリッパの足音。", duration: 3.5 },
        { type: "drone", level: 0.25 },
      ],
    },
    {
      id: "lock",
      when: { type: "time", at: 195 },
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "flicker", duration: 1.6 },
        { type: "lights", group: "hall-a", on: false },
        { type: "lights", group: "hall-b", on: false },
        { type: "drone", level: 0.5 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "入口が閉まった。開かない。無線も繋がらない。",
          duration: 4.5,
        },
        { type: "objective", text: "402号室を確認する" },
      ],
    },
    {
      id: "call-ring",
      when: { type: "after", trigger: "lock", delay: 15 },
      actions: [
        { type: "sound", sound: "bell", at: [0, 2, 11], volume: 1 },
        { type: "sound", sound: "whisper", at: [0, 1.5, 11], volume: 0.8 },
        { type: "subtitle", text: "『……たすけて……』", duration: 3 },
      ],
    },
    {
      id: "scare",
      when: {
        type: "interact",
        target: "room-402",
        label: "402号室を開ける",
        maxDistance: 2.6,
      },
      requires: ["call-ring"],
      unless: SCARES,
      actions: [
        { type: "custom", name: "burst402" },
        { type: "sound", sound: "slam", at: [0, 1.5, 12], volume: 1 },
        { type: "jumpscare", figure: "nurse" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "nurse" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "廃病院の巡回",
          text: "402号室は十年前から空室だった。\nナースコールの配線は、とうに切れていたという。\n\n翌朝、入口の鍵は内側から開いていた。",
        },
      ],
    })),
  ],
};
