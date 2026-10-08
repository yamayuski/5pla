import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜の地下街。通路は x=-3〜3, z=0〜44、天井 3.2m。西側にショーケース4つ（z=10,18,26,34）、マネキン m0〜m3（最初はケースの中で通路を向く）。
 * 東側は閉店のシャッター。z=40 に exit-shutter（最初は天井裏に上がっている）。北の突き当たりが出口階段。
 */
const ZS = [10, 18, 26, 34];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const tile = b.mat("#8a8e90", { specular: 0.4 });
  const wall = b.mat("#c8c4b4");
  const ceiling = b.mat("#6a6a6c");
  const shutterMat = b.mat("#7a7e82", { specular: 0.5 });
  const glass = b.mat("#b8d4e4", { alpha: 0.18, specular: 0.9 });
  const frame = b.mat("#2a2a2e");
  const green = b.mat("#20e060", { emissive: "#108030" });

  // ---- 通路 ----
  b.room("mall", [0, 0, 22], 6, 44, 3.2, { floor: tile, wall, ceiling }, ["s"]);
  b.box("start", [6, 0.2, 3], [0, -0.1, -1.5], tile);
  for (const [n, size, pos] of [
    ["start-w", [0.2, 4, 3], [-3, 2, -1.5]],
    ["start-e", [0.2, 4, 3], [3, 2, -1.5]],
    ["start-s", [6, 4, 0.2], [0, 2, -3]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.sign("exit-sign", ["出口", "↑"], [0.9, 0.35], [0, 2.8, 43.8], Math.PI, {
    bg: "#106030",
    fg: "#f0fff4",
    glow: 0.9,
  });
  b.box("exit-glow", [1.2, 0.05, 0.4], [0, 3.05, 43.5], green, {
    collide: false,
  });
  b.box("stairs", [3, 2.2, 0.4], [0, 1.1, 43.6], b.mat("#aaa89c"));

  // ---- 東側の閉店シャッター ----
  for (const [i, z] of [4, 10, 16, 22, 28, 34].entries()) {
    b.box(`shutter-${i}`, [0.12, 2.6, 4.6], [2.9, 1.3, z], shutterMat, {
      collide: false,
    });
    b.sign(
      `closed-${i}`,
      ["本日は", "閉店"],
      [0.6, 0.4],
      [2.82, 1.7, z],
      Math.PI / 2,
      {
        bg: "#f0e8d0",
        fg: "#a01010",
        glow: 0.3,
      },
    );
  }

  // ---- 西側のショーケースとマネキン ----
  for (const [i, z] of ZS.entries()) {
    b.box(`case-base-${i}`, [1.4, 0.2, 1.8], [-2.3, 0.1, z], frame);
    b.box(`case-top-${i}`, [1.4, 0.1, 1.8], [-2.3, 2.6, z], frame, {
      collide: false,
    });
    b.box(`case-glass-${i}`, [0.04, 2.4, 1.8], [-1.62, 1.4, z], glass, {
      collide: false,
    });
    b.sign(
      `case-label-${i}`,
      ["AUTUMN", "NEW"],
      [0.5, 0.25],
      [-1.6, 2.3, z],
      -Math.PI / 2,
      {
        bg: "#101014",
        fg: "#f0e0a0",
        glow: 0.6,
      },
    );
    const m = b.figure(
      `m${i}`,
      [-2.5, 0.2, z],
      {
        skin: "#e4e0d8",
        hair: "#e4e0d8",
        cloth: i % 2 ? "#4a5a7a" : "#8a4a4a",
        eyes: "#e4e0d8",
        height: 1.05,
        longHair: false,
      },
      i !== 3,
    );
    m.rotation.y = Math.PI / 2;
  }

  // ---- 出口のシャッター（最初は天井側へ上げておく） ----
  const sh = b.box("exit-shutter", [6, 3.2, 0.2], [0, 4.8, 40], shutterMat);
  b.register("exit-shutter", sh);

  // ---- 照明（蛍光灯） ----
  for (const z of [6, 16, 26, 36]) {
    b.lamp("tube", [0, 3.0, z], "#e8f4ff", 0.6, 11, true);
  }
  b.lamp("exit-lamp", [0, 2.6, 42], "#40ff90", 0.3, 5, false);
  return {};
};
