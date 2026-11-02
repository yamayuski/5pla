import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉店後のホームセンター。売り場 x=-6〜6, z=0〜22。南端（z=0）が従業員口、北端（z=21）がレジ。
 * 棚列 x=±3.5（z=5〜17）、中央通路。店内ラジオ radio（x=-2.4, z=8）、天井の蛍光灯は group hall。
 * 従業員口は shutter（最初は非表示、フック shutterDown で降りて塞ぐ）。
 * レジ奥の clerk（最初から背を向けて立つ）と、最後に飛び出す clerk-face。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#8a8a84");
  const wall = b.mat("#b8b4a8");
  const shelf = b.mat("#2a4a8a");
  const dark = b.mat("#000000");
  const wood = b.mat("#8a6a40");
  const orange = b.mat("#e06a10");
  const steel = b.mat("#7a7e84");

  b.box("floor", [12, 0.1, 23], [0, -0.05, 11], floor);
  b.box("ceil", [12, 0.1, 23], [0, 3.6, 11], b.mat("#505050"), { collide: false });
  b.box("wall-w", [0.2, 3.6, 23], [-6, 1.8, 11], wall);
  b.box("wall-e", [0.2, 3.6, 23], [6, 1.8, 11], wall);
  b.box("wall-n", [12, 3.6, 0.2], [0, 1.8, 22.2], wall);
  b.box("wall-s", [12, 3.6, 0.2], [0, 1.8, -0.2], wall);

  // ---- 棚と商品 ----
  for (const side of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const z = 6 + k * 3.4;
      b.box(`shelf-${side}-${k}`, [1.0, 2.4, 2.8], [side * 3.6, 1.2, z], shelf);
      b.box(`goods-${side}-${k}`, [0.8, 0.4, 2.4], [side * 3.2, 1.2, z], k % 2 ? orange : wood, { collide: false });
    }
  }
  b.box("pallet-a", [1.2, 1.4, 1.2], [4.8, 0.7, 2.6], wood);
  b.box("pallet-b", [1.2, 1.0, 1.2], [-4.8, 0.5, 3.2], wood);
  b.box("ladder", [0.5, 2.0, 0.1], [-1.6, 1.0, 19.6], steel, { collide: false }).rotation.z = 0.15;

  // ---- 店内ラジオ ----
  const radio = b.box("radio", [0.4, 0.25, 0.2], [-2.4, 1.1, 8.0], b.mat("#c8c8c0"));
  b.register("radio", radio);
  b.box("radio-stand", [0.7, 1.0, 0.5], [-2.4, 0.5, 8.0], wood);

  // ---- レジと店員 ----
  const counter = b.box("counter", [3.0, 1.0, 0.9], [0, 0.5, 20.0], b.mat("#3a3a3a"));
  counter.isPickable = false;
  b.box("register", [0.5, 0.3, 0.4], [0.6, 1.15, 20.0], b.mat("#202020"), { collide: false });
  const clerk = b.figure(
    "clerk",
    [0, 0, 21.2],
    { skin: "#d8c8b8", cloth: "#d86a10", hair: "#101010", eyes: "#000000", longHair: false },
    true,
  );
  b.box("clerk-hit", [0.7, 1.6, 0.7], [0, 0.9, 0], dark, { collide: false, parent: clerk }).visibility = 0;
  b.figure("clerk-face", [0, 0, 18.4], { skin: "#a8b0b0", cloth: "#d86a10", hair: "#050505", eyes: "#000000", longHair: false }, false);

  // ---- 降りるシャッター ----
  const shutter = b.box("shutter", [12, 3.6, 0.15], [0, 1.8, 1.0], b.mat("#6a6e74"));
  shutter.setEnabled(false);
  b.register("shutter", shutter);

  b.lamp("hall", [0, 3.3, 4], "#e8f0ff", 0.5, 9, true);
  b.lamp("hall", [0, 3.3, 11], "#e8f0ff", 0.5, 9, true);
  b.lamp("hall", [0, 3.3, 17], "#e8f0ff", 0.5, 9, true);
  b.lamp("counter", [0, 2.6, 19.2], "#ffe8c0", 0.4, 5, true);

  let radioOn = false;
  return {
    update: (g) => {
      if (radioOn) radio.scaling.y = 1 + Math.sin(g.elapsed * 14) * 0.08;
    },
    custom: {
      radioOn: (g) => {
        radioOn = true;
        g.audio?.play("static", { x: -2.4, y: 1.1, z: 8 }, 0.7);
      },
      shutterDown: (g) => {
        shutter.setEnabled(true);
        g.audio?.play("slam", { x: 0, y: 1.5, z: 1 }, 1);
      },
    },
  };
};
