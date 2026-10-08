import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 深夜の歯科医院。x=-4〜4, z=0〜16、天井 3m。入口(z=0)の自動ドアが clinic-door。
 * z=0〜6 が待合室（受付ベル reception-bell）、z=6 の仕切り壁の開口の奥が診察室。
 * 診察台(chair, 0,12)、無影灯(op ランプ群)、壁のレントゲン写真(xray)、ライトスイッチ(lamp-switch)。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#c8ccc8", { specular: 0.4 });
  const wall = b.mat("#dfe6e4");
  const ceiling = b.mat("#b8bcb8");
  const glass = b.mat("#b8d8e8", { alpha: 0.2, specular: 0.8 });
  const vinyl = b.mat("#1f6a78", { specular: 0.4 });
  const metal = b.mat("#9aa0a4", { specular: 0.7 });
  const wood = b.mat("#8a6a48");
  const dark = b.mat("#101214");

  // ---- 建物 ----
  b.room("clinic", [0, 0, 8], 8, 16, 3, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 8, 3, [0, 1.8, 2.4], wall);
  b.door("clinic-door", [-0.9, 0, 0], 1.8, 2.4, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("street", [8, 0.2, 4], [0, -0.1, -2], floor);
  for (const [n, size, pos] of [
    ["street-w", [0.2, 4, 4], [-4, 2, -2]],
    ["street-e", [0.2, 4, 4], [4, 2, -2]],
    ["street-s", [8, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.wallWithGap("partition", "x", [0, 0, 6.5], 8, 3, [0, 2.6, 2.4], wall);
  b.sign(
    "clinic-sign",
    ["やまもと歯科", "急患 24時間受付"],
    [2.4, 0.7],
    [0, 2.3, 0.12],
    0,
    { bg: "#f4f8f6", fg: "#1f6a78", glow: 0.5 },
  );

  // ---- 待合室 ----
  b.box("sofa", [3, 0.5, 0.8], [-2.4, 0.25, 4.6], vinyl);
  b.box("magazines", [1.2, 0.4, 0.6], [-2.4, 0.2, 3.2], wood);
  b.box("desk", [2.4, 1.0, 0.8], [2.6, 0.5, 4.6], wood);
  const bell = b.box(
    "reception-bell",
    [0.2, 0.15, 0.2],
    [2.6, 1.08, 4.5],
    metal,
    {
      collide: false,
    },
  );
  b.register("reception-bell", bell);

  // ---- 診察室 ----
  const chair = new TransformNode("chair", b.scene);
  chair.position.set(0, 0, 12);
  b.box("chair-base", [0.5, 0.5, 0.5], [0, 0.25, 0], metal, {
    collide: false,
    parent: chair,
  });
  b.box("chair-seat", [0.8, 0.2, 1.0], [0, 0.65, 0], vinyl, {
    collide: false,
    parent: chair,
  });
  const back = b.box("chair-back", [0.8, 0.2, 1.2], [0, 1.0, -0.9], vinyl, {
    collide: false,
    parent: chair,
  });
  back.rotation.x = -0.6;
  b.box("chair-head", [0.4, 0.3, 0.2], [0, 1.45, -1.3], vinyl, {
    collide: false,
    parent: chair,
  });
  b.register("chair", chair);
  b.box("chair-guard", [1.2, 1.2, 1.8], [0, 0.6, 12], dark).isVisible = false;
  b.box("tray", [0.5, 1.0, 0.8], [1.3, 0.5, 11.2], metal);
  b.box("cabinet", [3, 2.0, 0.5], [-2.4, 1.0, 15.6], wood);
  b.box("sink", [0.8, 0.9, 0.6], [3.4, 0.45, 13.5], metal);
  const sw = b.box(
    "lamp-switch",
    [0.12, 0.2, 0.05],
    [1.6, 1.4, 15.85],
    b.mat("#e8e8e8", { emissive: "#506060" }),
    { collide: false },
  );
  b.register("lamp-switch", sw);

  // 壁のレントゲン写真
  b.sign(
    "xray",
    ["山本 様", "▟▙▟▙▟▙▟▙", "歯 33本"],
    [1.2, 0.8],
    [-3.85, 1.7, 12],
    -Math.PI / 2,
    { bg: "#0a1418", fg: "#a8d8e8", glow: 0.45 },
  ).isVisible = false;
  b.sign(
    "xray-base",
    ["山本 様", "▟▙▟▙▟▙▟▙", "歯 32本"],
    [1.2, 0.8],
    [-3.88, 1.7, 12],
    -Math.PI / 2,
    {
      bg: "#0a1418",
      fg: "#a8d8e8",
      glow: 0.3,
    },
  );

  // ---- 照明 ----
  b.lamp("wait", [0, 2.7, 3], "#e8f4f0", 0.6, 9, true);
  b.lamp("room", [0, 2.7, 10], "#e8f4f0", 0.55, 9, true);
  b.lamp("op", [0, 2.4, 12], "#fffbe8", 1.2, 7, true).light.setEnabled(false);

  // ---- 人影 ----
  const style = {
    skin: "#c8c8c0",
    hair: "#d8e8e0",
    cloth: "#7ab0a8",
    eyes: "#000000",
    height: 1.12,
  };
  b.figure("dentist", [-3, 0, 14.4], style, false).rotation.y = Math.PI;
  b.figure("ghost", [0, 0, -40], style, false);

  let turning = false;
  return {
    update: (_g, dt) => {
      if (turning) {
        const c = chair.rotation;
        c.y = Math.min(c.y + 0.9 * dt, 2.2);
      }
    },
    custom: {
      chairTurn: () => {
        turning = true;
      },
    },
  };
};
