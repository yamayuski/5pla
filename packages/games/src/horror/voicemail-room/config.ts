import type { HorrorConfig } from "./kit/types";

/**
 * 「留守電 3件」の演出データ。
 * リビング z=0〜8。留守番電話のボタン msg-1/2/3 を順番に押してメッセージを再生する（interact を requires でつなぐ）。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "voicemail-room",
  title: "留守電 3件",
  intro: [
    "残業から帰った夜十二時。留守番電話のランプが「3」と点滅している。",
    "ひとり暮らしで、この番号を知っている人は少ない。",
  ],
  spawn: { position: [-1.5, 1.6, 1.2], lookAt: [3, 1.2, 3.5] },
  fog: { color: [0.06, 0.05, 0.05], density: 0.012 },
  ambient: { intensity: 0.1, color: [1, 0.92, 0.82] },
  flashlight: {
    enabled: true,
    intensity: 0.35,
    angleDeg: 40,
    range: 9,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.08,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "部屋は静かで、留守電のランプだけが赤く瞬いている。",
        },
        { type: "objective", text: "留守電の1件目を再生する" },
      ],
    },
    {
      id: "msg-1",
      when: {
        type: "interact",
        target: "msg-1",
        label: "1件目を再生",
        maxDistance: 2.8,
      },
      actions: [
        { type: "sound", sound: "chime", at: { node: "msg-1" }, volume: 0.6 },
        { type: "sound", sound: "static", at: { node: "msg-1" }, volume: 0.4 },
        { type: "objective", text: "2件目を再生する" },
        {
          type: "subtitle",
          text: "「もしもし、お母さんよ。ちゃんとご飯食べてる？」……母は、去年亡くなっている。",
          duration: 7,
        },
      ],
    },
    {
      id: "cold",
      when: { type: "time", at: 80 },
      actions: [
        { type: "sound", sound: "drip", at: [-3.4, 1, 4.5], volume: 0.6 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "壁の家族写真から、水が一滴、床に落ちた。顔の部分が濡れている。",
          duration: 5,
        },
      ],
    },
    {
      id: "msg-2",
      when: {
        type: "interact",
        target: "msg-2",
        label: "2件目を再生",
        maxDistance: 2.8,
      },
      requires: ["msg-1"],
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "chime", at: { node: "msg-2" }, volume: 0.6 },
        { type: "sound", sound: "static", at: { node: "msg-2" }, volume: 0.5 },
        { type: "objective", text: "3件目を再生する" },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "「今、どこ？　さっきから、あなたの部屋の前にいるんだけど……」。昨夜、同僚から聞いた番号の声だ。",
          duration: 7,
        },
      ],
    },
    {
      id: "steps",
      when: { type: "time", at: 150 },
      actions: [
        { type: "sound", sound: "footsteps", at: [-2.5, 0, 0], volume: 0.6 },
        { type: "sound", sound: "knock", at: [-2.5, 1.3, 0], volume: 0.7 },
        {
          type: "subtitle",
          text: "玄関の前で、足音が止まった。ドアを、コン、コン、と叩く。",
          duration: 5,
        },
      ],
    },
    {
      id: "lock",
      when: { type: "time", at: 205 },
      unless: ["lock-early"],
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "door", door: "front-door", state: "lock" },
        { type: "lights", group: "room", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "玄関のドアが開いて、閉まった。電気が消え、留守電のランプだけが赤く光っている。",
          duration: 6,
        },
      ],
    },
    {
      id: "lock-early",
      when: { type: "after", trigger: "msg-2", delay: 30 },
      unless: ["lock"],
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "door", door: "front-door", state: "lock" },
        { type: "lights", group: "room", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "玄関のドアが開いて、閉まった。電気が消え、留守電のランプだけが赤く光っている。",
          duration: 6,
        },
      ],
    },
    {
      id: "msg-3",
      when: {
        type: "interact",
        target: "msg-3",
        label: "3件目を再生",
        maxDistance: 2.8,
      },
      requires: ["msg-2"],
      unless: SCARES,
      actions: [
        { type: "sound", sound: "chime", at: { node: "msg-3" }, volume: 0.7 },
        { type: "sound", sound: "breath", at: "behind", volume: 0.9 },
        { type: "heartbeat", bpm: 140 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "「……おかえり。いま、あなたの後ろにいるよ」。録音の声が、背後からも同じ声で重なった。",
          duration: 3,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "msg-3", delay: 2.6 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "time", at: 290 },
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
          title: "留守電 3件",
          text: "翌朝、会社に来ない社員を心配した同僚が部屋を訪ねると、鍵は内側から閉まっていた。\n留守番電話には「3件」の表示が残り、再生すると、聞き覚えのある声で最後にこう録音されていたという。\n\n「ただいま」",
        },
      ],
    })),
  ],
};
