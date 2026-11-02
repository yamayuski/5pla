import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 深夜の商店街の玩具店。店内は x=-4〜4, z=0〜12（南の入口にシャッター shutter、北は壁）。
 * 入口脇のレジ台、中央に棚、奥（z=11.6）にオルゴール musicbox（台座上）。
 * ぬいぐるみ棚の前の目玉看板 eyes（最初は非表示）、通路の奥の人影 figure-g（最初は非表示）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#3b2f2a");
  const wall = b.mat("#8a7a6a");
  const ceil = b.mat("#2a2420");
  const wood = b.mat("#7a5a3a");
  const toyR = b.mat("#c02020");
  const toyB = b.mat("#2050c0");
  const toyY = b.mat("#d0b020");
  const brass = b.mat("#b89a40", { specular: 0.6 });
  const steel = b.mat("#8a9096", { specular: 0.6 });
  const invisible = b.mat("#000000");

  b.room("shop", [0, 0, 6], 8, 12, 3.2, { floor, wall, ceiling: ceil }, ["s"]);
  b.wallWithGap("shop-front", "x", [0, 0, 0], 8, 3.2, [0, 1.3, 2.6], wall);
  b.door("shutter", [-1.3, 0, 0], 2.6, 2.6, Math.PI / 2, steel, { open: true, interactive: false });
  for (const [n, size, pos] of [
    ["edge-s", [10, 4, 0.2], [0, 2, -3]],
    ["edge-w", [0.2, 4, 6], [-5, 2, -1]],
    ["edge-e", [0.2, 4, 6], [5, 2, -1]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  b.sign("shop-name", ["おもちゃの ひろば", "創業五十年"], [2, 0.7], [-3.95, 2.1, 2], Math.PI / 2, {
    bg: "#f0e0b0",
    fg: "#702020",
    glow: 0.4,
  });
  b.box("counter", [2.4, 1, 0.8], [2.6, 0.5, 1.6], wood);
  b.lamp("shop", [0, 3.0, 3], "#ffe8c0", 0.7, 8, true);
  b.lamp("shop", [0, 3.0, 9], "#ffe8c0", 0.7, 8, true);

  // 棚とおもちゃ
  for (const [i, x] of [-2.4, 2.4].entries()) {
    b.box(`shelf-${i}`, [0.8, 2, 4], [x, 1, 6], wood);
    for (let k = 0; k < 4; k++) {
      b.box(`toy-${i}-${k}`, [0.4, 0.4, 0.4], [x, 0.6 + k * 0.45, 4.8 + k * 0.8], [toyR, toyB, toyY][(i + k) % 3] ?? toyR, {
        collide: false,
      });
    }
  }

  // 目玉看板（ぬいぐるみの目が一斉にこちらを向く）
  const eyes = b.sign("eyes", ["◉ ◉ ◉ ◉ ◉", "みんな こっちを みている"], [3, 0.6], [-3.93, 1.4, 7.5], Math.PI / 2, {
    bg: "#101010",
    fg: "#ff3030",
    glow: 0.5,
  });
  eyes.setEnabled(false);

  // 奥のオルゴール
  b.box("pedestal", [1, 0.9, 1], [0, 0.45, 11.2], wood);
  const musicbox = b.box("musicbox", [0.5, 0.3, 0.4], [0, 1.05, 11.2], brass);
  b.register("musicbox", musicbox);

  const figG = b.figure(
    "figure-g",
    [0, 0, 8.4],
    { skin: "#d8d0c8", cloth: "#d8a0b0", hair: "#0a0a0a", eyes: "#000000", longHair: true },
    false,
  );
  figG.rotation.y = Math.PI;

  return {
    update: () => {},
    custom: {},
  };
};
