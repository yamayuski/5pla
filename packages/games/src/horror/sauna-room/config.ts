import type { HorrorConfig } from "./kit/types";

/**
 * 「サウナ室」の演出データ。
 * サウナ室は x=-2.5〜2.5, z=0〜5（出入口 z=0 の sauna-door）。北にストーブ(stones)、西と北の壁に二段の板ベンチ。
 * 温度計の表示（temp-80〜temp-130）を切り替えながら、隅に立つタオル姿の女（bather）が近づく。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "sauna-room",
  title: "サウナ室",
  intro: [
    "仕事帰りに寄った、深夜営業のスパのサウナ室。",
    "砂時計を逆さにして、十二分、じっと我慢する。",
  ],
  spawn: { position: [0, 1.5, 1.2], lookAt: [0, 1.3, 4] },
  fog: { color: [0.14, 0.1, 0.08], density: 0.07 },
  ambient: { intensity: 0.12, color: [1, 0.75, 0.55] },
  flashlight: {
    enabled: false,
    intensity: 0.4,
    angleDeg: 40,
    range: 6,
    color: [1, 0.85, 0.7],
  },
  walkSpeed: 0.05,
  droneLevel: 0.07,
  triggers: [
    // ---- 0〜1分: ロウリュ ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "乾いた熱。杉の板が軋んで、汗がこめかみを伝う。ほかの客は、いない。",
        },
        { type: "objective", text: "サウナストーンに水をかける" },
      ],
    },
    {
      id: "steam",
      when: {
        type: "interact",
        target: "stones",
        label: "水をかける",
        maxDistance: 2.4,
      },
      actions: [
        { type: "sound", sound: "static", at: { node: "stones" }, volume: 0.6 },
        { type: "fog", density: 0.09, duration: 3 },
        {
          type: "subtitle",
          text: "じゅうっ、と蒸気が立ちのぼる。視界が白くなり、熱気が肌を打つ。",
          duration: 5,
        },
        { type: "objective", text: "我慢する" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "bather",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "bather", visible: true },
        { type: "visible", target: "temp-80", visible: false },
        { type: "visible", target: "temp-95", visible: true },
        { type: "sound", sound: "creak", at: [1.8, 0.6, 4.5], volume: 0.7 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "奥の隅に、バスタオルを巻いた女が立っている。壁のほうを向いたまま。入ってきた音はしなかった。",
          duration: 6,
        },
      ],
    },
    {
      id: "temp-2",
      when: { type: "time", at: 120 },
      actions: [
        { type: "visible", target: "temp-95", visible: false },
        { type: "visible", target: "temp-110", visible: true },
        { type: "sound", sound: "buzz", at: { node: "stones" }, volume: 0.4 },
        {
          type: "subtitle",
          text: "温度計が勝手に上がっていく。95度、110度。……女は、まだ壁を向いている。",
          duration: 5,
        },
      ],
    },
    {
      id: "hourglass",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "glass-a", visible: false },
        { type: "visible", target: "glass-b", visible: true },
        { type: "sound", sound: "drip", at: [-2.3, 1.4, 1.5], volume: 0.5 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "砂時計は、まだ十二分のうちの三分のはず。なのに、上の砂はもう全部落ちている。",
          duration: 5,
        },
      ],
    },
    {
      id: "breath",
      when: { type: "time", at: 185 },
      actions: [
        { type: "sound", sound: "breath", at: [1.8, 1.2, 4.5], volume: 0.8 },
        {
          type: "subtitle",
          text: "女の肩が、ゆっくり上下している。……呼吸の音が、自分のものと重ならない。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 出口が閉じる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "sauna-door", state: "slam" },
        { type: "door", door: "sauna-door", state: "lock" },
        { type: "visible", target: "temp-110", visible: false },
        { type: "visible", target: "temp-130", visible: true },
        { type: "lights", group: "sauna", on: false },
        { type: "fog", density: 0.12, duration: 4 },
        { type: "flicker", duration: 1.2 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "ガラス戸が閉まり、取っ手が回らない。温度計は130度。灯りが落ち、ストーブの赤だけが残る。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "turn",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "face", target: "bather" },
        { type: "move", target: "bather", to: [0.6, 0, 3], duration: 14 },
        { type: "sound", sound: "creak", at: { node: "bather" }, volume: 1 },
        {
          type: "subtitle",
          text: "女が、ゆっくりこちらを向いた。濡れた髪の間から、湯気の中を近づいてくる。",
          duration: 5,
        },
      ],
    },
    // ---- 4〜5分: 湯気の中 ----
    {
      id: "near",
      when: { type: "after", trigger: "turn", delay: 12 },
      unless: SCARES,
      actions: [
        { type: "sound", sound: "whisper", at: { node: "bather" }, volume: 1 },
        { type: "heartbeat", bpm: 135 },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "look", target: "bather", maxAngleDeg: 28, maxDistance: 6 },
      requires: ["near"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "bather" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "near", delay: 6 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "bather" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "bather" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "サウナ室",
          text: "翌朝、清掃員がサウナ室の扉を開けると、ベンチに、乾ききった女物のバスタオルが一枚だけ畳まれていた。\n\n温度計は百三十度を指したまま、前の晩から、一度も下がっていなかったという。",
        },
      ],
    })),
  ],
};
