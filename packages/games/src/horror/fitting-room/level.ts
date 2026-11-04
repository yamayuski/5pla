import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉店間際のアパレル店。店内は x=-4〜4, z=0〜14（南の入口に自動ドア gate）。
 * 手前に服のラック、奥（z=13）に試着室が3つ並び、カーテン curtain-0/1/2（x=-2.4/0/2.4）。
 * 中央の試着室 booth-1 に figure-w が立つ。入口脇のレジ reg（x=-3, z=1.5）、売り出し札 tag。
 * フック：swingHangers（ハンガーの揺れ）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#5a4a3c");
  const wall = b.mat("#d8d2c8");
  const ceil = b.mat("#bdb8b0");
  const steel = b.mat("#9aa0a6", { specular: 0.6 });
  const cloth = [b.mat("#a03030"), b.mat("#304a80"), b.mat("#e0d8c0"), b.mat("#305a40")];
  const curtainMat = b.mat("#6a2a5a");
  const invisible = b.mat("#000000");

  b.room("shop", [0, 0, 7], 8, 14, 3, { floor, wall, ceiling: ceil }, ["s"]);
  b.wallWithGap("shop-front", "x", [0, 0, 0], 8, 3, [0, 2.6, 2.6], wall);
  b.door("gate", [-1.3, 0, 0], 2.6, 2.6, Math.PI / 2, steel, { open: true, interactive: false });
  for (const [n, size, pos] of [
    ["edge-s", [10, 4, 0.2], [0, 2, -3]],
    ["edge-w", [0.2, 4, 6], [-5, 2, -1]],
    ["edge-e", [0.2, 4, 6], [5, 2, -1]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  b.sign("sale", ["本日 20:00 閉店", "試着は 最後のお客様まで"], [2, 0.6], [-3.9, 1.9, 4], Math.PI / 2, {
    bg: "#f0e8d8",
    fg: "#702030",
    glow: 0.4,
  });
  const reg = b.box("reg", [0.9, 1, 0.6], [-3, 0.5, 1.8], steel);
  b.register("reg", reg);

  // 服のラック
  for (const [i, x, z] of [
    [0, -2, 4],
    [1, 2, 4.5],
    [2, -2, 8],
    [3, 2, 8.5],
  ] as const) {
    b.box(`rack-pole-${i}`, [1.6, 0.06, 0.06], [x, 1.5, z], steel);
    b.box(`rack-clothes-${i}`, [1.5, 0.9, 0.3], [x, 1.0, z], cloth[i]);
    b.box(`rack-foot-${i}`, [1.6, 0.05, 0.5], [x, 0.03, z], steel);
  }
  const hangers = b.box("hangers", [1.5, 0.3, 0.1], [2, 1.75, 4.5], steel, { collide: false });
  hangers.isPickable = false;

  // 試着室
  b.box("booth-wall-a", [0.1, 2.4, 1.6], [-3.6, 1.2, 13.1], wall);
  b.box("booth-wall-b", [0.1, 2.4, 1.6], [-1.2, 1.2, 13.1], wall);
  b.box("booth-wall-c", [0.1, 2.4, 1.6], [1.2, 1.2, 13.1], wall);
  b.box("booth-wall-d", [0.1, 2.4, 1.6], [3.6, 1.2, 13.1], wall);
  for (const [i, x] of [
    [0, -2.4],
    [1, 0],
    [2, 2.4],
  ] as const) {
    const c = b.box(`curtain-${i}`, [2.3, 2.0, 0.08], [x, 1.2, 12.3], curtainMat, { collide: false });
    c.isPickable = false;
    b.register(`curtain-${i}`, c);
  }
  b.box("booth-back", [8, 3, 0.2], [0, 1.5, 13.9], wall);
  b.sign("mirror", ["鏡", "（こちらを向いている）"], [1.6, 1.8], [0, 1.4, 13.78], Math.PI, {
    bg: "#8a9aa8",
    fg: "#d0e0f0",
    glow: 0.2,
  });

  const figW = b.figure(
    "figure-w",
    [0, 0, 13.1],
    { skin: "#d8d0c8", cloth: "#c0c0c8", hair: "#0a0a0a", eyes: "#000000", longHair: true },
    false,
  );
  figW.rotation.y = Math.PI;

  b.lamp("shop", [0, 2.8, 3], "#fff4e0", 0.8, 8, true);
  b.lamp("shop", [0, 2.8, 8], "#fff4e0", 0.8, 8, true);
  b.lamp("shop", [0, 2.8, 12], "#fff4e0", 0.7, 7, true);

  let swing = 0;
  return {
    update: (g) => {
      if (swing > 0) {
        swing = Math.max(0, swing - 0.004);
        hangers.rotation.z = Math.sin(g.elapsed * 14) * swing;
      }
    },
    custom: {
      swingHangers: (g) => {
        swing = 0.35;
        g.audio?.play("knock", { x: 2, y: 1.5, z: 4.5 }, 0.5);
      },
    },
  };
};
