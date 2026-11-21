import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉店後の理容室。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 barber-chair（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#b8b0a0");
  const wall = b.mat("#8a9a90");
  const wood = b.mat("#5a4030");
  const dark = b.mat("#1a1a1c");
  const accent = b.mat("#a02020");
  const invisible = b.mat("#000000");

  b.box("ground", [12, 0.2, 16], [0, -0.1, 8], floor);
  b.box("ceiling", [12, 0.2, 16], [0, 3.1, 8], wall, { collide: false });
  b.box("wall-w", [0.2, 3, 16], [-6, 1.5, 8], wall);
  b.box("wall-e", [0.2, 3, 16], [6, 1.5, 8], wall);
  b.box("wall-s-l", [4.9, 3, 0.2], [-3.55, 1.5, 0], wall);
  b.box("wall-s-r", [4.9, 3, 0.2], [3.55, 1.5, 0], wall);
  b.box("wall-n", [12, 3, 0.2], [0, 1.5, 16], wall);

  b.door("entry-door", [-1.1, 0, 0], 2.2, 2.4, Math.PI / 2, b.mat("#4a4a52"), {
    open: true,
    interactive: false,
  });

  b.box("shelf", [4, 1.6, 0.5], [-3.5, 0.8, 15.6], wood);
  b.box("chair-a", [0.8, 0.5, 0.8], [-3, 0.25, 8], dark);
  b.box("chair-b", [0.8, 0.5, 0.8], [0, 0.25, 8], dark);
  b.box("counter", [6, 0.9, 0.5], [-2.5, 0.45, 5], wood);
  b.cylinder("pole", 1.8, 0.3, [5.5, 0.9, 1], accent, { collide: false });

  // 調べる対象
  const chair = b.box("barber-chair-seat", [0.9, 1.0, 0.9], [0, 0.5, 14.4], accent);
  b.register("barber-chair", chair);
  b.box("barber-chair-back", [0.9, 0.8, 0.15], [0, 1.4, 14.8], accent, { collide: false }).isPickable = false;

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [0, 0, 15.3], { skin: "#c8c8c0", cloth: "#e8e8e8", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#e8e8e8", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#f4ecd8", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#f4ecd8", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#f4ecd8", 0.5, 8, true);

  return {};
};
