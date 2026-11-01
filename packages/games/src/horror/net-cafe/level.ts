import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 深夜のネットカフェのブース列。フロアは x=-4〜4, z=0〜14、通路は x=-0.6〜0.6。
 * 両側に高さ1.9mの仕切りで区切ったブース（z=2m刻み）。自分の席 C-14 は東側 z=6〜8、
 * 机とPC pc（x=3.6, z=7）。隣の C-15（z=8〜10）は「空室」。南端に出入口 exit-door、北端にドリンクバー drink-bar。
 * 最後は C-15 側から仕切りの上に顔を出す peeker が現れる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const carpet = b.mat("#1c2230");
  const wall = b.mat("#2a2e38");
  const ceiling = b.mat("#14161c");
  const panel = b.mat("#4a4e5a");
  const desk = b.mat("#3a3026");
  const black = b.mat("#0a0a0c");
  const seat = b.mat("#5a1c1c");

  b.room("floor", [0, 0, 7], 8, 14, 2.6, { floor: carpet, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 8, 2.6, [0, 1.1, 2.1], wall);
  b.door("exit-door", [-0.55, 0, 0], 1.1, 2.1, 0, b.mat("#5a5e68", { specular: 0.4 }), {
    open: true,
    interactive: false,
  });
  // 扉の外（受付側）は見えない壁で行き止まり
  b.box("lobby-block", [3, 3, 0.2], [0, 1.5, -1.6], wall).isVisible = false;
  b.box("lobby-w", [0.2, 3, 1.6], [-1.4, 1.5, -0.8], wall).isVisible = false;
  b.box("lobby-e", [0.2, 3, 1.6], [1.4, 1.5, -0.8], wall).isVisible = false;
  b.sign("exit-sign", ["受付・出口"], [1, 0.25], [0, 2.35, 0.12], Math.PI, {
    bg: "#0a3a1a",
    fg: "#b0ffb0",
    glow: 0.8,
  });

  // ---- ブースの仕切り ----
  for (const side of [-1, 1]) {
    const cx = side * 2.3;
    for (let z = 0; z <= 14; z += 2) {
      b.box(`part-${side}-${z}`, [3.4, 1.9, 0.06], [cx, 0.95, Math.max(0.05, Math.min(13.95, z))], panel);
    }
    for (let z = 1; z < 14; z += 2) {
      // ブースの入口の低い縁と、机・椅子・モニター
      b.box(`desk-${side}-${z}`, [0.6, 0.72, 1.6], [side * 3.6, 0.36, z], desk);
      b.box(`chair-${side}-${z}`, [0.6, 0.45, 0.6], [side * 2.6, 0.23, z], seat);
      if (!(side === 1 && z === 7)) {
        b.box(`mon-${side}-${z}`, [0.06, 0.4, 0.6], [side * 3.75, 0.98, z], black, {
          collide: false,
        });
      }
    }
  }
  // 通路側に出た仕切りの端を、ブースの奥へ入りすぎないように見えない壁で塞ぐ（自分の席以外）
  for (let z = 1; z < 14; z += 2) {
    for (const side of [-1, 1]) {
      if (side === 1 && z === 7) {
        continue;
      }
      b.box(`curtain-${side}-${z}`, [0.04, 1.9, 1.94], [side * 0.62, 0.95, z], b.mat("#20242c", { alpha: 0.85 }));
    }
  }
  b.sign("label-c14", ["C-14"], [0.4, 0.18], [0.64, 1.75, 6.5], -Math.PI / 2, {
    bg: "#e8e8e0",
    fg: "#111",
    glow: 0.3,
  });
  b.sign("label-c15", ["C-15 空室"], [0.5, 0.18], [0.64, 1.75, 8.6], -Math.PI / 2, {
    bg: "#e8e8e0",
    fg: "#111",
    glow: 0.3,
  });

  // ---- 自分の PC（-x を向く画面） ----
  const pc = b.box("pc", [0.08, 0.46, 0.7], [3.78, 1.0, 7], black, {
    collide: false,
  });
  b.register("pc", pc);
  const screens = [
    b.sign("screen-off", [""], [0.62, 0.38], [3.73, 1.0, 7], Math.PI / 2, {
      bg: "#050608",
      fg: "#050608",
      glow: 0,
    }),
    b.sign("screen-on", ["ようこそ C-14 席へ", "ナイトパック 6時間"], [0.62, 0.38], [3.72, 1.0, 7], Math.PI / 2, {
      bg: "#1a3a6a",
      fg: "#ffffff",
      glow: 0.9,
    }),
    b.sign("screen-chat", ["新着メッセージ（C-15）", "となり、いますよね"], [0.62, 0.38], [3.71, 1.0, 7], Math.PI / 2, {
      bg: "#f0f0f0",
      fg: "#202020",
      glow: 0.9,
    }),
    b.sign("screen-last", ["新着メッセージ（C-15）", "うえ"], [0.62, 0.38], [3.7, 1.0, 7], Math.PI / 2, {
      bg: "#300808",
      fg: "#ff4040",
      glow: 0.9,
    }),
  ];
  for (const s of screens.slice(1)) {
    s.setEnabled(false);
  }

  // ---- ドリンクバー ----
  const bar = b.box("drink-bar", [1.6, 1.4, 0.6], [0, 0.7, 13.6], b.mat("#8a8a90", { specular: 0.5 }));
  b.register("drink-bar", bar);
  b.sign("bar-sign", ["ドリンクバー"], [1.2, 0.25], [0, 1.7, 13.28], Math.PI, {
    bg: "#103050",
    fg: "#ffffff",
    glow: 0.6,
  });

  // ---- 照明 ----
  b.lamp("aisle", [0, 2.4, 3], "#e8ecff", 0.35, 6, true);
  b.lamp("aisle", [0, 2.4, 10], "#e8ecff", 0.35, 6, true);
  b.lamp("desk", [3.2, 1.6, 7], "#fff0d8", 0.3, 3, false);
  const red = b.lamp("red", [0, 2.4, 7], "#ff2010", 0.4, 9, true);
  red.light.setEnabled(false);

  // ---- 通路を横切る影と、仕切りの上から覗く顔 ----
  const walker = b.figure(
    "walker",
    [0, 0, 11],
    { skin: "#b8bab8", cloth: "#202024", hair: "#050505", eyes: "#000000" },
    false,
  );
  walker.rotation.y = Math.PI;
  b.figure(
    "peeker",
    [2.6, 0.2, 8.45],
    { skin: "#c8ccc8", cloth: "#18181c", hair: "#050505", eyes: "#300000", height: 1.33 },
    false,
  ).rotation.y = Math.PI;
  return undefined;
};
