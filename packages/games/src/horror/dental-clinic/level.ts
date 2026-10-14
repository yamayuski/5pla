import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 閉院後の歯科医院。診察室は x=-4〜4, z=0〜8、南壁中央に出入口（clinic-door）。
 * 診察台 chair(2,4.5)、ライト lamp-dental、ドリル tray、壁のレントゲン写真 xray。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const tile = b.mat("#c8d4d4");
  const wall = b.mat("#dfe8e4");
  const ceiling = b.mat("#e8eeee");
  const vinyl = b.mat("#2a6a7a", { specular: 0.5 });
  const steel = b.mat("#9aa4aa", { specular: 0.8 });

  b.room("clinic", [0, 0, 4], 8, 8, 3, { floor: tile, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 8, 3, [0, 1.1, 2.1], wall);
  b.door("clinic-door", [-0.55, 0, 0], 1.1, 2.1, 0, b.mat("#8a9a98"), {
    open: true,
    interactive: false,
  });
  for (const [n, size, pos] of [
    ["fence-s", [8, 4, 0.2], [0, 2, -4]],
    ["fence-w", [0.2, 4, 4], [-4, 2, -2]],
    ["fence-e", [0.2, 4, 4], [4, 2, -2]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.box("hall", [8, 0.2, 4], [0, -0.1, -2], tile);

  // 診察台
  b.box("chair-base", [0.9, 0.5, 0.9], [2, 0.25, 4.5], steel);
  b.box("chair-seat", [0.8, 0.2, 1.0], [2, 0.6, 4.5], vinyl);
  b.box("chair-back", [0.8, 0.9, 0.2], [2, 1.0, 5.1], vinyl, {
    collide: false,
  });
  // 無影灯
  b.cylinder("arm", 1.2, 0.08, [2, 2.4, 4.5], steel, { collide: false });
  b.box(
    "lamp-head",
    [0.7, 0.15, 0.7],
    [2, 1.8, 4.5],
    b.mat("#f4f4ee", { emissive: "#707060" }),
    { collide: false },
  );
  // トレーとドリル
  const tray = b.box("tray", [0.6, 0.9, 0.5], [3.2, 0.45, 3.4], steel);
  b.register("tray", tray);
  // 受付カウンタ
  b.box("counter", [2.4, 1.0, 0.6], [-2.4, 0.5, 1.2], b.mat("#6a5a48"));
  const phone = b.box("phone", [0.25, 0.1, 0.2], [-2.4, 1.05, 1.2], steel, {
    collide: false,
  });
  b.register("phone", phone);
  // 待合の椅子
  for (const z of [4.5, 6]) {
    b.box(`bench-${z}`, [0.5, 0.45, 1.2], [-3.4, 0.23, z], vinyl);
  }
  // レントゲン写真
  const xray = b.sign(
    "xray",
    ["【口腔内 X線】", "歯が 一本 多い"],
    [1.2, 0.8],
    [-3.93, 1.7, 3],
    Math.PI / 2,
    { bg: "#101820", fg: "#bfe8ff", glow: 0.5 },
  );
  b.register("xray", xray);
  b.sign(
    "notice",
    ["本日の診療は終了しました"],
    [1.6, 0.4],
    [0, 1.9, 0.12],
    0,
    { bg: "#f0f0ea", fg: "#222", glow: 0.2 },
  );

  b.lamp("room", [0, 2.8, 3], "#e8f4f0", 0.6, 10, false);
  b.lamp("dental", [2, 1.7, 4.5], "#f4fbff", 1.2, 6, false).light.setEnabled(
    false,
  );

  b.figure(
    "dentist",
    [2, 0.7, 4.5],
    {
      skin: "#d8d0c4",
      hair: "#101010",
      cloth: "#e8f0ee",
      eyes: "#000000",
      height: 1.0,
      longHair: false,
    },
    false,
  );
  return {};
};
