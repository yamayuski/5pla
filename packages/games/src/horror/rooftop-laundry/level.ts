import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * マンションの屋上。x=-7〜7, z=0〜12。南西に階段室（hut）。
 * 物干しの3列（z=4 / 6.5 / 9）に白いシーツ。手前の3枚（bring-0〜2）は取り込める。
 * シーツの下端を 0.6m にして、奥に立つ人の足元が下から見えるようにしてある。
 */
const LINES = [4, 6.5, 9];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const concrete = b.mat("#5a5a5e");
  const parapet = b.mat("#6a6a6e");
  const hutMat = b.mat("#7a7a7c");
  const metal = b.mat("#3a3c40", { specular: 0.4 });
  const sheetMat = b.mat("#e8e8ec", { emissive: "#303034" });
  const tankMat = b.mat("#6a7480", { specular: 0.5 });

  // ---- 屋上の床と手すり ----
  b.box("roof-floor", [14, 0.2, 12], [0, -0.1, 6], concrete);
  for (const [n, size, pos] of [
    ["wall-n", [14, 1.1, 0.3], [0, 0.55, 12]],
    ["wall-w", [0.3, 1.1, 12], [-7, 0.55, 6]],
    ["wall-e", [0.3, 1.1, 12], [7, 0.55, 6]],
    ["wall-s", [14, 1.1, 0.3], [0, 0.55, 0]],
  ] as const) {
    b.box(n, size, pos, parapet);
  }
  for (const [n, size, pos] of [
    ["fence-n", [14, 5, 0.3], [0, 2.5, 12.2]],
    ["fence-w", [0.3, 5, 12], [-7.2, 2.5, 6]],
    ["fence-e", [0.3, 5, 12], [7.2, 2.5, 6]],
    ["fence-s", [14, 5, 0.3], [0, 2.5, -0.2]],
  ] as const) {
    b.box(n, size, pos, parapet).isVisible = false;
  }

  // ---- 階段室 ----
  b.room(
    "hut",
    [-5, 0, 1.5],
    3,
    3,
    2.6,
    { floor: concrete, wall: hutMat, ceiling: hutMat },
    ["e"],
  );
  b.wallWithGap("hut-e", "z", [-3.5, 0, 1.5], 3, 2.6, [0, 1.1, 2.1], hutMat);
  b.door("hut-door", [-3.5, 0, 0.95], 1.1, 2.1, Math.PI / 2, metal, {
    open: true,
    interactive: false,
  });
  b.sign(
    "hut-sign",
    ["屋上", "施錠 22:00"],
    [0.8, 0.4],
    [-4.9, 1.9, 2.88],
    Math.PI,
    {
      bg: "#d8d8d0",
      fg: "#222",
      glow: 0.2,
    },
  );

  // ---- 給水タンク ----
  b.cylinder("tank", 3, 2.4, [5.5, 1.5, 10], tankMat);
  for (const [x, z] of [
    [4.6, 9.1],
    [6.4, 9.1],
    [4.6, 10.9],
    [6.4, 10.9],
  ] as const) {
    b.cylinder(`tank-leg-${x}-${z}`, 1.5, 0.12, [x, 0.75, z], metal, {
      collide: false,
    });
  }

  // ---- 物干しとシーツ ----
  const sheets: { node: Mesh; phase: number }[] = [];
  let n = 0;
  for (const [li, z] of LINES.entries()) {
    for (const px of [-3.2, 6.2]) {
      b.cylinder(`pole-${li}-${px}`, 2.2, 0.08, [px, 1.1, z], metal, {
        collide: false,
      });
    }
    b.box(`line-${li}`, [9.4, 0.02, 0.02], [1.5, 2.15, z], metal, {
      collide: false,
    });
    for (let i = 0; i < 5; i++) {
      const x = -2.2 + i * 1.7;
      const hang = new TransformNode(`sheet-pivot-${li}-${i}`, b.scene);
      hang.position.set(x, 2.15, z);
      const sheet = b.box(
        `sheet-${li}-${i}`,
        [1.1, 1.55, 0.03],
        [0, -0.78, 0],
        sheetMat,
        {
          collide: false,
          parent: hang,
        },
      );
      sheets.push({ node: sheet, phase: n++ * 0.9 });
      // 手前の列の左から3枚は取り込める洗濯物
      if (li === 0 && i < 3) {
        b.register(`bring-${i}`, sheet);
      }
    }
  }

  // ---- 照明 ----
  b.lamp("hut", [-5, 2.4, 1.5], "#ffd8a0", 0.6, 7, true);
  b.lamp("roof", [0, 3.4, 5], "#cfd8ff", 0.45, 14, true);
  b.box("roof-lamp-pole", [0.1, 3.4, 0.1], [0, 1.7, 5], metal, {
    collide: false,
  });

  // ---- 最後の一発 ----
  b.figure(
    "woman",
    [3.6, 0, 10.8],
    {
      skin: "#d0d4d6",
      hair: "#0a0a0c",
      cloth: "#f2f2f4",
      eyes: "#000000",
      height: 1.03,
      longHair: true,
    },
    false,
  );

  // ---- 風でシーツを揺らす ----
  let amp = 0.07;
  let target = 0.07;
  return {
    update: (g, dt) => {
      amp += (target - amp) * Math.min(1, dt * 1.5);
      for (const s of sheets) {
        const pivot = s.node.parent as TransformNode | null;
        if (pivot) {
          pivot.rotation.x = Math.sin(g.elapsed * 2.2 + s.phase) * amp;
          pivot.rotation.z =
            Math.sin(g.elapsed * 1.3 + s.phase * 0.5) * amp * 0.5;
        }
      }
    },
    custom: {
      windUp: () => {
        target = 0.22;
      },
      windStorm: () => {
        target = 0.38;
      },
      windStill: () => {
        target = 0;
      },
    },
  };
};
