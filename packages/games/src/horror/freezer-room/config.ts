import type { HorrorConfig } from "./kit/types";

/**
 * 「冷凍庫の中」の演出データ。
 * バックヤード z=0〜4、冷凍庫 z=4〜16。吊り肉のレールは z=7〜14、その途中に女(hanger)が背を向けて吊られている。
 */
const SCARES = [
  "scare-hit",
  "scare-fallback",
  "scare-fallback-2",
  "scare-timeout",
];

export const config: HorrorConfig = {
  slug: "freezer-room",
  title: "冷凍庫の中",
  intro: [
    "閉店後の飲食店でのバイト。店長に「冷凍庫のアイスを補充しておいて」と言われた。",
    "分厚い扉を開けると、白い冷気が足元を這った。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.5, 10] },
  fog: { color: [0.2, 0.26, 0.3], density: 0.02 },
  ambient: { intensity: 0.12, color: [0.8, 0.92, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.4,
    angleDeg: 40,
    range: 10,
    color: [0.9, 0.97, 1],
  },
  walkSpeed: 0.085,
  droneLevel: 0.07,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "冷凍庫の奥に、業務用のバニラアイスの箱があるはず。",
        },
        { type: "objective", text: "冷凍庫の奥のアイスを取る" },
      ],
    },
    {
      id: "ice",
      when: {
        type: "interact",
        target: "ice-box",
        label: "アイスを取る",
        maxDistance: 2.6,
      },
      actions: [
        {
          type: "sound",
          sound: "rattle",
          at: { node: "ice-box" },
          volume: 0.6,
        },
        {
          type: "subtitle",
          text: "箱の底が凍りついている。引きはがすと、内側に霜で書かれた指の跡。",
          duration: 6,
        },
        { type: "objective", text: "冷凍庫から出る" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "cold",
      when: { type: "time", at: 70 },
      actions: [
        { type: "fog", density: 0.045, duration: 20 },
        { type: "sound", sound: "breath", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "冷気が急に濃くなった。自分の息のほかに、もう一つ、白い息が見える。",
          duration: 6,
        },
      ],
    },
    {
      id: "frost",
      when: { type: "time", at: 110 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "visible", target: "frost-0", visible: false },
        { type: "visible", target: "frost-1", visible: true },
        { type: "sound", sound: "whisper", at: [-2.9, 1.6, 9], volume: 0.5 },
        {
          type: "subtitle",
          text: "壁の霜に、文字が浮かび上がる。「たすけて」。内側から書かれたように見える。",
          duration: 6,
        },
      ],
    },
    {
      id: "sway",
      when: { type: "time", at: 150 },
      actions: [
        { type: "custom", name: "swayOn" },
        { type: "sound", sound: "creak", at: [0, 2.5, 10.5], volume: 0.8 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "天井のレールで、吊られた肉がいっせいに揺れだした。風はないのに。",
          duration: 6,
        },
      ],
    },
    {
      id: "hanger-1",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "visible", target: "hanger", visible: true },
        { type: "sound", sound: "stinger", at: [0, 1.5, 11], volume: 0.4 },
        {
          type: "subtitle",
          text: "吊られた肉の列の途中に、一つだけ違う影がある。背を向けた、人の形。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "freezer-door", state: "slam" },
        { type: "door", door: "freezer-door", state: "lock" },
        { type: "lights", group: "freezer", on: false },
        { type: "lights", group: "em", on: true },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "冷凍庫の扉が閉まった。取っ手を引いても動かない。扉の内側に、赤い非常ボタン。",
          duration: 7,
        },
        { type: "objective", text: "扉の横の非常ボタンを押す" },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "press",
      when: {
        type: "interact",
        target: "em-button",
        label: "非常ボタンを押す",
        maxDistance: 3,
      },
      requires: ["lock"],
      unless: SCARES,
      actions: [
        { type: "sound", sound: "buzz", at: "player", volume: 0.9 },
        { type: "face", target: "hanger" },
        { type: "heartbeat", bpm: 135 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ブザーが鳴り響いた。……吊られた人影が、ゆっくりこちらを向いている。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "hanger",
        maxAngleDeg: 30,
        maxDistance: 14,
      },
      requires: ["press"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "press", delay: 10 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback-2",
      when: { type: "after", trigger: "lock", delay: 70 },
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
          title: "冷凍庫の中",
          text: "翌朝、出勤した店長が冷凍庫を開けると、白い霜に覆われた床に、人の形の跡がくっきりと残っていた。\nアルバイトの姿はどこにもなく、吊られた肉が、一つだけ増えていたという。\n\nレールの端には、見覚えのあるエプロンが掛かっていた。",
        },
      ],
    })),
  ],
};
