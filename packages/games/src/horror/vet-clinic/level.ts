import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 夜間の動物病院。敷地は x=-6〜6, z=0〜16。南(z=0)が入口扉 entry-door、z=8 に処置室へ続く扉 ward-door。
 * 奥(z=9〜16)は入院室でケージが並ぶ。最奥ケージ cage-last（x=3.5, z=15）に人影 patient（普段は非表示）。
 * フック：なし（すべて config のデータで駆動）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#c8c8c0");
  const wall = b.mat("#a8b0a8");
  const wood = b.mat("#6a5a48");
  const steel = b.mat("#8a9096", { specular: 0.6 });
  const dark = b.mat("#1a1a1c");
  const invisible = b.mat("#000000");

  b.box("ground", [12, 0.2, 16], [0, -0.1, 8], floor);
  b.box("ceiling", [12, 0.2, 16], [0, 3.1, 8], wall, { collide: false });
  b.box("wall-w", [0.2, 3, 16], [-6, 1.5, 8], wall);
  b.box("wall-e", [0.2, 3, 16], [6, 1.5, 8], wall);
  b.box("wall-s-l", [4.9, 3, 0.2], [-3.55, 1.5, 0], wall);
  b.box("wall-s-r", [4.9, 3, 0.2], [3.55, 1.5, 0], wall);
  b.box("wall-n", [12, 3, 0.2], [0, 1.5, 16], wall);
  b.box("wall-mid-l", [4.9, 3, 0.2], [-3.55, 1.5, 8], wall);
  b.box("wall-mid-r", [4.9, 3, 0.2], [3.55, 1.5, 8], wall);

  b.door("entry-door", [-1.1, 0, 0], 2.2, 2.4, Math.PI / 2, b.mat("#4a4a52"), {
    open: true,
    interactive: false,
  });
  b.door("ward-door", [-1.1, 0, 8], 2.2, 2.4, Math.PI / 2, b.mat("#5a5a62"), {
    open: false,
    interactive: false,
  });

  // 受付
  b.box("counter", [3.4, 1.0, 0.7], [-2.5, 0.5, 4.5], wood);
  b.box("bench", [2.4, 0.45, 0.6], [3.5, 0.22, 1.2], wood);
  b.sign("poster", ["フィラリア予防", "毎月 1 回 忘れずに"], [1.8, 0.8], [4.8, 1.8, 0.2], Math.PI, {
    bg: "#e8e8d8",
    fg: "#204020",
    glow: 0.15,
  });
  b.sign("board", ["本日の入院", "さくら  ポチ  ココ", "・・・ 4 ・・・"], [2.2, 1.0], [5.9, 1.8, 5], Math.PI / -2, {
    bg: "#f0f0e8",
    fg: "#101010",
    glow: 0.15,
  });

  // 入院室のケージ（左右の壁沿い）
  const cageMat = b.mat("#6a7078", { specular: 0.5 });
  for (let i = 0; i < 4; i++) {
    const z = 9.8 + i * 1.5;
    b.box(`cage-l${i}`, [1.2, 1.1, 1.1], [-5.2, 0.55, z], cageMat);
    if (i < 3) {
      b.box(`cage-r${i}`, [1.2, 1.1, 1.1], [5.2, 0.55, z], cageMat);
    }
  }
  b.box("cage-r-last", [1.2, 1.1, 1.1], [4.8, 0.55, 15], dark);
  b.box("table", [1.6, 0.9, 0.8], [0, 0.45, 12], steel);

  // 最奥ケージの扉（調べる対象）
  const lastDoor = b.box("cage-last-door", [0.9, 0.9, 0.08], [4.8, 0.6, 14.4], steel);
  b.register("cage-last", lastDoor);
  b.box("cage-name", [0.4, 0.2, 0.02], [4.8, 1.3, 14.43], b.mat("#e8e8d8"), { collide: false }).isPickable = false;

  // 壁の見えない境界
  b.box("edge", [12, 4, 0.2], [0, 2, -0.3], invisible).isVisible = false;

  // 人影
  b.figure(
    "patient",
    [4.8, 0, 14.7],
    { skin: "#c8c8c0", cloth: "#d0d8d0", hair: "#050505", eyes: "#000000", longHair: true },
    false,
  ).rotation.y = Math.PI;
  b.figure(
    "behind",
    [0, 0, 10],
    { skin: "#c8c8c0", cloth: "#d0d8d0", hair: "#050505", eyes: "#000000", longHair: true },
    false,
  ).rotation.y = 0;

  b.lamp("front", [0, 2.8, 3], "#f0f4e8", 0.7, 10, true);
  b.lamp("ward", [0, 2.8, 11], "#e8f0e8", 0.7, 10, true);
  b.lamp("ward", [3, 2.8, 14], "#e8f0e8", 0.5, 8, true);

  return {};
};
