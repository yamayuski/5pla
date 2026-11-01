import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 深夜の郊外のセルフ式ガソリンスタンド。敷地は x=-10〜10, z=-2〜20（南が県道、霧で先は見えない）。
 * キャノピー（x=-4〜6, z=5〜13）の下に給油機 pump（x=0.6, z=9.5）、その東に自分の車 car（x=2.6, z=9）。
 * 北に売店 kiosk（x=-3〜3, z=15〜19、南面がガラス、扉 kiosk-door）。
 * フック：carRock（車が数秒揺れる）、meterRun（給油機の数字が勝手に回る）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const asphalt = b.mat("#1e1f22");
  const concrete = b.mat("#4a4c50");
  const canopyMat = b.mat("#d8d8d0", { emissive: "#202020" });
  const pumpMat = b.mat("#b82020", { specular: 0.4 });
  const carMat = b.mat("#2a3a58", { specular: 0.6 });
  const glass = b.mat("#0a0e14", { alpha: 0.45, specular: 0.8 });
  const tire = b.mat("#0c0c0c");
  const kioskWall = b.mat("#c8c4b8");
  const kioskFloor = b.mat("#8a8a84");
  const shelf = b.mat("#5a5a60");
  const invisible = b.mat("#000000");

  // ---- 敷地 ----
  b.box("ground", [20, 0.2, 22], [0, -0.1, 9], asphalt);
  b.box("island", [1.2, 0.18, 3.4], [0.6, 0.09, 9.5], concrete, {
    collide: false,
  });
  // 外周の見えない柵（道路側も霧で塞ぐ）
  for (const [n, size, pos] of [
    ["edge-s", [20, 4, 0.2], [0, 2, -2]],
    ["edge-w", [0.2, 4, 22], [-10, 2, 9]],
    ["edge-e", [0.2, 4, 22], [10, 2, 9]],
    ["edge-n", [20, 4, 0.2], [0, 2, 20]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }
  b.box("curb-s", [20, 0.15, 0.3], [0, 0.07, -1.6], concrete, {
    collide: false,
  });

  // ---- キャノピー ----
  b.box("canopy", [10, 0.5, 8], [1, 4.6, 9], canopyMat, { collide: false });
  for (const [px, pz] of [
    [-3.6, 6],
    [-3.6, 12],
    [5.6, 6],
    [5.6, 12],
  ] as const) {
    b.box(`canopy-post-${px}-${pz}`, [0.35, 4.4, 0.35], [px, 2.2, pz], concrete);
  }
  b.lamp("canopy", [-1, 4.2, 7], "#f2f4ff", 0.8, 11, true);
  b.lamp("canopy", [3, 4.2, 11], "#f2f4ff", 0.8, 11, true);
  b.sign("price-board", ["レギュラー 168", "ハイオク 179", "軽油 148"], [2, 1.6], [-7, 2.4, 2], Math.PI, {
    bg: "#101820",
    fg: "#ffb030",
    glow: 0.7,
  });
  b.box("price-pole", [0.2, 1.6, 0.2], [-7, 0.8, 2.1], concrete);

  // ---- 給油機 ----
  const pump = b.box("pump", [0.6, 1.6, 0.6], [0.6, 0.98, 9.5], pumpMat);
  b.register("pump", pump);
  b.box("pump-hose", [0.08, 0.9, 0.08], [0.95, 0.9, 9.5], tire, {
    collide: false,
  });
  // 表示は -x 側（プレイヤーの来る側）に向ける
  b.sign("meter-a", ["給油量  0.00 L", "金額  ¥0"], [0.56, 0.32], [0.28, 1.45, 9.5], Math.PI / 2, {
    bg: "#0a160a",
    fg: "#60ff60",
    glow: 0.8,
  });
  const meterB = b.sign("meter-b", ["給油量  38.20 L", "金額  ¥6,417"], [0.56, 0.32], [0.275, 1.45, 9.5], Math.PI / 2, {
    bg: "#0a160a",
    fg: "#60ff60",
    glow: 0.8,
  });
  meterB.setEnabled(false);
  const meterC = b.sign("meter-c", ["お連れ様の分も", "精算しますか"], [0.56, 0.32], [0.27, 1.45, 9.5], Math.PI / 2, {
    bg: "#1a0a0a",
    fg: "#ff5050",
    glow: 0.9,
  });
  meterC.setEnabled(false);

  // ---- 自分の車 ----
  const car = new TransformNode("car", b.scene);
  car.position.set(2.6, 0, 9);
  b.box("car-body", [1.8, 0.7, 4.3], [0, 0.6, 0], carMat, { parent: car });
  // 窓越しに後部座席の人影を「見た」判定が通るよう、ガラスはピック対象外にする
  b.box("car-cabin", [1.6, 0.62, 2.3], [0, 1.26, -0.2], glass, {
    parent: car,
    collide: false,
  }).isPickable = false;
  b.box("car-roof", [1.6, 0.06, 2.1], [0, 1.6, -0.2], carMat, {
    parent: car,
    collide: false,
  });
  for (const [wx, wz] of [
    [-0.9, 1.3],
    [0.9, 1.3],
    [-0.9, -1.4],
    [0.9, -1.4],
  ] as const) {
    b.box(`car-tire-${wx}-${wz}`, [0.25, 0.6, 0.6], [wx, 0.3, wz], tire, {
      parent: car,
      collide: false,
    });
  }
  // 運転席ドア（調べる対象）
  const carDoor = b.box("car-door", [0.05, 0.55, 1.0], [-0.93, 0.75, 0.25], b.mat("#2a3a5a", { specular: 0.6 }), {
    parent: car,
    collide: false,
  });
  b.register("car-door", carDoor);
  b.register("car", car);
  // 後部座席の人影（座っている分だけ縮める）
  const passenger = b.figure(
    "passenger",
    [2.6, 0.25, 8.0],
    { skin: "#b8bcb8", cloth: "#2a2a2a", hair: "#050505", eyes: "#000000", height: 0.78 },
    false,
  );
  passenger.rotation.y = 0;

  // ---- 売店 ----
  b.room("kiosk", [0, 0, 17], 6, 4, 3, { floor: kioskFloor, wall: kioskWall, ceiling: kioskWall }, ["s"]);
  b.wallWithGap("kiosk-front", "x", [0, 0, 15], 6, 3, [0, 1.1, 2.2], glass);
  b.door("kiosk-door", [-0.55, 0, 15], 1.1, 2.2, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("kiosk-counter", [2.4, 1, 0.6], [1.6, 0.5, 18], shelf);
  b.box("kiosk-shelf", [0.5, 1.6, 2.6], [-2.4, 0.8, 17], shelf);
  b.sign("kiosk-sign", ["セルフ 24h", "店員 不在時はインターホンへ"], [2.4, 0.6], [0, 3.4, 14.88], 0, {
    bg: "#f0f0e8",
    fg: "#a01818",
    glow: 0.4,
  });
  b.lamp("kiosk", [0, 2.7, 17], "#fff6e0", 0.7, 7, true);
  const speaker = b.box("speaker", [0.3, 0.3, 0.12], [2.4, 2.2, 14.85], tire, {
    collide: false,
  });
  b.register("speaker", speaker);
  // 売店の奥の人影（レジの向こうに一瞬）
  const clerk = b.figure(
    "clerk",
    [1.6, 0, 18.8],
    { skin: "#c8c8c0", cloth: "#2050a0", hair: "#0a0a0a", eyes: "#000000", longHair: false },
    false,
  );
  clerk.rotation.y = Math.PI;

  // ---- 動き ----
  let rock = 0;
  let meterT = -1;
  return {
    update: (g, dt) => {
      if (rock > 0) {
        rock = Math.max(0, rock - dt);
        car.rotation.z = Math.sin(g.elapsed * 22) * 0.02 * rock;
      } else {
        car.rotation.z = 0;
      }
      if (meterT >= 0) {
        meterT += dt;
        // 数字が回っている感じを、表示を素早く切り替えて出す
        const on = Math.floor(meterT * 8) % 2 === 0;
        meterB.setEnabled(on);
        if (meterT > 4) {
          meterT = -1;
          meterB.setEnabled(true);
        }
      }
    },
    custom: {
      carRock: (g) => {
        rock = 2.5;
        g.audio?.play("thud", { x: 2.6, y: 0.8, z: 8 }, 0.7);
      },
      meterRun: (g) => {
        meterT = 0;
        g.audio?.play("buzz", { x: 0.6, y: 1.4, z: 9.5 }, 0.6);
      },
    },
  };
};
