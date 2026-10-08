import type { HorrorConfig } from "./kit/types";

/**
 * 「宵宮のあと」の演出データ。
 * 南の鳥居 z=0 から北の拝殿 z=28 まで参道。両脇に提灯と屋台、西の z=12 がお面屋。
 * 財布は拝殿前の賽銭箱の脇（0.9, 25.4）。最後は拝殿の格子戸が内側から開く。
 */
const SCARES = ["doors-open", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "after-festival",
  title: "宵宮のあと",
  intro: [
    "夏祭りが終わった夜。境内のどこかで財布を落としたことに気づいて、引き返してきた。",
    "提灯はまだ灯っている。さっと探して、帰ろう。",
  ],
  spawn: { position: [0, 1.6, 1.8], lookAt: [0, 1.6, 20] },
  fog: { color: [0.03, 0.03, 0.05], density: 0.03 },
  ambient: { intensity: 0.06, color: [0.7, 0.75, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.6,
    angleDeg: 42,
    range: 12,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.08,
  droneLevel: 0.03,
  triggers: [
    // ---- 0〜1分: 祭りのあと ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "虫の声。片付け途中の屋台。さっきまでの賑わいが嘘みたいだ。",
        },
        { type: "objective", text: "拝殿の前で財布を探す" },
      ],
    },
    {
      id: "found",
      when: {
        type: "interact",
        target: "wallet",
        label: "財布を拾う",
        maxDistance: 2.4,
      },
      unless: ["lock"],
      actions: [
        { type: "sound", sound: "step", at: "player", volume: 0.4 },
        {
          type: "subtitle",
          text: "あった。……中身は無事。なのに、小銭入れが濡れている。",
          duration: 4,
        },
        { type: "objective", text: "鳥居から帰る" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "music",
      when: { type: "time", at: 62 },
      actions: [
        { type: "sound", sound: "bell", at: [0, 3, 30], volume: 0.4 },
        { type: "sound", sound: "chime", at: [0, 3, 30], volume: 0.4 },
        {
          type: "subtitle",
          text: "どこからか、祭囃子がかすかに聞こえる。もう誰もいないのに。",
          duration: 4,
        },
      ],
    },
    {
      id: "west-out",
      when: { type: "time", at: 98 },
      actions: [
        { type: "custom", name: "westLanternsOut" },
        { type: "sound", sound: "breath", at: [-2, 1.8, 12], volume: 0.5 },
        {
          type: "subtitle",
          text: "西側の提灯が、手前から順に、ふっ、ふっ、と消えていく。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 78 },
      ],
    },
    {
      id: "mask",
      when: {
        type: "look",
        target: "mask-stall",
        maxAngleDeg: 20,
        maxDistance: 7,
      },
      requires: ["west-out"],
      actions: [
        { type: "sound", sound: "giggle", at: [-4, 1.4, 12], volume: 0.6 },
        {
          type: "subtitle",
          text: "お面屋の狐面が、ひとつ足りない。空いた釘の下で、子どもが笑った。",
          duration: 5,
        },
      ],
    },
    {
      id: "suzu",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "bell", at: [0, 3.7, 26.6], volume: 1 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "ガラン、ガラン。誰もいない拝殿の鈴が、ひとりでに鳴った。",
          duration: 4,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "custom", name: "shimenawa" },
        { type: "custom", name: "allLanternsOut" },
        { type: "lights", group: "lanterns-s", on: false },
        { type: "lights", group: "lanterns-n", on: false },
        { type: "fog", density: 0.06, duration: 6 },
        { type: "drone", level: 0.45 },
        { type: "heartbeat", bpm: 100 },
        { type: "sound", sound: "whisper", at: [0, 1.6, 0], volume: 0.8 },
        {
          type: "subtitle",
          text: "提灯がすべて消えた。鳥居に、さっきまで無かったしめ縄が張られている。くぐれない。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "call",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "sound", sound: "giggle", at: [0, 1.4, 27], volume: 0.8 },
        { type: "sound", sound: "knock", at: [0, 1.6, 27.2], volume: 0.9 },
        {
          type: "subtitle",
          text: "拝殿の中から、子どもの声。「……おいで。お面、かぶせてあげる」",
          duration: 5,
        },
        { type: "objective", text: "拝殿へ" },
      ],
    },
    // ---- 4〜5分: 格子戸が開く ----
    {
      id: "doors-open",
      when: { type: "zone", center: [0, 1.6, 24.5], radius: 2.6 },
      requires: ["call"],
      unless: SCARES,
      actions: [
        { type: "sound", sound: "bell", at: [0, 3.7, 26.6], volume: 1 },
        { type: "door", door: "haiden-door-l", state: "open" },
        { type: "door", door: "haiden-door-r", state: "open" },
        { type: "lights", group: "haiden", on: false },
        { type: "flashlight", state: "dim" },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 0 },
        {
          type: "subtitle",
          text: "格子戸が、内側から、ゆっくりと開いた。奥は真っ暗だ。",
          duration: 2.6,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "doors-open", delay: 2.8 },
      actions: [{ type: "jumpscare", figure: "fox" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "fox" }],
    },
    ...["scare-hit", "scare-timeout"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "宵宮のあと",
          text: "翌年の夏祭り。お面屋の狐面は、ひとつ増えていた。\nその面だけ、裏側がいつも少し湿っている。\n\n釘の下で、今年も誰かが笑っている。",
        },
      ],
    })),
  ],
};
