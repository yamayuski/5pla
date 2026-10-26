import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜の児童公園。x=-10〜10, z=0〜24。南の入口(z=0)は開放、北(z=24)の門が park-gate。
 * ブランコ(swing-0/1, x=5,z=14)、すべり台(x=-5,z=10)、回転遊具 merry(0,18)、砂場、ベンチ。
 * フック：ブランコの揺れ（swingOn）、回転遊具の回転（merryOn / merryFast / merryOff）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const ground = b.mat("#2c3a2a");
  const sand = b.mat("#8a7a58");
  const metal = b.mat("#6a6e72", { specular: 0.5 });
  const red = b.mat("#a82820");
  const blue = b.mat("#2858a8");
  const wood = b.mat("#5a4430");
  const fence = b.mat("#3a3c40");

  // ---- 地面と柵 ----
  b.box("ground", [20, 0.2, 24], [0, -0.1, 12], ground);
  for (const [n, size, pos] of [
    ["fence-w", [0.2, 1.6, 24], [-10, 0.8, 12]],
    ["fence-e", [0.2, 1.6, 24], [10, 0.8, 12]],
    ["fence-s-l", [9, 1.6, 0.2], [-5.5, 0.8, 0]],
    ["fence-s-r", [9, 1.6, 0.2], [5.5, 0.8, 0]],
  ] as const) {
    b.box(n, size, pos, fence);
  }
  b.box("fence-s-block", [2, 4, 0.2], [0, 2, -1.5], fence).isVisible = false;
  b.wallWithGap("fence-n", "x", [0, 0, 24], 20, 1.6, [0, 1.6, 1.4], fence);
  b.door("park-gate", [-0.8, 0, 24], 1.6, 1.3, 0, metal, {
    open: true,
    interactive: false,
  });
  b.box("outside", [22, 0.2, 6], [0, -0.1, 27], ground);
  b.box("outside-block", [22, 4, 0.2], [0, 2, 30], fence).isVisible = false;
  b.box("outside-w", [0.2, 4, 6], [-11, 2, 27], fence).isVisible = false;
  b.box("outside-e", [0.2, 4, 6], [11, 2, 27], fence).isVisible = false;
  b.sign(
    "park-sign",
    ["〇〇児童公園", "夜間 立入禁止"],
    [1.6, 0.7],
    [-3, 1.5, 0.22],
    0,
    {
      bg: "#e8e8d8",
      fg: "#183018",
      glow: 0.25,
    },
  );

  // ---- 砂場とベンチ ----
  b.box("sandbox", [3, 0.2, 3], [3, 0.1, 6], sand);
  b.box("bench", [1.6, 0.45, 0.5], [-3, 0.23, 20], wood);

  // ---- すべり台 ----
  b.box("slide-deck", [1.2, 0.1, 1.2], [-5, 1.6, 10], red);
  for (const [px, pz] of [
    [-5.5, 9.5],
    [-4.5, 9.5],
    [-5.5, 10.5],
    [-4.5, 10.5],
  ] as const) {
    b.box(`slide-post-${px}-${pz}`, [0.1, 1.6, 0.1], [px, 0.8, pz], metal);
  }
  const ramp = b.box("slide-ramp", [0.8, 0.08, 2.4], [-5, 0.8, 11.6], blue, {
    collide: false,
  });
  ramp.rotation.x = 0.55;

  // ---- ブランコ ----
  b.box("swing-bar", [3.2, 0.12, 0.12], [5, 2.4, 14], metal);
  for (const sx of [-1.6, 1.6]) {
    b.box(`swing-leg-${sx}`, [0.1, 2.4, 0.1], [5 + sx, 1.2, 14], metal);
  }
  const swings: { g: TransformNode; phase: number }[] = [];
  for (const [i, x] of [4.5, 5.5].entries()) {
    const g = new TransformNode(`swing-${i}`, b.scene);
    g.position.set(x, 2.35, 14);
    b.box(`swing-chain-${i}`, [0.04, 1.6, 0.04], [0, -0.8, 0], metal, {
      collide: false,
      parent: g,
    });
    b.box(`swing-seat-${i}`, [0.5, 0.05, 0.25], [0, -1.6, 0], wood, {
      collide: false,
      parent: g,
    });
    swings.push({ g, phase: i * 0.8 });
  }

  // ---- 回転遊具 ----
  const merry = new TransformNode("merry", b.scene);
  merry.position.set(0, 0, 18);
  b.cylinder("merry-disc", 0.12, 2.8, [0, 0.4, 0], red, {
    collide: false,
  }).parent = merry;
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    b.box(
      `merry-rail-${k}`,
      [0.08, 0.7, 0.08],
      [Math.cos(a) * 1.2, 0.8, Math.sin(a) * 1.2],
      metal,
      {
        collide: false,
        parent: merry,
      },
    );
  }
  b.box("merry-hub", [0.12, 0.9, 0.12], [0, 0.85, 0], metal, {
    collide: false,
    parent: merry,
  });
  b.box("merry-guard", [3.2, 1.2, 3.2], [0, 0.6, 18], metal).isVisible = false;

  // ---- 照明（水銀灯） ----
  b.cylinder("lamp-pole-0", 4, 0.12, [-3, 2, 8], metal, { collide: false });
  b.cylinder("lamp-pole-1", 4, 0.12, [3, 2, 19], metal, { collide: false });
  b.lamp("park", [-3, 4, 8], "#cfe0ff", 0.65, 13, true);
  b.lamp("park", [3, 4, 19], "#cfe0ff", 0.65, 13, true);

  // ---- 回転遊具に座る子ども ----
  const child = b.figure(
    "child",
    [0, 0.45, 18],
    {
      skin: "#bcc0bc",
      hair: "#080808",
      cloth: "#a82a2a",
      eyes: "#000000",
      height: 0.7,
      longHair: false,
    },
    false,
  );
  child.rotation.y = Math.PI;

  // ---- 動き ----
  let swingAmp = 0;
  let spin = 0;
  let spinTarget = 0;
  return {
    update: (g, dt) => {
      for (const s of swings) {
        s.g.rotation.x =
          Math.sin(g.elapsed * 1.7 + s.phase) *
          swingAmp *
          (s.phase === 0 ? 1 : 0.3);
      }
      spin += (spinTarget - spin) * Math.min(1, dt * 1.5);
      merry.rotation.y += spin * dt;
    },
    custom: {
      swingOn: () => {
        swingAmp = 0.7;
      },
      merryOn: () => {
        spinTarget = 1.5;
      },
      merryFast: () => {
        spinTarget = 4.5;
      },
      merryOff: () => {
        spinTarget = 0;
        spin = 0;
        swingAmp = 0;
      },
    },
  };
};
