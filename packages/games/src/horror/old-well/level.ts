import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 田舎の祖父母の家の裏庭（屋外）。庭は x=-8〜8, z=0〜16、南（z=0）が母屋の裏壁で勝手口 back-door。
 * 中央に古井戸 well（x=0, z=9、井桁と滑車、釣瓶 bucket）、西に柿の木、東に物置と物干し。
 * 井戸から勝手口へ続く濡れた足跡 prints、最後は井戸から這い上がる well-girl。
 * フック：bucketDrop（釣瓶の縄が井戸の中へ引き込まれる）、bucketUp（釣瓶を引き上げる）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const soil = b.mat("#2a2a1e");
  const houseWall = b.mat("#5a4a38");
  const stone = b.mat("#5c5c58");
  const wood = b.mat("#4a3420");
  const leaf = b.mat("#1a2a18");
  const wet = b.mat("#0c0c0a", { specular: 0.8 });
  const dark = b.mat("#000000");

  b.box("ground", [16, 0.2, 16], [0, -0.1, 8], soil);
  // 生け垣（外周）
  for (const [n, size, pos] of [
    ["hedge-n", [16, 1.8, 0.6], [0, 0.9, 16]],
    ["hedge-w", [0.6, 1.8, 16], [-8, 0.9, 8]],
    ["hedge-e", [0.6, 1.8, 16], [8, 0.9, 8]],
  ] as const) {
    b.box(n, size, pos, leaf);
  }
  b.box("sky-block-n", [16, 6, 0.2], [0, 3, 16.4], dark).isVisible = false;

  // ---- 母屋の裏壁と勝手口 ----
  b.wallWithGap("house", "x", [0, 0, 0], 16, 3.2, [-3, 0.9, 1.9], houseWall);
  b.door("back-door", [-3.45, 0, 0], 0.9, 1.9, 0, b.mat("#6a5a40"), {
    open: true,
    interactive: false,
  });
  b.box("inside-block", [2, 3, 0.2], [-3, 1.5, -1.2], dark).isVisible = false;
  b.box("inside-w", [0.2, 3, 1.2], [-4, 1.5, -0.6], dark).isVisible = false;
  b.box("inside-e", [0.2, 3, 1.2], [-2, 1.5, -0.6], dark).isVisible = false;
  b.box("eave", [16, 0.15, 1.2], [0, 3.1, 0.5], wood, { collide: false });
  b.lamp("porch", [-3, 2.5, 0.6], "#ffd8a0", 0.6, 9, true);
  b.sign("window", [""], [1.4, 0.9], [2.5, 1.6, 0.12], Math.PI, {
    bg: "#ffd890",
    fg: "#ffd890",
    glow: 0.6,
  });

  // ---- 古井戸 ----
  const well = b.cylinder("well", 0.8, 1.5, [0, 0.4, 9], stone, { tess: 20 });
  b.register("well", well);
  b.cylinder("well-hole", 0.02, 1.2, [0, 0.81, 9], dark, { collide: false });
  for (const sx of [-0.85, 0.85]) {
    b.box(`well-post-${sx}`, [0.12, 2.2, 0.12], [sx, 1.1, 9], wood);
  }
  b.box("well-beam", [1.9, 0.12, 0.12], [0, 2.2, 9], wood, { collide: false });
  b.cylinder("well-pulley", 0.08, 0.3, [0, 2.1, 9], wood, { collide: false }).rotation.z = Math.PI / 2;
  const bucket = new TransformNode("bucket", b.scene);
  bucket.position.set(0, 0.85, 9);
  b.cylinder("bucket-body", 0.3, 0.3, [0, 0, 0], wood, { collide: false }).parent = bucket;
  const rope = b.box("rope", [0.03, 1.2, 0.03], [0, 0.75, 0], b.mat("#8a7a58"), {
    collide: false,
    parent: bucket,
  });
  b.register("bucket", bucket);

  // ---- 柿の木・物置・物干し ----
  b.cylinder("kaki-trunk", 3, 0.35, [-5, 1.5, 10], wood);
  b.box("kaki-crown", [2.6, 1.8, 2.6], [-5, 3.6, 10], leaf, { collide: false });
  b.box("shed", [2.4, 2.2, 2], [5.5, 1.1, 13], b.mat("#4a4a48"));
  for (const z of [4, 7]) {
    b.box(`pole-${z}`, [0.06, 1.9, 0.06], [5, 0.95, z], b.mat("#8a8a88"));
  }
  b.box("pole-bar", [0.04, 0.04, 3.1], [5, 1.85, 5.5], b.mat("#8a8a88"), {
    collide: false,
  });
  b.box("laundry", [0.05, 0.8, 0.7], [5, 1.4, 5.5], b.mat("#d8d8d0"), {
    collide: false,
  });

  // ---- 濡れた足跡（井戸から勝手口へ） ----
  const prints = new TransformNode("prints", b.scene);
  for (let k = 0; k < 9; k++) {
    const t = k / 8;
    const x = -3 * t + (k % 2 === 0 ? 0.12 : -0.12);
    const z = 8.1 - 7.2 * t;
    b.box(`print-${k}`, [0.11, 0.01, 0.24], [x, 0.01, z], wet, {
      collide: false,
      parent: prints,
    });
  }
  prints.setEnabled(false);
  b.register("prints", prints);

  // ---- 井戸の中の娘 ----
  b.figure(
    "well-girl",
    [0, -0.45, 9],
    { skin: "#a8b0ac", cloth: "#d8d8d0", hair: "#030303", eyes: "#000000" },
    false,
  );
  const red = b.lamp("red", [0, 2.6, 8], "#6080ff", 0.25, 8, false);
  red.light.setEnabled(false);

  // ---- 動き ----
  let target = 0.85;
  return {
    update: (_g, dt) => {
      bucket.position.y += (target - bucket.position.y) * Math.min(1, dt * 3);
      rope.scaling.y = 1 + Math.max(0, 0.85 - bucket.position.y) * 2;
    },
    custom: {
      bucketDrop: (g) => {
        target = -1.5;
        g.audio?.play("rattle", { x: 0, y: 1.5, z: 9 }, 0.8);
      },
      bucketUp: (g) => {
        target = 1.3;
        g.audio?.play("creak", { x: 0, y: 2, z: 9 }, 0.5);
        g.audio?.play("drip", { x: 0, y: 1, z: 9 }, 0.6);
      },
    },
  };
};
