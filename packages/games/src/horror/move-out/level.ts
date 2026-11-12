import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 引っ越し前夜の空っぽの1K。室内は x=-3〜3, z=0〜8（南が玄関 front-door）。
 * 北東に押入れ closet（襖 fusuma は interact 対象）、中に figure inside。
 * 隅に覗く人影 peeker、壁の小さな手形 handprint（最初は非表示）。段ボール box-fall が落ちる（フック boxFall）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#8a7658");
  const wall = b.mat("#c8c2b0");
  const ceil = b.mat("#d8d4c8");
  const wood = b.mat("#6a5030");
  const cardboard = b.mat("#a07c48");
  const dark = b.mat("#0a0a0a");
  const invisible = b.mat("#000000");
  const fusumaMat = b.mat("#b8ab88");

  b.box("hall", [12, 0.2, 6], [0, -0.1, -3], b.mat("#202428"));
  for (const [n, size, pos] of [
    ["edge-s", [12, 4, 0.2], [0, 2, -5.5]],
    ["edge-w", [0.2, 4, 6], [-6, 2, -3]],
    ["edge-e", [0.2, 4, 6], [6, 2, -3]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  b.room("flat", [0, 0, 4], 6, 8, 2.6, { floor, wall, ceiling: ceil }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 2.6, [0, 1.05, 2.1], wall);
  b.door("front-door", [-0.5, 0, 0], 1.0, 2.1, 0, wood, { open: true, interactive: false });
  b.sign("memo", ["引っ越し作業", "明朝 9:00 開始"], [1.0, 0.4], [-1.4, 1.6, 0.12], 0, { bg: "#f0ecd8", fg: "#202020", glow: 0.2 });

  // 積まれた段ボール
  for (const [i, pos] of [[0, [-2.4, 0.3, 2]], [1, [-2.4, 0.3, 3]], [2, [-2.4, 0.9, 2.5]], [3, [2.3, 0.3, 4.2]]] as const) {
    b.box(`carton-${i}`, [0.8, 0.6, 0.7], [...pos] as [number, number, number], cardboard);
  }
  b.box("kotatsu", [1.2, 0.4, 1.2], [0, 0.2, 4.5], wood);
  b.sign("note", ["最後の夜", "さびしくなるね"], [0.9, 0.3], [-2.95, 1.5, 6], Math.PI / 2, { bg: "#e8e0c8", fg: "#301010", glow: 0.1 });

  // 押入れ
  b.box("closet-back", [1.8, 2.2, 0.1], [1.9, 1.1, 7.95], dark).isPickable = false;
  const fusuma = b.box("fusuma", [1.6, 2.0, 0.06], [1.9, 1.0, 6.9], fusumaMat, { collide: false });
  b.register("fusuma", fusuma);
  const inside = b.figure("inside", [1.9, 0, 7.5], { skin: "#b8bcb8", cloth: "#d8d8d0", hair: "#050505", eyes: "#000000", longHair: true }, false);
  inside.rotation.y = Math.PI;

  const peeker = b.figure("peeker", [-2.4, 0, 6.8], { skin: "#b8bcb8", cloth: "#202020", hair: "#050505", eyes: "#000000", longHair: true }, false);
  peeker.rotation.y = Math.PI;
  const handprint = b.sign("handprint", ["", ""], [0.3, 0.3], [2.95, 0.9, 3], -Math.PI / 2, { bg: "#6a1010", fg: "#6a1010", glow: 0.0 });
  handprint.setEnabled(false);
  b.register("handprint", handprint);

  b.lamp("flat", [0, 2.4, 3], "#ffe8c0", 0.55, 8, true);
  b.lamp("flat", [0, 2.4, 6], "#ffe8c0", 0.5, 7, true);
  b.lamp("closet", [1.9, 2.0, 6.5], "#c0d0ff", 0.3, 3, true);

  const falling = b.box("box-fall", [0.4, 0.3, 0.4], [-2.4, 1.5, 2.5], cardboard, { collide: false });
  falling.isPickable = false;
  b.register("box-fall", falling);
  let t = -1;
  return {
    update: (g, dt) => {
      if (t >= 0) {
        t += dt;
        const y = Math.max(0.15, 1.5 - 6 * t * t);
        falling.position.y = y;
        falling.rotation.x = Math.min(t * 3, 1.2);
        if (y <= 0.15) {
          t = -1;
          g.audio?.play("thud", { x: -2.4, y: 0.1, z: 2.5 }, 0.9);
        }
      }
    },
    custom: {
      boxFall: () => {
        t = 0;
      },
    },
  };
};
