import type { HorrorConfig } from "./kit/types";

/** 「百物語」: 古い家屋の長い廊下。突き当たりのおりんを鳴らすと…。 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "hyakumonogatari",
  title: "百物語",
  intro: [
    "親戚の古い家で、百物語の会。最後の一話を終えたら、仏間のおりんを鳴らす決まりだ。",
    "廊下の突き当たりまで、一人で行かされた。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.6, 30] },
  fog: { color: [0.04, 0.03, 0.025], density: 0.04 },
  ambient: { intensity: 0.05, color: [1, 0.9, 0.8] },
  flashlight: {
    enabled: true,
    intensity: 0.7,
    angleDeg: 40,
    range: 13,
    color: [1, 0.95, 0.85],
  },
  walkSpeed: 0.09,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "軋む床板。障子越しの行灯が、廊下をぼんやり照らしている。",
        },
        { type: "objective", text: "突き当たりの仏壇のおりんを鳴らす" },
      ],
    },
    {
      id: "rin",
      when: {
        type: "interact",
        target: "rin",
        label: "おりんを鳴らす",
        maxDistance: 2,
      },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "bell", at: { node: "rin" }, volume: 0.8 },
        { type: "lights", group: "candle", on: false },
        { type: "flashlight", state: "off" },
        {
          type: "subtitle",
          text: "ちーん。蝋燭が、ふっと消えた。",
          duration: 3,
        },
      ],
    },
    {
      id: "shadow-1",
      when: { type: "time", at: 65 },
      actions: [
        { type: "visible", target: "shadow-0", visible: true },
        { type: "sound", sound: "whisper", at: [1.5, 1.4, 9], volume: 0.5 },
        {
          type: "subtitle",
          text: "障子に、人影。誰かが、庭に立っている。",
          duration: 4,
        },
      ],
    },
    {
      id: "shadow-2",
      when: { type: "time", at: 110 },
      actions: [
        { type: "visible", target: "shadow-1", visible: true },
        { type: "sound", sound: "giggle", at: "behind", volume: 0.5 },
        {
          type: "subtitle",
          text: "影が増えた。さっきの影は、さっきと同じ場所に動かない。",
          duration: 5,
        },
        { type: "heartbeat", bpm: 80 },
      ],
    },
    {
      id: "lamp-out",
      when: { type: "time", at: 150 },
      actions: [
        { type: "lights", group: "lamp-a", on: false },
        { type: "visible", target: "shadow-2", visible: true },
        { type: "sound", sound: "thud", at: [1.5, 1, 15], volume: 0.6 },
        { type: "drone", level: 0.2 },
        { type: "subtitle", text: "手前の行灯が消えた。", duration: 3 },
      ],
    },
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "visible", target: "back-wall", visible: true },
        { type: "sound", sound: "slam", at: [0, 1.2, 4], volume: 1 },
        { type: "shake", intensity: 0.04, duration: 1.5 },
        { type: "lights", group: "lamp-b", on: false },
        { type: "visible", target: "shadow-3", visible: true },
        { type: "fog", density: 0.07, duration: 4 },
        { type: "drone", level: 0.4 },
        { type: "heartbeat", bpm: 104 },
        {
          type: "subtitle",
          text: "背後で襖がぴしゃりと閉まった。開かない。",
          duration: 4,
        },
      ],
    },
    {
      id: "dim",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "lamp-c", on: false },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        {
          type: "subtitle",
          text: "軋む床板。背後から、ゆっくり近づいてくる。",
          duration: 4,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "after", trigger: "rin", delay: 3 },
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "lock", delay: 75 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ghost" }],
    },
    ...[...SCARES, "scare-fallback"].map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "百物語",
          text: "百本目の蝋燭が消えると、本物が来る。\n数えていたのは、九十九本。\n\n翌朝、廊下には、百人目の足跡だけが残っていた。",
        },
      ],
    })),
  ],
};
