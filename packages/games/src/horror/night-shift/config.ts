import type { HorrorConfig } from "./kit/types";

/**
 * 「深夜二時のレジ」の演出データ。
 * 店内は x=-6〜6, z=-4〜4。入口（自動ドア）は手前 z=-4 の x=3、
 * レジカウンターは左壁沿い（店員は x≈-5 に立つ）、防犯モニターはカウンター上。
 * 防犯カメラ映像（RenderTargetTexture）にだけ映る女は level.ts の custom フックで動かす。
 */
const SCARES = ["scare", "scare-late", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "night-shift",
  title: "深夜二時のレジ",
  intro: ["国道沿いのコンビニ、深夜ワンオペ。", "客はもう一時間、来ていない。"],
  spawn: { position: [-5, 1.6, -0.5], lookAt: [2, 1.4, -0.5] },
  fog: { color: [0.01, 0.012, 0.02], density: 0.03 },
  ambient: { intensity: 0.08, color: [0.8, 0.85, 1] },
  flashlight: {
    enabled: false,
    intensity: 1.3,
    angleDeg: 50,
    range: 14,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.09,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: いつもの夜勤 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "sound", sound: "buzz", at: [0, 2.9, 0], volume: 0.4 },
        {
          type: "subtitle",
          text: "深夜二時。……今のうちに品出しを済ませよう。",
        },
        { type: "objective", text: "店の奥の段ボールを棚に出す" },
      ],
    },
    {
      id: "restock",
      when: { type: "interact", target: "box", label: "品出しする" },
      actions: [
        { type: "sound", sound: "thud", at: { node: "box" }, volume: 0.6 },
        { type: "visible", target: "box", visible: false },
        { type: "subtitle", text: "よし。あとはレジで朝まで待つだけだ。" },
        { type: "objective", text: "レジに戻る" },
      ],
    },
    {
      id: "restock-hint",
      when: { type: "time", at: 55 },
      unless: ["restock"],
      actions: [
        {
          type: "subtitle",
          text: "段ボールは、奥のバックヤードの扉の前に置いてある。",
        },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "phantom-customer",
      when: { type: "zone", center: [-5, 1.6, -1], radius: 1.8 },
      requires: ["restock"],
      actions: [
        { type: "custom", name: "autoDoorBlink" },
        { type: "sound", sound: "chime", at: [3, 2.6, -4], volume: 0.5 },
        { type: "subtitle", text: "いらっしゃいませー……。……誰も、いない？" },
      ],
    },
    {
      id: "monitor-hint",
      when: { type: "after", trigger: "phantom-customer", delay: 6 },
      actions: [{ type: "objective", text: "防犯モニターで入口を確認する" }],
    },
    {
      id: "monitor-1",
      when: { type: "interact", target: "monitor", label: "モニターを見る" },
      requires: ["monitor-hint"],
      actions: [
        { type: "custom", name: "ghostOutside" },
        {
          type: "sound",
          sound: "static",
          at: { node: "monitor" },
          volume: 0.4,
        },
        {
          type: "subtitle",
          text: "……入口の外に、誰か立っている。",
          duration: 4,
        },
        { type: "objective", text: "" },
        { type: "heartbeat", bpm: 66 },
      ],
    },
    {
      id: "monitor-1-gone",
      when: { type: "after", trigger: "monitor-1", delay: 5 },
      actions: [
        { type: "custom", name: "ghostHide" },
        { type: "subtitle", text: "外を見ても、駐車場には誰もいない。" },
      ],
    },
    {
      id: "phone",
      when: { type: "after", trigger: "monitor-1", delay: 14 },
      actions: [
        { type: "sound", sound: "phone", at: [-3.5, 1.5, 4.6] },
        { type: "subtitle", text: "バックヤードで電話が鳴っている。" },
        { type: "objective", text: "バックヤードの電話に出る" },
      ],
    },
    {
      id: "phone-again",
      when: { type: "after", trigger: "phone", delay: 5 },
      unless: ["backdoor"],
      actions: [{ type: "sound", sound: "phone", at: [-3.5, 1.5, 4.6] }],
    },
    {
      id: "shelf-fall",
      when: { type: "zone", center: [-2.6, 1.6, 1.6], radius: 1.3 },
      requires: ["phone"],
      actions: [
        { type: "custom", name: "shelfFall" },
        { type: "sound", sound: "thud", at: [-1.6, 1, 0.8], volume: 1 },
        { type: "flicker", duration: 1 },
      ],
    },
    {
      id: "backdoor",
      when: { type: "interact", target: "backdoor", label: "開ける" },
      requires: ["phone"],
      actions: [
        { type: "sound", sound: "rattle", at: { node: "backdoor" } },
        {
          type: "subtitle",
          text: "開かない。……内側から、押さえられてる？",
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "knock-back",
      when: { type: "after", trigger: "backdoor", delay: 2 },
      actions: [
        { type: "sound", sound: "knock", at: { node: "backdoor" }, volume: 1 },
        { type: "drone", level: 0.4 },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "trap-ready",
      when: { type: "after", trigger: "knock-back", delay: 5 },
      actions: [],
    },
    {
      id: "trap-timeout",
      when: { type: "after", trigger: "phone", delay: 35 },
      unless: ["backdoor"],
      actions: [],
    },
    {
      id: "trapped",
      when: { type: "time", at: 0 },
      requiresAny: ["trap-ready", "trap-timeout"],
      actions: [
        { type: "custom", name: "autoDoorLock" },
        { type: "sound", sound: "slam", at: [3, 1.2, -4], volume: 1 },
        { type: "lights", group: "store", on: false },
        { type: "flashlight", state: "dim" },
        { type: "custom", name: "ghostAisle" },
        { type: "subtitle", text: "停電――！？ 自動ドアが、閉まった。" },
        { type: "objective", text: "レジの防犯モニターを見る" },
        { type: "drone", level: 0.8 },
        { type: "heartbeat", bpm: 92 },
      ],
    },
    {
      id: "chime-loop",
      when: { type: "after", trigger: "trapped", delay: 6 },
      actions: [
        { type: "sound", sound: "chime", at: [3, 2.6, -4], volume: 0.35 },
        {
          type: "subtitle",
          text: "誰もいない入口で、入店チャイムだけが鳴る。",
        },
      ],
    },
    {
      id: "monitor-2",
      when: { type: "interact", target: "monitor", label: "モニターを見る" },
      requires: ["monitor-1", "trapped"],
      actions: [
        {
          type: "sound",
          sound: "static",
          at: { node: "monitor" },
          volume: 0.6,
        },
        {
          type: "subtitle",
          text: "……店の中に、いる。近づいてきてる。",
          duration: 3,
        },
      ],
    },
    {
      id: "monitor-2-timeout",
      when: { type: "after", trigger: "trapped", delay: 40 },
      unless: ["monitor-2"],
      actions: [],
    },
    {
      id: "behind-you",
      when: { type: "time", at: 0 },
      requiresAny: ["monitor-2-wait", "monitor-2-timeout"],
      actions: [
        { type: "custom", name: "ghostBehind" },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 130 },
        {
          type: "subtitle",
          text: "モニターの中で、女が、自分のすぐ後ろに立っている。",
          duration: 5,
        },
      ],
    },
    {
      id: "monitor-2-wait",
      when: { type: "after", trigger: "monitor-2", delay: 3.5 },
      actions: [],
    },
    {
      id: "breath",
      when: { type: "after", trigger: "behind-you", delay: 2 },
      actions: [{ type: "sound", sound: "breath", at: "behind" }],
    },
    // ---- 最後の一発 ----
    {
      id: "scare",
      when: {
        type: "look",
        target: "behind-mark",
        maxAngleDeg: 50,
        maxDistance: 8,
      },
      requires: ["breath"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-late",
      when: { type: "after", trigger: "breath", delay: 9 },
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
          title: "深夜二時のレジ",
          text: "朝六時、交代のバイトが来たとき、店には誰もいなかった。\n防犯カメラには、レジの中で、誰もいない背後に\n何度も頭を下げ続ける店員が映っていたという。",
        },
      ],
    })),
  ],
};
