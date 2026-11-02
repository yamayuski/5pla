import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * カプセルホテルの就寝フロア。通路は x=-1〜1（幅2m）、z=0〜14。東側（x=1）に二段のカプセルが5列（z=1.5+2.4k）。
 * 自分のカプセル pod-me は1列目の下段（カーテンは開いている）。他のカプセルのカーテンは curtain-<列>-<lo|hi>。
 * 南端の出入口は shutter（扉）、北端に自販機 vending。
 * フック: curtainSway（3列目下段のカーテンが内側から揺れる）、lampsOut。最後に出るのは pod-face（自分のカプセルの中）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6a6458");
  const wall = b.mat("#b8b4a8");
  const ceiling = b.mat("#d0ccc0");
  const pod = b.mat("#e8e4d8");
  const curtain = b.mat("#506a78", { specular: 0.05 });
  const dark = b.mat("#020202");

  b.box("floor", [2.2, 0.2, 14], [0, -0.1, 7], floor);
  b.box("ceil", [2.2, 0.1, 14], [0, 2.8, 7], ceiling, { collide: false });
  b.box("west", [0.1, 2.8, 14], [-1.15, 1.4, 7], wall);
  b.box("end-s", [2.4, 2.8, 0.1], [0, 1.4, 0], wall);
  b.box("end-n", [2.4, 2.8, 0.1], [0, 1.4, 14], wall);
  b.box("pods-back", [0.1, 2.8, 14], [1.1, 1.4, 7], dark).isVisible = false;
  b.door("shutter", [-0.5, 0, 0.1], 1.0, 2.1, 0, b.mat("#8a8a8a"), { open: true, interactive: false });
  b.sign("exit", ["出口"], [0.5, 0.2], [0, 2.4, 0.06], 0, { bg: "#103018", fg: "#40ff80", glow: 0.9 });

  for (let k = 0; k < 5; k++) {
    const z = 1.5 + k * 2.4;
    b.box(`frame-${k}`, [0.1, 2.4, 0.1], [1.0, 1.2, z - 1.1], pod);
    b.box(`mid-${k}`, [0.1, 0.1, 2.2], [1.0, 1.15, z], pod);
    b.sign(`no-${k}`, [`${k + 1}${k === 2 ? "3" : "0"}`], [0.3, 0.12], [0.93, 1.25, z - 0.8], -Math.PI / 2, {
      bg: "#e8e0c8",
      fg: "#202020",
      glow: 0.3,
    });
    for (const lv of ["lo", "hi"]) {
      if (k === 0 && lv === "lo") {
        continue;
      }
      const y = lv === "lo" ? 0.6 : 1.85;
      const c = b.box(`curtain-${k}-${lv}`, [0.05, 1.0, 2.0], [0.95, y, z], curtain, { collide: false });
      b.register(`curtain-${k}-${lv}`, c);
    }
  }
  // 自分のカプセル（1列目下段）
  b.box("pod-me-floor", [1.6, 0.1, 2.0], [1.8, 0.1, 1.5], pod);
  b.box("pod-me-top", [1.6, 0.1, 2.0], [1.8, 1.1, 1.5], pod);
  b.box("pod-me-back", [0.1, 1.0, 2.0], [2.6, 0.6, 1.5], pod);
  const bed = b.box("pod-me", [1.0, 0.25, 1.9], [1.8, 0.3, 1.5], b.mat("#f0f0f0"), { collide: false });
  b.register("pod-me", bed);
  b.lamp("pod", [1.5, 1.0, 1.5], "#ffe8c0", 0.3, 3, false);

  // 通路の備品
  const vending = b.box("vending", [0.7, 1.8, 0.5], [-0.75, 0.9, 13.6], b.mat("#c02020", { emissive: "#300808" }));
  b.register("vending", vending);
  b.lamp("vending", [-0.4, 1.6, 13.2], "#ff9080", 0.3, 4, false);
  b.box("shoe-rack", [0.4, 0.8, 1.2], [-0.9, 0.4, 2.0], b.mat("#6a4a30"));
  const slippers = b.box("slippers", [0.35, 0.08, 0.3], [-0.6, 0.04, 5.0], b.mat("#d8d0c0"), { collide: false });
  b.register("slippers", slippers);

  b.lamp("hall", [0, 2.6, 3], "#fff0d8", 0.4, 7, true);
  b.lamp("hall", [0, 2.6, 10], "#fff0d8", 0.4, 7, true);

  // 他の宿泊客（最後は自分のカプセルから）
  const face = b.figure(
    "pod-face",
    [1.0, 0, 1.5],
    { skin: "#b8bcb8", cloth: "#e8e4d8", hair: "#050505", eyes: "#000000" },
    false,
  );
  face.rotation.y = -Math.PI / 2;
  const guest = b.figure(
    "guest",
    [0, 0, 11.5],
    { skin: "#a8aca8", cloth: "#e8e4d8", hair: "#080808", eyes: "#000000", longHair: false },
    false,
  );
  guest.rotation.y = Math.PI;

  let swaying = false;
  return {
    update: (g) => {
      const c = b.scene.getMeshByName("curtain-2-lo");
      if (c && swaying) {
        c.position.x = 0.95 + Math.sin(g.elapsed * 3) * 0.06;
        c.rotation.y = Math.sin(g.elapsed * 2.3) * 0.08;
      }
    },
    custom: {
      curtainSway: () => {
        swaying = true;
      },
      curtainStop: () => {
        swaying = false;
      },
    },
  };
};
