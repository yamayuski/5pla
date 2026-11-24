import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「最後の客」の演出データ。
 * 入口 entry-door（z=0）、調べる対象 dispatch-board、人影 figure / behind。
 * 照明グループ front（手前）/ back（奥）。
 */
const SCARES = ["flip-board", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "midnight-taxi-stand",
  title: "最後の客",
  intro: ["深夜のタクシー営業所で、配車の待機番をしている。", "無線機が、ときどきノイズを吐いている。"],
  spawn: { position: [0, 1.6, 2], lookAt: [0, 1.4, 8] },
  fog: { color: [0.03, 0.03, 0.04], density: 0.02 },
  ambient: { intensity: 0.2, color: [0.85, 0.88, 0.95] },
  flashlight: { enabled: false, intensity: 0.7, angleDeg: 42, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.05,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "煙草と古い座布団のにおい。無線のノイズが低く鳴っている。", duration: 5 },
        { type: "objective", text: "配車表を整理する" },
      ],
    },
    {
      id: "anomaly-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "thud", at: [-3, 0.5, 7], volume: 0.5 },
        { type: "subtitle", text: "鍵束が、壁のフックから落ちた。", duration: 6 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 78 },
        { type: "subtitle", text: "照明が瞬いた。無線が、この営業所の住所を告げた。", duration: 5 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "flicker", duration: 0.4 },
        { type: "subtitle", text: "車庫の暗がりに、帽子の人影が立っていた。", duration: 4 },
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
        { type: "subtitle", text: "事務所の戸が閉まり、錠が下りた。", duration: 5 },
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
        { type: "objective", text: "配車表の裏を確かめる" },
        { type: "subtitle", text: "手前の灯りが落ちた。配車表の裏から、乗車を告げる声がする。", duration: 7 },
      ],
    },
    {
      id: "flip-board",
      when: { type: "interact", target: "dispatch-board", label: "配車表をめくる", maxDistance: 2.6 },
      requires: ["blackout"],
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure" }],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "最後の客",
          text: "翌朝、配車記録に深夜三時の一件が残っていた。\n乗車地は営業所、客の名前はあなただった。",
        },
      ],
    })),
  ],
};
