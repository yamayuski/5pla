import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/** 夜の田舎道。x=-3〜3, z=0〜40。畑の中のかかし sc1〜sc3 が少しずつ道へ近づく。 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const road = b.mat("#2a2820");
  const field = b.mat("#1a2414");
  const wall = b.mat("#0a0c0a");
  b.box("road", [6, 0.2, 42], [0, -0.1, 20], road);
  b.box("field-w", [30, 0.2, 42], [-18, -0.15, 20], field);
  b.box("field-e", [30, 0.2, 42], [18, -0.15, 20], field);
  b.box("fence-w", [0.2, 4, 42], [-30, 2, 20], wall);
  b.box("fence-e", [0.2, 4, 42], [30, 2, 20], wall);
  b.box("end-s", [60, 4, 0.2], [0, 2, -1], wall);
  b.box("end-n", [60, 4, 0.2], [0, 2, 42], wall);
  b.box("sky", [60, 0.2, 42], [0, 4, 20], wall);
  // 道端の電柱灯
  b.lamp("road", [0, 3, 6], "#ffd890", 0.6, 10, false);
  b.lamp("road", [0, 3, 22], "#ffd890", 0.5, 10, false);
  b.sign(
    "sign",
    ["この先", "行き止まり"],
    [1.4, 0.8],
    [2.6, 1.4, 30],
    Math.PI / 2 + Math.PI,
    {
      bg: "#2a2a20",
      fg: "#e8e0c0",
      glow: 0.2,
    },
  );
  const look = {
    skin: "#b8a070",
    hair: "#7a6a30",
    cloth: "#4a3a22",
    eyes: "#000000",
    height: 1.7,
  };
  const spots: [string, number, number][] = [
    ["sc1", -6, 14],
    ["sc2", 4.5, 22],
    ["sc3", -3.5, 30],
  ];
  for (const [n, x, z] of spots) {
    const f = b.figure(n, [x, 0, z], look, false);
    f.rotation.y = Math.PI;
  }
  b.figure("ghost", [0, 0, -40], look, false);
  let t = 0;
  return {
    update: (g, dt) => {
      t += dt;
      const c = g.camera.position;
      for (const [n] of spots) {
        const p = g.node(n);
        if (p && t > 200)
          p.rotation.y = Math.atan2(c.x - p.position.x, c.z - p.position.z);
      }
    },
    custom: { none: () => {} },
  };
};
