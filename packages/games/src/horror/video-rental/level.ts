import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 閉店後のレンタルビデオ店。x=-5〜5, z=0〜14、天井 3m。南(z=0)の shop-door が出入口。
 * 棚が3列(x=-3,0,3 付近)、北(z=13)のカウンターにテレビ(tv-0〜tv-3 の看板を切り替え)とビデオデッキ(vcr)。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#4a4048", { specular: 0.3 });
  const wall = b.mat("#6a5a64");
  const ceiling = b.mat("#2a242a");
  const shelf = b.mat("#3a3a44");
  const counter = b.mat("#5a4030");
  const glass = b.mat("#b8d8e8", { alpha: 0.2, specular: 0.8 });
  const neon = b.mat("#e84898", { emissive: "#a01860" });

  b.room("shop", [0, 0, 7], 10, 14, 3, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 10, 3, [0, 1.8, 2.4], wall);
  b.door("shop-door", [-0.9, 0, 0], 1.8, 2.4, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("street", [10, 0.2, 4], [0, -0.1, -2], floor);
  for (const [n, size, pos] of [
    ["street-w", [0.2, 4, 4], [-5, 2, -2]],
    ["street-e", [0.2, 4, 4], [5, 2, -2]],
    ["street-s", [10, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.sign(
    "shop-sign",
    ["ビデオレンタル", "新作 旧作 ホラー"],
    [3, 0.8],
    [0, 2.4, 0.12],
    0,
    {
      bg: "#301030",
      fg: "#ff90d0",
      glow: 0.7,
    },
  );
  b.box("neon-bar", [3.2, 0.08, 0.1], [0, 2.9, 0.15], neon, { collide: false });

  // ---- 棚 ----
  for (const [i, x] of [-3, 0, 3].entries()) {
    b.box(`shelf-${i}`, [0.5, 2.0, 7], [x, 1.0, 6.5], shelf);
    for (let k = 0; k < 6; k++) {
      b.box(
        `tapes-${i}-${k}`,
        [0.52, 0.12, 6.6],
        [x, 0.4 + k * 0.3, 6.5],
        b.mat(k % 2 ? "#a03030" : "#303030"),
        {
          collide: false,
        },
      );
    }
  }
  b.sign("genre", ["ホラー"], [1.0, 0.3], [-3, 2.3, 3.0], Math.PI, {
    bg: "#300808",
    fg: "#ff4040",
    glow: 0.6,
  });

  // ---- カウンターとテレビ ----
  b.box("counter", [5, 1.0, 0.9], [0, 0.5, 12], counter);
  const vcr = b.box(
    "vcr",
    [0.6, 0.12, 0.4],
    [1.5, 1.06, 12],
    b.mat("#18181c", { emissive: "#101820" }),
    {
      collide: false,
    },
  );
  b.register("vcr", vcr);
  const tvBody = b.box(
    "tv-body",
    [1.6, 1.2, 0.5],
    [-0.8, 1.6, 12.2],
    b.mat("#18181c"),
    {
      collide: false,
    },
  );
  const screens = [
    { lines: ["▒▒▒▒▒", "▒▒ ▒▒▒"], bg: "#202428", fg: "#808890" },
    { lines: ["録画 02:11", "▯ 通路に立つ人"], bg: "#10181c", fg: "#b0e0d0" },
    { lines: ["録画 02:14", "▯　▮ 後ろに誰か"], bg: "#10181c", fg: "#e0d0a0" },
    { lines: ["● REC 現在", "▯▮ すぐ後ろ"], bg: "#200808", fg: "#ff5050" },
  ];
  for (const [i, s] of screens.entries()) {
    const m = b.sign(`tv-${i}`, s.lines, [1.3, 0.9], [-0.8, 1.6, 11.93], 0, {
      bg: s.bg,
      fg: s.fg,
      glow: 0.8,
    });
    m.setEnabled(i === 0);
  }
  b.register("tv", tvBody);

  // ---- 照明 ----
  b.lamp("shop", [-2, 2.7, 4], "#f0d8e8", 0.45, 9, true);
  b.lamp("shop", [2, 2.7, 4], "#f0d8e8", 0.45, 9, true);
  b.lamp("shop", [0, 2.7, 9], "#f0d8e8", 0.45, 9, true);
  b.lamp("tv", [-0.8, 1.6, 10.8], "#90c0ff", 0.5, 6, false);

  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#b8bcb8",
      hair: "#060606",
      cloth: "#d8d8d0",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  return {};
};
