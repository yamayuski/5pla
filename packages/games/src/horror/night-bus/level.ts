import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜行バスの車内。x=-1.5〜1.5, z=0〜15、天井高 2.3m。通路 x=-0.6〜0.6、座席は左右 x=±1.0 の5列。
 * 乗客の頭は暗い円柱。faces-l / faces-r は、頭の後ろ側（通路の後方 -z 向き）に付く白い顔。
 * 運転手 driver は z≈13.6 の運転席に座り、前を向いている。
 */
const ROWS = [3, 5, 7, 9, 11];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#2a2a30");
  const wall = b.mat("#4a4e58");
  const ceiling = b.mat("#6a6e78");
  const seat = b.mat("#2a3a5a");
  const body = b.mat("#1a1a20");
  const head = b.mat("#0a0a0c");
  const faceMat = b.mat("#e8e8e0", { emissive: "#6a6a64" });
  const black = b.mat("#000000");
  const glass = b.mat("#05081a", { emissive: "#060a1c" });
  const metal = b.mat("#8a8e98", { specular: 0.6 });

  // ---- 車体 ----
  b.room("bus", [0, 0, 7.5], 3, 15, 2.3, { floor, wall, ceiling }, []);
  // 窓（側面）
  for (const side of [-1, 1]) {
    for (let z = 2; z <= 13; z += 2.2) {
      b.box(
        `win-${side}-${z}`,
        [0.04, 0.7, 1.3],
        [side * 1.46, 1.5, z],
        glass,
        {
          collide: false,
        },
      );
    }
  }
  // フロントガラス
  b.box("windshield", [2.6, 1.0, 0.04], [0, 1.5, 14.88], glass, {
    collide: false,
  });
  b.box("dash", [3, 0.8, 0.5], [0, 0.4, 14.6], b.mat("#18181c"));
  b.sign(
    "route",
    ["東京行き", "高速 夜行便"],
    [0.9, 0.3],
    [0, 2.0, 14.85],
    Math.PI,
    {
      bg: "#101010",
      fg: "#ff9020",
      glow: 0.6,
    },
  );
  b.sign("clock", ["--:--"], [0.4, 0.16], [1.2, 1.35, 14.85], Math.PI, {
    bg: "#101010",
    fg: "#ff3020",
    glow: 0.7,
  });
  // 乗降口（中ほどの右側にある扉）
  b.door("bus-door", [1.46, 0, 4.4], 1.0, 2.0, Math.PI / 2, metal, {
    open: true,
    interactive: false,
  });

  // ---- 座席・乗客 ----
  const facesL = new TransformNode("faces-l", b.scene);
  const facesR = new TransformNode("faces-r", b.scene);
  for (const side of [-1, 1]) {
    const x = side * 1.0;
    for (const z of ROWS) {
      b.box(`cushion-${side}-${z}`, [0.8, 0.14, 0.6], [x, 0.45, z], seat);
      b.box(`back-${side}-${z}`, [0.8, 0.9, 0.14], [x, 0.9, z + 0.3], seat);
      b.box(`pax-${side}-${z}`, [0.5, 0.6, 0.28], [x, 0.85, z + 0.12], body, {
        collide: false,
      });
      b.cylinder(`head-${side}-${z}`, 0.26, 0.26, [x, 1.38, z + 0.12], head, {
        collide: false,
        tess: 12,
      });
      // 後ろ向きの顔
      const parent = side < 0 ? facesL : facesR;
      const fz = z + 0.12 - 0.135;
      b.box(`face-${side}-${z}`, [0.2, 0.22, 0.02], [x, 1.38, fz], faceMat, {
        collide: false,
        parent,
      });
      for (const ex of [-0.045, 0.045]) {
        b.box(
          `eye-${side}-${z}-${ex}`,
          [0.04, 0.06, 0.02],
          [x + ex, 1.42, fz - 0.012],
          black,
          {
            collide: false,
            parent,
          },
        );
      }
      b.box(
        `mouth-${side}-${z}`,
        [0.09, 0.04, 0.02],
        [x, 1.3, fz - 0.012],
        black,
        {
          collide: false,
          parent,
        },
      );
    }
  }
  facesL.setEnabled(false);
  facesR.setEnabled(false);
  b.register("faces-l", facesL);
  b.register("faces-r", facesR);

  // 運転席
  b.box("driver-seat", [0.7, 0.14, 0.6], [-0.9, 0.45, 13.4], seat);
  b.box("driver-back", [0.7, 0.9, 0.14], [-0.9, 0.9, 13.1], seat);
  b.cylinder("wheel", 0.04, 0.5, [-0.9, 0.95, 14.1], black, { collide: false });
  b.figure(
    "driver",
    [-0.9, 0.2, 13.5],
    {
      skin: "#c8c4b8",
      hair: "#101010",
      cloth: "#2a3a4a",
      eyes: "#000000",
      height: 0.8,
      longHair: false,
    },
    true,
  );

  // ---- 照明 ----
  b.lamp("bus-a", [0, 2.1, 3], "#a8c8ff", 0.4, 6, true);
  b.lamp("bus-b", [0, 2.1, 8], "#a8c8ff", 0.4, 6, true);
  b.lamp("bus-c", [0, 2.1, 12.5], "#a8c8ff", 0.35, 6, true);
  const out = b.lamp("outside", [-2.6, 2, 8], "#ff9a40", 1.0, 8, false);
  out.light.setEnabled(false);

  return {};
};
