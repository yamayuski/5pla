import type { HorrorConfig } from "./kit/types";

/**
 * 「百の鳥居」の演出データ。
 * 参道 z=-2〜52、朱の鳥居 torii-0〜torii-11（z=4+4*i）。社は z=50。神職の人影(priest)は進行方向の鳥居の下から近づく。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "torii-road",
  title: "百の鳥居",
  intro: [
    "祖母の遺言で、山の上の小さな社へお参りに来た。",
    "夜の参道には、朱の鳥居が奥までずらりと続いている。いくつあるのか、数えてみよう。",
  ],
  spawn: { position: [0, 1.6, 0.6], lookAt: [0, 1.8, 30] },
  fog: { color: [0.05, 0.06, 0.07], density: 0.03 },
  ambient: { intensity: 0.1, color: [0.85, 0.9, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.55,
    angleDeg: 38,
    range: 15,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.09,
  droneLevel: 0.08,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "虫の声と、石灯籠の橙色の灯り。参道の入口に「振り返るべからず」の札。",
        },
        { type: "objective", text: "参道を進んで、奥の社に参拝する" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "steps",
      when: { type: "time", at: 65 },
      actions: [
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "背後で、砂利を踏む足音。自分の歩調と、少しだけずれている。",
          duration: 5,
        },
      ],
    },
    {
      id: "vanish",
      when: { type: "time", at: 110 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "visible", target: "torii-0", visible: false },
        { type: "visible", target: "torii-1", visible: false },
        { type: "visible", target: "torii-2", visible: false },
        { type: "sound", sound: "whisper", at: "behind", volume: 0.5 },
        {
          type: "subtitle",
          text: "明滅した一瞬で、入口に近い鳥居が三つ、消えていた。……数えた数が、合わない。",
          duration: 6,
        },
      ],
    },
    {
      id: "priest-1",
      when: { type: "time", at: 150 },
      actions: [
        { type: "visible", target: "priest", visible: true },
        { type: "sound", sound: "bell", at: [0, 2, 32], volume: 0.6 },
        { type: "drone", level: 0.22 },
        {
          type: "subtitle",
          text: "遠い鳥居の下に、白い装束の人影。こちらに背を向けて、静かに立っている。",
          duration: 6,
        },
      ],
    },
    {
      id: "priest-2",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "move", target: "priest", to: [0, 0, 26], duration: 0.2 },
        { type: "sound", sound: "step", at: { node: "priest" }, volume: 0.7 },
        {
          type: "subtitle",
          text: "照明が瞬くたびに、人影が鳥居ひとつ分、近づく。振り向いてはいないのに。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "close",
      when: { type: "time", at: 205 },
      actions: [
        { type: "visible", target: "torii-3", visible: false },
        { type: "visible", target: "torii-4", visible: false },
        { type: "visible", target: "torii-5", visible: false },
        { type: "lights", group: "lantern", on: false },
        { type: "fog", density: 0.06, duration: 6 },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "灯籠の火が全部消えた。後ろの鳥居は闇に溶けて、前に進むほかない。",
          duration: 6,
        },
      ],
    },
    {
      id: "come",
      when: { type: "after", trigger: "close", delay: 6 },
      actions: [
        { type: "custom", name: "chaseOn" },
        { type: "sound", sound: "bell", at: { node: "priest" }, volume: 0.8 },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "人影が、鳥居をくぐって近づいてくる。もう、こちらを向いている。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "priest",
        maxAngleDeg: 25,
        maxDistance: 40,
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
          title: "百の鳥居",
          text: "翌朝、麓の宮司が参道を確かめると、鳥居は全部で九十九基しかなかった。\n足りないはずの一基は、どれほど探しても見つからなかったという。\n\n参道の入口には、ひとり分の足跡だけが、奥へ向かって続いていた。",
        },
      ],
    })),
  ],
};
