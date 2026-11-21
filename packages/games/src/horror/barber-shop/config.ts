import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「カットは終わりません」の演出データ。
 * 入口 entry-door（z=0）、調べる対象 barber-chair、人影 figure / behind。
 * 照明グループ front（手前）/ back（奥）。
 */
const SCARES = ["spin", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "barber-shop",
  title: "カットは終わりません",
  intro: ["閉店後の理容室で、忘れ物を取りに戻ってきた。", "床には、まだ切りたての髪が落ちている。"],
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
        { type: "subtitle", text: "消毒液と整髪料のにおい。ハサミの音が、どこかで一度だけ鳴った。", duration: 5 },
        { type: "objective", text: "奥の棚に置き忘れた財布を探す" },
      ],
    },
    {
      id: "anomaly-1",
      when: { type: "time", at: 70 },
      actions: [
        { type: "sound", sound: "drip", at: [-4, 1, 6], volume: 0.5 },
        { type: "subtitle", text: "蛇口から水が出ている。止めたはずなのに。", duration: 6 },
      ],
    },
    {
      id: "flicker-1",
      when: { type: "time", at: 120 },
      actions: [
        { type: "flicker", duration: 0.8 },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.5 },
        { type: "heartbeat", bpm: 78 },
        { type: "subtitle", text: "照明が瞬いた。鏡の中の足音だけが、近づいてきた。", duration: 5 },
      ],
    },
    {
      id: "glimpse",
      when: { type: "time", at: 160 },
      actions: [
        { type: "visible", target: "behind", visible: true },
        { type: "flicker", duration: 0.4 },
        { type: "subtitle", text: "鏡の奥に、白いケープの人が立っていた。", duration: 4 },
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
        { type: "subtitle", text: "入口の扉が勝手に閉まった。サインポールが止まる。", duration: 5 },
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
        { type: "objective", text: "一番奥の椅子を確かめる（誰かが座っている）" },
        { type: "subtitle", text: "手前の灯りが落ちた。奥の椅子の背もたれから、髪が一筋はみ出している。", duration: 7 },
      ],
    },
    {
      id: "spin",
      when: { type: "interact", target: "barber-chair", label: "一番奥の椅子を回す", maxDistance: 2.6 },
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
          title: "カットは終わりません",
          text: "翌朝、店主は言った。「三番の椅子は、先月から誰も座っていないよ」\n財布は、切りそろえられたあなたの髪の上に置かれていた。",
        },
      ],
    })),
  ],
};
