import type { HorrorConfig } from "./kit/types";

/** 「音楽室の練習曲」の演出データ。ピアノ奥(z=11)に pianist が現れ、最後に振り向く。 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "music-room",
  title: "音楽室の練習曲",
  intro: [
    "忘れ物を取りに、夜の校舎の音楽室へ来た。",
    "メトロノームが、規則正しく揺れている。……誰が動かした？",
  ],
  spawn: { position: [0, 1.6, 0.8], lookAt: [0, 1.6, 10] },
  fog: { color: [0.02, 0.02, 0.03], density: 0.02 },
  ambient: { intensity: 0.08, color: [0.8, 0.85, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.6,
    angleDeg: 40,
    range: 14,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.08,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "黒板には「夜の練習は禁止です」。" },
        { type: "objective", text: "机の列の奥、ピアノのそばの忘れ物を探す" },
      ],
    },
    {
      id: "tick",
      when: { type: "time", at: 60 },
      actions: [
        {
          type: "sound",
          sound: "chime",
          at: { node: "metronome" },
          volume: 0.5,
        },
        { type: "heartbeat", bpm: 70 },
        {
          type: "subtitle",
          text: "メトロノームの音が、少しずつ速くなる。",
          duration: 5,
        },
      ],
    },
    {
      id: "portrait",
      when: { type: "time", at: 105 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "whisper", at: "behind", volume: 0.5 },
        {
          type: "subtitle",
          text: "壁の肖像画の目が、全部こちらを向いている気がする。",
          duration: 5,
        },
      ],
    },
    {
      id: "piano-note",
      when: { type: "time", at: 150 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 1, 11], volume: 0.8 },
        { type: "drone", level: 0.2 },
        { type: "subtitle", text: "ピアノが、一音だけ鳴った。", duration: 4 },
      ],
    },
    {
      id: "pianist-appear",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "visible", target: "pianist", visible: true },
        { type: "sound", sound: "chime", at: [0, 1, 11], volume: 0.9 },
        {
          type: "subtitle",
          text: "ピアノの前に、背を向けた誰かが座っている。曲が始まった。",
          duration: 6,
        },
      ],
    },
    {
      id: "lock",
      when: { type: "time", at: 215 },
      actions: [
        { type: "sound", sound: "slam", at: [0, 1, 0], volume: 0.9 },
        { type: "lights", group: "room", on: false },
        { type: "flashlight", state: "dim" },
        { type: "heartbeat", bpm: 110 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "背後で扉が閉まり、電灯が消えた。ピアノだけが鳴り続ける。",
          duration: 6,
        },
      ],
    },
    {
      id: "come",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "custom", name: "turnOn" },
        { type: "sound", sound: "stinger", at: [0, 1, 11], volume: 0.5 },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "曲が、ぴたりと止まった。ピアノの前の人影が、ゆっくりとこちらを向く。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "pianist",
        maxAngleDeg: 20,
        maxDistance: 30,
      },
      requires: ["come"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "come", delay: 18 },
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
          title: "音楽室の練習曲",
          text: "翌朝、音楽室のピアノの蓋は開いたままだった。\n楽譜台には、昨夜は無かったはずの楽譜。\n最後の小節の下に、鉛筆でこう書いてあった。「もう一度、最初から」。",
        },
      ],
    })),
  ],
};
