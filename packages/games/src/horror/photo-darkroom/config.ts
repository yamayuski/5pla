import type { HorrorConfig } from "./kit/types";

/**
 * 「現像室」の演出データ。
 * 暗室は x=-3〜3, z=0〜8、入口 z=0（dark-door）。奥(z≈7)の干し紐に写真 photo-0〜4 が並び、異変のたびに写る内容が変わる。
 * 最後に見つかる photo-5 を見て、目を離した瞬間に背後から一発（lookAway 型）。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "photo-darkroom",
  title: "現像室",
  intro: [
    "祖父の写真館の暗室。形見のフィルムが一本だけ、現像されないまま残っていた。",
    "赤いセーフライトの下で、引き伸ばし機にかけてみる。",
  ],
  spawn: { position: [0, 1.6, 1], lookAt: [0, 1.4, 7] },
  fog: { color: [0.06, 0.02, 0.02], density: 0.03 },
  ambient: { intensity: 0.06, color: [1, 0.6, 0.55] },
  flashlight: {
    enabled: false,
    intensity: 0.5,
    angleDeg: 40,
    range: 8,
    color: [1, 0.5, 0.45],
  },
  walkSpeed: 0.06,
  droneLevel: 0.06,
  triggers: [
    // ---- 0〜1分: 現像する ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "酢酸の匂い。赤い灯りの下、薬品のバットが三つ並んでいる。",
        },
        { type: "objective", text: "引き伸ばし機で、フィルムを焼き付ける" },
      ],
    },
    {
      id: "develop",
      when: {
        type: "interact",
        target: "enlarger",
        label: "焼き付ける",
        maxDistance: 2.4,
      },
      actions: [
        { type: "visible", target: "photo-0", visible: true },
        { type: "sound", sound: "buzz", at: { node: "enlarger" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "液の中に像が浮かぶ。夏祭りで笑う、浴衣の少女。写真は干し紐にかけておく。",
          duration: 6,
        },
        { type: "objective", text: "写真が乾くのを待つ" },
      ],
    },
    {
      id: "develop-auto",
      when: { type: "time", at: 50 },
      unless: ["develop"],
      actions: [
        { type: "visible", target: "photo-0", visible: true },
        {
          type: "subtitle",
          text: "放っておいたバットの中で、勝手に像が浮かびあがった。夏祭りで笑う、浴衣の少女。",
          duration: 6,
        },
        { type: "objective", text: "写真が乾くのを待つ" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "photo-1",
      when: { type: "time", at: 80 },
      actions: [
        { type: "visible", target: "photo-1", visible: true },
        { type: "sound", sound: "drip", at: [0, 1, 7], volume: 0.8 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "二枚目。同じ場所、同じ少女。だが、こちらを向いている。",
          duration: 5,
        },
      ],
    },
    {
      id: "photo-2",
      when: { type: "time", at: 120 },
      actions: [
        { type: "visible", target: "photo-2", visible: true },
        { type: "sound", sound: "whisper", at: [0, 1.4, 7], volume: 0.5 },
        {
          type: "subtitle",
          text: "三枚目。少女が、カメラの目の前まで来ている。",
          duration: 5,
        },
      ],
    },
    {
      id: "photo-3",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "photo-3", visible: true },
        { type: "sound", sound: "rattle", at: [0, 1.4, 7], volume: 0.7 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "四枚目。撮影者の影が、写り込んでいる。……この暗室と同じ、赤い光の中に。",
          duration: 5,
        },
      ],
    },
    {
      id: "photo-4",
      when: { type: "time", at: 195 },
      actions: [
        { type: "visible", target: "photo-4", visible: true },
        { type: "sound", sound: "drip", at: [0, 1, 7], volume: 1 },
        {
          type: "subtitle",
          text: "五枚目。肩に白い手を載せられた、誰かの後ろ姿。……この白衣は、自分が着ているのと同じだ。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 215 },
      actions: [
        { type: "door", door: "dark-door", state: "slam" },
        { type: "door", door: "dark-door", state: "lock" },
        { type: "flicker", duration: 1.4 },
        { type: "shake", intensity: 0.02, duration: 1 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口の遮光扉が閉まり、内側から鍵が回った。赤い灯りがちらつく。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "photo-5",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "visible", target: "photo-5", visible: true },
        { type: "sound", sound: "stinger", at: [0, 1.4, 7], volume: 0.3 },
        { type: "objective", text: "最後の一枚をよく見る" },
        {
          type: "subtitle",
          text: "干し紐の端に、もう一枚。ついさっきまで、無かった。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: 見てはいけない ----
    {
      id: "seen-5",
      when: {
        type: "look",
        target: "photo-5",
        maxAngleDeg: 20,
        maxDistance: 5,
      },
      requires: ["photo-5"],
      unless: SCARES,
      actions: [
        { type: "lights", group: "safelight", on: false },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 0 },
        { type: "sound", sound: "breath", at: "behind", volume: 0.9 },
        {
          type: "subtitle",
          text: "最後の写真は、真っ暗な暗室の中。背後に、白い顔。……もう、後ろにいる。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "lookAway", target: "photo-5", minAngleDeg: 50 },
      requires: ["seen-5"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "girl" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "seen-5", delay: 22 },
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
          title: "現像室",
          text: "翌朝、写真館の暗室で、干し紐にかかった六枚の写真が見つかった。\n最後の一枚だけ、何も写っていない真っ黒な印画紙だったが、触れると、まだ濡れていた。\n\n祖父は、あの夏祭りの少女の写真を、生涯一枚も現像しなかったという。",
        },
      ],
    })),
  ],
};
