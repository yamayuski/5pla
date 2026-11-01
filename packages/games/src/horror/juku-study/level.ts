import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 雑居ビル3階の学習塾の自習室。室内は x=-4〜4, z=0〜8、北壁にホワイトボード board-a/b と時計 clock-a/b。
 * 仕切り付きの自習机（ブース）が 3列 × 3行、すべて北向き。自分の席は最前列の左 my-desk（x=-2.4, z=5.6）。
 * 南東の扉 class-door、空席の卓上ライトは lamps-on（まとめて点く）。最後はうしろの席に座る student。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6a6a62");
  const wall = b.mat("#d8d8cc");
  const ceiling = b.mat("#e8e8e0");
  const desk = b.mat("#c8b890");
  const part = b.mat("#5a6a7a");
  const chair = b.mat("#2a2a30");
  const lampOff = b.mat("#303030");
  const lampOn = b.mat("#fff8d0", { emissive: "#fff0c0" });

  b.room("study", [0, 0, 4], 8, 8, 2.7, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("south", "x", [0, 0, 0], 8, 2.7, [2.8, 0.9, 2.1], wall);
  b.door("class-door", [2.35, 0, 0], 0.9, 2.1, 0, b.mat("#7a8a9a"), {
    open: true,
    interactive: false,
  });
  b.box("hall-block", [2, 3, 0.2], [2.8, 1.5, -1.2], wall).isVisible = false;
  b.box("hall-w", [0.2, 3, 1.2], [1.8, 1.5, -0.6], wall).isVisible = false;
  b.box("hall-e", [0.2, 3, 1.2], [3.8, 1.5, -0.6], wall).isVisible = false;

  // ---- ホワイトボードと時計 ----
  b.box("board-frame", [3.2, 1.3, 0.05], [0.5, 1.5, 7.97], b.mat("#a0a0a0"), {
    collide: false,
  });
  const boardColors = { bg: "#f4f4f0", fg: "#1a3aa0", glow: 0.35 };
  b.sign("board-a", ["自習室 22:00 まで", "私語厳禁・最後の人は消灯"], [3, 1.1], [0.5, 1.5, 7.93], 0, boardColors);
  b.sign("board-b", ["まだ帰らないで", "うしろの席の子が まだ"], [3, 1.1], [0.5, 1.5, 7.92], 0, {
    bg: "#f4f4f0",
    fg: "#b01010",
    glow: 0.4,
  }).setEnabled(false);
  b.sign("clock-a", ["21:52"], [0.5, 0.25], [-2.8, 2.2, 7.95], 0, { bg: "#101010", fg: "#ff4030", glow: 0.9 });
  b.sign("clock-b", ["21:25"], [0.5, 0.25], [-2.8, 2.2, 7.94], 0, { bg: "#101010", fg: "#ff4030", glow: 0.9 }).setEnabled(
    false,
  );

  // ---- 自習ブース ----
  const lampsOn = new TransformNode("lamps-on", b.scene);
  for (const [r, z] of [5.6, 3.8, 2.0].entries()) {
    for (const x of [-2.4, 0, 2.4]) {
      const id = `${r}-${x}`;
      b.box(`desk-${id}`, [1.4, 0.75, 0.7], [x, 0.38, z + 0.4], desk);
      b.box(`back-${id}`, [1.4, 0.6, 0.04], [x, 1.05, z + 0.75], part, { collide: false });
      for (const sx of [-0.7, 0.7]) {
        b.box(`side-${id}-${sx}`, [0.04, 0.6, 0.7], [x + sx, 1.05, z + 0.4], part, { collide: false });
      }
      b.box(`chair-${id}`, [0.45, 0.45, 0.45], [x, 0.23, z - 0.2], chair);
      b.box(`lamp-${id}`, [0.25, 0.06, 0.12], [x + 0.45, 1.2, z + 0.55], lampOff, { collide: false });
      if (!(r === 0 && x === -2.4)) {
        b.box(`lampon-${id}`, [0.26, 0.07, 0.13], [x + 0.45, 1.2, z + 0.55], lampOn, {
          collide: false,
          parent: lampsOn,
        });
      }
    }
  }
  lampsOn.setEnabled(false);
  b.register("lamps-on", lampsOn);
  const myDesk = b.box("my-desk", [0.5, 0.04, 0.35], [-2.4, 0.78, 6.0], b.mat("#e8e0c8", { emissive: "#181818" }), {
    collide: false,
  });
  b.register("my-desk", myDesk);
  const sheet = b.sign("sheet", ["うしろの席を", "見て"], [0.42, 0.3], [-2.4, 0.815, 6.0], 0, {
    bg: "#f0f0e8",
    fg: "#a01010",
    glow: 0.5,
  });
  sheet.rotation.x = Math.PI / 2;
  sheet.setEnabled(false);

  // ---- 照明 ----
  b.lamp("room", [-1.5, 2.5, 4.5], "#f4f8ff", 0.55, 8, true);
  b.lamp("room", [1.5, 2.5, 2.5], "#f4f8ff", 0.55, 8, true);
  const deskLamp = b.lamp("desklamp", [-1.95, 1.3, 6.1], "#fff0c0", 0.45, 3, false);
  deskLamp.light.setEnabled(false);
  const red = b.lamp("red", [0, 2.5, 4], "#40ff60", 0.25, 9, false);
  red.light.setEnabled(false);

  // ---- うしろの席の生徒（座っているので縮める） ----
  b.figure(
    "student",
    [-2.4, 0.28, 3.6],
    { skin: "#b8bcb8", cloth: "#1a1a2a", hair: "#050505", eyes: "#000000", height: 0.82 },
    false,
  );
  return undefined;
};
