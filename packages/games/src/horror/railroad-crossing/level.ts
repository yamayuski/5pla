import { Color3 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜の踏切。道は x=-3〜3, z=-4〜40、線路は z≈20 で x 方向。遮断機（gate-bars）は z=18 / z=22 で下りている。
 * 警報音・赤色灯・電車（train）・向こう側の人影（w0〜w4, leader）を持つ。
 * フックで赤色灯を交互に点滅させ、警報音（bell）を一定間隔で鳴らす（bellOn / bellFast / bellOff）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const road = b.mat("#26262a", { specular: 0.3 });
  const curb = b.mat("#4a4a4e");
  const rail = b.mat("#6a5a4a", { specular: 0.6 });
  const gravel = b.mat("#3a3836");
  const barRed = b.mat("#d8d8d0");
  const stripe = b.mat("#c01818");
  const pole = b.mat("#3a3a3e");
  const houseWall = b.mat("#3a3a40");
  const redOn = Color3.FromHexString("#ff2010");
  const bulbA = b.mat("#401008", { emissive: "#300800" });
  const bulbB = b.mat("#401008", { emissive: "#300801" });

  // ---- 道と線路 ----
  b.box("road", [6, 0.2, 44], [0, -0.1, 18], road);
  b.box("ballast", [6, 0.22, 3], [0, -0.09, 20], gravel);
  for (const z of [19.3, 20.7]) {
    b.box(`rail-${z}`, [6, 0.1, 0.08], [0, 0.04, z], rail, { collide: false });
  }
  for (const [n, size, pos] of [
    ["fence-w", [0.2, 4, 44], [-3.4, 2, 18]],
    ["fence-e", [0.2, 4, 44], [3.4, 2, 18]],
    ["fence-s", [6.8, 4, 0.2], [0, 2, -4.2]],
    ["fence-n", [6.8, 4, 0.2], [0, 2, 40.2]],
    ["fence-gate", [6.8, 4, 0.2], [0, 2, 18.8]],
  ] as const) {
    b.box(n, size, pos, curb).isVisible = false;
  }
  // 沿道の塀
  for (const side of [-1, 1]) {
    b.box(`wall-${side}`, [0.3, 2.2, 44], [side * 3.3, 1.1, 18], houseWall);
  }
  b.sign(
    "route",
    ["この先 踏切あり", "一旦停止"],
    [1.2, 0.6],
    [-3.12, 1.6, 8],
    Math.PI / 2,
    {
      bg: "#f0d020",
      fg: "#181818",
      glow: 0.25,
    },
  );

  // ---- 遮断機と警報機 ----
  const bars = new TransformNode("gate-bars", b.scene);
  for (const [i, z, x0, x1] of [
    [0, 18, -3, 0.4],
    [1, 22, 3, -0.4],
  ] as const) {
    const cx = (x0 + x1) / 2;
    const len = Math.abs(x1 - x0);
    b.box(`bar-${i}`, [len, 0.1, 0.1], [cx, 1.0, z], barRed, { parent: bars });
    for (let k = 0; k < 4; k++) {
      b.box(
        `bar-stripe-${i}-${k}`,
        [0.3, 0.12, 0.12],
        [cx - len / 2 + 0.4 + k * 0.8, 1.0, z],
        stripe,
        {
          collide: false,
          parent: bars,
        },
      );
    }
  }
  b.register("gate-bars", bars);
  for (const [n, x, z, mat] of [
    ["sig-a", -2.7, 17.8, bulbA],
    ["sig-b", 2.7, 22.2, bulbB],
  ] as const) {
    b.cylinder(`${n}-pole`, 3, 0.12, [x, 1.5, z], pole, { collide: false });
    b.box(`${n}-head`, [0.5, 0.25, 0.1], [x, 2.7, z], pole, { collide: false });
    b.box(
      `${n}-bulb-l`,
      [0.14, 0.14, 0.04],
      [x - 0.12, 2.7, z + (z < 20 ? 0.06 : -0.06)],
      mat,
      { collide: false },
    );
    b.box(
      `${n}-bulb-r`,
      [0.14, 0.14, 0.04],
      [x + 0.12, 2.7, z + (z < 20 ? 0.06 : -0.06)],
      mat,
      { collide: false },
    );
  }
  const lampA = b.lamp("signal-a", [-2.7, 2.6, 17.4], "#ff2010", 0.9, 9, false);
  const lampB = b.lamp("signal-b", [2.7, 2.6, 22.6], "#ff2010", 0.9, 9, false);

  // ---- 街灯 ----
  b.cylinder("street-pole", 4, 0.12, [-2.7, 2, 6], pole, { collide: false });
  b.lamp("street", [-2.2, 4, 6], "#ffc880", 0.6, 12, true);

  // ---- 電車（通過する間だけ表示） ----
  const train = new TransformNode("train", b.scene);
  train.position.set(-40, 0, 20);
  const bodyMat = b.mat("#6a6e78", { specular: 0.4 });
  const win = b.mat("#fff0c0", { emissive: "#c0a860" });
  b.box("train-body", [24, 3, 2.8], [0, 1.9, 0], bodyMat, {
    collide: false,
    parent: train,
  });
  for (let k = 0; k < 10; k++) {
    b.box(`train-win-${k}`, [1.5, 0.9, 2.84], [-10.4 + k * 2.3, 2.3, 0], win, {
      collide: false,
      parent: train,
    });
  }
  train.setEnabled(false);
  b.register("train", train);

  // ---- 向こう側の人影と、先頭の leader ----
  const style = {
    skin: "#a8aaa8",
    hair: "#080808",
    cloth: "#202226",
    eyes: "#000000",
    height: 1.02,
  };
  for (const i of [0, 1, 2, 3, 4]) {
    const w = b.figure(
      `w${i}`,
      [-2.4 + i * 1.2, 0, 24 + (i % 2) * 0.9],
      { ...style, longHair: i % 2 === 0 },
      false,
    );
    w.rotation.y = Math.PI;
  }
  const leader = b.figure(
    "leader",
    [0, 0, 24.5],
    {
      skin: "#c8c8c4",
      hair: "#050505",
      cloth: "#d8d4cc",
      eyes: "#000000",
      height: 1.04,
      longHair: true,
    },
    false,
  );
  leader.rotation.y = Math.PI;

  // ---- 警報音と赤色灯の点滅 ----
  let bellOn = false;
  let interval = 0.9;
  let timer = 0;
  let phase = 0;
  return {
    update: (g, dt) => {
      timer += dt;
      if (timer >= interval / 2) {
        timer = 0;
        phase = 1 - phase;
        if (bellOn && phase === 0) {
          g.audio?.play("bell", { x: 0, y: 2.6, z: 20 }, 0.5);
        }
      }
      const on = bellOn || interval < 0;
      const aOn = on && phase === 0;
      const bOn = on && phase === 1;
      if (lampA.light.isEnabled()) {
        lampA.light.intensity = aOn ? 0.9 : 0;
      }
      if (lampB.light.isEnabled()) {
        lampB.light.intensity = bOn ? 0.9 : 0;
      }
      bulbA.emissiveColor = aOn ? redOn : Color3.FromHexString("#300800");
      bulbB.emissiveColor = bOn ? redOn : Color3.FromHexString("#300800");
    },
    custom: {
      bellOn: () => {
        bellOn = true;
      },
      bellFast: () => {
        interval = 0.45;
      },
      bellOff: () => {
        bellOn = false;
      },
    },
  };
};
