import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 地下駐輪場。部屋は x=-4〜4, z=0〜14。南の入口にシャッター shutter、奥（z=9）に自転車列。
 * 精算機 meter（x=0, z=7.0 付近の車体脇の操作箱）、奥の人影 figure-w（車内 z=10.2）、
 * 店の蛍光灯 group garage。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#2a2b2d");
  const wall = b.mat("#5c6166");
  const roof = b.mat("#34363a");
  const steel = b.mat("#8a9096", { specular: 0.6 });
  const yellow = b.mat("#d8b020");
  const dark = b.mat("#101214");
  const glass = b.mat("#203040", { alpha: 0.4 });
  const red = b.mat("#b01818", { emissive: "#401010" });
  const invisible = b.mat("#000000");

  b.room("garage", [0, 0, 7], 8, 14, 3.6, { floor, wall, ceiling: roof }, ["s"]);
  b.wallWithGap("garage-front", "x", [0, 0, 0], 8, 3.6, [0, 1.3, 2.6], wall);
  b.door("shutter", [-1.3, 0, 0], 2.6, 2.6, Math.PI / 2, steel, { open: true, interactive: false });
  for (const [n, size, pos] of [
    ["edge-s", [10, 4, 0.2], [0, 2, -3]],
    ["edge-w", [0.2, 4, 6], [-5, 2, -1]],
    ["edge-e", [0.2, 4, 6], [5, 2, -1]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  b.sign("board", ["終電後は出庫のみ", "13番 ・ ご利用中"], [2.2, 0.7], [-3.95, 1.9, 3], Math.PI / 2, {
    bg: "#183018",
    fg: "#e8f0e0",
    glow: 0.4,
  });
  b.lamp("garage", [0, 3.4, 3], "#dfe8ff", 0.7, 9, true);
  b.lamp("garage", [0, 3.4, 10], "#dfe8ff", 0.6, 9, true);

  // 自転車列
  b.box("bench-body", [2.0, 0.9, 4.4], [0, 0.65, 9], yellow);
  b.box("bench-cabin", [1.8, 0.8, 2.4], [0, 1.45, 9.2], glass).isPickable = false;
  b.box("bench-roof", [1.9, 0.1, 2.5], [0, 1.9, 9.2], yellow);
  b.box("bench-lamp", [0.6, 0.25, 0.3], [0, 2.05, 9.2], b.mat("#f0f0a0", { emissive: "#808030" }));
  for (const [x, z] of [[-0.95, 7.9], [0.95, 7.9], [-0.95, 10.4], [0.95, 10.4]] as const) {
    b.box(`wheel-${x}-${z}`, [0.2, 0.6, 0.6], [x, 0.3, z], dark);
  }
  const seatBack = b.box("seat-back", [1.6, 0.8, 0.2], [0, 1.2, 10.6], dark, { collide: false });
  seatBack.isPickable = false;

  // 自転車ラック（装飾）
  for (let i = 0; i < 6; i++) {
    for (const x of [-3.2, -2.4, 2.6, 3.4]) {
      const z = 2.5 + i * 1.1;
      b.box(`bike-${x}-${i}`, [0.1, 0.9, 0.7], [x, 0.5, z], dark, { collide: false }).isPickable = false;
      b.box(`bike-seat-${x}-${i}`, [0.12, 0.06, 0.25], [x, 1.0, z - 0.2], steel, { collide: false }).isPickable = false;
    }
  }

  // 精算機（車の手前の台）
  const meter = b.box("meter", [0.5, 0.5, 0.3], [1.5, 1.0, 6.4], dark);
  b.register("meter", meter);
  b.sign("meter-face", ["13", "出庫済"], [0.45, 0.3], [1.5, 1.0, 6.24], Math.PI, {
    bg: "#101010",
    fg: "#ff3020",
    glow: 0.9,
  });
  b.box("post", [0.2, 1.0, 0.2], [1.5, 0.5, 6.4], steel);

  // 奥の人影
  const figW = b.figure(
    "figure-w",
    [0, 0.5, 10.1],
    { skin: "#c0c4c8", cloth: "#1a1a22", hair: "#0a0a0a", eyes: "#000000", longHair: false },
    false,
  );
  figW.rotation.y = Math.PI;

  // 管理室の電話（鳴る）
  const phone = b.box("phone", [0.4, 0.2, 0.3], [-3.7, 1.0, 5], red);
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
