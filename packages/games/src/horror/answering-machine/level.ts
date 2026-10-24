import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 一人暮らしの1Kの部屋。x=-3〜3, z=0〜8。玄関ドア(entry-door)は南壁(z=0)。
 * 北の机の上に留守番電話(machine)。部屋の隅の暗がりに女(woman)が後ろ向きで立つ（最初は非表示）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6b5a46");
  const wall = b.mat("#bdb6a6");
  const ceil = b.mat("#cfcabd");
  const wood = b.mat("#4a3524");
  const dark = b.mat("#1c1c20");
  const redLed = b.mat("#300000", { emissive: "#ff2010" });
  const cloth = b.mat("#5a6a80");

  b.room("flat", [0, 0, 4], 6, 8, 2.6, { floor, wall, ceiling: ceil }, ["s"]);
  b.wallWithGap("entry", "x", [0, 0, 0], 6, 2.6, [0, 1.1, 2.2], wall);
  b.door("entry-door", [-0.55, 0, 0], 1.1, 2.2, 0, wood, {
    open: true,
    interactive: false,
  });
  b.box("porch", [6, 0.2, 3], [0, -0.1, -1.5], dark);
  b.box("porch-block", [6, 3, 0.2], [0, 1.5, -3], dark).isVisible = false;
  b.box("porch-w", [0.2, 3, 3], [-3, 1.5, -1.5], dark).isVisible = false;
  b.box("porch-e", [0.2, 3, 3], [3, 1.5, -1.5], dark).isVisible = false;

  // 家具
  b.box("bed", [1.4, 0.5, 2.0], [-2.2, 0.25, 6.8], cloth);
  b.box("desk", [1.8, 0.75, 0.7], [1, 0.38, 7.5], wood);
  const machine = b.box("machine", [0.4, 0.12, 0.3], [1, 0.81, 7.5], dark);
  b.register("machine", machine as Mesh);
  b.box("led", [0.06, 0.03, 0.06], [1.15, 0.88, 7.4], redLed, {
    collide: false,
  });
  b.box("shelf", [0.4, 1.8, 1.6], [2.75, 0.9, 4.2], wood);
  b.box("table", [1.0, 0.4, 1.0], [0, 0.2, 4], wood);
  b.sign(
    "calendar",
    ["10月", "今日に印"],
    [0.6, 0.8],
    [-2.88, 1.5, 3],
    Math.PI / 2,
    {
      bg: "#f0ead8",
      fg: "#a01818",
      glow: 0.1,
    },
  );
  b.lamp("room", [0, 2.3, 3], "#ffd8a0", 0.6, 9, true);
  b.lamp("room", [1, 2.2, 7], "#ffd8a0", 0.35, 6, false);

  b.figure(
    "woman",
    [-1.6, 0, 7.6],
    {
      skin: "#c8c6c0",
      hair: "#050505",
      cloth: "#d8d4cc",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  b.figure(
    "ghost",
    [0, 0, 5],
    {
      skin: "#c8c6c0",
      hair: "#050505",
      cloth: "#d8d4cc",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  return {};
};
