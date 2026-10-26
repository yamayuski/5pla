import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 雪山の避難小屋。小屋は x=-4〜4, z=0〜8、南壁（z=0）中央に戸。
 * 西壁沿いに二段ベッド、北西に薪ストーブ、東壁に窓、中央にテーブル、棚に無線機。
 * 足跡は戸（0,0.4）からストーブ（-3,5）へ続く。
 */
const PRINTS: [number, number][] = [
  [0.1, 0.6],
  [-0.2, 1.1],
  [0.1, 1.6],
  [-0.4, 2.2],
  [-0.8, 2.7],
  [-1.2, 3.2],
  [-1.6, 3.7],
  [-2.0, 4.1],
  [-2.4, 4.6],
  [-2.7, 5.0],
];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const plank = b.mat("#6a4a2e");
  const wall = b.mat("#7a5a3a");
  const ceiling = b.mat("#4a3420");
  const iron = b.mat("#2a2a2c", { specular: 0.4 });
  const frost = b.mat("#bcd4e4", { emissive: "#28384a", alpha: 0.9 });
  const snow = b.mat("#dfe8f0", { emissive: "#303a44" });
  const wet = b.mat("#14181c", { emissive: "#04060a" });
  const blanket = b.mat("#6a2a2a");

  b.room("lodge", [0, 0, 4], 8, 8, 3, { floor: plank, wall, ceiling }, ["s"]);
  // 南壁と戸
  b.wallWithGap("front", "x", [0, 0, 0], 8, 3, [0, 1.1, 2.1], wall);
  b.door("cabin-door", [-0.55, 0, 0], 1.1, 2.1, 0, b.mat("#4a3322"), {
    open: true,
    interactive: false,
  });
  // 戸の外：雪の吹き溜まりと柵（歩き出せない）
  b.box("porch", [8, 0.2, 5], [0, -0.1, -2.5], snow);
  for (const [n, size, pos] of [
    ["fence-s", [8, 4, 0.2], [0, 2, -5]],
    ["fence-w", [0.2, 4, 5], [-4, 2, -2.5]],
    ["fence-e", [0.2, 4, 5], [4, 2, -2.5]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }

  // 二段ベッド（西壁）
  for (const z of [6.2, 3.4]) {
    b.box(`bunk-low-${z}`, [1, 0.3, 2.2], [-3.4, 0.45, z], plank);
    b.box(`bunk-up-${z}`, [1, 0.3, 2.2], [-3.4, 1.5, z], plank, {
      collide: false,
    });
    b.box(`bunk-blanket-${z}`, [0.9, 0.12, 1.6], [-3.4, 0.66, z], blanket, {
      collide: false,
    });
    b.box(`bunk-post-${z}`, [0.1, 1.7, 0.1], [-2.9, 0.85, z - 1.05], plank);
  }
  // 薪の山（南西）
  const wood = b.box(
    "woodpile",
    [0.9, 0.8, 0.5],
    [-3.2, 0.4, 1.0],
    b.mat("#8a6238"),
  );
  b.register("woodpile", wood);
  // 薪ストーブ
  const stove = b.box("stove", [0.8, 1.0, 0.7], [0.0, 0.5, 7.4], iron);
  b.register("stove", stove);
  b.cylinder("stove-pipe", 2.2, 0.18, [0, 1.9, 7.5], iron, { collide: false });
  b.box(
    "stove-glow",
    [0.4, 0.3, 0.02],
    [0, 0.5, 7.04],
    b.mat("#ff7a20", { emissive: "#a03c00" }),
    { collide: false },
  );
  // テーブルと椅子
  b.box("table", [1.8, 0.1, 0.9], [1.6, 0.8, 4.4], plank);
  for (const [x, z] of [
    [0.9, 3.9],
    [2.3, 3.9],
    [0.9, 4.9],
    [2.3, 4.9],
  ] as const) {
    b.box(`leg-${x}-${z}`, [0.08, 0.8, 0.08], [x, 0.4, z], plank, {
      collide: false,
    });
  }
  b.box("chair-far", [0.5, 0.45, 0.5], [1.6, 0.23, 5.4], plank);
  b.box("chair-back", [0.5, 0.5, 0.06], [1.6, 0.7, 5.65], plank, {
    collide: false,
  });
  // 棚と無線機
  b.box("shelf", [0.4, 0.06, 1.6], [3.7, 1.5, 1.6], plank, { collide: false });
  const radio = b.box("radio", [0.3, 0.2, 0.2], [3.65, 1.63, 1.6], iron, {
    collide: false,
  });
  b.register("radio", radio);
  // 東の窓と霜の手形
  b.box("window-e", [0.05, 1, 1.4], [3.93, 1.7, 4.2], frost, {
    collide: false,
  });
  const hand = new TransformNode("win-hand", b.scene);
  hand.position.set(3.88, 1.6, 4.2);
  hand.rotation.y = -Math.PI / 2;
  const handMat = b.mat("#f4f8ff", { emissive: "#8090a0" });
  b.box("win-hand-palm", [0.13, 0.14, 0.01], [0, 0, 0], handMat, {
    collide: false,
    parent: hand,
  });
  for (let f = 0; f < 4; f++) {
    b.box(
      `win-hand-f${f}`,
      [0.025, 0.1, 0.01],
      [-0.05 + f * 0.034, 0.12, 0],
      handMat,
      {
        collide: false,
        parent: hand,
      },
    );
  }
  hand.setEnabled(false);
  b.register("win-hand", hand);
  b.sign(
    "rules",
    ["避難小屋", "火の始末を忘れずに"],
    [1.2, 0.5],
    [-1.8, 1.9, 0.12],
    0,
    {
      bg: "#d8d0b8",
      fg: "#2a1a0a",
      glow: 0.2,
    },
  );

  // 足跡（最初は非表示）
  for (const [name, from, to] of [
    ["prints-a", 0, 5],
    ["prints-b", 5, 10],
  ] as const) {
    const g = new TransformNode(name, b.scene);
    for (let i = from; i < to; i++) {
      const p = PRINTS[i];
      if (!p) {
        continue;
      }
      const [x, z] = p;
      b.box(
        `${name}-${i}`,
        [0.13, 0.01, 0.3],
        [x + (i % 2 ? 0.14 : -0.14), 0.012, z],
        wet,
        {
          collide: false,
          parent: g,
          rotY: (i % 2 ? 0.3 : -0.3) - 0.5,
        },
      );
    }
    g.setEnabled(false);
    b.register(name, g);
  }

  // 照明（ストーブの火のみ。最初は消えている）
  b.lamp("stove", [0, 1.1, 6.6], "#ff8a3a", 0.8, 9, false).light.setEnabled(
    false,
  );

  // 最後の一発：霜まみれの登山者
  b.figure(
    "climber",
    [1.6, 0.25, 5.5],
    {
      skin: "#a9bccb",
      hair: "#e8f0f6",
      cloth: "#a02a2a",
      eyes: "#000000",
      height: 1.0,
      longHair: false,
    },
    false,
  );
  return {};
};
