import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 全寮制高校の寮の一室（6人部屋）。部屋は x=-3〜3, z=0〜8、南（z=0）の扉 dorm-door。
 * 二段ベッドは西に2台・東に1台（計6床）。各床の寝ている膨らみ lump-<n>。
 * 東の二段ベッドの下段 bed-5 は空き（名札なし）、そこに現れる膨らみ lump-extra と布団 extra-futon。
 * 扉の脇の点呼表 roster（板）。最後は東のベッドの前で天井から逆さにぶら下がる peer、飛び出すのは ghost。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6a5a48");
  const wall = b.mat("#c8c4b4");
  const ceiling = b.mat("#d8d8d0");
  const frame = b.mat("#5a5e64", { specular: 0.4 });
  const mattress = b.mat("#d0ccc0");
  const blanketColors = ["#3a5a8a", "#8a3a3a", "#3a7a4a", "#7a6a3a", "#5a3a7a", "#3a6a7a"];
  const dark = b.mat("#050505");

  b.room("dorm", [0, 0, 4], 6, 8, 2.7, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("south", "x", [0, 0, 0], 6, 2.7, [1.6, 0.9, 2.1], wall);
  b.door("dorm-door", [1.15, 0, 0], 0.9, 2.1, 0, b.mat("#7a6a5a"), {
    open: true,
    interactive: false,
  });
  b.box("hall-block", [2, 3, 0.2], [1.6, 1.5, -1.2], dark).isVisible = false;
  b.box("hall-w", [0.2, 3, 1.2], [0.6, 1.5, -0.6], dark).isVisible = false;
  b.box("hall-e", [0.2, 3, 1.2], [2.6, 1.5, -0.6], dark).isVisible = false;
  b.sign("window", ["", ""], [1.2, 0.9], [0, 1.6, 7.92], 0, { bg: "#101828", fg: "#101828", glow: 0.3 });

  // ---- 二段ベッド：西に2台（z=2.5, 5.5）、東に1台（z=5.5） ----
  const beds: [number, number][] = [
    [-2.1, 2.5],
    [-2.1, 5.5],
    [2.1, 5.5],
  ];
  let n = 0;
  for (const [x, z] of beds) {
    for (const [tier, y] of [0.45, 1.55].entries()) {
      for (const [dx, dz] of [
        [-0.45, -1],
        [0.45, -1],
        [-0.45, 1],
        [0.45, 1],
      ] as const) {
        b.box(`post-${n}-${dx}-${dz}`, [0.06, 2.0, 0.06], [x + dx, 1.0, z + dz], frame, { collide: false });
      }
      b.box(`mattress-${n}`, [0.9, 0.18, 2.0], [x, y, z], mattress);
      if (tier === 1) {
        b.box(`guard-${n}`, [0.04, 0.25, 1.2], [x - Math.sign(x) * 0.45, y + 0.2, z + 0.3], frame, { collide: false });
      }
      const empty = x > 0 && tier === 0;
      if (!empty) {
        const lump = b.box(`lump-${n}`, [0.6, 0.28, 1.5], [x, y + 0.2, z + 0.15], b.mat(blanketColors[n] ?? "#3a5a8a"), {
          collide: false,
        });
        b.register(`lump-${n}`, lump);
        b.box(`pillow-${n}`, [0.5, 0.12, 0.3], [x, y + 0.15, z - 0.75], b.mat("#e8e8e0"), { collide: false });
      }
      n++;
    }
    b.box(`bedblock-${x}-${z}`, [1.0, 2.0, 2.1], [x, 1.0, z], dark).isVisible = false;
  }
  // 空き床（東の下段）
  const extra = b.box("lump-extra", [0.6, 0.3, 1.5], [2.1, 0.65, 5.65], b.mat("#d8d4c8"), { collide: false });
  extra.setEnabled(false);
  b.register("lump-extra", extra);
  const futon = b.box("extra-futon", [0.92, 0.04, 1.6], [2.1, 0.56, 5.6], b.mat("#e8e4d8", { emissive: "#101010" }), {
    collide: false,
  });
  b.register("extra-futon", futon);

  // ---- 点呼表 ----
  const roster = b.box("roster", [0.04, 0.5, 0.36], [2.94, 1.4, 1.6], b.mat("#d8c8a0"));
  b.register("roster", roster);
  b.sign("roster-a", ["点呼 23:00  204号室", "在室 5名"], [0.34, 0.3], [2.91, 1.4, 1.6], Math.PI / 2, {
    bg: "#f0f0e8",
    fg: "#202020",
    glow: 0.4,
  });
  b.sign("roster-b", ["点呼 23:00  204号室", "在室 6名"], [0.34, 0.3], [2.905, 1.4, 1.6], Math.PI / 2, {
    bg: "#f0f0e8",
    fg: "#a01010",
    glow: 0.5,
  }).setEnabled(false);
  b.box("desk", [0.6, 0.75, 1.2], [2.6, 0.38, 3.2], b.mat("#7a5a3a"));

  // ---- 照明 ----
  b.lamp("room", [0, 2.5, 4], "#f0f4ff", 0.5, 8, true);
  b.lamp("night", [2.7, 1.0, 3.2], "#ffd890", 0.25, 3, false);
  const red = b.lamp("red", [0, 2.5, 1], "#40ff60", 0.25, 8, false);
  red.light.setEnabled(false);

  // ---- 上段から逆さに覗く顔と、飛び出す ghost ----
  // 天井に足をつけて逆さにぶら下がる（z 軸で反転すると足元が上、顔は -z を向く）
  const peer = b.figure(
    "peer",
    [2.1, 2.68, 4.1],
    { skin: "#b8bcb8", cloth: "#d8d8d0", hair: "#050505", eyes: "#300000", height: 0.9 },
    false,
  );
  peer.rotation.set(0, Math.PI, Math.PI);
  b.figure("ghost", [0, 0, 3], { skin: "#c0c4c0", cloth: "#d8d8d0", hair: "#050505", eyes: "#300000" }, false);
  return undefined;
};
