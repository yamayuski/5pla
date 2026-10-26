import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 駅前カラオケの 7 号室と、その前の廊下。
 * 個室は x=-2.5〜2.5, z=0〜5。北壁にモニター、西壁沿いにソファ、東壁に内線電話。
 * 南壁のガラス窓つきドアの外が廊下（z=-2.4〜0, x=-6〜6）。廊下の西側に 6 号室のドア。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const carpet = b.mat("#2a1c3a");
  const wall = b.mat("#3a3050");
  const ceiling = b.mat("#1a1622");
  const corridorWall = b.mat("#6a6458");
  const corridorFloor = b.mat("#4a4038");
  const sofa = b.mat("#6a1a2a", { specular: 0.3 });
  const table = b.mat("#2a2a2e", { specular: 0.6 });
  const black = b.mat("#0c0c10", { specular: 0.4 });
  const metal = b.mat("#9aa0a8", { specular: 0.9 });
  const glassDoor = b.mat("#8a8ea0", { alpha: 0.45, specular: 0.8 });
  const roomMats = { floor: carpet, wall, ceiling };

  // ---- 7 号室 ----
  b.room("room7", [0, 0, 2.5], 5, 5, 2.6, roomMats, ["s"]);
  b.wallWithGap("room7-s", "x", [0, 0, 0], 5.2, 2.6, [1.25, 0.9, 2.1], wall);
  b.door("room-door", [0.8, 0, 0], 0.9, 2.1, 0, glassDoor, {
    interactive: true,
  });

  // ソファ（西壁沿い）とテーブル
  b.box("sofa-seat", [0.7, 0.42, 4.2], [-2.1, 0.21, 2.6], sofa);
  b.box("sofa-back", [0.2, 0.5, 4.2], [-2.38, 0.67, 2.6], sofa, {
    collide: false,
  });
  b.box("table", [1.0, 0.45, 2.0], [-0.6, 0.225, 2.6], table);
  const remote = b.box(
    "remote",
    [0.3, 0.04, 0.22],
    [-0.6, 0.47, 2.2],
    b.mat("#1a1a20", { emissive: "#2a4a8a" }),
    { collide: false },
  );
  b.register("remote", remote);
  b.cylinder("mic-1", 0.22, 0.05, [-0.85, 0.56, 3.0], black, {
    collide: false,
  });
  b.cylinder("mic-2", 0.22, 0.05, [-0.4, 0.56, 3.1], black, { collide: false });
  b.cylinder("glass-1", 0.14, 0.08, [-0.5, 0.52, 1.9], metal, {
    collide: false,
  });

  // モニター（北壁）
  b.box("monitor-frame", [1.9, 1.15, 0.12], [0.3, 1.6, 4.92], black);
  const screen = { bg: "#0a1430", fg: "#e8f0ff", glow: 0.8 } as const;
  b.sign(
    "monitor-idle",
    ["♪ 曲を入れてください", "", "本日のおすすめ：夜明けまで"],
    [1.7, 0.95],
    [0.3, 1.6, 4.85],
    0,
    screen,
  );
  const song = b.sign(
    "monitor-song",
    ["♪ いつもの歌", "", "きみと はしった なつのみちを"],
    [1.7, 0.95],
    [0.3, 1.6, 4.84],
    0,
    screen,
  );
  song.setEnabled(false);
  const queue = b.sign(
    "monitor-queue",
    ["予約 1 件", "", "♪ ふたりで", "（デュエット）"],
    [1.7, 0.95],
    [0.3, 1.6, 4.83],
    0,
    { bg: "#2a0a14", fg: "#ffd0d0", glow: 0.8 },
  );
  queue.setEnabled(false);
  const duet = b.sign(
    "monitor-duet",
    ["♪ ふたりで", "", "うしろに いるよ", "ずっと いるよ"],
    [1.7, 0.95],
    [0.3, 1.6, 4.82],
    0,
    { bg: "#120004", fg: "#ff3030", glow: 0.9 },
  );
  duet.setEnabled(false);
  b.box("speaker-l", [0.35, 0.6, 0.3], [-1.3, 2.1, 4.8], black, {
    collide: false,
  });
  b.box("speaker-r", [0.35, 0.6, 0.3], [1.9, 2.1, 4.8], black, {
    collide: false,
  });

  // 内線電話（東壁）と料金表
  const phone = b.box(
    "phone",
    [0.1, 0.28, 0.18],
    [2.42, 1.3, 1.0],
    b.mat("#d8d4c8"),
    {
      collide: false,
    },
  );
  b.register("phone", phone);
  b.sign(
    "phone-label",
    ["フロント 9"],
    [0.3, 0.1],
    [2.38, 1.55, 1.0],
    Math.PI / 2,
    {
      bg: "#f0f0f0",
      fg: "#222",
      glow: 0.3,
    },
  );
  b.sign(
    "price-card",
    ["フリータイム 〜 5:00", "延長 30 分ごと"],
    [1.0, 0.45],
    [2.38, 1.7, 3.2],
    Math.PI / 2,
    { bg: "#f6e6a0", fg: "#3a2a10", glow: 0.25 },
  );
  // ミラーボール
  b.cylinder("mirrorball-chain", 0.3, 0.02, [0.3, 2.45, 2.6], metal, {
    collide: false,
  });
  b.cylinder("mirrorball", 0.25, 0.25, [0.3, 2.2, 2.6], metal, {
    collide: false,
    tess: 8,
  });

  // ---- 廊下 ----
  b.room(
    "corridor",
    [0, 0, -1.2],
    12,
    2.4,
    2.6,
    { floor: corridorFloor, wall: corridorWall, ceiling },
    ["n"],
  );
  b.box("corridor-n-w", [3.5, 2.6, 0.2], [-4.25, 1.3, 0], corridorWall);
  b.box("corridor-n-e", [3.5, 2.6, 0.2], [4.25, 1.3, 0], corridorWall);
  b.sign("room7-plate", ["7"], [0.3, 0.3], [1.25, 2.35, -0.12], 0, {
    bg: "#222",
    fg: "#ffd060",
    glow: 0.6,
  });
  b.door("room6-door", [-5, 0, -0.1], 0.9, 2.1, 0, b.mat("#4a4440"), {
    locked: true,
  });
  b.sign("room6-plate", ["6"], [0.3, 0.3], [-4.55, 2.35, -0.12], 0, {
    bg: "#222",
    fg: "#666",
    glow: 0.1,
  });
  b.sign("room6-paper", ["使用中止"], [0.5, 0.2], [-4.55, 1.5, -0.15], 0, {
    bg: "#f4f0e0",
    fg: "#a01010",
    glow: 0.2,
  });

  // ---- 照明 ----
  b.lamp("room", [0.3, 2.5, 1.4], "#b080ff", 0.4, 7);
  b.lamp("monitor", [0.3, 1.6, 4.4], "#6a88ff", 0.35, 4, false);
  b.lamp("corridor", [-3, 2.5, -1.2], "#fff0d8", 0.45, 6);
  b.lamp("corridor", [3, 2.5, -1.2], "#fff0d8", 0.45, 6);

  // ---- 廊下を横切る人影（最初は非表示） ----
  const passer = b.figure(
    "passer",
    [-5.5, 0, -1.2],
    { skin: "#c8c4bc", hair: "#050505", cloth: "#d8d4cc", height: 0.95 },
    false,
  );
  passer.rotation.y = Math.PI / 2;

  // ---- 最後の一発：6 号室の客 ----
  b.figure(
    "guest",
    [0, 0, 30],
    {
      skin: "#d0d2cc",
      hair: "#030303",
      cloth: "#d8d4cc",
      eyes: "#300000",
      height: 1.0,
      longHair: true,
    },
    false,
  );

  return {};
};
