import type { HorrorConfig } from "./kit/types";

/**
 * 「個室は四つ」の演出データ。
 * 公園の公衆トイレ x=-3〜3, z=0〜8。入口 entrance(z=0)。北側に個室 stall-1〜4（x=-2.4,-0.8,0.8,2.4 付近, z=6）。
 * 最後に stall-4 が開き、中に立つ ghost がこちらを向いている。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "public-restroom",
  title: "個室は四つ",
  intro: [
    "夜のジョギングの途中、どうしても我慢できず公園の公衆トイレに駆け込んだ。",
    "個室は四つ。使っているのは、自分だけのはずだ。",
  ],
  spawn: { position: [0, 1.6, 0.8], lookAt: [0, 1.4, 7] },
  fog: { color: [0.04, 0.05, 0.04], density: 0.03 },
  ambient: { intensity: 0.1, color: [0.8, 0.95, 0.85] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 40,
    range: 10,
    color: [0.95, 1, 0.95],
  },
  walkSpeed: 0.08,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "蛍光灯が小さく唸っている。個室のドアは四つ、全部閉まっている。",
        },
        { type: "objective", text: "手洗い場の鏡の前で顔を洗う" },
      ],
    },
    {
      id: "drip",
      when: { type: "time", at: 40 },
      actions: [
        { type: "sound", sound: "drip", at: [-2, 1.5, 3], volume: 0.7 },
      ],
    },
    {
      id: "knock",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "knock", at: [0.8, 1.2, 6], volume: 0.9 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "三番目の個室から、こん、こん、とノックの音。中から。",
          duration: 5,
        },
      ],
    },
    {
      id: "flush",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "rumble", at: [-2.4, 1, 6], volume: 0.7 },
        { type: "door", door: "stall-1", state: "open" },
        { type: "flicker", duration: 1 },
        {
          type: "subtitle",
          text: "一番奥の個室の水が流れ、鍵のかかっていたドアが、ゆっくり開いた。中は空っぽだ。",
          duration: 6,
        },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "whisper", at: [2.4, 1.4, 6], volume: 0.7 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "「……まだ……はいってます」と、壁の向こうで声がした。",
          duration: 5,
        },
      ],
    },
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "entrance", state: "slam" },
        { type: "door", door: "entrance", state: "lock" },
        { type: "lights", group: "wc", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "fog", density: 0.05, duration: 4 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口の扉ががしゃんと閉まった。蛍光灯が消え、闇の中でノックが続く。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "knock-fast",
      when: { type: "after", trigger: "lock", delay: 6 },
      actions: [
        { type: "sound", sound: "thud", at: [2.4, 1.2, 6], volume: 1 },
        { type: "sound", sound: "knock", at: [2.4, 1.2, 6], volume: 1 },
      ],
    },
    {
      id: "open4",
      when: { type: "after", trigger: "lock", delay: 26 },
      unless: SCARES,
      actions: [
        { type: "door", door: "stall-4", state: "slam" },
        { type: "visible", target: "ghost", visible: true },
        { type: "face", target: "ghost" },
        { type: "sound", sound: "slam", at: [2.4, 1, 6], volume: 0.9 },
        { type: "heartbeat", bpm: 130 },
        {
          type: "subtitle",
          text: "ノックが止んだ。四番目の個室のドアが開き、中に誰かが立っている。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "look", target: "ghost", maxAngleDeg: 28, maxDistance: 20 },
      requires: ["open4"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "open4", delay: 9 },
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
          title: "個室は四つ",
          text: "翌朝、公衆トイレの清掃員は、個室が五つあることに気づいた。\nいちばん奥の、扉のない個室だけが、内側から鍵がかかっていたという。",
        },
      ],
    })),
  ],
};
