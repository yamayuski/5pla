import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 夜の田んぼ道。南端 z=0 にバス停、北 z=60 に自宅の門灯。道は x=-2〜2 の一本道。
 * 案山子 sc-0〜sc-5 が道の脇に立つ。異変のたびに近づく／増える。
 */
const SC: [number, number][] = [
  [-4, 12],
  [4.5, 22],
  [-4.5, 32],
  [4, 40],
  [-3.6, 48],
  [3.6, 54],
];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const dirt = b.mat("#3a3226");
  const grass = b.mat("#1c2a16");
  const wood = b.mat("#4a3a28");
  const lampMat = b.mat("#ffe8b0", { emissive: "#806a30" });

  b.box("road", [4.4, 0.2, 64], [0, -0.1, 30], dirt);
  b.box("field-w", [30, 0.2, 64], [-17.2, -0.1, 30], grass);
  b.box("field-e", [30, 0.2, 64], [17.2, -0.1, 30], grass);
  for (const [n, size, pos] of [
    ["inv-w", [0.2, 4, 66], [-8, 2, 30]],
    ["inv-e", [0.2, 4, 66], [8, 2, 30]],
    ["inv-s", [16, 4, 0.2], [0, 2, -2]],
    ["inv-n", [16, 4, 0.2], [0, 2, 63]],
  ] as const) {
    b.box(n, size, pos, dirt).isVisible = false;
  }

  // バス停
  b.box("stop-pole", [0.1, 2.4, 0.1], [2.6, 1.2, 1.5], wood);
  b.sign(
    "stop-sign",
    ["バス停", "鬼無里口"],
    [0.6, 0.4],
    [2.6, 2.3, 1.4],
    Math.PI,
    {
      bg: "#f0ecd8",
      fg: "#202020",
      glow: 0.3,
    },
  );

  // 門と門灯
  b.box("gate-l", [0.2, 2, 0.2], [-1.2, 1, 58], wood);
  b.box("gate-r", [0.2, 2, 0.2], [1.2, 1, 58], wood);
  b.box("gate-lamp", [0.3, 0.3, 0.3], [0, 2.1, 58], lampMat, {
    collide: false,
  });
  const bell = b.box(
    "gate-bell",
    [0.2, 0.2, 0.2],
    [1.2, 1.3, 57.8],
    b.mat("#c0a040"),
    {
      collide: false,
    },
  );
  b.register("gate-bell", bell);

  // 案山子
  for (const [i, [x, z]] of SC.entries()) {
    const g = b.figure(
      `sc-fig-${i}`,
      [x, 0, z],
      {
        skin: "#a89868",
        hair: "#6a5a30",
        cloth: "#4a3a28",
        eyes: "#000000",
        height: 1.0,
      },
      i < 3,
    );
    g.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    b.register(`sc-${i}`, g);
  }

  b.lamp("lamp-a", [0, 2.6, 58], "#ffe0a0", 0.5, 12, false);
  b.lamp("lamp-b", [2.6, 2.6, 1.5], "#e8f0ff", 0.35, 8, false);

  // 最後の一発
  b.figure(
    "ghost",
    [0, 0, 100],
    {
      skin: "#b8b090",
      hair: "#6a5a30",
      cloth: "#4a3a28",
      eyes: "#000000",
      height: 1.0,
    },
    false,
  );
  return {};
};
