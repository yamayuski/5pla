import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 深夜の無人コイン洗車場。洗車ベイは x=-3〜3, z=0〜16（屋根付き、南の入口にシャッター shutter、北は壁）。
 * 入口脇の料金箱 coinbox（x=-2.2, z=1.2）、ベイ中央に洗車機のアーチ arch（z=7 から奥へ動く）。
 * 奥（z=13）に洗車機の泡カーテンの向こうの人影 figure-w。停止ボタン stop-btn は北壁（z=15.9）。
 * フック：archMove（アーチがこちらへ進む）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#2b2e32");
  const wall = b.mat("#6a7078");
  const roof = b.mat("#3a3d42");
  const steel = b.mat("#8a9096", { specular: 0.6 });
  const brush = b.mat("#2060c0");
  const red = b.mat("#b01818", { emissive: "#401010" });
  const foam = b.mat("#e8f0f8", { alpha: 0.5 });
  const invisible = b.mat("#000000");

  b.room("bay", [0, 0, 8], 6, 16, 3.4, { floor, wall, ceiling: roof }, ["s"]);
  b.wallWithGap("bay-front", "x", [0, 0, 0], 6, 3.4, [0, 1.3, 2.6], wall);
  b.door("shutter", [-1.3, 0, 0], 2.6, 2.6, Math.PI / 2, steel, {
    open: true,
    interactive: false,
  });
  for (const [n, size, pos] of [
    ["edge-s", [8, 4, 0.2], [0, 2, -3]],
    ["edge-w", [0.2, 4, 6], [-4, 2, -1]],
    ["edge-e", [0.2, 4, 6], [4, 2, -1]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  b.sign("rate", ["コイン洗車 24h", "水洗い ¥300 / 泡洗い ¥500"], [1.8, 0.6], [-2.95, 1.9, 1.2], Math.PI / 2, {
    bg: "#0a2a50",
    fg: "#ffffff",
    glow: 0.5,
  });
  const coinbox = b.box("coinbox", [0.5, 1.1, 0.4], [-2.6, 0.55, 2.4], steel);
  b.register("coinbox", coinbox);
  b.lamp("bay", [0, 3.1, 3], "#e8f4ff", 0.8, 9, true);
  b.lamp("bay", [0, 3.1, 11], "#e8f4ff", 0.8, 9, true);

  // 洗車機のアーチ
  const arch = b.box("arch-top", [5.4, 0.4, 0.8], [0, 3.0, 7], steel, { collide: false });
  const legL = b.box("arch-l", [0.4, 3, 0.8], [-2.7, 1.5, 7], steel, { parent: arch, collide: false });
  legL.position.set(-2.7, -1.5, 0);
  const legR = b.box("arch-r", [0.4, 3, 0.8], [2.7, 1.5, 7], steel, { parent: arch, collide: false });
  legR.position.set(2.7, -1.5, 0);
  for (const x of [-1.6, 1.6]) {
    const br = b.box(`brush-${x}`, [0.5, 2.6, 0.5], [x, 1.4, 7], brush, { parent: arch, collide: false });
    br.position.set(x, -1.6, 0);
  }
  b.box("arch-light", [0.3, 0.2, 0.1], [0, 0, 0], red, { parent: arch, collide: false }).position.set(0, -0.3, -0.45);

  // 手前の泡の跡（窓の手形）
  const handprint = b.sign("handprint", ["　", "手形が ガラスの 内側に"], [1.4, 0.4], [-2.95, 1.2, 4.6], Math.PI / 2, {
    bg: "#101418",
    fg: "#ff4040",
    glow: 0.3,
  });
  handprint.setEnabled(false);

  // 奥の泡カーテン
  const curtain = b.box("curtain", [5.6, 2.8, 0.1], [0, 1.4, 11.2], foam, { collide: false });
  curtain.isPickable = false;
  const figW = b.figure(
    "figure-w",
    [0, 0, 12.6],
    { skin: "#c8ccd0", cloth: "#202830", hair: "#0a0a0a", eyes: "#000000", longHair: true },
    false,
  );
  figW.rotation.y = Math.PI * 0 + Math.PI;
  figW.rotation.y = 0;

  const stop = b.box("stop-btn", [0.5, 0.5, 0.15], [0, 1.3, 15.8], red);
  b.register("stop-btn", stop);
  b.sign("stop-label", ["非常停止", "EMERGENCY"], [0.9, 0.35], [0, 1.85, 15.88], Math.PI, {
    bg: "#f0f0f0",
    fg: "#b01818",
    glow: 0.4,
  });

  let moving = false;
  let z = 7;
  return {
    update: (_g, dt) => {
      if (moving) {
        z = Math.min(12.3, z + dt * 0.35);
        arch.position.z = z;
      }
    },
    custom: {
      archMove: (g) => {
        moving = true;
        g.audio?.play("buzz", { x: 0, y: 2, z: 8 }, 0.7);
      },
      archStop: () => {
        moving = false;
      },
    },
  };
};
