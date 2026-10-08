import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 斎場の和室。x=-5〜5, z=0〜14（入口 z=0）。北の祭壇（z≈12）に棺。
 * lid は棺の蓋（TransformNode）で、move でずらす。portrait-a / b は遺影の差し替え。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const tatami = b.mat("#8a8a58");
  const wall = b.mat("#c8bca0");
  const ceiling = b.mat("#6a5a48");
  const wood = b.mat("#5a3e28");
  const black = b.mat("#08080a");
  const white = b.mat("#ece8e0", { emissive: "#262420" });
  const flower = b.mat("#f0f0f0", { emissive: "#303030" });
  const flowerY = b.mat("#e8d048", { emissive: "#403810" });
  const gold = b.mat("#b89838", { specular: 0.8 });
  const cushion = b.mat("#5a2a4a");

  b.room("hall", [0, 0, 7], 10, 14, 3.4, { floor: tatami, wall, ceiling }, [
    "s",
  ]);
  b.wallWithGap("front", "x", [0, 0, 0], 10, 3.4, [0, 1.6, 2.1], wall);
  b.door("hall-door", [-0.8, 0, 0], 1.6, 2.1, 0, wood, {
    open: true,
    interactive: false,
  });
  // 外：土間
  b.box("entry", [10, 0.2, 4], [0, -0.1, -2], b.mat("#3a3a3c"));
  for (const [n, size, pos] of [
    ["entry-w", [0.2, 4, 4], [-5, 2, -2]],
    ["entry-e", [0.2, 4, 4], [5, 2, -2]],
    ["entry-s", [10, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  // 玄関の靴（あとから増える）
  const shoes = new TransformNode("shoes", b.scene);
  for (let i = 0; i < 12; i++) {
    b.box(
      `shoe-${i}`,
      [0.12, 0.08, 0.3],
      [-3.5 + (i % 6) * 1.2, 0.04, -1.5 - Math.floor(i / 6) * 1.0],
      black,
      {
        collide: false,
        parent: shoes,
      },
    );
  }
  shoes.setEnabled(false);
  b.register("shoes", shoes);

  // 座布団
  for (const side of [-1, 1]) {
    for (const z of [4, 6, 8]) {
      b.box(
        `zabuton-${side}-${z}`,
        [0.8, 0.08, 0.8],
        [side * 2.4, 0.04, z],
        cushion,
        { collide: false },
      );
    }
  }

  // ---- 祭壇と棺 ----
  b.box("dais", [6, 0.3, 3.4], [0, 0.15, 12.2], wood);
  b.box("coffin-body", [0.8, 0.5, 2.0], [0, 0.55, 12.4], white);
  const lid = new TransformNode("lid", b.scene);
  lid.position.set(0, 0, 0);
  b.box("coffin-lid", [0.84, 0.1, 2.0], [0, 0.85, 12.4], white, {
    collide: false,
    parent: lid,
  });
  b.register("lid", lid);
  const hand = new TransformNode("coffin-hand", b.scene);
  b.box("hand-arm", [0.06, 0.06, 0.4], [0.35, 0.87, 11.7], b.mat("#d8d4d0"), {
    collide: false,
    parent: hand,
  });
  b.box("hand-palm", [0.1, 0.04, 0.12], [0.35, 0.87, 11.45], b.mat("#d8d4d0"), {
    collide: false,
    parent: hand,
  });
  hand.setEnabled(false);
  b.register("coffin-hand", hand);
  // 花
  for (const [i, x] of [-2.4, -1.8, 1.8, 2.4].entries()) {
    b.box(
      `flower-${i}`,
      [0.4, 1.1, 0.4],
      [x, 0.85, 12.8],
      i % 2 ? flowerY : flower,
      { collide: false },
    );
  }
  // 線香立てと燭台
  b.box("incense-stand", [0.3, 0.5, 0.3], [0, 0.55, 10.7], gold);
  const inc = b.box(
    "incense",
    [0.1, 0.1, 0.1],
    [0, 0.86, 10.7],
    b.mat("#d8c8b0"),
    { collide: false },
  );
  b.register("incense", inc);
  for (const [n, x] of [
    ["candle-a", -1.2],
    ["candle-b", 1.2],
  ] as const) {
    b.cylinder(`${n}-stick`, 0.6, 0.1, [x, 0.6, 11], gold, { collide: false });
    b.cylinder(`${n}-wax`, 0.3, 0.08, [x, 1.05, 11], white, { collide: false });
  }
  b.lamp("candle-a", [-1.2, 1.3, 11], "#ffa850", 0.55, 8, false);
  b.lamp("candle-b", [1.2, 1.3, 11], "#ffa850", 0.55, 8, false);
  b.lamp("hall", [0, 2.8, 4], "#ffd8a0", 0.2, 10, false);

  // ---- 遺影（差し替え） ----
  b.box("frame", [0.9, 1.15, 0.06], [0, 2.4, 13.9], black, { collide: false });
  const mkPortrait = (name: string, bad: boolean) => {
    const g = new TransformNode(name, b.scene);
    b.box(
      `${name}-bg`,
      [0.78, 1.0, 0.02],
      [0, 2.4, 13.86],
      b.mat("#d0ccc4", { emissive: "#3a3834" }),
      { collide: false, parent: g },
    );
    const eyeMat = bad ? black : b.mat("#201c18");
    for (const ex of [-0.15, 0.15]) {
      b.box(
        `${name}-eye${ex}`,
        bad ? [0.14, 0.2, 0.02] : [0.07, 0.03, 0.02],
        [ex, 2.55, 13.84],
        eyeMat,
        { collide: false, parent: g },
      );
    }
    b.box(
      `${name}-mouth`,
      bad ? [0.6, 0.12, 0.02] : [0.2, 0.025, 0.02],
      [0, 2.2, 13.84],
      bad ? black : b.mat("#6a3028"),
      { collide: false, parent: g },
    );
    return g;
  };
  const pa = mkPortrait("portrait-a", false);
  const pb = mkPortrait("portrait-b", true);
  pb.setEnabled(false);
  b.register("portrait-a", pa);
  b.register("portrait-b", pb);

  // ---- 起き上がる祖母（最初は非表示） ----
  const corpse = b.figure(
    "corpse",
    [0, 0.6, 12.4],
    {
      skin: "#c8c8c0",
      hair: "#e0e0dc",
      cloth: "#f4f4f0",
      eyes: "#000000",
      height: 0.9,
      longHair: true,
    },
    false,
  );
  corpse.rotation.y = Math.PI;
  return {};
};
