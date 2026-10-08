import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜の理科室。x=-5〜5, z=0〜14、天井 3.2m。南(z=0)に lab-door。実験台が2列、東壁に標本棚、北に教卓。
 * 机の上のノート(notebook, z=9)、標本瓶の目(jar-eye-0/1 と開いた jar-open-0/1)、人体骨格(skeleton)、
 * 棚の中央の大きな標本瓶(big-jar, x=4.6, z=11)。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#7a7a70", { specular: 0.3 });
  const wall = b.mat("#b8baa8");
  const ceiling = b.mat("#8a8c80");
  const wood = b.mat("#5a4a38");
  const black = b.mat("#18201c");
  const door = b.mat("#6a5a48");
  const jarGlass = b.mat("#98c8a0", { alpha: 0.35, specular: 0.7 });
  const bone = b.mat("#d8d4c0", { emissive: "#18160e" });

  b.room("lab", [0, 0, 7], 10, 14, 3.2, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 10, 3.2, [-3, 1.0, 2.1], wall);
  b.door("lab-door", [-3.5, 0, 0], 1.0, 2.1, 0, door, {
    open: true,
    interactive: false,
  });
  b.box("hall", [10, 0.2, 4], [0, -0.1, -2], floor);
  for (const [n, size, pos] of [
    ["hall-w", [0.2, 4, 4], [-5, 2, -2]],
    ["hall-e", [0.2, 4, 4], [5, 2, -2]],
    ["hall-s", [10, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.box("blackboard", [5, 1.4, 0.05], [0, 1.8, 13.85], black, {
    collide: false,
  });
  b.sign(
    "board-text",
    ["今日の実験", "「中身を見る」"],
    [3.6, 1.0],
    [0, 1.8, 13.8],
    0,
    {
      bg: "#18201c",
      fg: "#e8f0e0",
      glow: 0.3,
    },
  );
  b.box("teacher-desk", [2.4, 0.9, 0.9], [0, 0.45, 12.4], wood);

  // ---- 実験台 ----
  for (const x of [-2.6, 2.0]) {
    for (const z of [4.5, 9]) {
      b.box(`table-${x}-${z}`, [2.2, 0.85, 1.0], [x, 0.43, z], wood);
    }
  }
  const nb = b.box(
    "notebook",
    [0.4, 0.04, 0.3],
    [-2.6, 0.87, 9],
    b.mat("#c8b890"),
    { collide: false },
  );
  b.register("notebook", nb);
  b.cylinder("burner", 0.3, 0.12, [2.0, 1.0, 4.5], b.mat("#6a6e72"), {
    collide: false,
  });

  // ---- 標本棚（東壁） ----
  b.box("shelf", [0.6, 2.2, 8], [4.6, 1.1, 6], wood);
  for (let i = 0; i < 2; i++) {
    const z = 3.5 + i * 2.2;
    b.cylinder(`jar-${i}`, 0.4, 0.3, [4.2, 1.5, z], jarGlass, {
      collide: false,
    });
    const closed = b.sign(
      `jar-eye-${i}`,
      ["━ ━"],
      [0.26, 0.12],
      [4.04, 1.55, z],
      -Math.PI / 2,
      {
        bg: "#a8c0a0",
        fg: "#101810",
        glow: 0.3,
      },
    );
    closed.isVisible = true;
    const open = b.sign(
      `jar-open-${i}`,
      ["◉ ◉"],
      [0.26, 0.12],
      [4.03, 1.55, z],
      -Math.PI / 2,
      {
        bg: "#a8c0a0",
        fg: "#c01010",
        glow: 0.4,
      },
    );
    open.isVisible = false;
  }
  const big = b.cylinder("big-jar", 0.9, 0.55, [4.1, 1.6, 11], jarGlass, {
    collide: false,
  });
  b.register("big-jar", big);
  b.box("big-jar-label", [0.02, 0.2, 0.3], [3.8, 1.6, 11], b.mat("#e8e0c0"), {
    collide: false,
  });

  // ---- 骨格標本 ----
  const skeleton = b.figure(
    "skeleton",
    [-4.2, 0, 12.8],
    {
      skin: "#d8d4c0",
      hair: "#d8d4c0",
      cloth: "#d8d4c0",
      eyes: "#000000",
      height: 1.15,
    },
    false,
  );
  skeleton.rotation.y = Math.PI;
  b.box("skel-stand", [0.4, 0.1, 0.4], [-4.2, 0.05, 12.8], bone, {
    collide: false,
  });

  // ---- 照明 ----
  b.lamp("lab", [-2, 3.0, 4], "#e8f0e0", 0.5, 10, true);
  b.lamp("lab", [2, 3.0, 9], "#e8f0e0", 0.5, 10, true);
  b.lamp("flame", [2.0, 1.2, 4.5], "#6a9aff", 0.7, 5, false).light.setEnabled(
    false,
  );

  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#a8c4a8",
      hair: "#060806",
      cloth: "#d8e0d0",
      eyes: "#000000",
      height: 0.95,
      longHair: true,
    },
    false,
  );
  return {};
};
