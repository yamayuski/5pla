import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜勤の食品工場の長い通路。x=-4〜4, z=0〜30、天井 4m。南(z=0)の back-door が入口、北(z=30)の exit-door が非常口。
 * 通路の西側にベルトコンベア(z=6〜24)があり、箱(item-*)が流れる（update フック）。
 * 追跡者(chaser)は入口側から奥へ歩いてくる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#7a7e80", { specular: 0.5 });
  const wall = b.mat("#c8ccc8");
  const ceiling = b.mat("#8a8e90");
  const steel = b.mat("#a0a8ac", { specular: 0.8 });
  const belt = b.mat("#2a2c30");
  const cardboard = b.mat("#b8946a");
  const yellow = b.mat("#d8b020");
  const glass = b.mat("#b8d8e8", { alpha: 0.2, specular: 0.8 });
  const exitMat = b.mat("#2a6a3a", { emissive: "#0a3014" });

  b.room("line", [0, 0, 15], 8, 30, 4, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 8, 4, [0, 1.8, 2.4], wall);
  b.door("back-door", [-0.9, 0, 0], 1.8, 2.4, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("outside", [8, 0.2, 4], [0, -0.1, -2], floor);
  for (const [n, size, pos] of [
    ["out-w", [0.2, 4, 4], [-4, 2, -2]],
    ["out-e", [0.2, 4, 4], [4, 2, -2]],
    ["out-s", [8, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.sign(
    "rules",
    ["製造ライン", "異物混入に注意"],
    [2.6, 0.7],
    [0, 3.0, 0.12],
    0,
    {
      bg: "#e8e0c0",
      fg: "#7a1010",
      glow: 0.4,
    },
  );

  // ---- 時計（退勤） ----
  const card = b.box(
    "time-card",
    [0.5, 0.7, 0.2],
    [3.7, 1.3, 2.5],
    b.mat("#304860", { emissive: "#182838" }),
    { collide: false },
  );
  b.register("time-card", card);

  // ---- コンベア ----
  b.box("conv-frame", [1.2, 0.8, 18], [-2.4, 0.4, 15], steel);
  b.box("conv-belt", [1.0, 0.04, 18], [-2.4, 0.82, 15], belt, {
    collide: false,
  });
  const items: Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    items.push(
      b.box(`item-${i}`, [0.5, 0.35, 0.5], [-2.4, 1.02, 6 + i * 3], cardboard, {
        collide: false,
      }),
    );
  }
  // 反対側の機械
  b.box("mach-a", [1.4, 2.4, 3], [3.0, 1.2, 9], steel);
  b.box("mach-b", [1.4, 2.4, 3], [3.0, 1.2, 17], steel);
  b.box("mach-stripe", [1.42, 0.2, 18], [3.0, 1.0, 13], yellow, {
    collide: false,
  });

  // ---- 非常口 ----
  b.door("exit-door", [-0.9, 0, 30], 1.8, 2.4, 0, b.mat("#3a4a3a"), {
    locked: true,
    interactive: false,
  });
  const exitSign = b.sign(
    "exit-sign",
    ["非常口"],
    [1.0, 0.3],
    [0, 3.0, 29.85],
    0,
    {
      bg: "#0a3014",
      fg: "#70ff90",
      glow: 0.9,
    },
  );
  b.register("exit-sign", exitSign);
  b.box("exit-glow", [1.0, 0.3, 0.02], [0, 3.0, 29.9], exitMat, {
    collide: false,
  });

  // ---- 照明 ----
  b.lamp("norm", [0, 3.7, 6], "#f0f4f0", 0.55, 10, true);
  b.lamp("norm", [0, 3.7, 15], "#f0f4f0", 0.55, 10, true);
  b.lamp("norm", [0, 3.7, 24], "#f0f4f0", 0.55, 10, true);
  b.lamp("alarm", [0, 3.4, 10], "#ff2020", 0.9, 12, false).light.setEnabled(
    false,
  );
  b.lamp("alarm", [0, 3.4, 22], "#ff2020", 0.9, 12, false).light.setEnabled(
    false,
  );

  // ---- 追跡者 ----
  const chaser = b.figure(
    "chaser",
    [0, 0, 1.2],
    {
      skin: "#bcc0b8",
      hair: "#060606",
      cloth: "#e8e8e0",
      eyes: "#000000",
      height: 1.12,
      longHair: true,
    },
    false,
  );
  chaser.rotation.y = 0;
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#bcc0b8",
      hair: "#060606",
      cloth: "#e8e8e0",
      eyes: "#000000",
      height: 1.12,
      longHair: true,
    },
    false,
  );

  let running = false;
  let stopIdx = -1;
  return {
    update: (_g, dt) => {
      if (!running) {
        return;
      }
      for (const [i, it] of items.entries()) {
        if (i === stopIdx) {
          continue;
        }
        it.position.z += 0.9 * dt;
        if (it.position.z > 23.5) {
          it.position.z = 6;
        }
      }
    },
    custom: {
      beltOn: () => {
        running = true;
      },
      beltOne: () => {
        stopIdx = -2;
      },
      beltOff: () => {
        running = false;
      },
    },
  };
};
