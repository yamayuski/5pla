import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 学校の体育倉庫。x=-3〜3, z=0〜7、天井 3m。入口 z=0 の鉄扉(store-door)。
 * 奥(z≈6)に跳び箱の山。vault-4 / vault-5 は途中で増える段。右の壁際にボールカゴ(ball-cart)、左の隅に巻いたマット(mat-roll)。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#5a4a3a");
  const wall = b.mat("#8a8a84");
  const ceiling = b.mat("#505050");
  const vault = b.mat("#8a5a30");
  const vaultTop = b.mat("#3a3a40");
  const mat = b.mat("#3a5a8a");
  const steel = b.mat("#5a5e64", { specular: 0.5 });
  const moon = b.mat("#a8c0e8", { emissive: "#4a5a7a" });

  b.room("store", [0, 0, 3.5], 6, 7, 3, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 3, [0, 1.0, 2.1], wall);
  b.door("store-door", [-0.5, 0, 0], 1.0, 2.1, 0, steel, {
    open: true,
    interactive: false,
  });
  b.box("yard", [6, 0.2, 3], [0, -0.1, -1.5], floor);
  for (const [n, size, pos] of [
    ["yard-w", [0.2, 4, 3], [-3, 2, -1.5]],
    ["yard-e", [0.2, 4, 3], [3, 2, -1.5]],
    ["yard-s", [6, 4, 0.2], [0, 2, -3]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.box("window", [1.6, 0.5, 0.1], [0, 2.5, 6.93], moon, { collide: false });
  b.sign("tag", ["体育倉庫", "使用後は施錠"], [0.9, 0.4], [1.2, 1.8, 0.12], 0, {
    bg: "#e8e0c0",
    fg: "#201810",
    glow: 0.25,
  });

  // ---- 跳び箱の山（奥） ----
  for (let i = 0; i < 3; i++) {
    b.box(`vault-${i + 1}`, [1.4, 0.3, 1.0], [0, 0.15 + i * 0.3, 6.2], vault);
  }
  b.box("vault-top", [1.2, 0.12, 0.8], [0, 0.96, 6.2], vaultTop, {
    collide: false,
  });
  for (const [name, y] of [
    ["vault-4", 1.2],
    ["vault-5", 1.5],
  ] as const) {
    const m = b.box(name, [1.4, 0.3, 1.0], [0, y, 6.2], vault, {
      collide: false,
    });
    m.setEnabled(false);
    b.register(name, m);
  }
  b.box("vault-side", [1.0, 0.8, 0.9], [-1.8, 0.4, 6.0], vault);

  // ---- ボールカゴとボール ----
  b.box("ball-cart", [0.9, 0.7, 0.9], [2.2, 0.35, 2.4], steel);
  b.register(
    "ball-cart",
    b.box("ball-cart-top", [0.9, 0.1, 0.9], [2.2, 0.75, 2.4], steel, {
      collide: false,
    }),
  );
  for (let i = 0; i < 6; i++) {
    const s = MeshBuilder.CreateSphere(
      `cart-ball-${i}`,
      { diameter: 0.24 },
      b.scene,
    );
    s.position = new Vector3(
      1.95 + (i % 3) * 0.25,
      0.9,
      2.15 + Math.floor(i / 3) * 0.25,
    );
    s.material = b.mat(i % 2 ? "#c8601c" : "#e0e0e0");
  }
  const ball = MeshBuilder.CreateSphere("ball", { diameter: 0.24 }, b.scene);
  ball.position = new Vector3(2.2, 0.12, 1.9);
  ball.material = b.mat("#d8d8d0", { specular: 0.4 });
  b.register("ball", ball);

  // ---- 巻いたマット（左の隅）と、ほどけた中の少女 ----
  const roll = new TransformNode("mat-roll", b.scene);
  roll.position.set(-2.3, 0, 4.8);
  const rollBody = b.cylinder("mat-roll-body", 1.6, 0.7, [0, 0.8, 0], mat, {
    collide: false,
  });
  rollBody.parent = roll;
  b.box("mat-roll-strap", [0.74, 0.06, 0.74], [0, 1.2, 0], b.mat("#e0d0a0"), {
    collide: false,
    parent: roll,
  });
  b.register("mat-roll", roll);
  const girl = b.figure(
    "girl",
    [-1.6, 0, 4.2],
    {
      skin: "#c4c8c8",
      hair: "#06080a",
      cloth: "#e8e8f0",
      eyes: "#000000",
      height: 0.95,
      longHair: true,
    },
    false,
  );
  girl.rotation.y = 0;

  // ---- 照明（月明かり） ----
  b.lamp("moon", [0, 2.7, 6], "#9ab4ff", 0.7, 9, false);
  b.lamp("moon", [0, 2.7, 2], "#9ab4ff", 0.3, 7, false);
  return {};
};
