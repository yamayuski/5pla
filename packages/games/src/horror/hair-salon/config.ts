import type { HorrorConfig } from "./kit/types";

/**
 * 「閉店後の美容室」の演出データ。
 * 店内は x=-4〜4, z=0〜10（入口 z=0、front-door）。西の鏡の前にスタイリングチェア3脚（chair-0〜2）、
 * 北にシャンプー台（x=3 の台にタオルをかぶった客 customer が寝ている）、レジ(register)と照明スイッチ(switch)。
 * 最後は客が起き上がり（sitter）こちらを向く。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "hair-salon",
  title: "閉店後の美容室",
  intro: [
    "駅前の美容室で働く最後の一人。今夜はレジを締めて、電気を消すだけ。",
    "鏡に映る誰もいない店内は、昼とは別の場所のようだ。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.4, 8] },
  fog: { color: [0.05, 0.03, 0.04], density: 0.016 },
  ambient: { intensity: 0.1, color: [1, 0.85, 0.9] },
  flashlight: {
    enabled: true,
    intensity: 0.6,
    angleDeg: 42,
    range: 11,
    color: [1, 0.97, 0.92],
  },
  walkSpeed: 0.08,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 閉店作業 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "BGMの消えた店内。ドライヤーの熱の匂いが、まだ残っている。",
        },
        { type: "objective", text: "レジを締める" },
      ],
    },
    {
      id: "register",
      when: {
        type: "interact",
        target: "register",
        label: "レジを締める",
        maxDistance: 2.2,
      },
      actions: [
        {
          type: "sound",
          sound: "rattle",
          at: { node: "register" },
          volume: 0.5,
        },
        {
          type: "subtitle",
          text: "今日の売上。……合わない。レジの中に、見覚えのない古い五円玉が一枚。",
          duration: 5,
        },
        { type: "objective", text: "照明のスイッチを切る" },
      ],
    },
    {
      id: "switch-off",
      when: {
        type: "interact",
        target: "switch",
        label: "照明を消す",
        maxDistance: 2.4,
      },
      actions: [
        { type: "lights", group: "salon", on: false },
        { type: "sound", sound: "thud", at: { node: "switch" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "照明を消した。ネオンの赤と外の街灯だけが、店の中に残った。",
          duration: 5,
        },
        { type: "objective", text: "店を出る" },
      ],
    },
    {
      id: "switch-auto",
      when: { type: "time", at: 75 },
      unless: ["switch-off"],
      actions: [
        { type: "lights", group: "salon", on: false },
        {
          type: "subtitle",
          text: "店内の照明が、勝手に落ちた。ネオンの赤だけが残る。",
          duration: 5,
        },
        { type: "objective", text: "店を出る" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "chair-spin",
      when: { type: "time", at: 95 },
      actions: [
        { type: "custom", name: "spin0" },
        { type: "sound", sound: "creak", at: [-2.9, 0.8, 3], volume: 0.8 },
        { type: "heartbeat", bpm: 74 },
        {
          type: "subtitle",
          text: "ぎ、ぎい……。誰も座っていない一番手前のチェアが、ゆっくりこちらを向いた。",
          duration: 5,
        },
      ],
    },
    {
      id: "dryer",
      when: { type: "time", at: 135 },
      actions: [
        { type: "sound", sound: "buzz", at: [-3, 1.3, 5.5], volume: 0.8 },
        { type: "sound", sound: "static", at: [-3, 1.3, 5.5], volume: 0.4 },
        {
          type: "subtitle",
          text: "コンセントは抜いたはずのドライヤーが、鏡の前で唸りはじめた。",
          duration: 5,
        },
      ],
    },
    {
      id: "water",
      when: { type: "time", at: 170 },
      actions: [
        { type: "visible", target: "customer", visible: true },
        { type: "sound", sound: "drip", at: [3, 0.9, 9.5], volume: 0.9 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "奥のシャンプー台から水音。台の上に、顔にタオルをかけられた客が寝かされている。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分: 出口が閉じる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "door", door: "front-door", state: "lock" },
        { type: "lights", group: "street", on: false },
        { type: "custom", name: "spinAll" },
        { type: "visible", target: "dangling-hand", visible: true },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口のガラス戸が閉まった。外の街灯も消えた。全部のチェアが、こちらを向いている。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "hand",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "sound", sound: "drip", at: [3, 0.6, 8.6], volume: 1 },
        { type: "sound", sound: "whisper", at: [3, 1, 8.6], volume: 0.7 },
        {
          type: "subtitle",
          text: "台から垂れた白い手の指先から、水がぽたぽた落ちている。「……カットは……まだですか……」",
          duration: 6,
        },
      ],
    },
    // ---- 4〜5分: 起き上がる客 ----
    {
      id: "sit-up",
      when: { type: "after", trigger: "lock", delay: 24 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "customer", visible: false },
        { type: "visible", target: "sitter", visible: true },
        { type: "face", target: "sitter" },
        { type: "sound", sound: "creak", at: { node: "sitter" }, volume: 1 },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "タオルがずるりと落ちた。濡れた長い髪の客が、ゆっくり起き上がる。",
          duration: 4,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "sitter",
        maxAngleDeg: 28,
        maxDistance: 20,
      },
      requires: ["sit-up"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "sitter" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "sit-up", delay: 8 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "sitter" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "sitter" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "閉店後の美容室",
          text: "翌朝、開店準備に来た店長は、シャンプー台がびしょ濡れなのに気づいた。\n予約表の最後の欄には、鉛筆でこう書かれていた。\n\n「23:50 カット・シャンプー　お名前：（空欄）」",
        },
      ],
    })),
  ],
};
