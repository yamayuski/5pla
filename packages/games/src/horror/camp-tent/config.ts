import type { HorrorConfig } from "./kit/types";

/**
 * 「消えた焚き火」の演出データ。
 * キャンプサイトは x=-11〜11, z=-9〜12（中央の焚き火が原点）。自分のテントは西 (-6, 2)、
 * 北へ伸びる小道（x=±2.5）を z=29.5 まで進むとトイレ棟（z=29.5〜35.5）。
 */
const SCARES = ["scare", "scare-late", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "camp-tent",
  title: "消えた焚き火",
  intro: [
    "山あいのキャンプ場、深夜零時。",
    "みんながトイレに行ったきり、二十分が経つ。",
  ],
  spawn: { position: [3, 1.6, 3.5], lookAt: [0, 1.0, 0] },
  fog: { color: [0.012, 0.016, 0.02], density: 0.05 },
  ambient: { intensity: 0.06, color: [0.55, 0.65, 0.9] },
  flashlight: {
    enabled: true,
    intensity: 1.4,
    angleDeg: 40,
    range: 22,
    color: [1, 0.96, 0.88],
  },
  walkSpeed: 0.1,
  droneLevel: 0.08,
  triggers: [
    // ---- 0〜1分: 焚き火のそば ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "焚き火が小さくなってきた。……みんな、遅いな。",
        },
        { type: "objective", text: "焚き火に薪を足す" },
      ],
    },
    {
      id: "add-wood",
      when: {
        type: "interact",
        target: "logs",
        label: "薪をくべる",
        maxDistance: 3,
      },
      actions: [
        { type: "custom", name: "fireUp" },
        { type: "sound", sound: "thud", at: { node: "logs" }, volume: 0.5 },
        { type: "subtitle", text: "火が、ぱちりと爆ぜた。" },
        { type: "objective", text: "トイレ棟へ迎えに行く（北の小道）" },
      ],
    },
    {
      id: "wood-auto",
      when: { type: "time", at: 50 },
      unless: ["add-wood"],
      actions: [
        { type: "objective", text: "トイレ棟へ迎えに行く（北の小道）" },
        { type: "subtitle", text: "……迎えに行こう。" },
      ],
    },
    // ---- 1〜3分: 暗い小道とトイレ棟 ----
    {
      id: "owl",
      when: { type: "zone", center: [0, 1.6, 14], radius: 2.5 },
      actions: [
        { type: "sound", sound: "creak", at: [-9, 3, 16], volume: 0.4 },
        { type: "subtitle", text: "森のどこかで、枝の折れる音。", duration: 3 },
      ],
    },
    {
      id: "call",
      when: { type: "zone", center: [0, 1.6, 20], radius: 2.5 },
      actions: [
        { type: "sound", sound: "whisper", at: [-8, 1.6, 22], volume: 0.9 },
        {
          type: "subtitle",
          text: "木々の奥から、友達の声。『……おーい』",
          duration: 4,
        },
        { type: "heartbeat", bpm: 64 },
      ],
    },
    {
      id: "steps",
      when: { type: "zone", center: [0, 1.6, 26], radius: 2.2 },
      actions: [
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.8 },
        { type: "flicker", duration: 0.8 },
        { type: "drone", level: 0.25 },
        {
          type: "subtitle",
          text: "背後の砂利を、ゆっくり踏む音。",
          duration: 3,
        },
      ],
    },
    {
      id: "bath-in",
      when: { type: "zone", center: [0, 1.6, 31], radius: 2 },
      actions: [
        { type: "sound", sound: "knock", at: { node: "stall-3" }, volume: 1 },
        {
          type: "subtitle",
          text: "一番奥の個室から、ノックが三回。",
          duration: 4,
        },
        { type: "objective", text: "個室を確認する" },
      ],
    },
    {
      id: "friend-lamp",
      when: {
        type: "interact",
        target: "friend-lamp",
        label: "ランタンを見る",
        maxDistance: 2.6,
      },
      actions: [
        {
          type: "subtitle",
          text: "友達のランタン。まだ温かい。……持ち主は、どこにもいない。",
          duration: 4.5,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められ、帰り道は人影だらけ ----
    {
      id: "bath-trap",
      when: { type: "after", trigger: "bath-in", delay: 12 },
      actions: [
        { type: "door", door: "bath-door", state: "slam" },
        { type: "lights", group: "bath", on: false },
        { type: "flicker", duration: 1.5 },
        { type: "drone", level: 0.6 },
        { type: "heartbeat", bpm: 94 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "入口のドアが勝手に閉まった。明かりが消える。",
          duration: 4,
        },
      ],
    },
    {
      id: "stall-open",
      when: { type: "after", trigger: "bath-trap", delay: 6 },
      actions: [
        { type: "door", door: "stall-3", state: "unlock" },
        { type: "door", door: "stall-3", state: "open" },
        {
          type: "sound",
          sound: "breath",
          at: { node: "stall-3" },
          volume: 0.9,
        },
        {
          type: "subtitle",
          text: "奥の個室の扉が、ゆっくり開いていく。……中は、空っぽ。",
          duration: 4.5,
        },
      ],
    },
    {
      id: "bath-unlock",
      when: { type: "after", trigger: "stall-open", delay: 9 },
      actions: [
        { type: "door", door: "bath-door", state: "unlock" },
        {
          type: "sound",
          sound: "rattle",
          at: { node: "bath-door" },
          volume: 0.8,
        },
        { type: "objective", text: "キャンプサイトへ戻る" },
        { type: "subtitle", text: "入口の鍵が、かちりと外れた。", duration: 3 },
      ],
    },
    {
      id: "camp-out",
      when: { type: "zone", center: [0, 1.6, 12], radius: 2.5 },
      requires: ["bath-unlock"],
      actions: [
        { type: "custom", name: "fireOut" },
        { type: "visible", target: "shadows", visible: true },
        { type: "sound", sound: "whisper", at: [0, 1.5, 4], volume: 0.7 },
        {
          type: "subtitle",
          text: "焚き火が消えている。テントの中に、人影。……みんな、戻ってたのか？",
          duration: 5.5,
        },
        { type: "objective", text: "自分のテントへ（西）" },
        { type: "heartbeat", bpm: 90 },
      ],
    },
    {
      id: "shadows-turn",
      when: { type: "zone", center: [-1.5, 1.6, 3], radius: 3 },
      requires: ["camp-out"],
      actions: [
        { type: "sound", sound: "footsteps", at: [4, 0, 0], volume: 0.7 },
        {
          type: "subtitle",
          text: "どの人影も、こっちを向いている。……ぜんぶ、同じ角度で。",
          duration: 4.5,
        },
        { type: "drone", level: 0.7 },
        { type: "heartbeat", bpm: 108 },
      ],
    },
    // ---- 4〜5分: 自分のテント ----
    {
      id: "enter-tent",
      when: { type: "zone", center: [-6, 1.6, 2], radius: 1.1 },
      requires: ["camp-out"],
      actions: [
        { type: "door", door: "flap", state: "slam" },
        { type: "visible", target: "shadows", visible: false },
        { type: "sound", sound: "rattle", at: { node: "flap" }, volume: 0.9 },
        {
          type: "subtitle",
          text: "背後で、テントのチャックが下ろされる音。",
          duration: 4,
        },
        { type: "objective", text: "" },
        { type: "drone", level: 0.9 },
      ],
    },
    {
      id: "wall-shadow-show",
      when: { type: "after", trigger: "enter-tent", delay: 3 },
      actions: [
        { type: "flicker", duration: 1.2 },
        { type: "visible", target: "wall-shadow", visible: true },
        {
          type: "sound",
          sound: "whisper",
          at: { node: "wall-shadow" },
          volume: 1,
        },
        {
          type: "subtitle",
          text: "テントの壁に、人影。……外に、誰かが立っている。",
          duration: 4.5,
        },
        { type: "heartbeat", bpm: 132 },
      ],
    },
    {
      id: "scare",
      when: {
        type: "look",
        target: "wall-shadow",
        maxAngleDeg: 35,
        maxDistance: 5,
      },
      requires: ["wall-shadow-show"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "wall-shadow", visible: false },
        { type: "jumpscare", figure: "ranger" },
      ],
    },
    {
      id: "scare-late",
      when: { type: "after", trigger: "wall-shadow-show", delay: 12 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ranger" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "ranger" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "消えた焚き火",
          text: "翌朝、キャンプ場のテントはどれも無人で、焚き火は冷え切っていた。\n管理人は言った。「ここは十年前に閉鎖しましたよ。誰が、入れたんです？」\n\n自分のテントの内側には、人の形に、湿った跡が残っていた。",
        },
      ],
    })),
  ],
};
