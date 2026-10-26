import type { HorrorConfig } from "./kit/types";

/**
 * 「終電のあとで」の演出データ。
 * 座標系: ホームは x=-3〜3, z=-30〜30。線路側が +x、改札通路は南寄り (z=-20) の -x 側。
 */
const SCARES = ["scare", "scare-late", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "last-train",
  title: "終電のあとで",
  intro: [
    "地下鉄・黄泉坂（よみざか）駅。",
    "ベンチで目を覚ますと、ホームには誰もいなかった。",
  ],
  spawn: { position: [-1.6, 1.6, 2], lookAt: [3, 1.4, 2] },
  fog: { color: [0.02, 0.02, 0.025], density: 0.025 },
  ambient: { intensity: 0.05, color: [0.7, 0.75, 0.8] },
  flashlight: {
    enabled: false,
    intensity: 1.6,
    angleDeg: 45,
    range: 22,
    color: [0.9, 0.95, 1],
  },
  walkSpeed: 0.11,
  droneLevel: 0.15,
  triggers: [
    // ---- 0〜1分: 終電後のホーム ----
    {
      id: "intro",
      when: { type: "time", at: 0.8 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 3, 0], volume: 0.6 },
        {
          type: "subtitle",
          text: "『――本日の運転は、すべて終了いたしました』",
          duration: 5,
        },
      ],
    },
    {
      id: "intro2",
      when: { type: "after", trigger: "intro", delay: 6 },
      actions: [
        { type: "subtitle", text: "寝過ごした……。とにかく外に出よう。" },
        { type: "objective", text: "改札へ（ホーム南側の通路）" },
      ],
    },
    {
      id: "shutter-closed",
      when: {
        type: "interact",
        target: "shutter",
        label: "シャッターを調べる",
      },
      unless: ["intercom"],
      actions: [
        { type: "sound", sound: "rattle", at: { node: "shutter" } },
        {
          type: "subtitle",
          text: "シャッターが下りている。……駅員を呼ばないと。",
        },
        { type: "objective", text: "北端のインターホンで駅員を呼ぶ" },
      ],
    },
    {
      id: "hint-intercom",
      when: { type: "time", at: 50 },
      unless: ["intercom", "shutter-closed"],
      actions: [
        {
          type: "subtitle",
          text: "ホームの北の端に、駅員呼び出しのインターホンがあったはずだ。",
        },
        { type: "objective", text: "北端のインターホンで駅員を呼ぶ" },
      ],
    },
    {
      id: "intercom",
      when: { type: "interact", target: "intercom", label: "駅員を呼び出す" },
      actions: [
        {
          type: "sound",
          sound: "phone",
          at: { node: "intercom" },
          volume: 0.6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "intercom-reply",
      when: { type: "after", trigger: "intercom", delay: 3 },
      actions: [
        { type: "sound", sound: "static", at: { node: "intercom" } },
        {
          type: "subtitle",
          text: "『……はい。……いま、そちらに、むかいます』",
          duration: 5,
        },
        { type: "drone", level: 0.35 },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "south-dark",
      when: { type: "after", trigger: "intercom", delay: 12 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "sound", sound: "thud", at: [0, 3, -18], volume: 0.8 },
      ],
    },
    {
      id: "south-off",
      when: { type: "after", trigger: "south-dark", delay: 1.2 },
      actions: [
        { type: "lights", group: "south", on: false },
        { type: "subtitle", text: "……南側の照明が、消えた。" },
        { type: "objective", text: "駅員を待つ" },
      ],
    },
    {
      id: "approach",
      when: { type: "after", trigger: "south-off", delay: 10 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 3, -10], volume: 0.7 },
        {
          type: "subtitle",
          text: "『まもなく、電車が、まいります』",
          duration: 5,
        },
        { type: "sound", sound: "rumble", at: [6, 0, -50], volume: 0.9 },
        { type: "fog", density: 0.045, duration: 6 },
        { type: "visible", target: "woman", visible: true },
      ],
    },
    {
      id: "woman-look",
      when: { type: "look", target: "woman", maxAngleDeg: 9, maxDistance: 40 },
      requires: ["approach"],
      actions: [
        { type: "heartbeat", bpm: 72 },
        { type: "flicker", duration: 0.7 },
      ],
    },
    {
      id: "woman-vanish",
      when: { type: "after", trigger: "woman-look", delay: 0.6 },
      actions: [{ type: "visible", target: "woman", visible: false }],
    },
    {
      id: "woman-timeout",
      when: { type: "after", trigger: "approach", delay: 22 },
      unless: ["woman-look"],
      actions: [{ type: "visible", target: "woman", visible: false }],
    },
    {
      id: "whisper",
      when: { type: "zone", center: [0, 1.6, -8], radius: 4 },
      requires: ["approach"],
      actions: [
        { type: "sound", sound: "whisper", at: "behind", volume: 0.9 },
        { type: "subtitle", text: "……いま、耳元で、何か。", duration: 3 },
      ],
    },
    {
      id: "shutter-open",
      when: { type: "after", trigger: "approach", delay: 16 },
      actions: [
        {
          type: "move",
          target: "shutter",
          to: [-9, 3.9, -20],
          duration: 3,
        },
        { type: "sound", sound: "rattle", at: { node: "shutter" } },
        {
          type: "subtitle",
          text: "改札のほうで、シャッターが上がる音がした。",
        },
        { type: "objective", text: "改札へ" },
      ],
    },
    {
      id: "footsteps",
      when: { type: "after", trigger: "shutter-open", delay: 9 },
      actions: [
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.8 },
        { type: "heartbeat", bpm: 84 },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "trapped",
      when: { type: "zone", center: [-4.6, 1.6, -20], radius: 1.4 },
      requires: ["shutter-open"],
      actions: [
        { type: "move", target: "shutter", to: [-9, 1.3, -20], duration: 0.25 },
        { type: "sound", sound: "slam", at: [-9, 1.4, -20], volume: 1.2 },
        { type: "lights", group: "north", on: false },
        { type: "lights", group: "center", on: false },
        { type: "lights", group: "south", on: false },
        { type: "flashlight", state: "dim" },
        { type: "subtitle", text: "――閉じ込められた！ スマホのライトを……" },
        { type: "objective", text: "" },
        { type: "drone", level: 0.8 },
        { type: "heartbeat", bpm: 100 },
      ],
    },
    {
      id: "train",
      when: { type: "after", trigger: "trapped", delay: 4 },
      actions: [
        { type: "custom", name: "trainArrive" },
        { type: "sound", sound: "rumble", at: [6, 0, -30], volume: 1.2 },
        { type: "shake", intensity: 0.012, duration: 6 },
        {
          type: "subtitle",
          text: "誰も乗っていない電車が、ホームに入ってくる。",
        },
      ],
    },
    {
      id: "ring",
      when: { type: "after", trigger: "train", delay: 7 },
      actions: [
        { type: "sound", sound: "phone", at: { node: "intercom2" } },
        { type: "subtitle", text: "通路のインターホンが鳴っている。" },
        { type: "objective", text: "インターホンに出る" },
      ],
    },
    {
      id: "ring-again",
      when: { type: "after", trigger: "ring", delay: 5 },
      unless: ["answer"],
      actions: [{ type: "sound", sound: "phone", at: { node: "intercom2" } }],
    },
    {
      id: "answer",
      when: { type: "interact", target: "intercom2", label: "出る" },
      requires: ["ring"],
      actions: [
        { type: "sound", sound: "static", at: { node: "intercom2" } },
        {
          type: "subtitle",
          text: "『……むかえに、きました。……うしろに、います』",
          duration: 6,
        },
        { type: "objective", text: "" },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 120 },
        { type: "flicker", duration: 1.5 },
      ],
    },
    {
      id: "breath",
      when: { type: "after", trigger: "answer", delay: 4 },
      actions: [{ type: "sound", sound: "breath", at: "behind", volume: 1 }],
    },
    // ---- 最後の一発 ----
    {
      id: "scare",
      when: {
        type: "look",
        target: "platform-mark",
        maxAngleDeg: 40,
        maxDistance: 30,
      },
      requires: ["breath"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-late",
      when: { type: "after", trigger: "breath", delay: 10 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "終電のあとで",
          text: "翌朝、始発の運転士はホームのベンチに座る人影を見たという。\n近づくと、誰もいなかった。\n\n黄泉坂駅に、終電はない。",
        },
      ],
    })),
  ],
};
