import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 閉館後のスケート場。x=-9〜9, z=0〜26、天井 7m。手前 z=0〜6 がロビー（貸し靴の棚と鍵箱）、
 * z=6 のフェンスの奥に氷のリンク(z=6〜26)。整氷車(zamboni)は右奥、スケーター(skater)は最初は奥で回っている。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const carpet = b.mat("#2a3038");
  const wall = b.mat("#8a98a4");
  const ceiling = b.mat("#58606a");
  const ice = b.mat("#cfe8f4", { emissive: "#3a5260", specular: 0.9 });
  const board = b.mat("#e8eef2");
  const stripe = b.mat("#c82828");
  const glass = b.mat("#b8d8e8", { alpha: 0.2, specular: 0.8 });
  const metal = b.mat("#7a8088", { specular: 0.6 });
  const yellow = b.mat("#e0b020");
  const wood = b.mat("#5a4838");

  // ---- 建物 ----
  b.box("lobby-floor", [18, 0.2, 6], [0, -0.1, 3], carpet);
  b.box("ice", [18, 0.2, 20], [0, -0.1, 16], ice);
  b.box("hall-ceil", [18, 0.2, 26], [0, 7.1, 13], ceiling);
  b.box("hall-w", [0.2, 7, 26], [-9, 3.5, 13], wall);
  b.box("hall-e", [0.2, 7, 26], [9, 3.5, 13], wall);
  b.box("hall-n", [18, 7, 0.2], [0, 3.5, 26], wall);
  b.wallWithGap("front", "x", [0, 0, 0], 18, 7, [0, 1.8, 2.6], wall);
  b.door("rink-door", [-0.9, 0, 0], 1.8, 2.6, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("street", [18, 0.2, 4], [0, -0.1, -2], carpet);
  for (const [n, size, pos] of [
    ["street-w", [0.2, 4, 4], [-9, 2, -2]],
    ["street-e", [0.2, 4, 4], [9, 2, -2]],
    ["street-s", [18, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.sign(
    "ice-sign",
    ["スケートリンク", "営業時間 10:00-21:00"],
    [3, 0.9],
    [0, 4.2, 0.12],
    0,
    {
      bg: "#103050",
      fg: "#e8f4ff",
      glow: 0.6,
    },
  );

  // ---- フェンス（リンクの縁） ----
  b.box("board-front", [18, 1.1, 0.2], [0, 0.55, 6], board);
  b.box("board-stripe", [18, 0.12, 0.22], [0, 0.9, 6], stripe, {
    collide: false,
  });
  b.box("glass-front", [18, 0.9, 0.04], [0, 1.55, 6], glass, {
    collide: false,
  });
  b.box("ice-block", [18, 4, 0.2], [0, 2, 6.4], glass).isVisible = false;

  // ---- ロビー：貸し靴の棚と鍵箱 ----
  b.box("shoe-shelf", [4, 1.8, 0.5], [-5.5, 0.9, 5.4], wood);
  for (let i = 0; i < 8; i++) {
    b.box(
      `skate-${i}`,
      [0.3, 0.2, 0.2],
      [-7 + i * 0.4, 0.6 + (i % 3) * 0.5, 5.2],
      b.mat("#e8e8e8"),
      { collide: false },
    );
  }
  b.box("counter", [3, 1.0, 0.7], [5.5, 0.5, 4.5], wood);
  const key = b.box(
    "key-box",
    [0.5, 0.4, 0.1],
    [5.5, 1.4, 4.9],
    b.mat("#a82020"),
    { collide: false },
  );
  b.register("key-box", key);
  b.box("bench", [3, 0.4, 0.5], [0, 0.2, 2.2], wood);

  // ---- 整氷車 ----
  const zam = new TransformNode("zamboni", b.scene);
  zam.position.set(6, 0, 22);
  b.box("zam-body", [2.0, 1.5, 3.2], [0, 0.85, 0], yellow, {
    collide: false,
    parent: zam,
  });
  b.box("zam-cab", [1.6, 0.9, 1.2], [0, 1.95, -0.6], metal, {
    collide: false,
    parent: zam,
  });
  b.box("zam-blade", [2.4, 0.2, 0.3], [0, 0.2, -1.8], metal, {
    collide: false,
    parent: zam,
  });
  b.register("zamboni", zam);
  b.lamp("zam", [6, 1.4, 20.5], "#fff0c0", 0.9, 9, false).light.setEnabled(
    false,
  );

  // ---- 照明 ----
  b.lamp("rink", [-4, 6, 12], "#e8f4ff", 0.7, 14, true);
  b.lamp("rink", [4, 6, 12], "#e8f4ff", 0.7, 14, true);
  b.lamp("rink", [0, 6, 20], "#e8f4ff", 0.7, 14, true);
  b.lamp("rink", [0, 3, 2], "#ffe8c0", 0.4, 8, false);

  // ---- 回り続けるスケーター ----
  b.figure(
    "skater",
    [0, 0, 21],
    {
      skin: "#c8d0d4",
      hair: "#06080c",
      cloth: "#9ac0e8",
      eyes: "#000000",
      height: 1.04,
      longHair: true,
    },
    false,
  );

  let spinning = false;
  return {
    update: (g, dt) => {
      if (spinning) {
        const s = g.node("skater");
        if (s) {
          s.rotation.y += 7 * dt;
        }
      }
    },
    custom: {
      spinOn: () => {
        spinning = true;
      },
      spinOff: () => {
        spinning = false;
      },
    },
  };
};
