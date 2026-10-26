import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 古い団地の五階の外廊下。x=-2〜28 を東へ一直線、幅 z=0〜2。
 * 南側（z=0）に 501〜507 号室の玄関ドア、北側（z=2）は腰までの手すりで外は夜空。
 * 西端 x=-2 に階段室への鉄扉（最初は開いている）。突き当たりの 507 号室が自宅。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const concrete = b.mat("#6e6c66");
  const wallMat = b.mat("#a8a294");
  const ceiling = b.mat("#8a8678");
  const steelDoor = b.mat("#5a6a6a", { specular: 0.5 });
  const rail = b.mat("#4a5a5a", { specular: 0.4 });
  const darkWin = b.mat("#101418");
  const litWin = b.mat("#d8c890", { emissive: "#7a6a40" });

  // ---- 階段室（スポーン） ----
  b.room(
    "stair",
    [-4, 0, 1],
    4,
    2.2,
    2.6,
    { floor: concrete, wall: wallMat, ceiling },
    ["e"],
  );
  b.wallWithGap("stair-e", "z", [-2, 0, 1], 2.2, 2.6, [0, 1.0, 2.1], wallMat);
  b.door("stair-door", [-2, 0, 1.5], 1.0, 2.1, Math.PI / 2, steelDoor, {
    open: true,
    interactive: false,
  });
  b.sign(
    "stair-sign",
    ["5F", "↓ 階段"],
    [0.5, 0.4],
    [-5.88, 1.6, 1],
    -Math.PI / 2,
    {
      bg: "#e8e4d8",
      fg: "#222",
      glow: 0.3,
    },
  );
  b.sign(
    "ev-paper",
    ["エレベーター", "点検中"],
    [0.6, 0.4],
    [-4, 1.5, -0.08],
    Math.PI,
    {
      bg: "#f4f0e0",
      fg: "#a01010",
      glow: 0.25,
    },
  );

  // ---- 外廊下 ----
  b.box("corridor-floor", [30, 0.2, 2.2], [13, -0.1, 1], concrete);
  b.box("corridor-ceil", [30, 0.2, 2.2], [13, 2.7, 1], ceiling);
  b.box("corridor-wall", [30, 2.6, 0.2], [13, 1.3, -0.1], wallMat);
  b.box("corridor-end", [0.2, 2.6, 2.2], [28.1, 1.3, 1], wallMat);
  b.box("rail-wall", [30, 1.1, 0.15], [13, 0.55, 2.05], rail);
  // 外へ落ちないよう、手すりの上に見えない柵
  const guard = b.box("rail-guard", [30, 1.5, 0.05], [13, 1.85, 2.1], rail);
  guard.isVisible = false;

  // 玄関ドア 501〜506（ただの板）と表札
  for (let i = 0; i < 6; i++) {
    const x = 2 + i * 4;
    b.box(`door-50${i + 1}`, [0.9, 2.0, 0.06], [x, 1.0, 0.03], steelDoor, {
      collide: false,
    });
    b.sign(
      `plate-50${i + 1}`,
      [`50${i + 1}`],
      [0.3, 0.16],
      [x + 0.7, 1.55, 0.02],
      Math.PI,
      { bg: "#e8e4d8", fg: "#222", glow: 0.25 },
    );
    b.box(
      `meter-${i}`,
      [0.4, 0.5, 0.15],
      [x - 1.1, 1.6, 0.08],
      b.mat("#8a8a80"),
      {
        collide: false,
      },
    );
  }
  // 503 の新聞受け、505 のインターホン
  const slot = b.box(
    "slot-503",
    [0.3, 0.06, 0.04],
    [10, 0.9, 0.08],
    b.mat("#202020"),
    {
      collide: false,
    },
  );
  b.register("slot-503", slot);
  b.box(
    "intercom-505",
    [0.12, 0.18, 0.05],
    [18.7, 1.35, 0.03],
    b.mat("#d0d0c8"),
    {
      collide: false,
    },
  );
  // 506 の前の三輪車
  b.cylinder("tricycle", 0.3, 0.35, [22.6, 0.17, 0.5], b.mat("#c02020"), {
    collide: false,
  });

  // 507（自宅）のドア
  b.door("door-507", [25.55, 0, 0.03], 0.9, 2.0, 0, steelDoor, {
    locked: true,
    interactive: false,
  });
  b.sign("plate-507", ["507"], [0.3, 0.16], [26.7, 1.55, 0.02], Math.PI, {
    bg: "#e8e4d8",
    fg: "#222",
    glow: 0.25,
  });

  // ---- 外の景色（向かいの棟と地面） ----
  b.box("ground", [80, 0.2, 60], [13, -13, 20], b.mat("#1a1c1a"));
  b.box("opposite", [40, 18, 6], [13, -6, 28], b.mat("#3a3a38"), {
    collide: false,
  });
  for (let fl = 0; fl < 5; fl++) {
    for (let i = 0; i < 9; i++) {
      const lit = (fl * 7 + i * 3) % 5 === 0;
      b.box(
        `opp-win-${fl}-${i}`,
        [1.2, 0.9, 0.05],
        [-3 + i * 4, -12 + fl * 3.2, 24.95],
        lit ? litWin : darkWin,
        { collide: false },
      );
    }
  }

  // ---- 照明 ----
  b.lamp("stair", [-4, 2.5, 1], "#e8f0ff", 0.35, 5);
  b.lamp("l1", [3, 2.55, 1], "#f0f4ff", 0.45, 7);
  b.lamp("l2", [13, 2.55, 1], "#f0f4ff", 0.45, 7);
  b.lamp("l3", [23, 2.55, 1], "#f0f4ff", 0.45, 7);
  b.lamp("street", [13, -9, 14], "#ffc070", 0.6, 14);

  // ---- 507 から出てくる女 ----
  const woman = b.figure(
    "woman",
    [26, 0, 0.5],
    {
      skin: "#d0d0c8",
      hair: "#050505",
      cloth: "#b8b0a0",
      eyes: "#000000",
      height: 0.98,
      longHair: true,
    },
    false,
  );
  woman.rotation.y = -Math.PI / 2;

  return {};
};
