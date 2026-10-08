import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 閉館後のプラネタリウム。x=-5〜5, z=0〜14、天井 4m。南(z=0)の dome-door が出入口。
 * 座席が3列(z=4,6,8)、中央奥(z=11)に投影機(projector)。天井に星空の板（sky-0 通常、sky-1 顔の配置、sky-2 巨大な顔）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const carpet = b.mat("#201828", { specular: 0.1 });
  const wall = b.mat("#2c2438");
  const ceiling = b.mat("#06060c");
  const seat = b.mat("#5a2a40");
  const metal = b.mat("#8a90a0", { specular: 0.7 });
  const door = b.mat("#3a2c48");

  b.room("dome", [0, 0, 7], 10, 14, 4, { floor: carpet, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 10, 4, [-3, 1.4, 2.2], wall);
  b.door("dome-door", [-3.7, 0, 0], 1.4, 2.2, 0, door, {
    open: true,
    interactive: false,
  });
  b.box("lobby", [10, 0.2, 4], [0, -0.1, -2], carpet);
  for (const [n, size, pos] of [
    ["lobby-w", [0.2, 4, 4], [-5, 2, -2]],
    ["lobby-e", [0.2, 4, 4], [5, 2, -2]],
    ["lobby-s", [10, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.sign(
    "poster",
    ["本日の星空", "秋の夜長と星座"],
    [2.2, 0.8],
    [-1.2, 1.7, 0.12],
    0,
    {
      bg: "#101840",
      fg: "#f8f0c0",
      glow: 0.5,
    },
  );

  // ---- 座席 ----
  for (const [r, z] of [4, 6, 8].entries()) {
    for (const x of [-3.5, -2, -0.5, 0.5, 2, 3.5]) {
      const g = new TransformNode(`seat-${r}-${x}`, b.scene);
      g.position.set(x, 0, z);
      b.box(`seat-b-${r}-${x}`, [0.8, 0.5, 0.7], [0, 0.25, 0], seat, {
        collide: false,
        parent: g,
      });
      b.box(`seat-r-${r}-${x}`, [0.8, 0.6, 0.15], [0, 0.8, -0.3], seat, {
        collide: false,
        parent: g,
      });
    }
  }

  // ---- 投影機 ----
  const proj = b.cylinder("projector", 1.0, 0.7, [0, 0.5, 11], metal);
  b.register("projector", proj);
  const head = b.cylinder("projector-head", 0.5, 0.9, [0, 1.3, 11], metal, {
    collide: false,
  });
  b.register("projector-head", head);

  // ---- 天井の星空 ----
  const sky0 = b.sign(
    "sky-0",
    [
      "·　✦　·　　✧　　·　✦",
      "　　·　　✧　·　　　✦",
      "✦　　·　　　✦　·　✧",
      "　·　✧　　·　　✦　　·",
      "✧　　·　✦　　　·　　✧",
    ],
    [9, 12],
    [0, 3.85, 7],
    0,
    {
      bg: "#04041a",
      fg: "#e8f0ff",
      glow: 0.8,
    },
  );
  sky0.rotation.x = Math.PI / 2;
  sky0.setEnabled(false);
  const sky1 = b.sign(
    "sky-1",
    [
      "　　·　　　　　　·",
      "　　　●　　　●　　",
      "　　　　　　　　　　",
      "　　　＼＿＿／　　　",
    ],
    [9, 12],
    [0, 3.84, 7],
    0,
    {
      bg: "#04041a",
      fg: "#f0f4ff",
      glow: 0.8,
    },
  );
  sky1.rotation.x = Math.PI / 2;
  sky1.setEnabled(false);
  const sky2 = b.sign(
    "sky-2",
    ["◉　　◉", "　", "ーーーー"],
    [9, 12],
    [0, 3.83, 7],
    0,
    {
      bg: "#14040a",
      fg: "#ff3030",
      glow: 1,
    },
  );
  sky2.rotation.x = Math.PI / 2;
  sky2.setEnabled(false);

  // ---- 照明 ----
  b.lamp("house", [-3, 3.6, 3], "#f0e0d0", 0.45, 9, true);
  b.lamp("house", [3, 3.6, 9], "#f0e0d0", 0.45, 9, true);
  b.lamp("star", [0, 3.4, 7], "#a0b0ff", 0.4, 12, false).light.setEnabled(
    false,
  );

  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c0c4d0",
      hair: "#060608",
      cloth: "#d8d8e8",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );

  let spin = 0;
  return {
    update: (_g, dt) => {
      if (spin > 0) {
        head.rotation.y += spin * dt;
      }
    },
    custom: {
      spinSlow: () => {
        spin = 0.5;
      },
      spinFast: () => {
        spin = 3;
      },
    },
  };
};
