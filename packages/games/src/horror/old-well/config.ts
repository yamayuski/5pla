import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「釣瓶」の演出データ。
 * 裏庭の古井戸 well（x=0, z=9）と釣瓶 bucket、勝手口 back-door（南、x=-3）、軒下の灯り group porch、
 * 井戸から勝手口へ続く濡れた足跡 prints。最後は井戸から現れる well-girl。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "old-well",
  title: "釣瓶",
  intro: [
    "夏休み、祖父母の家。夜になって水道が止まった。",
    "「裏の井戸から汲んでおいで。まだ水は出るから」と祖母は言った。",
  ],
  spawn: { position: [-3, 1.6, 1.4], lookAt: [0, 1, 9] },
  fog: { color: [0.02, 0.025, 0.035], density: 0.035 },
  ambient: { intensity: 0.06, color: [0.6, 0.7, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.55,
    angleDeg: 40,
    range: 12,
    color: [1, 0.96, 0.88],
  },
  walkSpeed: 0.08,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "虫の声。裏庭の真ん中に、苔むした古井戸がある。",
          duration: 5,
        },
        { type: "objective", text: "井戸で釣瓶を引き上げる" },
      ],
    },
    {
      id: "draw",
      when: { type: "interact", target: "well", label: "釣瓶を引き上げる", maxDistance: 2.4 },
      actions: [
        { type: "custom", name: "bucketUp" },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "冷たい水がなみなみと上がってきた。……髪の毛が一本、浮いている。",
          duration: 5,
        },
      ],
    },
    {
      id: "draw-auto",
      when: { type: "time", at: 50 },
      unless: ["draw"],
      actions: [
        { type: "custom", name: "bucketUp" },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "滑車がきしみ、触れてもいない釣瓶がゆっくり上がってきた。",
          duration: 5,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "insects-stop",
      when: { type: "time", at: 75 },
      actions: [
        { type: "drone", level: 0 },
        { type: "sound", sound: "drip", at: { node: "well" }, volume: 0.7 },
        {
          type: "subtitle",
          text: "虫の声が一斉に止んだ。井戸の底で、ぴちゃん、と水の跳ねる音。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 72 },
      ],
    },
    {
      id: "rope-pull",
      when: { type: "time", at: 120 },
      actions: [
        { type: "custom", name: "bucketDrop" },
        { type: "shake", intensity: 0.01, duration: 0.6 },
        {
          type: "subtitle",
          text: "がらがらがら！釣瓶の縄が、井戸の中へ一気に引き込まれた。",
          duration: 5,
        },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "prints",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "prints", visible: true },
        { type: "sound", sound: "step", at: [-3, 0.1, 1], volume: 0.5 },
        { type: "sound", sound: "whisper", at: { node: "well" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "井戸から勝手口まで、濡れた裸足の足跡が続いている。さっきまでは無かった。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 86 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "back-door", state: "slam" },
        { type: "door", door: "back-door", state: "lock" },
        { type: "visible", target: "window", visible: false },
        { type: "sound", sound: "slam", at: [-3, 1, 0], volume: 0.8 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        {
          type: "subtitle",
          text: "勝手口が内側から閉められ、鍵の掛かる音。家の灯りも消えた。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "porch", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "dim" },
        { type: "fog", density: 0.07, duration: 5 },
        { type: "sound", sound: "whisper", at: { node: "well" }, volume: 0.8 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "軒下の灯りが消えた。井戸の底から、自分の名前を呼ぶ声がする。",
          duration: 6,
        },
        { type: "objective", text: "井戸を覗き込む" },
      ],
    },
    {
      id: "peer",
      when: { type: "interact", target: "well", label: "井戸を覗き込む", maxDistance: 2.4 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "well-girl", visible: true },
        { type: "move", target: "well-girl", to: [0, 0.15, 9], duration: 3 },
        { type: "sound", sound: "drip", at: { node: "well" }, volume: 0.9 },
        { type: "sound", sound: "breath", at: { node: "well" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "暗い水面に、自分の顔……ではない。濡れた黒髪が、ゆっくり上がってくる。",
          duration: 6,
        },
      ],
    },
    {
      id: "peer-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["peer", ...SCARES],
      actions: [
        { type: "visible", target: "well-girl", visible: true },
        { type: "move", target: "well-girl", to: [0, 0.15, 9], duration: 3 },
        { type: "sound", sound: "drip", at: { node: "well" }, volume: 0.9 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "井戸の縁に、濡れた白い手が掛かった。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "well-girl", maxAngleDeg: 20, maxDistance: 14 },
      requiresAny: ["peer", "peer-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "well-girl" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "well-girl" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "釣瓶",
          text: "翌朝、祖母は裏庭の井戸に蓋をし、石を三つ載せた。\n「あの井戸はね、昔、汲みに行った子が一人帰ってこなかったの」。足跡は、勝手口の中まで続いていた。",
        },
      ],
    })),
  ],
};
