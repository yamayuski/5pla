import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 一人暮らしの深夜のダイニングキッチン。x=-3〜3, z=0〜8、天井 2.5m。南(z=0)の front-door が玄関。
 * 北壁(z=8)の x=1.5 に冷蔵庫。上段の扉 fridge-top、下段（冷凍庫）の扉 freezer-door。扉を横へ動かして中を見せる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#b8a890", { specular: 0.3 });
  const wall = b.mat("#e0dccc");
  const ceiling = b.mat("#d0ccbc");
  const doorMat = b.mat("#6a5440");
  const counter = b.mat("#8a7a68");
  const white = b.mat("#e8eae8", { specular: 0.5 });

  b.room("flat", [0, 0, 4], 6, 8, 2.5, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 2.5, [-1.5, 1.0, 2.1], wall);
  b.door("front-door", [-2, 0, 0], 1.0, 2.1, 0, doorMat, {
    open: true,
    interactive: false,
  });
  b.box("hall", [6, 0.2, 4], [0, -0.1, -2], floor);
  for (const [n, size, pos] of [
    ["hall-w", [0.2, 3, 4], [-3, 1.5, -2]],
    ["hall-e", [0.2, 3, 4], [3, 1.5, -2]],
    ["hall-s", [6, 3, 0.2], [0, 1.5, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }

  // ---- 家具 ----
  b.box("table", [1.4, 0.75, 0.9], [-1.0, 0.38, 3.6], b.mat("#6a4a30"));
  b.box("kcounter", [2.6, 0.9, 0.6], [-1.6, 0.45, 7.6], counter);
  b.box("clock", [0.4, 0.4, 0.05], [-1.5, 1.9, 7.9], white, { collide: false });
  b.sign(
    "calendar",
    ["10月", "〇〇〇〇〇〇"],
    [0.5, 0.6],
    [2.95, 1.6, 4],
    Math.PI / 2,
    {
      bg: "#f4f0e0",
      fg: "#601010",
      glow: 0.3,
    },
  );

  // ---- 冷蔵庫 ----
  b.box("fridge-body", [0.8, 1.9, 0.7], [1.5, 0.95, 7.65], white);
  b.box("fridge-block", [0.9, 2.0, 0.2], [1.5, 1.0, 7.1], white).isVisible =
    false;
  const top = b.box(
    "fridge-top",
    [0.78, 0.9, 0.05],
    [1.5, 1.4, 7.28],
    b.mat("#d8dad8", { specular: 0.6 }),
    {
      collide: false,
    },
  );
  b.register("fridge-top", top);
  const low = b.box(
    "freezer-door",
    [0.78, 0.8, 0.05],
    [1.5, 0.45, 7.28],
    b.mat("#d8dad8", { specular: 0.6 }),
    {
      collide: false,
    },
  );
  b.register("freezer-door", low);
  b.sign(
    "fridge-in",
    ["麦茶　牛乳　卵", "見覚えのない弁当箱"],
    [0.7, 0.8],
    [1.5, 1.4, 7.31],
    0,
    {
      bg: "#f0f4f8",
      fg: "#203050",
      glow: 0.9,
    },
  );
  const inLow = b.sign("freezer-in", ["　"], [0.7, 0.7], [1.5, 0.45, 7.31], 0, {
    bg: "#202428",
    fg: "#202428",
    glow: 0.2,
  });
  inLow.isVisible = true;

  // ---- 照明 ----
  b.lamp("room", [0, 2.3, 4], "#fff0d8", 0.5, 9, true);
  b.lamp("fridge", [1.5, 1.4, 6.6], "#e8f4ff", 0.6, 4, false).light.setEnabled(
    false,
  );

  const girl = b.figure(
    "freezer-girl",
    [1.5, 0.3, 7.5],
    {
      skin: "#b8c0c8",
      hair: "#060606",
      cloth: "#d8dce0",
      eyes: "#000000",
      height: 0.7,
      longHair: true,
    },
    false,
  );
  girl.rotation.y = Math.PI;
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#b8c0c8",
      hair: "#060606",
      cloth: "#d8dce0",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  return {};
};
