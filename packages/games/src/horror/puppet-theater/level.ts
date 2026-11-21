import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉館した人形劇場の客席と舞台。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 stage-curtain（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#5a3a3a");
  const wall = b.mat("#4a2828");
  const wood = b.mat("#3a2418");
  const accent = b.mat("#8a1a1a");
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

  b.box("seat-l0", [3, 0.8, 0.7], [-2.4, 0.4, 2.5], wood);
  b.box("seat-l1", [3, 0.8, 0.7], [-2.4, 0.4, 4.1], wood);
  b.box("seat-l2", [3, 0.8, 0.7], [-2.4, 0.4, 5.7], wood);
  b.box("seat-l3", [3, 0.8, 0.7], [-2.4, 0.4, 7.300000000000001], wood);
  b.box("seat-l4", [3, 0.8, 0.7], [-2.4, 0.4, 8.9], wood);
  b.box("seat-r0", [3, 0.8, 0.7], [2.4, 0.4, 2.5], wood);
  b.box("seat-r1", [3, 0.8, 0.7], [2.4, 0.4, 4.1], wood);
  b.box("seat-r2", [3, 0.8, 0.7], [2.4, 0.4, 5.7], wood);
  b.box("seat-r3", [3, 0.8, 0.7], [2.4, 0.4, 7.300000000000001], wood);
  b.box("seat-r4", [3, 0.8, 0.7], [2.4, 0.4, 8.9], wood);
  b.box("stage", [12, 0.6, 3.5], [0, 0.3, 14.2], wood);

  // 調べる対象
  const curtain = b.box("stage-curtain-cloth", [4, 2.4, 0.15], [0, 1.8, 12.6], accent, { collide: false });
  b.register("stage-curtain", curtain);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [0, 0.6, 15.4], { skin: "#c8c8c0", cloth: "#6a1a1a", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#6a1a1a", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#f0d8b0", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#f0d8b0", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#f0d8b0", 0.5, 8, true);

  return {};
};
