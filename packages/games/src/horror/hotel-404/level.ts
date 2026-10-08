import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * ビジネスホテルの客室。x=-3〜3, z=0〜7（入口 z=0、x=2 の room-door）、
 * 北西に浴室（x=-3〜-0.6, z=7〜10.6）。浴槽 z≈10.1 に半透明のシャワーカーテン(curtain)、
 * その向こうに人影(bather)。最初は浴室の扉が閉まっていて、あとから開く。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const carpet = b.mat("#4a4a52");
  const wall = b.mat("#b8b4a8");
  const ceiling = b.mat("#8a8a88");
  const tile = b.mat("#c8d0d0");
  const bed = b.mat("#e0ddd4");
  const frame = b.mat("#3a2a1c");
  const dark = b.mat("#0a0a0c");
  const curtainMat = b.mat("#dfe8e8", { alpha: 0.62 });
  const tubMat = b.mat("#e8eeee", { specular: 0.6 });

  // ---- 客室 ----
  b.room("room", [0, 0, 3.5], 6, 7, 2.6, { floor: carpet, wall, ceiling }, [
    "s",
    "n",
  ]);
  b.wallWithGap("room-s", "x", [0, 0, 0], 6, 2.6, [2, 1.0, 2.1], wall);
  b.door("room-door", [1.5, 0, 0], 1.0, 2.1, 0, frame, {
    open: true,
    interactive: false,
  });
  b.sign("room-no", ["404"], [0.3, 0.15], [1.2, 1.8, 0.12], 0, {
    bg: "#101010",
    fg: "#e8d8a0",
    glow: 0.5,
  });
  // 外：廊下
  b.box("hall-floor", [8, 0.2, 4], [0, -0.1, -2], carpet);
  for (const [n, size, pos] of [
    ["hall-w", [0.2, 4, 4], [-4, 2, -2]],
    ["hall-e", [0.2, 4, 4], [4, 2, -2]],
    ["hall-s", [8, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  // 北壁（浴室の開口以外）
  b.wallWithGap("room-n", "x", [0, 0, 7], 6, 2.6, [-1.8, 0.9, 2.0], wall);
  // ベッド、机、テレビ
  b.box("bed", [1.4, 0.5, 2.0], [1.6, 0.25, 5.8], bed);
  b.box("bed-head", [1.4, 1.0, 0.1], [1.6, 0.8, 6.85], frame);
  b.box("nightstand", [0.5, 0.5, 0.5], [0.5, 0.25, 6.6], frame);
  const phone = b.box(
    "phone",
    [0.22, 0.1, 0.18],
    [0.5, 0.55, 6.6],
    b.mat("#d8d4c8"),
    {
      collide: false,
    },
  );
  b.register("phone", phone);
  b.box("desk", [0.5, 0.75, 2.0], [2.7, 0.38, 3.0], frame);
  b.box("tv", [0.1, 0.6, 1.0], [2.9, 1.3, 3.0], dark, { collide: false });
  const lit = b.box(
    "tv-lit",
    [0.04, 0.5, 0.9],
    [2.83, 1.3, 3.0],
    b.mat("#c8d8f0", { emissive: "#98a8c0" }),
    {
      collide: false,
    },
  );
  lit.setEnabled(false);
  b.register("tv-lit", lit);
  b.box("wardrobe", [0.6, 2.0, 1.0], [-2.65, 1.0, 1.5], frame);

  // ---- 浴室 ----
  b.room(
    "bath",
    [-1.8, 0, 8.8],
    2.4,
    3.6,
    2.6,
    { floor: tile, wall: tile, ceiling },
    ["s"],
  );
  b.door("bath-door", [-2.25, 0, 7], 0.9, 2.0, 0, frame, {
    open: false,
    interactive: false,
    openAngleDeg: 100,
  });
  b.box("tub", [1.6, 0.55, 0.8], [-1.8, 0.28, 10.1], tubMat);
  b.cylinder(
    "shower-head",
    0.12,
    0.12,
    [-1.8, 2.2, 10.4],
    b.mat("#aab0b4", { specular: 0.8 }),
    { collide: false },
  );
  const curtain = b.box(
    "curtain",
    [1.7, 1.7, 0.03],
    [-1.8, 1.4, 9.6],
    curtainMat,
    { collide: false },
  );
  b.register("curtain", curtain);
  b.box("curtain-rod", [1.8, 0.05, 0.05], [-1.8, 2.3, 9.6], b.mat("#aab0b4"), {
    collide: false,
  });
  b.box("sink", [0.6, 0.15, 0.4], [-0.75, 0.9, 8.2], tubMat);

  // ---- 照明 ----
  b.lamp("room", [0, 2.4, 3.5], "#fff0d8", 0.55, 9, true);
  b.lamp("bath", [-1.8, 2.4, 8.8], "#e8f4ff", 0.7, 6, true).light.setEnabled(
    false,
  );
  b.lamp("tv", [2.3, 1.3, 3.0], "#9ab8ff", 0.5, 5, false).light.setEnabled(
    false,
  );

  // ---- カーテン越しの人影と、最後の一発 ----
  const bather = b.figure(
    "bather",
    [-1.8, 0.45, 10.2],
    {
      skin: "#c0c4c4",
      hair: "#050506",
      cloth: "#e8ecec",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  bather.rotation.y = Math.PI;
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c0c4c4",
      hair: "#050506",
      cloth: "#e8ecec",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  return {};
};
