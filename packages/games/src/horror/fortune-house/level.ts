import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 雑居ビルの占いの館。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 crystal-ball（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#4a2a3a");
  const wall = b.mat("#3a2040");
  const wood = b.mat("#2a1818");
  const accent = b.mat("#6a2a8a");
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

  b.box("table", [2.4, 0.8, 1.4], [-2.5, 0.4, 12], wood);
  b.box("sofa", [3, 0.6, 0.9], [-3, 0.3, 3], wood);
  b.box("shelf", [1, 2, 3], [-5.4, 1, 8], wood);
  b.box("desk", [2, 0.9, 0.8], [3.8, 0.45, 4], wood);

  // 調べる対象
  b.box("fortune-table", [2.2, 0.9, 1.2], [0, 0.45, 14.2], wood);
  const ball = b.cylinder("crystal-ball-body", 0.6, 0.6, [0, 1.2, 14.2], accent, { collide: false, tess: 24 });
  b.register("crystal-ball", ball);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [0, 0, 15.4], { skin: "#c8c8c0", cloth: "#3a1a4a", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#3a1a4a", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#d0a0f0", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#d0a0f0", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#d0a0f0", 0.5, 8, true);

  return {};
};
