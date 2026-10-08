import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夜間受付の市役所の窓口ホール。x=-6〜6, z=0〜14、天井 3.2m。入口(z=0)の自動ドアが entrance。
 * 北(z=12)にカウンターと3つの窓口(x=-4,0,4)、その上(z=13.9)に呼び出し番号の電光掲示(disp-0..3)。
 * 発券機(ticket-machine)は東壁側。3番窓口(x=4)に職員(clerk)が座っている。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#9a9a90", { specular: 0.4 });
  const wall = b.mat("#c8c8bc");
  const ceiling = b.mat("#a0a098");
  const glass = b.mat("#b8d8e8", { alpha: 0.2, specular: 0.8 });
  const counter = b.mat("#5a5048");
  const chair = b.mat("#2a4a6a");
  const metal = b.mat("#8a9098", { specular: 0.6 });

  b.room("hall", [0, 0, 7], 12, 14, 3.2, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 12, 3.2, [0, 2.4, 2.6], wall);
  b.door("entrance", [-1.2, 0, 0], 2.4, 2.6, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("street", [12, 0.2, 4], [0, -0.1, -2], floor);
  for (const [n, size, pos] of [
    ["street-w", [0.2, 4, 4], [-6, 2, -2]],
    ["street-e", [0.2, 4, 4], [6, 2, -2]],
    ["street-s", [12, 4, 0.2], [0, 2, -4]],
  ] as const) {
    b.box(n, size, pos, wall).isVisible = false;
  }
  b.sign(
    "night-sign",
    ["夜間受付", "21:00〜翌朝6:00"],
    [2.6, 0.7],
    [-3, 2.6, 0.12],
    0,
    {
      bg: "#183a5a",
      fg: "#f0f4f8",
      glow: 0.5,
    },
  );

  // ---- 窓口 ----
  b.box("counter", [12, 1.0, 0.8], [0, 0.5, 12], counter);
  for (const [i, x] of [-4, 0, 4].entries()) {
    const pane = b.box(`pane-${i}`, [2.4, 1.0, 0.04], [x, 1.5, 12], glass, {
      collide: false,
    });
    b.register(`pane-${i + 1}`, pane);
    b.sign(`win-no-${i}`, [`${i + 1}番`], [0.6, 0.3], [x, 2.7, 12.1], 0, {
      bg: "#183a5a",
      fg: "#fff8c0",
      glow: 0.6,
    });
  }
  b.box("clerk-desk", [2.2, 0.7, 0.6], [4, 0.35, 13.2], counter);

  // ---- 呼び出し表示 ----
  const disp = [
    ["お呼び出し中", "41 番"],
    ["お呼び出し中", "43 番 → 1番窓口"],
    ["お呼び出し中", "46 番 → 2番窓口"],
    ["お呼び出し中", "47 番 → 3番窓口"],
  ];
  for (const [i, lines] of disp.entries()) {
    const s = b.sign(`disp-${i}`, lines, [3.4, 0.9], [0, 2.7, 13.9], 0, {
      bg: i === 3 ? "#300808" : "#081808",
      fg: i === 3 ? "#ff4040" : "#40ff60",
      glow: 0.8,
    });
    s.position.x = 0;
    s.isVisible = i === 0;
  }

  // ---- 発券機と待合の椅子 ----
  const tm = b.box("ticket-machine", [0.5, 1.3, 0.4], [5.6, 0.65, 3], metal);
  b.register("ticket-machine", tm);
  for (const x of [-3.5, -1.5, 1.5, 3.5]) {
    for (const z of [5, 7.5]) {
      b.box(`chair-${x}-${z}`, [1.4, 0.45, 0.5], [x, 0.23, z], chair);
    }
  }

  // ---- 照明 ----
  b.lamp("hall", [-3, 3.0, 4], "#e8f4e8", 0.5, 10, true);
  b.lamp("hall", [3, 3.0, 4], "#e8f4e8", 0.5, 10, true);
  b.lamp("hall", [0, 3.0, 9.5], "#e8f4e8", 0.5, 10, true);
  b.lamp("win3", [4, 2.4, 12.4], "#fff0c0", 0.8, 6, false).light.setEnabled(
    false,
  );

  // ---- 職員 ----
  const clerk = b.figure(
    "clerk",
    [4, 0, 13.0],
    {
      skin: "#c4c8c0",
      hair: "#060606",
      cloth: "#506070",
      eyes: "#000000",
      height: 1.0,
    },
    false,
  );
  clerk.rotation.y = Math.PI;
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c4c8c0",
      hair: "#060606",
      cloth: "#506070",
      eyes: "#000000",
      height: 1.0,
      longHair: true,
    },
    false,
  );
  return {};
};
