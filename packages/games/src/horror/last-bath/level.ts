import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 町の銭湯。南が脱衣所（番台つき）、北が洗い場と湯船。
 * 洗い場の東壁に鏡つきのカランが 4 つ（z=1,3,5,7）、西壁にシャワー。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#8a9496");
  const tile = b.mat("#cfd8d6");
  const ceiling = b.mat("#b9b4a8");
  const wood = b.mat("#8b6a44");
  const tatami = b.mat("#9a8a5a");
  const doorMat = b.mat("#b9c6c4", { alpha: 0.8, specular: 0.6 });
  const mirror = b.mat("#c8d2d4", { emissive: "#3a4446", specular: 1 });
  const metal = b.mat("#9aa0a2", { specular: 0.8 });
  const oke = b.mat("#d8b878");
  const hot = b.mat("#5aa8c0", { emissive: "#18485a", alpha: 0.85 });
  const tubTile = b.mat("#7fb0b8");
  const changingMats = { floor: tatami, wall: b.mat("#d6ccb4"), ceiling };
  const bathMats = { floor, wall: tile, ceiling };

  // ---- 脱衣所 ----
  b.room("changing", [0, 0, -5], 8, 8, 3.2, changingMats, ["n"]);
  // ロッカー（西壁）
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      const l = b.box(
        `locker-${i}-${j}`,
        [0.5, 0.55, 0.55],
        [-3.7, 0.4 + j * 0.6, -8 + i * 0.6],
        wood,
        { collide: false },
      );
      b.register(`locker-${i}-${j}`, l);
    }
  }
  b.box("locker-block", [0.5, 1.8, 3.6], [-3.75, 0.9, -6.5], wood);
  // 籠と長椅子
  b.box("bench", [2.4, 0.45, 0.5], [0, 0.23, -7], wood);
  for (let i = 0; i < 3; i++) {
    b.box(`basket-${i}`, [0.5, 0.25, 0.4], [-0.8 + i * 0.8, 0.58, -7], oke, {
      collide: false,
    });
  }
  // 体重計と扇風機
  b.box("scale", [0.4, 0.08, 0.4], [2.5, 0.04, -3], b.mat("#ddd"), {
    collide: false,
  });
  b.cylinder("fan-pole", 1.3, 0.05, [3.4, 0.65, -2], metal, { collide: false });
  b.cylinder("fan-head", 0.12, 0.5, [3.4, 1.35, -2], b.mat("#6aa"), {
    collide: false,
  });

  // 番台（南東）
  b.box("bandai-desk", [1.6, 1.1, 0.5], [2.8, 0.55, -7.4], wood);
  b.box("bandai-side", [0.5, 1.1, 1.2], [2.2, 0.55, -8.1], wood);
  b.sign(
    "bandai-card",
    ["ごゆっくり"],
    [0.8, 0.25],
    [2.8, 1.35, -7.13],
    Math.PI,
    {
      bg: "#f2ead6",
      fg: "#3a2a1a",
      glow: 0.2,
    },
  );
  const granny = b.figure(
    "bandai",
    [2.9, 0.25, -8.3],
    {
      skin: "#d8c8b0",
      hair: "#d8d8d8",
      cloth: "#5a4a6a",
      eyes: "#1a1a1a",
      height: 0.82,
    },
    true,
  );
  granny.rotation.y = 0;
  b.sign(
    "price",
    ["大人 520円", "しまい湯 23:30"],
    [1.2, 0.5],
    [0, 2.4, -8.88],
    Math.PI,
    {
      bg: "#f2ead6",
      fg: "#222",
      glow: 0.15,
    },
  );

  // 脱衣所と洗い場の間の戸
  b.wallWithGap("bath-wall", "x", [0, 0, -1], 8.2, 3.2, [0, 1.4, 2.2], tile);
  b.door("bath-door", [-0.7, 0, -1], 1.4, 2.2, 0, doorMat, {
    open: true,
    interactive: false,
  });
  b.sign("noren", ["ゆ"], [1.2, 0.5], [0, 2.55, -1.12], 0, {
    bg: "#2a3f7a",
    fg: "#fff",
    glow: 0.3,
  });

  // ---- 洗い場 ----
  b.room("bath", [0, 0, 5.5], 8, 13, 3.6, bathMats, ["s"]);
  for (const z of [1, 3, 5, 7]) {
    const m = b.box(`mirror-${z}`, [0.04, 0.7, 0.6], [3.88, 1.35, z], mirror, {
      collide: false,
    });
    b.register(`mirror-${z}`, m);
    b.box(`faucet-${z}`, [0.15, 0.08, 0.3], [3.85, 0.8, z], metal, {
      collide: false,
    });
    b.box(`stool-${z}`, [0.35, 0.25, 0.35], [3.2, 0.13, z], oke, {
      collide: false,
    });
    b.cylinder(`oke-${z}`, 0.15, 0.32, [3.55, 0.08, z + 0.4], oke, {
      collide: false,
    });
  }
  // 曇った鏡の文字（最初は非表示）
  const writing = b.sign(
    "mirror-writing",
    ["おかえり"],
    [0.6, 0.35],
    [3.85, 1.4, 7],
    Math.PI / 2,
    { bg: "#9aa4a6", fg: "#7a1010", glow: 0.25 },
  );
  writing.setEnabled(false);
  b.register("mirror-writing", writing);

  // 西壁のシャワー
  for (const z of [1, 3, 5]) {
    b.box(`shower-head-${z}`, [0.2, 0.08, 0.15], [-3.85, 2.1, z], metal, {
      collide: false,
    });
    b.cylinder(`shower-pipe-${z}`, 1.2, 0.04, [-3.92, 1.5, z], metal, {
      collide: false,
    });
  }
  const stream = b.cylinder(
    "shower-stream",
    2.05,
    0.09,
    [-3.75, 1.03, 3],
    b.mat("#cfe8f0", { emissive: "#5a7880", alpha: 0.4 }),
    { collide: false },
  );
  stream.setEnabled(false);
  b.cylinder("floor-oke", 0.15, 0.32, [-3.2, 0.08, 5], oke, { collide: false });

  // 湯船（北端）
  b.box("tub", [7.6, 0.6, 2.8], [0, 0.3, 10.5], tubTile);
  b.box("tub-water", [7.2, 0.05, 2.4], [0, 0.6, 10.5], hot, { collide: false });
  // 富士山の壁画
  b.box("mural-sky", [7.6, 2.2, 0.05], [0, 2.4, 11.9], b.mat("#6fa8dc"), {
    collide: false,
  });
  const fuji = b.cylinder(
    "mural-fuji",
    1.4,
    3.6,
    [0, 2.0, 11.86],
    b.mat("#3a5a8a"),
    {
      collide: false,
      diameterTop: 0.6,
      tess: 4,
    },
  );
  fuji.scaling.z = 0.02;
  const snow = b.cylinder(
    "mural-snow",
    0.45,
    1.2,
    [0, 2.48, 11.84],
    b.mat("#f4f4f4"),
    {
      collide: false,
      diameterTop: 0.6,
      tess: 4,
    },
  );
  snow.scaling.z = 0.02;

  // ---- 照明 ----
  b.lamp("changing", [0, 3.0, -5], "#ffe8c0", 0.55, 10);
  b.lamp("bandai", [2.8, 2.6, -7.6], "#ffd8a0", 0.3, 5);
  b.lamp("bath-a", [0, 3.4, 2], "#fff4e0", 0.5, 10);
  b.lamp("bath-b", [0, 3.4, 8.5], "#fff4e0", 0.4, 9);

  // ---- 最後の一発：番台のおばあさん（蒼白） ----
  b.figure(
    "bandai-ghost",
    [0, 0, 30],
    {
      skin: "#c8ccc4",
      hair: "#e0e0e0",
      cloth: "#5a4a6a",
      eyes: "#000000",
      height: 0.95,
    },
    false,
  );

  return {
    custom: {
      showerOn: () => {
        stream.setEnabled(true);
      },
      showerOff: () => {
        stream.setEnabled(false);
      },
    },
  };
};
