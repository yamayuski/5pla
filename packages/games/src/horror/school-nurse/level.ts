import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 夜の学校の保健室。室内は x=-3〜3, z=0〜8（南が入口 front-door）。
 * 北に机 desk（z=6.5）と来室記録 record（interact 対象）、背後のベッドに生徒 pupil。
 * 東壁に掲示 note-new（最初は非表示）、薬品棚の陰に覗く人影 peeker。カーテン curtain が揺れる（フック curtainSway）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#8a9088");
  const wall = b.mat("#b8c0b8");
  const ceil = b.mat("#8a908a");
  const white = b.mat("#d8dcd8");
  const metal = b.mat("#4a5250");
  const invisible = b.mat("#000000");

  b.box("yard", [12, 0.2, 6], [0, -0.1, -3], b.mat("#14181a"));
  for (const [n, size, pos] of [
    ["edge-s", [12, 4, 0.2], [0, 2, -5.5]],
    ["edge-w", [0.2, 4, 6], [-6, 2, -3]],
    ["edge-e", [0.2, 4, 6], [6, 2, -3]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  b.room("room", [0, 0, 4], 6, 8, 2.8, { floor, wall, ceiling: ceil }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 2.8, [0, 1.1, 2.2], wall);
  b.door("front-door", [-0.55, 0, 0], 1.1, 2.2, 0, b.mat("#6a7068"), { open: true, interactive: false });
  b.sign("notice", ["保健室", "ようこそ"], [1.3, 0.45], [1.5, 2.2, 0.12], 0, { bg: "#e8f0e8", fg: "#103020", glow: 0.25 });

  // 薬品棚（西壁）
  b.box("cabinet", [0.5, 1.8, 2.4], [-2.7, 0.9, 3], metal).isPickable = false;
  for (let i = 0; i < 3; i++) {
    b.sign(`label-${i}`, ["消毒", "薬"], [0.3, 0.2], [-2.43, 1.5, 2.2 + i * 0.8], Math.PI / 2, { bg: "#e0e8e0", fg: "#103020", glow: 0.1 });
  }

  // 掲示（東壁）
  const noteNew = b.sign("note-new", ["本日の来室者：1名", "（まだ帰っていません）"], [0.8, 0.45], [2.93, 1.5, 5.4], -Math.PI / 2, { bg: "#f0f0e0", fg: "#8a0808", glow: 0.2 });
  noteNew.setEnabled(false);
  b.register("note-new", noteNew);

  // 机と来室記録
  b.box("desk", [3.2, 0.9, 0.8], [0, 0.45, 6.5], b.mat("#6a5a48")).isPickable = false;
  const record = b.box("record", [0.4, 0.06, 0.3], [-0.4, 0.95, 6.3], b.mat("#e0d8c0"), { collide: false });
  b.register("record", record);
  b.sign("record-tag", ["来室記録", "氏名・時刻を記入"], [0.8, 0.3], [0.5, 1.4, 6.1], 0, { bg: "#e8f0e8", fg: "#103020", glow: 0.2 });

  // ベッドとカーテン
  b.box("bed", [1.4, 0.5, 2], [1.8, 0.25, 7], white).isPickable = false;
  const curtain = b.box("curtain", [1.6, 1.9, 0.05], [1.8, 1.4, 5.9], b.mat("#d0e0d8"), { collide: false });
  curtain.isPickable = false;
  b.register("curtain", curtain);

  const pupil = b.figure("pupil", [-0.2, 0.5, 7.4], { skin: "#b8c0b8", cloth: "#e8e8f0", hair: "#050505", eyes: "#000000", longHair: true, height: 0.85 }, false);
  pupil.rotation.y = Math.PI;
  const peeker = b.figure("peeker", [-2.1, 0, 5.2], { skin: "#b8bcb8", cloth: "#d0d0d8", hair: "#050505", eyes: "#000000", longHair: false, height: 0.6 }, false);
  peeker.rotation.y = Math.PI / 2;

  b.lamp("room", [0, 2.6, 3], "#d8ffe8", 0.55, 8, true);
  b.lamp("room", [0, 2.6, 6], "#d8ffe8", 0.5, 7, true);
  b.lamp("bed", [0, 1.9, 6.6], "#ffe8b0", 0.45, 4, true);

  let sw = -1;
  return {
    update: (g, dt) => {
      if (sw >= 0) {
        sw += dt;
        curtain.rotation.z = Math.sin(sw * 4) * Math.max(0, 0.15 - sw * 0.03);
        if (sw > 5) sw = -1;
      }
      void g;
    },
    custom: {
      curtainSway: (g) => {
        sw = 0;
        g.audio?.play("rattle", { x: 1.8, y: 1.4, z: 5.9 }, 0.6);
      },
    },
  };
};
