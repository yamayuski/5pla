import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜の田んぼ道。道は x=-2.5〜2.5, z=0〜50。両脇（x=±4.5）にかかしが5体ずつ（sc-0〜4 が左、sc-5〜9 が右）。
 * 最初は全員、田んぼ側（道に背）を向いている。`face` アクションで一体ずつこちらを向く。
 * 道の真ん中に立つ blocker が最後に近づいてくる。奥(z≈48)に農家の灯り(farm)。
 */
const LEFT_Z = [6, 14, 22, 30, 38];
const RIGHT_Z = [10, 18, 26, 34, 42];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const road = b.mat("#3a3830");
  const paddy = b.mat("#1c2a1a");
  const straw = b.mat("#b8a050");
  const wood = b.mat("#4a3a2a");
  const houseMat = b.mat("#1c1c20");
  const warm = b.mat("#ffc870", { emissive: "#c08830" });

  // ---- 道と田んぼ ----
  b.box("road", [5, 0.2, 52], [0, -0.1, 25], road);
  b.box("paddy-w", [16, 0.2, 52], [-10.5, -0.2, 25], paddy, { collide: false });
  b.box("paddy-e", [16, 0.2, 52], [10.5, -0.2, 25], paddy, { collide: false });
  for (const [n, size, pos] of [
    ["fence-w", [0.2, 4, 52], [-2.7, 2, 25]],
    ["fence-e", [0.2, 4, 52], [2.7, 2, 25]],
    ["fence-s", [5.6, 4, 0.2], [0, 2, -1.2]],
    ["fence-n", [5.6, 4, 0.2], [0, 2, 51]],
  ] as const) {
    b.box(n, size, pos, wood).isVisible = false;
  }
  b.sign(
    "bus-sign",
    ["○○バス停", "終バス 22:10"],
    [1, 0.5],
    [-2.4, 1.6, 2],
    Math.PI / 2,
    {
      bg: "#e8e8d8",
      fg: "#181818",
      glow: 0.25,
    },
  );

  // ---- 農家 ----
  b.box("farmhouse", [8, 4, 5], [0, 2, 53], houseMat, { collide: false });
  b.box("farm-window", [1.2, 0.9, 0.1], [-1.5, 1.8, 50.4], warm, {
    collide: false,
  });
  b.lamp("farm", [0, 2.2, 49], "#ffc870", 0.9, 16, false);

  // ---- かかし ----
  const makeScarecrow = (
    name: string,
    x: number,
    z: number,
    rotY: number,
    visible: boolean,
  ): TransformNode => {
    b.cylinder(`${name}-pole`, 1.9, 0.08, [x, 0.95, z], wood, {
      collide: false,
    });
    const f = b.figure(
      name,
      [x, 0, z],
      {
        skin: "#b8a468",
        hair: "#8a7a38",
        cloth: "#5a4a30",
        eyes: "#000000",
        height: 1.02,
        longHair: false,
      },
      visible,
    );
    f.rotation.y = rotY;
    // 麦わら帽子（頭の上、局所座標）
    b.cylinder(`${name}-hat`, 0.04, 0.5, [0, 1.62, 0], straw, {
      collide: false,
    }).parent = f;
    b.cylinder(`${name}-hat-top`, 0.14, 0.24, [0, 1.7, 0], straw, {
      collide: false,
    }).parent = f;
    // 横木
    b.box(`${name}-arms`, [0.9, 0.06, 0.06], [0, 1.1, -0.05], wood, {
      collide: false,
      parent: f,
    });
    return f;
  };
  for (const [i, z] of LEFT_Z.entries()) {
    makeScarecrow(`sc-${i}`, -4.5, z, -Math.PI / 2, true);
  }
  for (const [i, z] of RIGHT_Z.entries()) {
    makeScarecrow(`sc-${i + 5}`, 4.5, z, Math.PI / 2, true);
  }
  // 道の真ん中に現れる一体
  const blocker = makeScarecrow("blocker", 0, 36, Math.PI, false);
  blocker.scaling.setAll(1.08);

  return {};
};
