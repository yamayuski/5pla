import type { HorrorConfig } from "./kit/types";

/**
 * 「終点まで」の演出データ。
 * 夜行バスの車内は x=-1.5〜1.5, z=0〜15（後方 z=0、運転席 z≈13.6）。座席は左右5列（z=3,5,7,9,11）。
 * 乗客の頭に白い「顔」が後ろ向きに現れる（faces-l / faces-r）。最後は運転席へ近づくと、運転手が振り向く。
 */
const SCARES = ["scare-driver", "scare-auto", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "night-bus",
  title: "終点まで",
  intro: [
    "東京行きの夜行バス。出発して二時間、車内は寝息だけが聞こえる。",
    "ふと目が覚めた。あとどれくらいで着くのだろう。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.4, 10] },
  fog: { color: [0.02, 0.025, 0.04], density: 0.02 },
  ambient: { intensity: 0.07, color: [0.7, 0.8, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.5,
    angleDeg: 38,
    range: 10,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.07,
  droneLevel: 0.1,
  triggers: [
    // ---- 0〜1分: 寝静まった車内 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "エンジンの低い振動。カーテン越しに、ときおりオレンジの街灯が流れていく。",
        },
        {
          type: "objective",
          text: "運転席の近くまで行って、到着時刻を確かめる",
        },
      ],
    },
    {
      id: "announce-1",
      when: { type: "time", at: 40 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 2.2, 7], volume: 0.6 },
        {
          type: "subtitle",
          text: "「まもなく終点です」……出発してまだ二時間のはずなのに。",
          duration: 5,
        },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "faces-l",
      when: { type: "time", at: 75 },
      actions: [
        { type: "visible", target: "faces-l", visible: true },
        { type: "sound", sound: "creak", at: [-1, 1.4, 7], volume: 0.7 },
        { type: "heartbeat", bpm: 74 },
        {
          type: "subtitle",
          text: "左側の乗客の頭が、こちらを向いている。白い顔が、後ろ向きに付いている。",
          duration: 6,
        },
      ],
    },
    {
      id: "faces-r",
      when: { type: "time", at: 130 },
      actions: [
        { type: "visible", target: "faces-r", visible: true },
        { type: "sound", sound: "creak", at: [1, 1.4, 9], volume: 0.7 },
        {
          type: "subtitle",
          text: "右側も。全員、同じ顔で、同じ方向を見ている。……自分のほうを。",
          duration: 5,
        },
      ],
    },
    {
      id: "stop",
      when: { type: "time", at: 170 },
      actions: [
        { type: "sound", sound: "rumble", at: "player", volume: 0.7 },
        { type: "shake", intensity: 0.03, duration: 1.2 },
        { type: "lights", group: "outside", on: true },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "バスが急停止した。窓の外に、名前の読めないバス停が一本。誰も降りない。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 灯りと出口 ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "bus-door", state: "slam" },
        { type: "door", door: "bus-door", state: "lock" },
        { type: "lights", group: "outside", on: false },
        { type: "lights", group: "bus-a", on: false },
        { type: "flicker", duration: 1.2 },
        { type: "sound", sound: "slam", at: [0, 1, 3], volume: 0.9 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "乗降口の扉が閉まり、バスが再び走りだした。後ろの灯りが消えていく。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "lights-2",
      when: { type: "after", trigger: "lock", delay: 14 },
      actions: [
        { type: "lights", group: "bus-b", on: false },
        { type: "flashlight", state: "dim" },
        { type: "sound", sound: "whisper", at: "behind", volume: 0.8 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "「終点です。終点です。終点です」……運転手の声が、車内に何度も繰り返される。",
          duration: 6,
        },
        { type: "objective", text: "運転手に、次のバス停を聞く" },
      ],
    },
    // ---- 4〜5分: 運転席 ----
    {
      id: "driver-turn",
      when: { type: "zone", center: [0, 1.6, 11.6], radius: 2 },
      requires: ["lights-2"],
      unless: SCARES,
      actions: [
        { type: "face", target: "driver" },
        { type: "sound", sound: "creak", at: { node: "driver" }, volume: 1 },
        { type: "heartbeat", bpm: 140 },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "scare-driver",
      when: { type: "after", trigger: "driver-turn", delay: 1.4 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "driver" }],
    },
    {
      id: "driver-turn-auto",
      when: { type: "after", trigger: "lights-2", delay: 55 },
      unless: ["driver-turn", ...SCARES],
      actions: [
        { type: "face", target: "driver" },
        { type: "sound", sound: "creak", at: { node: "driver" }, volume: 1 },
        { type: "heartbeat", bpm: 140 },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "scare-auto",
      when: { type: "after", trigger: "driver-turn-auto", delay: 1.4 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "driver" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "driver" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "終点まで",
          text: "翌朝、東京行きの夜行バスは終点に着いたが、降りてきた乗客は一人もいなかった。\n運転手は「ずっと満席だった」と繰り返すばかりだったという。\n\n座席には、人の形に湿ったシートだけが残っていた。",
        },
      ],
    })),
  ],
};
