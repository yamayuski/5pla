import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 写真館の暗室。x=-3〜3, z=0〜8、天井 2.6m。入口 z=0 の遮光扉(dark-door)。
 * 右手に引き伸ばし機(enlarger)と薬品のバット、奥(z=7)に干し紐と写真(photo-0〜5)。
 */
const PHOTOS: [string[], string, string][] = [
  [["夏祭り", "笑う少女"], "#c8b898", "#201810"],
  [["同じ場所", "こちらを向く少女"], "#c0b494", "#201810"],
  [["少女が", "目の前に"], "#b8a888", "#201010"],
  [["撮影者の影", "赤い光の中"], "#a89878", "#401010"],
  [["肩に白い手", "後ろ姿の白衣"], "#988868", "#401010"],
  [["う し ろ"], "#080606", "#a01010"],
];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#2a1a18");
  const wall = b.mat("#3a2420");
  const ceiling = b.mat("#201210");
  const steel = b.mat("#8a8e92", { specular: 0.7 });
  const bench = b.mat("#4a3224");
  const tray = b.mat("#d8d4cc");
  const liquid = b.mat("#6a3028", { emissive: "#30100c", alpha: 0.85 });
  const black = b.mat("#0a0606");

  b.room("room", [0, 0, 4], 6, 8, 2.6, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 2.6, [0, 1.0, 2.1], wall);
  b.door("dark-door", [-0.5, 0, 0], 1.0, 2.1, 0, black, {
    open: true,
    interactive: false,
  });
  b.box("outside", [6, 0.2, 3], [0, -0.1, -1.5], floor);
  for (const [n, size, pos] of [
    ["out-w", [0.2, 4, 3], [-3, 2, -1.5]],
    ["out-e", [0.2, 4, 3], [3, 2, -1.5]],
    ["out-s", [6, 4, 0.2], [0, 2, -3]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.sign(
    "warn",
    ["暗室使用中", "ドアを開けるな"],
    [0.8, 0.4],
    [0.9, 1.9, 0.12],
    0,
    {
      bg: "#d8d0b8",
      fg: "#a01010",
      glow: 0.4,
    },
  );

  // ---- 作業台とバット ----
  b.box("bench", [0.8, 0.9, 3.2], [2.4, 0.45, 3.5], bench);
  for (const z of [2.4, 3.5, 4.6]) {
    b.box(`tray-${z}`, [0.6, 0.06, 0.8], [2.4, 0.93, z], tray, {
      collide: false,
    });
    b.box(`liquid-${z}`, [0.5, 0.02, 0.7], [2.4, 0.97, z], liquid, {
      collide: false,
    });
  }
  // 引き伸ばし機
  b.box("enlarger-base", [0.7, 0.08, 0.7], [-2.2, 0.9, 3], steel, {
    collide: false,
  });
  b.box("enlarger", [0.2, 0.3, 0.2], [-2.2, 1.7, 3], steel, { collide: false });
  b.register(
    "enlarger",
    b.cylinder("enlarger-column", 0.9, 0.06, [-2.2, 1.35, 3], steel, {
      collide: false,
    }),
  );
  b.box("shelf-w", [0.6, 0.9, 3.2], [-2.6, 0.45, 5.5], bench);

  // ---- 干し紐と写真 ----
  b.box("line", [5, 0.02, 0.02], [0, 2.0, 7.2], steel, { collide: false });
  for (const [i, [lines, bg, fg]] of PHOTOS.entries()) {
    const x = -2.1 + i * 0.84;
    b.box(`clip-${i}`, [0.04, 0.08, 0.04], [x, 2.0, 7.2], steel, {
      collide: false,
    });
    const s = b.sign(
      `photo-${i}`,
      lines,
      [0.6, 0.45],
      [x, 1.7, 7.15],
      Math.PI,
      { bg, fg, glow: 0.35 },
    );
    s.setEnabled(false);
    b.register(`photo-${i}`, s);
  }

  // ---- 赤いセーフライト ----
  b.box(
    "safelight-body",
    [0.3, 0.2, 0.2],
    [0, 2.5, 3.5],
    b.mat("#c01010", { emissive: "#901010" }),
    { collide: false },
  );
  b.lamp("safelight", [0, 2.35, 3.5], "#ff3020", 1.1, 10, false);
  b.lamp("safelight", [0, 2.35, 6.5], "#ff3020", 0.6, 8, false);

  // ---- 最後の一発 ----
  b.figure(
    "girl",
    [0, 0, -30],
    {
      skin: "#d8d0cc",
      hair: "#08080a",
      cloth: "#d8d0c8",
      eyes: "#000000",
      height: 0.95,
      longHair: true,
    },
    false,
  );
  return {};
};
