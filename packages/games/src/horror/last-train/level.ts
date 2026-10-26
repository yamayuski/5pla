import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/** 地下鉄ホーム・線路・トンネル・改札通路を組み立てる */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const scene = b.scene;
  const tile = b.mat("#cfd2cc");
  const floor = b.mat("#6b6a63");
  const ceiling = b.mat("#2b2c2e");
  const dark = b.mat("#1a1a1a");
  const concrete = b.mat("#3c3b38");
  const rail = b.mat("#8a8a8a", { specular: 0.5 });
  const yellow = b.mat("#c9a227");
  const barrier = b.mat("#9aa3a8", { specular: 0.3 });
  const bench = b.mat("#5a3b2a");
  const steel = b.mat("#55595c", { specular: 0.4 });

  // ホーム
  b.box("platform", [6, 0.2, 60], [0, -0.1, 0], floor);
  b.box("yellow-line", [0.3, 0.01, 60], [2.4, 0.005, 0], yellow, {
    collide: false,
  });
  b.box("ceiling", [12, 0.2, 140], [3, 3.5, 0], ceiling);
  // 背面の壁（改札通路の開口あり）
  b.wallWithGap("backwall", "z", [-3, 0, 0], 60, 3.4, [-20, 2.4, 2.6], tile);
  // ホーム両端
  b.box("end-n", [6, 3.4, 0.2], [0, 1.7, 30], tile);
  b.box("end-s", [6, 3.4, 0.2], [0, 1.7, -30], tile);
  // ホームドア（落下防止を兼ねる）
  for (let z = -29; z < 30; z += 4) {
    b.box(`pdoor-${z}`, [0.15, 1.3, 3.6], [2.95, 0.65, z + 1.8], barrier);
  }
  // 線路・トンネル
  b.box("trackbed", [6, 0.2, 140], [6, -1.4, 0], concrete);
  for (const x of [5.3, 6.7]) {
    b.box(`rail-${x}`, [0.1, 0.15, 140], [x, -1.22, 0], rail, {
      collide: false,
    });
  }
  for (let z = -68; z <= 68; z += 1.2) {
    b.box(`sleeper-${z}`, [2.2, 0.08, 0.25], [6, -1.28, z], dark, {
      collide: false,
    });
  }
  b.box("tunnel-wall", [0.2, 5, 140], [9, 1, 0], concrete);
  b.box("tunnel-n-side", [0.2, 5, 40], [3, 1, 50], concrete);
  b.box("tunnel-s-side", [0.2, 5, 40], [3, 1, -50], concrete);
  b.box("tunnel-n-end", [6, 5, 0.2], [6, 1, 70], dark);
  b.box("tunnel-s-end", [6, 5, 0.2], [6, 1, -70], dark);
  b.box("pit-wall", [0.2, 1.4, 60], [3.05, -0.7, 0], concrete);

  // 柱とベンチ
  for (let z = -25; z <= 25; z += 10) {
    b.cylinder(`pillar-${z}`, 3.4, 0.5, [0.6, 1.7, z], steel);
  }
  for (const z of [2, -12, 16]) {
    b.box(`bench-${z}`, [0.6, 0.08, 2], [-2.4, 0.45, z], bench);
    b.box(`bench-back-${z}`, [0.08, 0.5, 2], [-2.7, 0.75, z], bench);
    b.box(`bench-leg-${z}`, [0.5, 0.45, 0.1], [-2.4, 0.22, z], steel);
  }

  // 看板
  b.sign(
    "station-name",
    ["黄泉坂", "よみざか  YOMIZAKA"],
    [3, 1],
    [-2.88, 2.2, 6],
    -Math.PI / 2,
  );
  b.sign(
    "station-name2",
    ["黄泉坂", "よみざか  YOMIZAKA"],
    [3, 1],
    [-2.88, 2.2, -8],
    -Math.PI / 2,
  );
  b.sign(
    "exit-sign",
    ["改札・出口"],
    [1.6, 0.35],
    [-1.5, 3.0, -18.6],
    Math.PI,
    { bg: "#f0c419", fg: "#111", glow: 0.3 },
  );
  b.sign("clock", ["0:42"], [0.8, 0.4], [-1.2, 3.0, 0], Math.PI, {
    bg: "#111",
    fg: "#e33",
    glow: 0.6,
  });
  b.sign(
    "poster",
    ["さがしています", "", "昭和六十二年 終電後", "このホームで"],
    [0.9, 1.25],
    [-2.88, 1.5, -15],
    -Math.PI / 2,
    { bg: "#d8d0b8", fg: "#2a2a2a" },
  );
  b.sign(
    "intercom-label",
    ["駅員呼出"],
    [0.5, 0.18],
    [-2.88, 1.75, 27],
    -Math.PI / 2,
    {
      bg: "#c22",
      fg: "#fff",
      glow: 0.3,
    },
  );
  b.register(
    "intercom",
    b.box("intercom", [0.12, 0.3, 0.22], [-2.88, 1.4, 27], steel),
  );

  // 改札通路
  b.room(
    "corridor",
    [-7, 0, -20],
    8,
    2.4,
    2.6,
    { floor, wall: tile, ceiling },
    ["e"],
  );
  b.register(
    "shutter",
    b.box("shutter", [0.1, 2.6, 2.4], [-9, 1.3, -20], steel),
  );
  b.sign("gate-sign", ["改札"], [1, 0.35], [-10.88, 2.2, -20], -Math.PI / 2, {
    bg: "#1f3f8f",
    fg: "#fff",
    glow: 0.3,
  });
  b.register(
    "intercom2",
    b.box("intercom2", [0.22, 0.3, 0.12], [-7, 1.4, -20.98], steel),
  );
  b.sign(
    "intercom2-label",
    ["駅員呼出"],
    [0.5, 0.18],
    [-7, 1.75, -21.08],
    Math.PI,
    {
      bg: "#c22",
      fg: "#fff",
      glow: 0.3,
    },
  );
  // 振り返り判定用の不可視マーカー（通路口の向こう＝ホーム側）
  const mark = MeshBuilder.CreateBox("platform-mark", { size: 0.3 }, scene);
  mark.position = new Vector3(-1.5, 1.6, -20);
  mark.isVisible = false;
  mark.isPickable = false;
  b.register("platform-mark", mark);

  // 照明
  b.lamp("north", [0, 3.3, 22], "#e8f0ff", 0.9, 14);
  b.lamp("north", [0, 3.3, 10], "#e8f0ff", 0.9, 14);
  b.lamp("center", [0, 3.3, -1], "#e8f0ff", 0.8, 14);
  b.lamp("south", [0, 3.3, -12], "#e8f0ff", 0.8, 14);
  b.lamp("south", [-6, 2.5, -20], "#e8f0ff", 0.6, 8);

  // 人影（ホーム南端に立つ／最後のジャンプスケア）
  b.figure("woman", [0.5, 0, -27], { cloth: "#8c8a86" });

  // 無人の電車（最後にトンネルから入ってくる）
  const train = new TransformNode("train", scene);
  train.position = new Vector3(6, 0, -110);
  const body = b.box(
    "train-body",
    [2.8, 3.2, 60],
    [0, 0.3, -30],
    b.mat("#b9bcbf", { specular: 0.4 }),
    {
      collide: false,
    },
  );
  body.parent = train;
  const windowMat = b.mat("#111111", { emissive: "#1c2620" });
  for (let z = -55; z < -2; z += 4) {
    const w = b.box(
      `train-window-${z}`,
      [2.9, 0.9, 2],
      [0, 1.0, z],
      windowMat,
      {
        collide: false,
      },
    );
    w.parent = train;
  }
  const headMat = b.mat("#ffffff", { emissive: "#fff6d8" });
  for (const x of [-0.9, 0.9]) {
    const h = MeshBuilder.CreateSphere(
      `train-head-${x}`,
      { diameter: 0.3 },
      scene,
    );
    h.parent = train;
    h.position = new Vector3(x, -0.6, 0.05);
    h.material = headMat;
  }
  const headlight = new PointLight(
    "train-light",
    new Vector3(0, -0.4, 1.5),
    scene,
  );
  headlight.parent = train;
  headlight.diffuse = new Color3(1, 0.95, 0.8);
  headlight.intensity = 1.2;
  headlight.range = 18;
  headlight.setEnabled(false);
  b.register("train", train);

  return {
    custom: {
      trainArrive: (game) => {
        headlight.setEnabled(true);
        train.position = new Vector3(6, 0, -110);
        game.run({
          type: "move",
          target: "train",
          to: [6, 0, 31],
          duration: 9,
        });
      },
    },
  };
};
