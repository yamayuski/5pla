import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * ロープウェイのゴンドラ内。x=-1.5〜1.5, z=-2〜2、床 y=0、天井 2.4m。
 * 壁は腰高(1.0m)までで、上はガラス。外は霧と遠くの町の灯り。
 * 東の窓の外に向かいのゴンドラ(gondola-b)と、逆さにぶら下がる女(hanger)。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#3a3a40");
  const wall = b.mat("#8a2a2a");
  const ceiling = b.mat("#d0d0d4");
  const frame = b.mat("#2a2a30", { specular: 0.4 });
  const glass = b.mat("#a8c0d8", { alpha: 0.18, specular: 0.8 });
  const town = b.mat("#ffc870", { emissive: "#ffb040" });
  const townB = b.mat("#fff0d0", { emissive: "#d8d0b0" });
  const bench = b.mat("#5a4a3a");

  // ---- ゴンドラ ----
  b.box("g-floor", [3, 0.2, 4], [0, -0.1, 0], floor);
  b.box("g-ceil", [3, 0.2, 4], [0, 2.5, 0], ceiling);
  for (const [n, size, pos] of [
    ["g-low-n", [3, 1.0, 0.1], [0, 0.5, 2]],
    ["g-low-s", [3, 1.0, 0.1], [0, 0.5, -2]],
    ["g-low-e", [0.1, 1.0, 4], [1.5, 0.5, 0]],
    ["g-low-w", [0.1, 1.0, 4], [-1.5, 0.5, 0]],
  ] as const) {
    b.box(n, size, pos, wall);
  }
  for (const [n, size, pos] of [
    ["glass-n", [3, 1.4, 0.04], [0, 1.7, 2]],
    ["glass-s", [3, 1.4, 0.04], [0, 1.7, -2]],
    ["glass-e", [0.04, 1.4, 4], [1.5, 1.7, 0]],
    ["glass-w", [0.04, 1.4, 4], [-1.5, 1.7, 0]],
  ] as const) {
    b.box(n, size, pos, glass);
  }
  for (const [x, z] of [
    [-1.5, -2],
    [1.5, -2],
    [-1.5, 2],
    [1.5, 2],
    [1.5, 0],
    [-1.5, 0],
  ] as const) {
    b.box(`post-${x}-${z}`, [0.1, 1.4, 0.1], [x, 1.7, z], frame);
  }
  // ベンチ
  b.box("bench-w", [0.4, 0.4, 2], [-1.2, 0.2, 0], bench);
  // インターホン（西の壁）
  const intercom = b.box(
    "intercom",
    [0.1, 0.3, 0.2],
    [-1.4, 1.3, 1.5],
    b.mat("#c8c8c0"),
    {
      collide: false,
    },
  );
  b.register("intercom", intercom);
  b.sign(
    "rule",
    ["定員 12名", "窓から身を乗り出さないで"],
    [1.2, 0.4],
    [0.3, 1.2, -1.94],
    0,
    {
      bg: "#f4f0e0",
      fg: "#222",
      glow: 0.25,
    },
  );

  // ---- 外の景色：麓の町の灯り（はるか下）と、遠い山の稜線 ----
  for (let i = 0; i < 60; i++) {
    const a = i * 2.399;
    const r = 30 + (i % 7) * 7;
    b.box(
      `town-${i}`,
      [0.6, 0.6, 0.6],
      [Math.cos(a) * r, -40 - (i % 5), Math.sin(a) * r],
      i % 3 ? town : townB,
      {
        collide: false,
      },
    );
  }
  b.box("cable", [0.08, 0.08, 120], [0, 3.2, 0], frame, { collide: false });

  // ---- 向かいのゴンドラ（東 x=7、最初は非表示。z 方向へすれ違う） ----
  const gb = new TransformNode("gondola-b", b.scene);
  gb.position.set(7, 0, -30);
  const body = b.mat("#6a6a74");
  const lit = b.mat("#fff4d0", { emissive: "#a09070" });
  b.box("gb-floor", [3, 0.2, 4], [0, -0.1, 0], body, {
    collide: false,
    parent: gb,
  });
  b.box("gb-ceil", [3, 0.2, 4], [0, 2.5, 0], body, {
    collide: false,
    parent: gb,
  });
  b.box("gb-back", [0.1, 2.4, 4], [1.5, 1.2, 0], lit, {
    collide: false,
    parent: gb,
  });
  const pas = b.figure(
    "gb-passenger",
    [-1.0, 0, 0],
    {
      skin: "#d0ccc4",
      hair: "#080808",
      cloth: "#d8d0c8",
      eyes: "#000000",
      height: 1.0,
    },
    true,
  );
  pas.parent = gb;
  pas.position.set(-1.1, 0, 0);
  pas.rotation.y = -Math.PI / 2;
  gb.setEnabled(false);
  b.register("gondola-b", gb);

  // ---- 窓の外に逆さにぶら下がる女 ----
  const hanger = b.figure(
    "hanger",
    [2.0, 3.0, 0],
    {
      skin: "#c8ccd0",
      hair: "#050508",
      cloth: "#d8d4cc",
      eyes: "#000000",
      height: 1.0,
    },
    false,
  );
  hanger.rotation.set(0, -Math.PI / 2, Math.PI);

  // ---- 照明 ----
  b.lamp("cabin", [0, 2.3, 0], "#ffe0b0", 0.5, 6, true);

  // ---- 最後の一発 ----
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c8ccd0",
      hair: "#050508",
      cloth: "#d8d4cc",
      eyes: "#000000",
      height: 1.0,
    },
    false,
  );
  return {};
};
