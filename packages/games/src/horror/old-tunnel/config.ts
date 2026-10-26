import type { HorrorConfig } from "./kit/types";

/**
 * 「隧道」の演出データ。
 * 坑口 z=0、トンネルは z=0〜56（幅 x=-2.2〜2.2）。外 z<0 に止まった車。
 * 中ほど z=28 の東壁に非常ボタン。北の出口 z=56 は通行止めの鉄柵。
 * 最後は暗闇型：明かりもライトも消えた真っ暗闇で、両側から壁を叩く音が近づき、フラッシュの一瞬に一発。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "old-tunnel",
  title: "隧道",
  intro: [
    "近道のつもりで入った山道で、車が止まった。電波も無い。",
    "目の前の古いトンネルの中ほどに、非常ボタンがあるはずだ。",
  ],
  spawn: { position: [-1.2, 1.6, -2.6], lookAt: [0, 1.6, 20] },
  fog: { color: [0.04, 0.035, 0.03], density: 0.035 },
  ambient: { intensity: 0.05, color: [1, 0.9, 0.8] },
  flashlight: {
    enabled: true,
    intensity: 0.75,
    angleDeg: 40,
    range: 14,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.09,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 止まった車 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "オレンジ色のナトリウム灯。水の滴る音が、トンネルの奥まで響いている。",
        },
        { type: "objective", text: "トンネルの中ほどの非常ボタンを押す" },
      ],
    },
    {
      id: "sos",
      when: {
        type: "interact",
        target: "sos-button",
        label: "非常ボタンを押す",
        maxDistance: 2,
      },
      unless: ["lock"],
      actions: [
        {
          type: "sound",
          sound: "buzz",
          at: { node: "sos-button" },
          volume: 0.6,
        },
        {
          type: "sound",
          sound: "static",
          at: { node: "sos-button" },
          volume: 0.4,
        },
        {
          type: "subtitle",
          text: "ジーッ……。スピーカーから、ざらざらした雑音と、誰かの息づかい。応答は、ない。",
          duration: 5,
        },
        { type: "objective", text: "車へ戻って朝を待つ" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "hands-1",
      when: { type: "time", at: 68 },
      actions: [
        { type: "visible", target: "hand-0", visible: true },
        { type: "visible", target: "hand-1", visible: true },
        { type: "sound", sound: "knock", at: [-2.1, 1.4, 22], volume: 0.7 },
        {
          type: "subtitle",
          text: "ぺたん。壁を叩く音。見ると、煤けた壁に赤黒い手形がついている。",
          duration: 5,
        },
      ],
    },
    {
      id: "horn",
      when: { type: "time", at: 102 },
      actions: [
        { type: "sound", sound: "buzz", at: [0.8, 1, -6], volume: 1 },
        { type: "sound", sound: "rumble", at: [0.8, 1, -6], volume: 0.4 },
        {
          type: "subtitle",
          text: "坑口の外で、止まったはずの自分の車のクラクションが鳴った。",
          duration: 4,
        },
        { type: "heartbeat", bpm: 80 },
      ],
    },
    {
      id: "hands-2",
      when: { type: "time", at: 136 },
      actions: [
        { type: "visible", target: "hand-2", visible: true },
        { type: "visible", target: "hand-3", visible: true },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.6 },
        {
          type: "subtitle",
          text: "自分の足音が、半拍遅れてもう一つ聞こえる。手形が増えている。",
          duration: 5,
        },
      ],
    },
    {
      id: "lights-out-1",
      when: { type: "time", at: 168 },
      actions: [
        { type: "lights", group: "car", on: false },
        { type: "lights", group: "light-a", on: false },
        { type: "sound", sound: "thud", at: [1.6, 3.6, 8], volume: 0.5 },
        { type: "drone", level: 0.22 },
        {
          type: "subtitle",
          text: "坑口側のナトリウム灯が消えた。車のライトも、もう見えない。",
          duration: 4,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "visible", target: "rubble", visible: true },
        { type: "sound", sound: "rumble", at: [0, 3, 3], volume: 1 },
        { type: "sound", sound: "slam", at: [0, 1, 3], volume: 0.9 },
        { type: "shake", intensity: 0.05, duration: 2 },
        { type: "fog", density: 0.07, duration: 4 },
        { type: "lights", group: "light-b", on: false },
        { type: "drone", level: 0.45 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "轟音。坑口の天井が崩れ落ちた。戻る道が、岩で埋まった。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "hands-3",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "visible", target: "hand-4", visible: true },
        { type: "visible", target: "hand-5", visible: true },
        { type: "visible", target: "hand-6", visible: true },
        { type: "visible", target: "hand-7", visible: true },
        { type: "lights", group: "light-c", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.5 },
        {
          type: "subtitle",
          text: "ライトが弱くなってきた。最後の明かりが、通行止めの柵のほうに一つだけ。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: 真っ暗闇 ----
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 45 },
      unless: SCARES,
      actions: [
        { type: "lights", group: "light-d", on: false },
        { type: "flashlight", state: "off" },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 0 },
        {
          type: "subtitle",
          text: "全部、消えた。何も見えない。",
          duration: 3,
        },
      ],
    },
    {
      id: "slaps",
      when: { type: "after", trigger: "blackout", delay: 3.5 },
      actions: [
        { type: "sound", sound: "knock", at: [-2.1, 1.4, 0], volume: 0.6 },
        { type: "sound", sound: "knock", at: [2.1, 1.4, 0], volume: 0.6 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.9 },
        {
          type: "subtitle",
          text: "ぺた。ぺた。ぺた。両側の壁を叩く音が、近づいてくる。",
          duration: 4,
        },
      ],
    },
    {
      id: "slaps-near",
      when: { type: "after", trigger: "blackout", delay: 7 },
      actions: [
        { type: "sound", sound: "knock", at: "player", volume: 1 },
        { type: "sound", sound: "breath", at: "behind", volume: 1 },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "blackout", delay: 9.5 },
      actions: [{ type: "jumpscare", figure: "worker" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "worker" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "隧道",
          text: "鬼首隧道は昭和九年、工事中の落盤で多くの作業員が生き埋めになった。\n掘り出されなかった彼らは、今も内側から壁を叩いている。\n\n翌朝、坑口の脇で、エンジンのかかったままの車が見つかった。",
        },
      ],
    })),
  ],
};
