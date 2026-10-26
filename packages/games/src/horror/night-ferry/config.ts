import type { HorrorAction, HorrorConfig } from "./kit/types";

/**
 * 「乗船名簿」の演出データ。
 * 二等船室 x=-5〜5, z=0〜8、北の扉の先が後部甲板（z=8〜16）。南西の扉の先は案内所前ホール。
 * 船室の毛布の膨らみ（lump-0〜6）は最初 3 つ、途中で 5 つに増え、最後に 7 人全員が起き上がる（sitter-0〜6）。
 */
const SCARES = ["scare-hit", "scare-timeout"];
const SITTERS = [0, 1, 2, 3, 4, 5, 6];

const sitUp: HorrorAction[] = SITTERS.flatMap((i) => [
  { type: "visible" as const, target: `lump-${i}`, visible: false },
  { type: "visible" as const, target: `sitter-${i}`, visible: true },
  { type: "face" as const, target: `sitter-${i}` },
]);

export const config: HorrorConfig = {
  slug: "night-ferry",
  title: "乗船名簿",
  intro: [
    "深夜のフェリー、二等船室。朝には向こうの港に着く。",
    "眠れないので、甲板で風に当たることにした。",
  ],
  spawn: { position: [-4, 1.6, 1.6], lookAt: [0, 1.4, 8] },
  fog: { color: [0.03, 0.04, 0.06], density: 0.03 },
  ambient: { intensity: 0.08, color: [0.8, 0.85, 1] },
  flashlight: {
    enabled: false,
    intensity: 0.7,
    angleDeg: 40,
    range: 12,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.07,
  droneLevel: 0.08,
  triggers: [
    // ---- 0〜1分: 夜の船旅 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "エンジンの低い振動。毛布をかぶって寝ている客が、二、三人。",
        },
        { type: "objective", text: "北の扉から甲板へ出る" },
      ],
    },
    {
      id: "deck",
      when: { type: "zone", center: [0, 1.6, 12], radius: 3 },
      actions: [
        { type: "sound", sound: "breath", at: [0, 0, 20], volume: 0.4 },
        {
          type: "subtitle",
          text: "真っ暗な海。港の明かりは、もうどこにも見えない。",
          duration: 4,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "announce",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "chime", at: "player", volume: 0.7 },
        {
          type: "subtitle",
          text: "「本船はまもなく、波ノ底港に着岸いたします」……そんな港、航路にない。",
          duration: 5,
        },
      ],
    },
    {
      id: "sea-voice",
      when: { type: "time", at: 105 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, -3, 19], volume: 0.9 },
        {
          type: "subtitle",
          text: "船尾の下の海から、誰かが名前を呼んだ気がした。",
          duration: 4,
        },
        { type: "heartbeat", bpm: 78 },
      ],
    },
    {
      id: "more-sleepers",
      when: { type: "time", at: 138 },
      actions: [
        { type: "visible", target: "lump-3", visible: true },
        { type: "visible", target: "lump-4", visible: true },
        { type: "sound", sound: "breath", at: [1, 0.4, 4], volume: 0.6 },
        {
          type: "subtitle",
          text: "船室の毛布の膨らみが、増えている。途中の港には、一度も寄っていないのに。",
          duration: 5,
        },
      ],
    },
    {
      id: "horn",
      when: { type: "time", at: 168 },
      actions: [
        { type: "sound", sound: "rumble", at: [0, 6, 0], volume: 1 },
        { type: "fog", density: 0.07, duration: 8 },
        { type: "shake", intensity: 0.02, duration: 2 },
        { type: "drone", level: 0.25 },
        {
          type: "subtitle",
          text: "汽笛が長く鳴った。船のまわりに、濃い霧が立ちこめていく。",
          duration: 4,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "hall-door", state: "slam" },
        { type: "lights", group: "hall", on: false },
        { type: "lights", group: "deck", on: false },
        { type: "lights", group: "cabin2", on: false },
        { type: "flicker", duration: 1.2 },
        { type: "shake", intensity: 0.03, duration: 1.2 },
        { type: "drone", level: 0.45 },
        { type: "heartbeat", bpm: 98 },
        {
          type: "subtitle",
          text: "案内所へ続く扉が閉まった。甲板の明かりも落ちた。船が、大きく傾く。",
          duration: 5,
        },
      ],
    },
    {
      id: "count-0",
      when: { type: "after", trigger: "lock", delay: 7 },
      actions: [
        { type: "sound", sound: "chime", at: "player", volume: 0.7 },
        {
          type: "subtitle",
          text: "「乗船名簿と、お客様の人数を確認いたします。船室へお戻りください」",
          duration: 5,
        },
        { type: "objective", text: "船室へ戻る" },
      ],
    },
    {
      id: "count-1",
      when: { type: "after", trigger: "lock", delay: 14 },
      actions: [
        { type: "sound", sound: "whisper", at: "player", volume: 0.5 },
        { type: "subtitle", text: "「いち……に……さん……」", duration: 4 },
        { type: "heartbeat", bpm: 112 },
      ],
    },
    {
      id: "count-2",
      when: { type: "after", trigger: "lock", delay: 22 },
      actions: [
        { type: "subtitle", text: "「し……ご……ろく……」", duration: 4 },
        { type: "heartbeat", bpm: 126 },
      ],
    },
    // ---- 4〜5分: 全員起き上がる ----
    {
      id: "sit-up",
      when: { type: "zone", center: [0, 1.6, 4], radius: 4.2 },
      requires: ["count-2"],
      unless: SCARES,
      actions: [
        ...sitUp,
        { type: "lights", group: "cabin", on: false },
        { type: "flicker", duration: 1.6 },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 0 },
        { type: "sound", sound: "breath", at: "player", volume: 0.7 },
        {
          type: "subtitle",
          text: "毛布の下から、全員が起き上がって、こちらを見ている。「……なな。おそろいですね」",
          duration: 3,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "sit-up", delay: 2.6 },
      actions: [{ type: "jumpscare", figure: "crew" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [...sitUp, { type: "jumpscare", figure: "crew" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "乗船名簿",
          text: "翌朝、フェリーは定刻に入港した。\n二等船室 B は空っぽで、乗船名簿の人数だけが、ひとり多かった。\n\n最後の行には、あなたの名前が書かれていた。",
        },
      ],
    })),
  ],
};
