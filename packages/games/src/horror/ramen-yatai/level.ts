import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 川沿いの遊歩道（屋外）に一台だけ出ている屋台のラーメン屋。道は x=-10〜10, z=0〜12（北に川の柵）。
 * 屋台 cart は x=0, z=7（カウンターは南向き、客は z≈6 に立つ）。暖簾 noren、赤ちょうちん group lantern、
 * 丼 bowl-1（自分）/ bowl-2（隣・誰もいない席）、勘定の札 bill。街灯 group street（東西）。
 * 屋台の中の店主 cook は最初から居て、ずっとうつむいている（頭 cook-towel）。
 * フック：lanternSway（ちょうちんが揺れる）、cookLookUp（店主が顔を上げる）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const ground = b.mat("#2a2a28");
  const wood = b.mat("#5a3a20");
  const roofMat = b.mat("#3a2a1a");
  const norenMat = b.mat("#1a1a40", { emissive: "#05050c" });
  const rail = b.mat("#5a5a58");
  const bowlMat = b.mat("#d8d0c0", { specular: 0.6 });
  const soup = b.mat("#a07030", { emissive: "#201004" });
  const white = b.mat("#e8e8e0");
  const dark = b.mat("#000000");

  b.box("ground", [20, 0.2, 14], [0, -0.1, 6], ground);
  b.box("river-rail", [20, 1.0, 0.1], [0, 0.5, 12], rail);
  b.box("river", [20, 0.1, 6], [0, -0.6, 15], b.mat("#05080c", { specular: 0.9 }), { collide: false });
  for (const [n, size, pos] of [
    ["edge-s", [20, 4, 0.2], [0, 2, -0.5]],
    ["edge-w", [0.2, 4, 14], [-10, 2, 6]],
    ["edge-e", [0.2, 4, 14], [10, 2, 6]],
  ] as const) {
    b.box(n, size, pos, dark).isVisible = false;
  }

  // ---- 街灯 ----
  for (const x of [-7, 7]) {
    b.cylinder(`pole-${x}`, 4, 0.12, [x, 2, 10.5], rail, { collide: false });
    b.lamp("street", [x, 3.9, 10.5], "#d8e0ff", 0.4, 10, true);
  }

  // ---- 屋台 ----
  const cart = new TransformNode("cart", b.scene);
  cart.position.set(0, 0, 7);
  b.box("cart-counter", [2.6, 1.05, 0.5], [0, 0.53, -0.2], wood, { parent: cart });
  b.box("cart-body", [2.8, 0.9, 1.4], [0, 0.45, 0.8], wood, { parent: cart });
  for (const [px, pz] of [
    [-1.35, -0.4],
    [1.35, -0.4],
    [-1.35, 1.4],
    [1.35, 1.4],
  ] as const) {
    b.box(`cart-post-${px}-${pz}`, [0.08, 2.3, 0.08], [px, 1.15, pz], wood, { parent: cart, collide: false });
  }
  b.box("cart-roof", [3.2, 0.1, 2.4], [0, 2.3, 0.5], roofMat, { parent: cart, collide: false });
  for (let k = 0; k < 5; k++) {
    b.box(`noren-${k}`, [0.5, 0.45, 0.02], [-1.08 + k * 0.54, 2.02, -0.45], norenMat, {
      parent: cart,
      collide: false,
    });
  }
  b.sign("noren-text", ["中華そば"], [1.6, 0.3], [0, 2.02, 6.53], 0, {
    bg: "#1a1a40",
    fg: "#f0f0f0",
    glow: 0.4,
  });
  const stoolMat = b.mat("#8a1a1a");
  for (const x of [-0.6, 0.6]) {
    b.cylinder(`stool-${x}`, 0.6, 0.35, [x, 0.3, 6.0], stoolMat);
  }
  // ちょうちん
  const lantern = new TransformNode("lantern-node", b.scene);
  lantern.position.set(-1.6, 2.2, 6.4);
  const lanternBody = b.cylinder("lantern-body", 0.5, 0.36, [0, -0.35, 0], b.mat("#d02010", { emissive: "#701008" }), {
    collide: false,
  });
  lanternBody.parent = lantern;
  b.lamp("lantern", [-1.6, 1.8, 6.2], "#ff7040", 0.6, 6, false);
  b.lamp("cart", [0, 2.1, 7.4], "#ffe0b0", 0.4, 4, true);

  // ---- 丼と札 ----
  const bowl = (name: string, x: number) => {
    const g = new TransformNode(name, b.scene);
    g.position.set(x, 1.06, 6.8);
    b.cylinder(`${name}-cup`, 0.14, 0.32, [0, 0.07, 0], bowlMat, { collide: false, diameterTop: 0.36 }).parent = g;
    b.cylinder(`${name}-soup`, 0.01, 0.3, [0, 0.13, 0], soup, { collide: false }).parent = g;
    g.setEnabled(false);
    b.register(name, g);
  };
  bowl("bowl-1", -0.6);
  bowl("bowl-2", 0.6);
  b.sign("menu", ["中華そば 六〇〇円", "お連れ様 二名"], [0.8, 0.3], [0, 1.25, 6.54], 0, {
    bg: "#f0e8d0",
    fg: "#202020",
    glow: 0.4,
  });
  const bill = b.box("bill", [0.2, 0.01, 0.12], [-0.3, 1.07, 6.75], white, { collide: false });
  bill.setEnabled(false);
  b.register("bill", bill);

  // ---- 店主（最初からいる。うつむいたまま） ----
  const cook = b.figure(
    "cook",
    [0, 0, 7.6],
    { skin: "#b0b0a8", cloth: "#e0dcd0", hair: "#101010", eyes: "#ff2010", longHair: false },
    true,
  );
  cook.rotation.set(0.35, Math.PI, 0);
  b.box("cook-towel", [0.3, 0.08, 0.3], [0, 1.6, 0], white, { collide: false, parent: cook });

  // ---- 動き ----
  let sway = 0;
  let lookUp = 0;
  return {
    update: (g, dt) => {
      sway = Math.max(0, sway - dt * 0.2);
      lantern.rotation.z = Math.sin(g.elapsed * 3) * 0.3 * sway;
      if (lookUp > 0) {
        lookUp = Math.max(0, lookUp - dt);
        cook.rotation.x = 0.35 * lookUp;
      }
    },
    custom: {
      lanternSway: (g) => {
        sway = 1;
        g.audio?.play("creak", { x: -1.6, y: 2, z: 6.4 }, 0.4);
      },
      cookLookUp: (g) => {
        lookUp = 1;
        g.audio?.play("breath", { x: 0, y: 1.5, z: 7.6 }, 0.8);
      },
    },
  };
};
