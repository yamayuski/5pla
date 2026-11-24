import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 午前三時のパン屋。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 oven-door（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6a6058");
  const wall = b.mat("#8a8078");
  const wood = b.mat("#403028");
  const metal = b.mat("#8a9096", { specular: 0.6 });
  const accent = b.mat("#e07030");
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

  b.box("woodpile-l", [1.4, 1.2, 3], [-4.5, 0.6, 6], wood);
  b.box("gauge", [0.3, 1.2, 1], [5.7, 1.4, 9], metal);
  b.box("pipe", [0.5, 0.5, 10], [5, 2.6, 7], metal);
  b.box("stool", [0.5, 0.5, 0.5], [2, 0.25, 4], wood);

  // 調べる対象
  b.box("oven-body", [3.4, 2.2, 2], [0, 1.1, 15], b.mat("#403c38", { specular: 0.3 }));
  const od = b.box("oven-door-panel", [1.6, 1.2, 0.15], [0, 1.1, 13.95], accent);
  b.register("oven-door", od);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [0, 0, 15.4], { skin: "#c8c8c0", cloth: "#4a2a20", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#4a2a20", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#fff0d0", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#fff0d0", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#fff0d0", 0.5, 8, true);

  return {};
};
