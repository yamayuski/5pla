import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 夜の学校の音楽室。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 piano-keys（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#9a8a70");
  const wall = b.mat("#aaa595");
  const wood = b.mat("#5a4028");
  const accent = b.mat("#101010");
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

  b.box("desk0", [1.4, 0.75, 0.6], [-4.0, 0.37, 4.0], wood);
  b.box("desk1", [1.4, 0.75, 0.6], [-2.2, 0.37, 4.0], wood);
  b.box("desk2", [1.4, 0.75, 0.6], [-0.3999999999999999, 0.37, 4.0], wood);
  b.box("desk3", [1.4, 0.75, 0.6], [-4.0, 0.37, 5.6], wood);
  b.box("desk4", [1.4, 0.75, 0.6], [-2.2, 0.37, 5.6], wood);
  b.box("desk5", [1.4, 0.75, 0.6], [-0.3999999999999999, 0.37, 5.6], wood);
  b.box("teacher-desk", [2, 0.9, 0.8], [3.8, 0.45, 3], wood);

  // 調べる対象
  b.box("piano-body", [1.8, 0.9, 1.6], [0, 0.45, 15.0], accent);
  const keys = b.box("piano-keys-board", [1.6, 0.1, 0.4], [0, 0.95, 14.0], b.mat("#e8e8e0"), { collide: false });
  b.register("piano-keys", keys);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [0, 0, 15.3], { skin: "#c8c8c0", cloth: "#2a3048", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#2a3048", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#e8e8d0", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#e8e8d0", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#e8e8d0", 0.5, 8, true);

  return {};
};
