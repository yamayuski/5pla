import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 雨の夜の無人の交番。室内は x=-3〜3, z=0〜6（南が入口のガラス戸 front-door、雨の街）。
 * 中央に机 desk（z=3.5）、電話 phone、机の向こうに警官 officer（z=4.6）。
 * 西壁に掲示板 poster-a / poster-b、北壁の戸 back-door の奥が仮眠室（z=6〜9）。
 * フック：phoneShake（受話器が小さく揺れる）。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#6a6a62");
  const wall = b.mat("#b9b6a6");
  const ceil = b.mat("#d0cfc4");
  const glass = b.mat("#0a1018", { alpha: 0.4, specular: 0.8 });
  const wood = b.mat("#4a3524");
  const metal = b.mat("#3a3d42");
  const dark = b.mat("#0a0a0a");
  const invisible = b.mat("#000000");

  // 外の地面（雨の路面）と見えない柵
  b.box("street", [14, 0.2, 8], [0, -0.1, -4], b.mat("#15181c"));
  for (const [n, size, pos] of [
    ["edge-s", [14, 4, 0.2], [0, 2, -7.5]],
    ["edge-w", [0.2, 4, 8], [-7, 2, -4]],
    ["edge-e", [0.2, 4, 8], [7, 2, -4]],
  ] as const) {
    b.box(n, size, pos, invisible).isVisible = false;
  }

  // 交番本体
  b.room("koban", [0, 0, 3], 6, 6, 3, { floor, wall, ceiling: ceil }, ["s", "n"]);
  b.wallWithGap("front", "x", [0, 0, 0], 6, 3, [0, 1.1, 2.2], glass);
  b.door("front-door", [-0.55, 0, 0], 1.1, 2.2, 0, glass, { open: true, interactive: false });
  b.wallWithGap("back-wall", "x", [0, 0, 6], 6, 3, [2, 1, 2.1], wall);
  b.door("back-door", [1.5, 0, 6], 1, 2.1, 0, wood, { interactive: false });
  b.room("rest", [0, 0, 7.5], 6, 3, 3, { floor: b.mat("#5a4a3c"), wall, ceiling: ceil }, ["s"]);
  b.box("bunk", [1.0, 0.5, 2.2], [-2.0, 0.25, 8], b.mat("#6a6a8a"));

  // 机・椅子・電話
  const desk = b.box("desk", [2.4, 0.75, 0.9], [0, 0.375, 3.4], wood);
  desk.isPickable = false;
  b.box("chair", [0.5, 0.5, 0.5], [0.2, 0.25, 4.4], metal, { collide: false }).isPickable = false;
  const phone = b.box("phone", [0.3, 0.15, 0.25], [-0.6, 0.83, 3.2], dark, { collide: false });
  b.register("phone", phone);
  b.box("ledger", [0.4, 0.04, 0.3], [0.5, 0.77, 3.3], b.mat("#2a4a2a"), { collide: false });
  b.box("cabinet", [1.2, 1.8, 0.5], [-2.2, 0.9, 5.6], metal);
  const radio = b.box("radio", [0.35, 0.25, 0.2], [2.5, 1.2, 5.7], dark, { collide: false });
  b.register("radio", radio);
  b.box("shelf", [0.5, 1.2, 1.4], [2.6, 0.6, 5.0], metal);

  // 掲示板（西壁）
  b.sign("poster-a", ["指名手配", "氏名不詳  男  三十代", "情報をお寄せください"], [1.0, 0.7], [-2.88, 1.7, 3], -Math.PI / 2, {
    bg: "#e8e2c8",
    fg: "#601010",
    glow: 0.15,
  });
  const posterB = b.sign("poster-b", ["指名手配", "氏名  あなた", "本日 23:48 この場所で"], [1.0, 0.7], [-2.87, 1.7, 3], -Math.PI / 2, {
    bg: "#e8e2c8",
    fg: "#b00000",
    glow: 0.25,
  });
  posterB.setEnabled(false);
  b.sign("hours", ["ただいま巡回中", "御用の方は赤色電話で"], [1.2, 0.5], [0, 2.4, 0.12], 0, {
    bg: "#f0f0e8",
    fg: "#202020",
    glow: 0.3,
  });
  b.sign("rain-sign", ["交番", "KOBAN"], [1.2, 0.4], [2.2, 2.6, 0.12], 0, { bg: "#101830", fg: "#ffffff", glow: 0.5 });

  b.lamp("koban", [-1, 2.8, 2], "#e8f0ff", 0.8, 8, true);
  b.lamp("koban", [1.5, 2.8, 4.5], "#e8f0ff", 0.7, 8, true);
  b.lamp("rest", [0, 2.6, 7.5], "#ffd8a0", 0.4, 6, true);

  // 警官（机の向こう、入口側を向く）
  const officer = b.figure(
    "officer",
    [0.2, 0, 4.7],
    { skin: "#b8bcb8", cloth: "#15203a", hair: "#050505", eyes: "#000000" },
    false,
  );
  officer.rotation.y = Math.PI;

  let shake = 0;
  return {
    update: (g, dt) => {
      if (shake > 0) {
        shake = Math.max(0, shake - dt);
        phone.rotation.y = Math.sin(g.elapsed * 40) * 0.08;
      } else {
        phone.rotation.y = 0;
      }
    },
    custom: {
      phoneShake: (g) => {
        shake = 3;
        g.audio?.play("phone", { x: -0.6, y: 0.9, z: 3.2 }, 0.7);
      },
    },
  };
};
