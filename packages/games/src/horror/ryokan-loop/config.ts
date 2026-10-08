import type { HorrorAction, HorrorConfig } from "./kit/types";

/**
 * 「椿の間」の演出データ。
 * 旅館の廊下は x=-1.2〜1.2, z=0〜32 の一本道。突き当たり（z=32）が自室「椿の間」。
 * 廊下の終わり（z≈25.5）に近づくと、同じ廊下の手前（z≈7.5）へ戻される（custom: loop）。
 * 戻されるたびに少しずつおかしくなる：スリッパ → 部屋札が「四」に → 襖の隙間の目 → 灯り消失 → 椿の間が開く。
 */
const SCARES = ["scare-hit", "scare-auto", "scare-auto-2", "scare-timeout"];
const DOORS = [0, 1, 2, 3, 4];

const swapSigns = (toBad: boolean): HorrorAction[] =>
  DOORS.flatMap((i) => [
    { type: "visible" as const, target: `plate-ok-${i}`, visible: !toBad },
    { type: "visible" as const, target: `plate-bad-${i}`, visible: toBad },
  ]);

export const config: HorrorConfig = {
  slug: "ryokan-loop",
  title: "椿の間",
  intro: [
    "山あいの古い旅館に泊まった夜。大浴場の帰り、自分の部屋は廊下の突き当たりだ。",
    "浴衣のまま、静かな廊下を歩いていく。",
  ],
  spawn: { position: [0, 1.6, 2], lookAt: [0, 1.5, 20] },
  fog: { color: [0.05, 0.035, 0.03], density: 0.03 },
  ambient: { intensity: 0.08, color: [1, 0.85, 0.7] },
  flashlight: {
    enabled: false,
    intensity: 0.6,
    angleDeg: 45,
    range: 10,
    color: [1, 0.95, 0.85],
  },
  walkSpeed: 0.075,
  droneLevel: 0.06,
  triggers: [
    // ---- 0〜1分: 廊下を歩く ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "古い床板がぎしぎし鳴る。他の客は皆、もう眠っているようだ。",
        },
        { type: "objective", text: "突き当たりの「椿の間」へ戻る" },
      ],
    },
    // ---- 1〜3分: 同じ廊下 ----
    {
      id: "loop-1",
      when: { type: "zone", center: [0, 1.6, 25.5], radius: 1.8 },
      actions: [
        { type: "custom", name: "loop" },
        { type: "sound", sound: "chime", at: "player", volume: 0.4 },
        {
          type: "subtitle",
          text: "……あれ。突き当たりまで来たはずなのに、さっき通った部屋札がまた見える。",
          duration: 5,
        },
      ],
    },
    {
      id: "slippers",
      when: { type: "time", at: 75 },
      actions: [
        { type: "visible", target: "slippers", visible: true },
        { type: "sound", sound: "creak", at: "behind", volume: 0.6 },
        {
          type: "subtitle",
          text: "どの部屋の前にも、揃えたスリッパが置かれている。さっきまで、無かったのに。",
          duration: 5,
        },
      ],
    },
    {
      id: "plates",
      when: { type: "time", at: 120 },
      actions: [
        ...swapSigns(true),
        { type: "sound", sound: "whisper", at: [0, 1.6, 14], volume: 0.5 },
        { type: "heartbeat", bpm: 76 },
        {
          type: "subtitle",
          text: "部屋札が、全部「四」に変わっている。梅も竹も松もない。",
          duration: 5,
        },
      ],
    },
    {
      id: "loop-2",
      when: { type: "zone", center: [0, 1.6, 25.5], radius: 1.8 },
      requires: ["loop-1", "plates"],
      actions: [
        { type: "custom", name: "loop" },
        { type: "sound", sound: "creak", at: "behind", volume: 0.8 },
        {
          type: "subtitle",
          text: "また、戻された。",
          duration: 3,
        },
      ],
    },
    {
      id: "eyes",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "eyes", visible: true },
        { type: "lights", group: "lamp-a", on: false },
        { type: "sound", sound: "rattle", at: [-1.2, 1.3, 16], volume: 0.7 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "襖がかたかたと鳴る。細く開いた隙間の暗がりに、白い目が並んでいる。",
          duration: 5,
        },
      ],
    },
    // ---- 3〜4分: 灯りが消える ----
    {
      id: "dark",
      when: { type: "time", at: 205 },
      actions: [
        { type: "lights", group: "lamp-b", on: false },
        { type: "lights", group: "lamp-c", on: false },
        { type: "flicker", duration: 1.4 },
        { type: "fog", density: 0.05, duration: 4 },
        { type: "sound", sound: "thud", at: [0, 1, 18], volume: 0.8 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "廊下の灯りが奥から順に消えていく。突き当たりの椿の間だけが、細く明るい。",
          duration: 5,
        },
      ],
    },
    {
      id: "loop-3",
      when: { type: "zone", center: [0, 1.6, 25.5], radius: 1.8 },
      requires: ["loop-2", "dark"],
      actions: [
        { type: "custom", name: "loop" },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.9 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "三度目。背後から、畳を擦るような足音がついてくる。",
          duration: 4,
        },
      ],
    },
    // ---- 4〜5分: 椿の間 ----
    {
      id: "final",
      when: { type: "zone", center: [0, 1.6, 27.5], radius: 1.8 },
      requires: ["loop-3"],
      unless: SCARES,
      actions: [
        { type: "door", door: "tsubaki-door", state: "open" },
        { type: "visible", target: "woman", visible: true },
        { type: "lights", group: "room", on: true },
        { type: "sound", sound: "creak", at: [0, 1.2, 32], volume: 0.9 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "椿の間の襖が、内側から静かに開いた。中の明かりの下に、正座した誰かの背中。",
          duration: 5,
        },
      ],
    },
    {
      id: "final-auto",
      when: { type: "after", trigger: "dark", delay: 75 },
      unless: ["final", ...SCARES],
      actions: [
        { type: "door", door: "tsubaki-door", state: "open" },
        { type: "visible", target: "woman", visible: true },
        { type: "lights", group: "room", on: true },
        { type: "sound", sound: "creak", at: [0, 1.2, 32], volume: 0.9 },
        { type: "heartbeat", bpm: 130 },
        { type: "objective", text: "" },
        {
          type: "subtitle",
          text: "突き当たりの襖が、勝手に開いた。中に、正座した誰かの背中が見える。",
          duration: 5,
        },
      ],
    },
    {
      id: "scare-hit",
      when: { type: "look", target: "woman", maxAngleDeg: 30, maxDistance: 30 },
      requiresAny: ["final", "final-auto"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-auto",
      when: { type: "after", trigger: "final", delay: 9 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-auto-2",
      when: { type: "after", trigger: "final-auto", delay: 9 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "woman" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "椿の間",
          text: "翌朝、女将は宿帳を見て首をかしげた。\n「椿の間」は、四十年前の火事のあと、一度も客を通していないという。\n\n廊下の突き当たりには、誰の部屋もなかった。",
        },
      ],
    })),
  ],
};
