import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 夜の古い教会の礼拝堂。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 confession-door（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6a6258");
  const wall = b.mat("#8a8478");
  const wood = b.mat("#3a2a1e");
  const dark = b.mat("#1a1a1c");
  const accent = b.mat("#4a2a20");
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

  b.box("pew-l0", [3, 0.5, 0.6], [-2.4, 0.25, 3.0], wood);
  b.box("pew-l1", [3, 0.5, 0.6], [-2.4, 0.25, 4.8], wood);
  b.box("pew-l2", [3, 0.5, 0.6], [-2.4, 0.25, 6.6], wood);
  b.box("pew-l3", [3, 0.5, 0.6], [-2.4, 0.25, 8.4], wood);
  b.box("pew-r0", [3, 0.5, 0.6], [2.4, 0.25, 3.0], wood);
  b.box("pew-r1", [3, 0.5, 0.6], [2.4, 0.25, 4.8], wood);
  b.box("pew-r2", [3, 0.5, 0.6], [2.4, 0.25, 6.6], wood);
  b.box("pew-r3", [3, 0.5, 0.6], [2.4, 0.25, 8.4], wood);
  b.box("altar", [3, 1.0, 0.8], [-2.5, 0.5, 15.4], dark);

  // 調べる対象
  b.box("confession-box", [1.8, 2.4, 1.6], [4.6, 1.2, 15.1], b.mat("#2a1c14"));
  const cdoor = b.box("confession-door-panel", [0.9, 2.0, 0.08], [4.6, 1.0, 14.25], accent);
  b.register("confession-door", cdoor);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [4.6, 0, 15.3], { skin: "#c8c8c0", cloth: "#1a1a1c", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#1a1a1c", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#e8d8b0", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#e8d8b0", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#e8d8b0", 0.5, 8, true);

  return {};
};
