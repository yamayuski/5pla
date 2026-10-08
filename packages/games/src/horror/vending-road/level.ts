import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜の田舎道。x=-2.5〜2.5, z=-3〜34。東の路肩（x≈2.1）に自販機が3台（vm-0〜2 / z=8, 18, 28）。
 * 自販機の前面は -x 向き。取り出し口(outlet)に白い手（hand-1 / hand-2）を出す。
 */
const ZS = [8, 18, 28];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const asphalt = b.mat("#222428", { specular: 0.3 });
  const wallMat = b.mat("#383a3e");
  const house = b.mat("#16181c");
  const vmBody = b.mat("#d8dce0", { emissive: "#303438" });
  const vmRed = b.mat("#c02828", { emissive: "#401010" });
  const outletMat = b.mat("#08080a");
  const handMat = b.mat("#d8d4d0", { emissive: "#383634" });

  // ---- 道と両側の塀 ----
  b.box("road", [5, 0.2, 38], [0, -0.1, 16], asphalt);
  for (const side of [-1, 1]) {
    b.box(`wall-${side}`, [0.3, 1.6, 38], [side * 2.65, 0.8, 16], wallMat);
    // 向こうの家のシルエット
    for (let k = 0; k < 6; k++) {
      b.box(
        `house-${side}-${k}`,
        [3, 4 + (k % 3), 4],
        [side * 6, 2 + (k % 3) / 2, 1 + k * 6],
        house,
        { collide: false },
      );
    }
  }
  for (const [n, size, pos] of [
    ["fence-s", [5.6, 4, 0.2], [0, 2, -3.1]],
    ["fence-n", [5.6, 4, 0.2], [0, 2, 35.1]],
  ] as const) {
    b.box(n, size, pos, wallMat).isVisible = false;
  }
  // 道標
  b.sign(
    "bus-sign",
    ["バス停 まで", "あと 600m"],
    [0.9, 0.5],
    [-2.45, 1.6, 4],
    Math.PI / 2,
    {
      bg: "#1c4a2a",
      fg: "#f0f0e8",
      glow: 0.3,
    },
  );

  // ---- 自販機 ----
  for (const [i, z] of ZS.entries()) {
    const body = b.box(`vm-${i}`, [0.8, 1.8, 0.8], [2.1, 0.9, z], vmBody);
    b.register(`vm-${i}`, body);
    b.box(`vm-top-${i}`, [0.82, 0.12, 0.82], [2.1, 1.86, z], vmRed, {
      collide: false,
    });
    b.sign(
      `vm-panel-${i}`,
      ["あたたか〜い", "つめた〜い"],
      [0.62, 1.0],
      [1.69, 1.15, z],
      Math.PI / 2,
      {
        bg: "#e8f0f8",
        fg: "#c02020",
        glow: 0.9,
      },
    );
    b.box(`vm-outlet-${i}`, [0.04, 0.22, 0.5], [1.69, 0.4, z], outletMat, {
      collide: false,
    });
    b.lamp(`vm-${i}`, [1.3, 1.8, z], "#e8f4ff", 0.8, 7, false);
  }
  // 手（取り出し口から）
  for (const [name, z] of [
    ["hand-1", 18],
    ["hand-2", 28],
  ] as const) {
    const g = new TransformNode(name, b.scene);
    b.box(`${name}-arm`, [0.4, 0.08, 0.08], [1.55, 0.4, z], handMat, {
      collide: false,
      parent: g,
    });
    for (let f = 0; f < 4; f++) {
      b.box(
        `${name}-f${f}`,
        [0.12, 0.03, 0.03],
        [1.32, 0.42, z - 0.07 + f * 0.047],
        handMat,
        { collide: false, parent: g },
      );
    }
    g.setEnabled(false);
    b.register(name, g);
  }

  // ---- 最後の一発 ----
  b.figure(
    "woman",
    [0, 0, -40],
    {
      skin: "#c8ccc8",
      hair: "#060608",
      cloth: "#d8d4d0",
      eyes: "#000000",
      height: 1.03,
      longHair: true,
    },
    false,
  );
  return {};
};
