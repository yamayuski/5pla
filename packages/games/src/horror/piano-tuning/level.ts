import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉館後の音楽ホールの舞台袖。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 piano-lid（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#503a30");
  const wall = b.mat("#6a4e42");
  const wood = b.mat("#2a1a14");
  const metal = b.mat("#8a9096", { specular: 0.6 });
  const accent = b.mat("#803030");
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

  b.box("chair-l", [0.6, 0.5, 0.6], [-4, 0.25, 5], wood);
  b.box("stand", [0.5, 1.2, 0.5], [4.5, 0.6, 6], metal);
  b.box("curtain-l", [0.3, 3, 5], [-5.8, 1.5, 10], accent);
  b.box("curtain-r", [0.3, 3, 5], [5.8, 1.5, 10], accent);

  // 調べる対象
  b.box("piano-body", [3, 1.0, 2], [0, 0.5, 15], b.mat("#101010", { specular: 0.8 }));
  const lid = b.box("piano-lid-top", [2.8, 0.1, 1.8], [0, 1.05, 14.6], b.mat("#181818", { specular: 0.8 }));
  b.register("piano-lid", lid);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [0, 0, 15.4], { skin: "#c8c8c0", cloth: "#303030", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#303030", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#f0d0a0", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#f0d0a0", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#f0d0a0", 0.5, 8, true);

  return {};
};
