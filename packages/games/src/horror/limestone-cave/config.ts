import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「鏡ヶ淵」の演出データ。
 * 鍾乳洞の第二洞：入口の鉄格子 cave-gate、木道の音声ガイド guide、地底湖 lake と看板 lake-sign、
 * 落ちる鍾乳石 falling、照明 group cave / 湖の青い光 lakeglow。最後は湖面に立つ guide-woman。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "limestone-cave",
  title: "鏡ヶ淵",
  intro: [
    "観光鍾乳洞のガイドツアー。写真を撮っているうちに、団体からはぐれてしまった。",
    "係員の声は奥の方へ遠ざかっていった。木道をたどれば、きっと追いつける。",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [0, 1.4, 10] },
  fog: { color: [0.015, 0.015, 0.02], density: 0.05 },
  ambient: { intensity: 0.04, color: [0.8, 0.8, 0.9] },
  flashlight: {
    enabled: false,
    intensity: 0.55,
    angleDeg: 40,
    range: 12,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.07,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "ひんやりした空気。ぽたり、ぽたりと水の落ちる音だけが響く。",
          duration: 5,
        },
        { type: "objective", text: "木道の音声ガイドを聞く" },
      ],
    },
    {
      id: "listen",
      when: { type: "interact", target: "guide", label: "音声ガイドを再生", maxDistance: 2.2 },
      actions: [
        { type: "sound", sound: "chime", at: { node: "guide" }, volume: 0.5 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ガイド「この先は地底湖、鏡ヶ淵。水面に映る顔が、ときどき自分と違って見えると言われております」",
          duration: 7,
        },
      ],
    },
    {
      id: "listen-auto",
      when: { type: "time", at: 50 },
      unless: ["listen"],
      actions: [
        { type: "sound", sound: "chime", at: { node: "guide" }, volume: 0.5 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "誰も押していない音声ガイドが鳴った。「この先は地底湖、鏡ヶ淵でございます」",
          duration: 6,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "steps",
      when: { type: "time", at: 75 },
      actions: [
        { type: "sound", sound: "drip", at: "behind", volume: 0.6 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.6 },
        {
          type: "subtitle",
          text: "水滴の音が、うしろで足音に変わった。止まると、向こうも止まる。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "voice",
      when: { type: "time", at: 120 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 1.6, 18], volume: 0.7 },
        {
          type: "subtitle",
          text: "奥から係員の声。「こちらへどうぞ……こちらへ……」。団体の足音は、もう聞こえない。",
          duration: 6,
        },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "fall",
      when: { type: "time", at: 160 },
      actions: [
        { type: "move", target: "falling", to: [0.3, 0.5, 6], duration: 0.35 },
        { type: "sound", sound: "thud", at: { node: "falling" }, volume: 0.9 },
        { type: "shake", intensity: 0.04, duration: 0.7 },
        { type: "flicker", duration: 1 },
        {
          type: "subtitle",
          text: "背後で鍾乳石が折れて落ちた。電球が明滅する。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "cave-gate", state: "slam" },
        { type: "door", door: "cave-gate", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        {
          type: "subtitle",
          text: "入口の鉄格子が閉まる音が、洞窟じゅうに反響した。「本日の見学は終了しました」",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "cave", on: false },
        { type: "lights", group: "lakeglow", on: true },
        { type: "flashlight", state: "on" },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "電球がすべて消えた。奥の地底湖だけが、青く光っている。",
          duration: 6,
        },
        { type: "objective", text: "地底湖の看板を照らす" },
      ],
    },
    {
      id: "sign",
      when: { type: "interact", target: "lake-sign", label: "看板を読む", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "guide-woman", visible: true },
        { type: "sound", sound: "drip", at: { node: "guide-woman" }, volume: 0.9 },
        { type: "sound", sound: "whisper", at: { node: "guide-woman" }, volume: 0.7 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "「水深 不明」。……ちゃぷ、と水音。湖の上に、制服の女が立っている。",
          duration: 6,
        },
      ],
    },
    {
      id: "sign-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["sign", ...SCARES],
      actions: [
        { type: "visible", target: "guide-woman", visible: true },
        { type: "sound", sound: "drip", at: { node: "guide-woman" }, volume: 0.9 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "「こちらへどうぞ」。湖の上から、係員の声がした。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "guide-woman", maxAngleDeg: 20, maxDistance: 18 },
      requiresAny: ["sign", "sign-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "guide-woman" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "guide-woman" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "鏡ヶ淵",
          text: "ツアーの点呼で、一人足りないことに気づいたのは出口だった。\n第二洞は二十年前の落盤事故以来、案内していない。係員はそう言って、首を傾げた。",
        },
      ],
    })),
  ],
};
