import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 公園の公衆トイレ。x=-3〜3, z=0〜8。入口 entrance(z=0)、北側に個室 stall-1〜4（z=6が扉面）。
 * 手洗い場は西壁側（x=-2.7, z=2〜4）。ghost は stall-4 の中に隠れている。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6a7068");
  const wall = b.mat("#8a9088");
  const ceiling = b.mat("#5a5e58");
  const stallMat = b.mat("#3a6a6a");
  const metal = b.mat("#9aa0a0", { specular: 0.6 });

  b.room("wc", [0, 0, 4], 6, 8, 2.8, { floor, wall, ceiling }, ["s"]);
  b.box("south-l", [2.5, 2.8, 0.2], [-1.75, 1.4, 0], wall);
  b.box("south-r", [2.5, 2.8, 0.2], [1.75, 1.4, 0], wall);
  b.box("south-top", [1, 0.8, 0.2], [0, 2.4, 0], wall);
  b.door("entrance", [-0.5, 0, 0], 1.0, 2.0, 0, metal, {
    open: true,
    interactive: false,
  });
  b.box("outside", [6, 0.2, 4], [0, -0.1, -2], floor);
  b.box("outside-block", [6, 3, 0.2], [0, 1.5, -4], wall).isVisible = false;
  b.box("outside-w", [0.2, 3, 4], [-3, 1.5, -2], wall).isVisible = false;
  b.box("outside-e", [0.2, 3, 4], [3, 1.5, -2], wall).isVisible = false;

  // ---- 個室（仕切りと扉） ----
  for (let i = 0; i <= 4; i++) {
    b.box(
      `part-${i}`,
      [0.05, 2.0, 2.0],
      [-3 + 0.2 + i * 1.6, 1.0, 7],
      stallMat,
    );
  }
  const xs = [-2.4, -0.8, 0.8, 2.4];
  xs.forEach((cx, i) => {
    b.door(`stall-${i + 1}`, [cx - 0.55, 0, 6], 1.1, 1.9, 0, stallMat, {
      open: false,
      interactive: false,
      openAngleDeg: 100,
    });
    b.box(
      `toilet-${i + 1}`,
      [0.5, 0.45, 0.6],
      [cx, 0.23, 7.5],
      b.mat("#e8e8e0"),
    );
  });

  // ---- 手洗い場と鏡 ----
  b.box("sink", [0.5, 0.2, 2.4], [-2.6, 0.9, 3], b.mat("#d0d4d0"));
  b.box(
    "mirror",
    [0.05, 1.0, 2.0],
    [-2.88, 1.7, 3],
    b.mat("#9ab0b8", { emissive: "#1a2428" }),
  );
  b.sign(
    "wc-sign",
    ["公衆便所", "夜間は施錠します"],
    [1.4, 0.6],
    [1.6, 2.1, 0.12],
    0,
    {
      bg: "#d8d8c8",
      fg: "#202820",
      glow: 0.2,
    },
  );

  // ---- 照明（蛍光灯） ----
  b.lamp("wc", [0, 2.7, 2], "#d8ffe8", 0.7, 9, true);
  b.lamp("wc", [0, 2.7, 5.5], "#d8ffe8", 0.6, 9, true);

  // ---- 個室4の中の何か ----
  const ghost = b.figure(
    "ghost",
    [2.4, 0, 6.8],
    {
      skin: "#b8bcb4",
      hair: "#080808",
      cloth: "#d8d8d0",
      eyes: "#000000",
      height: 1.65,
      longHair: true,
    },
    false,
  );
  ghost.rotation.y = Math.PI;
  return {};
};
