import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 公立天文台。玄関ホール z=-6〜0（幅4）、ドーム室 z=0〜10（幅10）。
 * 望遠鏡は(0,_,5)の台座の上。リグ（scope-rig）を Y 回転させて接眼レンズ（eyepiece）をプレイヤーへ向ける。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#2a2c30");
  const wall = b.mat("#4a4e58");
  const ceiling = b.mat("#1e2028");
  const metal = b.mat("#8a8e98", { specular: 0.7 });
  const white = b.mat("#d8dae0", { specular: 0.5 });
  const redGlow = b.mat("#ff3020", { emissive: "#c01408" });
  const sky = b.mat("#0a1030", { emissive: "#0a1238" });

  // ---- 玄関ホール ----
  b.room("hall", [0, 0, -3], 4, 6, 2.8, { floor, wall, ceiling: wall }, [
    "n",
    "s",
  ]);
  b.wallWithGap("front", "x", [0, 0, -6], 4, 2.8, [0, 1.1, 2.1], wall);
  b.door("front-door", [-0.55, 0, -6], 1.1, 2.1, 0, b.mat("#5a4636"), {
    open: true,
    interactive: false,
  });
  b.sign(
    "hall-sign",
    ["本日の観測", "土星・月・M31"],
    [1.4, 0.5],
    [1.95, 1.7, -3],
    -Math.PI / 2,
    {
      bg: "#101830",
      fg: "#c8d8ff",
      glow: 0.3,
    },
  );
  b.sign(
    "hall-sign-2",
    ["最終入館 20:00", "鍵は返却箱へ"],
    [1.2, 0.4],
    [-1.95, 1.7, -4],
    Math.PI / 2,
    {
      bg: "#d8d8d0",
      fg: "#222",
      glow: 0.2,
    },
  );

  // ---- ドーム室 ----
  b.room("dome", [0, 0, 5], 10, 10, 4.5, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("dome-wall", "x", [0, 0, 0], 10, 4.5, [0, 1.6, 2.2], wall);
  // 天窓（空）
  b.box("slit", [1.6, 0.04, 9], [0, 4.5, 5], sky, { collide: false });
  // 観測台のコンソール（西）
  b.box("console", [0.8, 1.0, 2.4], [-4.3, 0.5, 7], b.mat("#3a3c44"));
  b.box("console-screen", [0.05, 0.4, 1.2], [-3.9, 1.2, 7], redGlow, {
    collide: false,
  });
  // 星図
  b.sign(
    "chart-a",
    ["オリオン座", "冬の星図"],
    [1.6, 1.1],
    [-4.88, 2, 3],
    -Math.PI / 2,
    {
      bg: "#0c1a3a",
      fg: "#b8c8f0",
      glow: 0.3,
    },
  );
  const chartB = b.sign(
    "chart-b",
    ["うしろ"],
    [1.6, 1.1],
    [-4.86, 2, 3],
    -Math.PI / 2,
    {
      bg: "#d8d0c0",
      fg: "#a00c0c",
      glow: 0.3,
    },
  );
  chartB.setEnabled(false);
  b.register("chart-b", chartB);
  b.sign(
    "note",
    ["観測日誌", "記入のこと"],
    [0.7, 0.45],
    [-3.9, 1.4, 8.4],
    -Math.PI / 2,
    {
      bg: "#e8e0c8",
      fg: "#222",
      glow: 0.2,
    },
  );

  // ---- 望遠鏡 ----
  b.cylinder("pier", 1.3, 0.7, [0, 0.65, 5], b.mat("#55575e"));
  b.cylinder("pier-top", 0.1, 0.9, [0, 1.3, 5], metal, { collide: false });
  const rig = new TransformNode("scope-rig", b.scene);
  rig.position.set(0, 1.35, 5);
  b.register("scope-rig", rig);
  const tube = b.cylinder("scope-tube", 2.0, 0.42, [0, 0.4, 0.5], white, {
    collide: false,
  });
  tube.rotation.x = 0.9;
  tube.parent = rig;
  const eye = b.cylinder("eyepiece", 0.3, 0.14, [0, -0.2, -0.3], metal, {
    collide: false,
  });
  eye.rotation.x = 0.9;
  eye.parent = rig;
  b.register("eyepiece", eye);
  const glow = b.box("scope-glow", [0.1, 0.1, 0.1], [0, -0.27, -0.4], redGlow, {
    collide: false,
  });
  glow.parent = rig;
  glow.setEnabled(false);
  b.register("scope-glow", glow);

  // ---- 照明 ----
  b.lamp("dome", [0, 3.8, 4], "#aab8ff", 0.45, 12, true);
  b.lamp("console", [-3.9, 1.5, 7], "#ff3a28", 0.5, 7, false);
  b.lamp("hall", [0, 2.5, -3], "#ffd8a0", 0.5, 7, true);

  // ---- 最後の一発 ----
  b.figure(
    "starer",
    [0, 0, 20],
    {
      skin: "#c8ccc8",
      hair: "#0a0a10",
      cloth: "#202030",
      eyes: "#ffffff",
      height: 1.0,
    },
    false,
  );

  // ---- 望遠鏡が勝手にプレイヤーを向く ----
  let targetY: number | null = null;
  return {
    update: (_g, dt) => {
      if (targetY === null) {
        return;
      }
      const cur = rig.rotation.y;
      rig.rotation.y = cur + (targetY - cur) * Math.min(1, dt * 0.8);
    },
    custom: {
      scopeTurn: (g) => {
        // eyepiece はリグのローカル -z 側。プレイヤー方向へ向ける
        const p = g.camera.position;
        const d = new Vector3(p.x - rig.position.x, 0, p.z - rig.position.z);
        const raw = Math.atan2(d.x, d.z) + Math.PI;
        targetY = Math.atan2(Math.sin(raw), Math.cos(raw));
      },
    },
  };
};
