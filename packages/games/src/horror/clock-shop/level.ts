import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 商店街の古い時計店。店内は x=-3.5〜3.5, z=0〜8、南（z=0）がガラス戸 shop-door。
 * 東西の壁一面に掛け時計 clock-*（針は TransformNode で回す）、北に大きな柱時計 grandfather と振り子 pendulum、
 * 中央に修理台 bench（預かり品の懐中時計 pocketwatch）。奥の作業場ののれん noren-back。
 * フック：clocksStop（全部の針が 2:14 で止まる）、clocksBack（針が逆回り）、pendulumStop。
 * 最後は柱時計の扉の中に立っている店主 keeper（扉 gf-door が開く）。ガラス戸の外にシャッター shutter。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#4a3828");
  const wall = b.mat("#8a7458");
  const ceiling = b.mat("#3a2a1c");
  const wood = b.mat("#5a3a20", { specular: 0.4 });
  const face = b.mat("#f0e8d0", { emissive: "#302a20" });
  const hand = b.mat("#101010");
  const brass = b.mat("#c8a040", { specular: 0.8 });
  const glass = b.mat("#203038", { alpha: 0.35, specular: 0.9 });

  b.room("shop", [0, 0, 4], 7, 8, 2.8, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 7, 2.8, [0, 1.4, 2.2], glass);
  b.door("shop-door", [-0.7, 0, 0], 1.4, 2.2, 0, glass, { open: false, interactive: false, locked: true });
  b.sign("closed", ["本日閉店", "修理品のお渡しは裏口へ"], [0.8, 0.3], [0, 1.5, -0.04], Math.PI, { bg: "#f0e8d0", fg: "#801010", glow: 0.4 });

  // ---- 掛け時計（東西の壁） ----
  const hands: { hour: TransformNode; min: TransformNode; speed: number }[] = [];
  let n = 0;
  for (const side of [-1, 1]) {
    for (let row = 0; row < 2; row++) {
      for (let k = 0; k < 4; k++) {
        const z = 1.4 + k * 1.6 + row * 0.5;
        const y = 1.3 + row * 0.75;
        const x = side * 3.42;
        const rotY = side < 0 ? -Math.PI / 2 : Math.PI / 2;
        const c = b.cylinder(`clock-${n}`, 0.06, 0.42 - (k % 2) * 0.1, [x, y, z], face, { collide: false });
        c.rotation.z = Math.PI / 2;
        const pivot = new TransformNode(`clock-${n}-pivot`, b.scene);
        pivot.position.set(x - side * 0.04, y, z);
        pivot.rotation.y = rotY;
        const hour = new TransformNode(`clock-${n}-h`, b.scene);
        hour.parent = pivot;
        b.box(`clock-${n}-hh`, [0.02, 0.1, 0.01], [0, 0.05, 0], hand, { collide: false, parent: hour });
        const min = new TransformNode(`clock-${n}-m`, b.scene);
        min.parent = pivot;
        b.box(`clock-${n}-mh`, [0.012, 0.16, 0.01], [0, 0.08, 0], hand, { collide: false, parent: min });
        hour.rotation.z = -n * 0.7;
        min.rotation.z = -n * 1.9;
        hands.push({ hour, min, speed: 0.8 + (n % 3) * 0.2 });
        n++;
      }
    }
  }

  // ---- 柱時計 ----
  const gf = new TransformNode("grandfather", b.scene);
  gf.position.set(0, 0, 7.6);
  b.register("grandfather", gf);
  // 中が見える箱：背板・側板・天板・台座
  b.box("gf-back", [0.9, 2.4, 0.05], [0, 1.2, 0.22], wood, { parent: gf });
  for (const sx of [-0.43, 0.43]) {
    b.box(`gf-side-${sx}`, [0.05, 2.4, 0.5], [sx, 1.2, 0], wood, { parent: gf });
  }
  b.box("gf-top", [0.9, 0.7, 0.5], [0, 2.05, 0], wood, { parent: gf });
  b.box("gf-base", [0.9, 0.3, 0.5], [0, 0.15, 0], wood, { parent: gf });
  b.cylinder("gf-face", 0.05, 0.5, [0, 2.05, 7.33], face, { collide: false }).rotation.x = Math.PI / 2;
  b.door("gf-door", [0.4, 0.3, 7.33], 0.8, 1.4, Math.PI, b.mat("#4a3020", { alpha: 0.6, specular: 0.6 }), { open: false, interactive: false });
  const pendulum = new TransformNode("pendulum", b.scene);
  pendulum.position.set(0, 1.65, 7.45);
  b.box("pendulum-rod", [0.02, 0.9, 0.02], [0, -0.45, 0], brass, { collide: false, parent: pendulum });
  b.cylinder("pendulum-bob", 0.03, 0.22, [0, -0.95, 0], brass, { collide: false }).parent = pendulum;
  b.register("pendulum", pendulum);
  b.sign("gf-label", ["非売品"], [0.3, 0.12], [0.6, 1.0, 7.33], 0, { bg: "#f0e8d0", fg: "#202020", glow: 0.3 });

  // ---- 修理台 ----
  b.box("bench", [1.6, 0.85, 0.8], [0, 0.43, 4], wood);
  const pw = b.cylinder("pocketwatch", 0.03, 0.12, [0.2, 0.88, 3.9], brass, { collide: false });
  b.register("pocketwatch", pw);
  b.sign("tag", ["お預かり品", "受取人：あなた　昭和五十九年"], [0.36, 0.14], [-0.3, 0.875, 3.9], 0, {
    bg: "#f0e8d0",
    fg: "#202020",
    glow: 0.4,
  }).rotation.x = Math.PI / 2;
  b.lamp("bench", [0, 1.6, 4], "#ffd8a0", 0.5, 4, true);
  b.lamp("shop", [0, 2.6, 2], "#ffe8c0", 0.4, 7, true);
  const red = b.lamp("red", [0, 2.6, 6.5], "#ff2010", 0.3, 7, false);
  red.light.setEnabled(false);

  // ---- 奥の作業場ののれん ----
  b.box("noren-back", [0.9, 1.0, 0.02], [2.4, 1.8, 7.95], b.mat("#2a2a50"), { collide: false });

  // ---- ガラス戸の外のシャッター（最初は巻き上げてある） ----
  const shutter = b.box("shutter", [7.2, 2.8, 0.06], [0, 4.2, -0.2], b.mat("#7a7e80", { specular: 0.3 }), { collide: false });
  b.register("shutter", shutter);

  const keeper = b.figure(
    "keeper",
    [0, 0.3, 7.45],
    { skin: "#b0aca4", cloth: "#3a3428", hair: "#c8c8c0", eyes: "#000000", longHair: false, height: 0.95 },
    false,
  );
  keeper.rotation.y = Math.PI;

  // ---- 動き ----
  let mode: "run" | "stop" | "back" = "run";
  let swing = true;
  return {
    update: (g, dt) => {
      if (swing) {
        pendulum.rotation.z = Math.sin(g.elapsed * Math.PI) * 0.25;
      }
      if (mode === "stop") {
        return;
      }
      const dir = mode === "back" ? -6 : 1;
      for (const h of hands) {
        h.min.rotation.z -= dt * 0.1 * h.speed * dir;
        h.hour.rotation.z -= dt * 0.008 * h.speed * dir;
      }
    },
    custom: {
      clocksStop: (g) => {
        mode = "stop";
        for (const h of hands) {
          // 2:14
          h.hour.rotation.z = -((2 + 14 / 60) / 12) * Math.PI * 2;
          h.min.rotation.z = -(14 / 60) * Math.PI * 2;
        }
        g.audio?.play("bell", { x: 0, y: 2, z: 7.5 }, 0.5);
      },
      clocksBack: () => {
        mode = "back";
      },
      pendulumStop: () => {
        swing = false;
        pendulum.rotation.z = 0;
      },
    },
  };
};
