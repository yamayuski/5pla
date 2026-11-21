import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 午前三時のパン工房。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 oven-door（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#c0b8a8");
  const wall = b.mat("#d0ccc0");
  const wood = b.mat("#7a6048");
  const metal = b.mat("#8a9096", { specular: 0.6 });
  const accent = b.mat("#403838");
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

  b.box("table-a", [3, 0.9, 1.2], [-2.5, 0.45, 6], wood);
  b.box("table-b", [3, 0.9, 1.2], [2.5, 0.45, 8], wood);
  b.box("rack", [1.2, 2, 0.6], [-5, 1, 10], metal);
  b.box("mixer", [0.8, 1.1, 0.8], [5, 0.55, 4], metal);

  // 調べる対象
  b.box("oven-body", [3, 2.2, 1.6], [0, 1.1, 15.1], accent);
  const odoor = b.box("oven-door-panel", [1.2, 1.0, 0.1], [0, 1.0, 14.25], b.mat("#c04010", { emissive: 0.5 }));
  b.register("oven-door", odoor);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [0, 0, 15.3], { skin: "#c8c8c0", cloth: "#f0f0f0", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#f0f0f0", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#fff0d0", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#fff0d0", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#fff0d0", 0.5, 8, true);

  return {};
};
