import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「終点の名前」の演出データ。
 * 寝台列車の通路：自分の個室 room-1 と枕 pillow、個室の扉 room-2〜6、北端の連結扉 gangway-n と洗面台 basin、
 * 案内表示 led / led-b、窓に並走する顔 window-face（フック faceFollow / faceGone）、
 * 照明 group car / cabin / red。最後は北の連結扉から来る車掌 conductor。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "sleeper-train",
  title: "終点の名前",
  intro: [
    "夜行の寝台特急。個室のベッドで横になったが、喉が渇いて眠れない。",
    "通路の突き当たりに洗面台がある。乗客はみんな眠っているはずだ。",
  ],
  spawn: { position: [0.4, 1.6, 1.0], lookAt: [-1.0, 1.4, 6] },
  fog: { color: [0.02, 0.015, 0.015], density: 0.03 },
  ambient: { intensity: 0.06, color: [1, 0.9, 0.8] },
  flashlight: {
    enabled: false,
    intensity: 0.45,
    angleDeg: 42,
    range: 10,
    color: [1, 0.97, 0.9],
  },
  walkSpeed: 0.06,
  droneLevel: 0.12,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "がたん、ごとん。レールの継ぎ目の音。窓の外を、町の灯りが流れていく。",
          duration: 5,
        },
        { type: "objective", text: "通路の突き当たりの洗面台で水を飲む" },
      ],
    },
    {
      id: "drink",
      when: { type: "interact", target: "basin", label: "水を飲む", maxDistance: 2.2 },
      actions: [
        { type: "sound", sound: "drip", at: { node: "basin" }, volume: 0.6 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "冷たい水。……少し、鉄の味がした。個室に戻ろう。",
          duration: 5,
        },
      ],
    },
    {
      id: "drink-auto",
      when: { type: "time", at: 50 },
      unless: ["drink"],
      actions: [
        { type: "sound", sound: "drip", at: { node: "basin" }, volume: 0.6 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "通路の奥で、洗面台の水がひとりでに流れ出した。",
          duration: 5,
        },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "door-open",
      when: { type: "time", at: 75 },
      actions: [
        { type: "door", door: "room-4", state: "open" },
        { type: "sound", sound: "creak", at: { node: "room-4" }, volume: 0.6 },
        {
          type: "subtitle",
          text: "4号室の扉が、すうっと開いた。中は真っ暗で、誰も出てこない。",
          duration: 6,
        },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "window-face",
      when: { type: "time", at: 120 },
      actions: [
        { type: "visible", target: "window-face", visible: true },
        { type: "custom", name: "faceFollow" },
        { type: "sound", sound: "knock", at: "player", volume: 0.5 },
        {
          type: "subtitle",
          text: "窓を叩く音。時速百キロで走る列車の窓の外に、女の顔が並んでいる。",
          duration: 6,
        },
        { type: "drone", level: 0.2 },
      ],
    },
    {
      id: "window-gone",
      when: { type: "after", trigger: "window-face", delay: 14 },
      actions: [{ type: "custom", name: "faceGone" }],
    },
    {
      id: "announce",
      when: { type: "time", at: 165 },
      actions: [
        { type: "visible", target: "led", visible: false },
        { type: "visible", target: "led-b", visible: true },
        { type: "sound", sound: "chime", at: { node: "led" }, volume: 0.5 },
        { type: "sound", sound: "static", at: { node: "led" }, volume: 0.5 },
        {
          type: "subtitle",
          text: "車内放送。「次は、終点……」。駅の名前のところだけ、ひどい雑音で聞き取れない。",
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
        { type: "door", door: "room-1", state: "slam" },
        { type: "door", door: "room-1", state: "lock" },
        { type: "door", door: "room-4", state: "slam" },
        { type: "door", door: "gangway-n", state: "slam" },
        { type: "door", door: "gangway-n", state: "lock" },
        { type: "sound", sound: "slam", at: [-1, 1, 16], volume: 0.8 },
        { type: "sound", sound: "slam", at: [-0.35, 1, 1], volume: 0.8 },
        { type: "shake", intensity: 0.04, duration: 1.2 },
        {
          type: "subtitle",
          text: "急ブレーキ。自分の個室の扉も、連結扉も、勢いよく閉まって開かない。",
          duration: 6,
        },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "car", on: false },
        { type: "lights", group: "red", on: true },
        { type: "flashlight", state: "on" },
        { type: "drone", level: 0.4 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "車内灯が消え、青い非常灯だけになった。列車は止まらない。",
          duration: 6,
        },
        { type: "objective", text: "個室の扉を叩く" },
      ],
    },
    {
      id: "knock",
      when: { type: "interact", target: "room-1", label: "扉を叩く", maxDistance: 2.2 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [
        { type: "sound", sound: "knock", at: { node: "room-1" }, volume: 0.8 },
        { type: "visible", target: "conductor", visible: true },
        { type: "door", door: "gangway-n", state: "unlock" },
        { type: "door", door: "gangway-n", state: "open" },
        { type: "door", door: "room-1", state: "unlock" },
        { type: "door", door: "room-1", state: "open" },
        { type: "move", target: "conductor", to: [-1.0, 0, 6], duration: 10 },
        { type: "sound", sound: "footsteps", at: { node: "conductor" }, volume: 0.7 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "扉がきい、と開いた。同時に、通路の奥で連結扉が開く。「……切符を、拝見します」",
          duration: 6,
        },
      ],
    },
    {
      id: "knock-auto",
      when: { type: "after", trigger: "blackout", delay: 35 },
      unless: ["knock", ...SCARES],
      actions: [
        { type: "visible", target: "conductor", visible: true },
        { type: "door", door: "gangway-n", state: "unlock" },
        { type: "door", door: "gangway-n", state: "open" },
        { type: "door", door: "room-1", state: "unlock" },
        { type: "door", door: "room-1", state: "open" },
        { type: "move", target: "conductor", to: [-1.0, 0, 6], duration: 10 },
        { type: "sound", sound: "footsteps", at: { node: "conductor" }, volume: 0.7 },
        { type: "heartbeat", bpm: 132 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "通路の奥で連結扉が開いた。「……切符を、拝見します」",
          duration: 6,
        },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "look", target: "conductor", maxAngleDeg: 20, maxDistance: 16 },
      requiresAny: ["knock", "knock-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "conductor" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "conductor" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "終点の名前",
          text: "翌朝、寝台特急は定刻に終着駅へ着いた。1号室の乗客だけが、どこにもいなかった。\n個室の枕元には、見たことのない駅名の入った切符が一枚、鋏を入れて置かれていた。",
        },
      ],
    })),
  ],
};
