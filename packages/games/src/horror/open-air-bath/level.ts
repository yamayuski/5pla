import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 山の宿の露天風呂（屋外）。デッキ x=-6〜6, z=0〜8 と、その奥の湯船 x=-4〜4, z=8〜16（湯船には入れない）。
 * 湯の中の「頭」(head-1〜3)が水面に浮かぶ。脱衣所への戸 bath-door は z=0。最後に head-3 が手前の縁へ寄ってくる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const deck = b.mat("#6a5038");
  const rock = b.mat("#3a3a3c", { specular: 0.3 });
  const water = b.mat("#4a8aa8", {
    emissive: "#1a3848",
    alpha: 0.85,
    specular: 0.8,
  });
  const wood = b.mat("#4a3828");
  const hair = b.mat("#050505");
  const skin = b.mat("#c8c8c0", { emissive: "#2a2a28" });
  const glass = b.mat("#3a2a1c");

  b.box("deck", [12, 0.2, 8], [0, -0.1, 4], deck);
  b.box("pool-floor", [8, 0.2, 8], [0, -0.6, 12], rock);
  b.box("water", [8, 0.1, 8], [0, -0.05, 12], water, { collide: false });
  b.box("pool-block", [8, 1.2, 8], [0, 0.3, 12], rock).isVisible = false;
  for (const [n, size, pos] of [
    ["rim-w", [0.8, 0.5, 8], [-4.4, 0.15, 12]],
    ["rim-e", [0.8, 0.5, 8], [4.4, 0.15, 12]],
    ["rim-n", [9.6, 0.5, 0.8], [0, 0.15, 16.4]],
    ["rim-s", [8, 0.5, 0.4], [0, 0.15, 7.8]],
  ] as const) {
    b.box(n, size, pos, rock);
  }
  for (const [n, size, pos] of [
    ["fence-w", [0.2, 3, 18], [-6, 1.5, 8]],
    ["fence-e", [0.2, 3, 18], [6, 1.5, 8]],
    ["fence-n", [12, 3, 0.2], [0, 1.5, 17]],
  ] as const) {
    b.box(n, size, pos, wood);
  }
  b.box("deck-w", [2, 0.2, 10], [-5, -0.1, 12.5], deck);
  b.box("deck-e", [2, 0.2, 10], [5, -0.1, 12.5], deck);

  // ---- 脱衣所への戸 ----
  b.wallWithGap("house", "x", [0, 0, 0], 12, 3, [0, 1.2, 2.1], wood);
  b.door("bath-door", [-0.6, 0, 0], 1.2, 2.1, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("changing", [12, 0.2, 4], [0, -0.1, -2], deck);
  for (const [n, size, pos] of [
    ["ch-w", [0.2, 4, 4], [-6, 2, -2]],
    ["ch-e", [0.2, 4, 4], [6, 2, -2]],
    ["ch-s", [12, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wood).isVisible = false;
  }
  b.sign(
    "rule",
    ["露天風呂", "本日の貸切 おひとり様"],
    [2.0, 0.6],
    [2.5, 1.9, 0.12],
    0,
    {
      bg: "#e8dcc0",
      fg: "#401810",
      glow: 0.4,
    },
  );
  const tap = b.box("bath-edge", [1.6, 0.2, 0.5], [0, 0.4, 7.4], wood, {
    collide: false,
  });
  b.register("bath-edge", tap);

  // ---- 湯の中の頭 ----
  for (const [i, pos] of [
    [-2.5, 15.0],
    [2.6, 13.2],
    [0, 10.0],
  ].entries()) {
    const [x, z] = pos as [number, number];
    const g = new TransformNode(`head-${i + 1}`, b.scene);
    g.position.set(x, 0.12, z);
    b.cylinder(`head-hair-${i + 1}`, 0.3, 0.32, [0, 0, 0], hair, {
      collide: false,
    }).parent = g;
    b.box(`head-face-${i + 1}`, [0.2, 0.2, 0.04], [0, -0.02, 0.17], skin, {
      collide: false,
      parent: g,
    });
    g.rotation.y = 0;
    b.register(`head-${i + 1}`, g);
    g.setEnabled(false);
  }

  // ---- 灯り ----
  b.lamp("lantern", [-4.5, 1.6, 5], "#ffb060", 0.55, 9, true);
  b.lamp("lantern", [4.5, 1.6, 5], "#ffb060", 0.55, 9, true);
  b.lamp("lantern", [0, 1.6, 15], "#ffb060", 0.45, 9, true);

  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#b8c4c0",
      hair: "#050505",
      cloth: "#e8e8e8",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  return {};
};
