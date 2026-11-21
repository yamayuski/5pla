import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * マンション屋上の貯水槽室。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 tank-hatch（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#707470");
  const wall = b.mat("#808480");
  const wood = b.mat("#4a504c");
  const metal = b.mat("#8a9096", { specular: 0.6 });
  const accent = b.mat("#2a5a6a");
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

  b.box("pipe-w", [0.4, 0.4, 12], [-5.3, 1, 8], metal);
  b.box("pipe-e", [0.4, 0.4, 10], [5.3, 1, 6], metal);
  b.box("pump", [1.2, 1, 1.2], [3.5, 0.5, 5], accent);
  b.box("panel", [0.3, 1.6, 1.4], [-5.8, 1, 3], wood);

  // 調べる対象
  b.box("tank-body", [4, 2.4, 2], [0, 1.2, 15], b.mat("#506060"));
  const hatch = b.box("tank-hatch-lid", [0.9, 0.9, 0.08], [0, 1.2, 13.95], metal);
  b.register("tank-hatch", hatch);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [0, 0, 15.4], { skin: "#c8c8c0", cloth: "#304858", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#304858", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#e0ecec", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#e0ecec", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#e0ecec", 0.5, 8, true);

  return {};
};
