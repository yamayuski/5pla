import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { RenderTargetTexture } from "@babylonjs/core/Materials/Textures/renderTargetTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/** 防犯カメラにだけ映るメッシュのレイヤー（プレイヤーのカメラには映らない） */
const CCTV_ONLY = 0x10000000;

const ITEM_COLORS = [
  "#c0392b",
  "#2e86c1",
  "#f1c40f",
  "#27ae60",
  "#e67e22",
  "#ecf0f1",
  "#8e44ad",
];

/** 深夜のコンビニ（店内・レジ・バックヤード扉・駐車場）と防犯カメラを組み立てる */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const scene = b.scene;
  const floor = b.mat("#d9dad5", { specular: 0.3 });
  const wall = b.mat("#eeeeea");
  const ceiling = b.mat("#f2f2f0");
  const glass = b.mat("#9fb6c4", { alpha: 0.18, specular: 0.8 });
  const frame = b.mat("#6d7275", { specular: 0.4 });
  const shelf = b.mat("#bfc3c6", { specular: 0.3 });
  const counterMat = b.mat("#3d5a80");
  const asphalt = b.mat("#1d1e20");
  const cardboard = b.mat("#a07a4a");
  const dark = b.mat("#222428");

  // 店舗の箱（手前 z=-4 はガラス張りで別に作る）
  b.room("store", [0, 0, 0], 12, 8, 3, { floor, wall, ceiling }, ["s"]);
  b.box("front-left", [7.5, 3, 0.08], [-2.25, 1.5, -4], glass);
  b.box("front-right", [1.5, 3, 0.08], [5.25, 1.5, -4], glass);
  b.box("front-top", [3, 0.6, 0.2], [3, 2.7, -4], frame);
  b.box("front-sill", [12, 0.3, 0.2], [0, 0.15, -4.05], frame, {
    collide: false,
  });
  // 自動ドア（左右 2 枚がスライドする）
  const doorL = b.box("autodoor-l", [1.5, 2.4, 0.06], [2.25, 1.2, -4], glass);
  const doorR = b.box("autodoor-r", [1.5, 2.4, 0.06], [3.75, 1.2, -4], glass);
  b.register("autodoor-l", doorL);
  b.register("autodoor-r", doorR);
  b.sign("door-label", ["自動ドア"], [0.6, 0.15], [3, 1.4, -4.05], 0, {
    bg: "#c0392b",
    fg: "#fff",
    glow: 0.2,
  });

  // 駐車場
  b.box("parking", [40, 0.2, 20], [0, -0.1, -14], asphalt);
  for (let x = -10; x <= 10; x += 3) {
    b.box(`park-line-${x}`, [0.12, 0.01, 4], [x, 0.01, -8], b.mat("#ddd"), {
      collide: false,
    });
  }
  b.box("lot-fence", [40, 1.2, 0.2], [0, 0.6, -24], dark);
  b.sign("store-sign", ["ヨミマート 24h"], [5, 0.7], [0, 3.4, -4.15], 0, {
    bg: "#f4f4f4",
    fg: "#1b6f3a",
    glow: 0.6,
  });

  // レジカウンター（左壁沿い）。店員は x≈-5 に立つ
  b.box("counter", [0.7, 1.0, 4.5], [-4, 0.5, -1.55], counterMat);
  b.box("counter-top", [0.8, 0.05, 4.6], [-4, 1.02, -1.55], b.mat("#e7e2d8"));
  b.box("register", [0.4, 0.25, 0.45], [-4.05, 1.17, -0.4], dark, {
    collide: false,
  });
  b.box("cig-shelf", [0.35, 1.6, 4.0], [-5.8, 1.6, -1.5], b.mat("#5b4a3a"));
  for (let z = -3.2; z <= 0.2; z += 0.4) {
    for (const y of [1.1, 1.5, 1.9]) {
      b.box(
        `cig-${z}-${y}`,
        [0.08, 0.18, 0.32],
        [-5.6, y, z],
        b.mat(
          ITEM_COLORS[
            Math.abs(Math.round(z * 10 + y * 10)) % ITEM_COLORS.length
          ] ?? "#ccc",
        ),
        { collide: false },
      );
    }
  }
  // 防犯モニター（RenderTargetTexture で防犯カメラ映像を映す）
  const monitorStand = b.box(
    "monitor-stand",
    [0.3, 0.3, 0.5],
    [-3.95, 1.2, -2.6],
    dark,
    { collide: false },
  );
  monitorStand.isPickable = false;
  const monitor = MeshBuilder.CreatePlane(
    "monitor",
    { width: 0.62, height: 0.44 },
    scene,
  );
  monitor.position = new Vector3(-4.12, 1.42, -2.6);
  monitor.rotation.y = Math.PI / 2;
  b.register("monitor", monitor);
  const monitorFrame = b.box(
    "monitor-frame",
    [0.08, 0.5, 0.7],
    [-4.07, 1.42, -2.6],
    dark,
    { collide: false },
  );
  monitorFrame.isPickable = false;

  // ゴンドラ（陳列棚）と商品
  for (const x of [-1.2, 1.3, 3.8]) {
    b.box(`gondola-${x}`, [0.5, 1.5, 4.2], [x, 0.75, 0.3], shelf);
    for (const side of [-1, 1]) {
      for (const y of [0.35, 0.8, 1.25]) {
        for (let z = -1.6; z <= 2.2; z += 0.38) {
          const c =
            ITEM_COLORS[
              Math.floor(Math.abs(x * 7 + y * 13 + z * 5)) % ITEM_COLORS.length
            ] ?? "#ccc";
          const item = b.box(
            `item-${x}-${side}-${y}-${z}`,
            [0.16, 0.24, 0.26],
            [x + side * 0.33, y + 0.12, z],
            b.mat(c),
            { collide: false },
          );
          item.isPickable = false;
        }
      }
    }
  }
  // 倒れてくる商品（shelfFall で落とす）
  const falling = new TransformNode("falling-items", scene);
  for (let i = 0; i < 6; i++) {
    const it = b.box(
      `fall-${i}`,
      [0.16, 0.24, 0.26],
      [0, 0, i * 0.3],
      b.mat(ITEM_COLORS[i] ?? "#ccc"),
      { collide: false, parent: falling },
    );
    it.isPickable = false;
  }
  falling.position = new Vector3(-1.53, 1.37, 0.6);
  b.register("falling-items", falling);

  // 奥の冷蔵ケース（照明だけは最後まで点いている）
  for (let x = 0.5; x <= 5.5; x += 1.25) {
    b.box(
      `fridge-${x}`,
      [1.2, 2.2, 0.6],
      [x, 1.1, 3.65],
      b.mat("#d5e8f0", { emissive: "#3a4a55", alpha: 0.85 }),
    );
  }
  // バックヤードの扉と段ボール
  b.register(
    "backdoor",
    b.box(
      "backdoor",
      [1.0, 2.1, 0.08],
      [-3.5, 1.05, 3.86],
      b.mat("#8a8f93", { specular: 0.3 }),
    ),
  );
  b.sign(
    "backdoor-label",
    ["STAFF ONLY"],
    [0.7, 0.18],
    [-3.5, 1.9, 3.88],
    Math.PI,
    {
      bg: "#333",
      fg: "#eee",
      glow: 0.2,
    },
  );
  b.register(
    "box",
    b.box("box", [0.6, 0.45, 0.45], [-2.3, 0.23, 3.3], cardboard),
  );

  // 照明（store は停電で消える／fridge は残る）
  b.lamp("store", [-2.5, 2.9, -1.5], "#ffffff", 0.75, 9);
  b.lamp("store", [2.5, 2.9, -1.5], "#ffffff", 0.75, 9);
  b.lamp("store", [-2.5, 2.9, 2], "#ffffff", 0.75, 9);
  b.lamp("store", [2.5, 2.9, 2], "#ffffff", 0.75, 9);
  b.lamp("fridge", [3, 2.2, 3.1], "#bfe3ff", 0.45, 5, false);

  // 女（ジャンプスケア用・プレイヤーの目に映る）
  b.figure("woman", [0, 0, -30], { cloth: "#b9b3a8" });
  // 防犯カメラにだけ映る女とプレイヤーの代役
  const ghost = b.figure("cctv-woman", [0, 0, -30], { cloth: "#b9b3a8" }, true);
  const proxy = new TransformNode("player-proxy", scene);
  const proxyMat = b.mat("#2c3e50");
  const pBody = MeshBuilder.CreateCylinder(
    "proxy-body",
    { height: 1.5, diameter: 0.45 },
    scene,
  );
  pBody.parent = proxy;
  pBody.position.y = 0.75;
  pBody.material = proxyMat;
  const pHead = MeshBuilder.CreateSphere(
    "proxy-head",
    { diameter: 0.24 },
    scene,
  );
  pHead.parent = proxy;
  pHead.position.y = 1.62;
  pHead.material = b.mat("#c9a68a");
  for (const m of [...ghost.getChildMeshes(), pBody, pHead]) {
    m.layerMask = CCTV_ONLY;
    m.isPickable = false;
  }

  // 防犯カメラ
  const cctvBody = b.box(
    "cctv-body",
    [0.25, 0.18, 0.4],
    [5.6, 2.8, -3.6],
    dark,
    { collide: false },
  );
  cctvBody.isPickable = false;
  const cctv = new FreeCamera("cctv", new Vector3(5.5, 2.75, -3.5), scene);
  cctv.setTarget(new Vector3(-4.2, 0.6, -0.8));
  cctv.fov = 1.25;
  cctv.layerMask = 0x0fffffff | CCTV_ONLY;
  const rtt = new RenderTargetTexture(
    "cctv-rtt",
    { width: 320, height: 224 },
    scene,
  );
  rtt.activeCamera = cctv;
  rtt.refreshRate = 2;
  rtt.renderList = scene.meshes.filter((m) => m !== monitor);
  scene.customRenderTargets.push(rtt);
  const monitorMat = new StandardMaterial("monitor-mat", scene);
  monitorMat.diffuseColor = Color3.Black();
  monitorMat.specularColor = Color3.Black();
  monitorMat.emissiveTexture = rtt;
  monitorMat.emissiveColor = new Color3(0.75, 0.95, 0.8);
  monitorMat.disableLighting = true;
  monitor.material = monitorMat;

  // 振り返り判定用マーカー（ghostBehind でプレイヤーの背後に置く）
  const mark = MeshBuilder.CreateBox("behind-mark", { size: 0.3 }, scene);
  mark.isVisible = false;
  mark.isPickable = false;
  mark.position = new Vector3(0, -10, 0);
  b.register("behind-mark", mark);

  const placeGhost = (x: number, z: number, faceX: number, faceZ: number) => {
    ghost.position = new Vector3(x, 0, z);
    ghost.lookAt(new Vector3(faceX, 0, faceZ));
  };

  return {
    update: (g) => {
      const p = g.camera.position;
      proxy.position.set(p.x, 0, p.z);
      proxy.rotation.y = g.camera.rotation.y;
    },
    custom: {
      autoDoorBlink: (g) => {
        g.run({
          type: "move",
          target: "autodoor-l",
          to: [1.0, 1.2, -4],
          duration: 0.8,
        });
        g.run({
          type: "move",
          target: "autodoor-r",
          to: [5.0, 1.2, -4],
          duration: 0.8,
        });
        g.later(2.5, () => {
          g.run({
            type: "move",
            target: "autodoor-l",
            to: [2.25, 1.2, -4],
            duration: 0.8,
          });
          g.run({
            type: "move",
            target: "autodoor-r",
            to: [3.75, 1.2, -4],
            duration: 0.8,
          });
        });
      },
      autoDoorLock: (g) => {
        g.run({
          type: "move",
          target: "autodoor-l",
          to: [2.25, 1.2, -4],
          duration: 0.15,
        });
        g.run({
          type: "move",
          target: "autodoor-r",
          to: [3.75, 1.2, -4],
          duration: 0.15,
        });
      },
      ghostOutside: (g) => {
        const p = g.camera.position;
        placeGhost(1.0, -6.5, p.x, p.z);
        rtt.refreshRate = 1;
      },
      ghostHide: () => {
        ghost.position = new Vector3(0, 0, -30);
        rtt.refreshRate = 2;
      },
      ghostAisle: (g) => {
        const p = g.camera.position;
        placeGhost(-2.4, -3.2, p.x, p.z);
      },
      ghostBehind: (g) => {
        const p = g.camera.position;
        const f = g.forward();
        const bx = Math.min(5.7, Math.max(-5.5, p.x - f.x * 0.55));
        const bz = Math.min(3.6, Math.max(-3.7, p.z - f.z * 0.55));
        placeGhost(bx, bz, p.x, p.z);
        mark.position = new Vector3(
          Math.min(5.7, Math.max(-5.5, p.x - f.x * 0.9)),
          1.5,
          Math.min(3.6, Math.max(-3.7, p.z - f.z * 0.9)),
        );
        rtt.refreshRate = 1;
      },
      shelfFall: (g) => {
        const node = g.node("falling-items");
        if (node) {
          g.run({
            type: "move",
            target: "falling-items",
            to: [-2.2, 0.12, 0.8],
            duration: 0.35,
          });
          node.rotation.z = 1.2;
        }
      },
    },
  };
};
