import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 飲食店のバックヤードと冷凍庫。x=-3〜3、バックヤード z=0〜4、冷凍庫 z=4〜16（天井 2.8m）。
 * 入口 z=0 の back-door、冷凍庫の扉 freezer-door(z=4)。奥(z=15.5)に業務用アイス(ice-box)。
 * 冷凍庫の中央に吊られた肉のレール、扉の内側の非常ボタン(em-button)、霜の落書き(frost-0/frost-1)。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const tile = b.mat("#b8c0c0", { specular: 0.4 });
  const wall = b.mat("#d0d8d8");
  const iceWall = b.mat("#c8e0ec", { emissive: "#182830", specular: 0.6 });
  const ceiling = b.mat("#98a0a0");
  const steel = b.mat("#a8b0b4", { specular: 0.8 });
  const glass = b.mat("#b8d8e8", { alpha: 0.2, specular: 0.8 });
  const meat = b.mat("#a03038", { emissive: "#200808" });
  const red = b.mat("#e02020", { emissive: "#901010" });

  // ---- バックヤード ----
  b.room("kitchen", [0, 0, 2], 6, 4, 2.8, { floor: tile, wall, ceiling }, [
    "s",
    "n",
  ]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 2.8, [0, 1.8, 2.2], wall);
  b.door("back-door", [-0.9, 0, 0], 1.8, 2.2, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("outside", [6, 0.2, 4], [0, -0.1, -2], tile);
  for (const [n, size, pos] of [
    ["out-w", [0.2, 4, 4], [-3, 2, -2]],
    ["out-e", [0.2, 4, 4], [3, 2, -2]],
    ["out-s", [6, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.box("sink", [1.6, 0.9, 0.6], [-2.1, 0.45, 3.4], steel);
  b.box("shelf-a", [0.5, 1.8, 1.6], [2.6, 0.9, 2], steel);
  b.sign(
    "memo",
    ["アイス", "在庫 補充 ←冷凍庫"],
    [1.3, 0.5],
    [2.3, 1.6, 3.8],
    Math.PI,
    {
      bg: "#f4f0c8",
      fg: "#183060",
      glow: 0.3,
    },
  );

  // ---- 冷凍庫 ----
  b.room(
    "freezer",
    [0, 0, 10],
    6,
    12,
    2.8,
    { floor: tile, wall: iceWall, ceiling: iceWall },
    ["s"],
  );
  b.wallWithGap(
    "freezer-front",
    "x",
    [0, 0, 4],
    6,
    2.8,
    [0, 1.2, 2.1],
    iceWall,
  );
  b.door("freezer-door", [-0.6, 0, 4], 1.2, 2.1, 0, steel, {
    open: true,
    interactive: false,
  });
  const em = b.box("em-button", [0.2, 0.2, 0.1], [0.9, 1.4, 4.15], red, {
    collide: false,
  });
  b.register("em-button", em);
  b.sign("em-label", ["非常"], [0.3, 0.12], [0.9, 1.65, 4.15], 0, {
    bg: "#f8f0f0",
    fg: "#c01010",
    glow: 0.6,
  });
  for (const [i, z] of [6, 8, 10, 12, 14].entries()) {
    b.box(`crate-${i}`, [0.7, 0.5, 0.7], [-2.4, 0.25, z], b.mat("#c8b890"), {
      collide: true,
    });
  }
  const ice = b.box(
    "ice-box",
    [0.6, 0.4, 0.6],
    [0, 0.2, 15.4],
    b.mat("#e8f0f8", { emissive: "#405060" }),
    {
      collide: false,
    },
  );
  b.register("ice-box", ice);
  b.sign("frost-0", ["　"], [1.6, 0.8], [-2.88, 1.6, 9], -Math.PI / 2, {
    bg: "#c8e0ec",
    fg: "#c8e0ec",
    glow: 0.3,
  });
  b.sign(
    "frost-1",
    ["たすけて", "たすけて"],
    [1.6, 0.8],
    [-2.87, 1.6, 9],
    -Math.PI / 2,
    {
      bg: "#c8e0ec",
      fg: "#a0c0d8",
      glow: 0.3,
    },
  ).setEnabled(false);

  // ---- 吊られた肉 ----
  b.box("rail", [0.1, 0.1, 9], [0, 2.5, 10.5], steel, { collide: false });
  const hangers: TransformNode[] = [];
  for (let i = 0; i < 6; i++) {
    const g = new TransformNode(`hang-${i}`, b.scene);
    g.position.set(0, 2.5, 7 + i * 1.5);
    b.box(`meat-${i}`, [0.4, 1.0, 0.3], [0, -0.7, 0], meat, {
      collide: false,
      parent: g,
    });
    hangers.push(g);
  }

  // ---- 照明 ----
  b.lamp("kitchen", [0, 2.6, 2], "#f0f4f0", 0.5, 8, true);
  b.lamp("freezer", [0, 2.6, 7], "#d8ecff", 0.6, 9, true);
  b.lamp("freezer", [0, 2.6, 13], "#d8ecff", 0.6, 9, true);
  b.lamp("em", [0, 2.4, 5], "#ff2020", 0.8, 8, false).light.setEnabled(false);

  const hanger = b.figure(
    "hanger",
    [0, 1.3, 11],
    {
      skin: "#a8b8c0",
      hair: "#060606",
      cloth: "#d0d8e0",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  hanger.rotation.y = 0;
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#a8b8c0",
      hair: "#060606",
      cloth: "#d0d8e0",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );

  let swaying = false;
  return {
    update: (g, _dt) => {
      if (!swaying) {
        return;
      }
      for (const [i, h] of hangers.entries()) {
        h.rotation.x = Math.sin(g.elapsed * 1.6 + i) * 0.12;
      }
    },
    custom: {
      swayOn: () => {
        swaying = true;
      },
    },
  };
};
