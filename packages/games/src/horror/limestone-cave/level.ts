import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 観光鍾乳洞の奥の区画。洞内は x=-4〜4, z=0〜20（天井 3.5m）、木道（x=-0.8〜0.8）が奥の地底湖まで続く。
 * 南の入口に鉄格子の扉 cave-gate、木道の途中に音声ガイドの台 guide（x=1.3, z=9）、
 * 奥に地底湖 lake（z=15〜20）と展望台の柵、落ちてくる鍾乳石 falling、照明 group cave（電球の列）。
 * 最後は地底湖の水面に立つ guide-woman。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const rock = b.mat("#4a463e");
  const rockLight = b.mat("#6a6458", { specular: 0.3 });
  const wood = b.mat("#5a4028");
  const water = b.mat("#081820", { alpha: 0.85, specular: 1 });
  const iron = b.mat("#2a2a2a", { specular: 0.5 });

  b.room("cave", [0, 0, 10], 8, 20, 3.5, { floor: rock, wall: rock, ceiling: rock }, ["s"]);
  b.wallWithGap("mouth", "x", [0, 0, 0], 8, 3.5, [0, 1.6, 2.3], rock);
  b.door("cave-gate", [-0.8, 0, 0], 1.6, 2.3, 0, iron, {
    open: true,
    interactive: false,
  });
  b.box("out-block", [3, 4, 0.2], [0, 2, -1.4], rock).isVisible = false;
  b.box("out-w", [0.2, 4, 1.4], [-1.5, 2, -0.7], rock).isVisible = false;
  b.box("out-e", [0.2, 4, 1.4], [1.5, 2, -0.7], rock).isVisible = false;
  b.sign("gate-sign", ["これより先 第二洞", "見学は係員の案内に従ってください"], [1.8, 0.4], [0, 2.6, 0.12], Math.PI, {
    bg: "#e8e0c8",
    fg: "#302010",
    glow: 0.3,
  });

  // ---- 鍾乳石と石筍（でこぼこの壁） ----
  for (let k = 0; k < 22; k++) {
    const z = 1 + ((k * 7) % 19);
    const x = (k % 2 === 0 ? -1 : 1) * (2.2 + ((k * 3) % 5) * 0.35);
    const len = 0.6 + ((k * 5) % 7) * 0.18;
    const s = MeshBuilder.CreateCylinder(`stalactite-${k}`, { height: len, diameterTop: 0.35, diameterBottom: 0.02, tessellation: 8 }, b.scene);
    s.position.set(x * 0.8, 3.5 - len / 2, z);
    s.material = rockLight;
    const g = MeshBuilder.CreateCylinder(`stalagmite-${k}`, { height: len * 0.8, diameterTop: 0.04, diameterBottom: 0.45, tessellation: 8 }, b.scene);
    g.position.set(x, (len * 0.8) / 2, z + 0.4);
    g.material = rockLight;
    g.checkCollisions = true;
  }
  for (const side of [-1, 1]) {
    for (let z = 2; z < 15; z += 3) {
      const r = MeshBuilder.CreateSphere(`boulder-${side}-${z}`, { diameter: 1.6, segments: 6 }, b.scene);
      r.position.set(side * 3.5, 0.4, z);
      r.scaling.set(1, 0.7, 1.4);
      r.material = rock;
      r.checkCollisions = true;
    }
  }

  // ---- 木道と手すり ----
  b.box("boardwalk", [1.6, 0.06, 15], [0, 0.03, 7.5], wood, { collide: false });
  for (const side of [-1, 1]) {
    b.box(`handrail-${side}`, [0.05, 0.05, 15], [side * 0.85, 0.95, 7.5], wood, { collide: false });
    for (let z = 0.5; z < 15; z += 1.5) {
      b.box(`rail-post-${side}-${z}`, [0.06, 0.95, 0.06], [side * 0.85, 0.48, z], wood, { collide: false });
    }
    // 木道の外へ出ない見えない柵
    b.box(`walk-guard-${side}`, [0.1, 2, 15], [side * 0.9, 1, 7.5], rock).isVisible = false;
  }

  // ---- 音声ガイド ----
  b.box("guide-post", [0.1, 1.0, 0.1], [0.75, 0.5, 9], iron, { collide: false });
  const guide = b.box("guide", [0.35, 0.25, 0.12], [0.75, 1.12, 9], b.mat("#c8a020", { emissive: "#302000" }), {
    collide: false,
  });
  b.register("guide", guide);
  b.sign("guide-label", ["音声ガイド ⑦", "地底湖「鏡ヶ淵」"], [0.4, 0.2], [0.75, 1.36, 8.93], 0, {
    bg: "#202020",
    fg: "#f0d040",
    glow: 0.6,
  });

  // ---- 地底湖と展望台 ----
  b.box("lake", [8, 0.04, 5], [0, 0.02, 17.5], water, { collide: false });
  b.box("lake-guard", [8, 2, 0.1], [0, 1, 15.05], rock).isVisible = false;
  b.box("deck-rail", [3, 0.05, 0.05], [0, 0.95, 15], wood, { collide: false });
  b.sign("lake-sign", ["鏡ヶ淵", "水深 不明  柵から身を乗り出さないこと"], [1.6, 0.35], [-1.8, 1.0, 14.9], 0, {
    bg: "#e8e0c8",
    fg: "#302010",
    glow: 0.3,
  });

  // ---- 落ちる鍾乳石 ----
  const falling = MeshBuilder.CreateCylinder("falling", { height: 1.0, diameterTop: 0.3, diameterBottom: 0.02, tessellation: 8 }, b.scene);
  falling.position.set(0.3, 3.0, 6);
  falling.material = rockLight;
  b.register("falling", falling);

  // ---- 照明（電球の列） ----
  b.lamp("cave", [-1.2, 3.0, 3], "#ffd8a0", 0.5, 7, true);
  b.lamp("cave", [1.2, 3.0, 9], "#ffd8a0", 0.5, 7, true);
  b.lamp("cave", [0, 3.0, 15], "#ffd8a0", 0.45, 8, true);
  const lakeLight = b.lamp("lakeglow", [0, 0.6, 18], "#40a0ff", 0.4, 7, false);
  lakeLight.light.setEnabled(false);

  b.figure(
    "guide-woman",
    [0.4, 0, 18.5],
    { skin: "#a8b4b8", cloth: "#2a3a5a", hair: "#050505", eyes: "#000000" },
    false,
  ).rotation.y = Math.PI;
  return undefined;
};
