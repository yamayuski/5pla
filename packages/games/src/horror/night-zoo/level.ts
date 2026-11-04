import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉園後の動物園の通路（x=-2〜2, z=0〜26）。南の入口ゲート gate（z=2、最初は開いている）。
 * 左右に檻が3つずつ（cage-l0..2 / cage-r0..2、奥に目が光る eyes-N ランプ）。
 * 最後の右の檻 cage-r2 の中に、誰かが座っている keeper。最後に飛び出すのは keeper-face。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const asphalt = b.mat("#3a3a3c");
  const wall = b.mat("#4a5a48");
  const bar = b.mat("#222428", { specular: 0.4 });
  const dark = b.mat("#000000");
  const straw = b.mat("#6a5a30");

  b.box("floor", [4, 0.1, 26], [0, -0.05, 13], asphalt);
  b.box("end-n", [4, 3, 0.1], [0, 1.5, 26], wall);
  for (const side of [-1, 1]) {
    b.box(`fence-${side}`, [0.1, 3, 26], [side * 2.05, 1.5, 13], dark).isVisible = false;
  }

  const eyes: ReturnType<LevelBuilder["lamp"]>[] = [];
  for (const [si, side] of [-1, 1].entries()) {
    for (let k = 0; k < 3; k++) {
      const z = 6 + k * 6.5;
      const n = si === 0 ? `l${k}` : `r${k}`;
      const x = side * 3.6;
      b.box(`back-${n}`, [0.1, 3, 5], [side * 5.6, 1.5, z], wall);
      b.box(`ground-${n}`, [4, 0.05, 5], [x, 0.03, z], straw, { collide: false });
      for (let i = 0; i < 6; i++) {
        const bz = z - 2.5 + (i * 5) / 5;
        const barMesh = b.box(`bar-${n}-${i}`, [0.05, 3, 0.05], [side * 1.6, 1.5, bz], bar);
        barMesh.isPickable = false;
      }
      const rail = b.box(`rail-${n}`, [0.05, 0.08, 5], [side * 1.6, 2.6, z], bar, { collide: false });
      rail.isPickable = false;
      b.box(`wall-${n}`, [0.1, 3, 5], [side * 1.58, 1.5, z], dark).isVisible = false;
      b.sign(`plate-${n}`, ["飼育中", "（見えますか）"], [0.9, 0.3], [side * 1.5, 1.2, z - 1.8], side > 0 ? Math.PI / 2 : -Math.PI / 2);
      if (n !== "r2") {
        const e = b.lamp(`eyes-${n}`, [x, 0.6, z], "#ff3020", 0.0, 4, false);
        eyes.push(e);
      }
    }
  }
  b.lamp("lantern", [0, 3.2, 4], "#c8e0ff", 0.45, 9, true);
  b.lamp("lantern", [0, 3.2, 13], "#c8e0ff", 0.4, 9, true);
  b.lamp("lantern", [0, 3.2, 21], "#c8e0ff", 0.35, 9, true);

  b.door("gate", [-2, 0, 2], 4, 2.6, 0, bar, { open: true, interactive: false });

  // 最後の檻の中に座る人影
  const keeper = b.figure(
    "keeper",
    [3.6, 0, 22.2],
    { skin: "#9a9088", cloth: "#2c4a2c", hair: "#101010", eyes: "#000000", longHair: false, height: 0.95 },
    true,
  );
  keeper.rotation.y = -Math.PI / 2;
  b.figure("keeper-face", [0, 0, 12], { skin: "#a8a8a0", cloth: "#2c4a2c", hair: "#050505", eyes: "#000000" }, false);

  let eyesOn = 0;
  return {
    update: (g) => {
      eyes.forEach((e, i) => {
        const on = i < eyesOn;
        const blink = Math.sin(g.elapsed * 0.7 + i * 2.3) > -0.85;
        e.light.intensity = on && blink ? 0.5 : 0;
        e.light.setEnabled(on && blink);
      });
    },
    custom: {
      eyesOn1: () => {
        eyesOn = 1;
      },
      eyesAll: () => {
        eyesOn = eyes.length;
      },
      eyesOff: () => {
        eyesOn = 0;
      },
    },
  };
};
