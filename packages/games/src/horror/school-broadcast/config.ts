import type { HorrorConfig } from "./kit/types";

/**
 * 「ほうそうしつ」の演出データ。
 * 廊下は x=-1.5〜1.5, z=0〜36（南端が昇降口、北端が放送室の入口）。
 * 西側に教室 3-A(z≈10) と 3-B(z≈21)、放送室は z=36〜44、東に壁一枚（ガラス窓）で準備室がある。
 */
const SCARES = ["scare", "scare-late", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "school-broadcast",
  title: "ほうそうしつ",
  intro: [
    "夜の校舎に、忘れ物を取りに戻ってきた。",
    "三年B組の机の中。それだけのはずだった。",
  ],
  spawn: { position: [0, 1.6, 2.2], lookAt: [0, 1.5, 12] },
  fog: { color: [0.015, 0.02, 0.025], density: 0.02 },
  ambient: { intensity: 0.06, color: [0.6, 0.7, 0.9] },
  flashlight: {
    enabled: true,
    intensity: 1.2,
    angleDeg: 42,
    range: 16,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.09,
  droneLevel: 0.08,
  triggers: [
    // ---- 0〜1分: 夜の廊下 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "自分の足音だけが響く。三年B組は、廊下の奥だ。",
        },
        { type: "objective", text: "三年B組へ（廊下の奥・左側）" },
      ],
    },
    {
      id: "chime",
      when: { type: "zone", center: [0, 1.6, 8], radius: 2.5 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 3, 14], volume: 0.5 },
        {
          type: "subtitle",
          text: "……下校のチャイム？ こんな時間に。",
          duration: 3.5,
        },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "locker",
      when: { type: "zone", center: [0, 1.6, 16], radius: 2.2 },
      actions: [
        {
          type: "sound",
          sound: "rattle",
          at: { node: "locker-17" },
          volume: 0.9,
        },
        {
          type: "subtitle",
          text: "ロッカーが一つ、中から叩かれたように鳴った。",
          duration: 3.5,
        },
        { type: "heartbeat", bpm: 66 },
      ],
    },
    {
      id: "get-phone",
      when: {
        type: "interact",
        target: "desk-mine",
        label: "机の中を探る",
        maxDistance: 2.2,
      },
      actions: [
        { type: "sound", sound: "step", at: "player", volume: 0.4 },
        { type: "subtitle", text: "あった、スマホ。……帰ろう。", duration: 3 },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "gate-slam",
      when: { type: "after", trigger: "get-phone", delay: 2 },
      actions: [
        { type: "door", door: "gate", state: "slam" },
        { type: "lights", group: "corr-a", on: false },
        {
          type: "subtitle",
          text: "昇降口のほうで、扉が叩きつけられる音。",
          duration: 4,
        },
        { type: "drone", level: 0.25 },
      ],
    },
    {
      id: "board-appear",
      when: { type: "after", trigger: "get-phone", delay: 6 },
      actions: [
        { type: "visible", target: "board-msg", visible: true },
        {
          type: "sound",
          sound: "whisper",
          at: { node: "board-msg" },
          volume: 0.7,
        },
        {
          type: "subtitle",
          text: "黒板に、さっきまでなかった文字。",
          duration: 3.5,
        },
      ],
    },
    {
      id: "pa-call",
      when: { type: "after", trigger: "get-phone", delay: 12 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 3, 10], volume: 0.7 },
        { type: "sound", sound: "static", at: [0, 3, 10], volume: 0.5 },
        {
          type: "subtitle",
          text: "『……ほうそうしつまで、きてください』",
          duration: 5,
        },
        { type: "objective", text: "放送室へ（廊下の突き当たり）" },
        { type: "lights", group: "corr-b", on: false },
        { type: "heartbeat", bpm: 78 },
      ],
    },
    {
      id: "giggle",
      when: { type: "zone", center: [0, 1.6, 29], radius: 2.2 },
      requires: ["pa-call"],
      actions: [
        { type: "sound", sound: "giggle", at: "behind", volume: 0.9 },
        { type: "subtitle", text: "背後で、くすくすと笑う声。", duration: 3 },
        { type: "lights", group: "corr-c", on: false },
        { type: "flicker", duration: 1.2 },
      ],
    },
    // ---- 3〜4分: 放送室に閉じ込められる ----
    {
      id: "booth-in",
      when: { type: "zone", center: [0, 1.6, 39], radius: 2.2 },
      actions: [
        { type: "door", door: "booth-door", state: "slam" },
        { type: "flicker", duration: 1.4 },
        { type: "drone", level: 0.6 },
        { type: "heartbeat", bpm: 96 },
        {
          type: "subtitle",
          text: "背後で、放送室のドアが閉まった。",
          duration: 3.5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "on-air",
      when: { type: "after", trigger: "booth-in", delay: 3.5 },
      actions: [
        { type: "visible", target: "onair", visible: true },
        { type: "sound", sound: "buzz", at: [0, 2.8, 40], volume: 0.7 },
        { type: "sound", sound: "static", at: "player", volume: 0.5 },
        {
          type: "subtitle",
          text: "『……あー、あー。きこえてますか。ぜんこうせいとに、おしらせです』",
          duration: 6,
        },
      ],
    },
    {
      id: "girl-show",
      when: { type: "after", trigger: "on-air", delay: 7 },
      actions: [
        { type: "lights", group: "prep", on: true },
        { type: "visible", target: "girl", visible: true },
        { type: "sound", sound: "knock", at: [3, 1.5, 40], volume: 0.9 },
        {
          type: "subtitle",
          text: "ガラスの向こう、閉ざされた準備室に――誰かが立っている。",
          duration: 4.5,
        },
      ],
    },
    {
      id: "girl-see",
      when: { type: "look", target: "girl", maxAngleDeg: 30, maxDistance: 9 },
      requires: ["girl-show"],
      actions: [
        { type: "heartbeat", bpm: 120 },
        { type: "sound", sound: "whisper", at: "player", volume: 1 },
        {
          type: "subtitle",
          text: "『……ほうそうを、とめて』",
          duration: 4,
        },
      ],
    },
    {
      id: "girl-vanish",
      when: { type: "after", trigger: "girl-show", delay: 14 },
      actions: [
        { type: "objective", text: "放送を止める（卓上の赤いボタン）" },
        { type: "visible", target: "girl", visible: false },
        { type: "lights", group: "prep", on: false },
        { type: "sound", sound: "thud", at: [3, 1.5, 40], volume: 1 },
      ],
    },
    // ---- 4〜5分: 放送終了 ----
    {
      id: "stop-btn",
      when: {
        type: "interact",
        target: "stop-btn",
        label: "放送を止める",
        maxDistance: 2.2,
      },
      requires: ["girl-show"],
      actions: [
        { type: "visible", target: "onair", visible: false },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 140 },
        { type: "sound", sound: "static", at: "player", volume: 0.3 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "……静かになった。", duration: 3 },
      ],
    },
    {
      id: "scare",
      when: { type: "after", trigger: "stop-btn", delay: 3.2 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "girl" }],
    },
    {
      id: "scare-late",
      when: { type: "after", trigger: "girl-vanish", delay: 30 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "girl" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "girl" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "ほうそうしつ",
          text: "翌朝、校内放送のスイッチは入ったままだった。\n録音には、校舎を歩く足音と、小さな女の子の笑い声が残っていたという。\n\n放送室の隣に、準備室などという部屋はない。",
        },
      ],
    })),
  ],
};
