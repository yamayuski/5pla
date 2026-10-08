import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 子ども部屋のクローゼットの中から、すき間ごしに部屋をのぞく。
 * クローゼット内部 x=-0.7〜0.7, z=-1.0〜0.2（出られない）。その北側(z=0.2)が縦スリットの引き戸。
 * 子ども部屋は x=-3.5〜3.5, z=0.2〜8.0。北の壁(z=8)に room-door。女(stalker)は戸口から入って部屋を歩き回る。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6a5a48");
  const wall = b.mat("#8a8078");
  const ceiling = b.mat("#5a524a");
  const closetWood = b.mat("#4a3828");
  const wood = b.mat("#6a4a30");
  const bedding = b.mat("#8a98b0");
  const door = b.mat("#5a4030");

  // ---- クローゼット ----
  b.room(
    "closet",
    [0, 0, -0.4],
    1.4,
    1.2,
    2.4,
    { floor: closetWood, wall: closetWood, ceiling: closetWood },
    ["n"],
  );
  for (let i = 0; i < 7; i++) {
    b.box(
      `slat-${i}`,
      [0.1, 2.4, 0.06],
      [-0.6 + i * 0.2, 1.2, 0.2],
      closetWood,
    );
  }
  b.box("coat", [0.5, 1.4, 0.2], [-0.4, 1.3, -0.85], b.mat("#2a3040"), {
    collide: false,
  });

  // ---- 子ども部屋 ----
  b.room("bedroom", [0, 0, 4.1], 7, 7.8, 2.6, { floor, wall, ceiling }, [
    "s",
    "n",
  ]);
  b.box("south-l", [2.8, 2.6, 0.2], [-2.1, 1.3, 0.2], wall);
  b.box("south-r", [2.8, 2.6, 0.2], [2.1, 1.3, 0.2], wall);
  b.wallWithGap("north", "x", [0, 0, 8], 7, 2.6, [0, 1.0, 2.1], wall);
  b.door("room-door", [-0.5, 0, 8], 1.0, 2.1, 0, door, {
    open: false,
    interactive: false,
    openAngleDeg: 100,
  });
  b.box("hall", [7, 0.2, 4], [0, -0.1, 10], floor);
  b.box("hall-block", [7, 3, 0.2], [0, 1.5, 12], wall).isVisible = false;
  b.box("hall-w", [0.2, 3, 4], [-3.5, 1.5, 10], wall).isVisible = false;
  b.box("hall-e", [0.2, 3, 4], [3.5, 1.5, 10], wall).isVisible = false;

  // 家具（ベッド・勉強机）
  b.box("bed-frame", [1.3, 0.4, 2.2], [-2.5, 0.2, 5.2], wood);
  b.box("bed-top", [1.2, 0.2, 2.0], [-2.5, 0.5, 5.2], bedding);
  b.box("desk", [1.4, 0.75, 0.6], [2.7, 0.38, 3.4], wood);
  b.box("toys", [0.8, 0.3, 0.5], [1.4, 0.15, 6.5], b.mat("#a84030"), {
    collide: false,
  });
  b.box(
    "window-moon",
    [0.05, 1.0, 0.8],
    [3.45, 1.6, 5.5],
    b.mat("#c8d8f0", { emissive: "#8898b8" }),
    { collide: false },
  );
  b.sign(
    "poster",
    ["おやすみ", "ねんねの時間"],
    [0.8, 0.5],
    [-3.4, 1.6, 3],
    -Math.PI / 2,
    {
      bg: "#304868",
      fg: "#f0e8c0",
      glow: 0.3,
    },
  );

  // ---- 照明（ほぼ月明かり） ----
  b.lamp("room", [0, 2.3, 4], "#9ab0d8", 0.3, 9, false);
  b.lamp("night", [2.3, 0.8, 3.4], "#f0b868", 0.35, 4, false);

  // ---- 女 ----
  const stalker = b.figure(
    "stalker",
    [0, 0, 7.6],
    {
      skin: "#c4c4bc",
      hair: "#060606",
      cloth: "#e4e0d8",
      eyes: "#000000",
      height: 1.05,
      longHair: true,
    },
    false,
  );
  stalker.rotation.y = Math.PI;
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c4c4bc",
      hair: "#060606",
      cloth: "#e4e0d8",
      eyes: "#000000",
      height: 1.05,
      longHair: true,
    },
    false,
  );
  return {};
};
