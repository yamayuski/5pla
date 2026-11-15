import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉店後の駅ビルの吹き抜け。x=-3〜3, z=0〜12（南が入口 shutter、北に止まったエスカレーター）。
 * 奥の人影 rider（lookAway 対象）、背後に回る女 behind、案内板 board-new（最初は非表示）。
 * 照明 group hall。天井の案内灯が揺れる（フック lampSwing）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#8a8a86");
  const wall = b.mat("#b8b6ae");
  const ceil = b.mat("#101418");
  const steel = b.mat("#303438");
  const rubber = b.mat("#101010");
  const invisible = b.mat("#000000");

  b.box("outside", [12, 0.2, 6], [0, -0.1, -3], b.mat("#14181a"));
  for (const [n, size, pos] of [
    ["edge-s", [12, 4, 0.2], [0, 2, -5.5]],
    ["edge-w", [0.2, 4, 6], [-6, 2, -3]],
    ["edge-e", [0.2, 4, 6], [6, 2, -3]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  b.room("hall", [0, 0, 6], 6, 12, 3.2, { floor, wall, ceiling: ceil }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 3.2, [0, 1.1, 2.2], wall);
  b.door("shutter", [-0.55, 0, 0], 1.1, 2.2, 0, steel, { open: true, interactive: false });
  b.sign("closed", ["本日の営業は", "終了しました"], [1.6, 0.45], [1.5, 2.3, 0.12], 0, { bg: "#e8e8e0", fg: "#202020", glow: 0.2 });

  // 止まったエスカレーター（奥）
  for (const x of [-1.1, 1.1]) {
    b.box(`esc-${x}`, [1.0, 0.5, 4], [x, 0.25, 10], steel).isPickable = false;
    b.box(`rail-${x}`, [0.1, 0.9, 4], [x * 1.45, 0.95, 10], rubber).isPickable = false;
  }
  b.sign("esc-sign", ["故障中", "ご利用になれません"], [1.2, 0.4], [0, 1.6, 8.1], Math.PI, { bg: "#f0d020", fg: "#101010", glow: 0.3 });
  for (let i = 0; i < 3; i++) {
    b.box(`bench-${i}`, [1.6, 0.45, 0.6], [-2.3, 0.22, 3 + i * 2.2], b.mat("#4a3a2a")).isPickable = false;
    b.sign(`ad-${i}`, ["SALE", "最終日"], [0.8, 0.5], [2.93, 1.7, 3 + i * 2.2], -Math.PI / 2, { bg: "#c02020", fg: "#f0f0f0", glow: 0.2 });
  }
  const boardNew = b.sign("board-new", ["フロアガイド", "6F 人のいないフロア"], [1.0, 0.4], [-2.93, 1.5, 6.5], Math.PI / 2, { bg: "#101010", fg: "#d02020", glow: 0.35 });
  boardNew.setEnabled(false);
  b.register("board-new", boardNew);

  const lampBox = b.box("lampbox", [0.3, 0.2, 0.3], [0, 2.9, 5], b.mat("#d8e8c0"), { collide: false });
  lampBox.isPickable = false;
  b.register("lampbox", lampBox);

  const rider = b.figure("rider", [0, 0.5, 11.5], { skin: "#b8bcb8", cloth: "#202830", hair: "#050505", eyes: "#000000", longHair: true }, false);
  rider.rotation.y = Math.PI;
  const behind = b.figure("behind", [0, 0, 1.2], { skin: "#c0c4c0", cloth: "#d8e0e8", hair: "#050505", eyes: "#000000", longHair: true }, false);

  b.lamp("hall", [0, 3.0, 3], "#e0f0d0", 0.5, 8, true);
  b.lamp("hall", [0, 3.0, 7], "#e0f0d0", 0.5, 8, true);
  b.lamp("hall", [0, 3.0, 10], "#a0c0ff", 0.4, 6, true);

  let sw = -1;
  return {
    update: (g, dt) => {
      if (sw >= 0) {
        sw += dt;
        lampBox.rotation.z = Math.sin(sw * 9) * Math.max(0, 0.6 - sw * 0.15);
        if (sw > 4) sw = -1;
      }
      void g;
    },
    custom: {
      lampSwing: (g) => {
        sw = 0;
        g.audio?.play("bell", { x: 0, y: 2.9, z: 5 }, 0.8);
      },
    },
  };
};
