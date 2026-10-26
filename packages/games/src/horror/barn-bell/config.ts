import type { HorrorConfig } from "./kit/types";

/**
 * 「納屋の鈴」の演出データ。
 * 納屋は x=-4.5〜4.5, z=0〜20（入口 z=0、barn-door）。中央の通路 x=-1.2〜1.2、左右に馬房が3つずつ。
 * 馬房の戸 stall-0〜2（左）, stall-3〜5（右）は最初すべて開いている。
 * 最後は奥から馬房の戸が手前へ向かって次々に閉まり、通路を老人（farmer）が近づいてくる。
 */
const SCARES = ["scare-hit", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "barn-bell",
  title: "納屋の鈴",
  intro: [
    "祖父の家の裏にある古い納屋。飼い猫のミケが入り込んだまま出てこない。",
    "暗がりの奥から、首輪の鈴の音がする。",
  ],
  spawn: { position: [0, 1.6, -2], lookAt: [0, 1.4, 10] },
  fog: { color: [0.05, 0.04, 0.03], density: 0.03 },
  ambient: { intensity: 0.07, color: [1, 0.9, 0.75] },
  flashlight: {
    enabled: true,
    intensity: 0.75,
    angleDeg: 40,
    range: 14,
    color: [1, 0.95, 0.85],
  },
  walkSpeed: 0.08,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 鈴の音を追う ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "藁と古い油の匂い。納屋の奥は、懐中電灯でもなかなか届かない。",
        },
        { type: "objective", text: "鈴の音をたどってミケを探す" },
      ],
    },
    {
      id: "bell-1",
      when: { type: "time", at: 8 },
      actions: [
        { type: "sound", sound: "bell", at: [0, 0.4, 16], volume: 0.5 },
      ],
    },
    {
      id: "bell-2",
      when: { type: "time", at: 28 },
      actions: [
        { type: "sound", sound: "bell", at: [-3, 0.4, 14], volume: 0.5 },
      ],
    },
    {
      id: "bell-3",
      when: { type: "time", at: 47 },
      actions: [
        { type: "sound", sound: "bell", at: [3, 0.4, 18], volume: 0.5 },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "slam-0",
      when: { type: "time", at: 70 },
      actions: [
        { type: "door", door: "stall-0", state: "slam" },
        { type: "heartbeat", bpm: 74 },
        {
          type: "subtitle",
          text: "背後で馬房の戸が、ばたんと閉まった。さっきまで、開いていたはずだ。",
          duration: 5,
        },
      ],
    },
    {
      id: "bell-behind",
      when: { type: "time", at: 110 },
      actions: [
        { type: "lights", group: "barn-a", on: false },
        { type: "sound", sound: "bell", at: [0, 0.6, 1], volume: 0.9 },
        {
          type: "subtitle",
          text: "鈴の音が、入口のほうへ移った。入口側の電灯が、ふっと切れる。",
          duration: 5,
        },
      ],
    },
    {
      id: "giggle",
      when: { type: "time", at: 150 },
      actions: [
        { type: "sound", sound: "giggle", at: [2.8, 1, 5], volume: 0.8 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "右の馬房の藁の中から、子どもの笑い声。この家に、小さな子どもなんていないのに。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分: 閉じ込められる ----
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "barn-door", state: "slam" },
        { type: "door", door: "barn-door", state: "lock" },
        { type: "lights", group: "barn-b", on: false },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "shake", intensity: 0.03, duration: 1.2 },
        { type: "drone", level: 0.4 },
        { type: "heartbeat", bpm: 100 },
        {
          type: "subtitle",
          text: "入口の大戸が閉まった。かんぬきが掛かる音。灯りが全部消えた。",
          duration: 5,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "run-1",
      when: { type: "after", trigger: "lock", delay: 9 },
      actions: [
        { type: "visible", target: "farmer", visible: true },
        { type: "move", target: "farmer", to: [0, 0, 3], duration: 15 },
        { type: "door", door: "stall-2", state: "slam" },
        { type: "door", door: "stall-5", state: "slam" },
        {
          type: "subtitle",
          text: "奥から、馬房の戸が順番に閉まりはじめた。手前へ。手前へ。",
          duration: 5,
        },
      ],
    },
    {
      id: "run-2",
      when: { type: "after", trigger: "run-1", delay: 1.7 },
      actions: [
        { type: "door", door: "stall-1", state: "slam" },
        { type: "door", door: "stall-4", state: "slam" },
        { type: "heartbeat", bpm: 125 },
      ],
    },
    {
      id: "run-3",
      when: { type: "after", trigger: "run-2", delay: 1.7 },
      actions: [
        { type: "door", door: "stall-0", state: "slam" },
        { type: "door", door: "stall-3", state: "slam" },
        { type: "sound", sound: "bell", at: "behind", volume: 1 },
        { type: "heartbeat", bpm: 140 },
      ],
    },
    // ---- 4〜5分: 通路の老人 ----
    {
      id: "scare-hit",
      when: {
        type: "look",
        target: "farmer",
        maxAngleDeg: 28,
        maxDistance: 25,
      },
      requires: ["run-3"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "farmer" }],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "run-3", delay: 9 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "farmer" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "farmer" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "納屋の鈴",
          text: "翌朝、ミケは母屋の縁側で眠っていた。首輪の鈴は、とうの昔に外れて失くしたはずだった。\n\n納屋の奥の馬房からは、錆びた小さな鈴が、いくつも見つかったという。",
        },
      ],
    })),
  ],
};
