import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/** 夜の校舎（廊下・三年A/B組・放送室・ガラス越しの準備室・昇降口）を組み立てる */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6e675a");
  const wall = b.mat("#b9b8a8");
  const ceiling = b.mat("#8f8f86");
  const wood = b.mat("#8a6a45");
  const locker = b.mat("#5b6e7a", { specular: 0.3 });
  const doorMat = b.mat("#6b5338");
  const glass = b.mat("#9cc2cc", { alpha: 0.18, specular: 0.9 });
  const board = b.mat("#1f3a2e");
  const metal = b.mat("#55595c", { specular: 0.4 });
  const dark = b.mat("#101113");
  const mats = { floor, wall, ceiling };

  // ---- 廊下 ----
  b.box("corr-floor", [3, 0.2, 36], [0, -0.1, 18], floor);
  b.box("corr-ceil", [3, 0.2, 36], [0, 3.3, 18], ceiling);
  b.box("corr-east", [0.2, 3.2, 36], [1.6, 1.6, 18], wall);
  // 西壁: 3-A(z=10) と 3-B(z=21) の戸口
  b.wallWithGap("corr-west-a", "z", [-1.6, 0, 7], 14, 3.2, [3, 1.2, 2.2], wall);
  b.wallWithGap(
    "corr-west-b",
    "z",
    [-1.6, 0, 21],
    14,
    3.2,
    [0, 1.2, 2.2],
    wall,
  );
  b.box("corr-west-c", [0.2, 3.2, 8], [-1.6, 1.6, 32], wall);
  // 昇降口側（南）
  b.wallWithGap("gate-wall", "x", [0, 0, 0], 3.2, 3.2, [0, 1.2, 2.2], wall);
  b.door("gate", [-0.6, 0, 0], 1.2, 2.2, 0, doorMat, {
    open: true,
    interactive: false,
  });
  b.room("genkan", [0, 0, -1.5], 3.2, 3, 3.2, mats, ["n"]);
  b.sign("gate-sign", ["昇降口"], [1, 0.3], [0, 2.7, 0.12], Math.PI, {
    bg: "#223",
    fg: "#fff",
    glow: 0.2,
  });

  // ロッカー（東壁）
  for (let z = 3; z <= 33; z += 1) {
    const l = b.box(`locker-${z}`, [0.4, 2, 0.5], [1.35, 1, z], locker, {
      collide: false,
    });
    b.register(`locker-${z}`, l);
  }
  // 掲示板
  b.sign(
    "notice",
    ["生徒会だより", "夜間は立入禁止"],
    [1.3, 0.9],
    [-1.48, 1.7, 5],
    -Math.PI / 2,
    {
      bg: "#e4dfc9",
      fg: "#2a2a2a",
      glow: 0.12,
    },
  );
  b.sign("class-a-sign", ["3-A"], [0.7, 0.25], [-1.48, 2.5, 10], -Math.PI / 2, {
    bg: "#d8d8d0",
    fg: "#222",
    glow: 0.12,
  });
  b.sign("class-b-sign", ["3-B"], [0.7, 0.25], [-1.48, 2.5, 21], -Math.PI / 2, {
    bg: "#d8d8d0",
    fg: "#222",
    glow: 0.12,
  });
  b.sign("booth-sign", ["放送室"], [1, 0.3], [0, 2.7, 35.88], 0, {
    bg: "#7a1f1f",
    fg: "#fff",
    glow: 0.3,
  });

  // ---- 教室 3-A / 3-B ----
  for (const [cz, label] of [
    [10, "a"],
    [21, "b"],
  ] as const) {
    b.room(`class-${label}`, [-5.1, 0, cz], 7, 8, 3.2, mats, ["e"]);
    b.door(
      `class-${label}-door`,
      [-1.6, 0, cz - 0.6],
      1.2,
      2.2,
      -Math.PI / 2,
      doorMat,
      {
        open: true,
        interactive: true,
      },
    );
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 4; row++) {
        const x = -7 + col * 1.5;
        const z = cz - 2.6 + row * 1.3;
        b.box(
          `desk-${label}-${col}-${row}`,
          [0.55, 0.75, 0.45],
          [x, 0.38, z],
          wood,
        );
      }
    }
    b.box(`board-${label}`, [0.1, 1.2, 3.4], [-8.5, 1.5, cz], board, {
      collide: false,
    });
  }
  // 3-B の自分の机（調べる対象）
  const mine = b.box(
    "desk-mine",
    [0.7, 0.8, 0.55],
    [-4.6, 0.4, 21.6],
    b.mat("#a37d4f"),
  );
  b.register("desk-mine", mine);
  b.sign(
    "board-text",
    ["日直　　山田", "明日は小テスト"],
    [2.6, 0.9],
    [-8.42, 1.6, 21],
    -Math.PI / 2,
    {
      bg: "#1f3a2e",
      fg: "#e9efe9",
      glow: 0.1,
    },
  );
  const msg = b.sign(
    "board-msg",
    ["みーつけた"],
    [2.6, 0.9],
    [-8.38, 1.6, 21],
    -Math.PI / 2,
    {
      bg: "#1f3a2e",
      fg: "#e04040",
      glow: 0.35,
    },
  );
  msg.setEnabled(false);

  // ---- 放送室（x=-3..3, z=36..44）と準備室（x=3..7.2） ----
  b.wallWithGap("booth-wall", "x", [0, 0, 36], 6.4, 3.2, [0, 1.2, 2.2], wall);
  b.room("booth", [0, 0, 40], 6, 8, 3.2, mats, ["s", "e"]);
  b.door("booth-door", [-0.6, 0, 36], 1.2, 2.2, 0, doorMat, {
    open: true,
    interactive: false,
  });
  // 仕切り（腰壁 + ガラス + 欄間）
  b.box("part-low", [0.2, 0.9, 8], [3, 0.45, 40], wall);
  b.box("part-glass", [0.06, 1.7, 8], [3, 1.75, 40], glass, { collide: true });
  b.box("part-high", [0.2, 0.6, 8], [3, 2.9, 40], wall);
  b.room("prep", [5.1, 0, 40], 4.2, 8, 3.2, mats, ["w"]);
  // 放送卓
  b.box("desk-console", [2.4, 0.8, 0.9], [-0.5, 0.4, 42.6], metal);
  b.box(
    "console-top",
    [2.4, 0.06, 1.0],
    [-0.5, 0.83, 42.6],
    b.mat("#2c2f33", { specular: 0.4 }),
  );
  b.cylinder("mic-stand", 0.35, 0.04, [-0.9, 1.02, 42.5], metal, {
    collide: false,
  });
  b.box("mic-head", [0.08, 0.14, 0.08], [-0.9, 1.25, 42.5], dark, {
    collide: false,
  });
  for (let i = 0; i < 6; i++) {
    b.box(
      `fader-${i}`,
      [0.05, 0.03, 0.16],
      [-0.2 + i * 0.11, 0.87, 42.4],
      b.mat("#aaa"),
      {
        collide: false,
      },
    );
  }
  const btn = b.box(
    "stop-btn",
    [0.18, 0.06, 0.18],
    [0.6, 0.89, 42.4],
    b.mat("#d02020", { emissive: "#601010" }),
    {
      collide: false,
    },
  );
  b.register("stop-btn", btn);
  b.sign(
    "speaker-label",
    ["放送設備"],
    [0.8, 0.22],
    [-0.5, 1.5, 43.88],
    Math.PI,
    {
      bg: "#222",
      fg: "#ccc",
      glow: 0.1,
    },
  );
  const onair = b.sign(
    "onair",
    ["ON AIR"],
    [1.1, 0.4],
    [0, 2.5, 35.9],
    Math.PI,
    {
      bg: "#c01818",
      fg: "#fff",
      glow: 0.8,
    },
  );
  onair.position.z = 36.12;
  onair.rotation.y = Math.PI;
  onair.setEnabled(false);
  // 椅子
  b.box("chair-seat", [0.45, 0.06, 0.45], [-0.5, 0.5, 41.6], b.mat("#333"), {
    collide: false,
  });
  b.box("chair-leg", [0.06, 0.5, 0.06], [-0.5, 0.25, 41.6], metal, {
    collide: false,
  });

  // 照明（昇降口・廊下 3 灯・放送室・準備室）
  b.lamp("corr-a", [0, 3.0, 5], "#dfe8e0", 0.7, 12);
  b.lamp("corr-b", [0, 3.0, 17], "#dfe8e0", 0.7, 12);
  b.lamp("corr-c", [0, 3.0, 30], "#dfe8e0", 0.7, 12);
  b.lamp("booth-lamp", [0, 3.0, 40], "#fff1d8", 0.8, 10);
  const prep = b.lamp("prep", [5.2, 2.7, 40], "#ff5a4a", 0.9, 7, false);
  prep.light.setEnabled(false);

  // 準備室に立つ少女（ガラス側 -x を向く）→ 最後のジャンプスケアにも使う
  const girl = b.figure(
    "girl",
    [5.8, 0, 40],
    {
      skin: "#cfc8bd",
      hair: "#050505",
      cloth: "#e8e4dc",
      eyes: "#000000",
      height: 0.92,
    },
    false,
  );
  girl.rotation.y = -Math.PI / 2;

  return {};
};
