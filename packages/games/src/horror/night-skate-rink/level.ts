import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉館後のスケートリンク。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 center-ice（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#d8e8f0");
  const wall = b.mat("#8a98a8");
  const wood = b.mat("#4a5260");
  const metal = b.mat("#8a9096", { specular: 0.6 });
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

  b.box("bench-l", [0.6, 0.5, 6], [-5.2, 0.25, 7], wood);
  b.box("bench-r", [0.6, 0.5, 6], [5.2, 0.25, 7], wood);
  b.box("zamboni", [1.8, 1.4, 3], [4, 0.7, 3], metal);
  b.box("rail-n", [11, 0.9, 0.1], [0, 0.45, 10], wood);

  // 調べる対象
  const patch = b.box("center-ice-patch", [2.4, 0.15, 2.4], [0, 0.08, 14.3], b.mat("#6090b0", { alpha: 0.8, specular: 0.8 }), { collide: false });
  b.register("center-ice", patch);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [0, 0, 15.4], { skin: "#c8c8c0", cloth: "#a0c8e8", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#a0c8e8", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#e0f0ff", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#e0f0ff", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#e0f0ff", 0.5, 8, true);

  return {};
};
