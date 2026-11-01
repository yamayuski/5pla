import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 夜行寝台列車の一両。通路は x=-1.6〜-0.4（幅1.2m）、z=0〜16。西側（x=-1.6）は窓、東側に個室が6つ（扉 room-1〜6、z=1.5+2.4k）。
 * 自分の個室は room-1（扉は開いている、中は x=-0.4〜1.6）。両端に連結扉 gangway-s / gangway-n。北端に洗面台 basin。
 * 窓の外を流れる灯り lights-out（フックで流す）、窓に並走する顔 window-face（フック faceFollow で追従）。
 * 最後は通路の北端から歩いてくる車掌 conductor。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const carpet = b.mat("#5a2028");
  const wall = b.mat("#c8b898");
  const ceiling = b.mat("#d8d0c0");
  const doorMat = b.mat("#8a6a48", { specular: 0.3 });
  const glass = b.mat("#05080c", { alpha: 0.6, specular: 1 });
  const dark = b.mat("#020202");

  // ---- 通路 ----
  b.box("floor", [3.2, 0.2, 16], [0.0, -0.1, 8], carpet);
  b.box("ceil", [3.2, 0.1, 16], [0, 2.3, 8], ceiling, { collide: false });
  b.box("west-low", [0.1, 0.9, 16], [-1.65, 0.45, 8], wall);
  b.box("west-high", [0.1, 0.5, 16], [-1.65, 2.05, 8], wall);
  b.box("west-glass", [0.04, 0.9, 16], [-1.65, 1.35, 8], glass);
  b.box("outside", [0.1, 3, 16], [-4, 1.5, 8], dark, { collide: false });
  b.box("handrail", [0.06, 0.06, 16], [-1.55, 1.0, 8], b.mat("#c8b060", { specular: 0.7 }), { collide: false });

  // 東側の壁と個室の扉
  for (let k = 0; k < 6; k++) {
    const z = 0.3 + k * 2.4;
    b.box(`east-wall-${k}`, [0.1, 2.3, 1.5], [-0.35, 1.15, z + 1.65], wall);
    b.door(`room-${k + 1}`, [-0.35, 0, z + 0.9], 0.9, 2.0, Math.PI / 2, doorMat, {
      open: k === 0,
      interactive: false,
    });
    b.sign(`plate-${k + 1}`, [`${k + 1}号室`], [0.3, 0.12], [-0.42, 2.1, z + 0.45], Math.PI / 2, {
      bg: "#e8e0c8",
      fg: "#202020",
      glow: 0.3,
    });
  }
  // 自分の個室（room-1 の中）
  b.box("cabin-floor", [2, 0.2, 2.2], [0.6, -0.1, 1.4], carpet);
  b.box("cabin-e", [0.1, 2.3, 2.2], [1.65, 1.15, 1.4], wall);
  b.box("cabin-n", [2, 2.3, 0.1], [0.6, 1.15, 2.5], wall);
  b.box("cabin-s", [2, 2.3, 0.1], [0.6, 1.15, 0.3], wall);
  b.box("berth", [1.0, 0.5, 1.9], [1.1, 0.25, 1.4], b.mat("#e8e4d8"));
  const pillow = b.box("pillow", [0.4, 0.12, 0.3], [1.1, 0.56, 0.7], b.mat("#ffffff"), { collide: false });
  b.register("pillow", pillow);
  // 他の個室の中は見えない壁で塞ぐ
  b.box("rooms-block", [0.1, 2.3, 13.4], [0.2, 1.15, 9.3], dark).isVisible = false;

  // ---- 連結扉 ----
  b.box("end-s", [3.2, 2.3, 0.1], [0, 1.15, 0], wall);
  b.box("end-n-l", [1.0, 2.3, 0.1], [-2.1, 1.15, 16], wall);
  b.box("end-n-r", [1.4, 2.3, 0.1], [0.6, 1.15, 16], wall);
  b.door("gangway-n", [-1.6, 0, 16], 1.2, 2.0, 0, doorMat, { open: true, interactive: false });
  b.box("beyond-n", [1.4, 2.4, 0.1], [-1.0, 1.2, 17.4], dark).isVisible = false;
  b.sign("next-car", ["← 2号車  ｜  4号車 →"], [1.0, 0.18], [-1.0, 2.15, 15.94], 0, { bg: "#202020", fg: "#f0d060", glow: 0.7 });
  const announce = b.sign("led", ["この列車は 寝台特急 です"], [1.0, 0.16], [-1.0, 2.15, 0.06], Math.PI, {
    bg: "#050505",
    fg: "#ff8020",
    glow: 0.9,
  });
  b.register("led", announce);
  b.sign("led-b", ["次は 終点 ─── です"], [1.0, 0.16], [-1.0, 2.15, 0.07], Math.PI, {
    bg: "#050505",
    fg: "#ff2020",
    glow: 0.9,
  }).setEnabled(false);

  // ---- 洗面台 ----
  const basin = b.box("basin", [0.7, 0.85, 0.5], [-1.0, 0.43, 15.6], b.mat("#e8e8e8", { specular: 0.6 }));
  b.register("basin", basin);

  // ---- 窓の外を流れる灯り ----
  const outside = new TransformNode("lights-out", b.scene);
  const passMat = b.mat("#ffd8a0", { emissive: "#ffc080" });
  for (let i = 0; i < 6; i++) {
    b.box(`pass-${i}`, [0.1, 0.12, 0.4], [-3.5, 1.4 + (i % 2) * 0.6, i * 6], passMat, { collide: false, parent: outside });
  }
  // 窓に貼りつく顔
  const face = b.figure(
    "window-face",
    [-2.0, 0, 6],
    { skin: "#c8ccc8", cloth: "#202020", hair: "#050505", eyes: "#000000" },
    false,
  );
  face.rotation.y = Math.PI / 2;

  // ---- 照明 ----
  b.lamp("car", [-1, 2.15, 4], "#fff0d0", 0.45, 7, true);
  b.lamp("car", [-1, 2.15, 11], "#fff0d0", 0.45, 7, true);
  b.lamp("cabin", [0.6, 2.0, 1.4], "#ffe0b0", 0.35, 3, false);
  const red = b.lamp("red", [-1, 2.1, 8], "#4060ff", 0.25, 10, false);
  red.light.setEnabled(false);

  const conductor = b.figure(
    "conductor",
    [-1.0, 0, 16.8],
    { skin: "#a8acaa", cloth: "#1a2030", hair: "#080808", eyes: "#000000", longHair: false },
    false,
  );
  conductor.rotation.y = Math.PI;

  // ---- 動き ----
  let follow = false;
  return {
    update: (g, dt) => {
      outside.position.z -= dt * 14;
      if (outside.position.z < -36) {
        outside.position.z += 36;
      }
      if (follow) {
        face.position.z += (g.camera.position.z - face.position.z) * Math.min(1, dt * 2);
      }
    },
    custom: {
      faceFollow: (g) => {
        follow = true;
        face.position.z = g.camera.position.z + 2;
      },
      faceGone: () => {
        follow = false;
        face.setEnabled(false);
      },
    },
  };
};
