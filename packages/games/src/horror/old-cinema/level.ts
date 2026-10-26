import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 名画座の場内。x=-5〜5, z=0〜16、天井 6m。南(z=0)に入口、北(z=16)にスクリーン。
 * 客席は通路(x=-1〜1)の左右に3席×5列（z=3.5, 5.5, 7.5, 9.5, 11.5）。
 * audience-a は前の2列、audience-b はその後ろの3列にあとから現れる客のシルエット。
 */
const ROWS = [3.5, 5.5, 7.5, 9.5, 11.5];
const SCREENS: [string, string[], string, string][] = [
  ["scr-0", ["特別上映", "『観客』"], "#101014", "#e8e8f0"],
  ["scr-1", ["客席を映した映像"], "#18181c", "#d8d8e0"],
  ["scr-2", ["あなたが映っている"], "#1c1414", "#e8d8d0"],
  ["scr-3", ["うしろ"], "#080808", "#d01010"],
  ["scr-4", ["　"], "#f8f8ff", "#f8f8ff"],
];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#2a1418");
  const wall = b.mat("#2e2428");
  const ceiling = b.mat("#14101a");
  const velvet = b.mat("#6a1a24");
  const dark = b.mat("#050506");
  const wood = b.mat("#4a3020");

  // ---- 場内とロビー ----
  b.room("hall", [0, 0, 8], 10, 16, 6, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 10, 6, [0, 1.2, 2.2], wall);
  b.door("cinema-door", [-0.6, 0, 0], 1.2, 2.2, 0, wood, {
    open: true,
    interactive: false,
  });
  b.room("lobby", [0, 0, -2.5], 6, 5, 3, { floor, wall, ceiling }, ["n"]);
  b.sign(
    "poster",
    ["最終上映会", "今夜 24:00"],
    [1.4, 0.9],
    [2.9, 1.7, -2.5],
    -Math.PI / 2,
    {
      bg: "#e8dcc0",
      fg: "#401010",
      glow: 0.3,
    },
  );
  b.sign("exit", ["非常口"], [0.7, 0.25], [0, 2.7, 0.12], 0, {
    bg: "#106030",
    fg: "#e8fff0",
    glow: 0.8,
  });

  // ---- スクリーン（文字を切り替えて「映像」にする） ----
  b.box("screen-frame", [8.4, 4.0, 0.1], [0, 2.4, 15.95], dark, {
    collide: false,
  });
  for (const [i, [name, lines, bg, fg]] of SCREENS.entries()) {
    const s = b.sign(name, lines, [8, 3.6], [0, 2.4, 15.88], Math.PI, {
      bg,
      fg,
      glow: i === 4 ? 1.4 : 0.9,
    });
    s.setEnabled(i === 0);
    b.register(name, s);
  }

  // ---- 客席 ----
  const audA = new TransformNode("audience-a", b.scene);
  const audB = new TransformNode("audience-b", b.scene);
  for (const [r, z] of ROWS.entries()) {
    for (const x of [-4, -3, -2, 2, 3, 4]) {
      b.box(`seat-${r}-${x}`, [0.8, 0.5, 0.6], [x, 0.25, z], velvet);
      b.box(
        `seat-back-${r}-${x}`,
        [0.8, 0.7, 0.12],
        [x, 0.8, z - 0.3],
        velvet,
        { collide: false },
      );
      // 客のシルエット（一部の席だけ）
      if ((r * 7 + Math.abs(x) * 3 + (x > 0 ? 1 : 0)) % 3 !== 0) {
        const parent = r < 2 ? audA : audB;
        b.box(`pax-body-${r}-${x}`, [0.5, 0.5, 0.25], [x, 1.0, z - 0.1], dark, {
          collide: false,
          parent,
        });
        const head = b.cylinder(
          `pax-head-${r}-${x}`,
          0.26,
          0.24,
          [x, 1.4, z - 0.1],
          dark,
          {
            collide: false,
            tess: 10,
          },
        );
        head.parent = parent;
      }
    }
  }
  audA.setEnabled(false);
  audB.setEnabled(false);
  b.register("audience-a", audA);
  b.register("audience-b", audB);

  // ---- 映写の光（入口上の映写窓から） ----
  b.box("booth", [1.6, 0.8, 0.2], [0, 4.6, 0.1], dark, { collide: false });
  b.box(
    "beam",
    [0.6, 0.5, 15],
    [0, 4.4, 8],
    b.mat("#e8f0ff", { emissive: "#6a7088", alpha: 0.08 }),
    { collide: false },
  );

  // ---- 照明 ----
  b.lamp("exit", [0, 2.5, 1.0], "#40ff90", 0.2, 5, false);
  b.lamp("screen", [0, 2.4, 14], "#b8c8ff", 0.5, 16, false);
  b.lamp("lobby", [0, 2.6, -2.5], "#ffd8a0", 0.5, 7, true);

  // ---- 逆光のシルエットと、最後の一発 ----
  b.figure(
    "silhouette",
    [0, 0, 14.2],
    {
      skin: "#000000",
      hair: "#000000",
      cloth: "#000000",
      eyes: "#000000",
      height: 1.05,
      longHair: true,
    },
    false,
  ).rotation.y = Math.PI;
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#d0d0cc",
      hair: "#040404",
      cloth: "#2a2a2e",
      eyes: "#000000",
      height: 1.05,
      longHair: true,
    },
    false,
  );
  return {};
};
