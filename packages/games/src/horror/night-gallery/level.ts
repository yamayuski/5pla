import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 閉館後の美術館の長い展示室。x=-5〜5, z=0〜26、天井 4m。入口(z=0)の自動ドアが exit-door。
 * 西壁(x=-5)と東壁(x=5)に肖像画（sign）、突き当たり(z=26)に「婦人像」(lady-portrait)。
 * 中央に彫像(statue)。落ちる額縁(fallen)は最初は非表示。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#3a3028", { specular: 0.4 });
  const wall = b.mat("#7a2c30");
  const ceiling = b.mat("#2a2420");
  const gold = b.mat("#b8902c", { specular: 0.6 });
  const stone = b.mat("#b8b4a8");
  const glass = b.mat("#b8d8e8", { alpha: 0.2, specular: 0.8 });
  const dark = b.mat("#101010");

  // ---- 展示室 ----
  b.room("hall", [0, 0, 13], 10, 26, 4, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 10, 4, [0, 1.8, 2.6], wall);
  b.door("exit-door", [-0.9, 0, 0], 1.8, 2.6, 0, glass, {
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
  b.box("bench-a", [2.4, 0.45, 0.6], [0, 0.23, 8], dark);
  b.box("bench-b", [2.4, 0.45, 0.6], [0, 0.23, 20], dark);
  b.box("rope-a", [0.05, 0.9, 6], [-2.2, 0.45, 8], gold, { collide: false });

  // ---- 受付パネル ----
  const panel = b.box(
    "check-panel",
    [0.5, 0.7, 0.1],
    [3.6, 1.3, 1.0],
    b.mat("#204060", { emissive: "#304860" }),
    { collide: false },
  );
  b.register("check-panel", panel);

  // ---- 肖像画（目が開く） ----
  const frame = (name: string, x: number, z: number, w: number, h: number) => {
    b.box(`${name}-frame`, [0.12, h + 0.3, w + 0.3], [x, 2.0, z], gold, {
      collide: false,
    });
  };
  const portrait = (
    name: string,
    lines: string[],
    x: number,
    z: number,
    rotY: number,
    open: boolean,
  ) => {
    const inward = x < 0 ? 0.08 : -0.08;
    const s = b.sign(name, lines, [1.2, 1.6], [x + inward, 2.0, z], rotY, {
      bg: open ? "#2a1a10" : "#3a2818",
      fg: open ? "#f0e8c0" : "#a88c60",
      glow: open ? 0.45 : 0.2,
    });
    s.setEnabled(!open);
    return s;
  };
  for (const [n, x, z] of [
    ["a", -5, 6],
    ["b", 5, 9],
    ["c", -5, 13],
    ["d", 5, 16],
  ] as const) {
    frame(`pf-${n}`, x, z, 1.2, 1.6);
    const rot = x < 0 ? -Math.PI / 2 : Math.PI / 2;
    portrait(`portrait-${n}`, ["━　━", "　▽　", "紳士像"], x, z, rot, false);
    if (n === "a" || n === "b") {
      portrait(
        `portrait-${n}-open`,
        ["◉　◉", "　▽　", "紳士像"],
        x,
        z,
        rot,
        true,
      );
    }
  }
  // 落ちた額縁（c）
  const fallen = b.box("fallen", [1.4, 0.1, 1.8], [-3.2, 0.06, 13], gold, {
    collide: false,
  });
  b.register("fallen", fallen);
  fallen.setEnabled(false);

  // ---- 突き当たりの婦人像 ----
  b.box("lf-frame", [2.0, 3.0, 0.12], [0, 2.0, 25.9], gold, { collide: false });
  b.sign(
    "lady-portrait",
    ["婦人像", "　", "作者不詳"],
    [1.7, 2.6],
    [0, 2.0, 25.8],
    0,
    {
      bg: "#20241c",
      fg: "#c8c0a0",
      glow: 0.35,
    },
  );
  const empty = b.sign(
    "lady-empty",
    ["　", "（ 空 ）", "　"],
    [1.7, 2.6],
    [0, 2.0, 25.8],
    0,
    {
      bg: "#050504",
      fg: "#201814",
      glow: 0.1,
    },
  );
  empty.setEnabled(false);

  // ---- 彫像 ----
  const statue = b.figure(
    "statue",
    [3.2, 0, 21],
    {
      skin: "#c8c4b8",
      hair: "#a8a498",
      cloth: "#b8b4a8",
      eyes: "#202020",
      height: 1.1,
    },
    false,
  );
  statue.rotation.y = Math.PI;
  b.cylinder("statue-plinth", 0.3, 0.9, [3.2, 0.15, 21], stone, {
    collide: false,
  });

  // ---- 照明 ----
  b.lamp("hall", [0, 3.6, 5], "#ffe0b0", 0.55, 10, true);
  b.lamp("hall", [0, 3.6, 13], "#ffe0b0", 0.55, 10, true);
  b.lamp("hall", [0, 3.6, 21], "#ffe0b0", 0.55, 10, true);

  // ---- ジャンプスケア用の別人形 ----
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#b8bcb0",
      hair: "#0a0a08",
      cloth: "#2a3028",
      eyes: "#000000",
      height: 1.05,
      longHair: true,
    },
    false,
  );
  return {};
};
