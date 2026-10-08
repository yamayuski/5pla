import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 深夜営業のスパのサウナ室。x=-2.5〜2.5, z=0〜5、天井 2.6m。南(z=0)に出入口のガラス戸(sauna-door)。
 * 北の壁にストーブ(stones)、西の壁と北の壁に二段ベンチ。壁の温度計は temp-80〜temp-130 の差し替え、砂時計は glass-a / b。
 * 奥の隅(1.8, 4.5)にタオルを巻いた女(bather)が壁を向いて立つ。
 */
const TEMPS: [string, string][] = [
  ["temp-80", "80℃"],
  ["temp-95", "95℃"],
  ["temp-110", "110℃"],
  ["temp-130", "130℃"],
];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const cedar = b.mat("#8a5a34");
  const cedarDark = b.mat("#5a3a22");
  const floor = b.mat("#6a5038");
  const stone = b.mat("#3a3a3c");
  const glass = b.mat("#b8d0d4", { alpha: 0.3, specular: 0.8 });
  const metal = b.mat("#6a6a6c", { specular: 0.5 });
  const red = b.mat("#ff5020", { emissive: "#c02808" });

  // ---- サウナ室 ----
  b.room(
    "sauna",
    [0, 0, 2.5],
    5,
    5,
    2.6,
    { floor, wall: cedar, ceiling: cedarDark },
    ["s"],
  );
  b.wallWithGap("front", "x", [0, 0, 0], 5, 2.6, [0, 0.9, 2.0], cedar);
  b.door("sauna-door", [-0.45, 0, 0], 0.9, 2.0, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("changing", [5, 0.2, 3], [0, -0.1, -1.5], floor);
  for (const [n, size, pos] of [
    ["ch-w", [0.2, 4, 3], [-2.5, 2, -1.5]],
    ["ch-e", [0.2, 4, 3], [2.5, 2, -1.5]],
    ["ch-s", [5, 4, 0.2], [0, 2, -3]],
  ] as const) {
    b.box(n, size, pos, cedar).isVisible = false;
  }

  // ---- ベンチ（二段） ----
  b.box("bench-w-low", [0.7, 0.4, 3.2], [-2.0, 0.2, 2.6], cedarDark);
  b.box("bench-w-up", [0.7, 0.4, 3.2], [-2.3, 0.8, 2.6], cedarDark);
  b.box("bench-n-low", [3, 0.4, 0.6], [0.3, 0.2, 4.55], cedarDark);
  b.box("bench-n-up", [3, 0.4, 0.6], [0.3, 0.8, 4.8], cedarDark);

  // ---- ストーブ（北の壁際、ベンチの手前） ----
  b.box("stove-body", [0.7, 0.7, 0.7], [-1.3, 0.35, 3.8], metal);
  const stones = b.cylinder("stones", 0.25, 0.6, [-1.3, 0.8, 3.8], stone, {
    collide: false,
  });
  b.register("stones", stones);
  b.box("stove-glow", [0.5, 0.1, 0.02], [-1.3, 0.3, 3.44], red, {
    collide: false,
  });
  b.lamp("stove", [-1.3, 0.6, 3.5], "#ff5a20", 0.6, 6, false);

  // ---- 温度計と砂時計 ----
  for (const [i, [name, text]] of TEMPS.entries()) {
    const s = b.sign(
      name,
      ["温度", text],
      [0.5, 0.28],
      [1.2, 1.7, 0.12 + i * 0.002],
      0,
      {
        bg: "#f0e8d0",
        fg: i === 3 ? "#c01010" : "#201810",
        glow: 0.3,
      },
    );
    s.setEnabled(i === 0);
    b.register(name, s);
  }
  const ga = b.sign(
    "glass-a",
    ["砂時計", "残り 12:00"],
    [0.5, 0.28],
    [-2.4, 1.7, 1.5],
    -Math.PI / 2,
    {
      bg: "#e8d8b0",
      fg: "#302010",
      glow: 0.3,
    },
  );
  b.register("glass-a", ga);
  const gb = b.sign(
    "glass-b",
    ["砂時計", "残り 00:00"],
    [0.5, 0.28],
    [-2.4, 1.7, 1.5],
    -Math.PI / 2,
    {
      bg: "#401010",
      fg: "#ff4030",
      glow: 0.5,
    },
  );
  gb.setEnabled(false);
  b.register("glass-b", gb);

  // ---- 照明 ----
  b.lamp("sauna", [0, 2.3, 2.2], "#ffc080", 0.55, 8, true);

  // ---- 隅に立つ女（壁を向いている） ----
  const bather = b.figure(
    "bather",
    [1.9, 0, 4.55],
    {
      skin: "#d8bcb0",
      hair: "#06060a",
      cloth: "#e8e4dc",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  bather.rotation.y = 0;
  return {};
};
