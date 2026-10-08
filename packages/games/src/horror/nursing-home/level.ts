import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜勤の老人ホームの廊下。x=-2.5〜2.5, z=0〜24、天井 2.8m。南(z=0)の ward-door が出入口。
 * 西側に居室の扉 room-1〜room-4（z=5,10,15,20）。東側にナースステーション(z=2〜5)とコール盤(call-board 系の看板)。
 * 4号室(room-4)だけが空室。車椅子(wheelchair)は廊下の奥に置いてある。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#b8b4a4", { specular: 0.4 });
  const wall = b.mat("#d8d4c4");
  const ceiling = b.mat("#b0b0a4");
  const doorMat = b.mat("#8a6a48");
  const glass = b.mat("#b8d8e8", { alpha: 0.2, specular: 0.8 });
  const metal = b.mat("#8a9098", { specular: 0.6 });
  const green = b.mat("#2a6a4a");

  b.room("corridor", [0, 0, 12], 5, 24, 2.8, { floor, wall, ceiling }, [
    "s",
    "w",
  ]);
  b.wallWithGap("front", "x", [0, 0, 0], 5, 2.8, [0, 1.6, 2.2], wall);
  b.door("ward-door", [-0.8, 0, 0], 1.6, 2.2, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("outside", [5, 0.2, 4], [0, -0.1, -2], floor);
  for (const [n, size, pos] of [
    ["out-w", [0.2, 4, 4], [-2.5, 2, -2]],
    ["out-e", [0.2, 4, 4], [2.5, 2, -2]],
    ["out-s", [5, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.box("rail", [0.06, 0.06, 20], [2.3, 0.9, 14], metal, { collide: false });
  b.box("green-line", [0.02, 0.12, 24], [-2.47, 0.6, 12], green, {
    collide: false,
  });

  for (const [z0, z1] of [
    [0, 4.5],
    [5.5, 9.5],
    [10.5, 14.5],
    [15.5, 19.5],
    [20.5, 24],
  ] as const) {
    b.box(
      `wall-w-${z0}`,
      [0.2, 2.8, z1 - z0],
      [-2.5, 1.4, (z0 + z1) / 2],
      wall,
    );
  }

  // ---- 居室の扉（西側） ----
  for (let i = 0; i < 4; i++) {
    const z = 5 + i * 5;
    b.box(`lintel-${i}`, [0.2, 0.7, 1.0], [-2.5, 2.45, z], wall);
    b.door(
      `room-${i + 1}`,
      [-2.5, 0, z + 0.5],
      1.0,
      2.1,
      Math.PI / 2,
      doorMat,
      {
        open: false,
        interactive: false,
        openAngleDeg: 95,
      },
    );
    b.sign(
      `plate-${i + 1}`,
      [i === 3 ? "4 号室　空室" : `${i + 1} 号室`],
      [0.6, 0.2],
      [-2.4, 2.35, z],
      -Math.PI / 2,
      {
        bg: "#f4f0e0",
        fg: i === 3 ? "#a02020" : "#202020",
        glow: 0.4,
      },
    );
    // 居室内（開いたときに見える）
    b.box(`bed-${i}`, [1.0, 0.5, 2.0], [-4.0, 0.25, z], b.mat("#e8e8e0"), {
      collide: false,
    });
  }
  // 部屋の背面は薄暗い壁
  b.box("rooms-back", [0.2, 2.8, 24], [-5, 1.4, 12], wall, { collide: false });
  b.box("rooms-floor", [2.5, 0.2, 24], [-3.75, -0.1, 12], floor);
  b.box("rooms-ceil", [2.5, 0.2, 24], [-3.75, 2.9, 12], ceiling);
  b.box("rooms-w", [0.2, 2.8, 0.2], [-3.75, 1.4, 0], wall);
  b.box("rooms-n", [2.5, 2.8, 0.2], [-3.75, 1.4, 24], wall);

  // ---- ナースステーションとコール盤 ----
  b.box("station", [0.8, 1.0, 3], [1.9, 0.5, 3.5], b.mat("#7a6a58"));
  const callBase = b.sign(
    "call-0",
    ["ナースコール", "呼出なし"],
    [0.8, 0.5],
    [2.45, 1.7, 3.5],
    Math.PI / 2,
    {
      bg: "#102018",
      fg: "#60e0a0",
      glow: 0.7,
    },
  );
  b.register("call-board", callBase);
  b.sign(
    "call-2",
    ["ナースコール", "2 号室 呼出中"],
    [0.8, 0.5],
    [2.44, 1.7, 3.5],
    Math.PI / 2,
    {
      bg: "#301008",
      fg: "#ff6040",
      glow: 0.8,
    },
  ).isVisible = false;
  b.sign(
    "call-4",
    ["ナースコール", "4 号室 呼出中"],
    [0.8, 0.5],
    [2.44, 1.7, 3.5],
    Math.PI / 2,
    {
      bg: "#400808",
      fg: "#ff2020",
      glow: 1,
    },
  ).isVisible = false;

  // ---- 車椅子 ----
  const wc = new TransformNode("wheelchair", b.scene);
  wc.position.set(1.4, 0, 21);
  b.box("wc-seat", [0.5, 0.1, 0.5], [0, 0.5, 0], metal, {
    collide: false,
    parent: wc,
  });
  b.box("wc-back", [0.5, 0.6, 0.06], [0, 0.85, 0.25], metal, {
    collide: false,
    parent: wc,
  });
  b.box("wc-wheel-l", [0.04, 0.6, 0.6], [-0.3, 0.3, 0], b.mat("#101010"), {
    collide: false,
    parent: wc,
  });
  b.box("wc-wheel-r", [0.04, 0.6, 0.6], [0.3, 0.3, 0], b.mat("#101010"), {
    collide: false,
    parent: wc,
  });
  b.register("wheelchair", wc);

  // ---- 照明 ----
  b.lamp("hall", [0, 2.6, 5], "#fff0d0", 0.45, 9, true);
  b.lamp("hall", [0, 2.6, 13], "#fff0d0", 0.45, 9, true);
  b.lamp("hall", [0, 2.6, 21], "#fff0d0", 0.45, 9, true);

  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c8c8bc",
      hair: "#d8d8d0",
      cloth: "#d8d4e0",
      eyes: "#000000",
      height: 0.9,
    },
    false,
  );
  return {};
};
