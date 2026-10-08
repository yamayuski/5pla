import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 幼稚園の遊戯室。x=-6〜6, z=0〜12（入口 z=0）、天井 3m。小さな机と椅子、壁一面の園児の絵、北のピアノ。
 * draw-a（かわいい絵）は途中で draw-b（黒い影の絵）に差し替わる。kid-0〜3 は机に向かう園児の人影（高さ約0.5）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#c8a870");
  const wall = b.mat("#e8dcc0");
  const ceiling = b.mat("#d8d0c0");
  const red = b.mat("#c02828");
  const blue = b.mat("#2858b8");
  const yellow = b.mat("#e0b820");
  const wood = b.mat("#8a6a44");
  const black = b.mat("#0a0a0c", { specular: 0.5 });
  const mat1 = b.mat("#f0b0c0");

  b.room("room", [0, 0, 6], 12, 12, 3, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 12, 3, [0, 1.0, 2.1], wall);
  b.door("room-door", [-0.5, 0, 0], 1.0, 2.1, 0, wood, {
    open: true,
    interactive: false,
  });
  b.box("hall", [12, 0.2, 3], [0, -0.1, -1.5], floor);
  for (const [n, size, pos] of [
    ["hall-w", [0.2, 4, 3], [-6, 2, -1.5]],
    ["hall-e", [0.2, 4, 3], [6, 2, -1.5]],
    ["hall-s", [12, 4, 0.2], [0, 2, -3]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.sign("room-name", ["ひよこぐみ"], [1.2, 0.4], [1.2, 1.9, 0.12], 0, {
    bg: "#f8e060",
    fg: "#7a3a10",
    glow: 0.4,
  });
  // 床のマット
  b.box("carpet", [5, 0.02, 4], [0, 0.01, 6], mat1, { collide: false });

  // ---- 小さな机と椅子 ----
  for (const [i, x] of [-3.6, -1.2, 1.2, 3.6].entries()) {
    b.box(`table-${i}`, [1.2, 0.45, 0.8], [x, 0.38, 4.5], wood);
    b.box(`chair-${i}`, [0.4, 0.28, 0.4], [x, 0.2, 5.4], i % 2 ? blue : red, {
      collide: false,
    });
  }
  // 積み木
  const blocks = b.box("blocks", [0.5, 0.3, 0.4], [-3.5, 0.15, 2.6], yellow, {
    collide: false,
  });
  b.register("blocks", blocks);
  b.box("block-b", [0.25, 0.25, 0.25], [-3.0, 0.13, 2.8], red, {
    collide: false,
  });
  b.box("toybox", [0.9, 0.4, 0.6], [-4.8, 0.2, 2.6], blue);

  // ---- 壁の絵（かわいい絵 → 黒い影の絵に差し替え） ----
  const drawA = new TransformNode("draw-a", b.scene);
  const drawB = new TransformNode("draw-b", b.scene);
  for (const [i, z] of [2.5, 4.5, 6.5, 8.5, 10.5].entries()) {
    const a = b.sign(
      `draw-a-${i}`,
      ["おかあさん", "だいすき"],
      [0.9, 0.7],
      [-5.88, 1.5, z],
      -Math.PI / 2,
      {
        bg: "#fff6d0",
        fg: "#c04080",
        glow: 0.3,
      },
    );
    a.parent = drawA;
    const bb = b.sign(
      `draw-b-${i}`,
      ["せんせい", "みてる"],
      [0.9, 0.7],
      [-5.86, 1.5, z],
      -Math.PI / 2,
      {
        bg: "#1c1414",
        fg: "#d82020",
        glow: 0.4,
      },
    );
    bb.parent = drawB;
  }
  drawB.setEnabled(false);
  b.register("draw-a", drawA);
  b.register("draw-b", drawB);

  // ---- ピアノ ----
  b.box("piano-body", [1.6, 1.1, 0.7], [0, 0.55, 11.4], black);
  b.box("piano-keys", [1.4, 0.04, 0.3], [0, 0.95, 10.9], b.mat("#f4f4f0"), {
    collide: false,
  });
  b.box("piano-stool", [0.5, 0.45, 0.4], [0, 0.23, 10.4], wood, {
    collide: false,
  });
  const piano = b.box("piano", [1.0, 0.2, 0.4], [0, 1.25, 11.4], black, {
    collide: false,
  });
  b.register("piano", piano);

  // ---- 園児と先生 ----
  for (const [i, x] of [-3.6, -1.2, 1.2, 3.6].entries()) {
    const k = b.figure(
      `kid-${i}`,
      [x, 0, 5.1],
      {
        skin: "#c8c4bc",
        hair: "#0a0a0c",
        cloth: i % 2 ? "#e8d040" : "#d85050",
        eyes: "#000000",
        height: 0.52,
        longHair: i % 2 === 0,
      },
      false,
    );
    k.rotation.y = 0;
  }
  b.figure(
    "teacher",
    [0, 0, 10.0],
    {
      skin: "#c8c4bc",
      hair: "#0a0a0c",
      cloth: "#f0e8d8",
      eyes: "#000000",
      height: 1.04,
      longHair: true,
    },
    false,
  );

  // ---- 照明 ----
  b.lamp("room", [-3, 2.8, 4], "#fff0d8", 0.55, 9, true);
  b.lamp("room", [3, 2.8, 8], "#fff0d8", 0.55, 9, true);
  return {};
};
