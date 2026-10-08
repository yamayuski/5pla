import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 結婚式場の宴会場。x=-8〜8, z=0〜20（入口 z=0）。丸テーブル6卓（x=±4.5, z=5,9,13）、通路の奥 z=16 にケーキ台、北にステージとスクリーン。
 * envelope は x=-4.5,z=9 のテーブルの上。guests は着席した黒い人影のグループ。
 */
const TABLES: [number, number][] = [
  [-4.5, 5],
  [-4.5, 9],
  [-4.5, 13],
  [4.5, 5],
  [4.5, 9],
  [4.5, 13],
];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const carpet = b.mat("#4a2a34");
  const wall = b.mat("#d8ccc0");
  const ceiling = b.mat("#b8aca0");
  const cloth = b.mat("#f4f0e8", { emissive: "#242220" });
  const chairMat = b.mat("#e0d8c8");
  const gold = b.mat("#c8a840", { specular: 0.8, emissive: "#201800" });
  const dark = b.mat("#0a0a0c");
  const wood = b.mat("#5a4030");
  const pink = b.mat("#f4d0d8", { emissive: "#403034" });

  // ---- 宴会場 ----
  b.room("hall", [0, 0, 10], 16, 20, 4.5, { floor: carpet, wall, ceiling }, [
    "s",
  ]);
  b.wallWithGap("front", "x", [0, 0, 0], 16, 4.5, [0, 1.6, 2.3], wall);
  b.door("hall-door", [-0.8, 0, 0], 1.6, 2.3, 0, wood, {
    open: true,
    interactive: false,
  });
  b.box("lobby", [16, 0.2, 4], [0, -0.1, -2], carpet);
  for (const [n, size, pos] of [
    ["lobby-w", [0.2, 4, 4], [-8, 2, -2]],
    ["lobby-e", [0.2, 4, 4], [8, 2, -2]],
    ["lobby-s", [16, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.sign(
    "welcome",
    ["Welcome", "ご結婚おめでとうございます"],
    [2.4, 0.7],
    [0, 2.8, 0.12],
    0,
    {
      bg: "#f4ece0",
      fg: "#6a3a48",
      glow: 0.5,
    },
  );

  // ---- 丸テーブルと椅子 ----
  const guests = new TransformNode("guests", b.scene);
  for (const [i, [tx, tz]] of TABLES.entries()) {
    b.cylinder(`table-${i}`, 0.8, 1.6, [tx, 0.4, tz], cloth);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      const cx = tx + Math.cos(a) * 1.3;
      const cz = tz + Math.sin(a) * 1.3;
      b.box(`chair-${i}-${k}`, [0.45, 0.5, 0.45], [cx, 0.25, cz], chairMat, {
        collide: false,
      });
      // 着席した黒い人影（最初は非表示）。ステージ(+z)を向く
      b.box(`guest-body-${i}-${k}`, [0.5, 0.6, 0.3], [cx, 0.85, cz], dark, {
        collide: false,
        parent: guests,
      });
      const head = b.cylinder(
        `guest-head-${i}-${k}`,
        0.26,
        0.24,
        [cx, 1.3, cz],
        dark,
        { collide: false, tess: 10 },
      );
      head.parent = guests;
    }
    b.cylinder(`centerpiece-${i}`, 0.5, 0.2, [tx, 1.05, tz], pink, {
      collide: false,
    });
  }
  guests.setEnabled(false);
  b.register("guests", guests);
  // 自分の席に置き忘れた封筒
  const env = b.box(
    "envelope",
    [0.24, 0.02, 0.16],
    [-4.1, 0.82, 9.2],
    b.mat("#e8e0c8", { emissive: "#383428" }),
    {
      collide: false,
    },
  );
  b.register("envelope", env);

  // ---- ステージとスクリーン ----
  b.box("stage", [12, 0.4, 3.5], [0, 0.2, 18.2], wood);
  const mkScreen = (
    name: string,
    lines: string[],
    bg: string,
    fg: string,
    z: number,
    enabled: boolean,
  ) => {
    const s = b.sign(name, lines, [6, 2.6], [0, 2.9, z], Math.PI, {
      bg,
      fg,
      glow: 0.9,
    });
    s.setEnabled(enabled);
    b.register(name, s);
  };
  b.box("screen-frame", [6.3, 2.9, 0.1], [0, 2.9, 19.95], dark, {
    collide: false,
  });
  mkScreen(
    "scr-a",
    ["Congratulations!", "Mr. & Mrs."],
    "#f0e0e4",
    "#7a3a50",
    19.88,
    true,
  );
  mkScreen(
    "scr-b",
    ["新郎  ■■■ ■■", "新婦  ████████"],
    "#18080c",
    "#e8d0d0",
    19.88,
    false,
  );
  b.box("head-table", [4, 0.9, 0.8], [0, 0.85, 18.4], cloth);
  for (const [i, x] of [-1.2, 1.2].entries()) {
    b.box(`head-chair-${i}`, [0.5, 0.6, 0.5], [x, 0.7, 19.1], chairMat, {
      collide: false,
    });
  }

  // ---- ウェディングケーキ ----
  b.cylinder("cake-table", 0.85, 1.2, [0, 0.43, 15.5], cloth);
  const cakeBase = b.cylinder("cake", 0.5, 0.8, [0, 1.1, 15.5], pink);
  b.register("cake", cakeBase);
  const top = new TransformNode("cake-top", b.scene);
  b.cylinder("cake-tier-2", 0.4, 0.55, [0, 1.55, 15.5], cloth, {
    collide: false,
  }).parent = top;
  b.cylinder("cake-tier-3", 0.3, 0.3, [0, 1.9, 15.5], pink, {
    collide: false,
  }).parent = top;
  b.box("cake-topper", [0.14, 0.2, 0.02], [0, 2.2, 15.5], gold, {
    collide: false,
    parent: top,
  });
  b.register("cake-top", top);

  // ---- 照明 ----
  b.lamp("hall", [-4, 4.2, 6], "#ffe0b0", 0.6, 10, true);
  b.lamp("hall", [4, 4.2, 6], "#ffe0b0", 0.6, 10, true);
  b.lamp("hall", [0, 4.2, 12], "#ffe0b0", 0.6, 10, true);
  b.lamp("spot", [0, 4, 17], "#fff4e0", 0.9, 8, false).light.setEnabled(false);
  b.lamp("cake", [0, 3.4, 14.5], "#fff0e0", 0.9, 5, false).light.setEnabled(
    false,
  );

  // ---- 花嫁 ----
  b.figure(
    "bride",
    [0, 0, 16.4],
    {
      skin: "#c8ccc8",
      hair: "#06060a",
      cloth: "#f8f8fc",
      eyes: "#000000",
      height: 1.06,
      longHair: true,
    },
    false,
  ).rotation.y = Math.PI;
  return {};
};
