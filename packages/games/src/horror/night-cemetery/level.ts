import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜の寺の墓地。参道は x=-1.5〜1.5, z=0〜32、入口の門(cemetery-gate)は z=0。左右(x=±3.2)に墓石が z=6〜27 に並び、
 * 突き当たり z≈30 が自分の家の墓(family-grave)。tomb-a(家名) と tomb-b(赤い字) は文字板のグループで、途中で差し替わる。
 * mound は家の墓の前の盛り土。risen はその下から這い上がる女。
 */
const ZS = [6, 9, 12, 15, 18, 21, 24, 27];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const gravel = b.mat("#3a3a38");
  const grass = b.mat("#1c2a1c");
  const stone = b.mat("#6a6c6e");
  const lanternMat = b.mat("#8a8c8e");
  const glow = b.mat("#ffb060", { emissive: "#c06820" });
  const soil = b.mat("#2a1c14");
  const wallMat = b.mat("#4a4a48");
  const handMat = b.mat("#d8d4cc", { emissive: "#383430" });

  // ---- 参道と周囲 ----
  b.box("path", [3, 0.2, 34], [0, -0.1, 16], gravel);
  b.box("grass-w", [14, 0.2, 34], [-8.5, -0.1, 16], grass, { collide: false });
  b.box("grass-e", [14, 0.2, 34], [8.5, -0.1, 16], grass, { collide: false });
  for (const [n, size, pos] of [
    ["fence-w", [0.2, 4, 34], [-1.7, 2, 16]],
    ["fence-e", [0.2, 4, 34], [1.7, 2, 16]],
    ["fence-n", [3.4, 4, 0.2], [0, 2, 33]],
  ] as const) {
    b.box(n, size, pos, wallMat).isVisible = false;
  }
  b.wallWithGap("gate-wall", "x", [0, 0, 0], 3.4, 2.4, [0, 1.6, 2.0], wallMat);
  b.door(
    "cemetery-gate",
    [-0.8, 0, 0],
    1.6,
    2.0,
    0,
    b.mat("#2a2a2c", { specular: 0.4 }),
    {
      open: true,
      interactive: false,
    },
  );
  b.box("outside", [3.4, 0.2, 3], [0, -0.1, -1.5], gravel);
  b.box("outside-s", [3.4, 4, 0.2], [0, 2, -3], wallMat).isVisible = false;
  b.sign(
    "temple",
    ["〇〇寺 墓地", "夜間参拝 ご遠慮ください"],
    [1.4, 0.5],
    [0, 2.1, 0.12],
    0,
    {
      bg: "#e8e0c8",
      fg: "#201810",
      glow: 0.25,
    },
  );

  // ---- 墓石と文字板 ----
  const tombA = new TransformNode("tomb-a", b.scene);
  const tombB = new TransformNode("tomb-b", b.scene);
  for (const [i, z] of ZS.entries()) {
    for (const side of [-1, 1]) {
      const x = side * 3.2;
      b.box(`tomb-${side}-${i}`, [0.5, 1.0, 0.7], [x, 0.5, z], stone);
      b.box(`tomb-base-${side}-${i}`, [0.9, 0.2, 1.1], [x, 0.1, z], stone, {
        collide: false,
      });
      const rot = side < 0 ? -Math.PI / 2 : Math.PI / 2;
      const a = b.sign(
        `name-a-${side}-${i}`,
        ["山田家", "之墓"],
        [0.4, 0.5],
        [x - side * 0.27, 0.6, z],
        rot,
        {
          bg: "#585a5c",
          fg: "#d0d0c8",
          glow: 0.25,
        },
      );
      a.parent = tombA;
      const r = b.sign(
        `name-b-${side}-${i}`,
        ["ここに", "おいで"],
        [0.4, 0.5],
        [x - side * 0.28, 0.6, z],
        rot,
        {
          bg: "#200808",
          fg: "#e82020",
          glow: 0.5,
        },
      );
      r.parent = tombB;
    }
  }
  tombB.setEnabled(false);
  b.register("tomb-a", tombA);
  b.register("tomb-b", tombB);

  // ---- 石灯籠 ----
  for (const [i, z, grp] of [
    [0, 8, "lantern-a"],
    [1, 14, "lantern-a"],
    [2, 20, "lantern-b"],
    [3, 26, "lantern-b"],
  ] as const) {
    const x = i % 2 === 0 ? -1.3 : 1.3;
    b.box(`lantern-base-${i}`, [0.3, 0.9, 0.3], [x, 0.45, z], lanternMat, {
      collide: false,
    });
    b.box(`lantern-lit-${i}`, [0.28, 0.28, 0.28], [x, 1.05, z], glow, {
      collide: false,
    });
    b.box(`lantern-roof-${i}`, [0.5, 0.12, 0.5], [x, 1.3, z], lanternMat, {
      collide: false,
    });
    b.lamp(grp, [x, 1.1, z], "#ffa850", 0.55, 8, false);
  }

  // ---- 家の墓（突き当たり） ----
  b.box("family-base", [2.2, 0.3, 1.6], [0, 0.15, 30.4], stone);
  const fam = b.box("family-grave", [1.2, 1.4, 0.4], [0, 1.0, 30.6], stone);
  b.register("family-grave", fam);
  b.sign(
    "family-name",
    ["山田家", "之墓"],
    [0.7, 0.9],
    [0, 1.1, 30.38],
    Math.PI,
    {
      bg: "#585a5c",
      fg: "#d8d8d0",
      glow: 0.3,
    },
  );

  // ---- 盛り土、土から出る手、這い上がる女 ----
  const mound = new TransformNode("mound", b.scene);
  b.box("mound-body", [1.6, 0.3, 2.2], [0, 0.15, 28.3], soil, {
    collide: false,
    parent: mound,
  });
  mound.setEnabled(false);
  b.register("mound", mound);
  const hand = new TransformNode("hand-soil", b.scene);
  b.box("hand-palm", [0.12, 0.05, 0.14], [-3.2, 0.12, 15], handMat, {
    collide: false,
    parent: hand,
  });
  for (let f = 0; f < 5; f++) {
    b.box(
      `hand-f${f}`,
      [0.025, 0.28, 0.025],
      [-3.26 + f * 0.03, 0.26, 15],
      handMat,
      { collide: false, parent: hand },
    );
  }
  hand.setEnabled(false);
  b.register("hand-soil", hand);
  b.figure(
    "risen",
    [0, -1.3, 28.3],
    {
      skin: "#a8aca8",
      hair: "#06080a",
      cloth: "#e8ecec",
      eyes: "#000000",
      height: 1.04,
      longHair: true,
    },
    false,
  ).rotation.y = Math.PI;
  return {};
};
