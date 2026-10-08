import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 霧の岬の旧灯台。細い岬の道 x=-3.5〜3.5, z=0〜24、突き当たり(z=24〜30)が灯台の根元の部屋。
 * 入口の鉄門 path-gate(z=1.5)、西側の番小屋(cottage、窓 win-lit/win-person/win-dark)、
 * 灯台の根元の部屋 tower-base（床のスイッチ代わりに zone で判定）。頂上の光(beam)は update フックで回転。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const grass = b.mat("#2a3428");
  const stone = b.mat("#a0a49c");
  const white = b.mat("#d8d8d0");
  const roof = b.mat("#3a2a24");
  const iron = b.mat("#2a2c30", { specular: 0.4 });
  const sea = b.mat("#0a1620", { emissive: "#050c14" });

  // ---- 岬の道 ----
  b.box("path", [7, 0.2, 26], [0, -0.1, 11], grass);
  b.box("sea", [200, 0.2, 200], [0, -9, 40], sea, { collide: false });
  b.box("rail-w", [0.1, 0.9, 24], [-3.5, 0.45, 12], iron);
  b.box("rail-e", [0.1, 0.9, 24], [3.5, 0.45, 12], iron);
  b.box("cliff-block-w", [0.2, 4, 26], [-3.7, 2, 11], iron).isVisible = false;
  b.box("cliff-block-e", [0.2, 4, 26], [3.7, 2, 11], iron).isVisible = false;
  b.box("back-block", [7, 4, 0.2], [0, 2, -2], iron).isVisible = false;
  b.door("path-gate", [-1.5, 0, 1.5], 3, 1.8, 0, iron, {
    open: true,
    interactive: false,
  });
  b.box("gate-post-w", [0.3, 1.8, 0.3], [-1.7, 0.9, 1.5], stone);
  b.box("gate-post-e", [0.3, 1.8, 0.3], [1.7, 0.9, 1.5], stone);
  b.sign("warn", ["立入禁止", "旧 岬灯台"], [1.2, 0.6], [-1.7, 1.5, 1.3], 0, {
    bg: "#e8e0c0",
    fg: "#6a1010",
    glow: 0.3,
  });

  // ---- 番小屋 ----
  b.box("cottage", [3, 3, 4], [-5.2, 1.5, 12], white, { collide: false });
  b.box("cottage-roof", [3.4, 0.4, 4.4], [-5.2, 3.2, 12], roof, {
    collide: false,
  });
  b.box("cottage-block", [1, 3, 4.2], [-3.9, 1.5, 12], iron).isVisible = false;
  b.sign("win-lit", ["　"], [1.0, 0.8], [-3.68, 1.7, 12], -Math.PI / 2, {
    bg: "#f0c060",
    fg: "#000",
    glow: 0.9,
  });
  const winPerson = b.sign(
    "win-person",
    ["▂▇▂", "▐█▌"],
    [1.0, 0.8],
    [-3.67, 1.7, 12],
    -Math.PI / 2,
    {
      bg: "#f0c060",
      fg: "#0a0604",
      glow: 0.9,
    },
  );
  winPerson.isVisible = false;
  const winDark = b.sign(
    "win-dark",
    ["　"],
    [1.0, 0.8],
    [-3.66, 1.7, 12],
    -Math.PI / 2,
    {
      bg: "#060606",
      fg: "#000",
      glow: 0.05,
    },
  );
  winDark.isVisible = false;
  b.lamp("cottage", [-3.2, 1.8, 12], "#f0c060", 0.7, 6, false);

  // ---- 灯台の根元の部屋と塔 ----
  b.room(
    "base",
    [0, 0, 27],
    6,
    6,
    4,
    { floor: stone, wall: white, ceiling: stone },
    ["s"],
  );
  b.box("base-gap-l", [2.2, 4, 0.2], [-1.9, 2, 24], white);
  b.box("base-gap-r", [2.2, 4, 0.2], [1.9, 2, 24], white);
  b.box("base-gap-top", [1.6, 1.8, 0.2], [0, 3.1, 24], white);
  b.cylinder("tower", 12, 5, [0, 10.3, 27], white, {
    collide: false,
    diameterTop: 3.6,
  });
  b.box("lantern", [3, 1.6, 3], [0, 16.8, 27], iron, { collide: false });
  b.box("stairs", [1.2, 2.6, 1.6], [-2, 1.3, 28.6], stone);
  b.sign(
    "log",
    ["航海日誌", "最後の日付：昭和三十一年"],
    [1.4, 0.7],
    [2.8, 1.5, 27],
    Math.PI / 2,
    {
      bg: "#e8dcb8",
      fg: "#30200c",
      glow: 0.3,
    },
  );
  b.lamp("base", [0, 3.4, 27], "#f0c880", 0.6, 8, false);

  // ---- 回転する光 ----
  const beam = new TransformNode("beam", b.scene);
  beam.position.set(0, 16.8, 27);
  b.box(
    "beam-a",
    [0.6, 0.6, 40],
    [0, 0, 20],
    b.mat("#fff4c0", { emissive: "#fff4c0", alpha: 0.28 }),
    {
      collide: false,
      parent: beam,
    },
  );
  beam.setEnabled(false);

  // ---- 灯台守の人影と最後の人影 ----
  const keeper = b.figure(
    "keeper",
    [2.4, 0, 20],
    {
      skin: "#b8bcb0",
      hair: "#0a0a0a",
      cloth: "#202830",
      eyes: "#000000",
      height: 1.1,
    },
    false,
  );
  keeper.rotation.y = Math.PI;
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#b8bcb0",
      hair: "#d8d8d0",
      cloth: "#202830",
      eyes: "#000000",
      height: 1.1,
    },
    false,
  );

  let spinning = false;
  return {
    update: (_g, dt) => {
      if (spinning) {
        beam.rotation.y += 0.9 * dt;
      }
    },
    custom: {
      beamOn: () => {
        beam.setEnabled(true);
        spinning = true;
      },
      beamOff: () => {
        spinning = false;
        beam.setEnabled(false);
      },
    },
  };
};
