import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 灯台の最上階の管理室（x=-3〜3, z=0〜6）。南壁中央に階段へ続く扉 stair-door。
 * 奥（z=5.5）に灯室の装置 beacon、東壁に無線機 radio、中央に机。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const stone = b.mat("#5a5e62");
  const floor = b.mat("#3a2e24");
  const ceil = b.mat("#2a2a2c");
  const metal = b.mat("#2a2a2c", { specular: 0.4 });
  const wood = b.mat("#6a4a2e");
  const glass = b.mat("#9ac0d0", { emissive: "#203038", alpha: 0.5 });

  b.room("keeper", [0, 0, 3], 6, 6, 3, { floor, wall: stone, ceiling: ceil }, [
    "s",
  ]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 3, [0, 1.1, 2.1], stone);
  b.door("stair-door", [-0.55, 0, 0], 1.1, 2.1, 0, b.mat("#3a2a1c"), {
    open: true,
    interactive: false,
  });
  for (const [n, size, pos] of [
    ["stairs-back", [6, 4, 0.2], [0, 2, -3]],
    ["stairs-w", [0.2, 4, 3], [-3, 2, -1.5]],
    ["stairs-e", [0.2, 4, 3], [3, 2, -1.5]],
  ] as const) {
    b.box(n, size, pos, stone).isVisible = false;
  }
  // 机と椅子
  b.box("desk", [1.6, 0.1, 0.8], [-1.5, 0.8, 1.6], wood);
  b.box("desk-leg1", [0.1, 0.8, 0.1], [-2.2, 0.4, 1.3], wood, {
    collide: false,
  });
  b.box("desk-leg2", [0.1, 0.8, 0.1], [-0.8, 0.4, 1.9], wood, {
    collide: false,
  });
  b.box("chair", [0.5, 0.45, 0.5], [-1.5, 0.23, 2.4], wood);
  // 灯室の装置
  const beacon = b.box("beacon", [0.9, 1.2, 0.9], [0, 0.6, 5.3], metal);
  b.register("beacon", beacon);
  b.box("lens", [0.7, 0.9, 0.7], [0, 1.65, 5.3], glass, { collide: false });
  // 無線機
  b.box("shelf", [0.4, 0.06, 1.2], [2.7, 1.4, 2.5], wood, { collide: false });
  const radio = b.box("radio", [0.3, 0.2, 0.2], [2.65, 1.53, 2.5], metal, {
    collide: false,
  });
  b.register("radio", radio);
  b.sign(
    "log",
    ["灯台日誌", "異常なし  異常なし  異常なし"],
    [1.4, 0.5],
    [-2.9, 1.8, 3.5],
    Math.PI / 2,
    {
      bg: "#d8d0b8",
      fg: "#2a1a0a",
      glow: 0.2,
    },
  );
  // 窓（外の海）
  b.box("window-n", [1.6, 1, 0.05], [-1.5, 1.8, 5.93], glass, {
    collide: false,
  });

  // 照明：机のランプのみ
  b.lamp("desk", [-1.5, 1.4, 1.6], "#ffb45a", 0.7, 8, false);

  b.figure(
    "keeper",
    [0, 0.25, 4.6],
    {
      skin: "#9aa8a0",
      hair: "#d0d8d8",
      cloth: "#1a2a3a",
      eyes: "#000000",
      height: 1.0,
      longHair: false,
    },
    false,
  );
  return {};
};
