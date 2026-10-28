import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 歯科の診察室。部屋は x=-3〜3, z=0〜7、南壁（z=0）中央に扉。
 * 北壁にモニター（sign）、中央にテーブルとマイク、ソファは東西。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const carpet = b.mat("#2a1830");
  const wall = b.mat("#3a2a44");
  const ceiling = b.mat("#1a1220");
  const sofa = b.mat("#5a1a3a");
  const table = b.mat("#18141c", { specular: 0.5 });
  const black = b.mat("#101010");

  b.room("box", [0, 0, 3.5], 6, 7, 2.6, { floor: carpet, wall, ceiling }, [
    "s",
  ]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 2.6, [0, 1.05, 2.1], wall);
  b.door("room-door", [-0.5, 0, 0], 1, 2.1, 0, b.mat("#2a2030"), {
    open: true,
    interactive: false,
  });
  // 扉の外の廊下（歩き出せない）
  for (const [n, size, pos] of [
    ["hall-s", [6, 3, 0.2], [0, 1.5, -3]],
    ["hall-w", [0.2, 3, 3], [-1.5, 1.5, -1.5]],
    ["hall-e", [0.2, 3, 3], [1.5, 1.5, -1.5]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.box("hall-floor", [3, 0.2, 3], [0, -0.1, -1.5], carpet);

  for (const x of [-2.5, 2.5]) {
    b.box(`sofa-${x}`, [0.8, 0.45, 4], [x, 0.23, 3.8], sofa);
    b.box(`sofa-back-${x}`, [0.2, 0.9, 4], [x * 1.12, 0.6, 3.8], sofa);
  }
  b.box("table", [1.2, 0.5, 2.4], [0, 0.25, 3.6], table);
  const mic = b.box("mic", [0.07, 0.07, 0.25], [0, 0.54, 3.6], black);
  b.register("mic", mic);
  const sw = b.box(
    "switch",
    [0.1, 0.03, 0.2],
    [0.3, 0.52, 4.3],
    b.mat("#303030"),
    { collide: false },
  );
  b.register("switch", sw);

  const tvOpts = { bg: "#e0e8f0", fg: "#101820", glow: 0.9 };
  b.sign(
    "xray-a",
    ["X線写真", "右下 6番"],
    [2.4, 1.3],
    [0, 1.5, 6.95],
    0,
    tvOpts,
  );
  const tvB = b.sign(
    "xray-b",
    ["■ ■ ■ ■", "ぬいて", "うしろにいる"],
    [2.4, 1.3],
    [0, 1.5, 6.93],
    0,
    { bg: "#300000", fg: "#ff3030", glow: 0.9 },
  );
  tvB.setEnabled(false);
  b.sign(
    "price",
    ["本日の受付", "終了しました"],
    [1, 0.4],
    [-1.5, 1.9, 0.12],
    0,
    {
      bg: "#d8d0b8",
      fg: "#2a1a0a",
      glow: 0.2,
    },
  );

  b.lamp("disco", [0, 2.3, 3.5], "#c030ff", 0.6, 8, false);
  b.lamp("red", [0, 2.3, 5.5], "#ff2020", 0.5, 7, false).light.setEnabled(
    false,
  );

  b.figure(
    "doctor",
    [-2.4, 0.45, 5.8],
    {
      skin: "#b8c0c0",
      hair: "#050505",
      cloth: "#e8e8e8",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  return {};
};
