import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 深夜の一軒家。リビング x=-3〜3, z=0〜6（南の玄関 front-door）、北の扉 nursery-door の先が子ども部屋 z=6〜12。
 * リビングのテーブル(x=-1.8,z=4.6)にベビーモニター mon-a/b/c。子ども部屋にベビーベッド crib、人影 watcher。
 * フック：cribRock（ベッドメリーが揺れる）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#4a3a2c");
  const wall = b.mat("#b8b0a0");
  const ceil = b.mat("#d0ccc4");
  const wood = b.mat("#5a4030");
  const sofa = b.mat("#3a4458");
  const babyWall = b.mat("#a8c0c8");
  const white = b.mat("#d8d8d8");

  // ---- リビング ----
  b.room("living", [0, 0, 3], 6, 6, 2.6, { floor, wall, ceiling: ceil }, ["n", "s"]);
  b.wallWithGap("front-wall", "x", [0, 0, 0], 6, 2.6, [0, 1.1, 2.2], wall);
  b.door("front-door", [-0.55, 0, 0], 1.1, 2.2, 0, wood, { open: true, interactive: false });
  b.wallWithGap("nursery-wall", "x", [0, 0, 6], 6, 2.6, [0, 1.1, 2.2], wall);
  b.door("nursery-door", [-0.55, 0, 6], 1.1, 2.2, 0, white, { open: true, interactive: true });
  b.box("sofa", [2.2, 0.8, 0.9], [1.6, 0.4, 1.8], sofa);
  b.box("tv", [1.6, 0.9, 0.1], [1.6, 1.2, 5.85], b.mat("#050505", { specular: 0.8 }), { collide: false });
  b.box("table", [0.8, 0.6, 0.6], [-1.8, 0.3, 4.6], wood);
  b.lamp("living", [0, 2.4, 3], "#ffd8a0", 0.5, 8, true);

  b.sign("mon-a", ["子ども部屋  ● 静か", "ねんね中"], [0.3, 0.2], [-1.8, 0.78, 4.28], 0, {
    bg: "#0a1a0a",
    fg: "#70ff70",
    glow: 0.8,
  });
  const monB = b.sign("mon-b", ["子ども部屋  ▲ 物音", "ゆらゆら…"], [0.3, 0.2], [-1.8, 0.78, 4.27], 0, {
    bg: "#1a1a0a",
    fg: "#ffd040",
    glow: 0.9,
  });
  monB.setEnabled(false);
  const monC = b.sign("mon-c", ["子ども部屋  ■ 2人", "こっちを見ている"], [0.3, 0.2], [-1.8, 0.78, 4.26], 0, {
    bg: "#1a0606",
    fg: "#ff4040",
    glow: 1,
  });
  monC.setEnabled(false);
  b.register("monitor", b.box("monitor", [0.34, 0.24, 0.05], [-1.8, 0.78, 4.32], white, { collide: false }));

  // ---- 子ども部屋 ----
  b.room("nursery", [0, 0, 9], 5, 6, 2.6, { floor: b.mat("#8a7a68"), wall: babyWall, ceiling: ceil }, ["s"]);
  b.lamp("nursery", [0, 2.3, 9], "#a0b8ff", 0.35, 7, false);
  const crib = b.box("crib", [1.1, 0.9, 0.7], [0, 0.45, 10.8], white);
  b.register("crib", crib);
  b.box("mobile", [0.5, 0.05, 0.5], [0, 1.9, 10.8], b.mat("#ffcc66"), { collide: false });
  b.box("toybox", [0.8, 0.4, 0.5], [-1.7, 0.2, 8], wood);
  const watcher = b.figure(
    "watcher",
    [1.3, 0, 10.8],
    { skin: "#c0c4c0", cloth: "#e8e8e8", hair: "#050505", eyes: "#000000", longHair: true },
    false,
  );
  watcher.rotation.y = Math.PI;

  let rock = 0;
  return {
    update: (g, dt) => {
      if (rock > 0) {
        rock = Math.max(0, rock - dt);
        crib.rotation.z = Math.sin(g.elapsed * 6) * 0.03 * rock;
      } else crib.rotation.z = 0;
    },
    custom: {
      cribRock: (g) => {
        rock = 4;
        g.audio?.play("creak", { x: 0, y: 1, z: 10.8 }, 0.6);
      },
    },
  };
};
