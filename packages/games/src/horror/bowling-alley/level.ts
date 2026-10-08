import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { LevelBuilder } from "./kit/builders";
import { v3 } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * ボウリング場。x=-8〜8, z=0〜22。レーン4本（中心 x=-3.75, -1.25, 1.25, 3.75、幅2.0）が z=6〜20。
 * 2番レーン（x=-1.25）の奥にマスキングユニット(mask)があり、持ち上がるとピンの間に女(pinner)が立っている。
 */
const LANES = [-3.75, -1.25, 1.25, 3.75];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#2a2230");
  const wall = b.mat("#3a2e48");
  const ceiling = b.mat("#18141e");
  const wood = b.mat("#c8a870", { emissive: "#30281a", specular: 0.5 });
  const gutter = b.mat("#14121a");
  const pin = b.mat("#f4f4f0", { emissive: "#303030" });
  const stripe = b.mat("#c02020");
  const maskMat = b.mat("#2a2a34", { specular: 0.3 });
  const neon = b.mat("#c060ff", { emissive: "#7020b0" });
  const seat = b.mat("#6a2a5a");
  const rack = b.mat("#4a3a2a");

  // ---- 建物 ----
  b.room("hall", [0, 0, 11], 16, 22, 4.2, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 16, 4.2, [0, 1.6, 2.2], wall);
  b.door("front-door", [-0.8, 0, 0], 1.6, 2.2, 0, rack, {
    open: true,
    interactive: false,
  });
  b.sign("neon", ["BOWL", "24"], [1.8, 0.7], [0, 3.0, 0.12], 0, {
    bg: "#14081c",
    fg: "#ff60f0",
    glow: 0.9,
  });
  b.box("walk", [16, 0.2, 4], [0, -0.1, -2], floor);
  for (const [n, size, pos] of [
    ["walk-w", [0.2, 4, 4], [-8, 2, -2]],
    ["walk-e", [0.2, 4, 4], [8, 2, -2]],
    ["walk-s", [16, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }

  // ---- レーン・ピン・ガター ----
  for (const x of LANES) {
    b.box(`lane-${x}`, [2.0, 0.04, 14], [x, 0.02, 13], wood, {
      collide: false,
    });
    for (const gx of [-1.15, 1.15]) {
      b.box(`gutter-${x}-${gx}`, [0.3, 0.03, 14], [x + gx, 0.0, 13], gutter, {
        collide: false,
      });
    }
    b.box(`foul-${x}`, [2.0, 0.045, 0.06], [x, 0.03, 6], stripe, {
      collide: false,
    });
    // ピン10本
    let k = 0;
    for (let row = 0; row < 4; row++) {
      for (let c = 0; c <= row; c++) {
        b.cylinder(
          `pin-${x}-${k++}`,
          0.36,
          0.12,
          [x + (c - row / 2) * 0.3, 0.2, 19.2 + row * 0.26],
          pin,
          {
            collide: false,
            diameterTop: 0.06,
            tess: 8,
          },
        );
      }
    }
    // ボールリターン台（手前）
    b.box(`return-${x}`, [1.0, 0.5, 1.0], [x + 1.25, 0.25, 3.2], gutter);
  }
  // 奥の壁と、レーン2のマスキングユニット
  b.box("back-wall", [16, 4.2, 0.4], [0, 2.1, 21.8], wall);
  const mask = b.box("mask", [2.3, 1.7, 0.3], [-1.25, 0.55, 20.4], maskMat, {
    collide: false,
  });
  b.register("mask", mask);

  // ---- 手前のブース ----
  for (const x of [-6, 6]) {
    b.box(`bench-${x}`, [1.2, 0.45, 3.5], [x, 0.23, 3.5], seat);
  }
  b.box("rack-body", [2.2, 0.9, 0.6], [-6.8, 0.45, 5.2], rack);
  const rackMesh = b.box(
    "ball-rack",
    [2.0, 0.1, 0.5],
    [-6.8, 0.95, 5.2],
    rack,
    { collide: false },
  );
  b.register("ball-rack", rackMesh);
  for (const [i, bx] of [-7.4, -6.8, -6.2].entries()) {
    const ball = MeshBuilder.CreateSphere(
      `ball-${i}`,
      { diameter: 0.24 },
      b.scene,
    );
    ball.position = v3([bx, 1.1, 5.2]);
    ball.material = b.mat(["#1a2a7a", "#7a1a2a", "#1a6a3a"][i] ?? "#222");
  }
  // リターンに戻ってくるボール
  const retBall = MeshBuilder.CreateSphere(
    "ball-ret",
    { diameter: 0.26 },
    b.scene,
  );
  retBall.position = v3([0, 0.65, 3.2]);
  retBall.material = b.mat("#050506", { specular: 0.8 });
  retBall.setEnabled(false);
  b.register("ball-ret", retBall);

  // スコア画面
  const sa = b.sign(
    "score-a",
    ["PLAYER 1", "-"],
    [1.8, 0.7],
    [-1.25, 2.6, 5.8],
    0,
    {
      bg: "#101830",
      fg: "#60e0ff",
      glow: 0.9,
    },
  );
  b.register("score-a", sa);
  const sb = b.sign(
    "score-b",
    ["PLAYER 2", "あなた"],
    [1.8, 0.7],
    [-1.25, 2.6, 5.78],
    0,
    {
      bg: "#300810",
      fg: "#ff4050",
      glow: 1.0,
    },
  );
  sb.setEnabled(false);
  b.register("score-b", sb);
  b.box("neon-bar", [14, 0.08, 0.08], [0, 3.6, 8], neon, { collide: false });

  // ---- 照明 ----
  b.lamp("lane-b", [-2, 3.6, 5], "#d090ff", 0.6, 11, false);
  b.lamp("lane-b", [2, 3.6, 5], "#d090ff", 0.6, 11, false);
  b.lamp("lane-a", [-2, 3.6, 12], "#b070ff", 0.5, 11, false);
  b.lamp("lane-a", [2, 3.6, 12], "#b070ff", 0.5, 11, false);
  b.lamp("lane-a", [0, 3.6, 18], "#ffd0f0", 0.5, 10, false);

  // ---- 2番レーンの奥に立つ女 ----
  b.figure(
    "pinner",
    [-1.25, 0, 20.9],
    {
      skin: "#b8c4c8",
      hair: "#06080a",
      cloth: "#e0e4e8",
      eyes: "#000000",
      height: 1.05,
      longHair: true,
    },
    false,
  ).rotation.y = Math.PI;
  return {};
};
