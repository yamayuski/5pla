import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

interface Fish {
  mesh: Mesh;
  side: number;
  z0: number;
  y: number;
  speed: number;
  phase: number;
}

/**
 * 閉館後の水族館。南のシアター前から大水槽ホール（z=-10〜10）を抜け、
 * 北の水槽トンネル（z=10〜22）の先が出口。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#1d2630");
  const wall = b.mat("#27323d");
  const ceiling = b.mat("#141b22");
  const doorMat = b.mat("#3b4652", { specular: 0.3 });
  const water = b.mat("#0e3a66", { emissive: "#0b2f57", alpha: 0.85 });
  const deepWater = b.mat("#0a2c50", { emissive: "#061c36", alpha: 0.35 });
  const tunnelWater = b.mat("#1050a0", { emissive: "#0c3a78", alpha: 0.9 });
  const glass = b.mat("#9fd0ff", { alpha: 0.12, specular: 0.9 });
  const rock = b.mat("#2b3540");
  const mats = { floor, wall, ceiling };

  // ---- 大水槽ホール ----
  b.box("hall-floor", [4.2, 0.2, 21], [0, -0.1, 0], floor);
  b.box("hall-ceil", [4.2, 0.2, 21], [0, 3.2, 0], ceiling);
  b.box("hall-west", [0.2, 3.2, 20.4], [-2.1, 1.6, 0], wall);
  b.box("hall-east", [0.2, 3.2, 20.4], [2.1, 1.6, 0], wall);
  // 壁にはめ込んだ水槽（光る水面パネル）
  for (const [side, z] of [
    [-1, -5],
    [-1, 2],
    [1, -3],
    [1, 4],
  ] as const) {
    b.box(`tank-${side}-${z}`, [0.06, 1.7, 5], [side * 1.98, 1.5, z], water, {
      collide: false,
    });
    b.box(
      `tank-sill-${side}-${z}`,
      [0.3, 0.6, 5.2],
      [side * 1.9, 0.3, z],
      rock,
    );
  }
  // 魚（パネルの手前を泳ぐ小さな影）
  const fishMat = b.mat("#e08a3a", { emissive: "#5a3010" });
  const fishMat2 = b.mat("#c8d8e8", { emissive: "#405060" });
  const fish: Fish[] = [];
  let n = 0;
  for (const [side, z] of [
    [-1, -5],
    [-1, 2],
    [1, -3],
    [1, 4],
  ] as const) {
    for (let i = 0; i < 4; i++) {
      const mesh = b.box(
        `fish-${n}`,
        [0.02, 0.12, 0.3],
        [side * 1.94, 1.0 + ((i * 0.37) % 1.2), z],
        i % 2 === 0 ? fishMat : fishMat2,
        { collide: false },
      );
      fish.push({
        mesh,
        side,
        z0: z,
        y: mesh.position.y,
        speed: 0.4 + i * 0.13,
        phase: n * 1.7,
      });
      n++;
    }
  }
  // 内側から叩いた手形（西の水槽 z=-2 付近、最初は非表示）
  const hand = new TransformNode("handprint", b.scene);
  hand.position.set(-1.93, 1.45, -2);
  const handMat = b.mat("#c9d6d6", { emissive: "#4a5858", alpha: 0.75 });
  b.box("hand-palm", [0.01, 0.16, 0.14], [0, 0, 0], handMat, {
    collide: false,
  }).parent = hand;
  for (let f = 0; f < 4; f++) {
    b.box(
      `hand-finger-${f}`,
      [0.01, 0.12, 0.03],
      [0, 0.14, -0.05 + f * 0.035],
      handMat,
      {
        collide: false,
      },
    ).parent = hand;
  }
  b.box("hand-thumb", [0.01, 0.03, 0.1], [0, -0.02, 0.1], handMat, {
    collide: false,
  }).parent = hand;
  hand.setEnabled(false);
  b.register("handprint", hand);

  // 南: シアター（閉じた扉）
  b.wallWithGap(
    "theater-wall",
    "x",
    [0, 0, -10.2],
    4.4,
    3.2,
    [0, 1.4, 2.3],
    wall,
  );
  b.door("theater-door", [-0.7, 0, -10.2], 1.4, 2.3, 0, doorMat, {
    locked: true,
    interactive: false,
  });
  b.sign("theater-sign", ["シアター"], [1.2, 0.3], [0, 2.75, -10.08], 0, {
    bg: "#101820",
    fg: "#9cc8ff",
    glow: 0.4,
  });
  b.sign(
    "info",
    ["本日の営業は終了しました", "またのご来館をお待ちしております"],
    [1.6, 0.5],
    [1.98, 2.6, -8],
    -Math.PI / 2,
    { bg: "#0d1622", fg: "#d8e6f4", glow: 0.3 },
  );
  // ベンチ
  b.box("bench", [0.6, 0.45, 2.4], [0.9, 0.23, -1], b.mat("#3a2e24"));

  // ---- 水槽トンネル（x=-1.5〜1.5, z=10〜22） ----
  b.box("tun-floor", [3.2, 0.2, 12.4], [0, -0.1, 16], floor);
  b.box("tun-gate-wl", [0.6, 3.2, 0.2], [-1.85, 1.6, 10], wall);
  b.box("tun-gate-el", [0.6, 3.2, 0.2], [1.85, 1.6, 10], wall);
  b.box("tun-lintel", [4.2, 0.6, 0.2], [0, 2.9, 10], wall);
  // 東側と天井は光る水
  b.box("tun-east", [0.1, 2.8, 12], [1.6, 1.4, 16], tunnelWater);
  b.box("tun-ceil", [3.2, 0.1, 12], [0, 2.8, 16], tunnelWater, {
    collide: false,
  });
  // 西側はガラス越しの大水槽（奥行き 4m）
  b.box("tun-glass", [0.04, 2.8, 12], [-1.6, 1.4, 16], glass);
  b.box("big-tank-water", [3.8, 2.8, 12], [-3.6, 1.4, 16], deepWater, {
    collide: false,
  });
  b.box("big-tank-back", [0.2, 3.2, 12.4], [-5.6, 1.6, 16], b.mat("#08182a"));
  b.box("big-tank-floor", [4, 0.4, 12], [-3.6, -0.2, 16], rock);
  for (let i = 0; i < 5; i++) {
    b.box(
      `big-rock-${i}`,
      [0.8 + (i % 2) * 0.5, 0.5 + (i % 3) * 0.3, 0.9],
      [-3.4 - (i % 2), 0.3, 11.5 + i * 2.3],
      rock,
      { collide: false, rotY: i * 0.6 },
    );
  }

  // ---- 出口（z=22） ----
  b.wallWithGap("exit-wall", "x", [0, 0, 22], 3.4, 3.2, [0, 1.4, 2.3], wall);
  b.door("exit-door", [-0.7, 0, 22], 1.4, 2.3, 0, doorMat, {
    open: true,
    interactive: false,
  });
  b.room("exit-hall", [0, 0, 24], 3.2, 4, 3.2, mats, ["s"]);
  b.sign("exit-sign", ["出口  EXIT"], [1.2, 0.32], [0, 2.75, 21.88], 0, {
    bg: "#1c7a3a",
    fg: "#fff",
    glow: 0.7,
  });

  // ---- 照明（ホール 2・水槽 1・トンネル 1・出口 1） ----
  b.lamp("hall", [0, 3.0, -5], "#9ec4ff", 0.35, 10);
  b.lamp("hall", [0, 3.0, 5], "#9ec4ff", 0.3, 10);
  b.lamp("tank-a", [0, 1.8, 0], "#2a7fff", 0.5, 7, false);
  b.lamp("tunnel", [0, 2.5, 16], "#3a8cff", 0.55, 9, false);
  b.lamp("exit", [0, 2.6, 23.5], "#5aff8a", 0.6, 7);

  // ---- 大水槽の女（トンネル側 +x を向いて浮かぶ） ----
  const woman = b.figure(
    "tank-woman",
    [-3.4, 0.25, 16.5],
    {
      skin: "#a9b8bc",
      hair: "#020406",
      cloth: "#c8d0d0",
      eyes: "#000000",
      height: 1.0,
    },
    false,
  );
  woman.rotation.y = Math.PI / 2;
  // ジャンプスケア用（同じ女）
  b.figure(
    "drowned",
    [0, 0, 30],
    {
      skin: "#a9b8bc",
      hair: "#020406",
      cloth: "#c8d0d0",
      eyes: "#000000",
      height: 1.05,
    },
    false,
  );

  let fishAlive = true;
  let drift = -1;
  let t = 0;
  return {
    update: (_g, dt) => {
      t += dt;
      if (fishAlive) {
        for (const f of fish) {
          const s = Math.sin(t * f.speed + f.phase);
          f.mesh.position.z = f.z0 + s * 2.2;
          f.mesh.position.y = f.y + Math.sin(t * 0.7 + f.phase) * 0.08;
          f.mesh.rotation.y = Math.cos(t * f.speed + f.phase) > 0 ? 0 : Math.PI;
        }
      }
      // 女はゆらゆら揺れ、spot 後はガラスへにじり寄る
      woman.position.y = 0.25 + Math.sin(t * 0.9) * 0.06;
      if (drift >= 0 && drift < 1) {
        drift = Math.min(1, drift + dt / 8);
        woman.position.x = -3.4 + 1.5 * drift;
      }
    },
    custom: {
      fishVanish: () => {
        fishAlive = false;
        for (const f of fish) {
          f.mesh.setEnabled(false);
        }
      },
      tanksDark: () => {
        water.emissiveColor = new Color3(0.01, 0.04, 0.08);
        water.diffuseColor = new Color3(0.02, 0.06, 0.1);
      },
      womanDrift: () => {
        drift = 0;
      },
    },
  };
};
