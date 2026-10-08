import type { HorrorConfig } from "./kit/types";

/**
 * 「点検廊」の演出データ。
 * ダム堤体内の点検廊は x=-1.5〜1.5, z=0〜40（入口 z=0 の entry-hatch、奥 z=40 に鋼鉄の扉）。
 * 水位計 gauge-0〜2（z=10, 22, 34）を読んで回る。床の浸水（水面）が時間とともに上がり、最後に水の中から女が立ち上がる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "dam-gallery",
  title: "点検廊",
  intro: [
    "ダムの管理事務所の夜間当直。堤体内の点検廊を歩いて、水位計を三か所読んで回る。",
    "水の滴る音が、コンクリートの壁に反響している。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.5, 30] },
  fog: { color: [0.03, 0.04, 0.05], density: 0.022 },
  ambient: { intensity: 0.08, color: [0.75, 0.85, 1] },
  flashlight: {
    enabled: true,
    intensity: 0.7,
    angleDeg: 38,
    range: 15,
    color: [0.95, 0.98, 1],
  },
  walkSpeed: 0.075,
  droneLevel: 0.07,
  triggers: [
    // ---- 0〜1分: 水位計を読む ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "湿ったコンクリートの匂い。籠付きの電球が、点々と廊下を照らしている。",
        },
        { type: "objective", text: "水位計を読んで回る（1/3）" },
      ],
    },
    {
      id: "gauge-0",
      when: {
        type: "interact",
        target: "gauge-0",
        label: "水位計を読む",
        maxDistance: 2.4,
      },
      actions: [
        { type: "sound", sound: "chime", at: { node: "gauge-0" }, volume: 0.3 },
        {
          type: "subtitle",
          text: "一つ目の水位計。異常なし、0.0m。",
          duration: 4,
        },
        { type: "objective", text: "水位計を読んで回る（2/3）" },
      ],
    },
    {
      id: "gauge-1",
      when: {
        type: "interact",
        target: "gauge-1",
        label: "水位計を読む",
        maxDistance: 2.4,
      },
      requires: ["gauge-0"],
      actions: [
        { type: "sound", sound: "chime", at: { node: "gauge-1" }, volume: 0.3 },
        {
          type: "subtitle",
          text: "二つ目の水位計。0.2m……堤体の中に、水位があるはずがない。",
          duration: 5,
        },
        { type: "objective", text: "水位計を読んで回る（3/3）" },
      ],
    },
    // ---- 1〜3分: 浸水が始まる ----
    {
      id: "flood-on",
      when: { type: "time", at: 70 },
      actions: [
        { type: "custom", name: "floodOn" },
        { type: "sound", sound: "rumble", at: [0, 0, 20], volume: 0.7 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "どこかでポンプが唸りだした。足元の床に、黒い水が染み出してくる。",
          duration: 5,
        },
      ],
    },
    {
      id: "pipe",
      when: { type: "time", at: 115 },
      actions: [
        { type: "sound", sound: "knock", at: [-1.4, 1.2, 24], volume: 0.9 },
        { type: "sound", sound: "knock", at: [1.4, 1.2, 28], volume: 0.9 },
        {
          type: "subtitle",
          text: "壁の配管を、内側から叩く音。コン、コン。一定のリズムで、こちらへ移動してくる。",
          duration: 5,
        },
      ],
    },
    {
      id: "gauge-sign",
      when: { type: "time", at: 155 },
      actions: [
        { type: "visible", target: "gauge-a", visible: false },
        { type: "visible", target: "gauge-b", visible: true },
        { type: "sound", sound: "whisper", at: [0, 1.4, 30], volume: 0.6 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "先に読んだ水位計の表示が書き換わっている。「0.7m　あなたの　くび」",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 退路が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "entry-hatch", state: "slam" },
        { type: "door", door: "entry-hatch", state: "lock" },
        { type: "custom", name: "floodFast" },
        { type: "lights", group: "gal-a", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "fog", density: 0.04, duration: 4 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口の水密扉が閉まった。水かさが一気に増す。手前の電球から順に、落ちていく。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "lights-2",
      when: { type: "after", trigger: "lock", delay: 14 },
      actions: [
        { type: "lights", group: "gal-b", on: false },
        { type: "visible", target: "drowned", visible: true },
        { type: "move", target: "drowned", to: [0, 0, 34], duration: 4 },
        { type: "sound", sound: "whisper", at: [0, 0.6, 32], volume: 0.9 },
        {
          type: "subtitle",
          text: "廊下の奥で、水面が盛り上がった。長い髪の女が、水の中から立ち上がり、こちらへ歩いてくる。",
          duration: 6,
        },
      ],
    },
    {
      id: "drown-walk",
      when: { type: "after", trigger: "lights-2", delay: 5 },
      actions: [
        { type: "move", target: "drowned", to: [0, 0, 22], duration: 16 },
        { type: "sound", sound: "footsteps", at: [0, 0, 30], volume: 0.8 },
      ],
    },
    // ---- 4〜5分: 水の中から ----
    {
      id: "near",
      when: { type: "after", trigger: "lights-2", delay: 22 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "breath", at: "behind", volume: 0.9 },
        { type: "heartbeat", bpm: 135 },
      ],
    },
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "drowned",
        maxAngleDeg: 26,
        maxDistance: 16,
      },
      requires: ["near"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "drowned" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "near", delay: 8 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "drowned" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "drowned" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "点検廊",
          text: "翌朝、点検廊の床は乾ききっていたが、水位計の針だけが「0.7m」を指したまま、どうしても戻らなかった。\n\nダムの湛水前の工事で亡くなった作業員の名簿の最後に、昨夜の当直員の名前が追記されていた。",
        },
      ],
    })),
  ],
};
