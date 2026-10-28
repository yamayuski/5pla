import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 古い日本家屋の長い廊下。x=-1.6〜1.6、z=0〜40。突き当たり z=38 に仏壇と鈴（おりん）。
 * 障子の影（shadow-0〜3）は最初は非表示。戻り道は z=4 に襖が閉まって塞がる（back-wall）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const wood = b.mat("#3a2a1c");
  const plaster = b.mat("#6a5a48");
  const ceil = b.mat("#2a2018");
  const paper = b.mat("#d8cfb0", { emissive: "#2a2418" });
  const shadowMat = b.mat("#0a0806", { emissive: "#000000" });
  const gold = b.mat("#c8a040", { emissive: "#403010", specular: 0.6 });

  b.room(
    "hall",
    [0, 0, 20],
    3.2,
    40,
    2.8,
    { floor: wood, wall: plaster, ceiling: ceil },
    ["s", "n"],
  );
  // 障子（東側の壁に貼る見た目）と影
  for (let i = 0; i < 4; i++) {
    const z = 9 + i * 7;
    b.box(`shoji-${i}`, [0.04, 1.6, 1.4], [1.56, 1.3, z], paper, {
      collide: false,
    });
    const sh = new TransformNode(`shadow-${i}`, b.scene);
    sh.position.set(1.52, 1.2, z);
    b.box(`shadow-${i}-body`, [0.02, 1.0, 0.5], [0, 0, 0], shadowMat, {
      collide: false,
      parent: sh,
    });
    b.box(`shadow-${i}-head`, [0.02, 0.3, 0.3], [0, 0.65, 0], shadowMat, {
      collide: false,
      parent: sh,
    });
    sh.setEnabled(false);
    b.register(`shadow-${i}`, sh);
  }
  // 突き当たりの仏壇
  b.box("altar", [1.8, 1.0, 0.6], [0, 0.5, 38.8], b.mat("#1a1008"));
  b.box("altar-gold", [1.2, 0.8, 0.05], [0, 1.4, 39.2], gold, {
    collide: false,
  });
  const bell = b.box("rin", [0.25, 0.18, 0.25], [0, 1.09, 38.6], gold, {
    collide: false,
  });
  b.register("rin", bell);
  b.sign(
    "altar-sign",
    ["百物語", "九十九本目"],
    [0.8, 0.3],
    [0, 2.2, 39.1],
    Math.PI,
    { bg: "#1a1008", fg: "#d8c890", glow: 0.3 },
  );
  // 戻り道を塞ぐ襖
  const back = new TransformNode("back-wall", b.scene);
  b.box("back-fusuma", [3.2, 2.8, 0.12], [0, 1.4, 4], b.mat("#b8a878"), {
    parent: back,
  });
  back.setEnabled(false);
  b.register("back-wall", back);
  // 入口側の外
  b.box("entry", [3.2, 0.2, 4], [0, -0.1, 2], wood);

  b.lamp("lamp-a", [0, 2.5, 8], "#ffc880", 0.45, 9, false);
  b.lamp("lamp-b", [0, 2.5, 18], "#ffc880", 0.45, 9, false);
  b.lamp("lamp-c", [0, 2.5, 28], "#ffc880", 0.45, 9, false);
  b.lamp("candle", [0, 1.5, 37.5], "#ff9040", 0.5, 7, false);

  b.figure(
    "ghost",
    [0, 0, 80],
    {
      skin: "#d8d4cc",
      hair: "#0a0a0a",
      cloth: "#e8e4dc",
      eyes: "#000000",
      height: 1.0,
    },
    false,
  );
  return {};
};
