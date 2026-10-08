import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 学校の室内プール。デッキ x=-8〜8, z=0〜22、水面 x=-3.5〜3.5, z=5〜19（水深 1.6m）。
 * 南壁(z=0)の戸の先が更衣室。水面の上には見えない壁を置いて、落ちて歩けないようにしてある。
 * swimmer は水中で仰向けに横たわる女（回転 x=-π/2、頭が南）。ghost は浮上してくる最後の一発用。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const deck = b.mat("#8a9ea0");
  const wall = b.mat("#a8bcc0");
  const ceiling = b.mat("#6a7a80");
  const basin = b.mat("#8ac0c8", { emissive: "#18383c" });
  const water = b.mat("#2a6a9a", { emissive: "#0a2a44", alpha: 0.55 });
  const rope = b.mat("#c82a2a", { emissive: "#400808" });
  const metal = b.mat("#9aa0a2", { specular: 0.7 });
  const goggleMat = b.mat("#20d0c0", { emissive: "#106a64" });
  const locker = b.mat("#5a7a8a");

  // ---- デッキ（水面部分は開ける） ----
  b.box("deck-s", [16, 0.2, 5], [0, -0.1, 2.5], deck);
  b.box("deck-n", [16, 0.2, 3], [0, -0.1, 20.5], deck);
  b.box("deck-w", [4.5, 0.2, 14], [-5.75, -0.1, 12], deck);
  b.box("deck-e", [4.5, 0.2, 14], [5.75, -0.1, 12], deck);
  // 壁・天井
  b.box("hall-w", [0.2, 5, 22], [-8, 2.5, 11], wall);
  b.box("hall-e", [0.2, 5, 22], [8, 2.5, 11], wall);
  b.box("hall-n", [16, 5, 0.2], [0, 2.5, 22], wall);
  b.box("hall-ceil", [16, 0.2, 22], [0, 5.1, 11], ceiling);
  b.wallWithGap("hall-s", "x", [0, 0, 0], 16, 5, [0, 1.4, 2.2], wall);
  b.sign(
    "pool-rule",
    ["プール使用上の注意", "走るな・飛び込むな"],
    [2.4, 0.9],
    [-7.88, 2.2, 8],
    (Math.PI / 2) * -1,
    {
      bg: "#e8f0f0",
      fg: "#144",
      glow: 0.25,
    },
  );
  b.sign("depth", ["水深 1.6m"], [1.2, 0.4], [-7.88, 1.2, 14], -Math.PI / 2, {
    bg: "#103a5a",
    fg: "#e8f4ff",
    glow: 0.3,
  });

  // ---- プール槽 ----
  b.box("basin-floor", [7, 0.2, 14], [0, -1.7, 12], basin, { collide: false });
  for (const [n, size, pos] of [
    ["basin-w", [0.1, 1.6, 14], [-3.55, -0.9, 12]],
    ["basin-e", [0.1, 1.6, 14], [3.55, -0.9, 12]],
    ["basin-s", [7, 1.6, 0.1], [0, -0.9, 4.95]],
    ["basin-n", [7, 1.6, 0.1], [0, -0.9, 19.05]],
  ] as const) {
    b.box(n, size, pos, basin, { collide: false });
  }
  b.box("water", [7, 0.02, 14], [0, -0.12, 12], water, { collide: false });
  // 水面の上は歩けない
  b.box("water-block", [7, 2, 14], [0, 1, 12], deck).isVisible = false;
  // コースロープ
  for (const x of [-1.75, 0, 1.75]) {
    b.box(`rope-${x}`, [0.05, 0.05, 14], [x, -0.08, 12], rope, {
      collide: false,
    });
  }
  // 飛び込み台
  for (const x of [-2.6, 0, 2.6]) {
    b.box(`block-${x}`, [0.8, 0.5, 0.8], [x, 0.25, 19.6], metal);
  }

  // ---- 更衣室 ----
  b.room("locker", [0, 0, -3], 8, 6, 2.8, { floor: deck, wall, ceiling }, [
    "n",
  ]);
  for (let i = 0; i < 5; i++) {
    b.box(`locker-${i}`, [0.5, 1.8, 0.8], [-3.6, 0.9, -5 + i * 1.0], locker);
  }
  b.box("locker-bench", [0.5, 0.45, 3], [-1.6, 0.23, -3], b.mat("#6a5a40"));
  b.door("pool-door", [-0.7, 0, 0], 1.4, 2.2, 0, b.mat("#4a6a7a"), {
    open: true,
    interactive: false,
  });

  // ---- ゴーグル ----
  const goggles = b.box(
    "goggles",
    [0.22, 0.07, 0.1],
    [3.9, 0.04, 12.5],
    goggleMat,
    {
      collide: false,
    },
  );
  b.register("goggles", goggles);

  // ---- 照明 ----
  b.lamp("deck", [0, 4.2, 4], "#dff4e8", 0.5, 11, true);
  b.lamp("deck", [0, 4.2, 17], "#dff4e8", 0.5, 11, true);
  b.lamp("pool", [0, -0.7, 12], "#40d0ff", 0.9, 11, false);
  b.lamp("locker", [0, 2.5, -3], "#dff4e8", 0.4, 8, true);

  // ---- 水底の女と、浮上する女 ----
  const swimmer = b.figure(
    "swimmer",
    [0, -1.2, 18.5],
    {
      skin: "#a8c0c4",
      hair: "#060a0c",
      cloth: "#1c2c4c",
      eyes: "#000000",
      height: 1.0,
    },
    false,
  );
  swimmer.rotation.x = -Math.PI / 2;
  b.figure(
    "ghost",
    [0, 0, -30],
    {
      skin: "#9fb8b8",
      hair: "#050808",
      cloth: "#1c2c4c",
      eyes: "#000000",
      height: 1.0,
    },
    false,
  );
  return {};
};
