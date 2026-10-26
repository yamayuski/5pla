import type { HorrorConfig } from "./kit/types";

/**
 * 「しまい湯」の演出データ。
 * 脱衣所 x=-4〜4, z=-9〜-1（南東に番台）。z=-1 の戸の先が洗い場 z=-1〜12、北端に湯船と富士山の壁画。
 * 東壁の洗い場の鏡は z=1,3,5,7。最奥の鏡（mirror-7）が今夜の「あれ」。
 */
const SCARES = ["scare", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "last-bath",
  title: "しまい湯",
  intro: [
    "閉店間際の銭湯。客はもう自分ひとり。",
    "番台のおばあさんが「ごゆっくり」と言った。",
  ],
  spawn: { position: [0, 1.6, -5], lookAt: [0, 1.5, 3] },
  fog: { color: [0.22, 0.22, 0.2], density: 0.03 },
  ambient: { intensity: 0.22, color: [1, 0.95, 0.85] },
  flashlight: {
    enabled: false,
    intensity: 0.8,
    angleDeg: 50,
    range: 10,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.08,
  droneLevel: 0.03,
  triggers: [
    // ---- 0〜1分: いつもの銭湯 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "貸し切りみたいなものだ。ゆっくり温まって帰ろう。",
        },
        { type: "objective", text: "湯船に浸かる" },
        { type: "sound", sound: "drip", at: [0, 3, 6], volume: 0.4 },
      ],
    },
    {
      id: "soak",
      when: { type: "zone", center: [0, 1.6, 8.2], radius: 1.6 },
      actions: [
        {
          type: "subtitle",
          text: "……ふう。富士山の壁画を眺めながら、体の芯まで温まる。",
          duration: 4,
        },
        { type: "objective", text: "のんびりする" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "oke",
      when: { type: "time", at: 65 },
      actions: [
        { type: "sound", sound: "knock", at: [-3.2, 0.4, 5], volume: 0.9 },
        {
          type: "subtitle",
          text: "カコーン……。誰もいない洗い場で、桶の音が響いた。",
          duration: 4,
        },
      ],
    },
    {
      id: "shower",
      when: { type: "time", at: 105 },
      actions: [
        { type: "custom", name: "showerOn" },
        { type: "sound", sound: "static", at: [-3.6, 2, 3], volume: 0.5 },
        {
          type: "subtitle",
          text: "西の端のシャワーが、ひとりでに出はじめた。",
          duration: 4,
        },
        { type: "heartbeat", bpm: 78 },
      ],
    },
    {
      id: "bandai-gone",
      when: { type: "time", at: 145 },
      actions: [
        { type: "visible", target: "bandai", visible: false },
        { type: "sound", sound: "step", at: "behind", volume: 0.8 },
        { type: "sound", sound: "footsteps", at: [0, 0.2, -4], volume: 0.6 },
        { type: "flicker", duration: 0.8 },
        {
          type: "subtitle",
          text: "脱衣所の方で、ぺた、ぺた、と濡れた足音がする。",
          duration: 4,
        },
      ],
    },
    {
      id: "steam",
      when: { type: "time", at: 175 },
      actions: [
        { type: "fog", density: 0.09, duration: 10 },
        { type: "drone", level: 0.25 },
        {
          type: "subtitle",
          text: "湯気が、急に濃くなってきた。",
          duration: 3,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "bath-door", state: "slam" },
        { type: "lights", group: "changing", on: false },
        { type: "lights", group: "bath-a", on: false },
        { type: "flicker", duration: 1.4 },
        { type: "drone", level: 0.5 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "脱衣所の戸が閉まった。……開かない。「おばあさん？」返事はない。",
          duration: 5,
        },
        { type: "objective", text: "誰かいるのか確かめる" },
      ],
    },
    {
      id: "tap",
      when: { type: "after", trigger: "lock", delay: 12 },
      actions: [
        { type: "sound", sound: "knock", at: { node: "mirror-7" }, volume: 1 },
        { type: "custom", name: "showerOff" },
        {
          type: "subtitle",
          text: "シャワーが止まった。奥の鏡の裏から、コン、コン、と叩く音。",
          duration: 5,
        },
        { type: "objective", text: "奥の鏡を確かめる" },
      ],
    },
    // ---- 4〜5分: 鏡の前で ----
    {
      id: "scare",
      when: { type: "zone", center: [3.1, 1.6, 7], radius: 1.2 },
      requires: ["tap"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "mirror-writing", visible: true },
        { type: "sound", sound: "whisper", at: { node: "mirror-7" } },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 0 },
        {
          type: "subtitle",
          text: "曇った鏡に、指でなぞった文字が浮かんでいる。",
          duration: 2,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "scare", delay: 1.6 },
      actions: [{ type: "jumpscare", figure: "bandai-ghost" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "bandai-ghost" }],
    },
    ...["scare-hit", "scare-timeout"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "しまい湯",
          text: "その銭湯は先月、番台のおばあさんが亡くなって店を閉めていた。\n入口には今も「ごゆっくり」の札が掛かっている。\n\n今夜も、しまい湯の客を待っている。",
        },
      ],
    })),
  ],
};
