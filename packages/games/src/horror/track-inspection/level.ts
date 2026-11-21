import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 地下鉄の保線用通路。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door。
 * 調べる対象 signal-box（z≈15）の背後に人影 figure（普段は非表示）、気配用の人影 behind。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6a6a68");
  const wall = b.mat("#7a7a78");
  const wood = b.mat("#4a4a48");
  const metal = b.mat("#8a9096", { specular: 0.6 });
  const accent = b.mat("#c0a020");
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

  b.box("cable-tray", [0.4, 0.4, 14], [-5.4, 2.2, 8], metal);
  b.box("locker", [0.8, 2, 0.6], [5.5, 1, 5], wood);
  b.box("cart", [1.2, 0.8, 2], [-3.5, 0.4, 7], metal);
  b.box("barrier", [3, 0.9, 0.2], [3, 0.45, 9], accent);

  // 調べる対象
  b.box("signal-post", [0.6, 2.0, 0.6], [3.6, 1.0, 14.6], b.mat("#303030"));
  const sbox = b.box("signal-box-door", [0.7, 0.9, 0.1], [3.6, 1.2, 14.25], accent);
  b.register("signal-box", sbox);

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure("figure", [3.6, 0, 15.4], { skin: "#c8c8c0", cloth: "#c08020", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = Math.PI;
  b.figure("behind", [0, 0, 10], { skin: "#c8c8c0", cloth: "#c08020", hair: "#050505", eyes: "#000000", longHair: true }, false).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#e0e8f0", 0.7, 10, true);
  b.lamp("back", [0, 2.8, 11], "#e0e8f0", 0.7, 10, true);
  b.lamp("back", [3, 2.8, 14], "#e0e8f0", 0.5, 8, true);

  return {};
};
