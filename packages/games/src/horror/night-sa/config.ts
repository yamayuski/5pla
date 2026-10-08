import type { HorrorConfig } from "./kit/types";

/**
 * 「使用中」の演出データ。
 * 休憩棟 x=-6〜6, z=0〜10。南の自動ドアの外が駐車場、手前が自販機コーナー、z=4 の壁の奥がトイレ。
 * 一番西の個室（stall-0, x=-4.5）だけがずっと「使用中」。
 * 最後は「だるまさんがころんだ」：女は、目を離すたびに一歩ずつ近づく（look → lookAway の連鎖）。
 */
const SCARES = ["scare-hit", "scare-blink", "scare-timeout"];
const STEPS: [number, number, number][] = [
  [-4.5, 0, 7.4],
  [-2.6, 0, 6.2],
  [-0.6, 0, 5.2],
];

export const config: HorrorConfig = {
  slug: "night-sa",
  title: "使用中",
  intro: [
    "深夜三時、高速の小さなサービスエリア。駐車場には自分の車しかない。",
    "コーヒーを買って、トイレを済ませたら、また走ろう。",
  ],
  spawn: { position: [0, 1.6, 1.2], lookAt: [-4, 1.4, 2] },
  fog: { color: [0.04, 0.04, 0.05], density: 0.025 },
  ambient: { intensity: 0.12, color: [0.85, 0.9, 1] },
  flashlight: {
    enabled: false,
    intensity: 0.7,
    angleDeg: 40,
    range: 10,
    color: [0.95, 0.97, 1],
  },
  walkSpeed: 0.075,
  droneLevel: 0.03,
  triggers: [
    // ---- 0〜1分: いつもの休憩 ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "自販機のモーター音と、遠くを走るトラックの音。",
        },
        { type: "objective", text: "自販機でコーヒーを買う" },
      ],
    },
    {
      id: "coffee",
      when: {
        type: "interact",
        target: "vending-slot",
        label: "コーヒーを買う",
        maxDistance: 2.2,
      },
      actions: [
        { type: "sound", sound: "thud", at: { node: "vending-slot" } },
        {
          type: "sound",
          sound: "thud",
          at: { node: "vending-slot" },
          volume: 0.8,
        },
        {
          type: "subtitle",
          text: "ガコン、ガコン。……一本しか買っていないのに、缶が二本出てきた。",
          duration: 5,
        },
        { type: "objective", text: "トイレを済ませる" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "occupied",
      when: { type: "zone", center: [-2.5, 1.6, 7], radius: 3 },
      actions: [
        { type: "sound", sound: "knock", at: [-4.5, 1.2, 9], volume: 0.7 },
        {
          type: "subtitle",
          text: "一番奥の個室だけ「使用中」。コン、コン、と内側からノックされた。",
          duration: 5,
        },
      ],
    },
    {
      id: "dryer",
      when: { type: "time", at: 95 },
      actions: [
        { type: "sound", sound: "static", at: [5.8, 1.2, 8.6], volume: 0.8 },
        { type: "sound", sound: "buzz", at: [5.8, 1.2, 8.6], volume: 0.5 },
        {
          type: "subtitle",
          text: "誰も手をかざしていないハンドドライヤーが、唸りを上げた。",
          duration: 4,
        },
        { type: "heartbeat", bpm: 78 },
      ],
    },
    {
      id: "announce",
      when: { type: "time", at: 135 },
      actions: [
        { type: "sound", sound: "chime", at: [0, 2.6, 4], volume: 0.9 },
        {
          type: "subtitle",
          text: "「……お客様にお知らせします。お手洗いの一番奥で、どなたかがお待ちです」誰もいない館内に放送が流れた。",
          duration: 5,
        },
      ],
    },
    {
      id: "car-light",
      when: { type: "time", at: 168 },
      actions: [
        { type: "lights", group: "parking", on: false },
        { type: "sound", sound: "thud", at: [-4, 1, -6], volume: 0.6 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "駐車場の照明が消えた。外は真っ暗で、自分の車ももう見えない。",
          duration: 4,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "auto-door", state: "slam" },
        { type: "door", door: "auto-door", state: "lock" },
        { type: "lights", group: "lobby", on: false },
        { type: "lights", group: "vending", on: false },
        { type: "flicker", duration: 1.2 },
        { type: "drone", level: 0.4 },
        { type: "heartbeat", bpm: 96 },
        {
          type: "subtitle",
          text: "自動ドアが閉まった。前に立っても、もう開かない。",
          duration: 4,
        },
      ],
    },
    {
      id: "stall-open",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "door", door: "stall-0", state: "unlock" },
        { type: "door", door: "stall-0", state: "open" },
        { type: "visible", target: "woman", visible: true },
        {
          type: "subtitle",
          text: "一番奥の個室の鍵が、カチャリと外れた。",
          duration: 4,
        },
        { type: "objective", text: "目を離すな" },
      ],
    },
    // ---- 4〜5分: だるまさんがころんだ ----
    ...STEPS.flatMap((to, i) => {
      const prev = i === 0 ? "stall-open" : `away-${i - 1}`;
      return [
        {
          id: `seen-${i}`,
          when: {
            type: "look" as const,
            target: "woman",
            maxAngleDeg: 18,
            maxDistance: 20,
          },
          requires: [prev],
          unless: SCARES,
          actions: [
            { type: "heartbeat" as const, bpm: 110 + i * 15 },
            ...(i === 0
              ? [
                  {
                    type: "subtitle" as const,
                    text: "個室の前に、髪の長い女が立っている。……動かない。",
                    duration: 3,
                  },
                ]
              : []),
          ],
        },
        {
          id: `away-${i}`,
          when: { type: "lookAway" as const, target: "woman", minAngleDeg: 60 },
          requires: [`seen-${i}`],
          unless: SCARES,
          actions: [
            { type: "move" as const, target: "woman", to, duration: 0.05 },
            { type: "face" as const, target: "woman" },
            {
              type: "sound" as const,
              sound: "step" as const,
              at: { node: "woman" },
              volume: 0.6 + i * 0.2,
            },
          ],
        },
      ];
    }),
    {
      id: "last-look",
      when: { type: "look", target: "woman", maxAngleDeg: 18, maxDistance: 20 },
      requires: [`away-${STEPS.length - 1}`],
      unless: SCARES,
      actions: [
        { type: "lights", group: "toilet", on: false },
        { type: "flashlight", state: "off" },
        { type: "drone", level: 0 },
        { type: "heartbeat", bpm: 0 },
        {
          type: "subtitle",
          text: "近い。もう、目を離せない。",
          duration: 3,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "lookAway", target: "woman", minAngleDeg: 45 },
      requires: ["last-look"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-blink",
      when: { type: "after", trigger: "last-look", delay: 6 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 320 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "使用中",
          text: "翌朝、清掃員が一番奥の個室の鍵を開けると、中には缶コーヒーが二本、並べて置かれていた。\nどちらも、まだ温かかった。\n\n駐車場には、持ち主のいない車が一台残っていた。",
        },
      ],
    })),
  ],
};
