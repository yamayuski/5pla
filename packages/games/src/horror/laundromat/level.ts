import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/** 深夜のコインランドリー（洗濯機・乾燥機・折りたたみ台・自販機・入口の外）を組み立てる */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const scene = b.scene;
  const floor = b.mat("#8d9a96");
  const wall = b.mat("#c9d1cc");
  const ceiling = b.mat("#d8dcd8");
  const white = b.mat("#e6e9e8", { specular: 0.4 });
  const steel = b.mat("#7d8587", { specular: 0.5 });
  const glassDark = b.mat("#243038", { alpha: 0.45, specular: 0.9 });
  const doorGlass = b.mat("#9fc0c9", { alpha: 0.25, specular: 0.9 });
  const wood = b.mat("#8a6a45");
  const ground = b.mat("#1a1b1d");

  // 店内（南壁は入口の開口つき）
  b.room("shop", [0, 0, 0], 8, 12, 2.8, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, -6], 8, 2.8, [0, 1.2, 2.2], wall);
  b.door("front-door", [-0.6, 0, -6], 1.2, 2.2, 0, doorGlass, {
    open: true,
    interactive: true,
  });
  // 入口の外（ポーチと夜の街）
  b.box("porch", [8, 0.2, 3], [0, -0.1, -7.5], ground);
  b.box("street", [30, 0.2, 30], [0, -0.12, -24], ground, { collide: false });
  for (const [n, size, pos] of [
    ["bound-front", [8, 3, 0.2], [0, 1.5, -9]],
    ["bound-w", [0.2, 3, 3], [-4, 1.5, -7.5]],
    ["bound-e", [0.2, 3, 3], [4, 1.5, -7.5]],
  ] as const) {
    const m = b.box(n, [...size], [...pos], ground);
    m.isVisible = false;
    m.isPickable = false;
  }
  b.sign(
    "shop-sign",
    ["コインランドリー", "24時間営業"],
    [3.4, 1],
    [0, 2.5, -5.88],
    Math.PI,
    {
      bg: "#1f5fa8",
      fg: "#ffffff",
      glow: 0.35,
    },
  );

  // 洗濯機（西壁）と乾燥機（東壁）。front は部屋の中央向き
  const drums = new Map<string, TransformNode>();
  const machine = (kind: "washer" | "dryer", idx: number, z: number) => {
    const sx = kind === "washer" ? -1 : 1;
    const name = `${kind}-${idx}`;
    const root = new TransformNode(name, scene);
    root.position = new Vector3(sx * 3.65, 0, z);
    b.box(`${name}-body`, [0.5, 1.5, 0.7], [0, 0.75, 0], white, {
      parent: root,
    });
    const bulge = b.cylinder(`${name}-bulge`, 0.3, 0.52, [0, 0, 0], steel, {
      collide: false,
    });
    bulge.parent = root;
    bulge.position = new Vector3(-sx * 0.35, 0.8, 0);
    bulge.rotation.z = Math.PI / 2;
    const glass = b.cylinder(
      `${name}-glass`,
      0.03,
      0.44,
      [0, 0, 0],
      glassDark,
      {
        collide: false,
      },
    );
    glass.parent = root;
    glass.position = new Vector3(-sx * 0.51, 0.8, 0);
    glass.rotation.z = Math.PI / 2;
    // 中で回る洗濯物
    const drum = new TransformNode(`${name}-drum`, scene);
    drum.parent = root;
    drum.position = new Vector3(-sx * 0.4, 0.8, 0);
    const cloth = [b.mat("#b04a4a"), b.mat("#4a6ab0"), b.mat("#d9d9c8")];
    cloth.forEach((m, i) => {
      const c = b.box(
        `${name}-cloth-${i}`,
        [0.08, 0.12, 0.14],
        [0, Math.cos(i * 2.1) * 0.14, Math.sin(i * 2.1) * 0.14],
        m,
        { collide: false, parent: drum },
      );
      c.isPickable = false;
    });
    for (const m of root.getChildMeshes()) {
      m.isPickable = m.name.endsWith("-body");
    }
    b.register(name, root);
    drums.set(name, drum);
    return root;
  };
  const zs = [-3, -1.5, 0, 1.5, 3];
  zs.forEach((z, i) => {
    machine("washer", i + 1, z);
    machine("dryer", i + 1, z);
  });
  // 3 番乾燥機にだけ貼り紙
  b.sign("dryer-label", ["3"], [0.18, 0.18], [3.27, 1.3, 0], Math.PI / 2, {
    bg: "#111111",
    fg: "#ffffff",
    glow: 0.4,
  });
  // 手形と足跡（最初は非表示）
  const hand = b.box(
    "handprint",
    [0.02, 0.2, 0.16],
    [3.17, 0.82, 0.05],
    b.mat("#cfd8da", { emissive: "#445055" }),
    {
      collide: false,
    },
  );
  hand.isPickable = false;
  hand.setEnabled(false);
  b.register("handprint", hand);
  const prints = new TransformNode("footprints", scene);
  const wet = b.mat("#0b0e10", { specular: 0.9 });
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const x = -0.3 + t * 2.7 + (i % 2 === 0 ? 0.1 : -0.1);
    const z = -5 + t * 5 + (i % 2 === 0 ? 0.08 : -0.08);
    const f = b.box(`print-${i}`, [0.14, 0.01, 0.3], [x, 0.006, z], wet, {
      collide: false,
      rotY: -0.55,
      parent: prints,
    });
    f.isPickable = false;
  }
  prints.setEnabled(false);
  b.register("footprints", prints);

  // 折りたたみ台と洗濯かご
  b.box("table-top", [2.4, 0.06, 1.0], [0, 0.88, 2], wood);
  for (const [x, z] of [
    [-1.1, 1.55],
    [1.1, 1.55],
    [-1.1, 2.45],
    [1.1, 2.45],
  ] as const) {
    b.box(`table-leg-${x}-${z}`, [0.06, 0.88, 0.06], [x, 0.44, z], steel);
  }
  b.box("basket", [0.6, 0.3, 0.4], [-0.5, 1.06, 2], b.mat("#c0623a"), {
    collide: false,
  });
  // 自販機
  b.box(
    "vending",
    [1.0, 1.8, 0.6],
    [-2.4, 0.9, 5.6],
    b.mat("#c9302c", { specular: 0.4 }),
  );
  b.sign(
    "vending-label",
    ["洗剤", "100円"],
    [0.7, 0.5],
    [-2.4, 1.3, 5.29],
    Math.PI,
    {
      bg: "#f4f1e6",
      fg: "#222",
      glow: 0.5,
    },
  );
  // 壁の張り紙・時計
  b.sign(
    "rules",
    ["ご利用の流れ", "①投入 ②洗う ③乾かす", "忘れ物にご注意"],
    [1.4, 0.9],
    [1.5, 1.7, 5.88],
    Math.PI,
    {
      bg: "#f2efe0",
      fg: "#222",
      glow: 0.15,
    },
  );
  b.sign("clock", ["1:07"], [0.7, 0.3], [-0.5, 2.3, 5.88], Math.PI, {
    bg: "#111",
    fg: "#e33",
    glow: 0.6,
  });
  b.sign("broken", ["故障中"], [0.5, 0.25], [3.17, 1.45, -0.0], Math.PI / 2, {
    bg: "#f5e04a",
    fg: "#a00",
    glow: 0.2,
  }).setEnabled(false);

  // 照明
  b.lamp("tube-a", [0, 2.7, -3.2], "#e7f4e4", 0.85, 10);
  b.lamp("tube-b", [0, 2.7, 0.8], "#e7f4e4", 0.85, 10);
  b.lamp("tube-c", [0, 2.7, 4.4], "#e7f4e4", 0.8, 10);
  const glow = b.lamp("dryer-glow", [2.7, 0.9, 0], "#ffb36b", 1.4, 5, false);
  glow.light.setEnabled(false);
  b.lamp("street", [0, 3.4, -8], "#ffcf8a", 0.5, 9, false);

  // 3 番乾燥機から出てくる濡れ髪の女
  b.figure("drowned", [0, 0, -40], {
    skin: "#9fb0b5",
    hair: "#08090a",
    cloth: "#dfe3e0",
    eyes: "#000000",
    height: 1.02,
  });

  const spin = new Map<string, number>();
  const setSpin = (name: string, v: number) => spin.set(name, v);
  return {
    update: (_g, dt) => {
      for (const [name, v] of spin) {
        const d = drums.get(name);
        if (d) {
          d.rotation.x += v * dt;
        }
      }
    },
    custom: {
      washer1On: () => setSpin("washer-1", 5),
      allWashersOn: () => {
        for (let i = 1; i <= 5; i++) {
          setSpin(`washer-${i}`, 7 + i);
        }
      },
      allWashersOff: () => {
        for (let i = 1; i <= 5; i++) {
          spin.delete(`washer-${i}`);
        }
      },
      dryer3On: () => setSpin("dryer-3", 9),
      dryer3Stop: () => spin.delete("dryer-3"),
      dryer3Burst: (g) => {
        g.run({
          type: "sound",
          sound: "slam",
          at: { node: "dryer-3" },
          volume: 1.2,
        });
        g.run({ type: "visible", target: "handprint", visible: false });
      },
    },
  };
};
