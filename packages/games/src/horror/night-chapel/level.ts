import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜の礼拝堂。x=-5〜5, z=0〜20、天井 6m。入口は南(z=0)の大扉。北(z=20側)に祭壇。
 * 西の壁際(x≈-4.2, z≈8)に告解室。戸(conf-door)は +x 側に付いている。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#3a3640");
  const wall = b.mat("#4a4650");
  const ceiling = b.mat("#201e28");
  const wood = b.mat("#4a2e1c");
  const gold = b.mat("#c8a840", { specular: 0.8, emissive: "#302400" });
  const stone = b.mat("#8a8e90");
  const wax = b.mat("#f0e8d0", { emissive: "#403828" });
  const black = b.mat("#08080a");

  // ---- 本堂 ----
  b.room("nave", [0, 0, 10], 10, 20, 6, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 10, 6, [0, 1.8, 2.8], wall);
  b.door("church-door", [-0.9, 0, 0], 1.8, 2.8, 0, wood, {
    open: true,
    interactive: false,
  });
  b.box("porch", [10, 0.2, 4], [0, -0.1, -2], floor);
  for (const [n, size, pos] of [
    ["porch-w", [0.2, 4, 4], [-5, 2, -2]],
    ["porch-e", [0.2, 4, 4], [5, 2, -2]],
    ["porch-s", [10, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  // 長椅子
  for (const side of [-1, 1]) {
    for (let r = 0; r < 6; r++) {
      const z = 4 + r * 2;
      b.box(`pew-${side}-${r}`, [2.0, 0.45, 0.5], [side * 2.6, 0.23, z], wood);
      b.box(
        `pew-back-${side}-${r}`,
        [2.0, 0.7, 0.08],
        [side * 2.6, 0.8, z + 0.28],
        wood,
        { collide: false },
      );
    }
  }
  // ステンドグラス（青と赤の光る板）
  for (const side of [-1, 1]) {
    for (const [i, z] of [4, 8, 12, 16].entries()) {
      b.box(
        `glass-${side}-${i}`,
        [0.05, 2.4, 1.2],
        [side * 4.92, 3.6, z],
        b.mat(i % 2 ? "#3a5ac8" : "#c83a5a", {
          emissive: i % 2 ? "#142a6a" : "#6a1428",
        }),
        { collide: false },
      );
    }
  }
  b.lamp("glass", [-3.8, 4, 6], "#6a8aff", 0.5, 10, false);
  b.lamp("glass", [3.8, 4, 12], "#a870ff", 0.5, 10, false);

  // ---- 祭壇 ----
  b.box("dais", [6, 0.3, 3.4], [0, 0.15, 18.3], stone);
  b.box("altar", [2.0, 1.0, 0.8], [0, 0.8, 18.8], wood);
  b.box("cross-v", [0.18, 2.4, 0.1], [0, 3.4, 19.85], gold, { collide: false });
  b.box("cross-h", [1.2, 0.18, 0.1], [0, 3.9, 19.85], gold, { collide: false });
  for (const [name, x] of [
    ["candle-l", -1.5],
    ["candle-r", 1.5],
  ] as const) {
    b.cylinder(`${name}-stand`, 1.2, 0.12, [x, 0.9, 18.3], gold, {
      collide: false,
    });
    const candle = b.cylinder(name, 0.35, 0.1, [x, 1.65, 18.3], wax, {
      collide: false,
    });
    b.register(name, candle);
    b.lamp(name, [x, 1.95, 18.1], "#ffa850", 0.6, 9, false);
  }

  // ---- 聖母像 ----
  b.figure(
    "statue",
    [2.8, 0.3, 17.4],
    {
      skin: "#a8acae",
      hair: "#9a9ea0",
      cloth: "#b8bcbe",
      eyes: "#303030",
      height: 1.1,
      longHair: true,
    },
    true,
  );

  // ---- 祈る人影 ----
  for (const [i, [x, z]] of [
    [-2.6, 6],
    [2.6, 9],
    [-2.6, 12],
  ].entries()) {
    const k = b.figure(
      `kneel-${i}`,
      [x ?? 0, 0, z ?? 0],
      {
        skin: "#202024",
        hair: "#060606",
        cloth: "#101014",
        eyes: "#101014",
        height: 0.9,
        longHair: i % 2 === 0,
      },
      false,
    );
    k.rotation.y = 0;
  }

  // ---- 告解室 ----
  b.box("conf-back", [0.1, 2.4, 1.6], [-4.9, 1.2, 8], wood);
  b.box("conf-side-a", [1.5, 2.4, 0.1], [-4.2, 1.2, 7.2], wood);
  b.box("conf-side-b", [1.5, 2.4, 0.1], [-4.2, 1.2, 8.8], wood);
  b.box("conf-roof", [1.6, 0.12, 1.7], [-4.2, 2.46, 8], wood, {
    collide: false,
  });
  b.wallWithGap("conf-front", "z", [-3.5, 0, 8], 1.6, 2.4, [0, 0.8, 2.0], wood);
  b.door("conf-door", [-3.5, 0, 7.6], 0.8, 2.0, -Math.PI / 2, black, {
    open: false,
    interactive: false,
    openAngleDeg: 100,
  });
  b.sign("conf-sign", ["告解室"], [0.5, 0.2], [-3.42, 2.2, 8], Math.PI / 2, {
    bg: "#201408",
    fg: "#d8c080",
    glow: 0.4,
  });
  const priest = b.figure(
    "priest",
    [-4.3, 0, 8],
    {
      skin: "#c0bcb4",
      hair: "#d8d8d4",
      cloth: "#0a0a0c",
      eyes: "#000000",
      height: 1.05,
      longHair: false,
    },
    false,
  );
  priest.rotation.y = Math.PI / 2;
  return {};
};
