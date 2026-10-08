import type { HorrorConfig } from "./kit/types";

/**
 * 「十三階」の演出データ。
 * かご内は x=-1〜1, z=-1〜1（扉は +z 側）。外はエレベーターホール（z=1〜5）、
 * 北へ伸びる廊下（z=5〜20）、西に残業中のオフィス。
 * エレベーターは実際には動かさず、扉・階数表示・ホールの見た目を差し替えて「移動」を演出する。
 */
const SCARES = ["scare", "scare-late", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "elevator-13",
  title: "十三階",
  intro: [
    "雑居ビル七階、残業はやっと終わった。",
    "このビルのエレベーターは、夜になると時々おかしな階に止まるらしい。",
  ],
  spawn: { position: [-7, 1.6, 4], lookAt: [0, 1.5, 3] },
  fog: { color: [0.01, 0.01, 0.012], density: 0.035 },
  ambient: { intensity: 0.05, color: [0.75, 0.8, 0.9] },
  flashlight: {
    enabled: false,
    intensity: 1.1,
    angleDeg: 50,
    range: 10,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.085,
  droneLevel: 0.06,
  triggers: [
    // ---- 0〜1分: 残業帰り ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "終電まであと二十分。……帰ろう。" },
        { type: "objective", text: "エレベーターを呼ぶ" },
        { type: "sound", sound: "buzz", at: [-7, 2.6, 4], volume: 0.3 },
      ],
    },
    {
      id: "call",
      when: { type: "interact", target: "call-button", label: "呼ぶ" },
      actions: [
        { type: "custom", name: "callLamp" },
        {
          type: "sound",
          sound: "drip",
          at: { node: "call-button" },
          volume: 0.4,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "arrive",
      when: { type: "after", trigger: "call", delay: 5 },
      actions: [
        { type: "custom", name: "openDoors" },
        { type: "sound", sound: "bell", at: [0, 2.3, 1], volume: 0.35 },
      ],
    },
    {
      id: "boarded",
      when: { type: "zone", center: [0, 1.6, 0], radius: 0.55 },
      requires: ["arrive"],
      actions: [
        { type: "visible", target: "doorway-block", visible: true },
        { type: "objective", text: "1階のボタンを押す" },
      ],
    },
    {
      id: "press1",
      when: { type: "interact", target: "panel", label: "1階を押す" },
      requires: ["boarded"],
      actions: [
        { type: "custom", name: "closeDoors" },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "ride1",
      when: { type: "after", trigger: "press1", delay: 2 },
      actions: [
        { type: "custom", name: "rideDown" },
        { type: "sound", sound: "rumble", at: [0, 0, 0], volume: 0.35 },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "stop4a",
      when: { type: "after", trigger: "ride1", delay: 6.5 },
      actions: [
        { type: "custom", name: "arriveFloor4" },
        { type: "custom", name: "openDoors" },
        { type: "sound", sound: "bell", at: [0, 2.3, 1], volume: 0.35 },
        { type: "subtitle", text: "……4階？ 誰も押していないのに。" },
        { type: "flicker", duration: 0.8 },
      ],
    },
    {
      id: "close4a",
      when: { type: "after", trigger: "stop4a", delay: 6 },
      actions: [
        { type: "custom", name: "closeDoors" },
        { type: "sound", sound: "footsteps", at: [0, 0.2, 9], volume: 0.7 },
      ],
    },
    {
      id: "ride2",
      when: { type: "after", trigger: "close4a", delay: 2 },
      actions: [
        { type: "custom", name: "rideLoop" },
        { type: "sound", sound: "rumble", at: [0, 0, 0], volume: 0.35 },
      ],
    },
    {
      id: "stop4b",
      when: { type: "after", trigger: "ride2", delay: 6.5 },
      actions: [
        { type: "custom", name: "openDoors" },
        { type: "sound", sound: "bell", at: [0, 2.3, 1], volume: 0.35 },
        { type: "lights", group: "hall", on: false },
        { type: "visible", target: "shadow", visible: true },
        { type: "subtitle", text: "また、4階。" },
        { type: "heartbeat", bpm: 70 },
        { type: "drone", level: 0.35 },
      ],
    },
    {
      id: "shadow-look",
      when: {
        type: "look",
        target: "shadow",
        maxAngleDeg: 10,
        maxDistance: 25,
      },
      requires: ["stop4b"],
      actions: [
        { type: "flicker", duration: 0.5 },
        { type: "move", target: "shadow", to: [0, 0, 8.5], duration: 0.05 },
        { type: "sound", sound: "thud", at: [0, 0.5, 8.5], volume: 0.9 },
      ],
    },
    {
      id: "close4b",
      when: { type: "time", at: 0 },
      requiresAny: ["shadow-look-wait", "shadow-timeout"],
      actions: [
        { type: "custom", name: "closeDoors" },
        { type: "sound", sound: "whisper", at: "behind", volume: 0.7 },
      ],
    },
    {
      id: "shadow-look-wait",
      when: { type: "after", trigger: "shadow-look", delay: 1.4 },
      actions: [],
    },
    {
      id: "shadow-timeout",
      when: { type: "after", trigger: "stop4b", delay: 8 },
      unless: ["shadow-look"],
      actions: [],
    },
    {
      id: "ride-up",
      when: { type: "after", trigger: "close4b", delay: 1.8 },
      actions: [
        { type: "visible", target: "shadow", visible: false },
        { type: "custom", name: "rideUp" },
        { type: "sound", sound: "rumble", at: [0, 3, 0], volume: 0.7 },
        { type: "shake", intensity: 0.008, duration: 7 },
        { type: "flicker", duration: 2 },
        { type: "subtitle", text: "……上に、向かってる？" },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 3〜4分: 十三階で止まる ----
    {
      id: "stop13",
      when: { type: "after", trigger: "ride-up", delay: 8 },
      actions: [
        { type: "custom", name: "arriveFloor13" },
        { type: "lights", group: "car", on: false },
        { type: "lights", group: "corridor", on: false },
        { type: "lights", group: "office", on: false },
        { type: "sound", sound: "thud", at: [0, 2.4, 0], volume: 1 },
        { type: "custom", name: "openDoors" },
        { type: "fog", density: 0.12, duration: 3 },
        { type: "flashlight", state: "dim" },
        { type: "drone", level: 0.8 },
        {
          type: "subtitle",
          text: "13階。……このビルは、12階建てのはずだ。",
          duration: 5,
        },
        { type: "objective", text: "「閉」ボタンを押す" },
      ],
    },
    {
      id: "close13",
      when: { type: "interact", target: "panel", label: "「閉」を押す" },
      requires: ["stop13"],
      actions: [
        { type: "custom", name: "closeDoorsSlow" },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "close13-self",
      when: { type: "after", trigger: "stop13", delay: 22 },
      unless: ["close13"],
      actions: [
        { type: "custom", name: "closeDoorsSlow" },
        { type: "subtitle", text: "扉が、ひとりでに閉まっていく。" },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "shut",
      when: { type: "time", at: 0 },
      requiresAny: ["close13-wait", "close13-self-wait"],
      actions: [
        { type: "lights", group: "car", on: true },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 125 },
        { type: "subtitle", text: "明かりが戻った。……よかった――", duration: 3 },
      ],
    },
    {
      id: "close13-wait",
      when: { type: "after", trigger: "close13", delay: 4 },
      actions: [],
    },
    {
      id: "close13-self-wait",
      when: { type: "after", trigger: "close13-self", delay: 4 },
      actions: [],
    },
    {
      id: "breath",
      when: { type: "after", trigger: "shut", delay: 3 },
      actions: [
        { type: "sound", sound: "breath", at: "behind", volume: 1 },
        {
          type: "subtitle",
          text: "……かごの中に、自分以外の息づかい。",
          duration: 4,
        },
      ],
    },
    // ---- 最後の一発 ----
    {
      id: "scare",
      when: {
        type: "look",
        target: "car-back",
        maxAngleDeg: 40,
        maxDistance: 4,
      },
      requires: ["breath"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "shadow" }],
    },
    {
      id: "scare-late",
      when: { type: "after", trigger: "breath", delay: 8 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "shadow" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "shadow" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "十三階",
          text: "翌朝、警備員が止まったままのエレベーターを開けると、\n中には誰もいなかった。\n\n階数表示は、ずっと「13」を示していたという。",
        },
      ],
    })),
  ],
};
