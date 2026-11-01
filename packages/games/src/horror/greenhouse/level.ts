import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 植物園の熱帯温室（夜間）。温室は x=-5〜5, z=0〜16、ガラス張り。南（z=0）の入口 gh-door。
 * 中央の通路（x=-1〜1）の両側に背の高い熱帯植物 plant-*。最奥（z=14）に今夜だけ咲く巨大な花 bud / bloom と、
 * 記録用のカメラ三脚 camera（x=1.6, z=12.5）。ガラスの手形 hands、最後は花の中から現れる flower-woman。
 * フック：rustle（植物の揺れが奥から手前へ近づく）、bloomOpen（つぼみが開く）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const soil = b.mat("#2a2018");
  const pathMat = b.mat("#6a6458");
  const glass = b.mat("#203830", { alpha: 0.3, specular: 0.9 });
  const frame = b.mat("#d8d8d0", { specular: 0.4 });
  const leafA = b.mat("#1e4a24");
  const leafB = b.mat("#2a5a2a");
  const stem = b.mat("#3a4a20");
  const petal = b.mat("#6a1020", { emissive: "#200408" });
  const dark = b.mat("#000000");

  // ---- 床・ガラスの壁 ----
  b.box("soil", [10, 0.2, 16], [0, -0.1, 8], soil);
  b.box("path", [2, 0.02, 16], [0, 0.01, 8], pathMat, { collide: false });
  b.box("wall-w", [0.1, 4, 16], [-5, 2, 8], glass);
  b.box("wall-e", [0.1, 4, 16], [5, 2, 8], glass);
  b.box("wall-n", [10, 4, 0.1], [0, 2, 16], glass);
  b.box("roof", [10, 0.1, 16], [0, 4.6, 8], glass, { collide: false });
  b.wallWithGap("wall-s", "x", [0, 0, 0], 10, 4, [0, 1.6, 2.4], glass);
  b.door("gh-door", [-0.8, 0, 0], 1.6, 2.4, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("out-block", [3, 4, 0.2], [0, 2, -1.4], dark).isVisible = false;
  b.box("out-w", [0.2, 4, 1.4], [-1.5, 2, -0.7], dark).isVisible = false;
  b.box("out-e", [0.2, 4, 1.4], [1.5, 2, -0.7], dark).isVisible = false;
  for (let z = 0; z <= 16; z += 4) {
    b.box(`frame-w-${z}`, [0.12, 4.6, 0.12], [-5, 2.3, z], frame, { collide: false });
    b.box(`frame-e-${z}`, [0.12, 4.6, 0.12], [5, 2.3, z], frame, { collide: false });
  }

  // ---- 植物（通路の両側） ----
  const plants: TransformNode[] = [];
  for (const side of [-1, 1]) {
    for (let k = 0; k < 6; k++) {
      const z = 1.8 + k * 2.1;
      const p = new TransformNode(`plant-${side}-${k}`, b.scene);
      p.position.set(side * (2.4 + (k % 2) * 1.2), 0, z);
      const trunk = b.cylinder(`plant-${side}-${k}-trunk`, 2.2, 0.18, [0, 1.1, 0], stem, {
        collide: false,
      });
      trunk.parent = p;
      for (let l = 0; l < 4; l++) {
        const leaf = b.box(`plant-${side}-${k}-leaf-${l}`, [1.4, 0.04, 0.5], [0.5, 1.6 + l * 0.25, 0], l % 2 ? leafA : leafB, {
          collide: false,
          parent: p,
        });
        leaf.rotation.set(0.2, l * 1.6, -0.35);
      }
      plants.push(p);
    }
    b.box(`bed-${side}`, [3, 1.8, 13], [side * 3, 0.9, 7.5], dark).isVisible = false;
  }

  // ---- 巨大な花 ----
  b.register("planter", b.cylinder("planter", 0.6, 2.2, [0, 0.3, 14], b.mat("#5a4030")));
  b.cylinder("flower-stem", 1.0, 0.16, [0, 1.0, 14], stem, { collide: false });
  const bud = b.cylinder("bud", 1.2, 0.5, [0, 1.9, 14], petal, {
    collide: false,
    diameterTop: 0.1,
  });
  b.register("bud", bud);
  const bloom = new TransformNode("bloom", b.scene);
  bloom.position.set(0, 1.6, 14);
  const hinges: TransformNode[] = [];
  for (let k = 0; k < 6; k++) {
    const holder = new TransformNode(`petal-holder-${k}`, b.scene);
    holder.parent = bloom;
    holder.rotation.y = (k * Math.PI) / 3;
    const hinge = new TransformNode(`petal-hinge-${k}`, b.scene);
    hinge.parent = holder;
    hinge.rotation.x = -1.3;
    // 花びら越しに中の人影を「見た」判定が通るよう、ピック対象外にする
    b.box(`petal-${k}`, [0.5, 0.05, 1.1], [0, 0, 0.55], petal, {
      collide: false,
      parent: hinge,
    }).isPickable = false;
    hinges.push(hinge);
  }
  bloom.setEnabled(false);
  b.register("bloom", bloom);
  b.sign("flower-plate", ["ショクダイオオコンニャク", "開花予定：今夜"], [1.2, 0.35], [0, 0.75, 12.88], 0, {
    bg: "#f0ead8",
    fg: "#203020",
    glow: 0.4,
  });
  b.cylinder("tripod", 1.4, 0.08, [1.6, 0.7, 12.5], frame, { collide: false });
  const cam = b.box("camera", [0.25, 0.18, 0.3], [1.6, 1.5, 12.5], dark);
  b.register("camera", cam);

  // ---- ガラスの手形 ----
  const hands = new TransformNode("hands", b.scene);
  const handMat = b.mat("#c8d8d0", { alpha: 0.5, emissive: "#303830" });
  for (let k = 0; k < 7; k++) {
    b.box(`hand-${k}`, [0.02, 0.2, 0.14], [-4.93, 1.0 + (k % 3) * 0.45, 5 + k * 0.7], handMat, {
      collide: false,
      parent: hands,
    });
  }
  hands.setEnabled(false);
  b.register("hands", hands);

  // ---- 照明 ----
  b.lamp("gh", [0, 4.2, 4], "#d0ffd8", 0.45, 10, true);
  b.lamp("gh", [0, 4.2, 11], "#d0ffd8", 0.45, 10, true);
  b.lamp("spot", [0, 3.2, 13], "#ffe8d0", 0.5, 5, false);
  const red = b.lamp("red", [0, 3.5, 13], "#ff2040", 0.35, 9, false);
  red.light.setEnabled(false);

  b.figure(
    "flower-woman",
    [0, 0.6, 14],
    { skin: "#a8b8a8", cloth: "#4a1020", hair: "#050505", eyes: "#000000" },
    false,
  );

  // ---- 動き ----
  let rustleT = -1;
  let open = 0;
  let openTarget = 0;
  return {
    update: (_g, dt) => {
      if (rustleT >= 0) {
        rustleT += dt;
        plants.forEach((p, i) => {
          const order = 5 - (i % 6); // 奥（k=5）から手前へ
          const local = rustleT - order * 0.7;
          p.rotation.z = local > 0 && local < 1.2 ? Math.sin(local * 18) * 0.06 : 0;
        });
        if (rustleT > 6) {
          rustleT = -1;
        }
      }
      open += (openTarget - open) * Math.min(1, dt * 1.2);
      for (const h of hinges) {
        h.rotation.x = -1.3 + open * 1.1;
      }
    },
    custom: {
      rustle: (g) => {
        rustleT = 0;
        g.audio?.play("footsteps", { x: 0, y: 0.5, z: 12 }, 0.5);
      },
      bloomOpen: (g) => {
        openTarget = 1;
        g.audio?.play("creak", { x: 0, y: 1.8, z: 14 }, 0.7);
      },
    },
  };
};
