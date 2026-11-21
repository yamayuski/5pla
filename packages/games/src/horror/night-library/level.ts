import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉館後の市立図書館。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 return-box（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#8a8070");
  const wall = b.mat("#a09a88");
  const wood = b.mat("#4a3622");
  const accent = b.mat("#2a4a3a");
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

  b.box("shelf-l", [0.6, 2.4, 10], [-5, 1.2, 8], wood);
  b.box("shelf-r", [0.6, 2.4, 10], [5, 1.2, 6], wood);
  b.box("shelf-m", [0.6, 2.4, 6], [0, 1.2, 9], wood);
  b.box("desk", [3, 0.9, 0.8], [-2.5, 0.45, 4], wood);

  // 調べる対象
  const post = b.box("return-box-body", [1.0, 1.2, 0.8], [4.6, 0.6, 14.9], accent);
  b.register("return-box", post);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [4.6, 0, 15.3], { skin: "#c8c8c0", cloth: "#d8d8d0", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#d8d8d0", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#f0e8c8", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#f0e8c8", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#f0e8c8", 0.5, 8, true);

  return {};
};
