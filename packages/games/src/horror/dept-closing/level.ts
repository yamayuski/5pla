import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉店後の百貨店の屋上階フロア。フロアは x=-4〜4, z=0〜16（南の入口に防火シャッター shutter）。
 * 中央にワゴン wagon（x=0,z=5）とアナウンス用スピーカー、奥の仕切り壁（z=13）に従業員用扉 exit（ヒンジ x=1.3）、
 * その向こうの backroom（z=14.5）に figure-w。ワゴンの上の迷子札 lost（x=0,z=5）。
 * フック：none（照明は group floor）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#8a8478");
  const wall = b.mat("#c8c4b8");
  const ceil = b.mat("#a8a498");
  const steel = b.mat("#8a9096", { specular: 0.6 });
  const wood = b.mat("#6a4a30");
  const toy = [b.mat("#d04040"), b.mat("#4060d0"), b.mat("#e0c040")];
  const invisible = b.mat("#000000");

  b.room("floor", [0, 0, 8], 8, 16, 3.2, { floor, wall, ceiling: ceil }, ["s"]);
  b.wallWithGap("floor-front", "x", [0, 0, 0], 8, 3.2, [0, 2.6, 2.6], wall);
  b.door("shutter", [-1.3, 0, 0], 2.6, 2.6, Math.PI / 2, steel, { open: true, interactive: false });
  for (const [n, size, pos] of [
    ["edge-s", [10, 4, 0.2], [0, 2, -3]],
    ["edge-w", [0.2, 4, 6], [-5, 2, -1]],
    ["edge-e", [0.2, 4, 6], [5, 2, -1]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  b.sign("closing", ["本日の営業は終了しました", "蛍の光 ♪"], [2.4, 0.6], [-3.9, 1.9, 3], Math.PI / 2, {
    bg: "#101830",
    fg: "#f0e8c0",
    glow: 0.5,
  });

  // 屋上遊園のワゴンと子供用の乗り物
  const wagon = b.box("wagon", [1.4, 0.8, 0.8], [0, 0.4, 5], wood);
  b.register("wagon", wagon);
  b.sign("lost", ["迷子のお知らせ", "お母様がお待ちです"], [1.0, 0.4], [0, 1.1, 4.58], 0, {
    bg: "#f0f0f0",
    fg: "#c02020",
    glow: 0.3,
  });
  for (const [i, x, z] of [
    [0, -2.4, 8],
    [1, 2.4, 9],
    [2, -2.2, 11],
  ] as const) {
    b.box(`ride-${i}`, [1, 0.7, 1.6], [x, 0.35, z], toy[i]);
  }
  const ghostRide = b.box("ride-ghost", [0.6, 0.5, 0.8], [2.4, 1.05, 9], toy[0], { collide: false });
  ghostRide.isPickable = false;
  b.register("ride-ghost", ghostRide);
  ghostRide.setEnabled(false);

  // 奥の仕切りと従業員用扉
  b.wallWithGap("partition", "x", [0, 0, 13], 8, 3.2, [0, 2.6, 2.6], wall);
  b.door("exit", [1.3, 0, 13], 2.6, 2.6, Math.PI, wood, { open: false });
  b.sign("staff", ["関係者以外立入禁止", "STAFF ONLY"], [1.6, 0.4], [0, 2.7, 12.88], Math.PI, {
    bg: "#b02020",
    fg: "#ffffff",
    glow: 0.4,
  });
  b.box("back-wall", [8, 3.2, 0.2], [0, 1.6, 16], wall);
  const figW = b.figure(
    "figure-w",
    [0, 0, 14.4],
    { skin: "#d0c8c0", cloth: "#e8e0d0", hair: "#0a0a0a", eyes: "#000000", longHair: true },
    false,
  );
  figW.rotation.y = 0;

  b.lamp("floor", [0, 3.0, 3.5], "#fff0d8", 0.8, 8, true);
  b.lamp("floor", [0, 3.0, 9], "#fff0d8", 0.8, 8, true);
  b.lamp("floor", [0, 3.0, 14], "#fff0d8", 0.6, 6, true);

  return {
    update: () => {},
    custom: {},
  };
};
