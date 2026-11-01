import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 夜の竹林の小径（屋外）。範囲は x=-6〜6, z=0〜20、小径は x=-1〜1 で南北に通る。中ほど（z=10）に小さな広場と地蔵 jizo。
 * 竹は手続き配置。両端（z=1.2 / z=18.8）に倒れて道を塞ぐ竹 fallen-s / fallen-n（最初は非表示）。
 * 手まり temari、輪になる子ども ring（6人、ring-child-0 が正面役）、最後に背後に立つ ghost。
 * フック：ringForm（プレイヤーを中心に輪を出す）、ringStop（回転を止め ring-child-0 を正面に置く）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const ground = b.mat("#1e1e14");
  const pathMat = b.mat("#3a3424");
  const bamboo = b.mat("#4a6a38", { specular: 0.3 });
  const bambooDark = b.mat("#2a4020");
  const leaf = b.mat("#1a2a14");
  const stone = b.mat("#6a6a64");
  const dark = b.mat("#000000");

  b.box("ground", [12, 0.2, 20], [0, -0.1, 10], ground);
  b.box("path", [2, 0.02, 20], [0, 0.01, 10], pathMat, { collide: false });
  b.cylinder("clearing", 0.02, 6, [0, 0.015, 10], pathMat, { collide: false });
  for (const [n, size, pos] of [
    ["edge-w", [0.2, 5, 20], [-6, 2.5, 10]],
    ["edge-e", [0.2, 5, 20], [6, 2.5, 10]],
    ["edge-s", [12, 5, 0.2], [0, 2.5, 0]],
    ["edge-n", [12, 5, 0.2], [0, 2.5, 20]],
  ] as const) {
    b.box(n, size, pos, dark).isVisible = false;
  }

  // ---- 竹（小径と広場を避けて配置） ----
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  let k = 0;
  while (k < 90) {
    const x = -5.8 + rnd() * 11.6;
    const z = 0.3 + rnd() * 19.4;
    if (Math.abs(x) < 1.3 || Math.hypot(x, z - 10) < 3.3) {
      continue;
    }
    const h = 5 + rnd() * 3;
    const c = b.cylinder(`bamboo-${k}`, h, 0.09 + rnd() * 0.06, [x, h / 2, z], k % 3 ? bamboo : bambooDark, {
      tess: 8,
    });
    c.rotation.z = (rnd() - 0.5) * 0.08;
    k++;
  }
  // 葉の天井
  b.box("canopy", [12, 0.3, 20], [0, 6.2, 10], leaf, { collide: false });

  // ---- 地蔵 ----
  const jizo = new TransformNode("jizo-node", b.scene);
  jizo.position.set(2.2, 0, 10);
  b.box("jizo-base", [0.5, 0.25, 0.5], [0, 0.13, 0], stone, { parent: jizo });
  const body = MeshBuilder.CreateCapsule("jizo", { height: 0.7, radius: 0.18 }, b.scene);
  body.parent = jizo;
  body.position.y = 0.6;
  body.material = stone;
  b.register("jizo", body);
  b.box("jizo-bib", [0.3, 0.2, 0.05], [-0.17, 0.62, 0], b.mat("#b81818"), { parent: jizo, collide: false }).rotation.y =
    Math.PI / 2;

  // ---- 倒れる竹 ----
  for (const [n, z] of [
    ["fallen-s", 1.2],
    ["fallen-n", 18.8],
  ] as const) {
    const g = new TransformNode(n, b.scene);
    for (let i = 0; i < 3; i++) {
      const c = b.cylinder(`${n}-${i}`, 6, 0.12, [0, 0.3 + i * 0.35, z + i * 0.1], bamboo, { tess: 8 });
      c.rotation.z = Math.PI / 2 + (i - 1) * 0.15;
      c.parent = g;
    }
    b.box(`${n}-block`, [3, 3, 0.4], [0, 1.5, z], dark, { parent: g }).isVisible = false;
    g.setEnabled(false);
    b.register(n, g);
  }

  // ---- 手まり ----
  const temari = MeshBuilder.CreateSphere("temari", { diameter: 0.18 }, b.scene);
  temari.position.set(-3, 0.09, 13);
  temari.material = b.mat("#d02040", { emissive: "#300810" });
  temari.setEnabled(false);
  b.register("temari", temari);

  // ---- 子どもの輪 ----
  const ring = new TransformNode("ring", b.scene);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6;
    const kid = b.figure(
      `ring-child-${i}`,
      [Math.sin(a) * 1.8, 0, Math.cos(a) * 1.8],
      { skin: "#c8ccc8", cloth: i % 2 ? "#a03030" : "#d0c8b0", hair: "#050505", eyes: "#000000", height: 0.68, longHair: i % 2 === 0 },
      true,
    );
    kid.parent = ring;
    kid.lookAt(new Vector3(0, 0, 0));
  }
  ring.setEnabled(false);
  b.register("ring", ring);
  b.figure("ghost", [0, 0, 10], { skin: "#d0d4d0", cloth: "#a03030", hair: "#050505", eyes: "#300000", height: 0.8 }, false);

  b.lamp("moon", [0, 7, 10], "#a0b0e0", 0.35, 18, false);
  b.lamp("lantern", [2.2, 1.0, 9.6], "#ffb070", 0.35, 4, true);

  // ---- 動き ----
  let spin = 0;
  return {
    update: (_g, dt) => {
      ring.rotation.y += spin * dt;
    },
    custom: {
      ringForm: (g) => {
        ring.position.set(g.camera.position.x, 0, g.camera.position.z);
        ring.setEnabled(true);
        spin = 0.6;
        g.audio?.play("giggle", { x: ring.position.x, y: 1, z: ring.position.z + 1.8 }, 0.6);
      },
      ringStop: (g) => {
        spin = 0;
        const cam = g.camera;
        ring.position.set(cam.position.x, 0, cam.position.z);
        // 子ども0（ローカル +z 方向）をカメラの正面へ
        const f = cam.getDirection(new Vector3(0, 0, 1));
        ring.rotation.y = Math.atan2(f.x, f.z);
      },
    },
  };
};
