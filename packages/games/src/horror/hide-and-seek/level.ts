import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/** 祖母の家（廊下・寝室・押入れ・仏間・トイレ）を組み立てる */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const wood = b.mat("#5a3d26", { specular: 0.15 });
  const darkWood = b.mat("#2e1f14", { specular: 0.2 });
  const tatami = b.mat("#9c9a62");
  const tatamiEdge = b.mat("#2f3a2a");
  const plaster = b.mat("#b9a582");
  const ceiling = b.mat("#4a3826");
  const fusuma = b.mat("#e6dcc4");
  const fusumaFrame = b.mat("#1d1611");
  const futon = b.mat("#e9e6df");
  const lacquer = b.mat("#0c0b0a", { specular: 0.6 });
  const gold = b.mat("#b8923a", { specular: 0.8, emissive: "#1a1206" });
  const H = 2.4;

  // 廊下
  b.box("hall-floor", [2, 0.2, 15.5], [0, -0.1, 7.25], wood);
  b.box("hall-ceil", [2, 0.2, 15.5], [0, H + 0.1, 7.25], ceiling);
  b.box("hall-start", [2, H, 0.2], [0, H / 2, -0.5], plaster);
  b.wallWithGap(
    "hall-w",
    "z",
    [-1, 0, 7.25],
    15.5,
    H,
    [1.8 - 7.25, 1.8, 1.8],
    plaster,
  );
  b.wallWithGap(
    "hall-e",
    "z",
    [1, 0, 7.25],
    15.5,
    H,
    [6.8 - 7.25, 1.8, 1.8],
    plaster,
  );
  for (let z = 0; z < 15; z += 0.9) {
    b.box(`hall-board-${z}`, [2, 0.005, 0.02], [0, 0.002, z], darkWood, {
      collide: false,
    });
  }

  // 寝室（6 畳）
  b.room(
    "bedroom",
    [-3, 0, 1.8],
    4,
    3.6,
    H,
    { floor: tatami, wall: plaster, ceiling },
    ["e"],
  );
  for (const z of [0.9, 2.7]) {
    b.box(`tatami-edge-${z}`, [4, 0.004, 0.05], [-3, 0.003, z], tatamiEdge, {
      collide: false,
    });
  }
  b.box("futon", [1.0, 0.12, 2.0], [-2.6, 0.06, 1.6], futon, {
    collide: false,
  });
  b.box("pillow", [0.5, 0.12, 0.3], [-2.6, 0.15, 0.75], futon, {
    collide: false,
  });
  // ふすま（寝室 ↔ 廊下）。最初は開いている
  for (const [name, z] of [
    ["fusuma-a", 0.5],
    ["fusuma-b", 3.1],
  ] as const) {
    const f = b.box(name, [0.05, 1.8, 0.9], [-1.1, 0.9, z], fusuma);
    b.box(`${name}-frame`, [0.06, 1.8, 0.04], [0, 0, 0.43], fusumaFrame, {
      parent: f,
      collide: false,
    });
    b.register(name, f);
  }
  // 箪笥
  const tansu = b.box("tansu", [1.2, 1.1, 0.5], [-3.2, 0.55, 3.3], darkWood);
  b.register("tansu", tansu);
  for (const y of [0.25, 0.6, 0.95]) {
    b.box(`tansu-handle-${y}`, [0.2, 0.03, 0.03], [-3.2, y, 3.04], gold, {
      collide: false,
    });
  }
  // 押入れ（西の壁）
  b.box("oshiire-top", [0.8, 0.6, 1.8], [-4.6, 2.1, 1.9], plaster);
  b.box("oshiire-side-s", [0.8, 1.8, 0.1], [-4.6, 0.9, 0.95], plaster);
  b.box("oshiire-side-n", [0.8, 1.8, 0.1], [-4.6, 0.9, 2.85], plaster);
  b.box("oshiire-shelf", [0.75, 0.05, 1.8], [-4.6, 0.85, 1.9], wood);
  b.box("oshiire-bottom", [0.75, 0.15, 1.8], [-4.6, 0.08, 1.9], wood);
  b.register(
    "oshiire-a",
    b.box("oshiire-a", [0.05, 1.8, 0.9], [-4.16, 0.9, 1.45], fusuma),
  );
  b.register(
    "oshiire-b",
    b.box("oshiire-b", [0.05, 1.8, 0.9], [-4.24, 0.9, 2.35], fusuma),
  );

  // 仏間
  b.room(
    "butsuma",
    [2.8, 0, 6.8],
    3.6,
    3.6,
    H,
    { floor: tatami, wall: plaster, ceiling },
    ["w"],
  );
  b.box("butsudan", [0.6, 1.6, 1.2], [4.25, 0.8, 6.8], lacquer);
  b.box("butsudan-inner", [0.05, 0.9, 0.9], [3.94, 1.0, 6.8], gold, {
    collide: false,
  });
  b.register(
    "butsu-bell",
    b.cylinder("butsu-bell", 0.08, 0.14, [3.85, 0.65, 6.6], gold, {
      collide: false,
    }),
  );
  b.cylinder("candle", 0.18, 0.04, [3.85, 0.66, 7.05], b.mat("#eeeeee"), {
    collide: false,
  });
  b.sign("iei", ["", "", ""], [0.35, 0.45], [4.5, 1.9, 6.0], -Math.PI / 2, {
    bg: "#2a2a2a",
    fg: "#000",
    glow: 0.05,
  });

  // 廊下の人形棚
  b.box("doll-shelf", [0.35, 0.9, 0.6], [-0.8, 0.45, 9.5], darkWood);
  const doll = b.figure(
    "doll",
    [-0.78, 0.9, 9.5],
    { cloth: "#8e1b1b", skin: "#f3efe6", height: 0.3, longHair: false },
    true,
  );
  doll.rotation.y = Math.PI / 2;
  // 振り返ると飛び込んでくる子ども（ジャンプスケア用）
  b.figure("child", [0, 0, -20], {
    cloth: "#8e1b1b",
    skin: "#ece6da",
    height: 0.8,
    longHair: false,
  });

  // トイレ
  b.room(
    "toilet-room",
    [0, 0, 15.8],
    1.6,
    1.6,
    H,
    { floor: wood, wall: plaster, ceiling },
    ["s"],
  );
  b.box(
    "toilet-lintel",
    [2, H - 1.9, 0.2],
    [0, 1.9 + (H - 1.9) / 2, 15],
    plaster,
  );
  for (const x of [-0.75, 0.75]) {
    b.box(`toilet-jamb-${x}`, [0.5, 1.9, 0.2], [x, 0.95, 15], plaster);
  }
  b.door("toilet", [-0.5, 0, 15], 1.0, 1.9, 0, wood, { locked: true });
  b.sign("toilet-sign", ["便所"], [0.3, 0.15], [0, 2.05, 14.88], Math.PI, {
    bg: "#e8e0c8",
    fg: "#222",
  });

  // 照明（白熱電球・ろうそく）
  b.lamp("hall", [0, 2.3, 4], "#ffcf8a", 0.35, 7);
  b.lamp("hall", [0, 2.3, 11.5], "#ffcf8a", 0.3, 7);
  b.lamp("bedroom", [-3, 2.25, 1.8], "#ffd9a0", 0.5, 6);
  b.lamp("butsu", [3.8, 0.9, 7.05], "#ff9a3c", 0.45, 4, false);

  return {
    update: (g) => {
      // ろうそくの揺らぎ
      const lamps = g.registry.lampGroups.get("butsu") ?? [];
      for (const l of lamps) {
        if (l.light.isEnabled()) {
          l.baseIntensity =
            0.38 + Math.sin(g.elapsed * 13) * 0.04 + Math.random() * 0.05;
        }
      }
    },
  };
};
