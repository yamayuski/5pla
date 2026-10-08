import type { HorrorConfig } from "./kit/types";

/**
 * 「消えた灯台」の演出データ。
 * 岬の道 z=0〜24（鉄門 path-gate は z=1.5）、灯台の根元の部屋 z=24〜30。番小屋の窓は西側 (x=-3.7, z=12)。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "lighthouse",
  title: "消えた灯台",
  intro: [
    "港の事務所から頼まれた。「岬の旧灯台の灯が、また消えている」。",
    "霧の夜道を歩いて、確かめに行くだけの仕事だ。",
  ],
  spawn: { position: [0, 1.6, 0.4], lookAt: [0, 1.6, 20] },
  fog: { color: [0.1, 0.12, 0.15], density: 0.035 },
  ambient: { intensity: 0.1, color: [0.7, 0.8, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.55,
    angleDeg: 38,
    range: 14,
    color: [0.95, 0.98, 1],
  },
  walkSpeed: 0.085,
  droneLevel: 0.08,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "波の音と霧笛。岬の先にあるはずの灯台は、霧に溶けて見えない。",
        },
        { type: "objective", text: "岬の突き当たりの灯台まで歩く" },
      ],
    },
    {
      id: "cottage",
      when: { type: "zone", center: [-1, 1.6, 10], radius: 3 },
      actions: [
        {
          type: "subtitle",
          text: "道の脇の番小屋に、灯りがともっている。無人のはずなのに。",
          duration: 5,
        },
      ],
    },
    // ---- 1〜3分 ----
    {
      id: "beam-on",
      when: { type: "time", at: 70 },
      actions: [
        { type: "custom", name: "beamOn" },
        { type: "sound", sound: "rumble", at: [0, 8, 28], volume: 0.7 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "霧の奥で、光がゆっくり回り始めた。この灯台は、三十年前に電源を抜かれたはずだ。",
          duration: 6,
        },
      ],
    },
    {
      id: "window",
      when: { type: "time", at: 110 },
      actions: [
        { type: "flicker", duration: 1.0 },
        { type: "visible", target: "win-lit", visible: false },
        { type: "visible", target: "win-person", visible: true },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.6 },
        {
          type: "subtitle",
          text: "番小屋の窓に、人影。背後の砂利を踏む足音が、一歩ずつ近づいてくる。",
          duration: 6,
        },
      ],
    },
    {
      id: "dark",
      when: { type: "time", at: 150 },
      actions: [
        { type: "visible", target: "win-person", visible: false },
        { type: "visible", target: "win-dark", visible: true },
        { type: "lights", group: "cottage", on: false },
        { type: "sound", sound: "slam", at: [-4.2, 1.5, 12], volume: 0.9 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "番小屋の扉が内側から叩きつけられ、灯りが消えた。誰かが、外へ出てきた。",
          duration: 6,
        },
      ],
    },
    {
      id: "keeper-1",
      when: { type: "time", at: 185 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "visible", target: "keeper", visible: true },
        { type: "sound", sound: "breath", at: { node: "keeper" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "道の先に、古い制服の男が背を向けて立っている。光が回るたび、少しだけ近づく。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "path-gate", state: "slam" },
        { type: "door", door: "path-gate", state: "lock" },
        { type: "move", target: "keeper", to: [0.8, 0, 19], duration: 0.2 },
        { type: "visible", target: "keeper", visible: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.4 },
        { type: "heartbeat", bpm: 105 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "背後の鉄門が閉まった。男の姿が消えた。逃げ道は、岬の先の灯台の中しかない。",
          duration: 6,
        },
        { type: "objective", text: "灯台の根元の部屋に入る" },
      ],
    },
    // ---- 4〜5分 ----
    {
      id: "enter",
      when: { type: "zone", center: [0, 1.6, 27], radius: 2.2 },
      requires: ["lock"],
      unless: SCARES,
      actions: [
        { type: "custom", name: "beamOff" },
        { type: "lights", group: "base", on: true },
        { type: "sound", sound: "buzz", at: "player", volume: 0.7 },
        { type: "heartbeat", bpm: 140 },
        { type: "flicker", duration: 0.8 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "光が止まった。航海日誌の最後のページに、あなたの名前と、今日の日付。",
          duration: 3,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "enter", delay: 3.2 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "lock", delay: 60 },
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
          title: "消えた灯台",
          text: "翌朝、港の船乗りたちは、岬の灯台から光が一晩中回っていたと口をそろえた。\n事務所の記録では、あの灯台はとうに廃止されている。\n\n岬の鉄門の前には、懐中電灯だけが落ちていた。",
        },
      ],
    })),
  ],
};
