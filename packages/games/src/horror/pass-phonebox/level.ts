import "@babylonjs/core/Meshes/instancedMesh";
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

/** 霧の峠道（林道・森・止まった車・地蔵・電話ボックス・倒木）を組み立てる */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const scene = b.scene;
  const asphalt = b.mat("#2a2b2d");
  const gravel = b.mat("#3f3b35");
  const ground = b.mat("#1d2418");
  const line = b.mat("#bdbdbd");
  const bark = b.mat("#2b2119");
  const leaves = b.mat("#14231a");
  const stone = b.mat("#7d7b74");
  const bib = b.mat("#9b1c1c");
  const glass = b.mat("#a7c4b5", { alpha: 0.2, specular: 0.9 });
  const frame = b.mat("#4f7a5a", { specular: 0.4 });
  const carBody = b.mat("#5e6a73", { specular: 0.7 });

  // 道と地面
  b.box("road", [6, 0.2, 84], [0, -0.1, 32], asphalt);
  b.box("ground", [80, 0.2, 100], [0, -0.12, 32], ground, { collide: false });
  for (let z = -6; z < 72; z += 6) {
    b.box(`center-line-${z}`, [0.12, 0.01, 3], [0, 0.005, z], line, {
      collide: false,
    });
  }
  b.box("pullout", [2.6, 0.2, 6], [-4.9, -0.09, 60], gravel);
  // ガードレール（右側）
  b.box(
    "guardrail",
    [0.08, 0.3, 80],
    [3.4, 0.7, 32],
    b.mat("#c8c8c8", { specular: 0.6 }),
    { collide: false },
  );
  for (let z = -8; z < 72; z += 4) {
    b.box(`rail-post-${z}`, [0.1, 0.7, 0.1], [3.4, 0.35, z], b.mat("#8a8a8a"), {
      collide: false,
    });
  }

  // 見えない境界（道から外れないように）
  const invisible = (
    name: string,
    size: [number, number, number],
    pos: [number, number, number],
  ) => {
    const m = b.box(name, size, pos, ground);
    m.isVisible = false;
    m.isPickable = false;
  };
  invisible("bound-e", [0.2, 3, 84], [3.6, 1.5, 32]);
  invisible("bound-w1", [0.2, 3, 67], [-3.6, 1.5, 23.5]);
  invisible("bound-w2", [0.2, 3, 11], [-3.6, 1.5, 68.5]);
  invisible("bound-pull-s", [2.8, 3, 0.2], [-4.9, 1.5, 57]);
  invisible("bound-pull-n", [2.8, 3, 0.2], [-4.9, 1.5, 63]);
  invisible("bound-pull-w", [0.2, 3, 6], [-6.2, 1.5, 60]);
  invisible("bound-start", [8, 3, 0.2], [0, 1.5, -9]);
  invisible("bound-end", [8, 3, 0.2], [0, 1.5, 73]);

  // 森（インスタンスで量産）
  const trunk = b.cylinder("trunk", 6, 0.35, [0, -50, 0], bark, {
    collide: false,
    diameterTop: 0.25,
    tess: 8,
  });
  const crown = b.cylinder("crown", 5, 2.6, [0, -50, 0], leaves, {
    collide: false,
    diameterTop: 0,
    tess: 8,
  });
  const rand = rng(1234);
  for (let i = 0; i < 180; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (4.5 + rand() * 18);
    const z = -12 + rand() * 92;
    if (side < 0 && x > -7 && z > 56 && z < 64) {
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
  // 倒木
  const fallen = b.cylinder("fallen-tree", 9, 0.6, [0, 0.4, 71], bark, {
    tess: 10,
  });
  fallen.rotation.z = Math.PI / 2;
  fallen.rotation.y = 0.2;

  // 止まった車（ハザードが点滅）
  b.box("car", [1.8, 0.8, 4.2], [1.4, 0.6, 0], carBody);
  b.box(
    "car-cabin",
    [1.6, 0.6, 2.2],
    [1.4, 1.3, -0.3],
    b.mat("#1a1f24", { specular: 0.9 }),
  );
  for (const x of [0.75, 2.05]) {
    b.box(
      `car-tail-${x}`,
      [0.3, 0.12, 0.05],
      [x, 0.85, -2.12],
      b.mat("#400", { emissive: "#7a1a00" }),
      { collide: false },
    );
  }
  b.lamp("car", [1.4, 1.0, -2.6], "#ff9a2a", 0.6, 7, false);

  // 地蔵の列（グループごと動く）
  const jizo = new TransformNode("jizo", scene);
  jizo.position = new Vector3(-3.6, 0, 28);
  for (let i = 0; i < 6; i++) {
    const base = b.box(
      `jizo-base-${i}`,
      [0.45, 0.2, 0.45],
      [0, 0.1, i * 0.9],
      stone,
      { collide: false, parent: jizo },
    );
    base.isPickable = false;
    const body = b.cylinder(
      `jizo-body-${i}`,
      0.6,
      0.36,
      [0, 0.5, i * 0.9],
      stone,
      { collide: false, diameterTop: 0.26 },
    );
    body.parent = jizo;
    const head = MeshBuilder.CreateSphere(
      `jizo-head-${i}`,
      { diameter: 0.26, segments: 8 },
      scene,
    );
    head.parent = jizo;
    head.position = new Vector3(0, 0.92, i * 0.9);
    head.material = stone;
    const cloth = b.box(
      `jizo-bib-${i}`,
      [0.08, 0.22, 0.3],
      [0.17, 0.66, i * 0.9],
      bib,
      { collide: false, parent: jizo },
    );
    cloth.rotation.z = -0.25;
  }
  for (const m of jizo.getChildMeshes()) {
    m.isPickable = false;
  }
  jizo.rotation.y = 0;
  b.register("jizo", jizo);

  // 電話ボックス（x=-5.6〜-3.8, z=59〜61、扉は東側）
  b.box("booth-floor", [1.8, 0.1, 2], [-4.7, 0.05, 60], gravel);
  b.box("booth-roof", [2, 0.15, 2.2], [-4.7, 2.45, 60], frame);
  b.box("booth-w", [0.06, 2.4, 2], [-5.6, 1.2, 60], glass);
  b.box("booth-s", [1.8, 2.4, 0.06], [-4.7, 1.2, 59], glass);
  b.box("booth-n", [1.8, 2.4, 0.06], [-4.7, 1.2, 61], glass);
  for (const [x, z] of [
    [-5.6, 59],
    [-5.6, 61],
    [-3.8, 59],
    [-3.8, 61],
  ] as const) {
    b.box(`booth-post-${x}-${z}`, [0.08, 2.4, 0.08], [x, 1.2, z], frame, {
      collide: false,
    });
  }
  b.box("booth-e-s", [0.06, 2.4, 0.5], [-3.8, 1.2, 59.25], glass);
  b.box("booth-e-n", [0.06, 2.4, 0.5], [-3.8, 1.2, 60.75], glass);
  b.door("booth-door", [-3.8, 0, 59.5], 1.0, 2.2, -Math.PI / 2, glass, {
    open: true,
    openAngleDeg: -95,
    interactive: false,
  });
  b.sign("booth-sign", ["公衆電話"], [0.8, 0.22], [-4.7, 2.3, 58.96], 0, {
    bg: "#2f6f45",
    fg: "#fff",
    glow: 0.4,
  });
  b.box("phone-shelf", [0.4, 0.05, 0.6], [-5.35, 0.95, 60], frame);
  b.register(
    "phone",
    b.box(
      "phone",
      [0.25, 0.4, 0.3],
      [-5.45, 1.25, 60],
      b.mat("#2e8b57", { specular: 0.5 }),
    ),
  );
  b.lamp("booth", [-4.7, 2.3, 60], "#e8fff0", 0.6, 5);
  // 振り返り判定用（ボックスの扉側のガラス）
  const back = MeshBuilder.CreateBox("booth-back", { size: 0.3 }, scene);
  back.position = new Vector3(-3.95, 1.5, 60);
  back.isVisible = false;
  back.isPickable = false;
  b.register("booth-back", back);

  // 白髪の老婆（ジャンプスケア用）
  b.figure("hag", [0, 0, -40], {
    skin: "#b9b4aa",
    hair: "#d6d3cc",
    cloth: "#26262c",
    eyes: "#000000",
    height: 1.0,
  });

  let blink = 0;
  return {
    update: (g, dt) => {
      blink += dt;
      const lamps = g.registry.lampGroups.get("car") ?? [];
      for (const l of lamps) {
        if (l.light.isEnabled()) {
          l.baseIntensity = Math.floor(blink * 1.6) % 2 === 0 ? 0.6 : 0;
        }
      }
    },
    custom: {
      carHorn: (g) => {
        for (let i = 0; i < 3; i++) {
          g.later(i * 0.6, () =>
            g.run({
              type: "sound",
              sound: "buzz",
              at: [1.4, 1, 0],
              volume: 1.2,
            }),
          );
        }
      },
    },
  };
};
