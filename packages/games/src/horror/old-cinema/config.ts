import type { HorrorConfig } from "./kit/types";

/**
 * 「最終上映」の演出データ。
 * 場内は x=-5〜5, z=0〜16（入口 z=0、スクリーンは北 z=16）。中央の通路 x=-1〜1、左右に3席×5列。
 * スクリーンの文字(scr-0〜4)を切り替えて「映像」を見せる。最後はスクリーンが真っ白になり、
 * その前に立つ黒いシルエット(silhouette)が通路を近づいてくる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "old-cinema",
  title: "最終上映",
  intro: [
    "閉館が決まった名画座の、最後の夜の貸し切り上映。観客は自分ひとり。",
    "好きな席で観ていいと言われた。",
  ],
  spawn: { position: [0, 1.6, 1.5], lookAt: [0, 1.8, 14] },
  fog: { color: [0.02, 0.02, 0.03], density: 0.02 },
  ambient: { intensity: 0.06, color: [0.8, 0.85, 1] },
  flashlight: {
    enabled: false,
    intensity: 0.5,
    angleDeg: 40,
    range: 10,
    color: [1, 0.95, 0.9],
  },
  walkSpeed: 0.08,
  droneLevel: 0.07,
  triggers: [
    // ---- 0〜1分: 一人きりの上映 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "古いフィルムの匂いと、客席のざらついたベルベット。スクリーンに題名だけが映っている。",
        },
        { type: "objective", text: "客席の中ほどまで進んで、上映を観る" },
      ],
    },
    {
      id: "seat",
      when: { type: "zone", center: [0, 1.6, 8], radius: 2.2 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 3, 14], volume: 0.4 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ブザーが鳴り、灯りが落ちる。映写機の回る音が、後ろから始まった。",
          duration: 5,
        },
      ],
    },
    // ---- 1〜3分: 客が増える ----
    {
      id: "audience-a",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "audience-a", visible: true },
        { type: "sound", sound: "creak", at: [-2.5, 1, 6], volume: 0.6 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "前の列に、客が座っている。……入ってきた気配は、無かった。",
          duration: 5,
        },
      ],
    },
    {
      id: "film-1",
      when: { type: "time", at: 110 },
      actions: [
        { type: "visible", target: "scr-0", visible: false },
        { type: "visible", target: "scr-1", visible: true },
        { type: "sound", sound: "static", at: [0, 3, 15], volume: 0.5 },
        {
          type: "subtitle",
          text: "映像が切り替わる。客席を後ろから撮ったような映像。座っている客の頭が、映っている。",
          duration: 6,
        },
      ],
    },
    {
      id: "audience-b",
      when: { type: "time", at: 150 },
      actions: [
        { type: "visible", target: "audience-b", visible: true },
        { type: "sound", sound: "whisper", at: [0, 1, 11], volume: 0.5 },
        {
          type: "subtitle",
          text: "いつの間にか、客席が半分埋まっている。誰も、振り向かない。",
          duration: 5,
        },
      ],
    },
    {
      id: "film-2",
      when: { type: "time", at: 180 },
      actions: [
        { type: "visible", target: "scr-1", visible: false },
        { type: "visible", target: "scr-2", visible: true },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "画面に、通路に立つ自分の後ろ姿が映った。……映写機の位置から、見ているみたいに。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分: 出口が閉じる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "cinema-door", state: "slam" },
        { type: "door", door: "cinema-door", state: "lock" },
        { type: "visible", target: "scr-2", visible: false },
        { type: "visible", target: "scr-3", visible: true },
        { type: "flicker", duration: 1.3 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.8 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "出口の扉が閉まり、鍵が回った。スクリーンには、赤い二文字だけ。",
          duration: 5,
        },
      ],
    },
    {
      id: "white",
      when: { type: "after", trigger: "lock", delay: 16 },
      actions: [
        { type: "visible", target: "scr-3", visible: false },
        { type: "visible", target: "scr-4", visible: true },
        { type: "visible", target: "silhouette", visible: true },
        { type: "move", target: "silhouette", to: [0, 0, 6], duration: 24 },
        { type: "sound", sound: "stinger", at: [0, 2, 15], volume: 0.5 },
        {
          type: "subtitle",
          text: "スクリーンが真っ白になった。逆光の中に、長い髪の影が立っている。通路をこちらへ歩いてくる。",
          duration: 6,
        },
      ],
    },
    // ---- 4〜5分: 逆光のシルエット ----
    {
      id: "close",
      when: { type: "after", trigger: "white", delay: 18 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "breath", at: "behind", volume: 0.9 },
        { type: "heartbeat", bpm: 135 },
        { type: "drone", level: 0.5 },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "silhouette",
        maxAngleDeg: 24,
        maxDistance: 8,
      },
      requires: ["white"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "white", delay: 27 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "最終上映",
          text: "翌朝、取り壊し前の点検で映写室を開けると、映写機にフィルムはかかっていなかった。\n\nそれなのに、客席の最前列には、人の形に潰れた座席が、びっしりと並んでいたという。",
        },
      ],
    })),
  ],
};
