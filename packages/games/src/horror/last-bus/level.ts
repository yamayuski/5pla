import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 終バスの待合所。室内は x=-3〜3, z=0〜8（南が入口 front-door）。
 * 北に広場 desk、奥のろうそく ticket（interact 対象）、背後に白い女 patient、雪壁の端に覗く影 peeker。
 * 西壁に立て札 board-new（最初は非表示）。天井の雪洞が揺れる（フック lampSwing）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#c8d0d8");
  const wall = b.mat("#e8eef4");
  const ceil = b.mat("#10182a");
  const bench = b.mat("#2a4a58");
  const desk = b.mat("#6a5a48");
  const invisible = b.mat("#000000");

  b.box("yard", [12, 0.2, 6], [0, -0.1, -3], b.mat("#14181a"));
  for (const [n, size, pos] of [
    ["edge-s", [12, 4, 0.2], [0, 2, -5.5]],
    ["edge-w", [0.2, 4, 6], [-6, 2, -3]],
    ["edge-e", [0.2, 4, 6], [6, 2, -3]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  b.room("hall", [0, 0, 4], 6, 8, 2.8, { floor, wall, ceiling: ceil }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 2.8, [0, 1.1, 2.2], wall);
  b.door("front-door", [-0.55, 0, 0], 1.1, 2.2, 0, desk, { open: true, interactive: false });
  b.sign("notice", ["バスのりば", "終バス 23:40"], [1.6, 0.45], [1.5, 2.2, 0.12], 0, { bg: "#f0f4e8", fg: "#103020", glow: 0.25 });

  // ベンチ
  for (let i = 0; i < 3; i++) {
    b.box(`bench-w${i}`, [0.6, 0.45, 1.6], [-2.4, 0.22, 2 + i * 1.8], bench).isPickable = false;
    b.box(`bench-e${i}`, [0.6, 0.45, 1.6], [2.4, 0.22, 2 + i * 1.8], bench).isPickable = false;
  }
  for (let i = 0; i < 4; i++) {
    b.sign(`poster-${i}`, ["お願い", "譲り合い"], [0.35, 0.28], [-2.93, 1.7, 2 + i * 0.8], Math.PI / 2, { bg: "#d8e0d0", fg: "#203020", glow: 0.1 });
  }
  const boardNew = b.sign("board-new", ["時刻表", "最終 あなた行き"], [0.8, 0.4], [-2.93, 1.4, 5.4], Math.PI / 2, { bg: "#101810", fg: "#d02020", glow: 0.35 });
  boardNew.setEnabled(false);
  b.register("board-new", boardNew);

  b.box("desk", [3.2, 1.0, 0.8], [0, 0.5, 6.5], desk).isPickable = false;
  b.box("shelf-back", [3.4, 0.2, 0.5], [0, 1.9, 7.8], b.mat("#304038")).isPickable = false;
  const ticket = b.box("ticket", [0.25, 0.4, 0.25], [-0.4, 1.2, 6.45], b.mat("#c8c8c0"), { collide: false });
  b.register("ticket", ticket);
  b.sign("ticket-tag", ["最終バス", "時刻表をご覧ください"], [0.8, 0.3], [0.5, 1.5, 6.1], 0, { bg: "#f0f4e8", fg: "#103020", glow: 0.2 });

  const lampBox = b.box("lampbox", [0.2, 0.2, 0.2], [0, 2.3, 3.5], b.mat("#d8e8c0"), { collide: false });
  lampBox.isPickable = false;
  b.register("lampbox", lampBox);

  const patient = b.figure("patient", [0, 0, 7.3], { skin: "#c0c4c0", cloth: "#d8e0e8", hair: "#050505", eyes: "#000000", longHair: true }, false);
  patient.rotation.y = Math.PI;
  const peeker = b.figure("peeker", [2.3, 0, 7.4], { skin: "#b8bcb8", cloth: "#c8d0d8", hair: "#050505", eyes: "#000000", longHair: true, height: 0.6 }, false);
  peeker.rotation.y = Math.PI;

  b.lamp("hall", [0, 2.6, 3], "#e0f0d0", 0.55, 8, true);
  b.lamp("hall", [0, 2.6, 6], "#e0f0d0", 0.5, 7, true);
  b.lamp("desk", [0, 2.0, 6.8], "#a0ffc0", 0.45, 4, true);

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
        g.audio?.play("bell", { x: 0, y: 2.3, z: 3.5 }, 0.8);
      },
    },
  };
};
