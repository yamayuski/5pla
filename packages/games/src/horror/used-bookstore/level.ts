import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉店間際の古書店。室内は x=-4〜4, z=0〜10（南が入口 front-door）。
 * 中央に背の高い書棚が2列（x=-1.6 と x=1.6, z=3〜8）。北の奥に帳場 counter（z=9）と入荷本 new-book。
 * 書棚の隙間に覗く人影 peeker（x=0, z=7.5 通路の奥）、帳場の店主 owner。
 * フック：bookFall（棚から本が落ちる）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#4a3a2a");
  const wall = b.mat("#8a7a62");
  const ceil = b.mat("#5a4c3a");
  const glass = b.mat("#0a1018", { alpha: 0.4, specular: 0.8 });
  const wood = b.mat("#3a2616");
  const dark = b.mat("#0a0a0a");
  const invisible = b.mat("#000000");
  const spines = [b.mat("#6a1a1a"), b.mat("#1a3a5a"), b.mat("#3a4a1a"), b.mat("#5a4a1a")];

  b.box("street", [12, 0.2, 6], [0, -0.1, -3], b.mat("#15181c"));
  for (const [n, size, pos] of [
    ["edge-s", [12, 4, 0.2], [0, 2, -5.5]],
    ["edge-w", [0.2, 4, 6], [-6, 2, -3]],
    ["edge-e", [0.2, 4, 6], [6, 2, -3]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  b.room("shop", [0, 0, 5], 8, 10, 3, { floor, wall, ceiling: ceil }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 8, 3, [0, 1.1, 2.2], glass);
  b.door("front-door", [-0.55, 0, 0], 1.1, 2.2, 0, glass, { open: true, interactive: false });
  b.sign("closed", ["本日の営業は", "まもなく終了します"], [1.2, 0.5], [0, 2.5, 0.12], 0, { bg: "#f0e8d0", fg: "#301810", glow: 0.3 });

  // 書棚（2列、通路は中央 x=0 と両端）
  for (const sx of [-1.7, 1.7]) {
    b.box(`shelf-${sx}`, [0.5, 2.4, 5], [sx, 1.2, 5.5], wood);
    for (let i = 0; i < 5; i++) {
      const m = spines[i % spines.length];
      b.box(`books-${sx}-${i}`, [0.1, 0.3, 4.6], [sx + (sx < 0 ? 0.28 : -0.28), 0.5 + i * 0.45, 5.5], m, { collide: false }).isPickable = false;
    }
  }
  b.box("shelf-w", [0.4, 2.4, 6], [-3.7, 1.2, 5], wood);
  b.box("shelf-e", [0.4, 2.4, 6], [3.7, 1.2, 5], wood);

  // 落ちてくる本
  const fallBook = b.box("fall-book", [0.25, 0.04, 0.18], [-1.3, 1.6, 4], b.mat("#6a1a1a"), { collide: false });
  fallBook.isPickable = false;
  b.register("fall-book", fallBook);

  // 帳場
  const counter = b.box("counter", [2.4, 1.0, 0.8], [0, 0.5, 9], wood);
  counter.isPickable = false;
  const newBook = b.box("new-book", [0.4, 0.08, 0.3], [-0.3, 1.04, 8.85], b.mat("#1a1a1a"), { collide: false });
  b.register("new-book", newBook);
  b.sign("tag", ["本日の入荷", "(まだ値付けされていません)"], [1.0, 0.4], [-0.3, 1.5, 9.38], Math.PI, { bg: "#e8dcb8", fg: "#301010", glow: 0.2 });
  b.lamp("shop", [0, 2.7, 3], "#ffe0a8", 0.6, 9, true);
  b.lamp("shop", [0, 2.7, 7.5], "#ffe0a8", 0.6, 9, true);
  b.lamp("desk", [0, 1.9, 9], "#ffc880", 0.5, 4, true);

  const owner = b.figure("owner", [0, 0, 9.9], { skin: "#b8bcb8", cloth: "#3a2a1a", hair: "#d0d0d0", eyes: "#000000" }, false);
  owner.rotation.y = Math.PI;
  const peeker = b.figure("peeker", [0, 0, 7.8], { skin: "#b8bcb8", cloth: "#202020", hair: "#050505", eyes: "#000000", longHair: true }, false);
  peeker.rotation.y = Math.PI;

  let fall = -1;
  return {
    update: (g, dt) => {
      if (fall >= 0) {
        fall += dt;
        const y = Math.max(0.03, 1.6 - 6 * fall * fall);
        fallBook.position.y = y;
        fallBook.rotation.z = Math.min(fall * 3, 1.4);
        if (y <= 0.03) {
          fall = -1;
          g.audio?.play("thud", { x: -1.3, y: 0.1, z: 4 }, 0.8);
        }
      }
    },
    custom: {
      bookFall: () => {
        fall = 0;
      },
    },
  };
};
