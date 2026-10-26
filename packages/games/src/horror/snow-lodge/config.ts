import type { HorrorConfig } from "./kit/types";

/**
 * 「雪の山小屋」の演出データ。
 * 小屋は x=-4〜4, z=0〜8。南壁中央が出入口（cabin-door）。薪ストーブ stove(-3,5.5)、薪の山 woodpile(-3.2,2.4)。
 * 足跡は prints-a（0〜4）→ prints-b（5〜9）の順で出現。凍死した登山者 climber は最後にテーブル席へ現れる。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "snow-lodge",
  title: "雪の山小屋",
  intro: [
    "吹雪で下山できなくなり、避難小屋に転がり込んだ。",
    "ストーブに火を入れれば、朝まで耐えられる。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.5, 6] },
  fog: { color: [0.05, 0.06, 0.08], density: 0.02 },
  ambient: { intensity: 0.07, color: [0.75, 0.85, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.7,
    angleDeg: 42,
    range: 12,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.08,
  droneLevel: 0.07,
  triggers: [
    // ---- 0〜1分: 避難小屋で火を入れる ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "風の唸りと、窓を叩く雪。小屋の中は外と変わらないほど冷え切っている。",
        },
        { type: "objective", text: "薪ストーブに火を入れる" },
      ],
    },
    {
      id: "stove-on",
      when: {
        type: "interact",
        target: "stove",
        label: "ストーブに火を入れる",
        maxDistance: 2.2,
      },
      actions: [
        { type: "lights", group: "stove", on: true },
        { type: "sound", sound: "rattle", at: { node: "stove" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "ぱち、と薪がはぜた。橙色の灯りが、小屋の壁をゆっくり照らしていく。",
          duration: 5,
        },
        { type: "objective", text: "朝まで待つ" },
      ],
    },
    {
      id: "stove-auto",
      when: { type: "time", at: 55 },
      unless: ["stove-on"],
      actions: [
        { type: "lights", group: "stove", on: true },
        {
          type: "subtitle",
          text: "かじかむ手で、どうにかストーブに火が回った。",
          duration: 4,
        },
        { type: "objective", text: "朝まで待つ" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "window-knock",
      when: { type: "time", at: 75 },
      actions: [
        { type: "visible", target: "win-hand", visible: true },
        { type: "sound", sound: "knock", at: [3.9, 1.6, 4], volume: 0.8 },
        {
          type: "subtitle",
          text: "コン、コン。東の窓が叩かれた。霜のついたガラスに、手の跡が一つ。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 76 },
      ],
    },
    {
      id: "prints-a",
      when: { type: "time", at: 120 },
      actions: [
        { type: "visible", target: "prints-a", visible: true },
        { type: "sound", sound: "step", at: "behind", volume: 0.5 },
        {
          type: "subtitle",
          text: "入口からストーブまで、濡れた足跡が続いている。自分のものではない。裸足だ。",
          duration: 6,
        },
      ],
    },
    {
      id: "radio",
      when: { type: "time", at: 160 },
      actions: [
        { type: "sound", sound: "static", at: { node: "radio" }, volume: 0.7 },
        { type: "sound", sound: "whisper", at: { node: "radio" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "棚の無線機が勝手に鳴った。「……三名……全員……小屋の中……」",
          duration: 5,
        },
        { type: "drone", level: 0.18 },
      ],
    },
    // ---- 3〜4分: 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "cabin-door", state: "slam" },
        { type: "door", door: "cabin-door", state: "lock" },
        { type: "sound", sound: "rumble", at: [0, 2, 0], volume: 0.7 },
        { type: "shake", intensity: 0.03, duration: 1.2 },
        { type: "visible", target: "prints-b", visible: true },
        { type: "fog", density: 0.04, duration: 4 },
        {
          type: "subtitle",
          text: "突風。戸が勝手に閉まり、凍りついたように動かなくなった。足跡が、増えている。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 96 },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "stove-out",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "stove", on: false },
        { type: "flashlight", state: "dim" },
        { type: "sound", sound: "breath", at: "behind", volume: 0.8 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "ストーブの火が、ふっと消えた。吐く息が白い。背後で、誰かが息をしている。",
          duration: 5,
        },
        { type: "objective", text: "薪の山から薪を取って火を戻す" },
      ],
    },
    // ---- 4〜5分: 火を戻した先に ----
    {
      id: "wood-add",
      when: {
        type: "interact",
        target: "woodpile",
        label: "薪をくべる",
        maxDistance: 2.4,
      },
      requires: ["stove-out"],
      unless: SCARES,
      actions: [
        { type: "lights", group: "stove", on: true },
        { type: "flashlight", state: "on" },
        { type: "visible", target: "climber", visible: true },
        { type: "face", target: "climber" },
        { type: "sound", sound: "creak", at: { node: "climber" }, volume: 0.7 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "火が戻った。テーブルの席に、霜まみれの登山者が座っている。……さっきまで、いなかった。",
          duration: 5,
        },
      ],
    },
    {
      id: "wood-auto",
      when: { type: "after", trigger: "stove-out", delay: 35 },
      unless: ["wood-add", ...SCARES],
      actions: [
        { type: "lights", group: "stove", on: true },
        { type: "visible", target: "climber", visible: true },
        { type: "face", target: "climber" },
        { type: "sound", sound: "creak", at: { node: "climber" }, volume: 0.7 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ストーブが勝手に燃え上がった。テーブルの席に、霜まみれの登山者が座っている。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "climber",
        maxAngleDeg: 22,
        maxDistance: 20,
      },
      requiresAny: ["wood-add", "wood-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "climber" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "climber" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "雪の山小屋",
          text: "雪解けの春、小屋の中から三人分の登山靴が見つかった。\nストーブの前には、四人目の濡れた足跡が、まだ乾かずに残っていたという。",
        },
      ],
    })),
  ],
};
