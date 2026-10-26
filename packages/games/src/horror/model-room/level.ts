import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 内見の1LDK。x=-4〜4, z=0〜11、天井 2.6m。南(z=0)の front-door が玄関。
 * 西壁(x=-4)の z=7 にクローゼット(closet-door、中は x=-5.4〜-4)。東壁側に掃き出し窓とカーテン(curtain)。
 * 不動産屋(realtor)は最初 z=3 に立ち、後で玄関の外から戻ってくる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#b8a888", { specular: 0.3 });
  const wall = b.mat("#e8e4d8");
  const ceiling = b.mat("#d8d4c8");
  const doorMat = b.mat("#8a7458");
  const counter = b.mat("#c8c0b0");
  const dark = b.mat("#101010");
  const cur = b.mat("#d8d0c0", { alpha: 0.9 });

  b.room("flat", [0, 0, 5.5], 8, 11, 2.6, { floor, wall, ceiling }, ["s", "w"]);
  b.wallWithGap("front", "x", [0, 0, 0], 8, 2.6, [0, 1.0, 2.1], wall);
  b.door("front-door", [-0.5, 0, 0], 1.0, 2.1, 0, doorMat, {
    open: true,
    interactive: false,
    openAngleDeg: 95,
  });
  b.box("hall", [8, 0.2, 4], [0, -0.1, -2], floor);
  for (const [n, size, pos] of [
    ["hall-w", [0.2, 3, 4], [-4, 1.5, -2]],
    ["hall-e", [0.2, 3, 4], [4, 1.5, -2]],
    ["hall-s", [8, 3, 0.2], [0, 1.5, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.wallWithGap("west", "z", [-4, 0, 5.5], 11, 2.6, [1.5, 1.0, 2.1], wall);
  b.door("closet-door", [-4, 0, 7.5], 1.0, 2.1, Math.PI / 2, doorMat, {
    open: false,
    interactive: false,
    openAngleDeg: 100,
  });
  b.room(
    "closet",
    [-4.7, 0, 7],
    1.4,
    1.4,
    2.6,
    { floor, wall: dark, ceiling: dark },
    ["e"],
  );
  b.sign(
    "flyer",
    ["内見中", "家賃 4.8万円（相場の半額）"],
    [1.4, 0.5],
    [3.88, 1.6, 2],
    Math.PI / 2,
    {
      bg: "#f8f4d8",
      fg: "#a01818",
      glow: 0.35,
    },
  );

  // ---- 家具（なし）と設備 ----
  b.box("kitchen", [2.4, 0.9, 0.7], [2.4, 0.45, 10.5], counter);
  b.box("island", [1.6, 0.9, 0.7], [-1.0, 0.45, 8.2], counter);
  const sink = b.box(
    "tap",
    [0.1, 0.25, 0.1],
    [2.4, 1.0, 10.5],
    b.mat("#aab0b4", { specular: 0.8 }),
    {
      collide: false,
    },
  );
  b.register("tap", sink);
  b.box("aircon", [0.9, 0.3, 0.25], [0, 2.3, 10.8], b.mat("#e8e8e8"), {
    collide: false,
  });

  // ---- 窓とカーテン ----
  b.box(
    "window",
    [0.05, 1.8, 3.0],
    [3.97, 1.2, 6.5],
    b.mat("#6a88b0", { emissive: "#2a3a50", alpha: 0.6 }),
    {
      collide: false,
    },
  );
  const curtain = b.box("curtain", [0.06, 2.0, 1.6], [3.8, 1.1, 5.8], cur, {
    collide: false,
  });
  b.register("curtain", curtain);

  // ---- 照明 ----
  b.lamp("room", [0, 2.4, 4], "#fff4e0", 0.55, 9, true);
  b.lamp("room", [0, 2.4, 9], "#fff4e0", 0.5, 9, true);
  b.lamp("corridor", [0, 2.6, -1.5], "#e0f0e0", 0.7, 6, false).light.setEnabled(
    false,
  );

  // ---- 不動産屋 ----
  const realtor = b.figure(
    "realtor",
    [1.2, 0, 3.6],
    {
      skin: "#e0d0c0",
      hair: "#101010",
      cloth: "#202838",
      eyes: "#101010",
      height: 1.18,
    },
    true,
  );
  realtor.rotation.y = Math.PI;
  b.figure(
    "realtor-return",
    [0, 0, -1.4],
    {
      skin: "#d8d0c8",
      hair: "#101010",
      cloth: "#202838",
      eyes: "#000000",
      height: 1.18,
    },
    false,
  );
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c8c8c0",
      hair: "#101010",
      cloth: "#202838",
      eyes: "#000000",
      height: 1.18,
    },
    false,
  );
  return {};
};
