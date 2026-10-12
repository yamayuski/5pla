import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/** 観覧車のゴンドラ。x=-1.5〜1.5, z=0〜3。向かいの席(0,*,2.5)に乗客が現れる。 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#3a3a44");
  const wall = b.mat("#5a2a3a");
  const ceiling = b.mat("#2a2a30");
  const seat = b.mat("#7a3a2a");
  const glass = b.mat("#8aa0c0", { emissive: "#101828", alpha: 0.25 });
  const night = b.mat("#05060c", { emissive: "#05060c" });
  const smear = b.mat("#d8d8e0", { emissive: "#707080" });

  b.room("gondola", [0, 0, 1.5], 3, 3, 2.4, { floor, wall, ceiling });
  b.box("seat-a", [1.6, 0.45, 0.6], [0, 0.23, 2.6], seat);
  b.box("seat-back", [1.6, 0.6, 0.1], [0, 0.75, 2.85], seat, {
    collide: false,
  });
  b.box("seat-b", [1.6, 0.45, 0.6], [0, 0.23, 0.4], seat);
  b.box("window-w", [0.04, 1.2, 2.2], [-1.45, 1.4, 1.5], glass, {
    collide: false,
  });
  b.box("window-e", [0.04, 1.2, 2.2], [1.45, 1.4, 1.5], glass, {
    collide: false,
  });
  b.box("abyss", [40, 0.1, 40], [0, -30, 0], night, { collide: false });
  b.sign(
    "price",
    ["一周 約15分", "地上まで あと半周"],
    [1.0, 0.4],
    [-1.43, 1.2, 1.5],
    Math.PI / 2,
    {
      bg: "#d8d0b8",
      fg: "#2a1a0a",
      glow: 0.2,
    },
  );
  b.sign("hand", ["", ""], [0.2, 0.25], [1.42, 1.5, 1.2], -Math.PI / 2, {
    bg: "#d8d8e0",
    fg: "#d8d8e0",
    glow: 0.8,
  }).setEnabled(false);
  b.sign("hand2", ["", ""], [0.2, 0.25], [1.42, 1.3, 1.9], -Math.PI / 2, {
    bg: "#d8d8e0",
    fg: "#d8d8e0",
    glow: 0.8,
  }).setEnabled(false);
  void smear;
  b.lamp("bulb", [0, 2.2, 1.5], "#ffd890", 0.5, 6, false);
  b.figure(
    "rider",
    [0, 0.45, 2.45],
    {
      skin: "#cfd6dc",
      hair: "#101010",
      cloth: "#e8e8f0",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  return {};
};
