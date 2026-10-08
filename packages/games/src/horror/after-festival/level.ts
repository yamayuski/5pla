import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 夏祭りが終わったあとの、山あいの小さな神社（屋外）。
 * 南の鳥居（z=0）から北の拝殿（z=28）まで石畳の参道（x=-1.5〜1.5）。両脇に片付け途中の屋台と提灯の列。
 * 西の屋台（x=-4, z=12）がお面屋。拝殿の格子戸（x=0, z=27）は最後に内側から開く。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const ground = b.mat("#2a2620");
  const stone = b.mat("#6a665e");
  const vermilion = b.mat("#a8321e", { specular: 0.2 });
  const wood = b.mat("#5a4030");
  const darkWood = b.mat("#3a2a20");
  const tarp = b.mat("#2a4a8a");
  const lanternBody = b.mat("#5a2a1a");
  const lanternGlow = b.mat("#ff9a40", { emissive: "#ff7a20" });
  const trunk = b.mat("#2a2018");
  const leaves = b.mat("#0e1a10");
  const maskMat = b.mat("#f4f0e8", { emissive: "#3a3a36" });
  const maskRed = b.mat("#c01010", { emissive: "#600000" });

  b.box("ground", [40, 0.2, 44], [0, -0.1, 14], ground);
  b.box("path", [3, 0.02, 30], [0, 0.01, 14], stone, { collide: false });
  // 境内を囲む見えない柵（林の中へは出られない）
  for (const [n, size, pos] of [
    ["fence-w", [0.2, 3, 44], [-10, 1.5, 14]],
    ["fence-e", [0.2, 3, 44], [10, 1.5, 14]],
    ["fence-s", [20, 3, 0.2], [0, 1.5, -6]],
    ["fence-n", [20, 3, 0.2], [0, 1.5, 33]],
  ] as const) {
    b.box(n, size, pos, ground).isVisible = false;
  }
  // 杉林
  for (let i = 0; i < 14; i++) {
    for (const side of [-1, 1]) {
      const x = side * (8 + (i % 3) * 0.7);
      const z = -4 + i * 2.7;
      b.cylinder(`tree-${side}-${i}`, 7, 0.5, [x, 3.5, z], trunk);
      b.cylinder(`leaf-${side}-${i}`, 5, 2.4, [x, 7.5, z], leaves, {
        collide: false,
        diameterTop: 0.2,
      });
    }
  }

  // 鳥居（z=0）
  b.cylinder("torii-l", 4, 0.35, [-2.2, 2, 0], vermilion);
  b.cylinder("torii-r", 4, 0.35, [2.2, 2, 0], vermilion);
  b.box("torii-kasagi", [6.2, 0.35, 0.5], [0, 4.1, 0], vermilion, {
    collide: false,
  });
  b.box("torii-nuki", [5.2, 0.22, 0.3], [0, 3.4, 0], vermilion, {
    collide: false,
  });
  // 閉じ込め用のしめ縄と紙垂（最初は非表示、出現すると通れない）
  const rope = b.box(
    "shimenawa",
    [4.2, 0.18, 0.18],
    [0, 1.6, 0],
    b.mat("#c8b880"),
  );
  const shide: Mesh[] = [rope];
  for (let i = 0; i < 6; i++) {
    shide.push(
      b.box(
        `shide-${i}`,
        [0.12, 0.45, 0.02],
        [-1.75 + i * 0.7, 1.3, 0],
        b.mat("#f8f8f4", {
          emissive: "#4a4a48",
        }),
        { collide: false },
      ),
    );
  }
  const block = b.box("torii-block", [4.1, 3, 0.2], [0, 1.5, 0], ground);
  block.isVisible = false;
  shide.push(block);
  for (const m of shide) {
    m.setEnabled(false);
  }

  // 屋台（片付け途中）
  const stall = (name: string, x: number, z: number, title: string) => {
    b.box(`${name}-counter`, [2.2, 0.9, 1.0], [x, 0.45, z], wood);
    b.box(`${name}-roof`, [2.6, 0.08, 1.8], [x, 2.3, z], tarp, {
      collide: false,
    });
    for (const dx of [-1.1, 1.1]) {
      b.cylinder(
        `${name}-pole-${dx}`,
        2.3,
        0.08,
        [x + dx, 1.15, z + 0.6],
        darkWood,
        {
          collide: false,
        },
      );
    }
    b.sign(`${name}-sign`, [title], [1.6, 0.35], [x, 2.0, z - 0.85], 0, {
      bg: "#f4ecd8",
      fg: "#8a1a10",
      glow: 0.3,
    });
  };
  stall("yakisoba", 4, 6, "やきそば");
  stall("kingyo", -4, 6, "金魚すくい");
  stall("men", -4, 12, "お面");
  stall("ringo", 4, 12, "りんご飴");
  stall("shateki", 4, 18, "射的");

  // お面屋のお面（狐）。一つだけ空いた釘
  const masks: Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    if (i === 2) {
      b.box(
        "mask-nail",
        [0.03, 0.03, 0.06],
        [-4.8 + i * 0.4, 1.55, 11.1],
        darkWood,
        {
          collide: false,
        },
      );
      continue;
    }
    const m = b.box(
      `mask-${i}`,
      [0.28, 0.34, 0.04],
      [-4.8 + i * 0.4, 1.4, 11.1],
      maskMat,
      {
        collide: false,
      },
    );
    b.box(
      `mask-eye-${i}`,
      [0.18, 0.03, 0.01],
      [-4.8 + i * 0.4, 1.45, 11.075],
      maskRed,
      {
        collide: false,
      },
    );
    masks.push(m);
  }
  b.register("mask-stall", masks[0] as Mesh);

  // 提灯の列（参道の両脇、z=3〜24）。glow メッシュを消すと消灯に見える
  const glows: { side: number; mesh: Mesh }[] = [];
  for (let i = 0; i < 8; i++) {
    for (const side of [-1, 1]) {
      const x = side * 2.0;
      const z = 3 + i * 3;
      b.cylinder(
        `lantern-pole-${side}-${i}`,
        1.6,
        0.06,
        [x, 0.8, z],
        darkWood,
        {
          collide: false,
        },
      );
      b.cylinder(`lantern-${side}-${i}`, 0.42, 0.3, [x, 1.8, z], lanternBody, {
        collide: false,
      });
      glows.push({
        side,
        mesh: b.cylinder(
          `lantern-glow-${side}-${i}`,
          0.44,
          0.28,
          [x, 1.8, z],
          lanternGlow,
          {
            collide: false,
          },
        ),
      });
    }
  }

  // 拝殿（北）と賽銭箱・鈴
  b.box("haiden-floor", [8, 0.6, 5], [0, 0.3, 29.5], darkWood);
  b.box("haiden-roof", [10, 0.4, 7], [0, 4.4, 29.3], b.mat("#1e1a18"), {
    collide: false,
  });
  b.box("haiden-back", [8, 3.6, 0.2], [0, 2.4, 31.9], wood);
  b.box("haiden-w", [0.2, 3.6, 5], [-4, 2.4, 29.5], wood);
  b.box("haiden-e", [0.2, 3.6, 5], [4, 2.4, 29.5], wood);
  b.wallWithGap(
    "haiden-front",
    "x",
    [0, 0.6, 27.1],
    8,
    3.6,
    [0, 2.2, 2.6],
    wood,
  );
  b.door("haiden-door-l", [-1.3, 0.6, 27.1], 1.3, 2.6, 0, darkWood, {
    interactive: false,
  });
  b.door("haiden-door-r", [1.3, 0.6, 27.1], 1.3, 2.6, Math.PI, darkWood, {
    interactive: false,
  });
  b.box("saisen", [1.4, 0.7, 0.6], [0, 0.35, 26.2], wood);
  b.cylinder("suzu-rope", 2.2, 0.06, [0, 2.6, 26.6], b.mat("#c83a2a"), {
    collide: false,
  });
  b.cylinder(
    "suzu",
    0.3,
    0.32,
    [0, 3.7, 26.6],
    b.mat("#c8a030", { specular: 0.9 }),
    {
      collide: false,
    },
  );
  const wallet = b.box(
    "wallet",
    [0.2, 0.04, 0.12],
    [0.9, 0.04, 25.4],
    b.mat("#6a2a8a"),
    {
      collide: false,
    },
  );
  b.register("wallet", wallet);
  b.box("haiden-dark", [7.6, 3.2, 4.4], [0, 2.2, 29.6], b.mat("#000000"), {
    collide: false,
  });

  // ---- 照明 ----
  b.lamp("lanterns-s", [0, 2.6, 8], "#ff9a50", 0.45, 12, false);
  b.lamp("lanterns-n", [0, 2.6, 19], "#ff9a50", 0.45, 12, false);
  b.lamp("haiden", [0, 3.8, 25.5], "#ffd8a0", 0.35, 7, false);
  b.lamp("moon", [-6, 14, -6], "#a8b8ff", 0.25, 60, false);

  // ---- 最後の一発：お面屋から消えた狐面をかぶった女 ----
  const fox = b.figure(
    "fox",
    [0, 0, 50],
    {
      skin: "#d8d4cc",
      hair: "#060606",
      cloth: "#e8e0d0",
      eyes: "#000000",
      height: 1.0,
    },
    false,
  );
  const foxMask = b.box(
    "fox-mask",
    [0.26, 0.3, 0.04],
    [0, 1.47, 0.14],
    maskMat,
    {
      collide: false,
      parent: fox,
    },
  );
  foxMask.isPickable = false;
  for (const sx of [-1, 1]) {
    b.box(
      `fox-ear-${sx}`,
      [0.06, 0.12, 0.03],
      [sx * 0.09, 1.65, 0.13],
      maskMat,
      {
        collide: false,
        parent: fox,
      },
    ).isPickable = false;
    b.box(
      `fox-eye-${sx}`,
      [0.07, 0.02, 0.01],
      [sx * 0.06, 1.5, 0.165],
      maskRed,
      {
        collide: false,
        parent: fox,
      },
    ).isPickable = false;
  }

  const setLanterns = (side: number | null, on: boolean, stagger: number) => {
    const list = glows.filter((g) => side === null || g.side === side);
    return (game: { later(s: number, fn: () => void): void }) => {
      list.forEach((g, i) => {
        game.later(i * stagger, () => g.mesh.setEnabled(on));
      });
    };
  };

  return {
    custom: {
      westLanternsOut: setLanterns(-1, false, 0.6),
      allLanternsOut: setLanterns(null, false, 0.12),
      shimenawa: () => {
        for (const m of shide) {
          m.setEnabled(true);
        }
      },
    },
  };
};
