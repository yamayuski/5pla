import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉院後の歯科医院。部屋は x=-4〜4, z=0〜8。南壁中央が出入口（clinic-door）。
 * 診察台 chair(0,0,5)、無影灯 lamp-dental、奥の壁に受付札。診察台の歯科医 dentist は最後に登場。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#bfc9c8");
  const wall = b.mat("#d6dedb");
  const ceiling = b.mat("#e4e8e6");
  const steel = b.mat("#8a9296", { specular: 0.6 });
  const vinyl = b.mat("#2f5a6a");
  const door = b.mat("#8fa3a0");

  b.room("clinic", [0, 0, 4], 8, 8, 3, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 8, 3, [0, 1.1, 2.1], wall);
  b.door("clinic-door", [-0.55, 0, 0], 1.1, 2.1, 0, door, {
    open: true,
    interactive: false,
  });
  b.box("outside", [8, 0.2, 5], [0, -0.1, -2.5], floor);
  for (const [n, size, pos] of [
    ["fence-s", [8, 4, 0.2], [0, 2, -5]],
    ["fence-w", [0.2, 4, 5], [-4, 2, -2.5]],
    ["fence-e", [0.2, 4, 5], [4, 2, -2.5]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }

  // 診察台
  const chair = b.box("chair", [0.8, 0.5, 1.8], [0, 0.45, 5], vinyl);
  b.register("chair", chair);
  b.box("chair-back", [0.8, 0.9, 0.2], [0, 1.0, 5.9], vinyl, {
    collide: false,
  });
  b.cylinder("chair-pole", 0.4, 0.15, [0, 0.2, 5], steel, { collide: false });
  b.cylinder("arm-pole", 1.8, 0.05, [0.9, 0.9, 5.4], steel, { collide: false });
  // 器具トレイ
  const tray = b.box("tray", [0.6, 0.05, 0.4], [1.3, 1.0, 4.6], steel, {
    collide: false,
  });
  b.register("tray", tray);
  b.box("tray-stand", [0.05, 1.0, 0.05], [1.3, 0.5, 4.6], steel, {
    collide: false,
  });
  // 待合室のソファ
  b.box("sofa", [2.4, 0.45, 0.8], [-2.6, 0.23, 1.2], vinyl);
  b.box("sofa-back", [2.4, 0.5, 0.15], [-2.6, 0.7, 1.55], vinyl, {
    collide: false,
  });
  // 水道（うがい）
  const basin = b.box("basin", [0.7, 0.9, 0.5], [3.5, 0.45, 6.5], steel);
  b.register("basin", basin);
  // ラジオ
  const radio = b.box("radio", [0.3, 0.18, 0.15], [-3.8, 1.2, 4], steel, {
    collide: false,
  });
  b.register("radio", radio);
  // 札
  b.sign(
    "closed",
    ["本日休診", "次の方どうぞ"],
    [1.3, 0.5],
    [-1.8, 1.7, 0.12],
    0,
    { bg: "#f0f0e8", fg: "#2a2a2a", glow: 0.2 },
  );
  const x1 = b.sign("xray", ["あーん"], [0.8, 0.4], [0, 1.8, 7.9], Math.PI, {
    bg: "#101820",
    fg: "#9fe8ff",
    glow: 0.6,
  });
  x1.setEnabled(false);
  b.register("xray", x1);

  // 照明：無影灯（最初は点灯）
  b.lamp("dental", [0, 2.4, 5], "#e8f4ff", 0.7, 9, true);

  b.figure(
    "dentist",
    [0, 0.05, 5.3],
    {
      skin: "#c9c0b4",
      hair: "#1a1a1a",
      cloth: "#e8eeee",
      eyes: "#000000",
      height: 1.0,
      longHair: false,
    },
    false,
  );
  return {};
};
