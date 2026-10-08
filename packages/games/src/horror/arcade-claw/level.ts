import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 深夜のゲームセンター。x=-6〜6, z=0〜14、入口 z=0 のシャッター。
 * 中央の列にクレーンゲーム台（claw-0〜2, x=-3, 0, 3 / z=7）。台の手前面は -z 向き（プレイヤー側）。
 * 3台目（claw-2）の景品ボックスの中に、膝を抱えた女（inner）が現れる。
 * armsOn で3台のアームが横に動き続ける（update フック）。
 */
const XS = [-3, 0, 3];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#1c1424");
  const wall = b.mat("#2a2036");
  const ceiling = b.mat("#14101c");
  const cab = b.mat("#d02a80", { emissive: "#400820" });
  const cab2 = b.mat("#2a60d0", { emissive: "#081840" });
  const glass = b.mat("#bcd0ff", { alpha: 0.16, specular: 0.9 });
  const metal = b.mat("#aab0b8", { specular: 0.8 });
  const plush = b.mat("#e8a0c0", { emissive: "#402030" });
  const plush2 = b.mat("#a0d0e8", { emissive: "#203040" });
  const dark = b.mat("#08060c");

  b.room("arcade", [0, 0, 7], 12, 14, 3.2, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 12, 3.2, [0, 2.4, 2.4], wall);
  b.door("shutter", [-1.2, 0, 0], 2.4, 2.4, 0, metal, {
    open: true,
    interactive: false,
  });
  b.sign(
    "neon",
    ["ゲームセンター", "24時間営業"],
    [2.4, 0.8],
    [0, 2.8, 0.12],
    0,
    {
      bg: "#10081a",
      fg: "#ff50c8",
      glow: 0.8,
    },
  );
  // 外：歩道
  b.box("walk", [14, 0.2, 5], [0, -0.1, -2.5], floor);
  for (const [n, size, pos] of [
    ["walk-w", [0.2, 4, 5], [-7, 2, -2.5]],
    ["walk-e", [0.2, 4, 5], [7, 2, -2.5]],
    ["walk-s", [14, 4, 0.2], [0, 2, -5]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }

  // ---- クレーンゲーム台 ----
  const claws: { g: TransformNode; baseX: number; phase: number }[] = [];
  for (const [i, x] of XS.entries()) {
    const m = i % 2 === 0 ? cab : cab2;
    // 下部（筐体）と上部のガラスケース
    const body = b.box(`claw-${i}`, [1.5, 0.9, 1.1], [x, 0.45, 7], m);
    b.register(`claw-${i}`, body);
    b.box(`claw-roof-${i}`, [1.5, 0.2, 1.1], [x, 2.2, 7], m, {
      collide: false,
    });
    for (const [px, pz] of [
      [-0.72, -0.52],
      [0.72, -0.52],
      [-0.72, 0.52],
      [0.72, 0.52],
    ] as const) {
      b.box(
        `claw-post-${i}-${px}-${pz}`,
        [0.06, 1.3, 0.06],
        [x + px, 1.55, 7 + pz],
        m,
        { collide: false },
      );
    }
    b.box(`claw-glass-${i}`, [1.44, 1.3, 0.03], [x, 1.55, 6.47], glass, {
      collide: false,
    });
    b.box(`claw-floor-${i}`, [1.4, 0.1, 1.0], [x, 0.95, 7], dark, {
      collide: false,
    });
    // 景品
    for (let k = 0; k < 5; k++) {
      b.box(
        `plush-${i}-${k}`,
        [0.25, 0.25, 0.25],
        [x - 0.5 + k * 0.25, 1.1, 7.1 + (k % 2) * 0.2],
        k % 2 ? plush : plush2,
        {
          collide: false,
        },
      );
    }
    // アーム
    const arm = new TransformNode(`arm-${i}`, b.scene);
    arm.position.set(x, 0, 7);
    b.cylinder(`arm-rod-${i}`, 0.8, 0.04, [0, 1.8, 0], metal, {
      collide: false,
    }).parent = arm;
    b.box(`arm-claw-${i}`, [0.2, 0.15, 0.2], [0, 1.35, 0], metal, {
      collide: false,
      parent: arm,
    });
    claws.push({ g: arm, baseX: x, phase: i * 1.7 });
  }
  // 画面（PLAY → あそんで）
  const screensA = new TransformNode("screens-a", b.scene);
  const screensB = new TransformNode("screens-b", b.scene);
  for (const [i, x] of XS.entries()) {
    const a = b.sign(
      `scr-a-${i}`,
      ["PLAY", "100円"],
      [0.9, 0.35],
      [x, 1.0, 6.44],
      Math.PI,
      {
        bg: "#102040",
        fg: "#ffe040",
        glow: 0.9,
      },
    );
    a.parent = screensA;
    const bb = b.sign(
      `scr-b-${i}`,
      ["あそんで"],
      [0.9, 0.35],
      [x, 1.0, 6.44],
      Math.PI,
      {
        bg: "#300010",
        fg: "#ff2040",
        glow: 1.0,
      },
    );
    bb.parent = screensB;
  }
  screensB.setEnabled(false);
  b.register("screens-a", screensA);
  b.register("screens-b", screensB);

  // ---- 壁沿いの筐体（雰囲気） ----
  for (const side of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const z = 3 + k * 2.6;
      b.box(
        `cab-${side}-${k}`,
        [0.9, 1.7, 1.0],
        [side * 5.4, 0.85, z],
        k % 2 ? cab2 : cab,
      );
      b.sign(
        `cab-screen-${side}-${k}`,
        ["INSERT", "COIN"],
        [0.6, 0.4],
        [side * 4.93, 1.3, z],
        side < 0 ? -Math.PI / 2 : Math.PI / 2,
        {
          bg: "#08141c",
          fg: "#40ffb0",
          glow: 0.8,
        },
      );
    }
  }

  // ---- 照明 ----
  b.lamp("arcade", [-3, 3, 4], "#ff70c8", 0.6, 9, true);
  b.lamp("arcade", [3, 3, 4], "#70a0ff", 0.6, 9, true);
  b.lamp("arcade", [0, 3, 10], "#d070ff", 0.5, 9, true);
  b.lamp("machines", [0, 1.8, 6.2], "#ffd0f0", 0.45, 8, false);

  // ---- 3台目のボックスに入っている女と、最後の一発 ----
  const inner = b.figure(
    "inner",
    [3, 0.95, 7.1],
    {
      skin: "#d0ccd0",
      hair: "#060408",
      cloth: "#e8e0e8",
      eyes: "#000000",
      height: 0.78,
      longHair: true,
    },
    false,
  );
  inner.rotation.y = Math.PI;
  b.register("inner", inner);
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#d0ccd0",
      hair: "#060408",
      cloth: "#e8e0e8",
      eyes: "#000000",
      height: 1.04,
      longHair: true,
    },
    false,
  );

  let sweep = false;
  return {
    update: (g, dt) => {
      void dt;
      if (!sweep) {
        return;
      }
      for (const c of claws) {
        c.g.position.x = c.baseX + Math.sin(g.elapsed * 1.6 + c.phase) * 0.4;
        c.g.position.z = 7 + Math.cos(g.elapsed * 1.1 + c.phase) * 0.25;
      }
    },
    custom: {
      armsOn: () => {
        sweep = true;
      },
    },
  };
};
