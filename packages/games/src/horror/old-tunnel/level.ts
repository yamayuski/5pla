import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 山道の旧トンネル。坑口（入口）は z=0、トンネルは z=0〜56 を北へ一直線（幅 x=-2.2〜2.2）。
 * 坑口の外（z<0）に自分の止まった車。中ほど（z=28）の東壁に非常ボタンの箱。
 * 北の出口 z=56 は「通行止め」の鉄柵で塞がれている。
 * 手形（hand-0〜7）は最初は非表示で、異変のたびに壁に増えていく。
 */
const HANDS: [number, number, number, number][] = [
  // x, y, z, 向き(rotY)
  [-2.08, 1.4, 22, Math.PI / 2],
  [2.08, 1.6, 25, -Math.PI / 2],
  [-2.08, 1.1, 31, Math.PI / 2],
  [2.08, 1.3, 34, -Math.PI / 2],
  [-2.08, 1.7, 14, Math.PI / 2],
  [2.08, 1.2, 10, -Math.PI / 2],
  [-2.08, 1.5, 6, Math.PI / 2],
  [2.08, 1.6, 4, -Math.PI / 2],
];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const rock = b.mat("#4a4640");
  const concrete = b.mat("#6a665c");
  const road = b.mat("#2a2a2a");
  const lineMat = b.mat("#c8b040", { emissive: "#302800" });
  const sodium = b.mat("#ffa040", { emissive: "#ff8020" });
  const handMat = b.mat("#5a1a10", { emissive: "#200400" });
  const steel = b.mat("#5a5a58", { specular: 0.4 });

  // ---- トンネル本体 ----
  b.room(
    "tunnel",
    [0, 0, 28],
    4.4,
    56,
    4.2,
    { floor: road, wall: concrete, ceiling: rock },
    ["s", "n"],
  );
  b.box("center-line", [0.12, 0.01, 54], [0, 0.005, 28], lineMat, {
    collide: false,
  });
  b.wallWithGap(
    "portal-s",
    "x",
    [0, 0, 0],
    8,
    6,
    [0, 4.4, 4.2],
    b.mat("#5a5850"),
  );
  b.sign(
    "portal-plate",
    ["旧 鬼首隧道", "昭和九年竣工"],
    [1.6, 0.6],
    [0, 4.9, -0.12],
    0,
    {
      bg: "#3a3a34",
      fg: "#d8d4c8",
      glow: 0.2,
    },
  );
  // 北の出口：通行止めの鉄柵
  for (let i = 0; i < 9; i++) {
    b.cylinder(`bar-${i}`, 3.2, 0.06, [-2 + i * 0.5, 1.6, 55.8], steel);
  }
  b.box("bar-top", [4.4, 0.1, 0.1], [0, 3.2, 55.8], steel);
  b.box("bar-guard", [4.4, 4.2, 0.1], [0, 2.1, 56], steel).isVisible = false;
  b.sign(
    "closed-sign",
    ["通行止め", "この先 崩落の恐れあり"],
    [1.4, 0.6],
    [0, 1.4, 55.7],
    0,
    {
      bg: "#f4f0e0",
      fg: "#b01010",
      glow: 0.3,
    },
  );
  // 照明器具（ナトリウム灯の見た目だけ）
  for (let z = 4; z < 56; z += 6) {
    b.box(`fixture-${z}`, [0.5, 0.15, 0.25], [1.9, 3.8, z], sodium, {
      collide: false,
    });
  }
  // 中ほどの非常ボタン
  b.box("sos-box", [0.12, 0.6, 0.45], [2.14, 1.3, 28], b.mat("#c8c4b8"), {
    collide: false,
  });
  const sos = b.box(
    "sos-button",
    [0.06, 0.14, 0.14],
    [2.06, 1.3, 28],
    b.mat("#c01010", {
      emissive: "#600000",
    }),
    { collide: false },
  );
  b.register("sos-button", sos);
  b.sign(
    "sos-label",
    ["非常ボタン"],
    [0.4, 0.12],
    [2.08, 1.72, 28],
    Math.PI / 2,
    {
      bg: "#f4f4ec",
      fg: "#b01010",
      glow: 0.4,
    },
  );

  // 落盤（最初は非表示。出ると坑口側へ戻れない）
  const rubble = new TransformNode("rubble", b.scene);
  for (let i = 0; i < 7; i++) {
    b.box(
      `rubble-${i}`,
      [1.2 + (i % 3) * 0.4, 0.9 + (i % 2) * 0.6, 1.0],
      [-1.8 + i * 0.6, 0.5 + (i % 2) * 0.3, 3 + (i % 3) * 0.4],
      rock,
      { parent: rubble },
    );
  }
  b.box("rubble-wall", [4.4, 4.2, 0.4], [0, 2.1, 3.4], rock, {
    parent: rubble,
  });
  rubble.setEnabled(false);
  b.register("rubble", rubble);

  // 坑口の外：止まった車と山道
  b.box("outside-road", [8, 0.2, 14], [0, -0.1, -7], road);
  b.box(
    "my-car",
    [1.8, 1.3, 4.2],
    [0.8, 0.65, -6],
    b.mat("#8a8a84", { specular: 0.7 }),
  );
  b.box(
    "car-light",
    [1.4, 0.15, 0.05],
    [0.8, 0.7, -3.88],
    b.mat("#ffe8a0", {
      emissive: "#806a30",
    }),
    { collide: false },
  );
  for (const [n, size, pos] of [
    ["out-w", [0.2, 4, 14], [-4, 2, -7]],
    ["out-e", [0.2, 4, 14], [4, 2, -7]],
    ["out-s", [8, 4, 0.2], [0, 2, -14]],
  ] as const) {
    b.box(n, size, pos, rock).isVisible = false;
  }

  // 手形
  for (const [i, [x, y, z, rotY]] of HANDS.entries()) {
    const hand = new TransformNode(`hand-${i}`, b.scene);
    hand.position.set(x, y, z);
    hand.rotation.y = rotY;
    b.box(`hand-${i}-palm`, [0.11, 0.12, 0.01], [0, 0, 0], handMat, {
      collide: false,
      parent: hand,
    });
    for (let f = 0; f < 4; f++) {
      b.box(
        `hand-${i}-f${f}`,
        [0.022, 0.09, 0.01],
        [-0.042 + f * 0.028, 0.1, 0],
        handMat,
        {
          collide: false,
          parent: hand,
        },
      );
    }
    b.box(`hand-${i}-thumb`, [0.022, 0.07, 0.01], [0.07, 0.02, 0], handMat, {
      collide: false,
      parent: hand,
      rotY: 0,
    });
    hand.setEnabled(false);
    b.register(`hand-${i}`, hand);
  }

  // ---- 照明 ----
  b.lamp("light-a", [1.6, 3.6, 8], "#ffa040", 0.5, 10, false);
  b.lamp("light-b", [1.6, 3.6, 20], "#ffa040", 0.5, 10, false);
  b.lamp("light-c", [1.6, 3.6, 32], "#ffa040", 0.5, 10, false);
  b.lamp("light-d", [1.6, 3.6, 46], "#ffa040", 0.45, 10, false);
  b.lamp("car", [0.8, 1.0, -3.5], "#ffe8a0", 0.3, 6, false);

  // ---- 最後の一発 ----
  b.figure(
    "worker",
    [0, 0, 80],
    {
      skin: "#b8b4a8",
      hair: "#1a1814",
      cloth: "#5a5a3a",
      eyes: "#000000",
      height: 1.0,
    },
    false,
  );

  return {};
};
