import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 駅前の美容室。x=-4〜4, z=0〜10（入口 z=0）。
 * 西の鏡の前にスタイリングチェア 3 脚（chair-0〜2）。北にシャンプー台 2 台、x=3 の台に客が寝ている（customer）。
 * チェアは Y 回転のフックで勝手にこちらを向く（spin0 / spinAll）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#2e2a2c");
  const wall = b.mat("#c8bcc0");
  const ceiling = b.mat("#8a8084");
  const mirror = b.mat("#aeb8bc", { emissive: "#40484c", specular: 1 });
  const vinyl = b.mat("#1a1a1e", { specular: 0.6 });
  const chrome = b.mat("#b8bcc0", { specular: 0.9 });
  const wood = b.mat("#6a4a38");
  const towel = b.mat("#f0f0f2", { emissive: "#303034" });
  const skin = b.mat("#cfd0d2", { emissive: "#282828" });
  const hairMat = b.mat("#06060a");

  // ---- 店内 ----
  b.room("salon", [0, 0, 5], 8, 10, 3, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 8, 3, [0, 1.2, 2.2], wall);
  b.door(
    "front-door",
    [-0.6, 0, 0],
    1.2,
    2.2,
    0,
    b.mat("#8aa0a8", { alpha: 0.5, specular: 0.8 }),
    {
      open: true,
      interactive: false,
    },
  );
  b.sign("neon", ["Hair  Salon", "営業終了"], [1.6, 0.6], [0, 2.4, 0.12], 0, {
    bg: "#200810",
    fg: "#ff4880",
    glow: 0.7,
  });
  // 外：歩道
  b.box("walk", [10, 0.2, 5], [0, -0.1, -2.5], floor);
  for (const [n, size, pos] of [
    ["walk-w", [0.2, 4, 5], [-5, 2, -2.5]],
    ["walk-e", [0.2, 4, 5], [5, 2, -2.5]],
    ["walk-s", [10, 4, 0.2], [0, 2, -5]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }

  // ---- 鏡とスタイリングチェア ----
  const chairs: TransformNode[] = [];
  for (const [i, z] of [3, 5, 7].entries()) {
    b.box(`mirror-${i}`, [0.04, 1.3, 1.3], [-3.88, 1.55, z], mirror, {
      collide: false,
    });
    b.box(`station-${i}`, [0.4, 0.9, 1.4], [-3.65, 0.45, z], wood);
    const chair = new TransformNode(`chair-${i}`, b.scene);
    chair.position.set(-2.8, 0, z);
    b.cylinder(`chair-base-${i}`, 0.5, 0.5, [0, 0.25, 0], chrome, {
      collide: false,
    }).parent = chair;
    b.box(`chair-seat-${i}`, [0.6, 0.14, 0.6], [0, 0.55, 0], vinyl, {
      collide: false,
      parent: chair,
    });
    b.box(`chair-back-${i}`, [0.6, 0.8, 0.12], [0.3, 1.0, 0], vinyl, {
      collide: false,
      parent: chair,
    });
    chair.rotation.y = 0;
    chairs.push(chair);
    b.register(`chair-${i}`, chair);
  }
  // ドライヤー
  b.box("dryer", [0.2, 0.15, 0.3], [-3.6, 1.0, 5.5], b.mat("#d8d0d4"), {
    collide: false,
  });

  // ---- レジと照明スイッチ ----
  b.box("desk", [1.6, 1.0, 0.6], [2.6, 0.5, 1.8], wood);
  const reg = b.box(
    "register",
    [0.4, 0.25, 0.35],
    [2.6, 1.12, 1.8],
    b.mat("#38383c"),
    { collide: false },
  );
  b.register("register", reg);
  const sw = b.box(
    "switch",
    [0.1, 0.16, 0.04],
    [1.5, 1.3, 0.12],
    b.mat("#e0e0d8"),
    { collide: false },
  );
  b.register("switch", sw);

  // ---- シャンプー台（北） ----
  for (const [i, x] of [1.5, 3.0].entries()) {
    b.box(`bowl-${i}`, [0.8, 0.9, 0.6], [x, 0.45, 9.55], chrome);
    const rest = b.box(
      `wash-chair-${i}`,
      [0.7, 0.14, 1.3],
      [x, 0.55, 8.2],
      vinyl,
      { collide: false },
    );
    rest.rotation.x = -0.12;
    b.box(`wash-leg-${i}`, [0.12, 0.55, 0.12], [x, 0.27, 8.2], chrome, {
      collide: false,
    });
  }
  // 寝ている客（最初は非表示）
  const cust = new TransformNode("customer", b.scene);
  const body = b.box(
    "customer-body",
    [0.55, 0.22, 1.5],
    [3.0, 0.78, 8.15],
    towel,
    { collide: false, parent: cust },
  );
  b.register("customer-body", body);
  b.box("customer-head", [0.3, 0.2, 0.34], [3.0, 0.8, 8.95], towel, {
    collide: false,
    parent: cust,
  });
  b.box("customer-hair", [0.34, 0.06, 0.5], [3.0, 0.66, 9.3], hairMat, {
    collide: false,
    parent: cust,
  });
  cust.setEnabled(false);
  b.register("customer", cust);
  const hand = new TransformNode("dangling-hand", b.scene);
  b.box("hand-arm", [0.09, 0.6, 0.09], [3.4, 0.5, 8.4], skin, {
    collide: false,
    parent: hand,
  });
  b.box("hand-palm", [0.12, 0.12, 0.05], [3.4, 0.16, 8.4], skin, {
    collide: false,
    parent: hand,
  });
  hand.setEnabled(false);
  b.register("dangling-hand", hand);

  // ---- 照明 ----
  b.lamp("salon", [0, 2.7, 3], "#fff0e8", 0.6, 9, true);
  b.lamp("salon", [0, 2.7, 7.5], "#fff0e8", 0.6, 9, true);
  b.lamp("neon", [0, 2.3, 1.0], "#ff3a70", 0.4, 7, false);
  b.lamp("street", [0.5, 2.5, -2], "#ffd8a0", 0.5, 8, false);

  // ---- 最後の一発 ----
  b.figure(
    "sitter",
    [3.0, 0, 8.0],
    {
      skin: "#bcc0c4",
      hair: "#060608",
      cloth: "#e8e8f0",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );

  // ---- チェアの回転 ----
  const target = [0, 0, 0];
  const speed = [1.2, 1.2, 1.2];
  return {
    update: (_g, dt) => {
      for (const [i, c] of chairs.entries()) {
        const t = target[i] ?? 0;
        const sp = speed[i] ?? 1;
        c.rotation.y += (t - c.rotation.y) * Math.min(1, dt * sp);
      }
    },
    custom: {
      spin0: () => {
        target[0] = Math.PI * 0.9;
        speed[0] = 0.6;
      },
      spinAll: () => {
        target[0] = Math.PI;
        target[1] = Math.PI * 1.0;
        target[2] = Math.PI * 1.0;
        speed[1] = 0.9;
        speed[2] = 1.4;
      },
    },
  };
};
