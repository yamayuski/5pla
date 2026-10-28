import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉店後の百貨店・婦人服フロア。x=-5〜5, z=0〜10。南壁（z=0）中央にシャッター扉。
 * マネキン m1〜m4 は最初から立っている。m5 は背後側に後から出現。奥のレジ台 button-desk で裏口を開ける。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#8a8478");
  const wall = b.mat("#c9c2b4");
  const ceiling = b.mat("#d8d4ca");
  const rack = b.mat("#5a4a3a");
  const cloth = [b.mat("#7a2a3a"), b.mat("#2a3a6a"), b.mat("#3a5a3a")];

  b.room("floor", [0, 0, 5], 10, 10, 3, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 10, 3, [0, 1.1, 2.1], wall);
  b.door("shutter", [-0.55, 0, 0], 1.1, 2.1, 0, b.mat("#4a4a52"), {
    open: true,
    interactive: false,
  });
  b.box("outside", [10, 0.2, 5], [0, -0.1, -2.5], floor);
  for (const [n, size, pos] of [
    ["out-s", [10, 4, 0.2], [0, 2, -5]],
    ["out-w", [0.2, 4, 5], [-5, 2, -2.5]],
    ["out-e", [0.2, 4, 5], [5, 2, -2.5]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }

  // 洋服ラック
  for (const [i, x, z] of [
    [0, -4.2, 2],
    [1, 4.2, 2],
    [2, -4.2, 5],
    [0, 4.2, 5],
    [1, -4.2, 8],
    [2, 4.2, 8],
  ] as const) {
    b.box(`rack-${x}-${z}`, [0.6, 0.06, 1.6], [x, 1.5, z], rack, {
      collide: false,
    });
    b.box(
      `rack-clothes-${x}-${z}`,
      [0.5, 0.9, 1.4],
      [x, 1.0, z],
      cloth[i] ?? rack,
    );
    b.box(`rack-leg-${x}-${z}`, [0.06, 1.5, 0.06], [x, 0.75, z - 0.7], rack, {
      collide: false,
    });
  }

  b.sign(
    "banner",
    ["秋の新作 全品30%OFF", "営業時間 10:00〜20:00"],
    [2.4, 0.6],
    [0, 2.2, 0.12],
    0,
    { bg: "#f2e8d0", fg: "#7a1a2a", glow: 0.25 },
  );

  // マネキン（顔なし）
  const style = {
    skin: "#e8e2d6",
    hair: "#e8e2d6",
    cloth: "#8a2a3a",
    eyes: "#e8e2d6",
    height: 1.0,
    longHair: false,
  };
  for (const [n, x, z, ry] of [
    ["m1", -2.2, 3.2, Math.PI],
    ["m2", 2.2, 3.2, Math.PI],
    ["m3", -2.2, 6.4, Math.PI],
    ["m4", 2.2, 6.4, Math.PI],
  ] as const) {
    const m = b.figure(n, [x, 0, z], style, true);
    m.rotation.y = ry;
    b.register(n, m);
  }
  const m5 = b.figure("m5", [0, 0, 1.2], style, false);
  m5.rotation.y = 0;
  b.register("m5", m5);

  // 奥のレジ台
  const desk = b.box("button-desk", [1.6, 1.0, 0.7], [0, 0.5, 9.4], rack);
  b.register("button-desk", desk);
  b.box(
    "button-red",
    [0.2, 0.05, 0.2],
    [0, 1.03, 9.4],
    b.mat("#ff2a2a", { emissive: "#a00000" }),
    { collide: false },
  );

  // 最後の一発
  b.figure(
    "ghost",
    [0, 0, 8],
    {
      skin: "#f0ece4",
      hair: "#050505",
      cloth: "#8a2a3a",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );

  b.lamp("main", [0, 2.7, 3], "#e8f0ff", 0.7, 9);
  b.lamp("back", [0, 2.7, 8], "#e8f0ff", 0.5, 7);
  return {};
};
