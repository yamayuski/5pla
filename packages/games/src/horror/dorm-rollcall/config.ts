import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「204号室、在室6名」の演出データ。
 * 6人部屋（5人在籍）：寝ている膨らみ lump-0〜5（東の下段 lump-4 の位置は空き床）、空き床の布団 extra-futon と
 * 現れる膨らみ lump-extra、点呼表 roster（表示 roster-a/b）、扉 dorm-door、照明 group room / night / red。
 * 最後は天井から逆さにぶら下がる peer、飛び出すのは ghost。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "dorm-rollcall",
  title: "204号室、在室6名",
  intro: [
    "全寮制の高校。今週は自分が夜の点呼当番だ。",
    "23時、最後の部屋は204号室。五人部屋で、ベッドが一つ余っている。",
  ],
  spawn: { position: [1.6, 1.6, 1.0], lookAt: [0, 1.0, 5] },
  fog: { color: [0.02, 0.02, 0.025], density: 0.02 },
  ambient: { intensity: 0.06, color: [0.8, 0.85, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.45,
    angleDeg: 40,
    range: 8,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.06,
  droneLevel: 0.03,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "寝息と、時計の音。二段ベッドの布団が、五つ膨らんでいる。",
          duration: 5,
        },
        { type: "objective", text: "扉の脇の点呼表に記入する" },
      ],
    },
    {
      id: "check",
      when: { type: "interact", target: "roster", label: "在室5名と記入する", maxDistance: 2.2 },
      actions: [
        { type: "lights", group: "night", on: true },
        { type: "lights", group: "room", on: false },
        { type: "sound", sound: "step", at: { node: "roster" }, volume: 0.3 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "在室5名、異常なし。消灯して常夜灯にする。",
          duration: 4,
        },
      ],
    },
    {
      id: "check-auto",
      when: { type: "time", at: 45 },
      unless: ["check"],
      actions: [
        { type: "lights", group: "night", on: true },
        { type: "lights", group: "room", on: false },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "消灯時間。部屋の明かりが落ち、常夜灯だけになった。",
          duration: 4,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "extra",
      when: { type: "time", at: 75 },
      actions: [
        { type: "visible", target: "lump-extra", visible: true },
        { type: "sound", sound: "creak", at: { node: "lump-extra" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "ぎし、とベッドが鳴った。空いていたはずの東の下段に、布団の膨らみがある。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "roster-change",
      when: { type: "time", at: 120 },
      actions: [
        { type: "visible", target: "roster-a", visible: false },
        { type: "visible", target: "roster-b", visible: true },
        { type: "sound", sound: "whisper", at: { node: "lump-extra" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "点呼表の「5」が「6」に書き換わっている。自分の字で。",
          duration: 6,
        },
        { type: "drone", level: 0.1 },
      ],
    },
    {
      id: "vanish",
      when: { type: "time", at: 160 },
      actions: [
        { type: "flicker", duration: 1 },
        { type: "visible", target: "lump-0", visible: false },
        { type: "visible", target: "lump-1", visible: false },
        { type: "visible", target: "lump-2", visible: false },
        { type: "visible", target: "lump-3", visible: false },
        { type: "visible", target: "lump-5", visible: false },
        { type: "sound", sound: "breath", at: { node: "lump-extra" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "常夜灯が瞬いたあと、寝息が消えた。五つの布団は、ぺたんこになっていた。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "dorm-door", state: "slam" },
        { type: "door", door: "dorm-door", state: "lock" },
        { type: "sound", sound: "slam", at: [1.6, 1, 0], volume: 0.8 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        {
          type: "subtitle",
          text: "扉が閉まった。廊下で、誰かが点呼の続きをしている声。「……204、在室7名」",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "night", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "dim" },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "常夜灯が切れた。残っている膨らみは、東の下段の一つだけ。",
          duration: 6,
        },
        { type: "objective", text: "東の下段の布団をめくる" },
      ],
    },
    {
      id: "uncover",
      when: { type: "interact", target: "lump-extra", label: "布団をめくる", maxDistance: 2.2 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "lump-extra", visible: false },
        { type: "visible", target: "peer", visible: true },
        { type: "sound", sound: "giggle", at: { node: "peer" }, volume: 0.7 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "空っぽだ。……頭の上から、くすくす笑う声。長い髪が、肩に触れた。",
          duration: 6,
        },
      ],
    },
    {
      id: "uncover-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["uncover", ...SCARES],
      actions: [
        { type: "visible", target: "lump-extra", visible: false },
        { type: "visible", target: "peer", visible: true },
        { type: "sound", sound: "giggle", at: { node: "peer" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "最後の膨らみが、すっと平らになった。天井の方から、くすくす笑う声。",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "peer", maxAngleDeg: 22, maxDistance: 10 },
      requiresAny: ["uncover", "uncover-auto"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "peer", visible: false },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "peer", visible: false },
        { type: "jumpscare", figure: "ghost" },
      ],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "204号室、在室6名",
          text: "翌朝の点呼。204号室の五人は全員そろっていた。\n点呼表の当番欄だけが空白で、在室の欄には赤い字で「7名」と書かれていた。",
        },
      ],
    })),
  ],
};
