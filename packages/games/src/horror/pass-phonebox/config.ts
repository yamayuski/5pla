import type { HorrorConfig } from "./kit/types";

/**
 * 「峠の電話ボックス」の演出データ。
 * 林道は x=-3〜3 を z=-8〜72 に伸びる。止まった車は z=0、地蔵の列は z=30 の左脇、
 * 電話ボックスは z=60 の左の待避所（x=-5.6〜-3.8）。z=72 で倒木が道を塞いでいる。
 */
const SCARES = ["scare", "scare-late", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "pass-phonebox",
  title: "峠の電話ボックス",
  intro: [
    "深夜の峠道。車が、ふいに止まった。",
    "携帯は圏外。峠の上に、古い電話ボックスがあったはずだ。",
  ],
  spawn: { position: [-0.5, 1.6, 3], lookAt: [0, 1.4, 20] },
  fog: { color: [0.03, 0.035, 0.045], density: 0.055 },
  ambient: { intensity: 0.07, color: [0.55, 0.65, 0.85] },
  flashlight: {
    enabled: true,
    intensity: 1.5,
    angleDeg: 38,
    range: 24,
    color: [1, 0.95, 0.85],
  },
  walkSpeed: 0.1,
  droneLevel: 0.12,
  triggers: [
    // ---- 0〜1分: 止まった車 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "エンジンは、うんともすんとも言わない。……歩くしかない。",
        },
        { type: "objective", text: "峠の上の電話ボックスへ" },
      ],
    },
    {
      id: "owl",
      when: { type: "zone", center: [0, 1.6, 14], radius: 3 },
      actions: [
        { type: "sound", sound: "creak", at: [-8, 4, 18], volume: 0.4 },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "jizo-pass",
      when: { type: "zone", center: [0, 1.6, 30], radius: 3 },
      actions: [
        {
          type: "subtitle",
          text: "道端に、赤いよだれかけのお地蔵さまが六体。",
        },
        { type: "sound", sound: "bell", at: [-3.6, 1, 30], volume: 0.25 },
      ],
    },
    {
      id: "footsteps",
      when: { type: "zone", center: [0, 1.6, 38], radius: 2.5 },
      requires: ["jizo-pass"],
      actions: [
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.8 },
        { type: "subtitle", text: "……後ろで、砂利を踏む音。", duration: 3 },
        { type: "drone", level: 0.3 },
      ],
    },
    {
      id: "jizo-move",
      when: { type: "lookAway", target: "jizo", minAngleDeg: 100 },
      requires: ["footsteps"],
      actions: [
        { type: "move", target: "jizo", to: [-0.3, 0, 33], duration: 0.05 },
      ],
    },
    {
      id: "jizo-noticed",
      when: { type: "look", target: "jizo", maxAngleDeg: 18, maxDistance: 20 },
      requires: ["jizo-move"],
      actions: [
        {
          type: "subtitle",
          text: "地蔵が、道の真ん中に並んでいる。……ついてきてる？",
        },
        { type: "heartbeat", bpm: 72 },
      ],
    },
    {
      id: "car-off",
      when: { type: "zone", center: [0, 1.6, 46], radius: 3 },
      requires: ["footsteps"],
      actions: [
        { type: "custom", name: "carHorn" },
        { type: "lights", group: "car", on: false },
        { type: "subtitle", text: "はるか後ろで、車のクラクション。……誰が？" },
      ],
    },
    {
      id: "ring",
      when: { type: "zone", center: [0, 1.6, 54], radius: 3 },
      actions: [
        { type: "sound", sound: "phone", at: { node: "phone" }, volume: 1 },
        { type: "subtitle", text: "電話ボックスの電話が、鳴っている。" },
        { type: "objective", text: "電話に出る" },
      ],
    },
    {
      id: "ring-again",
      when: { type: "after", trigger: "ring", delay: 4 },
      unless: ["pickup"],
      actions: [
        { type: "sound", sound: "phone", at: { node: "phone" }, volume: 1 },
      ],
    },
    {
      id: "ring-again2",
      when: { type: "after", trigger: "ring-again", delay: 4 },
      unless: ["pickup"],
      actions: [
        { type: "sound", sound: "phone", at: { node: "phone" }, volume: 1 },
      ],
    },
    {
      id: "blocked",
      when: { type: "zone", center: [0, 1.6, 69], radius: 3 },
      actions: [{ type: "subtitle", text: "倒木で、この先は通れない。" }],
    },
    // ---- 3〜4分: 電話ボックスに閉じ込められる ----
    {
      id: "pickup",
      when: {
        type: "interact",
        target: "phone",
        label: "受話器を取る",
        maxDistance: 1.4,
      },
      requires: ["ring"],
      actions: [
        { type: "sound", sound: "static", at: "player", volume: 0.6 },
        {
          type: "subtitle",
          text: "『……もしもし。……いま、どこ？』",
          duration: 4,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "trapped",
      when: { type: "after", trigger: "pickup", delay: 4.5 },
      actions: [
        { type: "door", door: "booth-door", state: "slam" },
        { type: "flashlight", state: "off" },
        { type: "flicker", duration: 1.5 },
        { type: "subtitle", text: "『そこから、うごかないで』", duration: 4 },
        { type: "move", target: "jizo", to: [-2.9, 0, 57.5], duration: 0.05 },
        { type: "drone", level: 0.8 },
        { type: "heartbeat", bpm: 100 },
      ],
    },
    {
      id: "jizo-surround",
      when: { type: "after", trigger: "trapped", delay: 3 },
      actions: [
        {
          type: "subtitle",
          text: "ボックスのまわりを、地蔵が囲んでいる。",
          duration: 4,
        },
        { type: "sound", sound: "whisper", at: [-2.9, 1, 60], volume: 0.9 },
      ],
    },
    {
      id: "voice2",
      when: { type: "after", trigger: "jizo-surround", delay: 6 },
      actions: [
        { type: "sound", sound: "static", at: "player", volume: 0.5 },
        {
          type: "subtitle",
          text: "『……みつけた。……うしろの、ガラス』",
          duration: 5,
        },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 130 },
      ],
    },
    {
      id: "knock-glass",
      when: { type: "after", trigger: "voice2", delay: 3 },
      actions: [
        { type: "sound", sound: "knock", at: [-3.7, 1.5, 60], volume: 1 },
      ],
    },
    // ---- 最後の一発 ----
    {
      id: "scare",
      when: {
        type: "look",
        target: "booth-back",
        maxAngleDeg: 40,
        maxDistance: 4,
      },
      requires: ["knock-glass"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "hag" }],
    },
    {
      id: "scare-late",
      when: { type: "after", trigger: "knock-glass", delay: 8 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "hag" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "hag" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "峠の電話ボックス",
          text: "翌朝、峠の電話ボックスで、受話器が外れたまま揺れているのが見つかった。\nその電話機の回線は、十年前に撤去されていた。\n\nボックスのまわりには、六体の地蔵が並んでいたという。",
        },
      ],
    })),
  ],
};
