import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「ひとり、多い」の演出データ。
 * 入口 entry-door（z=0）、処置室扉 ward-door（z=8）、最奥ケージ cage-last、人影 patient / behind。
 * 照明グループ front（受付）/ ward（入院室）。
 */
const SCARES = ["peek", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "vet-clinic",
  title: "ひとり、多い",
  intro: [
    "夜勤の動物看護師として、入院中の動物たちの見回りに来た。",
    "ホワイトボードの入院数は、4。",
  ],
  spawn: { position: [0, 1.6, 2], lookAt: [0, 1.4, 8] },
  fog: { color: [0.03, 0.035, 0.035], density: 0.02 },
  ambient: { intensity: 0.2, color: [0.8, 0.9, 0.85] },
  flashlight: { enabled: false, intensity: 0.7, angleDeg: 42, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "消毒液のにおい。奥から、小さな鼻息が聞こえる。", duration: 5 },
        { type: "objective", text: "奥の入院室を見回る" },
      ],
    },
    {
      id: "ward-open",
      when: { type: "time", at: 25 },
      actions: [
        { type: "door", door: "ward-door", state: "open" },
        { type: "sound", sound: "creak", at: [0, 1.2, 8], volume: 0.5 },
      ],
    },
    {
      id: "bark",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "whisper", at: [-4, 1, 11], volume: 0.5 },
        { type: "subtitle", text: "ケージの中の犬が、同じ方向を見てうなっている。誰もいない壁の隅を。", duration: 6 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 78 },
        { type: "subtitle", text: "照明が瞬いた。誰かの足音が、受付のほうで止まった。", duration: 5 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "flicker", duration: 0.4 },
        { type: "subtitle", text: "ガラス越しの受付に、白い服の人が立っていた。", duration: 4 },
      ],
    },
    {
      id: "glimpse-gone",
      when: { type: "after", trigger: "glimpse", delay: 1.2 },
      actions: [{ type: "visible", target: "behind", visible: false }],
    },
    {
      id: "lock",
      when: { type: "time", at: 200 },
      actions: [
        { type: "door", door: "entry-door", state: "slam" },
        { type: "door", door: "entry-door", state: "lock" },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "subtitle", text: "入口の扉が勝手に閉まった。鍵が回る音。", duration: 5 },
      ],
    },
    {
      id: "blackout",
      when: { type: "after", trigger: "lock", delay: 10 },
      actions: [
        { type: "flicker", duration: 1.5 },
        { type: "lights", group: "front", on: false },
        { type: "flashlight", state: "on" },
        { type: "fog", density: 0.05, duration: 5 },
        { type: "drone", level: 0.3 },
        { type: "heartbeat", bpm: 104 },
        { type: "sound", sound: "whisper", at: "behind", volume: 0.6 },
        { type: "objective", text: "最奥のケージを確かめる（入院数が合わない）" },
        { type: "subtitle", text: "受付の灯りが落ちた。ケージは三つ。入院札は四つ。残りの一つは、どこ。", duration: 7 },
      ],
    },
    {
      id: "peek",
      when: { type: "interact", target: "cage-last", label: "最奥のケージをのぞく", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "patient" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "patient" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "ひとり、多い",
          text: "翌朝、院長が入院台帳を確かめた。\n三頭の名前の下に、書いた覚えのない四つ目の名前が、あなたの筆跡で書かれていた。",
        },
      ],
    })),
  ],
};
