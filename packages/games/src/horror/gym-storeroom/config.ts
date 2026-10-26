import type { HorrorConfig } from "./kit/types";

/**
 * 「体育倉庫」の演出データ。
 * 倉庫は x=-3〜3, z=0〜7（入口 z=0 の store-door）。奥(z≈6)に跳び箱の山（vault-1〜4 が段階的に増える）、
 * 隅に巻いたマット(mat-roll)。最後にマットがほどけ、中から少女(girl)が起き上がる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "gym-storeroom",
  title: "体育倉庫",
  intro: [
    "部活のあと、体育倉庫の鍵当番。用具を数えて、施錠して帰る。",
    "校舎の窓はもう、どれも真っ暗だ。",
  ],
  spawn: { position: [0, 1.6, 1], lookAt: [0, 1.2, 6] },
  fog: { color: [0.04, 0.04, 0.05], density: 0.02 },
  ambient: { intensity: 0.09, color: [0.8, 0.85, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.65,
    angleDeg: 42,
    range: 9,
    color: [1, 0.97, 0.92],
  },
  walkSpeed: 0.06,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 用具を数える ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "埃とゴムの匂い。高窓から射す月明かりが、跳び箱の山を青く照らしている。",
        },
        { type: "objective", text: "ボールカゴのボールを数える" },
      ],
    },
    {
      id: "count",
      when: {
        type: "interact",
        target: "ball-cart",
        label: "ボールを数える",
        maxDistance: 2.4,
      },
      actions: [
        {
          type: "sound",
          sound: "rattle",
          at: { node: "ball-cart" },
          volume: 0.6,
        },
        {
          type: "subtitle",
          text: "二十四個のはずが、二十五個ある。……一つだけ、他のものより濡れて冷たい。",
          duration: 6,
        },
        { type: "objective", text: "戸締まりをして帰る" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "ball-roll",
      when: { type: "time", at: 70 },
      actions: [
        { type: "move", target: "ball", to: [1.2, 0.12, 1.6], duration: 5 },
        { type: "sound", sound: "rumble", at: [0, 0.2, 4], volume: 0.4 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "一個のボールが、カゴから転がり出した。床は平らなのに、まっすぐこちらへ。",
          duration: 5,
        },
      ],
    },
    {
      id: "vault-1",
      when: { type: "time", at: 105 },
      actions: [
        { type: "visible", target: "vault-4", visible: true },
        { type: "sound", sound: "thud", at: [0, 1.5, 6], volume: 0.9 },
        {
          type: "subtitle",
          text: "背後で、どすん。振り向くと、跳び箱が一段、高くなっている。",
          duration: 5,
        },
      ],
    },
    {
      id: "giggle",
      when: { type: "time", at: 145 },
      actions: [
        {
          type: "sound",
          sound: "giggle",
          at: { node: "mat-roll" },
          volume: 0.8,
        },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "巻いたマットの中から、くすくすと笑い声。「もういいかい……」",
          duration: 5,
        },
      ],
    },
    {
      id: "vault-2",
      when: { type: "time", at: 180 },
      actions: [
        { type: "visible", target: "vault-5", visible: true },
        { type: "sound", sound: "thud", at: [0, 2, 6], volume: 1 },
        { type: "shake", intensity: 0.02, duration: 0.6 },
        {
          type: "subtitle",
          text: "また一段。跳び箱の山が天井に届きそうだ。誰も、積んでいないのに。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "store-door", state: "slam" },
        { type: "door", door: "store-door", state: "lock" },
        { type: "lights", group: "moon", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "倉庫の鉄扉が閉まった。外から鍵がかかる音。月明かりも雲に隠れた。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "mat-move",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "move", target: "mat-roll", to: [-0.4, 0, 3.4], duration: 14 },
        {
          type: "sound",
          sound: "rattle",
          at: { node: "mat-roll" },
          volume: 0.9,
        },
        {
          type: "subtitle",
          text: "巻いたマットが、ずず……と床を這って、こちらへ近づいてくる。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: ほどけるマット ----
    {
      id: "unroll",
      when: { type: "after", trigger: "mat-move", delay: 14 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "mat-roll", visible: false },
        { type: "visible", target: "girl", visible: true },
        { type: "face", target: "girl" },
        { type: "sound", sound: "slam", at: { node: "girl" }, volume: 0.9 },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "マットが、ばさりとほどけた。中から、体操服の少女が、ゆっくり身体を起こす。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "look", target: "girl", maxAngleDeg: 28, maxDistance: 8 },
      requires: ["unroll"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "girl" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "unroll", delay: 6 },
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
          title: "体育倉庫",
          text: "翌朝、体育教師が倉庫を開けると、マットは巻かれたまま、きちんと隅に立てかけてあった。\nただ、巻いたマットの端から、小さな体操服の袖が、一筋はみ出していたという。\n\n三十年前、かくれんぼのまま見つからなかった生徒の名は、今も卒業アルバムに載っている。",
        },
      ],
    })),
  ],
};
