import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 深夜のゲームセンターのプリクラコーナー。x=-6〜6, z=0〜9、天井 3m。入口(z=0)の自動ドアが gate。
 * 北の壁(z=8〜9)に4台のプリクラ機(中心 x=-4.8,-1.6,1.6,4.8)。各機の中に撮影ボタン(shutter-N)と
 * 出力されたプリント(print-N、最初は非表示)。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const carpet = b.mat("#2a1c3a");
  const wall = b.mat("#3a2850");
  const ceiling = b.mat("#18101e");
  const glass = b.mat("#b8d8e8", { alpha: 0.2, specular: 0.8 });
  const pink = b.mat("#d85ca8", { emissive: "#701850" });
  const booth = b.mat("#f0d8f0", { specular: 0.3 });
  const cabinet = b.mat("#303060", { emissive: "#101030" });
  const screen = b.mat("#8ac8f0", { emissive: "#3070a0" });

  b.room("hall", [0, 0, 4.5], 12, 9, 3, { floor: carpet, wall, ceiling }, [
    "s",
  ]);
  b.wallWithGap("front", "x", [0, 0, 0], 12, 3, [0, 2.4, 2.4], wall);
  b.door("gate", [-1.2, 0, 0], 2.4, 2.4, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("street", [12, 0.2, 4], [0, -0.1, -2], carpet);
  for (const [n, size, pos] of [
    ["street-w", [0.2, 4, 4], [-6, 2, -2]],
    ["street-e", [0.2, 4, 4], [6, 2, -2]],
    ["street-s", [12, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.sign(
    "title",
    ["プリ★クラ", "思い出を 4まい"],
    [3.2, 0.8],
    [0, 2.4, 0.12],
    0,
    {
      bg: "#d85ca8",
      fg: "#fff8ff",
      glow: 0.7,
    },
  );

  // ---- 手前の筐体（飾り） ----
  for (const [i, x] of [-4.5, -2.2, 2.2, 4.5].entries()) {
    b.box(`cab-${i}`, [1.2, 1.8, 0.8], [x, 0.9, 2.6], cabinet);
    b.box(`cab-screen-${i}`, [1.0, 0.6, 0.05], [x, 1.4, 2.19], screen, {
      collide: false,
    });
  }

  // ---- プリクラ4台 ----
  const xs = [-4.8, -1.6, 1.6, 4.8];
  const printLines: string[][] = [
    ["♥ ピース ♥", "(＾ー＾)"],
    ["♥ ピース ♥", "(＾ー＾)　　　▓"],
    ["(＾ー＾)", "▓▓ すぐ後ろ ▓▓"],
    ["(＾ー＾)", "｜ ◉　◉ ｜"],
  ];
  for (const [i, cx] of xs.entries()) {
    b.room(
      `booth-${i}`,
      [cx, 0, 7.6],
      2.4,
      1.6,
      2.4,
      { floor: pink, wall: booth, ceiling: booth },
      ["s"],
    );
    b.box(`booth-top-${i}`, [2.4, 0.5, 0.1], [cx, 2.65, 6.8], pink, {
      collide: false,
    });
    b.sign(`booth-no-${i}`, [`${i + 1}号機`], [0.8, 0.3], [cx, 2.65, 6.74], 0, {
      bg: "#701850",
      fg: "#fff0ff",
      glow: 0.7,
    });
    const btn = b.box(
      `shutter-${i + 1}`,
      [0.25, 0.25, 0.1],
      [cx + 0.8, 1.2, 8.35],
      b.mat("#e82820", { emissive: "#c01810" }),
      { collide: false },
    );
    b.register(`shutter-${i + 1}`, btn);
    b.box(`mirror-${i}`, [1.0, 0.8, 0.04], [cx - 0.3, 1.5, 8.37], screen, {
      collide: false,
    });
    b.sign(
      `print-${i + 1}`,
      printLines[i] ?? [],
      [0.7, 0.5],
      [cx - 0.3, 1.5, 8.32],
      0,
      {
        bg: "#fff4f8",
        fg: i >= 2 ? "#a01020" : "#a02070",
        glow: 0.6,
      },
    ).setEnabled(false);
    if (i === 1 || i === 2) {
      b.lamp("booth", [cx, 2.3, 7.4], "#ffb0e0", 0.5, 5, false);
    }
  }

  b.lamp("arc", [-3, 2.8, 2], "#c070ff", 0.45, 9, true);
  b.lamp("arc", [3, 2.8, 2], "#60a0ff", 0.45, 9, true);

  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c8c8d0",
      hair: "#060606",
      cloth: "#e8e8f0",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  return {};
};
