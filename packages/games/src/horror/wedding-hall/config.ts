import type { HorrorConfig } from "./kit/types";

/**
 * 「ご祝儀袋」の演出データ。
 * 結婚式場の宴会場は x=-8〜8, z=0〜20（入口 z=0）。丸テーブル6卓、中央通路 x=-1.3〜1.3 の奥 z=15 にウェディングケーキ(cake)、
 * 北にステージとスクリーン。最後にケーキに入刀すると、ケーキの陰から花嫁(bride)が起き上がる。
 */
const SCARES = ["scare-cut", "scare-fallback", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "wedding-hall",
  title: "ご祝儀袋",
  intro: [
    "友人の結婚式の二次会のあと。ご祝儀袋を会場に忘れたことに気づいて、鍵を借りて戻ってきた。",
    "誰もいない宴会場は、さっきまでの賑わいが嘘のように静かだ。",
  ],
  spawn: { position: [0, 1.6, 1.4], lookAt: [0, 1.5, 12] },
  fog: { color: [0.04, 0.03, 0.05], density: 0.014 },
  ambient: { intensity: 0.1, color: [1, 0.9, 0.9] },
  flashlight: {
    enabled: true,
    intensity: 0.55,
    angleDeg: 42,
    range: 12,
    color: [1, 0.97, 0.92],
  },
  walkSpeed: 0.08,
  droneLevel: 0.05,
  triggers: [
    // ---- 0〜1分: 忘れ物を探す ----
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        {
          type: "subtitle",
          text: "片付けの途中のまま、白いクロスのテーブルが並んでいる。シャンデリアの灯りだけが残っている。",
        },
        { type: "objective", text: "自分が座っていたテーブルで袋を探す" },
      ],
    },
    {
      id: "envelope",
      when: {
        type: "interact",
        target: "envelope",
        label: "袋を拾う",
        maxDistance: 2.4,
      },
      actions: [
        { type: "visible", target: "envelope", visible: false },
        {
          type: "sound",
          sound: "rattle",
          at: { node: "envelope" },
          volume: 0.4,
        },
        {
          type: "subtitle",
          text: "あった。……でも、封筒に自分の名前が書かれていない。裏には「おめでとう」と、赤い字で何度も。",
          duration: 6,
        },
        { type: "objective", text: "帰る" },
      ],
    },
    // ---- 1〜3分: 小さな異変 ----
    {
      id: "slide",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "scr-a", visible: false },
        { type: "visible", target: "scr-b", visible: true },
        { type: "sound", sound: "chime", at: [0, 3, 19], volume: 0.7 },
        { type: "heartbeat", bpm: 72 },
        {
          type: "subtitle",
          text: "ステージのスクリーンが勝手に点いた。スライドショーの一枚目に、新郎新婦の名前。……新婦の欄は、黒く塗りつぶされている。",
          duration: 6,
        },
      ],
    },
    {
      id: "mc",
      when: { type: "time", at: 112 },
      actions: [
        { type: "lights", group: "spot", on: true },
        { type: "sound", sound: "whisper", at: [0, 1.6, 18.5], volume: 0.8 },
        {
          type: "subtitle",
          text: "「それでは、新郎新婦のご入場です」……司会の声。ステージにスポットライトが当たった。誰もいない。",
          duration: 6,
        },
      ],
    },
    {
      id: "guests",
      when: { type: "time", at: 150 },
      actions: [
        { type: "visible", target: "guests", visible: true },
        { type: "sound", sound: "rattle", at: [0, 1, 10], volume: 0.5 },
        { type: "drone", level: 0.2 },
        {
          type: "subtitle",
          text: "どのテーブルにも、黒い礼服の客が座っている。全員、ステージのほうを向いたまま、拍手をしている。",
          duration: 6,
        },
      ],
    },
    // ---- 3〜4分: 出口が閉じる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "hall-door", state: "slam" },
        { type: "door", door: "hall-door", state: "lock" },
        { type: "lights", group: "hall", on: false },
        { type: "lights", group: "cake", on: true },
        { type: "flashlight", state: "dim" },
        { type: "flicker", duration: 1.3 },
        { type: "heartbeat", bpm: 100 },
        { type: "drone", level: 0.4 },
        {
          type: "subtitle",
          text: "入口の扉が閉まり、シャンデリアが消えた。通路の先のウェディングケーキにだけ、スポットが当たっている。",
          duration: 6,
        },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "mc-2",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 1.6, 18.5], volume: 1 },
        { type: "objective", text: "ケーキに入刀する" },
        {
          type: "subtitle",
          text: "「それでは、初めての共同作業です。ケーキ入刀を……あなたの手で」",
          duration: 6,
        },
      ],
    },
    // ---- 4〜5分: ケーキ入刀 ----
    {
      id: "scare-cut",
      when: {
        type: "interact",
        target: "cake",
        label: "ケーキに入刀する",
        maxDistance: 2.6,
      },
      requires: ["mc-2"],
      unless: SCARES,
      actions: [
        { type: "visible", target: "cake-top", visible: false },
        { type: "visible", target: "bride", visible: true },
        { type: "sound", sound: "thud", at: { node: "cake" }, volume: 1 },
        { type: "jumpscare", figure: "bride" },
      ],
    },
    {
      id: "scare-fallback",
      when: { type: "after", trigger: "mc-2", delay: 42 },
      unless: SCARES,
      actions: [
        { type: "visible", target: "cake-top", visible: false },
        { type: "sound", sound: "thud", at: { node: "cake" }, volume: 1 },
        { type: "jumpscare", figure: "bride" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "bride" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "ご祝儀袋",
          text: "翌朝、式場のスタッフがウェディングケーキの前で、見覚えのない封筒を一通、拾い上げた。\n宛名には、今日の式の新婦の旧姓。\n\n新婦は十年前、同じ会場で、式の当日に亡くなっていた。",
        },
      ],
    })),
  ],
};
