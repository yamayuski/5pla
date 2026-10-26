import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜の校舎の音楽室。x=-5〜5, z=0〜12。グランドピアノは奥(z=10)、ピアノ椅子の位置に pianist。
 * 肖像画 portrait-0〜2 は壁(x=-4.9)。メトロノームは metronome。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#3a2e22");
  const wall = b.mat("#5c5a50");
  const black = b.mat("#0c0c0e");
  const wood = b.mat("#4a3a2a");

  b.box("floor", [10, 0.2, 12], [0, -0.1, 6], floor);
  b.box("ceil", [10, 0.2, 12], [0, 3.1, 6], wall);
  b.box("wall-w", [0.2, 3, 12], [-5, 1.5, 6], wall);
  b.box("wall-e", [0.2, 3, 12], [5, 1.5, 6], wall);
  b.box("wall-s", [10, 3, 0.2], [0, 1.5, -0.1], wall);
  b.box("wall-n", [10, 3, 0.2], [0, 1.5, 12.1], wall);
  // 机と椅子
  for (let r = 0; r < 3; r++) {
    for (const x of [-2.5, 0, 2.5]) {
      b.box(`desk-${r}-${x}`, [1.4, 0.75, 0.6], [x, 0.4, 2.5 + r * 1.8], wood);
    }
  }
  // ピアノ
  b.box("piano", [2.2, 1, 1.6], [0, 0.5, 11], black);
  b.box("piano-lid", [2.2, 0.1, 1.6], [0, 1.1, 11], black);
  b.box("piano-stool", [0.6, 0.5, 0.5], [0, 0.25, 9.6], wood);
  const metro = b.box("metronome", [0.2, 0.35, 0.15], [-3.2, 0.95, 5.2], wood);
  b.register("metronome", metro);
  b.box("metro-desk", [0.8, 0.75, 0.6], [-3.2, 0.375, 5.2], wood);

  b.lamp("room", [0, 2.8, 3], "#c8d8ff", 0.5, 9, false);
  b.lamp("room", [0, 2.8, 9], "#c8d8ff", 0.5, 9, false);
  for (let i = 0; i < 3; i++) {
    b.sign(
      `portrait-${i}`,
      [["バッハ", "ベートーヴェン", "シューベルト"][i] ?? "", "音楽室"],
      [1.1, 1.4],
      [-4.85, 1.9, 3 + i * 3],
      -Math.PI / 2,
      { bg: "#1a1612", fg: "#d8ccb0", glow: 0.15 },
    );
  }
  b.sign(
    "note",
    ["黒板", "夜の練習は禁止です"],
    [2.4, 1],
    [3, 1.8, 0.05],
    Math.PI,
    { bg: "#1c3a2c", fg: "#e8f0e0", glow: 0.25 },
  );

  const look = {
    skin: "#c8c8c0",
    hair: "#060606",
    cloth: "#e8e8e0",
    eyes: "#000000",
    height: 1.0,
  };
  const pianist = b.figure("pianist", [0, 0.1, 9.9], look, false);
  pianist.rotation.y = 0;
  b.figure("ghost", [0, 0, -40], look, false);

  let angry = false;
  let t = 0;
  return {
    update: (g, dt) => {
      const m = g.node("metronome");
      t += dt;
      if (m && !angry) {
        m.rotation.z = Math.sin(t * 4) * 0.15;
      }
      const p = g.node("pianist");
      if (angry && p) {
        const c = g.camera.position;
        p.rotation.y = Math.atan2(c.x - p.position.x, c.z - p.position.z);
      }
    },
    custom: {
      turnOn: () => {
        angry = true;
      },
    },
  };
};
