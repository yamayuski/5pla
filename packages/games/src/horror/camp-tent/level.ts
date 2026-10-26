import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/** 決定的な疑似乱数（毎回同じ森になる） */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** 夜のキャンプ場（焚き火・テント・森・北の小道・トイレ棟）を組み立てる */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const scene = b.scene;
  const grass = b.mat("#1b2416");
  const dirt = b.mat("#3a3228");
  const bark = b.mat("#2b2119");
  const leaves = b.mat("#122019");
  const stone = b.mat("#55524c");
  const tentMat = b.mat("#c86a2c");
  const tentIn = b.mat("#7a4a24");
  const concrete = b.mat("#9a9a92");
  const stallMat = b.mat("#6f8a8a");
  const tile = b.mat("#b8c0bc");
  const roof = b.mat("#3b3b3d");
  const shadowMat = b.mat("#000000");
  const frame = b.mat("#4a4a4c", { specular: 0.4 });

  // 地面・小道
  b.box("ground", [90, 0.2, 100], [0, -0.12, 10], grass, { collide: false });
  b.box("camp-floor", [22, 0.2, 21], [0, -0.1, 1.5], dirt);
  b.box("path", [5, 0.2, 18], [0, -0.1, 21], dirt);

  // 見えない境界
  const invisible = (
    name: string,
    size: [number, number, number],
    pos: [number, number, number],
  ) => {
    const m = b.box(name, size, pos, grass);
    m.isVisible = false;
    m.isPickable = false;
  };
  invisible("bound-w", [0.2, 3, 21], [-11, 1.5, 1.5]);
  invisible("bound-e", [0.2, 3, 21], [11, 1.5, 1.5]);
  invisible("bound-s", [22, 3, 0.2], [0, 1.5, -9]);
  invisible("bound-n-l", [8.5, 3, 0.2], [-6.75, 1.5, 12]);
  invisible("bound-n-r", [8.5, 3, 0.2], [6.75, 1.5, 12]);
  invisible("path-w", [0.2, 3, 18], [-2.5, 1.5, 21]);
  invisible("path-e", [0.2, 3, 18], [2.5, 1.5, 21]);

  // 焚き火
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.cylinder(
      `stone-${i}`,
      0.2,
      0.28,
      [Math.cos(a) * 0.7, 0.1, Math.sin(a) * 0.7],
      stone,
      { collide: false },
    );
  }
  const logs = b.box("logs", [0.7, 0.18, 0.18], [0, 0.2, 0], bark, {
    collide: false,
    rotY: 0.6,
  });
  b.box("logs2", [0.7, 0.18, 0.18], [0, 0.32, 0], bark, {
    collide: false,
    rotY: -0.7,
  });
  b.register("logs", logs);
  const flame = b.cylinder(
    "flame",
    0.5,
    0.3,
    [0, 0.6, 0],
    b.mat("#ff8a2a", { emissive: "#ff6a10" }),
    { collide: false, diameterTop: 0, tess: 8 },
  );
  flame.isPickable = false;
  const fire = b.lamp("fire", [0, 0.9, 0], "#ff8a3a", 1.0, 11, false);
  // 丸太のベンチ
  for (const [x, z, r] of [
    [-2.2, 0.5, 0],
    [2.0, -1.2, 0.4],
    [0.4, -2.4, 1.5],
  ] as const) {
    b.cylinder(`bench-${x}`, 1.4, 0.35, [x, 0.2, z], bark, {
      collide: false,
    }).rotation.z = Math.PI / 2 + r * 0;
  }

  // 自分のテント（x=-8〜-5, z=0.5〜3.5, 入口は東）
  b.room(
    "tent",
    [-6.5, 0, 2],
    3,
    3,
    1.8,
    { floor: tentIn, wall: tentMat, ceiling: tentMat },
    ["e"],
  );
  b.wallWithGap("tent-front", "z", [-5, 0, 2], 3, 1.8, [0, 1.0, 1.5], tentMat);
  b.door("flap", [-5, 0, 2.5], 1.0, 1.5, Math.PI / 2, tentMat, {
    open: true,
    interactive: false,
    openAngleDeg: -95,
  });
  b.lamp("tent-lamp", [-6.5, 1.5, 2], "#ffcf8a", 0.35, 4, false);
  b.box("sleepbag", [0.8, 0.12, 1.9], [-7.2, 0.06, 2], b.mat("#2a3f6a"), {
    collide: false,
  });
  // 他の人のテント（装飾）
  for (const [x, z] of [
    [6.5, 2],
    [5, 7.5],
    [-6, 8],
  ] as const) {
    const t = b.cylinder(`deco-tent-${x}`, 3, 2.4, [x, 0.9, z], tentMat, {
      diameterTop: 2.4,
      tess: 3,
    });
    t.rotation.x = Math.PI / 2;
    t.rotation.z = Math.PI;
    t.scaling = new Vector3(0.9, 1, 0.75);
  }

  // 森
  const trunk = b.cylinder("trunk", 6, 0.4, [0, -50, 0], bark, {
    collide: false,
    diameterTop: 0.28,
    tess: 8,
  });
  const crown = b.cylinder("crown", 5, 2.8, [0, -50, 0], leaves, {
    collide: false,
    diameterTop: 0,
    tess: 8,
  });
  const rand = rng(777);
  for (let i = 0; i < 160; i++) {
    const x = (rand() - 0.5) * 44;
    const z = -14 + rand() * 62;
    const inCamp = Math.abs(x) < 12.5 && z > -10 && z < 12.5;
    const onPath = Math.abs(x) < 3.6 && z >= 12 && z < 36;
    const inBath = Math.abs(x) < 4.5 && z > 28;
    if (inCamp || onPath || inBath) {
      continue;
    }
    const h = 0.8 + rand() * 0.6;
    const t = trunk.createInstance(`trunk-${i}`);
    t.position = new Vector3(x, 3 * h, z);
    t.scaling = new Vector3(1, h, 1);
    const c = crown.createInstance(`crown-${i}`);
    c.position = new Vector3(x, 4.5 * h + 2.5, z);
    c.scaling = new Vector3(h, h, h);
  }

  // トイレ棟（x=-3〜3, z=29.5〜35.5, 入口は南）
  b.room(
    "bath",
    [0, 0, 32.5],
    6,
    6,
    2.6,
    { floor: concrete, wall: tile, ceiling: roof },
    ["s"],
  );
  b.wallWithGap("bath-front", "x", [0, 0, 29.5], 6, 2.6, [0, 1.2, 2.1], tile);
  b.door("bath-door", [-0.6, 0, 29.5], 1.2, 2.1, 0, stallMat, {
    open: true,
    interactive: true,
  });
  b.sign("bath-sign", ["トイレ"], [1, 0.3], [0, 2.35, 29.38], Math.PI, {
    bg: "#1d4d9a",
    fg: "#fff",
    glow: 0.3,
  });
  b.lamp("bath", [0, 2.4, 32.5], "#e0f0e6", 0.8, 8);
  // 個室 3 つ（幅 1.4、奥の壁沿い）
  for (const x of [-2.1, -0.7, 0.7, 2.1]) {
    b.box(`stall-wall-${x}`, [0.06, 2, 1.0], [x, 1, 34.9], stallMat);
  }
  b.door("stall-1", [-2.0, 0, 34.4], 1.2, 1.9, 0, stallMat, {
    interactive: true,
  });
  b.door("stall-2", [-0.6, 0, 34.4], 1.2, 1.9, 0, stallMat, {
    interactive: true,
  });
  b.door("stall-3", [0.8, 0, 34.4], 1.2, 1.9, 0, stallMat, {
    locked: true,
    interactive: false,
  });
  // 洗面台と友達のランタン
  b.box("sink", [1.4, 0.8, 0.5], [-1.5, 0.4, 30.2], concrete);
  const lamp = b.box(
    "friend-lamp",
    [0.16, 0.26, 0.16],
    [-1.5, 0.93, 30.2],
    b.mat("#d8b45a", { emissive: "#6a4a10" }),
  );
  b.register("friend-lamp", lamp);

  // 戻ったとき焚き火の周りに立つ人影たち（最初は非表示）
  const shadows = new TransformNode("shadows", scene);
  const spots: [number, number][] = [
    [-2.5, 5.5],
    [2.5, 6],
    [-3.8, 2.8],
    [3.5, 1],
    [0, -3.5],
  ];
  spots.forEach(([x, z], i) => {
    const body = MeshBuilder.CreateCylinder(
      `shadow-body-${i}`,
      { height: 1.5, diameterTop: 0.3, diameterBottom: 0.5, tessellation: 10 },
      scene,
    );
    body.parent = shadows;
    body.position = new Vector3(x, 0.75, z);
    body.material = shadowMat;
    body.isPickable = false;
    const head = MeshBuilder.CreateSphere(
      `shadow-head-${i}`,
      { diameter: 0.28, segments: 8 },
      scene,
    );
    head.parent = shadows;
    head.position = new Vector3(x, 1.65, z);
    head.material = shadowMat;
    head.isPickable = false;
  });
  shadows.setEnabled(false);
  b.register("shadows", shadows);

  // テントの西の壁（内側）に映る人影（最後の合図）
  const wallShadow = new TransformNode("wall-shadow", scene);
  wallShadow.position = new Vector3(-7.95, 0, 2);
  const wsBody = MeshBuilder.CreateBox(
    "ws-body",
    { width: 0.02, height: 1.0, depth: 0.45 },
    scene,
  );
  wsBody.parent = wallShadow;
  wsBody.position = new Vector3(0, 0.6, 0);
  wsBody.material = shadowMat;
  wsBody.isPickable = false;
  const wsHead = MeshBuilder.CreateSphere(
    "ws-head",
    { diameter: 0.3, segments: 8 },
    scene,
  );
  wsHead.parent = wallShadow;
  wsHead.position = new Vector3(0, 1.3, 0);
  wsHead.scaling = new Vector3(0.1, 1, 1);
  wsHead.material = shadowMat;
  wsHead.isPickable = false;
  wallShadow.setEnabled(false);
  b.register("wall-shadow", wallShadow);

  // 管理人（ジャンプスケア用・十年前の制服）
  b.figure("ranger", [0, 0, -40], {
    skin: "#a9a79c",
    hair: "#1a1a18",
    cloth: "#3d4a32",
    eyes: "#000000",
    height: 1.1,
    longHair: false,
  });
  void frame;

  let t = 0;
  let fireLevel = 1.0;
  return {
    update: (_g, dt) => {
      t += dt;
      if (fire.light.isEnabled()) {
        fire.baseIntensity =
          fireLevel * (0.85 + 0.15 * Math.sin(t * 17) * Math.sin(t * 7.3));
        flame.scaling.y = fireLevel > 0.5 ? 0.8 + 0.2 * Math.sin(t * 15) : 0.4;
      }
    },
    custom: {
      fireUp: () => {
        fireLevel = 1.7;
      },
      fireOut: () => {
        fire.light.setEnabled(false);
        flame.setEnabled(false);
      },
    },
  };
};
