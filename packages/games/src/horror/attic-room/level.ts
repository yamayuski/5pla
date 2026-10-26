import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 祖母の家の屋根裏。x=-4〜4, z=0〜10、天井 2.8m。入口は階段側(z=0)の attic-door。
 * 奥(z=8.5)の台の上に、この屋根裏そっくりの人形の家(dollhouse)。中に小さな「自分」(mini-you)と、
 * 後から現れる小さな影(mini-ghost)。手前に古い行李(old-trunk)と揺り椅子(rocker)。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const planks = b.mat("#5a4430", { specular: 0.1 });
  const wall = b.mat("#6a5a48");
  const ceiling = b.mat("#3a2c20");
  const beam = b.mat("#2a1c12");
  const cloth = b.mat("#b8a890");
  const doll = b.mat("#c8b8a0");
  const glass = b.mat("#b8d8e8", { alpha: 0.2, specular: 0.8 });
  const red = b.mat("#8a2018");

  b.room("attic", [0, 0, 5], 8, 10, 2.8, { floor: planks, wall, ceiling }, [
    "s",
  ]);
  b.wallWithGap("front", "x", [0, 0, 0], 8, 2.8, [-2.5, 1.0, 2.1], wall);
  b.door("attic-door", [-3, 0, 0], 1.0, 2.1, 0, planks, {
    open: true,
    interactive: false,
  });
  b.box("stairs", [8, 0.2, 4], [0, -0.1, -2], planks);
  for (const [n, size, pos] of [
    ["stairs-w", [0.2, 4, 4], [-4, 2, -2]],
    ["stairs-e", [0.2, 4, 4], [4, 2, -2]],
    ["stairs-s", [8, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  for (const z of [2, 5, 8]) {
    b.box(`beam-${z}`, [8, 0.25, 0.25], [0, 2.65, z], beam, { collide: false });
  }
  b.box("window-frame", [0.1, 0.8, 0.8], [3.95, 1.7, 5], glass, {
    collide: false,
  });

  // ---- 荷物 ----
  const trunk = b.box(
    "old-trunk",
    [1.0, 0.6, 0.6],
    [-2.6, 0.3, 2.8],
    b.mat("#6a4a2a"),
  );
  b.register("old-trunk", trunk);
  b.box("boxes-a", [0.8, 0.6, 0.8], [2.8, 0.3, 2.4], cloth);
  b.box("boxes-b", [0.7, 0.5, 0.7], [3.1, 0.85, 2.4], cloth);
  b.box("wardrobe", [0.6, 2.0, 1.2], [-3.6, 1.0, 6.5], b.mat("#3a2a1c"));
  b.sign("xmas-box", ["クリスマス", "飾り"], [0.5, 0.25], [2.8, 0.6, 2.0], 0, {
    bg: "#c8b890",
    fg: "#8a1a10",
    glow: 0.25,
  });

  // ---- 揺り椅子 ----
  const rocker = new TransformNode("rocker", b.scene);
  rocker.position.set(2.6, 0, 6.4);
  b.box("rocker-seat", [0.6, 0.1, 0.6], [0, 0.5, 0], planks, {
    collide: false,
    parent: rocker,
  });
  b.box("rocker-back", [0.6, 0.8, 0.08], [0, 0.9, 0.3], planks, {
    collide: false,
    parent: rocker,
  });
  b.box("rocker-base", [0.7, 0.06, 0.9], [0, 0.05, 0], beam, {
    collide: false,
    parent: rocker,
  });

  // ---- 人形の家（台の上） ----
  b.box("table", [1.6, 0.8, 1.2], [0, 0.4, 8.6], planks);
  const dh = new TransformNode("dollhouse", b.scene);
  dh.position.set(0, 0.8, 8.6);
  b.box("dh-floor", [1.4, 0.04, 1.0], [0, 0.02, 0], doll, {
    collide: false,
    parent: dh,
  });
  b.box("dh-back", [1.4, 0.5, 0.04], [0, 0.27, 0.5], doll, {
    collide: false,
    parent: dh,
  });
  b.box("dh-w", [0.04, 0.5, 1.0], [-0.7, 0.27, 0], doll, {
    collide: false,
    parent: dh,
  });
  b.box("dh-e", [0.04, 0.5, 1.0], [0.7, 0.27, 0], doll, {
    collide: false,
    parent: dh,
  });
  b.box("dh-door", [0.2, 0.3, 0.04], [-0.4, 0.17, -0.5], red, {
    collide: false,
    parent: dh,
  });
  b.box("dh-trunk", [0.16, 0.1, 0.1], [-0.55, 0.09, 0.2], planks, {
    collide: false,
    parent: dh,
  });
  b.box("dh-rocker", [0.12, 0.12, 0.12], [0.5, 0.1, 0.1], planks, {
    collide: false,
    parent: dh,
  });
  b.lamp("doll", [0, 1.5, 8.6], "#ffe0a0", 0.35, 3.5, false).light.setEnabled(
    false,
  );

  const you = b.figure(
    "mini-you",
    [0, 0.84, 8.5],
    {
      skin: "#d8c8b0",
      hair: "#1a1410",
      cloth: "#6a7a9a",
      eyes: "#000000",
      height: 0.14,
    },
    false,
  );
  you.rotation.y = 0;
  const mini = b.figure(
    "mini-ghost",
    [0.55, 0.84, 8.95],
    {
      skin: "#c0c4c0",
      hair: "#050505",
      cloth: "#d8d4c8",
      eyes: "#000000",
      height: 0.14,
      longHair: true,
    },
    false,
  );
  mini.rotation.y = Math.PI;

  // ---- 照明 ----
  b.lamp("attic", [0, 2.5, 3], "#ffd090", 0.5, 8, true);
  b.lamp("attic", [0, 2.5, 7], "#ffd090", 0.4, 8, true);

  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c0c4c0",
      hair: "#050505",
      cloth: "#d8d4c8",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );

  let rocking = false;
  return {
    update: (g, _dt) => {
      if (rocking) {
        rocker.rotation.x = Math.sin(g.elapsed * 2.2) * 0.12;
      }
    },
    custom: {
      rockOn: () => {
        rocking = true;
      },
    },
  };
};
