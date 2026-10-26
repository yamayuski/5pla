import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 深夜のフェリー。二等船室（x=-5〜5, z=0〜8、カーペット敷きの雑魚寝部屋）と、
 * 北の扉（x=0, z=8）の先の後部甲板（z=8〜16、手すりの外は暗い海）。
 * 船室の南西（x=-3, z=0）の扉の先は案内所前の小さなホール（シャッターが下りている）。
 * 船の揺れは update フックでカメラをわずかにロールさせて表現。
 */
const SLEEPERS: [number, number][] = [
  [-3.5, 2.5],
  [-1.2, 5.5],
  [1.5, 2.2],
  [3.6, 5.8],
  [0.2, 3.8],
  [-3.4, 6.2],
  [3.2, 1.4],
];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const carpet = b.mat("#3a4a6a");
  const wallMat = b.mat("#d8d4c4");
  const ceiling = b.mat("#c8c4b4");
  const deckMat = b.mat("#5a5a52");
  const rail = b.mat("#d8d8d0", { specular: 0.5 });
  const steel = b.mat("#8a9096", { specular: 0.6 });
  const blanket = b.mat("#8a6a4a");

  // ---- 二等船室 ----
  b.room(
    "cabin",
    [0, 0, 4],
    10,
    8,
    2.5,
    { floor: carpet, wall: wallMat, ceiling },
    ["n", "s"],
  );
  b.wallWithGap("cabin-n", "x", [0, 0, 8], 10, 2.5, [0, 1.2, 2.1], wallMat);
  b.wallWithGap("cabin-s", "x", [0, 0, 0], 10, 2.5, [-3, 1.0, 2.1], wallMat);
  b.door("deck-door", [-0.6, 0, 8], 1.2, 2.1, 0, steel, { open: true });
  b.door("hall-door", [-3.5, 0, 0], 1.0, 2.1, 0, steel, {
    open: true,
    interactive: false,
  });
  // 丸窓（外は真っ暗）
  for (const z of [2, 4, 6]) {
    b.cylinder(
      `porthole-e-${z}`,
      0.05,
      0.5,
      [4.92, 1.5, z],
      b.mat("#05070a", {
        specular: 1,
      }),
      { collide: false, tess: 16 },
    ).rotation.z = Math.PI / 2;
    b.cylinder(
      `porthole-w-${z}`,
      0.05,
      0.5,
      [-4.92, 1.5, z],
      b.mat("#05070a", {
        specular: 1,
      }),
      { collide: false, tess: 16 },
    ).rotation.z = Math.PI / 2;
  }
  b.sign("cabin-sign", ["2等船室 B"], [0.9, 0.3], [0, 2.3, 0.12], Math.PI, {
    bg: "#1a3a6a",
    fg: "#fff",
    glow: 0.4,
  });
  // 自分の荷物と毛布
  b.box("my-bag", [0.5, 0.3, 0.3], [-4.4, 0.15, 1.0], b.mat("#2a2a2a"), {
    collide: false,
  });
  // 毛布の膨らみ（寝ている客）。最初は 3 つ、異変で 5 つに増える
  for (const [i, [x, z]] of SLEEPERS.entries()) {
    const lump = b.box(`lump-${i}`, [0.7, 0.3, 1.7], [x, 0.15, z], blanket, {
      collide: false,
    });
    if (i >= 3) {
      lump.setEnabled(false);
    }
    // 起き上がる客（床から上半身だけが出た格好）
    const fig = b.figure(
      `sitter-${i}`,
      [x, -0.75, z],
      {
        skin: "#c8ccc8",
        hair: "#080808",
        cloth: "#3a3e44",
        eyes: "#000000",
        height: 1,
        longHair: i % 2 === 0,
      },
      false,
    );
    fig.rotation.y = Math.PI;
  }

  // ---- 案内所前のホール（シャッター） ----
  b.room(
    "hall",
    [-3, 0, -1.5],
    3,
    3,
    2.5,
    { floor: deckMat, wall: wallMat, ceiling },
    ["n"],
  );
  b.box("info-shutter", [2.4, 1.6, 0.1], [-3, 1.0, -2.9], steel);
  b.sign(
    "info-sign",
    ["案内所", "22:00 にて閉所"],
    [1.0, 0.4],
    [-3, 2.1, -2.84],
    Math.PI,
    {
      bg: "#f0ead8",
      fg: "#222",
      glow: 0.3,
    },
  );

  // ---- 後部甲板 ----
  b.box("deck", [12, 0.2, 8], [0, -0.1, 12], deckMat);
  b.box("rail-n", [12, 1.1, 0.1], [0, 0.55, 16], rail);
  b.box("rail-e", [0.1, 1.1, 8], [6, 0.55, 12], rail);
  b.box("rail-w", [0.1, 1.1, 8], [-6, 0.55, 12], rail);
  for (const [n, size, pos] of [
    ["guard-n", [12, 1.5, 0.05], [0, 1.85, 16]],
    ["guard-e", [0.05, 1.5, 8], [6, 1.85, 12]],
    ["guard-w", [0.05, 1.5, 8], [-6, 1.85, 12]],
  ] as const) {
    b.box(n, size, pos, rail).isVisible = false;
  }
  b.cylinder("bollard", 0.5, 0.4, [3.5, 0.25, 14.5], steel);
  b.box("lifebuoy-box", [0.8, 0.8, 0.5], [-4.5, 0.4, 14.8], b.mat("#d86a20"));
  b.box(
    "sea",
    [200, 0.1, 200],
    [0, -4, 60],
    b.mat("#04060a", { specular: 0.6 }),
    {
      collide: false,
    },
  );

  // ---- 照明 ----
  b.lamp("cabin", [-2, 2.4, 4], "#fff0d8", 0.4, 7);
  b.lamp("cabin2", [2.5, 2.4, 4], "#fff0d8", 0.35, 7);
  b.lamp("hall", [-3, 2.4, -1.5], "#e8f0ff", 0.4, 4);
  b.lamp("deck", [0, 3.2, 8.6], "#ffe0b0", 0.55, 10);

  // ---- 最後の一発：船員 ----
  b.figure(
    "crew",
    [0, 0, 40],
    {
      skin: "#c4c8c4",
      hair: "#101010",
      cloth: "#1a2a4a",
      eyes: "#000000",
      height: 1.02,
    },
    false,
  );

  return {
    update: (game) => {
      const t = game.elapsed;
      game.camera.rotation.z =
        Math.sin(t * 0.55) * 0.012 + Math.sin(t * 0.21) * 0.008;
    },
  };
};
