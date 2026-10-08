import type { HorrorConfig } from "./kit/types";

/**
 * 「最終バスのあと」の演出データ。
 * 道路は z=-4〜36。バス停の小屋は (5, 10)。傘の女(umbrella)は遠くの街灯(z=26)から歩いてくる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "rainy-busstop",
  title: "最終バスのあと",
  intro: [
    "雨の夜、田舎のバス停。最終バスは、もう行ってしまったらしい。",
    "次の便まで、ここで朝を待つしかない。",
  ],
  spawn: { position: [4.8, 1.6, 9.2], lookAt: [0, 1.5, 28] },
  fog: { color: [0.08, 0.09, 0.12], density: 0.03 },
  ambient: { intensity: 0.09, color: [0.65, 0.75, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.55,
    angleDeg: 40,
    range: 14,
    color: [0.95, 0.98, 1],
  },
  walkSpeed: 0.085,
  droneLevel: 0.1,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "屋根を叩く雨の音。街灯は、道の遠くに一つだけ。",
        },
        { type: "objective", text: "時刻表を確認する" },
      ],
    },
    {
      id: "timetable",
      when: {
        type: "interact",
        target: "timetable",
        label: "時刻表を見る",
        maxDistance: 3,
      },
      actions: [
        { type: "sound", sound: "chime", at: "player", volume: 0.3 },
        {
          type: "subtitle",
          text: "最終は23:50。今は0時を回っている。時刻表の下に、小さく「このバス停は10年前に廃止されました」。",
          duration: 7,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "umbrella-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "umbrella", visible: true },
        { type: "sound", sound: "step", at: [3, 0, 28], volume: 0.4 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "遠い街灯の下に、傘をさした女が立っている。さっきまで、あんな人はいなかった。",
          duration: 6,
        },
      ],
    },
    {
      id: "umbrella-2",
      when: { type: "time", at: 110 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "move", target: "umbrella", to: [2.5, 0, 21], duration: 4 },
        { type: "sound", sound: "static", at: [3, 3, 24], volume: 0.4 },
        {
          type: "subtitle",
          text: "稲光。女は、傘の下でうつむいたまま、道のこちら側へ近づいている。",
          duration: 5,
        },
      ],
    },
    {
      id: "bus",
      when: { type: "time", at: 150 },
      actions: [
        { type: "lights", group: "bus", on: true },
        { type: "visible", target: "bus", visible: true },
        { type: "move", target: "bus", to: [-2.5, 0, -12], duration: 6 },
        { type: "sound", sound: "rumble", at: [-2.5, 1, 20], volume: 1 },
        { type: "drone", level: 0.25 },
        {
          type: "subtitle",
          text: "ヘッドライトが闇を裂き、バスが止まらずに走り抜けた。窓の中は、全部の座席に傘の人が座っていた。",
          duration: 7,
        },
      ],
    },
    {
      id: "umbrella-3",
      when: { type: "time", at: 185 },
      actions: [
        { type: "lights", group: "bus", on: false },
        { type: "flicker", duration: 1.2 },
        { type: "move", target: "umbrella", to: [1.2, 0, 14.5], duration: 3 },
        { type: "sound", sound: "step", at: { node: "umbrella" }, volume: 0.7 },
        {
          type: "subtitle",
          text: "また稲光。女は、道の向こうからバス停のすぐ近くまで来ている。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "lights", group: "far", on: false },
        { type: "lights", group: "shelter", on: false },
        { type: "fog", density: 0.07, duration: 6 },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "街灯が消え、バス停の灯りも落ちた。霧のような雨で、道のどちらにも進めない。",
          duration: 6,
        },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "arrive",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "move", target: "umbrella", to: [4.2, 0, 10.5], duration: 7 },
        { type: "sound", sound: "step", at: { node: "umbrella" }, volume: 0.9 },
        { type: "heartbeat", bpm: 135 },
        {
          type: "subtitle",
          text: "傘の女が、ベンチのすぐ隣まで来て立ち止まった。傘が、ゆっくり持ち上がる。",
          duration: 6,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "umbrella",
        maxAngleDeg: 30,
        maxDistance: 8,
      },
      requires: ["arrive"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "arrive", delay: 14 },
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
          title: "最終バスのあと",
          text: "翌朝、始発のバスの運転手は、廃止されたはずのバス停のベンチに、濡れた傘が一本置かれているのを見た。\n傘の下の座面だけが、ひどく冷たく濡れていたという。\n\n時刻表の最終は、いつの間にか、一本増えていた。",
        },
      ],
    })),
  ],
};
