import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 祖母の家の奥座敷。畳の間 x=-3〜3, z=0〜6、南（z=0）の襖 fusuma が唯一の出入口。
 * 北壁に七段飾りの雛壇（最上段 z≈5.7, y=1.75）。人形 doll-* は 15 体、最上段の右がお雛様 ohina と座布団 hina-seat。
 * 行灯 andon と雪洞 bonbori の灯り、最後に現れる等身大の雛人形 hina-big。
 * フック：dollsTurnAway（全員が壁を向く）、dollsFace（全員がプレイヤーの方を向く）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const tatami = b.mat("#8a8a5a");
  const wall = b.mat("#b8a888");
  const ceiling = b.mat("#4a3a28");
  const red = b.mat("#8a1010");
  const lacquer = b.mat("#1a0c08", { specular: 0.6 });
  const fusumaMat = b.mat("#d8d0b8");
  const gold = b.mat("#b89838", { emissive: "#201800", specular: 0.6 });

  b.room("zashiki", [0, 0, 3], 6, 6, 2.5, { floor: tatami, wall, ceiling }, ["s"]);
  b.wallWithGap("south", "x", [0, 0, 0], 6, 2.5, [0, 1.8, 1.9], wall);
  b.door("fusuma", [-0.9, 0, 0], 1.8, 1.9, 0, fusumaMat, {
    open: true,
    interactive: false,
  });
  b.box("hall-block", [3, 3, 0.2], [0, 1.5, -1.4], wall).isVisible = false;
  b.box("hall-w", [0.2, 3, 1.4], [-1.2, 1.5, -0.7], wall).isVisible = false;
  b.box("hall-e", [0.2, 3, 1.4], [1.2, 1.5, -0.7], wall).isVisible = false;
  // 畳の縁
  for (const z of [1.5, 3]) {
    b.box(`heri-${z}`, [6, 0.01, 0.05], [0, 0.005, z], b.mat("#202018"), {
      collide: false,
    });
  }

  // ---- 雛壇（七段） ----
  const tierZ = (i: number) => 3.6 + 0.35 * i;
  const tierTop = (i: number) => 0.25 * (i + 1);
  for (let i = 0; i < 7; i++) {
    b.box(`tier-${i}`, [3.2, tierTop(i), 0.35], [0, tierTop(i) / 2, tierZ(i)], red);
  }
  b.box("tier-back", [3.4, 2.2, 0.1], [0, 1.1, 5.95], b.mat("#c8a040", { emissive: "#100800" }), {
    collide: false,
  });
  // 段の上の小物（下二段）
  for (const [n, x, i] of [
    ["tansu", -1, 0],
    ["kago", 1, 0],
    ["ushiguruma", 0, 1],
  ] as const) {
    b.box(n, [0.4, 0.22, 0.25], [x, tierTop(i) + 0.11, tierZ(i)], lacquer, {
      collide: false,
    });
  }

  // ---- 人形 ----
  const dolls: TransformNode[] = [];
  const row = (i: number, xs: number[], cloth: string, prefix: string) => {
    xs.forEach((x, k) => {
      const d = b.figure(
        `${prefix}-${k}`,
        [x, tierTop(i), tierZ(i)],
        { skin: "#f4f0ea", cloth, hair: "#050505", eyes: "#000000", height: 0.26, longHair: prefix !== "doll-m" },
        true,
      );
      d.rotation.y = Math.PI;
      dolls.push(d);
    });
  };
  row(6, [-0.5], "#202040", "doll-o");
  row(5, [-0.8, 0, 0.8], "#e8e8e0", "doll-k");
  row(4, [-1.2, -0.6, 0, 0.6, 1.2], "#c06020", "doll-m");
  row(3, [-1, 1], "#304030", "doll-d");
  row(2, [-0.8, 0, 0.8], "#a0a090", "doll-s");
  // お雛様（最上段の右）と座布団
  const ohina = b.figure(
    "ohina",
    [0.5, tierTop(6), tierZ(6)],
    { skin: "#f8f4ee", cloth: "#b81818", hair: "#050505", eyes: "#000000", height: 0.26 },
    true,
  );
  ohina.rotation.y = Math.PI;
  dolls.push(ohina);
  const seat = b.box("hina-seat", [0.3, 0.04, 0.25], [0.5, tierTop(6) + 0.02, tierZ(6)], gold, {
    collide: false,
  });
  b.register("hina-seat", seat);
  b.box("byobu", [1.6, 0.5, 0.04], [0, tierTop(6) + 0.25, 5.88], gold, {
    collide: false,
  });

  // ---- 灯り ----
  for (const x of [-1.3, 1.3]) {
    b.cylinder(`bonbori-${x}`, 0.3, 0.14, [x, tierTop(6) + 0.15, tierZ(6)], b.mat("#ffe0b0", { emissive: "#806040" }), {
      collide: false,
    });
  }
  b.lamp("bonbori", [0, tierTop(6) + 0.4, tierZ(6) - 0.4], "#ffc890", 0.45, 5, false);
  const andonBody = b.cylinder("andon", 0.8, 0.4, [-2.5, 0.4, 1.0], b.mat("#f0e0c0", { emissive: "#806848" }));
  andonBody.checkCollisions = true;
  b.register("andon", andonBody);
  b.lamp("andon", [-2.5, 0.6, 1.0], "#ffb070", 0.55, 6, false);
  const red2 = b.lamp("red", [0, 2.3, 3], "#ff2010", 0.3, 7, false);
  red2.light.setEnabled(false);

  // ---- 等身大の雛人形 ----
  const big = b.figure(
    "hina-big",
    [2.3, 0, 0.8],
    { skin: "#fbf8f2", cloth: "#b81818", hair: "#050505", eyes: "#000000", height: 1.05 },
    false,
  );
  big.rotation.y = -Math.PI / 2;

  return {
    custom: {
      dollsTurnAway: (g) => {
        for (const d of dolls) {
          d.rotation.set(0, 0, 0);
        }
        g.audio?.play("rattle", { x: 0, y: 1, z: 4.5 }, 0.5);
      },
      dollsFace: (g) => {
        const eye = g.camera.position;
        for (const d of dolls) {
          d.lookAt(new Vector3(eye.x, d.position.y, eye.z));
        }
        g.audio?.play("rattle", { x: 0, y: 1, z: 4.5 }, 0.7);
      },
    },
  };
};
