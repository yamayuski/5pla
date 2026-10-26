import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 古い納屋。x=-4.5〜4.5, z=0〜20（入口 z=0）。中央の通路 x=-1.2〜1.2、左右に馬房が3つずつ。
 * 馬房 zc=5, 9.5, 14（幅 4.5m）。戸は x=±1.2 の通路側に付き、最初は開いている。
 * stall-0〜2 が左、stall-3〜5 が右（同じ奥行きの組み合わせ：2/5, 1/4, 0/3）。
 */
const ZC = [5, 9.5, 14];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#4a3a28");
  const wall = b.mat("#5a4430");
  const ceiling = b.mat("#2e2218");
  const wood = b.mat("#6a4e32");
  const hay = b.mat("#b8a05a");
  const grass = b.mat("#1c2a1c");
  const metal = b.mat("#4a4a4c", { specular: 0.4 });

  // ---- 納屋本体 ----
  b.room("barn", [0, 0, 10], 9, 20, 4.5, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("barn-s", "x", [0, 0, 0], 9, 4.5, [0, 1.8, 2.4], wall);
  b.door("barn-door", [-0.9, 0, 0], 1.8, 2.4, 0, wood, {
    open: true,
    interactive: false,
  });
  // 屋根の梁
  for (const z of [3, 8, 13, 18]) {
    b.box(`beam-${z}`, [9, 0.25, 0.25], [0, 4.2, z], wood, { collide: false });
  }
  // 外：庭
  b.box("yard", [10, 0.2, 7], [0, -0.1, -3.5], grass);
  for (const [n, size, pos] of [
    ["yard-w", [0.2, 4, 7], [-5, 2, -3.5]],
    ["yard-e", [0.2, 4, 7], [5, 2, -3.5]],
    ["yard-s", [10, 4, 0.2], [0, 2, -7]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }

  // ---- 馬房 ----
  for (const side of [-1, 1]) {
    // 区切りの板壁（4枚）
    for (const zb of [2.75, 7.25, 11.75, 16.25]) {
      b.box(
        `part-${side}-${zb}`,
        [3.3, 1.9, 0.12],
        [side * 2.85, 0.95, zb],
        wood,
      );
    }
    for (const [i, zc] of ZC.entries()) {
      const idx = side < 0 ? i : i + 3;
      // 通路側の柵（戸の左右）
      b.box(
        `fence-a-${idx}`,
        [0.1, 1.3, 1.3],
        [side * 1.2, 0.65, zc - 1.35],
        wood,
      );
      b.box(
        `fence-b-${idx}`,
        [0.1, 1.3, 1.3],
        [side * 1.2, 0.65, zc + 1.35],
        wood,
      );
      // 戸（通路側、ヒンジは zc-0.7、rotY=-π/2 で +z に伸びる）
      b.door(
        `stall-${idx}`,
        [side * 1.2, 0, zc - 0.7],
        1.4,
        1.3,
        -Math.PI / 2,
        wood,
        {
          open: true,
          interactive: false,
          openAngleDeg: 100,
        },
      );
      // 藁の山
      b.box(`hay-${idx}`, [1.6, 0.4, 1.8], [side * 3.4, 0.2, zc], hay, {
        collide: false,
      });
    }
  }
  // 奥の壁：古い農具
  b.box("tool-rack", [3, 0.1, 0.1], [0, 1.8, 19.8], wood, { collide: false });
  for (let i = 0; i < 4; i++) {
    b.cylinder(`tool-${i}`, 1.4, 0.05, [-1.2 + i * 0.8, 1.1, 19.8], metal, {
      collide: false,
    });
  }
  b.box("cart", [1.4, 0.5, 1.0], [0, 0.4, 18], wood);
  b.sign(
    "tag",
    ["大 正 十 二 年", "建之"],
    [1.4, 0.5],
    [0, 3.4, 19.88],
    Math.PI,
    {
      bg: "#2a1c10",
      fg: "#d8c8a0",
      glow: 0.3,
    },
  );

  // ---- 照明 ----
  b.lamp("barn-a", [0, 3.6, 5], "#ffc880", 0.5, 9, true);
  b.lamp("barn-b", [0, 3.6, 14], "#ffc880", 0.5, 9, true);
  b.lamp("yard", [1, 3, -3], "#b8c8ff", 0.4, 8, false);

  // ---- 通路の老人 ----
  const farmer = b.figure(
    "farmer",
    [0, 0, 19],
    {
      skin: "#a8a498",
      hair: "#d0d0c8",
      cloth: "#3a3a2a",
      eyes: "#000000",
      height: 1.08,
      longHair: false,
    },
    false,
  );
  farmer.rotation.y = Math.PI;
  return {};
};
