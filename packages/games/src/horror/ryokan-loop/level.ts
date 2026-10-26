import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 旅館の廊下。x=-1.2〜1.2, z=0〜32 の一本道。左右に客室の襖が並び、突き当たり(z=32)が「椿の間」。
 * 廊下の終わりに近づくと custom: loop で z を 18 だけ手前へ戻す（廊下は一様なので継ぎ目は見えない）。
 */
const ZS = [6, 11, 16, 21, 26];
const NAMES = ["梅", "竹", "松", "桜", "菊"];

export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const tatami = b.mat("#6a6a40");
  const wall = b.mat("#8a7458");
  const ceiling = b.mat("#3a2c20");
  const fusuma = b.mat("#cfc4a0");
  const frame = b.mat("#3a2616");
  const slipper = b.mat("#6a2a2a");
  const eyeMat = b.mat("#f4f4f0", { emissive: "#d8d8d0" });
  const black = b.mat("#050403");

  b.room("corr", [0, 0, 16], 2.4, 32, 2.6, { floor: tatami, wall, ceiling }, [
    "n",
  ]);
  // 突き当たり：椿の間の戸と室内
  b.wallWithGap("end", "x", [0, 0, 32], 2.4, 2.6, [0, 1.0, 2.1], wall);
  b.door("tsubaki-door", [-0.5, 0, 32], 1.0, 2.1, 0, fusuma, {
    locked: true,
    interactive: false,
  });
  b.sign("tsubaki-plate", ["椿の間"], [0.8, 0.3], [0, 2.35, 31.88], Math.PI, {
    bg: "#2a1a10",
    fg: "#e8d8b0",
    glow: 0.4,
  });
  b.room(
    "tsubaki",
    [0, 0, 34.5],
    3.4,
    5,
    2.6,
    { floor: tatami, wall, ceiling },
    ["s"],
  );
  b.box(
    "tsubaki-futon",
    [1.2, 0.12, 2.2],
    [0.9, 0.06, 35.6],
    b.mat("#e8e4dc"),
    {
      collide: false,
    },
  );

  const slippers = new TransformNode("slippers", b.scene);
  const eyes = new TransformNode("eyes", b.scene);
  for (const [i, z] of ZS.entries()) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * 1.17;
    // 襖と鴨居
    b.box(`fusuma-${i}`, [0.04, 2.0, 1.1], [x, 1.0, z], fusuma, {
      collide: false,
    });
    b.box(`frame-${i}`, [0.08, 0.1, 1.3], [x, 2.05, z], frame, {
      collide: false,
    });
    // 部屋札（通常／異変後）
    const rot = side < 0 ? -Math.PI / 2 : Math.PI / 2;
    const ok = b.sign(
      `plate-ok-${i}`,
      [NAMES[i] ?? "梅"],
      [0.28, 0.28],
      [x - side * 0.05, 1.7, z + 0.9],
      rot,
      {
        bg: "#f0e8d0",
        fg: "#222",
        glow: 0.3,
      },
    );
    b.register(`plate-ok-${i}`, ok);
    const bad = b.sign(
      `plate-bad-${i}`,
      ["四"],
      [0.28, 0.28],
      [x - side * 0.05, 1.7, z + 0.9],
      rot,
      {
        bg: "#2a0a0a",
        fg: "#e8d0d0",
        glow: 0.4,
      },
    );
    bad.setEnabled(false);
    b.register(`plate-bad-${i}`, bad);
    // スリッパ
    for (const dz of [-0.12, 0.12]) {
      b.box(
        `slip-${i}-${dz}`,
        [0.22, 0.05, 0.1],
        [x - side * 0.22, 0.03, z - 0.5 + dz],
        slipper,
        {
          collide: false,
          parent: slippers,
        },
      );
    }
    // 襖の隙間と目
    b.box(
      `gap-${i}`,
      [0.05, 1.6, 0.06],
      [x + side * 0.0, 1.0, z - 0.2],
      black,
      {
        collide: false,
        parent: eyes,
      },
    );
    for (const dz of [-0.025, 0.025]) {
      b.box(
        `eye-${i}-${dz}`,
        [0.06, 0.03, 0.02],
        [x - side * 0.01, 1.35, z - 0.2 + dz],
        eyeMat,
        {
          collide: false,
          parent: eyes,
        },
      );
    }
  }
  slippers.setEnabled(false);
  eyes.setEnabled(false);
  b.register("slippers", slippers);
  b.register("eyes", eyes);

  b.lamp("lamp-a", [0, 2.4, 5], "#ffc880", 0.55, 9, true);
  b.lamp("lamp-b", [0, 2.4, 13], "#ffc880", 0.55, 9, true);
  b.lamp("lamp-c", [0, 2.4, 21], "#ffc880", 0.55, 9, true);
  b.lamp("lamp-d", [0, 2.4, 29], "#ffc880", 0.5, 9, true);
  const room = b.lamp("room", [0, 2.2, 34.5], "#fff0d0", 0.9, 8, false);
  room.light.setEnabled(false);

  b.figure(
    "woman",
    [0, 0, 35.2],
    {
      skin: "#d6d2c8",
      hair: "#060606",
      cloth: "#e8e4dc",
      eyes: "#000000",
      height: 0.95,
      longHair: true,
    },
    false,
  );

  return {
    custom: {
      loop: (g) => {
        g.camera.position.z -= 18;
      },
    },
  };
};
