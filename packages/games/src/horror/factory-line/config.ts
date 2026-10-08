import type { HorrorConfig } from "./kit/types";

/**
 * 「最終工程」の演出データ。
 * 工場の通路 x=-4〜4, z=0〜30。入口 back-door(z=0) が閉まり、追跡者(chaser)が入口側から奥へ歩いてくる。
 * 奥の非常口 exit-door(z=30) は鍵がかかっている。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "factory-line",
  title: "最終工程",
  intro: [
    "食品工場の夜勤。今夜はラインに自分ひとりしかいない。",
    "終業のチャイムが鳴ったら、タイムカードを押して帰ろう。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.6, 14] },
  fog: { color: [0.06, 0.07, 0.07], density: 0.012 },
  ambient: { intensity: 0.1, color: [0.9, 1, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.45,
    angleDeg: 40,
    range: 13,
    color: [0.95, 1, 1],
  },
  walkSpeed: 0.1,
  droneLevel: 0.06,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "停止したはずのラインの冷却ファンだけが、低く唸っている。",
        },
        { type: "objective", text: "タイムカードを押して退勤する" },
      ],
    },
    {
      id: "card",
      when: {
        type: "interact",
        target: "time-card",
        label: "退勤を押す",
        maxDistance: 2.6,
      },
      actions: [
        {
          type: "sound",
          sound: "chime",
          at: { node: "time-card" },
          volume: 0.6,
        },
        {
          type: "subtitle",
          text: "「退勤済み」の表示。しかし、記録の時刻は昨日の夜になっている。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "belt-on",
      when: { type: "time", at: 70 },
      actions: [
        { type: "custom", name: "beltOn" },
        { type: "sound", sound: "rumble", at: [-2.4, 1, 15], volume: 0.7 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "止まっていたベルトコンベアが、勝手に動きだした。流れてくる箱は、すべて空だ。",
          duration: 6,
        },
      ],
    },
    {
      id: "pa",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "sound", sound: "chime", at: [0, 3.5, 15], volume: 0.7 },
        {
          type: "subtitle",
          text: "構内放送。「本日の作業は終了しました。まだ、構内に一名、残っています」",
          duration: 6,
        },
      ],
    },
    {
      id: "steps",
      when: { type: "time", at: 160 },
      actions: [
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.6 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "入口のほうから、濡れた靴のような足音がした。振り返っても、誰もいない。",
          duration: 5,
        },
      ],
    },
    {
      id: "exit-light",
      when: { type: "time", at: 190 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "sound", sound: "buzz", at: [0, 3, 29], volume: 0.5 },
        { type: "objective", text: "奥の非常口から外へ出る" },
        {
          type: "subtitle",
          text: "通路の奥で、非常口の緑色のランプが点滅している。入口へは戻らないほうがいい。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分: 追跡 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "back-door", state: "slam" },
        { type: "door", door: "back-door", state: "lock" },
        { type: "lights", group: "norm", on: false },
        { type: "lights", group: "alarm", on: true },
        { type: "flashlight", state: "dim" },
        { type: "custom", name: "beltOff" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "背後の入口が閉まり、非常ベルが鳴りだした。赤い灯りの中に、人影。",
          duration: 6,
        },
      ],
    },
    {
      id: "chase",
      when: { type: "after", trigger: "lock", delay: 6 },
      actions: [
        { type: "visible", target: "chaser", visible: true },
        { type: "move", target: "chaser", to: [0, 0, 29], duration: 24 },
        {
          type: "sound",
          sound: "footsteps",
          at: { node: "chaser" },
          volume: 0.9,
        },
        { type: "heartbeat", bpm: 140 },
        {
          type: "subtitle",
          text: "入口のほうから、女が歩いてくる。急ぐ様子もなく、確実に。逃げろ。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "scare-hit",
      when: {
        type: "interact",
        target: "exit-door",
        label: "非常口を開ける",
        maxDistance: 4,
      },
      requires: ["chase"],
      unless: SCARES,
      actions: [
        {
          type: "sound",
          sound: "rattle",
          at: { node: "exit-door" },
          volume: 1,
        },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "chase", delay: 17 },
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
          title: "最終工程",
          text: "翌朝、ラインの点検に来た職員は、ベルトコンベアの最後に、箱が一つ余っていることに気づいた。\n箱の中には、昨夜の夜勤の社員証が一枚だけ入っていたという。\n\n製造ラインは今日も、問題なく稼働している。",
        },
      ],
    })),
  ],
};
