import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 保健室の演出データ。
 * 来室記録 record（interact）、生徒 pupil、入口 front-door、照明 group room / bed。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "school-nurse",
  title: "来室記録",
  intro: [
    "夜の学校。宿直の見回りで、保健室の鍵を確かめに来た。",
    "ベッドのカーテンは全部開いているはずだ。確認して、早く帰ろう。",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [0, 1.4, 8] },
  fog: { color: [0.02, 0.03, 0.03], density: 0.02 },
  ambient: { intensity: 0.09, color: [0.8, 0.95, 0.9] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 10, color: [0.95, 1, 0.95] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "消毒液の匂い。ベッドの白いカーテンが一台だけ閉まっている。", duration: 5 },
        { type: "objective", text: "保健室を確認する" },
      ],
    },
    {
      id: "curtain-sway",
      when: { type: "time", at: 50 },
      actions: [
        { type: "custom", name: "curtainSway" },
        { type: "subtitle", text: "窓も閉まっているのに、カーテンがゆっくり揺れた。", duration: 4 },
      ],
    },
    {
      id: "peek-1",
      when: { type: "time", at: 95 },
      actions: [
        { type: "visible", target: "peeker", visible: true },
        { type: "sound", sound: "whisper", at: { node: "peeker" }, volume: 0.5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "peek-away",
      when: { type: "lookAway", target: "peeker", minAngleDeg: 30 },
      requires: ["peek-1"],
      actions: [
        { type: "visible", target: "peeker", visible: false },
        { type: "subtitle", text: "薬品棚の陰に、体操服の子が立っていた……目を逸らすと、もういない。", duration: 5 },
      ],
    },
    {
      id: "peek-auto",
      when: { type: "time", at: 110 },
      actions: [{ type: "visible", target: "peeker", visible: false }],
    },
    {
      id: "record-new",
      when: { type: "time", at: 150 },
      actions: [
        { type: "sound", sound: "rattle", at: [2.9, 1.2, 3], volume: 0.6 },
        { type: "visible", target: "note-new", visible: true },
        { type: "subtitle", text: "壁の掲示に、見覚えのない一枚。「本日の来室者：1名（まだ帰っていません）」。", duration: 6 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "chime",
      when: { type: "time", at: 190 },
      actions: [
        { type: "sound", sound: "bell", at: [0, 2, 9], volume: 0.7 },
        { type: "subtitle", text: "校内放送のチャイムが、一度だけ鳴った。", duration: 4 },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    {
      id: "lock",
      when: { type: "time", at: 215 },
      actions: [
        { type: "door", door: "front-door", state: "slam" },
        { type: "door", door: "front-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "lights", group: "room", on: false },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "戸が閉まり、蛍光灯が落ちた。机の上のスタンドだけが残る。", duration: 5 },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.4 },
        { type: "flashlight", state: "on" },
        { type: "fog", density: 0.05, duration: 5 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "heartbeat", bpm: 108 },
        { type: "subtitle", text: "机の来室記録が、ひとりでにめくれている。最後のページが空いている。", duration: 6 },
        { type: "objective", text: "来室記録を見る" },
      ],
    },
    {
      id: "rec-open",
      when: { type: "interact", target: "record", label: "来室記録を見る", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "lights", group: "bed", on: false },
        { type: "visible", target: "pupil", visible: true },
        { type: "sound", sound: "breath", at: { node: "pupil" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "最後の行に、あなたの名前と「帰宅：なし」。顔を上げると、ベッドの上に生徒が座っている。", duration: 6 },
      ],
    },
    {
      id: "rec-auto",
      when: { type: "after", trigger: "blackout", delay: 40 },
      unless: ["rec-open", ...SCARES],
      actions: [
        { type: "lights", group: "bed", on: false },
        { type: "visible", target: "pupil", visible: true },
        { type: "sound", sound: "breath", at: { node: "pupil" }, volume: 0.8 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        { type: "subtitle", text: "スタンドが消え、暗闇のベッドに生徒が座っている。", duration: 5 },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "rec-open", delay: 3 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "pupil" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "pupil" }],
    },
    {
      id: "scare-auto",
      when: { type: "after", trigger: "rec-auto", delay: 4 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "pupil" }],
    },
    ...[...SCARES, "scare-auto"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "来室記録",
          text: "翌朝、保健の先生は来室記録の最後の行に、宿直の名前を見つけた。\n「帰宅：なし」。ベッドのカーテンは、一台だけ閉まっていた。",
        },
      ],
    })),
  ],
};
