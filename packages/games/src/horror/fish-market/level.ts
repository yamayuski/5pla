import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 夜明け前の魚市場。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 ice-pile（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#7a8890");
  const wall = b.mat("#a0aab0");
  const wood = b.mat("#5a6068");
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

  b.box("crate0", [1, 0.5, 0.6], [-4.0, 0.25, 4.0], wood);
  b.box("crate1", [1, 0.5, 0.6], [-2.7, 0.25, 5.5], wood);
  b.box("crate2", [1, 0.5, 0.6], [-1.4, 0.25, 4.0], wood);
  b.box("crate3", [1, 0.5, 0.6], [-0.09999999999999964, 0.25, 5.5], wood);
  b.box("crate4", [1, 0.5, 0.6], [1.2000000000000002, 0.25, 4.0], wood);
  b.box("crate5", [1, 0.5, 0.6], [2.5, 0.25, 5.5], wood);
  b.box("scale", [1.2, 1, 0.8], [4.5, 0.5, 6], metal);
  b.box("pillar", [0.5, 3, 0.5], [-2, 1.5, 10], metal);

  // 調べる対象
  const ice = b.box("ice-pile-body", [2.6, 1.4, 1.6], [0, 0.7, 14.4], b.mat("#c8e0f0", { specular: 0.7 }));
  b.register("ice-pile", ice);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [0, 0, 15.4], { skin: "#c8c8c0", cloth: "#2a4a30", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#2a4a30", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#e8f0f8", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#e8f0f8", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#e8f0f8", 0.5, 8, true);

  return {};
};
