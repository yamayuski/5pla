import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜の山の参道（屋外）。幅6m(x=-3〜3)、z=-2〜52。朱の鳥居(torii-0〜torii-11、z=4+4*i)が連なり、
 * 突き当たり(z=50)に社と賽銭箱(offering-box)。神職の人影(priest)は鳥居の下に現れ、近づいてくる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const ground = b.mat("#222a20");
  const red = b.mat("#b82818", { emissive: "#400c08" });
  const black = b.mat("#14100e");
  const wood = b.mat("#5a4430");
  const stone = b.mat("#8a8c84");
  const trunk = b.mat("#14180f");

  b.box("path", [6, 0.2, 54], [0, -0.1, 25], ground);
  for (const [n, size, pos] of [
    ["block-w", [0.2, 4, 54], [-3.2, 2, 25]],
    ["block-e", [0.2, 4, 54], [3.2, 2, 25]],
    ["block-s", [6.4, 4, 0.2], [0, 2, -2.2]],
    ["block-n", [6.4, 4, 0.2], [0, 2, 52.2]],
  ] as const) {
    b.box(n, size, pos, trunk).isVisible = false;
  }
  // 木立
  for (let i = 0; i < 16; i++) {
    const side = i % 2 === 0 ? -3.8 : 3.8;
    b.cylinder(`tree-${i}`, 6, 0.8, [side, 3, 2 + i * 3.2], trunk, {
      collide: false,
    });
  }

  // ---- 鳥居 ----
  for (let i = 0; i < 12; i++) {
    const g = new TransformNode(`torii-${i}`, b.scene);
    g.position.set(0, 0, 4 + i * 4);
    for (const sx of [-1.8, 1.8]) {
      b.cylinder(`torii-p-${i}-${sx}`, 3.4, 0.35, [sx, 1.7, 0], red, {
        collide: false,
      }).parent = g;
    }
    b.box(`torii-k-${i}`, [4.6, 0.3, 0.4], [0, 3.2, 0], red, {
      collide: false,
      parent: g,
    });
    b.box(`torii-n-${i}`, [4.0, 0.2, 0.3], [0, 2.6, 0], red, {
      collide: false,
      parent: g,
    });
    b.box(`torii-t-${i}`, [5.2, 0.15, 0.55], [0, 3.45, 0], black, {
      collide: false,
      parent: g,
    });
    b.register(`torii-${i}`, g);
  }

  // ---- 石灯籠 ----
  for (const [i, z] of [6, 14, 22, 30, 38].entries()) {
    const x = i % 2 === 0 ? -2.4 : 2.4;
    b.box(`lantern-base-${i}`, [0.4, 0.8, 0.4], [x, 0.4, z], stone);
    b.box(`lantern-head-${i}`, [0.6, 0.5, 0.6], [x, 1.05, z], stone);
  }
  b.lamp("lantern", [-2.4, 1.1, 14], "#ffb060", 0.7, 9, false);
  b.lamp("lantern", [2.4, 1.1, 30], "#ffb060", 0.7, 9, false);
  b.lamp("lantern", [-2.4, 1.1, 46], "#ffb060", 0.7, 9, false);

  // ---- 社と賽銭箱 ----
  b.box("shrine", [4, 3, 3], [0, 1.5, 50.5], wood, { collide: true });
  b.box("shrine-roof", [5, 0.4, 4], [0, 3.2, 50.5], black, { collide: false });
  const off = b.box("offering-box", [1.4, 0.7, 0.7], [0, 0.35, 48.6], wood);
  b.register("offering-box", off);
  b.sign(
    "sign",
    ["参道の掟", "百の鳥居を、振り返るべからず"],
    [1.6, 0.7],
    [-1.3, 1.5, 3.9],
    Math.PI,
    {
      bg: "#e8dcc0",
      fg: "#400c08",
      glow: 0.4,
    },
  );

  // ---- 神職の人影 ----
  const priest = b.figure(
    "priest",
    [0, 0, 32],
    {
      skin: "#c8c8c0",
      hair: "#060606",
      cloth: "#e8e8e0",
      eyes: "#000000",
      height: 1.12,
    },
    false,
  );
  priest.rotation.y = Math.PI;
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c8c8c0",
      hair: "#060606",
      cloth: "#e8e8e0",
      eyes: "#000000",
      height: 1.12,
    },
    false,
  );
  let chasing = false;
  return {
    update: (g, dt) => {
      const p = g.node("priest");
      if (!chasing || !p) {
        return;
      }
      const c = g.camera.position;
      const dx = c.x - p.position.x;
      const dz = c.z - p.position.z;
      const d = Math.hypot(dx, dz);
      if (d > 2) {
        p.position.x += (dx / d) * 1.6 * dt;
        p.position.z += (dz / d) * 1.6 * dt;
      }
      p.rotation.y = Math.atan2(dx, dz);
    },
    custom: {
      chaseOn: () => {
        chasing = true;
      },
    },
  };
};
