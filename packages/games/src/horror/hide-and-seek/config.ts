import type { HorrorConfig } from "./kit/types";

/**
 * 「もういいかい」の演出データ。
 * 古い日本家屋。廊下は x=-1〜1, z=-0.5〜15。寝室は廊下の西（z=0〜3.6）、
 * 仏間は東（z=5〜8.6）、廊下の突き当たり（z=15）がトイレ。
 */
const SCARES = ["scare", "scare-late", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "hide-and-seek",
  title: "もういいかい",
  intro: [
    "法事の前の晩、田舎の祖母の家に一人で泊まることになった。",
    "夜中に、目が覚めた。",
  ],
  spawn: { position: [-2.4, 1.5, 1.2], lookAt: [0, 1.4, 1.8] },
  fog: { color: [0.01, 0.008, 0.006], density: 0.05 },
  ambient: { intensity: 0.04, color: [0.9, 0.8, 0.7] },
  flashlight: {
    enabled: false,
    intensity: 1.4,
    angleDeg: 40,
    range: 12,
    color: [1, 0.92, 0.75],
  },
  walkSpeed: 0.075,
  droneLevel: 0.08,
  triggers: [
    // ---- 0〜1分: 夜中のトイレ ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "sound", sound: "drip", at: [0, 1, 15], volume: 0.4 },
        { type: "subtitle", text: "……トイレ、行っとこう。" },
        { type: "objective", text: "廊下の奥のトイレへ" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "bell",
      when: { type: "zone", center: [0, 1.5, 6.8], radius: 1.2 },
      actions: [
        {
          type: "sound",
          sound: "bell",
          at: { node: "butsu-bell" },
          volume: 0.8,
        },
        { type: "subtitle", text: "仏壇の鈴（りん）が、ひとりでに鳴った。" },
        { type: "drone", level: 0.25 },
      ],
    },
    {
      id: "doll-seen",
      when: { type: "look", target: "doll", maxAngleDeg: 14, maxDistance: 6 },
      requires: ["bell"],
      actions: [],
    },
    {
      id: "doll-turn",
      when: { type: "lookAway", target: "doll", minAngleDeg: 80 },
      requires: ["doll-seen"],
      actions: [
        { type: "face", target: "doll" },
        { type: "sound", sound: "creak", at: { node: "doll" }, volume: 0.25 },
      ],
    },
    {
      id: "doll-noticed",
      when: { type: "look", target: "doll", maxAngleDeg: 14, maxDistance: 8 },
      requires: ["doll-turn"],
      actions: [
        { type: "subtitle", text: "……あの人形、さっきは横を向いていた。" },
        { type: "heartbeat", bpm: 64 },
      ],
    },
    {
      id: "toilet",
      when: { type: "interact", target: "toilet", label: "開ける" },
      actions: [
        { type: "sound", sound: "knock", at: { node: "toilet" }, volume: 1 },
        {
          type: "subtitle",
          text: "内側から、ノックが三回。……誰か、入ってる？",
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "toilet-hint",
      when: { type: "time", at: 120 },
      unless: ["toilet"],
      actions: [
        { type: "sound", sound: "knock", at: { node: "toilet" }, volume: 1 },
      ],
    },
    {
      id: "giggle",
      when: { type: "after", trigger: "toilet", delay: 3 },
      actions: [
        { type: "sound", sound: "giggle", at: "behind", volume: 0.8 },
        { type: "subtitle", text: "くすくす、と。子どもの笑い声。" },
      ],
    },
    {
      id: "ceiling-run",
      when: { type: "after", trigger: "giggle", delay: 3 },
      actions: [
        { type: "sound", sound: "footsteps", at: [0, 2.6, 7], volume: 1 },
        { type: "flicker", duration: 1.2 },
        { type: "objective", text: "寝室に戻る" },
      ],
    },
    {
      id: "hall-off",
      when: { type: "after", trigger: "ceiling-run", delay: 2.5 },
      actions: [
        { type: "lights", group: "hall", on: false },
        { type: "sound", sound: "footsteps", at: [-1.8, 2.6, 2], volume: 0.8 },
        { type: "drone", level: 0.45 },
      ],
    },
    // ---- 3〜4分: 寝室に閉じ込められる ----
    {
      id: "trapped",
      when: { type: "zone", center: [-3, 1.5, 1.8], radius: 1.3 },
      requires: ["hall-off"],
      actions: [
        {
          type: "move",
          target: "fusuma-a",
          to: [-1, 0.9, 1.35],
          duration: 0.2,
        },
        {
          type: "move",
          target: "fusuma-b",
          to: [-1, 0.9, 2.25],
          duration: 0.2,
        },
        { type: "sound", sound: "slam", at: [-1, 1, 1.8], volume: 1 },
        { type: "lights", group: "bedroom", on: false },
        { type: "lights", group: "butsu", on: false },
        {
          type: "subtitle",
          text: "ふすまが、ぴしゃりと閉まった。……真っ暗だ。",
        },
        { type: "objective", text: "箪笥（たんす）から懐中電灯を探す" },
        { type: "heartbeat", bpm: 90 },
      ],
    },
    {
      id: "fusuma-stuck",
      when: { type: "interact", target: "fusuma-a", label: "開ける" },
      requires: ["trapped"],
      once: false,
      actions: [
        { type: "sound", sound: "rattle", at: [-1, 1, 1.8], volume: 0.8 },
        {
          type: "subtitle",
          text: "びくともしない。向こうから押さえられている。",
          duration: 2.5,
        },
      ],
    },
    {
      id: "tansu",
      when: { type: "interact", target: "tansu", label: "引き出しを開ける" },
      requires: ["trapped"],
      actions: [
        { type: "flashlight", state: "on" },
        { type: "sound", sound: "drip", at: "player", volume: 0.4 },
        { type: "subtitle", text: "祖母の懐中電灯だ。……点いた。" },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "tansu-timeout",
      when: { type: "after", trigger: "trapped", delay: 30 },
      unless: ["tansu"],
      actions: [
        { type: "flashlight", state: "dim" },
        { type: "subtitle", text: "（ポケットの携帯のライトを点けた）" },
      ],
    },
    {
      id: "counting",
      when: { type: "time", at: 0 },
      requiresAny: ["tansu", "tansu-timeout"],
      actions: [
        {
          type: "sound",
          sound: "whisper",
          at: { node: "oshiire-a" },
          volume: 1,
        },
        {
          type: "subtitle",
          text: "押入れの中から、数をかぞえる声。『……ろく……しち……はち……』",
          duration: 5,
        },
      ],
    },
    {
      id: "mouiikai",
      when: { type: "after", trigger: "counting", delay: 7 },
      actions: [
        {
          type: "sound",
          sound: "knock",
          at: { node: "oshiire-a" },
          volume: 0.9,
        },
        { type: "subtitle", text: "『――もう、いいかい』", duration: 4 },
        { type: "objective", text: "押入れを開ける" },
        { type: "drone", level: 0.7 },
        { type: "heartbeat", bpm: 105 },
      ],
    },
    {
      id: "oshiire",
      when: { type: "interact", target: "oshiire-a", label: "開ける" },
      requires: ["mouiikai"],
      actions: [
        {
          type: "move",
          target: "oshiire-a",
          to: [-4.16, 0.9, 2.3],
          duration: 1.2,
        },
        {
          type: "sound",
          sound: "creak",
          at: { node: "oshiire-a" },
          volume: 0.6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "oshiire-self",
      when: { type: "after", trigger: "mouiikai", delay: 20 },
      unless: ["oshiire"],
      actions: [
        {
          type: "move",
          target: "oshiire-a",
          to: [-4.16, 0.9, 2.3],
          duration: 3,
        },
        {
          type: "sound",
          sound: "creak",
          at: { node: "oshiire-a" },
          volume: 0.8,
        },
        {
          type: "subtitle",
          text: "押入れのふすまが、ひとりでに、開いていく。",
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "empty",
      when: { type: "time", at: 0 },
      requiresAny: ["oshiire-open", "oshiire-self-open"],
      actions: [
        { type: "subtitle", text: "……誰も、いない。", duration: 3 },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 0 },
      ],
    },
    {
      id: "oshiire-open",
      when: { type: "after", trigger: "oshiire", delay: 2 },
      actions: [],
    },
    {
      id: "oshiire-self-open",
      when: { type: "after", trigger: "oshiire-self", delay: 3.5 },
      actions: [],
    },
    {
      id: "mitsuketa",
      when: { type: "after", trigger: "empty", delay: 3.5 },
      actions: [
        { type: "sound", sound: "giggle", at: "behind", volume: 1 },
        { type: "subtitle", text: "『みいつけた』", duration: 3 },
      ],
    },
    // ---- 最後の一発 ----
    {
      id: "scare",
      when: {
        type: "look",
        target: "fusuma-b",
        maxAngleDeg: 45,
        maxDistance: 8,
      },
      requires: ["mitsuketa"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "child" }],
    },
    {
      id: "scare-late",
      when: { type: "after", trigger: "mitsuketa", delay: 7 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "child" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "child" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "もういいかい",
          text: "翌朝、押入れの奥の壁板の裏から、古いおはじきと、\n子どもの字で「みつけた」と書かれた紙が出てきた。\n\n祖母はそれを見て、何も言わずに仏壇に供えた。",
        },
      ],
    })),
  ],
};
