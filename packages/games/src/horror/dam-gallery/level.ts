import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * ダム堤体内の点検廊。x=-1.5〜1.5, z=0〜40、天井 2.6m。南の入口に水密扉(entry-hatch)、奥(z=40)に鋼鉄の扉。
 * 水位計 gauge-0〜2（z=10, 22, 34, 東壁）。gauge-a / gauge-b は壁の最初の水位表示と書き換わったあとの表示。
 * フロアの水（water）は update フックで徐々に水位を上げる（floodOn / floodFast）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#4a4c4e", { specular: 0.4 });
  const wall = b.mat("#6a6c6e");
  const ceiling = b.mat("#505254");
  const steel = b.mat("#5a6068", { specular: 0.6 });
  const pipe = b.mat("#6a5a40", { specular: 0.4 });
  const waterMat = b.mat("#0a1c24", {
    emissive: "#020a10",
    alpha: 0.6,
    specular: 0.9,
  });

  // ---- 点検廊 ----
  b.room("gallery", [0, 0, 20], 3, 40, 2.6, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 3, 2.6, [0, 1.0, 2.0], wall);
  b.door("entry-hatch", [-0.5, 0, 0], 1.0, 2.0, 0, steel, {
    open: true,
    interactive: false,
  });
  b.box("outside", [3, 0.2, 3], [0, -0.1, -1.5], floor);
  for (const [n, size, pos] of [
    ["out-w", [0.2, 4, 3], [-1.5, 2, -1.5]],
    ["out-e", [0.2, 4, 3], [1.5, 2, -1.5]],
    ["out-s", [3, 4, 0.2], [0, 2, -3]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.box("end-door", [1.4, 2.2, 0.2], [0, 1.1, 39.8], steel);
  b.sign(
    "end-sign",
    ["第3 点検廊", "立入注意"],
    [0.9, 0.4],
    [0, 2.3, 39.68],
    Math.PI,
    {
      bg: "#d8c020",
      fg: "#181818",
      glow: 0.3,
    },
  );
  // 配管（西壁沿い）
  b.cylinder("pipe-w", 40, 0.16, [-1.3, 2.1, 20], pipe, {
    collide: false,
  }).rotation.x = Math.PI / 2;

  // ---- 水位計 ----
  for (const [i, z] of [10, 22, 34].entries()) {
    const g = b.sign(
      `gauge-${i}`,
      ["水位計", "0.0 m"],
      [0.5, 0.4],
      [1.46, 1.4, z],
      Math.PI / 2,
      {
        bg: "#e8e8d8",
        fg: "#181818",
        glow: 0.3,
      },
    );
    b.register(`gauge-${i}`, g);
  }
  const ga = b.sign(
    "gauge-a",
    ["水位", "0.0 m"],
    [0.5, 0.4],
    [-1.46, 1.4, 12],
    -Math.PI / 2,
    {
      bg: "#e8e8d8",
      fg: "#181818",
      glow: 0.3,
    },
  );
  b.register("gauge-a", ga);
  const gb = b.sign(
    "gauge-b",
    ["0.7 m", "あなたの くび"],
    [0.5, 0.4],
    [-1.46, 1.4, 12],
    -Math.PI / 2,
    {
      bg: "#200808",
      fg: "#e82020",
      glow: 0.5,
    },
  );
  gb.setEnabled(false);
  b.register("gauge-b", gb);

  // ---- 照明（籠付き電球） ----
  b.lamp("gal-a", [0, 2.4, 6], "#ffd8a0", 0.55, 9, true);
  b.lamp("gal-a", [0, 2.4, 14], "#ffd8a0", 0.55, 9, true);
  b.lamp("gal-b", [0, 2.4, 22], "#ffd8a0", 0.55, 9, true);
  b.lamp("gal-b", [0, 2.4, 30], "#ffd8a0", 0.55, 9, true);
  b.lamp("gal-c", [0, 2.4, 37], "#ffd8a0", 0.5, 9, true);

  // ---- 水（徐々に上がる） ----
  const water = b.box("water", [2.9, 1, 40], [0, 0.5, 20], waterMat, {
    collide: false,
  });
  let level = 0.02;
  water.scaling.y = level;
  water.position.y = level / 2;

  // ---- 水の中から立ち上がる女（床の下から現れる） ----
  b.figure(
    "drowned",
    [0, -1.1, 34],
    {
      skin: "#a0b0b4",
      hair: "#06080a",
      cloth: "#d0d8d8",
      eyes: "#000000",
      height: 1.04,
      longHair: true,
    },
    false,
  ).rotation.y = Math.PI;

  let rate = 0;
  return {
    update: (_g, dt) => {
      level = Math.min(0.75, level + rate * dt);
      water.scaling.y = level;
      water.position.y = level / 2;
    },
    custom: {
      floodOn: () => {
        rate = 0.0022;
      },
      floodFast: () => {
        rate = 0.0075;
      },
    },
  };
};
