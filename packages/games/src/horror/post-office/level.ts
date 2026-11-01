import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 町の小さな郵便局の奥（夜間の区分作業）。室内は x=-4〜4, z=0〜10。
 * 南（z=1.5）に窓口カウンターと下ろしたシャッター、窓口の呼び鈴 counter-bell。中央に作業台と郵便物の箱 tray（0, z=4）。
 * 北側に区分棚 shelf-a（z=6.5）、shelf-b（z=8.5）、通路の奥に人影 mailman。東壁に通用口 staff-door（x=4, z=4）。
 * 西壁に夜間投函口 slot。差出人不明の小包 parcel は作業台の端に現れる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#5a5a52");
  const wall = b.mat("#b8b8a8");
  const ceiling = b.mat("#d0d0c4");
  const counter = b.mat("#6a4a30");
  const shelfMat = b.mat("#7a6a50");
  const shutterMat = b.mat("#8a8e90", { specular: 0.3 });
  const paper = b.mat("#e8e4d8", { emissive: "#101010" });
  const red = b.mat("#c01818", { specular: 0.3 });
  const dark = b.mat("#050505");

  b.room("office", [0, 0, 5], 8, 10, 2.8, { floor, wall, ceiling }, ["e"]);
  b.wallWithGap("east", "z", [4, 0, 5], 10, 2.8, [-1, 1, 2.1], wall);
  b.door("staff-door", [4, 0, 3.5], 1, 2.1, -Math.PI / 2, b.mat("#4a5a6a"), {
    open: true,
    interactive: false,
  });
  b.box("out-block", [0.2, 3, 2], [5.4, 1.5, 4], dark).isVisible = false;
  b.box("out-n", [1.4, 3, 0.2], [4.7, 1.5, 5], dark).isVisible = false;
  b.box("out-s", [1.4, 3, 0.2], [4.7, 1.5, 3], dark).isVisible = false;

  // ---- 窓口 ----
  b.box("counter", [8, 1.05, 0.7], [0, 0.53, 1.5], counter);
  b.box("shutter", [8, 1.75, 0.06], [0, 1.93, 1.2], shutterMat, {
    collide: false,
  });
  const bell = b.cylinder("counter-bell", 0.08, 0.14, [-2, 1.1, 1.6], b.mat("#c8b060", { specular: 0.8 }), {
    collide: false,
  });
  b.register("counter-bell", bell);
  b.sign("hours", ["窓口 9:00〜17:00", "ゆうゆう窓口は本局へ"], [1.6, 0.4], [2, 2.4, 1.16], 0, {
    bg: "#f0f0e8",
    fg: "#c01818",
    glow: 0.3,
  });

  // ---- 作業台と郵便物 ----
  b.box("table", [2.4, 0.85, 1.2], [0, 0.43, 4], b.mat("#8a8a80"));
  const tray = b.box("tray", [0.6, 0.18, 0.4], [-0.5, 0.94, 4], b.mat("#3a6aa0"), {
    collide: false,
  });
  b.register("tray", tray);
  for (let k = 0; k < 5; k++) {
    b.box(`letter-${k}`, [0.22, 0.01, 0.12], [-0.6 + (k % 3) * 0.1, 1.04 + k * 0.012, 3.95 + (k % 2) * 0.05], paper, {
      collide: false,
    });
  }
  const parcel = b.box("parcel", [0.4, 0.28, 0.3], [0.7, 1.0, 4], b.mat("#a07a48"), {
    collide: false,
  });
  parcel.setEnabled(false);
  b.register("parcel", parcel);
  b.sign("parcel-label", ["宛先：あなた", "差出人：うしろ"], [0.36, 0.2], [0.7, 1.15, 3.84], 0, {
    bg: "#f0ead8",
    fg: "#202020",
    glow: 0.4,
  }).setEnabled(false);

  // ---- 区分棚（2列、宛名ラベルは差し替え用に2枚重ね） ----
  for (const [n, z] of [
    ["shelf-a", 6.5],
    ["shelf-b", 8.5],
  ] as const) {
    b.box(n, [6, 2.1, 0.5], [-1, 1.05, z], shelfMat);
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 5; row++) {
        b.box(`${n}-hole-${col}-${row}`, [0.6, 0.3, 0.05], [-3.65 + col * 0.75, 0.35 + row * 0.38, z - 0.26], dark, {
          collide: false,
        });
      }
    }
  }
  b.sign("labels-a", ["一丁目  二丁目  三丁目  四丁目"], [5.6, 0.25], [-1, 2.25, 6.22], 0, {
    bg: "#f0f0e0",
    fg: "#202020",
    glow: 0.3,
  });
  b.sign("labels-b", ["あなた  あなた  あなた  あなた"], [5.6, 0.25], [-1, 2.25, 6.21], 0, {
    bg: "#f0f0e0",
    fg: "#a01010",
    glow: 0.4,
  }).setEnabled(false);

  // ---- 夜間投函口 ----
  const slot = b.box("slot", [0.06, 0.06, 0.4], [-3.95, 1.2, 4], red, {
    collide: false,
  });
  b.register("slot", slot);
  const dropped = b.box("dropped-letter", [0.22, 0.01, 0.12], [-3.6, 0.01, 4.1], paper, {
    collide: false,
  });
  dropped.setEnabled(false);
  b.register("dropped-letter", dropped);

  // ---- 照明 ----
  b.lamp("office", [0, 2.6, 4], "#f0f6ff", 0.6, 8, true);
  b.lamp("office", [-1, 2.6, 7.5], "#f0f6ff", 0.4, 6, true);
  const red2 = b.lamp("red", [3.6, 2.5, 4], "#40ff60", 0.3, 7, true);
  red2.light.setEnabled(false);

  // ---- 区分棚の奥の配達員 ----
  const mailman = b.figure(
    "mailman",
    [-3.5, 0, 7.5],
    { skin: "#a8acaa", cloth: "#1a2a4a", hair: "#080808", eyes: "#000000", longHair: false },
    false,
  );
  mailman.rotation.y = Math.PI / 2;
  return undefined;
};
