import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉店後の質屋。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 safe（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6a5a48");
  const wall = b.mat("#8a7a62");
  const wood = b.mat("#3a2a1c");
  const accent = b.mat("#a08030");
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

  b.box("case-l", [0.8, 1.0, 6], [-4.5, 0.5, 7], wood);
  b.box("case-r", [0.8, 1.0, 6], [4.5, 0.5, 7], wood);
  b.box("counter", [4, 1.0, 0.7], [0, 0.5, 5], wood);
  b.box("shelf", [0.5, 2.2, 4], [-5.7, 1.1, 13], wood);

  // 調べる対象
  b.box("safe-body", [1.4, 1.6, 1.2], [3.6, 0.8, 15], b.mat("#303438", { specular: 0.5 }));
  const sdoor = b.box("safe-door", [1.0, 1.2, 0.1], [3.6, 0.8, 14.35], accent);
  b.register("safe", sdoor);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [3.6, 0, 15.4], { skin: "#c8c8c0", cloth: "#4a3828", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#4a3828", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#f0d8a0", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#f0d8a0", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#f0d8a0", 0.5, 8, true);

  return {};
};
