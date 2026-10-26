import type { HorrorConfig } from "./kit/types";

/**
 * 「お盆の墓参り」の演出データ。
 * 墓地の参道は x=-1.5〜1.5, z=0〜32（入口の門 z=0）。左右に墓石が並び、突き当たり z≈30 が自分の家の墓(family-grave)。
 * 墓石の文字（tomb-a → tomb-b）が書き換わり、最後は家の墓の前の土から女(risen)が這い出る。
 */
const SCARES = ["scare-a", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "night-cemetery",
  title: "お盆の墓参り",
  intro: [
    "お盆の夜、家族と離れて一人で、先祖の墓へお線香をあげに来た。",
    "寺の墓地は、もう街灯も消えて、石灯籠の灯りだけが残っている。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.4, 20] },
  fog: { color: [0.03, 0.035, 0.05], density: 0.022 },
  ambient: { intensity: 0.07, color: [0.75, 0.82, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.65,
    angleDeg: 40,
    range: 14,
    color: [0.95, 0.98, 1],
  },
  walkSpeed: 0.08,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 墓参り ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "蝉の声はもう止み、虫の音だけ。両側の墓石が、石灯籠の橙に浮かんでいる。",
        },
        { type: "objective", text: "突き当たりの家の墓に線香をあげる" },
      ],
    },
    {
      id: "incense",
      when: {
        type: "interact",
        target: "family-grave",
        label: "線香をあげる",
        maxDistance: 2.6,
      },
      unless: ["lock"],
      actions: [
        {
          type: "sound",
          sound: "chime",
          at: { node: "family-grave" },
          volume: 0.4,
        },
        {
          type: "subtitle",
          text: "手を合わせて、水をかける。……墓石に刻まれた没年が、今年になっている。",
          duration: 6,
        },
        { type: "objective", text: "帰る" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "tombs",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "tomb-a", visible: false },
        { type: "visible", target: "tomb-b", visible: true },
        { type: "sound", sound: "whisper", at: [-3, 1, 14], volume: 0.5 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "墓石の文字が全部、赤い字に変わっている。「ここに　おいで」",
          duration: 5,
        },
      ],
    },
    {
      id: "lantern",
      when: { type: "time", at: 115 },
      actions: [
        { type: "lights", group: "lantern-a", on: false },
        { type: "sound", sound: "step", at: "behind", volume: 0.6 },
        {
          type: "subtitle",
          text: "手前の石灯籠の火が消えた。背後で、湿った土を踏む足音がひとつ。",
          duration: 5,
        },
      ],
    },
    {
      id: "hand",
      when: { type: "time", at: 155 },
      actions: [
        { type: "visible", target: "hand-soil", visible: true },
        { type: "sound", sound: "rattle", at: [-3, 0.2, 15], volume: 0.7 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "左手の墓の土が盛り上がり、白い指が五本、地面から突き出している。",
          duration: 5,
        },
      ],
    },
    {
      id: "chant",
      when: { type: "time", at: 185 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 0.3, 28], volume: 0.9 },
        { type: "sound", sound: "bell", at: [0, 1, 30], volume: 0.6 },
        {
          type: "subtitle",
          text: "家の墓のほうから、読経のような低い声と、鈴の音。「……ずっと……まって……た……」",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分: 門が閉まる ----
    {
      id: "lock",
      when: { type: "time", at: 210 },
      actions: [
        { type: "door", door: "cemetery-gate", state: "slam" },
        { type: "door", door: "cemetery-gate", state: "lock" },
        { type: "lights", group: "lantern-b", on: false },
        { type: "visible", target: "mound", visible: true },
        { type: "flashlight", state: "dim" },
        { type: "fog", density: 0.045, duration: 4 },
        { type: "flicker", duration: 1.3 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "背後の門が閉まり、鎖の音がした。石灯籠が消え、家の墓の前の土が、新しく盛られている。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "rise",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "visible", target: "risen", visible: true },
        { type: "move", target: "risen", to: [0, 0, 27], duration: 5 },
        { type: "sound", sound: "rumble", at: [0, 0.2, 27], volume: 0.9 },
        { type: "sound", sound: "breath", at: [0, 0.6, 27], volume: 0.7 },
        { type: "heartbeat", bpm: 125 },
        {
          type: "subtitle",
          text: "盛り土が崩れた。濡れた白装束の女が、土の中から、ゆっくり這い上がってくる。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: 土の中から ----
    {
      id: "scare-hit",
      when: { type: "look", target: "risen", maxAngleDeg: 24, maxDistance: 30 },
      requires: ["rise"],
      unless: SCARES,
      actions: [
        { type: "move", target: "risen", to: [0, 0, 18], duration: 2.2 },
        { type: "sound", sound: "footsteps", at: { node: "risen" }, volume: 1 },
        { type: "heartbeat", bpm: 150 },
      ],
    },
    {
      id: "scare-a",
      when: { type: "after", trigger: "scare-hit", delay: 2.2 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "risen" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "rise", delay: 22 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "risen" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "risen" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "お盆の墓参り",
          text: "翌朝、住職が墓地を見回ると、家の墓の前に、新しい線香が一本、まだ燃えていた。\n墓石の没年は、昨日までの日付に戻っていたが、刻まれた名前は、昨夜参りに来た人のものだったという。",
        },
      ],
    })),
  ],
};
