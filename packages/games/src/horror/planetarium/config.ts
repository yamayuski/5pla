import type { HorrorConfig } from "./kit/types";

/**
 * 「閉館後のプラネタリウム」の演出データ。
 * ドーム x=-5〜5, z=0〜14。投影機(projector)は z=11。天井の星空板 sky-0 / sky-1(顔の配置) / sky-2(巨大な顔)。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "planetarium",
  title: "閉館後のプラネタリウム",
  intro: [
    "閉館後のプラネタリウムで、投影機の点検をすることになった。",
    "ドームの天井は真っ暗だ。スイッチを入れれば、星が戻る。",
  ],
  spawn: { position: [-3.7, 1.6, 1.2], lookAt: [0, 1.4, 11] },
  fog: { color: [0.02, 0.02, 0.05], density: 0.012 },
  ambient: { intensity: 0.07, color: [0.7, 0.75, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.45,
    angleDeg: 40,
    range: 12,
    color: [0.95, 0.97, 1],
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
          text: "静かなドーム。奥の投影機が、黒い影のように立っている。",
        },
        { type: "objective", text: "投影機を起動して星空を点検する" },
      ],
    },
    {
      id: "start",
      when: {
        type: "interact",
        target: "projector",
        label: "投影を始める",
        maxDistance: 3,
      },
      actions: [
        { type: "visible", target: "sky-0", visible: true },
        { type: "lights", group: "star", on: true },
        { type: "custom", name: "spinSlow" },
        { type: "sound", sound: "chime", at: [0, 2, 11], volume: 0.7 },
        {
          type: "subtitle",
          text: "天井一面に星が灯った。点検は異常なし。……本当に、これが今夜の星空だろうか。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "auto-start",
      when: { type: "time", at: 45 },
      unless: ["start"],
      actions: [
        { type: "visible", target: "sky-0", visible: true },
        { type: "lights", group: "star", on: true },
        { type: "custom", name: "spinSlow" },
        { type: "sound", sound: "chime", at: [0, 2, 11], volume: 0.7 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "誰も触っていないのに、投影機が起動した。天井に星が灯る。",
          duration: 5,
        },
      ],
    },
    {
      id: "seat",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "creak", at: [-0.5, 0.5, 8], volume: 0.8 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "客席のほうで、座席が軋んだ。誰かが座ったような音。客席は無人のはずだ。",
          duration: 6,
        },
      ],
    },
    {
      id: "face-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "visible", target: "sky-0", visible: false },
        { type: "visible", target: "sky-1", visible: true },
        { type: "sound", sound: "whisper", at: [0, 3.5, 7], volume: 0.5 },
        {
          type: "subtitle",
          text: "星の並びが変わった。天井の星が、二つの目と口のように並んでいる。",
          duration: 6,
        },
      ],
    },
    {
      id: "spin",
      when: { type: "time", at: 165 },
      actions: [
        { type: "custom", name: "spinFast" },
        { type: "sound", sound: "rumble", at: [0, 1.3, 11], volume: 0.8 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "投影機の頭が、勢いよく回りだした。回るたびに、天井の「顔」が大きくなっていく。",
          duration: 6,
        },
      ],
    },
    {
      id: "steps",
      when: { type: "time", at: 190 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "sound", sound: "footsteps", at: [0, 0, 6], volume: 0.7 },
        {
          type: "subtitle",
          text: "客席の通路を、ゆっくり足音が降りてくる。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "dome-door", state: "slam" },
        { type: "door", door: "dome-door", state: "lock" },
        { type: "lights", group: "house", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "出入口の扉が閉まった。客席の灯りが消え、星空だけがドームを照らしている。",
          duration: 6,
        },
        { type: "objective", text: "天井を見上げる" },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "sky-big",
      when: { type: "after", trigger: "lock", delay: 6 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "sky-1", visible: false },
        { type: "visible", target: "sky-2", visible: true },
        { type: "sound", sound: "stinger", at: [0, 3.5, 7], volume: 0.6 },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "星の顔は、いまやドーム全体を覆う。赤い二つの目が、まっすぐ自分を見下ろしている。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "sky-2",
        maxAngleDeg: 55,
        maxDistance: 20,
      },
      requires: ["sky-big"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "sky-big", delay: 14 },
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
          title: "閉館後のプラネタリウム",
          text: "翌朝、解説員が客席を整えていると、前から三列目の座席が一つだけ、下りたままになっていた。\n座面はなぜか温かく、星空の記録映像には、天井を見上げる観客が、一人だけ多く映っていたという。\n\n投影機のスイッチは、今日も誰も押していない。",
        },
      ],
    })),
  ],
};
