import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * オフィスビル12階の営業フロア。フロアは x=-6〜6, z=0〜12、南（z=0）がエレベーターホールへのガラス扉 glass-door。
 * 島型のデスクが2列（x=-2.5 / 2.5）。自分の席 my-pc（x=-2.5, z=4 の南向きの席）。北東に複合機 printer と出力 prints（紙）。
 * 北西に空席の課長席 boss-chair（窓を背にこちら向き）、東の窓は夜景。天井灯は group row-1〜3（奥から消えていく）。
 * 最後は自分の席の後ろに立つ同僚 colleague。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const carpet = b.mat("#3a3e48");
  const wall = b.mat("#d8d8d4");
  const ceiling = b.mat("#e8e8e4");
  const desk = b.mat("#c8c4b8");
  const part = b.mat("#6a7a8a");
  const black = b.mat("#101014");
  const glass = b.mat("#203040", { alpha: 0.35, specular: 0.9 });
  const paper = b.mat("#f4f4f0", { emissive: "#202020" });

  b.room("floor", [0, 0, 6], 12, 12, 2.7, { floor: carpet, wall, ceiling }, ["s", "e"]);
  b.wallWithGap("south", "x", [0, 0, 0], 12, 2.7, [-4, 1.6, 2.2], glass);
  b.door("glass-door", [-4.8, 0, 0], 1.6, 2.2, 0, glass, { open: true, interactive: false });
  b.box("hall-block", [3, 3, 0.2], [-4, 1.5, -1.4], wall).isVisible = false;
  b.box("hall-w", [0.2, 3, 1.4], [-5.5, 1.5, -0.7], wall).isVisible = false;
  b.box("hall-e", [0.2, 3, 1.4], [-2.5, 1.5, -0.7], wall).isVisible = false;
  b.sign("hall-sign", ["12F  営業部"], [1.2, 0.3], [-1.5, 2.2, -0.05], Math.PI, { bg: "#f0f0f0", fg: "#202020", glow: 0.4 });
  // 東の窓（夜景）
  b.box("east-glass", [0.05, 2.7, 12], [6, 1.35, 6], glass);
  b.box("east-block", [0.2, 3, 12], [6.1, 1.5, 6], wall).isVisible = false;
  for (let k = 0; k < 18; k++) {
    b.box(`city-${k}`, [0.05, 0.08, 0.15], [9 + (k % 3), 0.4 + ((k * 7) % 11) * 0.18, 1 + ((k * 5) % 12)], b.mat("#ffe0a0", { emissive: "#c0a060" }), {
      collide: false,
    });
  }

  // ---- デスクの島 ----
  for (const x of [-2.5, 2.5]) {
    b.box(`island-${x}`, [1.6, 0.72, 7], [x, 0.36, 5.5], desk);
    b.box(`island-part-${x}`, [0.04, 0.4, 7], [x, 0.92, 5.5], part, { collide: false });
    for (let i = 0; i < 4; i++) {
      for (const side of [-1, 1]) {
        b.box(`mon-${x}-${i}-${side}`, [0.05, 0.35, 0.5], [x + side * 0.35, 0.95, 2.6 + i * 1.8], black, { collide: false });
        b.box(`chair-${x}-${i}-${side}`, [0.5, 0.5, 0.5], [x + side * 1.25, 0.25, 2.6 + i * 1.8], black);
      }
    }
  }
  b.sign("my-pc", ["報告書_最終版.xlsx", "保存中…"], [0.48, 0.32], [-2.88, 0.95, 4.4], Math.PI / 2, {
    bg: "#f0f4ff",
    fg: "#203060",
    glow: 0.9,
  });
  b.sign("my-pc-b", ["おつかれさまです", "まだいますか"], [0.48, 0.32], [-2.885, 0.95, 4.4], Math.PI / 2, {
    bg: "#300808",
    fg: "#ffffff",
    glow: 0.9,
  }).setEnabled(false);

  // ---- 課長席 ----
  b.box("boss-desk", [1.6, 0.72, 0.8], [-4, 0.36, 10.5], desk);
  const chair = b.box("boss-chair", [0.6, 1.1, 0.6], [-4, 0.55, 11.3], black);
  b.register("boss-chair", chair);

  // ---- 複合機 ----
  const printer = b.box("printer", [1.0, 1.1, 0.7], [4.5, 0.55, 10.8], b.mat("#d8d8d0", { specular: 0.4 }));
  b.register("printer", printer);
  b.sign("printer-panel", ["印刷中 1/∞"], [0.3, 0.12], [4.5, 1.15, 10.44], 0, { bg: "#103010", fg: "#80ff80", glow: 0.9 });
  const prints = new TransformNode("prints", b.scene);
  for (let k = 0; k < 14; k++) {
    const sheet = b.box(`print-${k}`, [0.21, 0.005, 0.3], [4.5 + Math.sin(k * 2.3) * 0.8, 0.005 + k * 0.001, 9.8 - (k % 5) * 0.35], paper, {
      collide: false,
      parent: prints,
    });
    sheet.rotation.y = k * 0.7;
  }
  prints.setEnabled(false);
  b.register("prints", prints);
  const printFace = b.sign("print-face", ["監視カメラ 12F 02:14", "デスクの あなた と うしろの人"], [0.42, 0.3], [4.0, 0.012, 9.4], 0, {
    bg: "#f4f4f0",
    fg: "#101010",
    glow: 0.4,
  });
  printFace.rotation.x = Math.PI / 2;
  printFace.setEnabled(false);

  // ---- 照明（奥から消える3列） ----
  b.lamp("row-3", [0, 2.6, 10], "#f4f8ff", 0.45, 7, true);
  b.lamp("row-2", [0, 2.6, 6], "#f4f8ff", 0.45, 7, true);
  b.lamp("row-1", [0, 2.6, 2], "#f4f8ff", 0.45, 7, true);
  const red = b.lamp("red", [-4, 2.5, 0.6], "#40ff60", 0.3, 9, false);
  red.light.setEnabled(false);

  const colleague = b.figure(
    "colleague",
    [-5.2, 0, 4.4],
    { skin: "#a8aca8", cloth: "#2a2a34", hair: "#080808", eyes: "#000000", longHair: false },
    false,
  );
  colleague.rotation.y = Math.PI / 2;
  return undefined;
};
