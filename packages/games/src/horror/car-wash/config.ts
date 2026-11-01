import type { HorrorConfig } from "@5pla/horror-kit/types";

/**
 * 「泡の向こう」の演出データ。
 * 洗車ベイ（x=-3〜3, z=0〜16）、入口のシャッター shutter、料金箱 coinbox、洗車機アーチ arch（フック archMove）、
 * 奥の泡カーテン越しの人影 figure-w、北壁の非常停止ボタン stop-btn、照明 group bay。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
  slug: "car-wash",
  title: "泡の向こう",
  intro: [
    "深夜二時、車が泥だらけだったので、国道沿いの無人コイン洗車場に寄った。",
    "他に客はいない。水の音だけが響いている。",
  ],
  spawn: { position: [0, 1.6, -1.5], lookAt: [0, 1.4, 6] },
  fog: { color: [0.03, 0.035, 0.04], density: 0.02 },
  ambient: { intensity: 0.08, color: [0.75, 0.8, 0.95] },
  flashlight: { enabled: false, intensity: 0.6, angleDeg: 42, range: 12, color: [1, 0.97, 0.9] },
  walkSpeed: 0.09,
  droneLevel: 0.04,
  triggers: [
    {
      id: "intro",
      when: { type: "time", at: 1 },
      actions: [
        { type: "subtitle", text: "ベイの中は蛍光灯が白々と点いている。まずは料金箱に硬貨を入れよう。", duration: 5 },
        { type: "objective", text: "料金箱で洗車を始める" },
      ],
    },
    {
      id: "start",
      when: { type: "interact", target: "coinbox", label: "硬貨を入れる", maxDistance: 2.4 },
      actions: [
        { type: "sound", sound: "buzz", at: { node: "coinbox" }, volume: 0.5 },
        { type: "subtitle", text: "ゴウン、と洗車機が動き出す。泡が壁を伝う。", duration: 4 },
        { type: "objective", text: "" },
      ],
    },
    {
      id: "start-auto",
      when: { type: "time", at: 40 },
      unless: ["start"],
      actions: [
        { type: "sound", sound: "buzz", at: { node: "coinbox" }, volume: 0.5 },
        { type: "subtitle", text: "料金箱がひとりでに鳴った。洗車機が動き出す。", duration: 4 },
        { type: "objective", text: "" },
      ],
    },
    // ---- 小さな異変 ----
    {
      id: "handprint",
      when: { type: "time", at: 70 },
      actions: [
        { type: "visible", target: "handprint", visible: true },
        { type: "sound", sound: "knock", at: [-2.9, 1.2, 4.6], volume: 0.7 },
        { type: "subtitle", text: "壁の曇りに、内側から押したような手形が浮かんだ。", duration: 5 },
        { type: "heartbeat", bpm: 74 },
      ],
    },
    {
      id: "arch-start",
      when: { type: "time", at: 120 },
      actions: [
        { type: "custom", name: "archMove" },
        { type: "subtitle", text: "料金は入れていないはずなのに、洗車機がこちらへ動き出した。", duration: 5 },
        { type: "drone", level: 0.12 },
      ],
    },
    {
      id: "whisper",
      when: { type: "time", at: 165 },
      actions: [
        { type: "sound", sound: "whisper", at: [0, 1.5, 11], volume: 0.6 },
        { type: "subtitle", text: "泡の向こうから、水音に混じって声がする。「……あらって」", duration: 5 },
        { type: "heartbeat", bpm: 88 },
      ],
    },
    // ---- 逃げ道が塞がる ----
    {
      id: "lock",
      when: { type: "time", at: 205 },
      actions: [
        { type: "door", door: "shutter", state: "slam" },
        { type: "door", door: "shutter", state: "lock" },
        { type: "lights", group: "bay", on: false },
        { type: "sound", sound: "slam", at: [0, 1.2, 0], volume: 0.9 },
        { type: "shake", intensity: 0.02, duration: 0.8 },
        { type: "flashlight", state: "on" },
        { type: "subtitle", text: "入口のシャッターが落ち、明かりが消えた。", duration: 5 },
        { type: "heartbeat", bpm: 104 },
      ],
    },
    {
      id: "dark",
      when: { type: "after", trigger: "lock", delay: 8 },
      actions: [
        { type: "flicker", duration: 1.4 },
        { type: "visible", target: "figure-w", visible: true },
        { type: "sound", sound: "footsteps", at: "behind", volume: 0.7 },
        { type: "drone", level: 0.35 },
        { type: "subtitle", text: "泡のカーテンの向こうに、立っている人の影。洗車機はまだ迫ってくる。奥に非常停止ボタンが見える。", duration: 7 },
        { type: "objective", text: "奥の非常停止ボタンを押す" },
      ],
    },
    // ---- ジャンプスケア ----
    {
      id: "scare-hit",
      when: { type: "interact", target: "stop-btn", label: "非常停止を押す", maxDistance: 2.6 },
      requires: ["dark"],
      unless: SCARES,
      actions: [
        { type: "custom", name: "archStop" },
        { type: "jumpscare", figure: "figure-w" },
      ],
    },
    {
      id: "scare-timeout",
      when: { type: "time", at: 330 },
      unless: SCARES,
      actions: [{ type: "jumpscare", figure: "figure-w" }],
    },
    ...SCARES.map((id) => ({
      id: `end-${id}`,
      when: { type: "after" as const, trigger: id, delay: 2.4 },
      actions: [
        {
          type: "end" as const,
          title: "泡の向こう",
          text: "翌朝、コイン洗車場でびしょ濡れの車が見つかった。\n料金箱の売上は一人分。ベイの内側のガラスだけが、手形で真っ白に曇っていた。",
        },
      ],
    })),
  ],
};
