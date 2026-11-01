import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 商店街の角の無人ATMコーナー。中は x=-2.5〜2.5, z=0〜4、南面（z=0）がガラスで中央に自動ドア glass-door。
 * 北壁に ATM 3台（atm-1/2/3、x=-1.5/0/1.5）、東壁に警備会社直通のインターホン interphone（x=2.4, z=2）。
 * 外は歩道（z=-4〜0）と街灯 street。閉店時にガラス面の外へシャッター shutter が下りる。
 * outside は外に立つ人影（一瞬だけ）、woman は最後に背後に立つ女。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const tile = b.mat("#9a9a94");
  const wall = b.mat("#d8d8d0");
  const ceiling = b.mat("#e8e8e0");
  const glass = b.mat("#1a2a30", { alpha: 0.35, specular: 0.9 });
  const atmBody = b.mat("#7a8088", { specular: 0.5 });
  const pavement = b.mat("#2a2a2c");
  const shutterMat = b.mat("#6a6e70", { specular: 0.3 });
  const dark = b.mat("#0a0a0a");

  b.room("booth", [0, 0, 2], 5, 4, 2.8, { floor: tile, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 5, 2.8, [0, 1.4, 2.3], glass);
  b.door("glass-door", [-0.7, 0, 0], 1.4, 2.3, 0, glass, {
    open: false,
    interactive: false,
  });
  // 外の歩道（自動ドアが開いても外には出られない：歩道の外周は見えない壁）
  b.box("sidewalk", [9, 0.2, 4], [0, -0.1, -2], pavement);
  for (const [n, size, pos] of [
    ["side-s", [9, 4, 0.2], [0, 2, -4]],
    ["side-w", [0.2, 4, 4], [-4.5, 2, -2]],
    ["side-e", [0.2, 4, 4], [4.5, 2, -2]],
  ] as const) {
    b.box(n, size, pos, dark).isVisible = false;
  }
  b.box("door-block", [1.6, 3, 0.1], [0, 1.5, -0.35], dark).isVisible = false;
  b.cylinder("street-pole", 4, 0.12, [3.5, 2, -3.2], dark, { collide: false });
  b.lamp("street", [3.5, 3.9, -3.2], "#ffd0a0", 0.5, 9, true);

  // ---- シャッター（最初は上に巻き上げてある） ----
  const shutter = b.box("shutter", [5.4, 2.8, 0.08], [0, 4.3, -0.25], shutterMat, {
    collide: false,
  });
  b.register("shutter", shutter);
  b.box("shutter-box", [5.6, 0.4, 0.4], [0, 3.0, -0.25], shutterMat, {
    collide: false,
  });

  // ---- ATM ----
  const screenColors = { bg: "#0a3070", fg: "#ffffff", glow: 0.9 };
  for (const [i, x] of [-1.5, 0, 1.5].entries()) {
    const n = i + 1;
    const body = b.box(`atm-${n}`, [1.0, 1.5, 0.7], [x, 0.75, 3.6], atmBody);
    b.register(`atm-${n}`, body);
    b.box(`atm-${n}-hood`, [1.0, 0.5, 0.4], [x, 1.75, 3.75], atmBody, {
      collide: false,
    });
  }
  const sign = (name: string, lines: string[], x: number, depth: number, colors = screenColors) =>
    b.sign(name, lines, [0.6, 0.38], [x, 1.38, 3.24 - depth], 0, colors);
  sign("scr-1-idle", ["いらっしゃいませ", "カードを入れてください"], -1.5, 0);
  sign("scr-1-done", ["カードと明細を", "お取り忘れなく"], -1.5, 0.004).setEnabled(false);
  sign("scr-2-idle", ["いらっしゃいませ"], 0, 0);
  sign("scr-3-off", ["休止中"], 1.5, 0, { bg: "#202020", fg: "#808080", glow: 0.3 });
  sign("scr-3-on", ["お引き出し 完了", "残高 0円"], 1.5, 0.004, screenColors).setEnabled(false);
  const warn = { bg: "#400808", fg: "#ffffff", glow: 0.9 };
  sign("scr-1-last", ["うしろの方も", "お引き出しですか"], -1.5, 0.008, warn).setEnabled(false);
  sign("scr-2-last", ["うしろの方も", "お引き出しですか"], 0, 0.004, warn).setEnabled(false);
  sign("scr-3-last", ["うしろの方も", "お引き出しですか"], 1.5, 0.008, warn).setEnabled(false);
  b.sign("hours", ["ご利用時間 7:00〜24:00", "24:00 にシャッターが閉まります"], [1.8, 0.4], [-1.2, 2.3, 3.88], 0, {
    bg: "#f0f0e8",
    fg: "#202020",
    glow: 0.3,
  });

  // ---- インターホン ----
  const intercom = b.box("interphone", [0.1, 0.35, 0.25], [2.44, 1.4, 2], b.mat("#e0e0d8", { emissive: "#202010" }));
  b.register("interphone", intercom);
  b.sign("interphone-label", ["緊急時・お問い合わせ", "警備センター直通"], [0.6, 0.2], [2.38, 1.75, 2], Math.PI / 2, {
    bg: "#c01818",
    fg: "#ffffff",
    glow: 0.5,
  });
  b.box("camera", [0.15, 0.15, 0.25], [2.3, 2.6, 0.3], dark, {
    collide: false,
  });

  // ---- 照明 ----
  b.lamp("booth", [-1, 2.6, 2], "#f4f8ff", 0.55, 6, true);
  b.lamp("booth", [1.2, 2.6, 2], "#f4f8ff", 0.55, 6, true);
  const red = b.lamp("red", [0, 2.6, 3.4], "#ff2010", 0.35, 6, true);
  red.light.setEnabled(false);

  // ---- 人影 ----
  b.figure(
    "outside",
    [-1.6, 0, -1.4],
    { skin: "#b0b4b0", cloth: "#d8d4cc", hair: "#050505", eyes: "#000000" },
    false,
  );
  b.figure(
    "woman",
    [0, 0, 1],
    { skin: "#c8ccc8", cloth: "#d8d4cc", hair: "#050505", eyes: "#300000" },
    false,
  );
  return undefined;
};
