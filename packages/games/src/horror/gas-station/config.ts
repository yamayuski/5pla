import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「後部座席」の演出データ。
 * 給油機 pump（x=0.6, z=9.5）の表示 meter-a/b/c、車 car（x=2.6, z=9）と運転席ドア car-door、
 * 売店 kiosk（北、扉 kiosk-door、照明 group kiosk、スピーカー speaker）、キャノピー照明 group canopy。
 * 最後は車の後部座席の passenger が現れる。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "gas-station",
  title: "後部座席",
  intro: [
    "深夜三時、峠を越える前に、県道沿いのセルフスタンドに寄った。",
    "ここから先、朝まで店は一軒もない。満タンにしておこう。",
  ],
  spawn: { position: [-1.6, 1.6, 6.2], lookAt: [0.6, 1.3, 9.5] },
  fog: { color: [0.02, 0.025, 0.03], density: 0.03 },
  ambient: { intensity: 0.07, color: [0.7, 0.75, 0.9] },
  flashlight: {
    enabled: false,
    intensity: 0.6,
    angleDeg: 42,
    range: 12,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "虫の集まる蛍光灯の下。売店に店員の姿はない。",
          duration: 5,
        },
        { type: "objective", text: "給油機で給油する" },
      ],
    },
    {
      id: "refuel",
      when: { type: "interact", target: "pump", label: "給油する", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "pump" }, volume: 0.5 },
        { type: "visible", target: "meter-a", visible: false },
        { type: "visible", target: "meter-b", visible: true },
        {
          type: "subtitle",
          text: "ノズルが止まった。38.20リットル。これで朝まではもつ。",
          duration: 5,
        },
        { type: "objective", text: "売店で一息つくか、車に戻る" },
      ],
    },
    {
      id: "refuel-auto",
      when: { type: "time", at: 45 },
      unless: ["refuel"],
      actions: [
        { type: "sound", sound: "buzz", at: { node: "pump" }, volume: 0.5 },
        { type: "visible", target: "meter-a", visible: false },
        { type: "visible", target: "meter-b", visible: true },
        {
          type: "subtitle",
          text: "いつの間にか給油が終わっていた。38.20リットル。",
          duration: 5,
        },
        { type: "objective", text: "売店で一息つくか、車に戻る" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "meter-run",
      when: { type: "time", at: 75 },
      requiresAny: ["refuel", "refuel-auto"],
      actions: [
        { type: "custom", name: "meterRun" },
        {
          type: "subtitle",
          text: "ノズルは掛けたはずなのに、給油機の数字がまた回り始めた。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "clerk-glimpse",
      when: { type: "look", target: "kiosk-sign", maxAngleDeg: 25, maxDistance: 16 },
      requires: ["meter-run"],
      actions: [
        { type: "visible", target: "clerk", visible: true },
        { type: "flicker", duration: 0.6 },
      ],
    },
    {
      id: "clerk-gone",
      when: { type: "after", trigger: "clerk-glimpse", delay: 1.2 },
      actions: [
        { type: "visible", target: "clerk", visible: false },
        {
          type: "subtitle",
          text: "レジの奥に、誰か立っていた……気がした。",
          duration: 4,
        },
      ],
    },
    {
      id: "car-rock",
      when: { type: "time", at: 125 },
      actions: [
        { type: "custom", name: "carRock" },
        { type: "sound", sound: "knock", at: { node: "car" }, volume: 0.7 },
        {
          type: "subtitle",
          text: "誰も乗っていない車が、ぐらりと揺れた。中から窓を叩く音。",
          duration: 5,
        },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "speaker",
      when: { type: "time", at: 170 },
      actions: [
        { type: "sound", sound: "static", at: { node: "speaker" }, volume: 0.6 },
        { type: "sound", sound: "whisper", at: { node: "speaker" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "スピーカー「……お客様。お連れ様が、お車でお待ちです」",
          duration: 6,
        },
        { type: "visible", target: "meter-b", visible: false },
        { type: "visible", target: "meter-c", visible: true },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "kiosk-door", state: "slam" },
        { type: "door", door: "kiosk-door", state: "lock" },
        { type: "lights", group: "kiosk", on: false },
        { type: "sound", sound: "slam", at: [0, 1.2, 15], volume: 0.8 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        {
          type: "subtitle",
          text: "売店の自動ドアが閉まり、明かりが落ちた。「本日の営業は終了しました」",
          duration: 5,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.6 },
        { type: "lights", group: "canopy", on: false },
        { type: "flashlight", state: "on" },
        { type: "fog", density: 0.07, duration: 5 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "キャノピーの灯りが消えた。県道の方は霧で何も見えない。スマホのライトを点けた。",
          duration: 6,
        },
        { type: "objective", text: "車に戻ってここを出る" },
      ],
    },
    {
      id: "door-try",
      when: { type: "interact", target: "car-door", label: "運転席のドアを開ける", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "sound", sound: "creak", at: { node: "car-door" }, volume: 0.6 },
        { type: "visible", target: "passenger", visible: true },
        { type: "sound", sound: "breath", at: { node: "passenger" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "ドアに手をかけたとき、ガラス越しに見えた。後部座席に、誰か座っている。",
          duration: 6,
        },
      ],
    },
    {
      id: "door-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["door-try", ...SCARES],
      actions: [
        { type: "sound", sound: "knock", at: { node: "car" }, volume: 0.9 },
        { type: "visible", target: "passenger", visible: true },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "車の中から、窓を叩く音。後部座席に、誰か座っている。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "passenger", maxAngleDeg: 20, maxDistance: 14 },
      requiresAny: ["door-try", "door-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "passenger" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "passenger" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "後部座席",
          text: "翌朝、県道沿いのスタンドに、給油口の開いたままの車が見つかった。\nレシートの合計は二人分。後部座席のシートだけが、ぐっしょりと濡れていた。",
        },
      ],
    })),
  ],
};
