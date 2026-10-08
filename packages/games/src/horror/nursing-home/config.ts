import type { HorrorConfig } from "./kit/types";

/**
 * 「空室のナースコール」の演出データ。
 * 廊下 x=-2.5〜2.5, z=0〜24。居室の扉 room-1〜4 は西側。4号室(z=20)は空室。
 * コール盤の看板 call-0 / call-2 / call-4 を visible で切り替える。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "nursing-home",
  title: "空室のナースコール",
  intro: [
    "老人ホームの夜勤、一人きりの見回り。入居者はみな眠っている。",
    "ナースステーションのコール盤は、静かなままだ。",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [0, 1.5, 12] },
  fog: { color: [0.05, 0.05, 0.04], density: 0.016 },
  ambient: { intensity: 0.09, color: [1, 0.95, 0.85] },
  flashlight: {
    enabled: true,
    intensity: 0.45,
    angleDeg: 40,
    range: 11,
    color: [1, 0.97, 0.9],
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
          text: "廊下は静かで、遠くから誰かの寝息のような音だけがする。",
        },
        { type: "objective", text: "コール盤を確認する" },
      ],
    },
    {
      id: "board",
      when: {
        type: "interact",
        target: "call-board",
        label: "コール盤を確認",
        maxDistance: 2.6,
      },
      actions: [
        {
          type: "sound",
          sound: "chime",
          at: { node: "call-board" },
          volume: 0.5,
        },
        {
          type: "subtitle",
          text: "異常なし。廊下の一番奥の4号室は、先月から空室だ。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "call-2",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "call-0", visible: false },
        { type: "visible", target: "call-2", visible: true },
        { type: "sound", sound: "bell", at: [2.4, 1.7, 3.5], volume: 0.9 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "ナースコールが鳴った。2号室の入居者が、起きたようだ。",
          duration: 5,
        },
      ],
    },
    {
      id: "door-2",
      when: { type: "time", at: 110 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "door", door: "room-2", state: "open" },
        { type: "sound", sound: "creak", at: [-2.5, 1, 9.5], volume: 0.8 },
        {
          type: "subtitle",
          text: "2号室の扉が、ひとりでに開いた。ベッドは空で、シーツが誰かの形にへこんでいる。",
          duration: 6,
        },
      ],
    },
    {
      id: "wheelchair",
      when: { type: "time", at: 150 },
      actions: [
        { type: "move", target: "wheelchair", to: [1.2, 0, 13], duration: 20 },
        {
          type: "sound",
          sound: "rumble",
          at: { node: "wheelchair" },
          volume: 0.5,
        },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "廊下の奥の車椅子が、ゆっくりこちらへ走ってくる。誰も乗っていない。",
          duration: 6,
        },
      ],
    },
    {
      id: "call-4",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.3 },
        { type: "visible", target: "call-2", visible: false },
        { type: "visible", target: "call-4", visible: true },
        { type: "sound", sound: "bell", at: [2.4, 1.7, 3.5], volume: 1 },
        {
          type: "subtitle",
          text: "また、ナースコール。呼んでいるのは、空室のはずの4号室。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "ward-door", state: "slam" },
        { type: "door", door: "ward-door", state: "lock" },
        { type: "lights", group: "hall", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        { type: "sound", sound: "bell", at: [-2.4, 1.2, 20], volume: 0.8 },
        {
          type: "subtitle",
          text: "出入口の自動ドアが閉まった。廊下の灯りが落ち、一番奥の4号室から、ベルの音。",
          duration: 6,
        },
        { type: "objective", text: "4号室の扉を開ける" },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "open-4",
      when: {
        type: "interact",
        target: "room-4",
        label: "扉を開ける",
        maxDistance: 3,
      },
      requires: ["lock"],
      unless: SCARES,
      actions: [
        { type: "door", door: "room-4", state: "open" },
        { type: "sound", sound: "creak", at: { node: "room-4" }, volume: 1 },
        { type: "heartbeat", bpm: 140 },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "open-4", delay: 1.6 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "lock", delay: 60 },
      unless: SCARES,
      actions: [
        { type: "door", door: "room-4", state: "open" },
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
          title: "空室のナースコール",
          text: "翌朝、早番の職員がコール盤を見ると、4号室の呼び出しランプが点いたままだった。\n4号室のベッドには、誰も寝ていないのに、シーツが温かかったという。\n\n夜勤の職員は、その日から連絡がつかない。",
        },
      ],
    })),
  ],
};
