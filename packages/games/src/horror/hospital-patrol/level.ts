import { Color3 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 廃病院の4階（廊下 x=-1.5〜1.5, z=-12〜12）。
 * 南端が入口（front-door）、東にナースステーション、西に病室 401/403、北端が 402 号室。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#5d6460");
  const wall = b.mat("#a9b3ad");
  const ceiling = b.mat("#7d8580");
  const doorMat = b.mat("#8c9a94");
  const metal = b.mat("#6a6f72", { specular: 0.4 });
  const sheet = b.mat("#d6d8d2");
  const counter = b.mat("#7f8a86");
  const dark = b.mat("#151718");
  const mats = { floor, wall, ceiling };

  // ---- 廊下 ----
  b.box("corr-floor", [3.2, 0.2, 28], [0, -0.1, 0], floor);
  b.box("corr-ceil", [3.2, 0.2, 28], [0, 3.1, 0], ceiling);
  // 東壁: ナースステーションの開口（z=-2, 幅 2.4）
  b.wallWithGap("corr-east", "z", [1.6, 0, 0], 24, 3, [-2, 2.4, 2.6], wall);
  // 西壁: 401（z=-5）と 403（z=5）の戸口
  b.wallWithGap("corr-west-s", "z", [-1.6, 0, -6], 12, 3, [1, 1.2, 2.2], wall);
  b.wallWithGap("corr-west-n", "z", [-1.6, 0, 6], 12, 3, [-1, 1.2, 2.2], wall);

  // 南: 入口（開いている。施錠イベントで閉まる）
  b.wallWithGap("entry-wall", "x", [0, 0, -12], 3.4, 3, [0, 1.2, 2.2], wall);
  b.door("front-door", [-0.6, 0, -12], 1.2, 2.2, 0, doorMat, {
    open: true,
    interactive: false,
  });
  b.room("stairs", [0, 0, -13.6], 3.2, 3, 3, mats, ["n"]);
  b.sign("entry-sign", ["非常口"], [0.9, 0.3], [0, 2.6, -11.88], 0, {
    bg: "#1c7a3a",
    fg: "#fff",
    glow: 0.6,
  });

  // 北: 402 号室（閉ざされた扉。interact で開く）
  b.wallWithGap("n-wall", "x", [0, 0, 12], 3.4, 3, [0, 1.2, 2.2], wall);
  const door402 = b.door("room-402", [-0.6, 0, 12], 1.2, 2.2, 0, doorMat, {
    locked: true,
    interactive: false,
  });
  b.room("r402", [0, 0, 14.6], 4, 5, 3, mats, ["s"]);
  b.box("bed-402", [0.9, 0.5, 2], [1.2, 0.25, 15.5], sheet);
  b.sign("plate-402", ["402"], [0.5, 0.22], [0, 2.45, 11.88], 0, {
    bg: "#e8eae4",
    fg: "#222",
    glow: 0.15,
  });
  // ナースコールの赤ランプ（最初は消灯）
  const call = b.lamp("call", [0, 2.75, 11.7], "#ff2a20", 0.9, 6);
  call.light.setEnabled(false);
  if (call.bulb) {
    call.bulb.emissiveColor = Color3.Black();
  }

  // ---- 病室 401 / 403（覗くだけ） ----
  for (const [cz, no] of [
    [-5, "401"],
    [5, "403"],
  ] as const) {
    b.room(`r${no}`, [-4.1, 0, cz], 5, 6, 3, mats, ["e"]);
    b.door(`door-${no}`, [-1.6, 0, cz - 0.6], 1.2, 2.2, -Math.PI / 2, doorMat, {
      open: true,
      interactive: true,
    });
    b.sign(`plate-${no}`, [no], [0.5, 0.22], [-1.48, 2.45, cz], -Math.PI / 2, {
      bg: "#e8eae4",
      fg: "#222",
      glow: 0.15,
    });
    for (const dz of [-1.5, 1.5]) {
      b.box(`bed-${no}-${dz}`, [2, 0.5, 0.9], [-5.3, 0.25, cz + dz], sheet);
      b.box(
        `bedframe-${no}-${dz}`,
        [2.1, 0.8, 0.06],
        [-5.3, 0.4, cz + dz - 0.48],
        metal,
        {
          collide: false,
        },
      );
    }
  }
  // 403 のベッドだけ人の形にへこんでいる……ように見える枕
  b.box("pillow-403", [0.4, 0.15, 0.6], [-6.1, 0.57, 6.5], sheet, {
    collide: false,
  });

  // ---- ナースステーション（x=1.6〜6, z=-5〜1） ----
  b.room("station", [3.8, 0, -2], 4.4, 6, 3, mats, ["w"]);
  b.box("st-counter", [0.5, 1.05, 3.6], [2.3, 0.53, -2], counter);
  b.box("st-desk", [1.4, 0.75, 0.7], [4.6, 0.38, -4.3], counter);
  b.box("st-monitor", [0.6, 0.4, 0.06], [4.6, 1.0, -4.55], dark, {
    collide: false,
  });
  b.sign(
    "st-board",
    ["夜勤　看護師", "4/12　巡回 2:00", "402　コール対応"],
    [1.8, 1],
    [5.88, 1.7, -2],
    Math.PI / 2,
    { bg: "#e5e2d8", fg: "#333", glow: 0.12 },
  );
  b.sign(
    "st-sign",
    ["ナースステーション"],
    [1.8, 0.3],
    [1.48, 2.6, -2],
    Math.PI / 2,
    {
      bg: "#dfe6e3",
      fg: "#245",
      glow: 0.2,
    },
  );
  // コールパネル（402 だけ点く）
  const panel = b.sign(
    "call-panel",
    ["401  402  403"],
    [1.2, 0.3],
    [5.88, 2.4, -2],
    Math.PI / 2,
    { bg: "#202322", fg: "#666", glow: 0.1 },
  );
  b.register("call-panel", panel);

  // ---- 車椅子（最初は東壁際 z=3、動くと廊下の真ん中へ） ----
  const chair = new TransformNode("wheelchair", b.scene);
  chair.position.set(1.1, 0, 3);
  const wheelL = b.cylinder("wc-wheel-l", 0.06, 0.6, [-0.3, 0.3, 0], dark, {
    collide: false,
  });
  const wheelR = b.cylinder("wc-wheel-r", 0.06, 0.6, [0.3, 0.3, 0], dark, {
    collide: false,
  });
  wheelL.rotation.z = Math.PI / 2;
  wheelR.rotation.z = Math.PI / 2;
  const parts = [
    b.box("wc-seat", [0.5, 0.06, 0.5], [0, 0.5, 0], metal, { collide: false }),
    b.box("wc-back", [0.5, 0.55, 0.06], [0, 0.8, 0.25], dark, {
      collide: false,
    }),
    wheelL,
    wheelR,
  ];
  for (const p of parts) {
    p.parent = chair;
  }
  chair.rotation.y = Math.PI / 2;
  b.register("wheelchair", chair);

  // 点滴スタンドと散らばったカルテ
  b.cylinder("iv-pole", 1.8, 0.04, [-1.2, 0.9, -8], metal, { collide: false });
  b.box("iv-bag", [0.15, 0.25, 0.05], [-1.2, 1.75, -8], sheet, {
    collide: false,
  });
  for (let i = 0; i < 4; i++) {
    b.box(
      `chart-${i}`,
      [0.25, 0.01, 0.33],
      [0.4 - i * 0.3, 0.01, -1 + i * 1.7],
      sheet,
      {
        collide: false,
        rotY: i * 0.7,
      },
    );
  }

  // ---- 照明 ----
  b.lamp("hall-a", [0, 2.9, -7], "#cfe3da", 0.55, 10);
  b.lamp("hall-b", [0, 2.9, 4], "#cfe3da", 0.45, 10);
  b.lamp("station", [3.8, 2.8, -2], "#d8efe6", 0.4, 7);

  // ---- 402 の看護師（最後のジャンプスケア） ----
  b.figure(
    "nurse",
    [0, 0, 15],
    {
      skin: "#bfc4bb",
      hair: "#0a0a0a",
      cloth: "#e9ece6",
      eyes: "#000000",
      height: 1.05,
    },
    false,
  );

  // 車椅子の移動アニメーション
  let chairT = -1;
  return {
    update: (_g, dt) => {
      if (chairT >= 0 && chairT < 1) {
        chairT = Math.min(1, chairT + dt / 2.2);
        const e = 1 - (1 - chairT) * (1 - chairT);
        chair.position.x = 1.1 - 1.1 * e;
        chair.position.z = 3 - 1.5 * e;
        chair.rotation.y = Math.PI / 2 + Math.PI * 0.75 * e;
      }
    },
    custom: {
      wheelchairMove: () => {
        chairT = 0;
      },
      callPanel: () => {
        panel.setEnabled(false);
        b.sign(
          "call-panel-on",
          ["401  ●402  403"],
          [1.2, 0.3],
          [5.87, 2.4, -2],
          Math.PI / 2,
          { bg: "#202322", fg: "#ff3b30", glow: 0.7 },
        );
      },
      burst402: () => {
        door402.locked = false;
        door402.speed = 10;
        door402.target = 1;
      },
    },
  };
};
