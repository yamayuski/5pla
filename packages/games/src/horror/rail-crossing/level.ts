import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 深夜の田舎の踏切。敷地は x=-10〜10, z=-2〜22。線路は z=10 を東西（x方向）に走る。
 * 南（z=3）から来て、踏切を渡った先（z=18）の細道が帰り道。遮断機 gate-w / gate-e、押しボタン button、
 * 北の出口の柵扉 fence-door、線路上の人影 girl。
 * フック：gateDown（遮断機が降りる）、gateUp。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const road = b.mat("#26262a");
  const gravel = b.mat("#3a3835");
  const rail = b.mat("#5a5048", { specular: 0.5 });
  const post = b.mat("#d8d8d8");
  const stripe = b.mat("#d8b010");
  const red = b.mat("#c01818", { emissive: "#401010" });
  const invisible = b.mat("#000000");

  b.box("ground", [20, 0.2, 24], [0, -0.1, 10], road);
  b.box("ballast", [20, 0.12, 3.4], [0, 0.04, 10], gravel, { collide: false });
  for (const z of [9.3, 10.7]) {
    b.box(`rail-${z}`, [20, 0.16, 0.1], [0, 0.1, z], rail, { collide: false });
  }
  for (let x = -9; x <= 9; x += 1) {
    b.box(`tie-${x}`, [0.3, 0.06, 2], [x, 0.09, 10], rail, { collide: false });
  }
  for (const [n, size, pos] of [
    ["edge-s", [20, 4, 0.2], [0, 2, -2]],
    ["edge-w", [0.2, 4, 24], [-10, 2, 10]],
    ["edge-e", [0.2, 4, 24], [10, 2, 10]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }
  // 北は柵と扉
  b.box("fence-l", [8, 2.2, 0.15], [-6, 1.1, 22], b.mat("#2a2e2a"));
  b.box("fence-r", [8, 2.2, 0.15], [6, 1.1, 22], b.mat("#2a2e2a"));
  b.door("fence-door", [-1.1, 0, 22], 2.2, 2.2, Math.PI / 2, b.mat("#3a3e3a"), {
    open: true,
    interactive: false,
  });
  b.sign("village", ["←  帰り道", "旧 県道 17号"], [2, 0.6], [0, 2.6, 21.9], Math.PI, {
    bg: "#143018",
    fg: "#f0f0e0",
    glow: 0.3,
  });
  b.sign("crossing-sign", ["踏切あり", "一旦停止"], [1.2, 0.6], [-3.2, 2.3, 7.4], Math.PI, {
    bg: "#d8b010",
    fg: "#101010",
    glow: 0.3,
  });

  // 警報機（南北の両側）と遮断機
  for (const [n, x, z] of [
    ["s", -3, 7.6],
    ["n", 3, 12.4],
  ] as const) {
    b.box(`alarm-post-${n}`, [0.2, 3, 0.2], [x, 1.5, z], post);
    b.box(`alarm-head-${n}`, [0.9, 0.35, 0.2], [x, 3.1, z], red, { collide: false });
  }
  b.lamp("alarm", [-3, 3, 7.2], "#ff2010", 0.8, 9, true).light.setEnabled(false);
  b.lamp("alarm", [3, 3, 12.8], "#ff2010", 0.8, 9, true).light.setEnabled(false);
  b.lamp("street", [0, 4, 3], "#e8f0ff", 0.7, 12, true);
  b.lamp("street", [0, 4, 18], "#e8f0ff", 0.7, 12, true);
  const arms = [] as ReturnType<typeof b.box>[];
  for (const [n, x, z] of [
    ["gate-s", -2.4, 8.2],
    ["gate-n", 2.4, 11.8],
  ] as const) {
    const arm = b.box(n, [3.6, 0.1, 0.1], [x, 1.9, z], stripe, { collide: false });
    arm.isPickable = false;
    arms.push(arm);
  }

  // 押しボタン（調べる対象）
  const button = b.box("button", [0.3, 0.5, 0.3], [4.5, 1.0, 7.4], red);
  b.register("button", button);
  b.box("button-pole", [0.15, 1.0, 0.15], [4.5, 0.5, 7.4], post, { collide: false });

  // 線路の先の人影（ふだんは非表示）
  const girl = b.figure(
    "girl",
    [0, 0, 10],
    { skin: "#c8c8c0", cloth: "#d8d8d8", hair: "#050505", eyes: "#000000", longHair: true },
    false,
  );
  girl.rotation.y = 0;
  b.box("girl-hit", [0.6, 1.7, 0.4], [0, 0.85, 10], invisible, { collide: false }).isVisible = false;
  const far = b.figure(
    "far",
    [-9, 0, 10],
    { skin: "#c8c8c0", cloth: "#d8d8d8", hair: "#050505", eyes: "#000000", longHair: true },
    false,
  );
  far.rotation.y = -Math.PI / 2;

  let t = -1;
  let dir = 1;
  return {
    update: (g, dt) => {
      if (t >= 0) {
        t = Math.min(1, t + dt * 0.35);
      }
      const k = t < 0 ? 0 : dir > 0 ? t : 1 - t;
      const angle = (1 - k) * 1.4;
      arms[0].rotation.z = angle;
      arms[1].rotation.z = -angle;
      void g;
    },
    custom: {
      gateDown: () => {
        dir = 1;
        t = 0;
      },
      gateUp: () => {
        dir = -1;
        t = 0;
      },
    },
  };
};
