import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 大学図書館の地下・閉架書庫。x=-6〜6, z=0〜14。
 * 南壁 z=0 中央に入口の扉、入ってすぐ西に受付机。z=4〜12 に移動式の書架 5 列（x=-4,-2,0,2,4）と
 * 東の壁際に固定書架（x=5.7）。書架の間が通路で、一番東の通路（x≈4.9）が「913」の棚。
 * 書架は TransformNode `shelf-<x>` 単位で move できる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#5a5048");
  const wallMat = b.mat("#8a8678");
  const ceiling = b.mat("#4a4842");
  const steel = b.mat("#7a8288", { specular: 0.5 });
  const wood = b.mat("#6a4a2a");
  const bookColors = ["#6a2a2a", "#2a3a5a", "#3a4a2a", "#7a6a4a", "#4a2a4a"];
  const bookMats = bookColors.map((c) => b.mat(c));

  b.room("stacks", [0, 0, 7], 12, 14, 2.8, { floor, wall: wallMat, ceiling }, [
    "s",
  ]);
  b.wallWithGap("stacks-s", "x", [0, 0, 0], 12, 2.8, [0, 1.2, 2.2], wallMat);
  b.door("entrance", [-0.6, 0, 0], 1.2, 2.2, 0, b.mat("#5a4a3a"), {
    open: true,
    interactive: false,
  });

  // 受付机と返却された本
  b.box("desk", [1.8, 0.8, 0.7], [-3.6, 0.4, 1.4], wood);
  b.box("desk-lamp", [0.15, 0.4, 0.15], [-4.2, 1.0, 1.4], steel, {
    collide: false,
  });
  const deskBook = b.box(
    "book-desk",
    [0.25, 0.05, 0.35],
    [-3.3, 0.83, 1.4],
    b.mat("#8a1a1a"),
    {
      collide: false,
    },
  );
  deskBook.setEnabled(false);
  b.register("book-desk", deskBook);
  b.sign(
    "rules",
    ["閉架書庫", "私語厳禁", "閉館 21:00"],
    [0.9, 0.6],
    [-3.6, 1.7, 0.12],
    Math.PI,
    {
      bg: "#e8e0c8",
      fg: "#222",
      glow: 0.25,
    },
  );

  // 書架
  const shelf = (
    key: string,
    x: number,
    depth: number,
    z: number,
    len: number,
  ) => {
    const root = new TransformNode(key, b.scene);
    root.position.set(x, 0, z);
    b.box(`${key}-frame`, [depth, 2.4, len], [0, 1.2, 0], steel, {
      parent: root,
    });
    for (let lv = 0; lv < 5; lv++) {
      for (const side of [-1, 1]) {
        for (let s = 0; s < 3; s++) {
          const m =
            bookMats[
              (lv * 3 + s + (side > 0 ? 1 : 0) + Math.round(x)) %
                bookMats.length
            ];
          b.box(
            `${key}-books-${lv}-${side}-${s}`,
            [0.04, 0.3, len / 3 - 0.08],
            [(side * depth) / 2, 0.35 + lv * 0.45, -len / 3 + s * (len / 3)],
            m ?? wood,
            { collide: false, parent: root },
          );
        }
      }
    }
    b.register(key, root);
    return root;
  };
  for (const x of [-4, -2, 0, 2, 4]) {
    shelf(`shelf-${x}`, x, 0.6, 8, 8);
    // 書架の妻面のハンドル
    b.cylinder(`crank-${x}`, 0.06, 0.4, [x, 1.1, 3.95], steel, {
      collide: false,
    });
  }
  shelf("shelf-wall", 5.7, 0.5, 8, 8);

  // 分類番号の札（妻面、入口側を向く）
  const labels: [number, string][] = [
    [-5, "000"],
    [-3, "200"],
    [-1, "400"],
    [1, "600"],
    [3, "800"],
    [4.9, "913"],
  ];
  for (const [x, t] of labels) {
    b.sign(`label-${t}`, [t], [0.45, 0.22], [x, 2.55, 3.9], 0, {
      bg: "#f0ead8",
      fg: "#222",
      glow: 0.35,
    });
  }
  // 913 の棚の空き（本を戻す場所）
  const gap = b.box(
    "slot-913",
    [0.05, 0.3, 0.35],
    [4.33, 1.25, 9],
    b.mat("#101010", {
      emissive: "#0a0a0a",
    }),
    { collide: false },
  );
  b.register("slot-913", gap);
  b.sign("exit", ["非常口 →"], [0.8, 0.3], [4.9, 2.2, 13.88], 0, {
    bg: "#1a8a3a",
    fg: "#fff",
    glow: 0.9,
  });

  // ---- 照明 ----
  b.lamp("entrance", [-1.5, 2.6, 2], "#ffe8c0", 0.5, 7);
  b.lamp("stacks-a", [-3, 2.6, 8], "#e8f0ff", 0.4, 7);
  b.lamp("stacks-b", [3, 2.6, 8], "#e8f0ff", 0.4, 7);
  b.lamp("exit", [4.9, 2.4, 13.3], "#40ff80", 0.25, 4, false);

  // ---- 最後の一発：司書 ----
  b.figure(
    "librarian",
    [0, 0, 30],
    {
      skin: "#d4d2c8",
      hair: "#141210",
      cloth: "#3a3a40",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );

  return {};
};
