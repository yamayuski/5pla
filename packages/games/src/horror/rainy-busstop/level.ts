import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 雨の夜の田舎のバス停（屋外）。道路は x=-6〜6, z=-4〜36。バス停の小屋は x=4.2〜6, z=8〜12（西向きに開放）。
 * 時刻表(timetable)は小屋の奥の壁。遠くの街灯(z=26)の下に傘の女(umbrella)。バス(bus)は一度だけ通り過ぎる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const asphalt = b.mat("#1c1e22", { specular: 0.6 });
  const verge = b.mat("#1c2a1c");
  const metal = b.mat("#6a7078", { specular: 0.5 });
  const wood = b.mat("#5a4a38");
  const busBody = b.mat("#c8c0a0");
  const busGlass = b.mat("#101820", { emissive: "#182838" });
  const umbrellaMat = b.mat("#14141a");

  b.box("road", [12, 0.2, 40], [0, -0.1, 16], asphalt);
  b.box(
    "lane-line",
    [0.15, 0.02, 40],
    [0, 0.01, 16],
    b.mat("#c8c8a0", { emissive: "#403c20" }),
    { collide: false },
  );
  b.box("verge-e", [3, 0.25, 40], [7.5, -0.1, 16], verge);
  for (const [n, size, pos] of [
    ["block-w", [0.2, 4, 40], [-6.2, 2, 16]],
    ["block-e", [0.2, 4, 40], [9, 2, 16]],
    ["block-s", [20, 4, 0.2], [0, 2, -4.2]],
    ["block-n", [20, 4, 0.2], [0, 2, 36.2]],
  ] as const) {
    b.box(n, size, pos, verge).isVisible = false;
  }

  // ---- バス停の小屋 ----
  b.box("shelter-back", [0.15, 2.4, 4], [6, 1.2, 10], metal);
  b.box("shelter-n", [1.8, 2.4, 0.1], [5.1, 1.2, 12], metal);
  b.box("shelter-s", [1.8, 2.4, 0.1], [5.1, 1.2, 8], metal);
  b.box("shelter-roof", [2.0, 0.12, 4.2], [5.1, 2.45, 10], metal, {
    collide: false,
  });
  b.box("bench", [0.5, 0.45, 2.4], [5.6, 0.23, 10], wood);
  b.sign(
    "timetable",
    ["時刻表", "最終 23:50", "（本日は運行終了）"],
    [1.4, 0.9],
    [5.9, 1.6, 10],
    Math.PI / 2,
    {
      bg: "#e8e8d8",
      fg: "#181818",
      glow: 0.35,
    },
  );
  b.cylinder("stop-pole", 2.6, 0.08, [3.9, 1.3, 7.5], metal, {
    collide: false,
  });
  b.lamp("shelter", [5, 2.2, 10], "#f0f0c8", 0.6, 7, true);

  // ---- 街灯 ----
  b.cylinder("lamp-pole", 5, 0.15, [3, 2.5, 26], metal, { collide: false });
  b.lamp("far", [3, 5, 26], "#ffe8b0", 0.9, 12, true);

  // ---- バス ----
  const bus = new TransformNode("bus", b.scene);
  bus.position.set(-2.5, 0, 46);
  b.box("bus-body", [2.4, 2.8, 8], [0, 1.6, 0], busBody, {
    collide: false,
    parent: bus,
  });
  b.box("bus-windows", [2.42, 0.9, 7.2], [0, 2.2, 0], busGlass, {
    collide: false,
    parent: bus,
  });
  b.box(
    "bus-head",
    [2.0, 0.4, 0.1],
    [0, 0.9, -4.02],
    b.mat("#fffbd0", { emissive: "#fffbd0" }),
    {
      collide: false,
      parent: bus,
    },
  );
  b.register("bus", bus);
  bus.setEnabled(false);
  b.lamp("bus", [-2.5, 1.2, 40], "#fff8d0", 1.0, 14, false).light.setEnabled(
    false,
  );

  // ---- 傘の女 ----
  const woman = b.figure(
    "umbrella",
    [3, 0, 28],
    {
      skin: "#c8c8c4",
      hair: "#060606",
      cloth: "#e8e4dc",
      eyes: "#000000",
      height: 1.08,
      longHair: true,
    },
    false,
  );
  woman.rotation.y = Math.PI;
  const canopy = b.cylinder(
    "umbrella-canopy",
    0.35,
    1.5,
    [0, 1.7, 0],
    umbrellaMat,
    {
      collide: false,
      diameterTop: 0.1,
    },
  );
  canopy.parent = woman;
  b.cylinder("umbrella-stick", 0.9, 0.04, [0, 1.35, 0.1], umbrellaMat, {
    collide: false,
  }).parent = woman;
  b.figure(
    "ghost",
    [0, 0, -40],
    {
      skin: "#c8c8c4",
      hair: "#060606",
      cloth: "#e8e4dc",
      eyes: "#000000",
      height: 1.08,
      longHair: true,
    },
    false,
  );

  return {};
};
