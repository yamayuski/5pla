import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 深夜ラジオ局のサブ(調整室)とブース。調整室 x=-4〜4, z=0〜8、ブース x=-3〜3, z=8〜13（天井 2.6m）。
 * 調整室とブースの間はガラス窓(studio-glass)。ミキサー(mixer)は調整室の机、ON AIR 表示(on-air / on-air-off)は窓の上。
 * ブースの椅子(booth-chair)に、女の人影(dj)が座っている。入口の扉は studio-door。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const carpet = b.mat("#2a2a30");
  const wall = b.mat("#58585e");
  const ceiling = b.mat("#303036");
  const panel = b.mat("#8a3a3a");
  const desk = b.mat("#18181c");
  const glass = b.mat("#a8d0e0", { alpha: 0.22, specular: 0.8 });
  const door = b.mat("#303036");
  const foam = b.mat("#26262c");

  // ---- 調整室 ----
  b.room("control", [0, 0, 4], 8, 8, 2.6, { floor: carpet, wall, ceiling }, [
    "s",
    "n",
  ]);
  b.wallWithGap("front", "x", [0, 0, 0], 8, 2.6, [-2.5, 1.0, 2.1], wall);
  b.door("studio-door", [-3, 0, 0], 1.0, 2.1, 0, door, {
    open: true,
    interactive: false,
  });
  b.box("hall", [8, 0.2, 4], [0, -0.1, -2], carpet);
  for (const [n, size, pos] of [
    ["hall-w", [0.2, 3, 4], [-4, 1.5, -2]],
    ["hall-e", [0.2, 3, 4], [4, 1.5, -2]],
    ["hall-s", [8, 3, 0.2], [0, 1.5, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.box("desk", [4.2, 0.9, 1.2], [0, 0.45, 6.6], desk);
  const mixer = b.box(
    "mixer",
    [2.4, 0.12, 0.7],
    [0, 0.96, 6.5],
    b.mat("#404048", { emissive: "#101820" }),
    {
      collide: false,
    },
  );
  b.register("mixer", mixer);
  b.box(
    "monitor",
    [0.9, 0.55, 0.1],
    [-1.5, 1.35, 6.9],
    b.mat("#80c0a0", { emissive: "#305040" }),
    {
      collide: false,
    },
  );

  // ---- ガラス窓（調整室とブースの間） ----
  b.box("gw-low", [8, 0.9, 0.2], [0, 0.45, 8], wall);
  b.box("gw-l", [1.5, 2.6, 0.2], [-3.25, 1.3, 8], wall);
  b.box("gw-r", [1.5, 2.6, 0.2], [3.25, 1.3, 8], wall);
  b.box("gw-top", [5, 0.5, 0.2], [0, 2.35, 8], wall);
  const sg = b.box("studio-glass", [5, 1.2, 0.05], [0, 1.5, 8], glass, {
    collide: false,
  });
  b.register("studio-glass", sg);
  b.box("glass-block", [5, 1.2, 0.1], [0, 1.5, 8], glass, {
    collide: true,
  }).isVisible = false;
  b.sign("on-air-off", ["ON AIR"], [1.4, 0.4], [0, 2.35, 7.88], 0, {
    bg: "#201010",
    fg: "#401818",
    glow: 0.1,
  });
  b.sign("on-air", ["ON AIR"], [1.4, 0.4], [0, 2.35, 7.87], 0, {
    bg: "#e81818",
    fg: "#ffffff",
    glow: 1,
  }).setEnabled(false);

  // ---- ブース ----
  b.room(
    "booth",
    [0, 0, 10.5],
    6,
    5,
    2.6,
    { floor: carpet, wall: foam, ceiling },
    ["s"],
  );
  b.box("booth-table", [2.0, 0.8, 0.9], [0, 0.4, 12.0], desk);
  b.cylinder(
    "mic-stand",
    0.6,
    0.04,
    [0, 1.1, 11.6],
    b.mat("#8a8a90", { specular: 0.8 }),
    { collide: false },
  );
  b.box("mic", [0.12, 0.2, 0.12], [0, 1.45, 11.55], b.mat("#202024"), {
    collide: false,
  });
  b.box("booth-chair", [0.6, 0.5, 0.6], [0, 0.25, 11.0], panel, {
    collide: false,
  });

  // ---- 照明 ----
  b.lamp("ctrl", [-2, 2.4, 4], "#d8e8ff", 0.5, 9, true);
  b.lamp("ctrl", [2, 2.4, 4], "#d8e8ff", 0.5, 9, true);
  b.lamp("booth", [0, 2.4, 10.5], "#ffd8b0", 0.7, 7, true);

  // ---- DJ ----
  b.figure(
    "dj",
    [0, 0.3, 11.0],
    {
      skin: "#c8c4c0",
      hair: "#060606",
      cloth: "#9a4a60",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c8c4c0",
      hair: "#060606",
      cloth: "#9a4a60",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  return {};
};
