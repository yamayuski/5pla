import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 深夜の高速料金所の事務所。室内は x=-3〜3, z=0〜8（南が入口 front-door）。
 * 北側に精算窓口 window（z=6.5）、上に精算ボタン button（interact 対象）、背後に係員 clerk。
 * 西壁に記録票 log-new（最初は非表示）、隅に覗く人影 peeker。ゲートバー風の棒 suzu が揺れる（フック barSwing）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6a5038");
  const wall = b.mat("#8a6a48");
  const ceil = b.mat("#3a2a1c");
  const wood = b.mat("#4a2e18");
  const red = b.mat("#8a1a14");
  const invisible = b.mat("#000000");

  b.box("yard", [12, 0.2, 6], [0, -0.1, -3], b.mat("#1a1c18"));
  for (const [n, size, pos] of [
    ["edge-s", [12, 4, 0.2], [0, 2, -5.5]],
    ["edge-w", [0.2, 4, 6], [-6, 2, -3]],
    ["edge-e", [0.2, 4, 6], [6, 2, -3]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  b.room("office", [0, 0, 4], 6, 8, 2.8, { floor, wall, ceiling: ceil }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 2.8, [0, 1.1, 2.2], wall);
  b.door("front-door", [-0.55, 0, 0], 1.1, 2.2, 0, wood, { open: true, interactive: false });
  b.sign("notice", ["料金所事務所", "巡回点検中"], [1.3, 0.45], [1.5, 2.2, 0.12], 0, { bg: "#f0e4c8", fg: "#301010", glow: 0.25 });

  // 記録票掛け（西壁）
  for (let i = 0; i < 4; i++) {
    b.sign(`ema-${i}`, ["通行", "記録"], [0.35, 0.28], [-2.93, 1.6, 2 + i * 0.8], Math.PI / 2, { bg: "#c8a870", fg: "#301810", glow: 0.1 });
  }
  const emaNew = b.sign("log-new", ["通行記録", "あなたの車"], [0.7, 0.4], [-2.93, 1.4, 5.4], Math.PI / 2, { bg: "#d0b078", fg: "#8a0808", glow: 0.2 });
  emaNew.setEnabled(false);
  b.register("log-new", emaNew);

  // カウンター
  b.box("window", [3.2, 1.0, 0.8], [0, 0.5, 6.5], wood).isPickable = false;
  b.box("shelf-back", [3.4, 0.2, 0.5], [0, 1.9, 7.8], red).isPickable = false;
  const button = b.box("button", [0.22, 0.4, 0.22], [-0.4, 1.2, 6.45], b.mat("#c0a060"), { collide: false });
  b.register("button", button);
  b.sign("button-tag", ["精算", "ボタンを押してください"], [0.7, 0.3], [0.5, 1.5, 6.1], 0, { bg: "#f0e4c8", fg: "#301010", glow: 0.2 });

  // 天井の揺れもの
  const suzu = b.box("suzu", [0.2, 0.2, 0.2], [0, 2.3, 3.5], b.mat("#c8a030"), { collide: false });
  suzu.isPickable = false;
  b.register("suzu", suzu);

  const clerk = b.figure("clerk", [0, 0, 7.3], { skin: "#c0c4c0", cloth: "#f0f0f0", hair: "#050505", eyes: "#000000", longHair: true }, false);
  clerk.rotation.y = Math.PI;
  const peeker = b.figure("peeker", [2.3, 0, 7.4], { skin: "#b8bcb8", cloth: "#d0d0d0", hair: "#050505", eyes: "#000000", longHair: true, height: 0.6 }, false);
  peeker.rotation.y = Math.PI;

  b.lamp("office", [0, 2.6, 3], "#ffd890", 0.55, 8, true);
  b.lamp("office", [0, 2.6, 6], "#ffd890", 0.5, 7, true);
  b.lamp("window", [0, 2.0, 6.8], "#ff9860", 0.45, 4, true);

  let sw = -1;
  return {
    update: (g, dt) => {
      if (sw >= 0) {
        sw += dt;
        suzu.rotation.z = Math.sin(sw * 9) * Math.max(0, 0.6 - sw * 0.15);
        if (sw > 4) sw = -1;
      }
      void g;
    },
    custom: {
      barSwing: (g) => {
        sw = 0;
        g.audio?.play("bell", { x: 0, y: 2.3, z: 3.5 }, 0.8);
      },
    },
  };
};
