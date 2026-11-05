import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉園後のミラーハウス。フロアは x=-4〜4, z=0〜16（南の入口に入口の鉄扉 shutter）。
 * 中央にスマホの台 wagon（x=0,z=5）と鏡パネル、奥の仕切り壁（z=13）に非常口 exit（ヒンジ x=1.3）、
 * その向こうの backroom（z=14.5）に figure-w。ワゴンの上のスマホ lost（x=0,z=5）。
 * フック：none（照明は group floor）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#8a8478");
  const wall = b.mat("#c8c4b8");
  const ceil = b.mat("#a8a498");
  const steel = b.mat("#8a9096", { specular: 0.6 });
  const wood = b.mat("#6a4a30");
  const mirror = b.mat("#b8c8d0", { specular: 1 });
  const toy = [mirror, mirror, mirror] as const;
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

  b.sign("closing", ["本日の営業は終了しました", "ご来園ありがとうございました"], [2.4, 0.6], [-3.9, 1.9, 3], Math.PI / 2, {
    bg: "#101820",
    fg: "#f0e8c0",
    glow: 0.5,
  });

  // スマホの台と鏡のパネル
  const wagon = b.box("wagon", [1.4, 0.8, 0.8], [0, 0.4, 5], wood);
  b.register("wagon", wagon);
  b.sign("lost", ["メッセージ", "うしろ"], [1.0, 0.4], [0, 1.1, 4.58], 0, {
    bg: "#f0f0f0",
    fg: "#c02020",
    glow: 0.3,
  });
  for (const [i, x, z] of [
    [0, -2.4, 8],
    [1, 2.4, 9],
    [2, -2.2, 11],
  ] as const) {
    b.box(`ride-${i}`, [0.12, 2.4, 1.8], [x, 1.2, z], toy[i]);
  }
  const ghostRide = b.box("ride-ghost", [0.6, 0.5, 0.8], [2.4, 1.05, 9], toy[0], { collide: false });
  ghostRide.isPickable = false;
  b.register("ride-ghost", ghostRide);
  ghostRide.setEnabled(false);

  // 奥の仕切りと非常口
  b.wallWithGap("partition", "x", [0, 0, 13], 8, 3.2, [0, 2.6, 2.6], wall);
  b.door("exit", [1.3, 0, 13], 2.6, 2.6, Math.PI, wood, { open: false });
  b.sign("staff", ["非常口", "EMERGENCY EXIT"], [1.6, 0.4], [0, 2.7, 12.88], Math.PI, {
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
