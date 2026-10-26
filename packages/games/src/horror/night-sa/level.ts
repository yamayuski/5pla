import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 深夜の高速道路・小さなサービスエリアの休憩棟。x=-6〜6, z=0〜10。
 * 南壁 z=0 の中央にガラスの自動ドア（外は駐車場）。手前 z=0〜4 が自販機コーナー、
 * z=4 の壁の東寄り（x=3）の開口から奥がトイレ。北壁 z=10 沿いに個室 4 つ（x=-4.5,-2.5,-0.5,1.5）、東壁に洗面台。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const tileFloor = b.mat("#8a8e8a");
  const wallMat = b.mat("#c8ccc4");
  const ceiling = b.mat("#9a9c96");
  const stallMat = b.mat("#6a7a8a", { specular: 0.3 });
  const steel = b.mat("#a8b0b4", { specular: 0.9 });
  const glass = b.mat("#6a8090", { alpha: 0.35, specular: 1 });
  const asphalt = b.mat("#1a1a1c");

  b.room(
    "hall",
    [0, 0, 5],
    12,
    10,
    2.8,
    { floor: tileFloor, wall: wallMat, ceiling },
    ["s"],
  );
  b.wallWithGap("hall-s", "x", [0, 0, 0], 12, 2.8, [0, 1.8, 2.3], wallMat);
  b.door("auto-door", [-0.9, 0, 0], 1.8, 2.3, 0, glass, {
    open: true,
    interactive: false,
  });
  b.wallWithGap("toilet-wall", "x", [0, 0, 4], 12, 2.8, [3, 1.4, 2.2], wallMat);
  b.sign("toilet-sign", ["お手洗い"], [0.9, 0.3], [3, 2.5, 3.88], 0, {
    bg: "#2a4a8a",
    fg: "#fff",
    glow: 0.5,
  });

  // 外の駐車場（ガラス越しに見えるだけ）
  b.box("parking", [30, 0.2, 14], [0, -0.1, -7.2], asphalt);
  b.box(
    "my-car",
    [1.8, 1.3, 4.2],
    [-4, 0.65, -6],
    b.mat("#3a4a6a", { specular: 0.7 }),
  );
  b.box("parking-fence", [30, 1.2, 0.2], [0, 0.6, -14], steel);
  b.box("parking-fence-w", [0.2, 1.2, 14], [-15, 0.6, -7], steel);
  b.box("parking-fence-e", [0.2, 1.2, 14], [15, 0.6, -7], steel);

  // 自販機コーナー
  const vending = (name: string, z: number, color: string) => {
    b.box(
      name,
      [0.8, 1.8, 1.0],
      [-5.55, 0.9, z],
      b.mat(color, { emissive: "#202020" }),
    );
    b.sign(
      `${name}-panel`,
      ["COFFEE", "¥130"],
      [0.7, 0.5],
      [-5.13, 1.3, z],
      -Math.PI / 2,
      {
        bg: "#f4f4ec",
        fg: "#8a1a1a",
        glow: 0.7,
      },
    );
  };
  vending("vending-a", 1.2, "#a02020");
  vending("vending-b", 2.5, "#2050a0");
  const slot = b.box(
    "vending-slot",
    [0.05, 0.25, 0.6],
    [-5.13, 0.3, 1.2],
    b.mat("#101010"),
    {
      collide: false,
    },
  );
  b.register("vending-slot", slot);
  b.box("bench", [0.5, 0.45, 2.4], [-0.5, 0.23, 2.2], b.mat("#6a5a40"));
  b.sign(
    "info",
    ["次の SA まで 48km", "深夜の運転にご注意ください"],
    [1.4, 0.5],
    [2.5, 1.7, 0.12],
    Math.PI,
    { bg: "#1a5a2a", fg: "#fff", glow: 0.4 },
  );

  // 洗面台（東壁）とハンドドライヤー
  for (const z of [5.5, 7]) {
    b.box(`sink-${z}`, [0.6, 0.15, 0.6], [5.6, 0.85, z], steel);
    b.box(
      `mirror-${z}`,
      [0.04, 0.7, 0.6],
      [5.88, 1.6, z],
      b.mat("#b8c4c8", {
        emissive: "#303a3c",
        specular: 1,
      }),
      { collide: false },
    );
  }
  b.box("dryer", [0.25, 0.5, 0.35], [5.8, 1.2, 8.6], b.mat("#d8d8d4"), {
    collide: false,
  });

  // 個室（北壁沿い）
  for (const [i, x] of [-4.5, -2.5, -0.5, 1.5].entries()) {
    b.box(`stall-wall-${i}`, [0.06, 2.0, 1.6], [x - 1, 1.0, 9.2], stallMat);
    b.box(`toilet-${i}`, [0.45, 0.4, 0.6], [x, 0.2, 9.6], b.mat("#eeeeea"), {
      collide: false,
    });
    b.door(`stall-${i}`, [x - 0.9, 0, 8.4], 1.8, 2.0, 0, stallMat, {
      interactive: i !== 0,
      locked: i === 0,
    });
    b.sign(
      `stall-mark-${i}`,
      [i === 0 ? "使用中" : "空き"],
      [0.3, 0.12],
      [x, 1.7, 8.36],
      0,
      {
        bg: i === 0 ? "#c02020" : "#2a8a3a",
        fg: "#fff",
        glow: 0.5,
      },
    );
  }
  b.box("stall-wall-end", [0.06, 2.0, 1.6], [2.5, 1.0, 9.2], stallMat);
  b.box("stall-top", [8, 0.06, 1.6], [-1.5, 2.0, 9.2], stallMat, {
    collide: false,
  });

  // ---- 照明 ----
  b.lamp("lobby", [0, 2.7, 2], "#f0f4ff", 0.55, 8);
  b.lamp("toilet", [0, 2.7, 7], "#f0f4ff", 0.5, 9);
  b.lamp("parking", [-2, 5, -7], "#ffc070", 0.6, 14);
  b.lamp("vending", [-4.8, 1.4, 1.8], "#e0f0ff", 0.3, 3, false);

  // ---- 個室の女（だるまさんがころんだ） ----
  const woman = b.figure(
    "woman",
    [-4.5, 0, 9.3],
    {
      skin: "#ccd0c8",
      hair: "#030303",
      cloth: "#8a8a80",
      eyes: "#000000",
      height: 0.98,
      longHair: true,
    },
    false,
  );
  woman.rotation.y = Math.PI;

  return {};
};
