import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 遊園地のお化け屋敷の通路。x=-2〜2, z=0〜34、天井 2.6m。入口 entrance(z=0)、出口 exit(z=34、鍵つき)。
 * 出演者(actor-1 z=8, actor-2 z=16, actor-3 z=24)は驚かせる役。「4人目」(actor-4)は入口側から歩いてくる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#201814", { specular: 0.1 });
  const wall = b.mat("#14100e");
  const ceiling = b.mat("#0c0a08");
  const glass = b.mat("#40281c");
  const prop = b.mat("#6a5040");
  const red = b.mat("#b82020", { emissive: "#701010" });
  const exitMat = b.mat("#2a6a3a", { emissive: "#0a3014" });

  b.room("tunnel", [0, 0, 17], 4, 34, 2.6, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 4, 2.6, [0, 1.4, 2.1], wall);
  b.door("entrance", [-0.7, 0, 0], 1.4, 2.1, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("lobby", [4, 0.2, 4], [0, -0.1, -2], floor);
  for (const [n, size, pos] of [
    ["lobby-w", [0.2, 3, 4], [-2, 1.5, -2]],
    ["lobby-e", [0.2, 3, 4], [2, 1.5, -2]],
    ["lobby-s", [4, 3, 0.2], [0, 1.5, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.sign(
    "rule",
    ["本日の出演者は", "3 名です"],
    [1.6, 0.6],
    [1.2, 1.7, 0.12],
    0,
    {
      bg: "#e8dcc0",
      fg: "#601010",
      glow: 0.5,
    },
  );
  b.sign(
    "title",
    ["恐怖の屋敷", "—— 所要時間 約5分 ——"],
    [1.8, 0.5],
    [-0.6, 2.2, 0.12],
    0,
    {
      bg: "#300808",
      fg: "#ff5050",
      glow: 0.7,
    },
  );

  // ---- 通路の飾り ----
  for (const [i, z] of [5, 11, 13, 19, 21, 27].entries()) {
    const side = i % 2 === 0 ? -1.7 : 1.7;
    b.box(`prop-${i}`, [0.4, 1.4, 0.8], [side, 0.7, z], prop);
  }
  b.box("coffin", [0.7, 0.5, 1.8], [-1.4, 0.25, 15], prop);
  b.sign(
    "ofuda",
    ["お札", "勝手に はがさないで"],
    [0.5, 0.7],
    [-1.88, 1.6, 22],
    -Math.PI / 2,
    {
      bg: "#e8dcb0",
      fg: "#a01010",
      glow: 0.35,
    },
  );
  b.box("blood", [0.02, 0.8, 0.6], [1.9, 1.2, 9], red, { collide: false });

  // ---- 出口 ----
  b.door("exit", [-0.7, 0, 34], 1.4, 2.1, 0, b.mat("#2a3a2a"), {
    locked: true,
    interactive: false,
  });
  b.sign("exit-sign", ["非常口"], [1.0, 0.3], [0, 2.4, 33.85], 0, {
    bg: "#0a3014",
    fg: "#70ff90",
    glow: 0.9,
  });
  b.box("exit-glow", [1.0, 0.3, 0.02], [0, 2.4, 33.9], exitMat, {
    collide: false,
  });

  // ---- 提灯 ----
  b.lamp("lantern", [0, 2.2, 6], "#ff4020", 0.5, 8, true);
  b.lamp("lantern", [0, 2.2, 14], "#ff6030", 0.5, 8, true);
  b.lamp("lantern", [0, 2.2, 22], "#ff4020", 0.5, 8, true);
  b.lamp("lantern", [0, 2.2, 30], "#ff6030", 0.5, 8, true);

  // ---- 出演者 ----
  const style = (cloth: string) => ({
    skin: "#d8d0c8",
    hair: "#060606",
    cloth,
    eyes: "#c01010",
    height: 1.0,
    longHair: true,
  });
  const a1 = b.figure("actor-1", [-1.0, 0, 8.5], style("#e8e8e0"), false);
  a1.rotation.y = Math.PI;
  const a2 = b.figure("actor-2", [1.0, 0, 16.5], style("#a83030"), false);
  a2.rotation.y = Math.PI;
  const a3 = b.figure("actor-3", [0, 0, 24.5], style("#30305a"), false);
  a3.rotation.y = Math.PI;
  const a4 = b.figure(
    "actor-4",
    [0, 0, 2.5],
    {
      skin: "#b8bcb8",
      hair: "#060606",
      cloth: "#e8e4dc",
      eyes: "#000000",
      height: 1.08,
      longHair: true,
    },
    false,
  );
  a4.rotation.y = 0;
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#b8bcb8",
      hair: "#060606",
      cloth: "#e8e4dc",
      eyes: "#000000",
      height: 1.08,
      longHair: true,
    },
    false,
  );
  return {};
};
