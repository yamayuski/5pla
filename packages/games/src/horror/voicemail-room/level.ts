import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 一人暮らしのリビング。x=-3.5〜3.5, z=0〜8、天井 2.5m。南(z=0)の front-door が玄関。
 * 東壁沿いの棚の上に留守番電話(answer-machine)。メッセージ再生ボタン msg-1 / msg-2 / msg-3 が z=3.0 / 3.5 / 4.0 に並ぶ。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#a89878", { specular: 0.3 });
  const wall = b.mat("#d8d0bc");
  const ceiling = b.mat("#c8c0ac");
  const doorMat = b.mat("#6a5440");
  const sofa = b.mat("#4a5a6a");
  const wood = b.mat("#6a4a30");

  b.room("living", [0, 0, 4], 7, 8, 2.5, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 7, 2.5, [-2, 1.0, 2.1], wall);
  b.door("front-door", [-2.5, 0, 0], 1.0, 2.1, 0, doorMat, {
    open: true,
    interactive: false,
  });
  b.box("hall", [7, 0.2, 4], [0, -0.1, -2], floor);
  for (const [n, size, pos] of [
    ["hall-w", [0.2, 3, 4], [-3.5, 1.5, -2]],
    ["hall-e", [0.2, 3, 4], [3.5, 1.5, -2]],
    ["hall-s", [7, 3, 0.2], [0, 1.5, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }

  // ---- 家具 ----
  b.box("sofa", [2.2, 0.8, 0.9], [-1.0, 0.4, 6.8], sofa);
  b.box("tv-stand", [1.6, 0.5, 0.5], [-1.0, 0.25, 0.8], wood);
  b.box("shelf", [0.6, 1.0, 3.2], [3.15, 0.5, 3.6], wood);
  b.box(
    "machine",
    [0.4, 0.18, 0.7],
    [3.1, 1.1, 3.5],
    b.mat("#202428", { emissive: "#101418" }),
    {
      collide: false,
    },
  );
  for (const [i, z] of [3.1, 3.5, 3.9].entries()) {
    const btn = b.box(
      `msg-${i + 1}`,
      [0.12, 0.06, 0.1],
      [2.98, 1.2, z],
      b.mat(i === 2 ? "#e82820" : "#e8e8e8", {
        emissive: i === 2 ? "#901810" : "#404848",
      }),
      { collide: false },
    );
    b.register(`msg-${i + 1}`, btn);
  }
  b.sign("note", ["留守電", "3 件"], [0.5, 0.3], [3.4, 1.6, 3.5], Math.PI / 2, {
    bg: "#f8f4d8",
    fg: "#a01818",
    glow: 0.5,
  });
  b.sign(
    "photo",
    ["家族写真", "（顔の部分だけ濡れている）"],
    [0.9, 0.6],
    [-3.4, 1.6, 4.5],
    -Math.PI / 2,
    {
      bg: "#d8d0c0",
      fg: "#303030",
      glow: 0.3,
    },
  );

  // ---- 照明 ----
  b.lamp("room", [0, 2.3, 3], "#ffe8c8", 0.45, 9, true);
  b.lamp("room", [0, 2.3, 6.5], "#ffe8c8", 0.4, 9, true);

  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c0c4c4",
      hair: "#060606",
      cloth: "#d8d8d4",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  return {};
};
