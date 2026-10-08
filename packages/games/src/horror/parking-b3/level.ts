import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * オフィスビルの地下三階駐車場。x=-12〜12, z=-15〜15 のワンフロア。
 * 南壁中央にエレベーター、北壁の西寄り（x=-8）に出口スロープのゲート。
 * 自分の車の区画「B3-44」は北東（x=8, z=10）。最初は空っぽで、閉じ込められたあとに現れる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const concrete = b.mat("#5a5a58");
  const wallMat = b.mat("#7a7a74");
  const ceiling = b.mat("#3a3a38");
  const pillar = b.mat("#8a8a82");
  const line = b.mat("#d8d4c0", { emissive: "#202018" });
  const yellow = b.mat("#c8a020", { emissive: "#302400" });
  const steel = b.mat("#8a9096", { specular: 0.8 });
  const glass = b.mat("#20262c", { specular: 1 });
  const tire = b.mat("#101010");

  b.room(
    "garage",
    [0, 0, 0],
    24,
    30,
    3,
    { floor: concrete, wall: wallMat, ceiling },
    ["n", "s"],
  );
  // 北壁（出口ゲートの開口）と南壁（エレベーター）
  b.wallWithGap("garage-n", "x", [0, 0, 15], 24, 3, [-8, 4, 2.6], wallMat);
  b.wallWithGap("garage-s", "x", [0, 0, -15], 24, 3, [0, 1.6, 2.2], wallMat);

  // 柱
  for (const x of [-6, 0, 6]) {
    for (const z of [-8, -2, 4, 10]) {
      b.box(`pillar-${x}-${z}`, [0.7, 3, 0.7], [x, 1.5, z], pillar);
      b.box(`pillar-band-${x}-${z}`, [0.72, 0.3, 0.72], [x, 0.6, z], yellow, {
        collide: false,
      });
    }
  }

  // 駐車区画の白線（東西の壁沿い）
  for (let i = 0; i < 9; i++) {
    const z = -12 + i * 3;
    b.box(`line-e-${i}`, [4, 0.01, 0.1], [10, 0.005, z], line, {
      collide: false,
    });
    b.box(`line-w-${i}`, [4, 0.01, 0.1], [-10, 0.005, z], line, {
      collide: false,
    });
  }

  // 車（プリミティブの箱）。ノーズは壁向き
  const car = (name: string, x: number, z: number, color: string): Mesh[] => {
    const body = b.mat(color, { specular: 0.7 });
    return [
      b.box(`${name}-body`, [4.2, 0.7, 1.8], [x, 0.55, z], body),
      b.box(`${name}-cabin`, [2.2, 0.55, 1.6], [x, 1.17, z], glass, {
        collide: false,
      }),
      b.box(`${name}-wheels`, [3.2, 0.4, 1.9], [x, 0.2, z], tire, {
        collide: false,
      }),
    ];
  };
  car("car-a", -10, -10.5, "#2a3a5a");
  car("car-b", -10, -4.5, "#8a8a8a");
  car("car-c", -10, 4.5, "#5a1a1a");
  car("car-d", 10, -7.5, "#1a1a1a");
  car("car-e", 10, 1.5, "#c8c8c0");

  // 自分の車（白いセダン、B3-44）。最初は非表示
  const mine = car("my-car", 10, 10.5, "#e8e8e4");
  const hazardMat = b.mat("#401800", { emissive: "#201000" });
  mine.push(
    b.box("my-car-hazard-l", [0.1, 0.15, 0.3], [7.88, 0.75, 9.9], hazardMat, {
      collide: false,
    }),
    b.box("my-car-hazard-r", [0.1, 0.15, 0.3], [7.88, 0.75, 11.1], hazardMat, {
      collide: false,
    }),
  );
  for (const m of mine) {
    m.setEnabled(false);
  }
  b.sign("spot-44", ["B3-44"], [0.6, 0.3], [6, 1.9, 9.64], 0, {
    bg: "#1a3a8a",
    fg: "#fff",
    glow: 0.4,
  });

  // 出口ゲート（バーが下りたまま）とスロープ
  b.box(
    "gate-arm",
    [4, 0.12, 0.12],
    [-8, 1.0, 14.6],
    b.mat("#e0e0e0", {
      emissive: "#401010",
    }),
  );
  b.box("gate-post", [0.4, 1.2, 0.4], [-10.2, 0.6, 14.4], steel);
  b.sign(
    "gate-sign",
    ["出口", "精算機 故障中"],
    [1.2, 0.5],
    [-8, 2.3, 14.8],
    0,
    { bg: "#1a5a2a", fg: "#fff", glow: 0.5 },
  );
  b.room(
    "ramp",
    [-8, 0, 18],
    4,
    6,
    2.6,
    { floor: concrete, wall: wallMat, ceiling },
    ["s"],
  );
  const shutter = b.box(
    "shutter",
    [4, 2.6, 0.1],
    [-8, 1.3, 15.1],
    b.mat("#6a6a62", { specular: 0.4 }),
  );
  shutter.setEnabled(false);
  b.register("shutter", shutter);

  // エレベーター
  b.room(
    "elevator",
    [0, 0, -16.2],
    2,
    2.2,
    2.4,
    { floor: steel, wall: steel, ceiling: steel },
    ["n"],
  );
  b.door("elevator-door", [-0.8, 0, -15], 1.6, 2.2, 0, steel, {
    interactive: false,
  });
  b.sign(
    "elevator-sign",
    ["B3", "▲ ▼"],
    [0.4, 0.4],
    [1.2, 1.5, -14.88],
    Math.PI,
    {
      bg: "#101010",
      fg: "#ff8a30",
      glow: 0.7,
    },
  );

  // ---- 照明（蛍光灯） ----
  b.lamp("lobby", [0, 2.8, -12], "#e8f4ff", 0.6, 9);
  b.lamp("row-w", [-8, 2.8, -2], "#e8f4ff", 0.5, 13);
  b.lamp("row-c", [0, 2.8, 4], "#e8f4ff", 0.45, 12);
  b.lamp("row-e", [8, 2.8, 2], "#e8f4ff", 0.5, 13);
  const hazard = b.lamp("hazard", [7.6, 0.9, 10.5], "#ff9a20", 0, 9, false);

  // ---- 最後の一発：区画の奥に立つ女 ----
  b.figure(
    "woman",
    [11.5, 0, 13.8],
    {
      skin: "#cfd0c8",
      hair: "#040404",
      cloth: "#2a2a30",
      eyes: "#000000",
      height: 1.02,
      longHair: true,
    },
    false,
  );

  let blinking = false;
  let phase = 0;
  return {
    custom: {
      carAppear: () => {
        for (const m of mine) {
          m.setEnabled(true);
        }
        blinking = true;
      },
      shutterDown: () => {
        shutter.setEnabled(true);
      },
    },
    update: (_game, dt) => {
      if (!blinking) {
        return;
      }
      phase = (phase + dt) % 0.9;
      const on = phase < 0.45;
      hazard.baseIntensity = on ? 1.1 : 0;
      hazard.light.intensity = hazard.baseIntensity;
      hazardMat.emissiveColor.set(on ? 1 : 0.12, on ? 0.55 : 0.06, 0);
    },
  };
};
