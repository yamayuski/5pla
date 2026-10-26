import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 深夜の駅地下のコインロッカー通路。x=-3〜3, z=0〜22、天井 3m。入口(z=0)のシャッター付き自動ドアが gate。
 * 西壁(x=-3)沿いにロッカーが3段で並ぶ。17番(locker-17)は z=12 の中段。
 * ほかに開く扉が locker-a(z=6.5) locker-b(z=9.5) locker-c(z=16.5) locker-d(z=19.5)。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const tile = b.mat("#8a9088", { specular: 0.4 });
  const wall = b.mat("#b0b4a8");
  const ceiling = b.mat("#6a6e68");
  const steel = b.mat("#6c8aa0", { specular: 0.5 });
  const steelDark = b.mat("#58728a", { specular: 0.5 });
  const glass = b.mat("#b8d8e8", { alpha: 0.2, specular: 0.8 });
  const red = b.mat("#b82820", { emissive: "#401008" });

  b.room("hall", [0, 0, 11], 6, 22, 3, { floor: tile, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 3, [0, 2.4, 2.4], wall);
  b.door("gate", [-1.2, 0, 0], 2.4, 2.4, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("street", [6, 0.2, 4], [0, -0.1, -2], tile);
  for (const [n, size, pos] of [
    ["street-w", [0.2, 4, 4], [-3, 2, -2]],
    ["street-e", [0.2, 4, 4], [3, 2, -2]],
    ["street-s", [6, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.sign(
    "hall-sign",
    ["コインロッカー", "24時間 ご利用いただけます"],
    [2.6, 0.7],
    [0, 2.4, 0.12],
    0,
    {
      bg: "#183a5a",
      fg: "#f0f4f8",
      glow: 0.5,
    },
  );

  // ---- ロッカー群（西壁） ----
  const special: Record<string, [number, number]> = {
    "locker-a": [6.5, 1.1],
    "locker-17": [12.5, 1.1],
    "locker-b": [9.5, 0.4],
    "locker-c": [16.5, 1.8],
    "locker-d": [19.5, 1.1],
  };
  b.box("locker-body", [0.6, 2.4, 20.5], [-2.7, 1.2, 11.2], steelDark);
  for (let i = 0; i < 20; i++) {
    const z = 1.8 + i * 1.0;
    for (const y of [0.4, 1.1, 1.8]) {
      const isSpecial = Object.values(special).some(
        ([sz, sy]) => Math.abs(sz - z - 0.5) < 0.6 && sy === y,
      );
      if (isSpecial) {
        continue;
      }
      b.box(`lk-${i}-${y}`, [0.06, 0.62, 0.9], [-2.38, y, z + 0.5], steel, {
        collide: false,
      });
    }
  }
  for (const [name, [z, y]] of Object.entries(special)) {
    const door = b.box(name, [0.06, 0.62, 0.9], [-2.38, y, z], steel, {
      collide: false,
    });
    b.register(name, door);
  }
  b.sign("tag-17", ["17"], [0.3, 0.16], [-2.33, 1.35, 12.5], -Math.PI / 2, {
    bg: "#f8f0c0",
    fg: "#b01818",
    glow: 0.5,
  });
  b.box("lock-17", [0.04, 0.1, 0.1], [-2.33, 1.1, 12.9], red, {
    collide: false,
  });

  // ---- 向かいの壁：ベンチと時刻表 ----
  b.box("bench", [0.5, 0.45, 2.4], [2.6, 0.23, 8], b.mat("#5a4a38"));
  b.sign(
    "timetable",
    ["最終電車 0:12", "運転は終了しました"],
    [1.4, 0.8],
    [2.88, 1.7, 15],
    Math.PI / 2,
    {
      bg: "#101820",
      fg: "#f0c040",
      glow: 0.4,
    },
  );

  // ---- 照明 ----
  b.lamp("hall", [0, 2.8, 4], "#e0f0e8", 0.6, 9, true);
  b.lamp("hall", [0, 2.8, 11], "#e0f0e8", 0.6, 9, true);
  b.lamp("hall", [0, 2.8, 18], "#e0f0e8", 0.6, 9, true);

  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c4c8c0",
      hair: "#060606",
      cloth: "#d8d4c8",
      eyes: "#000000",
      height: 0.95,
      longHair: true,
    },
    false,
  );
  return {};
};
