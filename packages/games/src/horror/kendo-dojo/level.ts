import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 町の剣道場。板張りの道場は x=-5〜5, z=0〜12、南（z=0）の引き戸 dojo-door。
 * 北壁に神棚 kamidana、北西に太鼓 taiko、東壁に名札掛け nafuda-a/b、西壁に防具棚（面を被った防具 bogu-*）。
 * 掃除用のバケツ bucket（南東）。竹刀立て shinai-rack と落ちる竹刀 shinai-fall。
 * 最後は道場の真ん中に正座している防具姿 kneeler、飛び出すのは armored（立ち姿）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const boards = b.mat("#8a6a40", { specular: 0.4 });
  const wall = b.mat("#d8d0b8");
  const ceiling = b.mat("#5a4430");
  const wood = b.mat("#4a3420");
  const navy = b.mat("#1a2038");
  const grille = b.mat("#a0a0a8", { specular: 0.8 });
  const white = b.mat("#e8e8e0");

  b.room("dojo", [0, 0, 6], 10, 12, 3.4, { floor: boards, wall, ceiling }, ["s"]);
  b.wallWithGap("south", "x", [0, 0, 0], 10, 3.4, [0, 2.0, 2.1], wall);
  b.door("dojo-door", [-1.0, 0, 0], 2.0, 2.1, 0, b.mat("#c8b890"), {
    open: true,
    interactive: false,
  });
  b.box("out-block", [3, 3, 0.2], [0, 1.5, -1.2], wall).isVisible = false;
  b.box("out-w", [0.2, 3, 1.2], [-1.5, 1.5, -0.6], wall).isVisible = false;
  b.box("out-e", [0.2, 3, 1.2], [1.5, 1.5, -0.6], wall).isVisible = false;
  for (let x = -4.5; x <= 4.5; x += 1) {
    b.box(`seam-${x}`, [0.01, 0.005, 12], [x, 0.003, 6], b.mat("#6a4a28"), { collide: false });
  }

  // ---- 神棚と掛け軸 ----
  const kamidana = b.box("kamidana", [1.4, 0.5, 0.4], [0, 2.6, 11.75], wood, { collide: false });
  b.register("kamidana", kamidana);
  b.sign("scroll", ["心技体"], [0.7, 1.2], [1.8, 1.8, 11.93], 0, { bg: "#f0ead8", fg: "#101010", glow: 0.3 });

  // ---- 太鼓 ----
  const taiko = b.cylinder("taiko", 0.6, 0.8, [-3.8, 1.2, 10.8], b.mat("#8a2010", { specular: 0.4 }));
  taiko.rotation.x = Math.PI / 2;
  b.register("taiko", taiko);
  b.box("taiko-stand", [0.9, 0.9, 0.5], [-3.8, 0.45, 10.8], wood);

  // ---- 名札掛け ----
  const tags = { bg: "#e8dcc0", fg: "#101010", glow: 0.3 };
  b.sign("nafuda-a", ["五段 佐藤  三段 鈴木  二段 高橋", "初段 田中  初段 伊藤  一級 渡辺"], [2.4, 0.6], [4.93, 2.0, 6], Math.PI / 2, tags);
  b.sign("nafuda-b", ["五段 佐藤  三段 鈴木  二段 高橋", "初段 田中  初段 伊藤  ── あなた"], [2.4, 0.6], [4.92, 2.0, 6], Math.PI / 2, {
    bg: "#e8dcc0",
    fg: "#801010",
    glow: 0.4,
  }).setEnabled(false);

  // ---- 防具棚（面を被った防具が並ぶ） ----
  b.box("bogu-shelf", [0.6, 0.9, 6], [-4.65, 0.45, 5], wood);
  for (let i = 0; i < 5; i++) {
    const z = 2.8 + i * 1.1;
    b.box(`bogu-${i}-do`, [0.35, 0.4, 0.45], [-4.6, 1.1, z], navy, { collide: false });
    b.box(`bogu-${i}-men`, [0.3, 0.32, 0.3], [-4.6, 1.5, z], navy, { collide: false });
    b.box(`bogu-${i}-grille`, [0.02, 0.24, 0.22], [-4.44, 1.5, z], grille, { collide: false });
  }

  // ---- 竹刀立てと落ちる竹刀 ----
  b.box("shinai-rack", [0.3, 1.2, 1.2], [4.75, 0.6, 10], wood);
  for (let i = 0; i < 5; i++) {
    b.box(`shinai-${i}`, [0.04, 1.2, 0.04], [4.6, 1.2, 9.6 + i * 0.2], b.mat("#c8b070"), { collide: false });
  }
  const fall = b.box("shinai-fall", [0.04, 0.04, 1.2], [3.8, 0.03, 9.6], b.mat("#c8b070"), { collide: false });
  fall.setEnabled(false);
  b.register("shinai-fall", fall);

  // ---- 掃除用のバケツ ----
  const bucket = b.cylinder("bucket", 0.3, 0.3, [3.6, 0.15, 1.2], b.mat("#3060a0"));
  b.register("bucket", bucket);
  b.box("zokin", [0.3, 0.02, 0.2], [3.2, 0.01, 1.4], white, { collide: false });

  // ---- 照明 ----
  b.lamp("dojo", [-2, 3.2, 4], "#f4f0e0", 0.5, 9, true);
  b.lamp("dojo", [2, 3.2, 8], "#f4f0e0", 0.5, 9, true);
  b.lamp("candle", [0, 2.9, 11.5], "#ffb060", 0.3, 5, false);
  const red = b.lamp("red", [0, 3.2, 6], "#ff2010", 0.3, 10, false);
  red.light.setEnabled(false);

  // ---- 正座する防具姿と、立ち上がる防具姿 ----
  const armorStyle = { skin: "#202430", cloth: "#1a2038", hair: "#1a2038", eyes: "#ff2010", longHair: false };
  const kneeler = b.figure("kneeler", [0, -0.55, 6.5], { ...armorStyle, height: 0.95 }, false);
  kneeler.rotation.y = Math.PI;
  b.figure("armored", [0, 0, 6.5], armorStyle, false);
  return undefined;
};
