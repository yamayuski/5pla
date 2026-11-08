import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 観覧車のゴンドラ。南の入口にシャッター shutter、奥（z=9）に作業台。
 * 合鍵マシン meter（x=0, z=7.0 付近の車体脇の操作箱）、作業台の人影 figure-w（車内 z=10.2）、
 * 店の蛍光灯 group garage。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#2a2b2d");
  const wall = b.mat("#5c6166");
  const roof = b.mat("#34363a");
  const steel = b.mat("#8a9096", { specular: 0.6 });
  const dark = b.mat("#101214");
  const red = b.mat("#b01818", { emissive: "#401010" });
  const invisible = b.mat("#000000");

  b.room("garage", [0, 0, 3.5], 3.2, 7, 2.6, { floor, wall, ceiling: roof }, ["s"]);
  b.wallWithGap("garage-front", "x", [0, 0, 0], 3.2, 2.6, [0, 1.0, 1.8], wall);
  b.door("shutter", [-0.9, 0, 0], 1.8, 2.0, Math.PI / 2, steel, { open: true, interactive: false });
  for (const [n, size, pos] of [
    ["edge-s", [10, 4, 0.2], [0, 2, -3]],
    ["edge-w", [0.2, 4, 6], [-5, 2, -1]],
    ["edge-e", [0.2, 4, 6], [5, 2, -1]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  b.sign("board", ["本日最終便", "一周 約15分"], [2.2, 0.7], [-1.55, 1.7, 2], Math.PI / 2, {
    bg: "#183018",
    fg: "#e8f0e0",
    glow: 0.4,
  });
  b.lamp("garage", [0, 2.4, 2], "#dfe8ff", 0.7, 9, true);
  b.lamp("garage", [0, 2.4, 5], "#dfe8ff", 0.6, 9, true);

  b.box("seat", [2.4, 0.5, 0.7], [0, 0.25, 6.3], b.mat("#5a2a2a"));

  // 合鍵マシン（車の手前の台）
  const meter = b.box("meter", [0.5, 0.5, 0.3], [1.2, 1.0, 3.4], dark);
  b.register("meter", meter);
  b.sign("meter-face", ["非常", "PUSH"], [0.45, 0.3], [1.2, 1.0, 3.24], Math.PI, {
    bg: "#101010",
    fg: "#ff3020",
    glow: 0.9,
  });
  b.box("post", [0.2, 1.0, 0.2], [1.2, 0.5, 3.4], steel);

  // 作業台の人影
  const figW = b.figure(
    "figure-w",
    [0, 0.5, 5.8],
    { skin: "#c0c4c8", cloth: "#1a1a22", hair: "#0a0a0a", eyes: "#000000", longHair: false },
    false,
  );
  figW.rotation.y = Math.PI;

  // 店の電話（鳴る）
  const phone = b.box("phone", [0.4, 0.2, 0.3], [-1.5, 1.0, 5], red);
  b.register("phone", phone);

  let door = false;
  return {
    update: () => {},
    custom: {
      doorOpen: (g) => {
        door = true;
        g.audio?.play("slam", { x: 0.9, y: 1, z: 9 }, 0.6);
      },
      _state: () => door,
    },
  };
};
