import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel, HorrorGame } from "./kit/game";
import type { Vec3 } from "./kit/types";

/** 雑居ビルのエレベーター（かご・ホール・廊下・オフィス）を組み立てる */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const scene = b.scene;
  const carWall = b.mat("#8c8f8a", { specular: 0.5 });
  const carFloor = b.mat("#3a3a3a");
  const steel = b.mat("#a9adb0", { specular: 0.9 });
  const hallWall = b.mat("#bdb8ad");
  const hallFloor = b.mat("#55524c", { specular: 0.2 });
  const ceiling = b.mat("#d8d8d2");
  const carpet = b.mat("#3b4250");
  const desk = b.mat("#a8a294");
  const H = 2.6;

  /** 文字を書き換えられる表示板 */
  const display = (
    name: string,
    size: readonly [number, number],
    pos: Vec3,
    rotY: number,
    fg: string,
  ) => {
    const tex = new DynamicTexture(
      `${name}-tex`,
      { width: 256, height: 128 },
      scene,
      true,
    );
    const plane = MeshBuilder.CreatePlane(
      name,
      { width: size[0], height: size[1], sideOrientation: 2 },
      scene,
    );
    plane.position = new Vector3(pos[0], pos[1], pos[2]);
    plane.rotation.y = rotY;
    plane.isPickable = false;
    const m = new StandardMaterial(`${name}-mat`, scene);
    m.diffuseColor = Color3.Black();
    m.specularColor = Color3.Black();
    m.emissiveTexture = tex;
    m.disableLighting = true;
    plane.material = m;
    return (text: string) => {
      const ctx = tex.getContext() as unknown as CanvasRenderingContext2D;
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = fg;
      ctx.font = "bold 84px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 128, 66);
      tex.update();
    };
  };

  // ---- かご（x=-1〜1, z=-1〜1, 扉は +z）----
  b.box("car-floor", [2, 0.2, 2], [0, -0.1, 0], carFloor);
  b.box("car-ceil", [2, 0.2, 2], [0, H + 0.1, 0], carWall);
  b.box("car-w", [0.1, H, 2], [-1.05, H / 2, 0], carWall);
  b.box("car-e", [0.1, H, 2], [1.05, H / 2, 0], carWall);
  b.box("car-back-wall", [2, H, 0.1], [0, H / 2, -1.05], steel);
  b.box("car-front-l", [0.45, H, 0.1], [-0.825, H / 2, 1.05], carWall);
  b.box("car-front-r", [0.45, H, 0.1], [0.825, H / 2, 1.05], carWall);
  b.box(
    "car-front-top",
    [1.2, H - 2.1, 0.1],
    [0, 2.1 + (H - 2.1) / 2, 1.05],
    carWall,
  );
  b.box("car-rail", [1.8, 0.05, 0.05], [0, 0.9, -0.97], steel, {
    collide: false,
  });
  const doorL = b.box("door-l", [0.62, 2.1, 0.05], [-0.3, 1.05, 1.12], steel);
  const doorR = b.box("door-r", [0.62, 2.1, 0.05], [0.3, 1.05, 1.12], steel);
  b.register("door-l", doorL);
  b.register("door-r", doorR);
  // 乗った後に出られなくする不可視の壁
  const block = b.box(
    "doorway-block",
    [1.2, 2.1, 0.1],
    [0, 1.05, 0.95],
    carWall,
  );
  block.isVisible = false;
  block.isPickable = false;
  block.setEnabled(false);
  b.register("doorway-block", block);
  // 操作盤
  const panel = b.box(
    "panel",
    [0.04, 0.6, 0.25],
    [0.99, 1.2, 0.6],
    b.mat("#222", { specular: 0.6 }),
  );
  b.register("panel", panel);
  for (let i = 0; i < 6; i++) {
    const btn = b.cylinder(
      `btn-${i}`,
      0.02,
      0.05,
      [0.965, 1.0 + i * 0.08, 0.6],
      b.mat("#e6e2d0", { emissive: "#332e1a" }),
      { collide: false },
    );
    btn.rotation.z = Math.PI / 2;
    btn.isPickable = false;
  }
  const carIndicator = display(
    "car-indicator",
    [0.4, 0.2],
    [0, 2.32, 0.99],
    0,
    "#ff8a2a",
  );
  // 振り返り判定用（かごの奥の壁）
  const back = MeshBuilder.CreateBox("car-back", { size: 0.3 }, scene);
  back.position = new Vector3(0, 1.5, -0.85);
  back.isVisible = false;
  back.isPickable = false;
  b.register("car-back", back);

  // ---- エレベーターホール（z=1.1〜5）----
  b.box("hall-floor", [8, 0.2, 4], [0, -0.1, 3.1], hallFloor);
  b.box("hall-ceil", [8, 0.2, 4], [0, H + 0.1, 3.1], ceiling);
  b.box("hall-s-l", [3, H, 0.2], [-2.5, H / 2, 1.2], hallWall);
  b.box("hall-s-r", [3, H, 0.2], [2.5, H / 2, 1.2], hallWall);
  b.box("hall-e", [0.2, H, 4], [4, H / 2, 3.1], hallWall);
  b.wallWithGap("hall-n", "x", [0, 0, 5.1], 8, H, [0, 2, 2.2], hallWall);
  const callBtn = b.box(
    "call-button",
    [0.12, 0.2, 0.04],
    [1.35, 1.2, 1.32],
    b.mat("#ddd", { specular: 0.6 }),
  );
  b.register("call-button", callBtn);
  const callLampMat = b.mat("#553311");
  const callLamp = b.box(
    "call-lamp",
    [0.05, 0.05, 0.02],
    [1.35, 1.24, 1.35],
    callLampMat,
    { collide: false },
  );
  callLamp.isPickable = false;
  const hallIndicator = display(
    "hall-indicator",
    [0.4, 0.2],
    [0, 2.32, 1.32],
    Math.PI,
    "#ff8a2a",
  );
  const floorSign = display(
    "floor-sign",
    [0.9, 0.45],
    [2.4, 1.7, 4.99],
    0,
    "#e8e8e8",
  );

  // ---- 北の廊下（z=5〜20）----
  b.room(
    "corridor",
    [0, 0, 12.6],
    2.2,
    15,
    H,
    { floor: carpet, wall: hallWall, ceiling },
    ["s"],
  );
  for (let z = 7; z < 20; z += 4) {
    b.box(
      `office-door-${z}`,
      [0.06, 2.0, 0.9],
      [-1.06, 1.0, z],
      b.mat("#6b5a46"),
      { collide: false },
    );
  }

  // ---- 西のオフィス（x=-10〜-4）----
  b.room(
    "office",
    [-7, 0, 4],
    6,
    6,
    H,
    { floor: carpet, wall: hallWall, ceiling },
    ["e"],
  );
  b.wallWithGap("office-e", "z", [-4, 0, 4], 6, H, [-1, 1.6, 2.2], hallWall);
  for (const [x, z] of [
    [-8.5, 2.5],
    [-8.5, 5.5],
    [-6, 5.5],
  ] as const) {
    b.box(`desk-${x}-${z}`, [1.4, 0.75, 0.8], [x, 0.375, z], desk);
    b.box(
      `pc-${x}-${z}`,
      [0.5, 0.35, 0.05],
      [x, 0.95, z + 0.2],
      b.mat("#111", { emissive: "#1d2c3a" }),
      { collide: false },
    );
  }
  b.box("desk-mine", [1.4, 0.75, 0.8], [-6, 0.375, 2.5], desk);
  b.box(
    "pc-mine",
    [0.5, 0.35, 0.05],
    [-6, 0.95, 2.3],
    b.mat("#111", { emissive: "#6a8fb0" }),
    { collide: false },
  );
  b.sign(
    "memo",
    ["夜間 エレベーター", "13 のボタンは", "押さないでください", "― 管理会社"],
    [0.5, 0.6],
    [-9.89, 1.5, 4],
    -Math.PI / 2,
    { bg: "#f2efe4", fg: "#333" },
  );

  // ---- 人影（廊下の奥・最後のジャンプスケア）----
  const shadow = b.figure("shadow", [0, 0, 14], {
    cloth: "#060606",
    skin: "#0b0b0b",
    hair: "#020202",
    eyes: "#f4f4f4",
    height: 1.12,
    longHair: false,
  });
  shadow.rotation.y = Math.PI;

  // ---- 照明 ----
  b.lamp("office", [-7, 2.5, 3], "#f4f6ff", 0.7, 9);
  b.lamp("hall", [0, 2.5, 3], "#f4f6ff", 0.6, 7);
  b.lamp("corridor", [0, 2.5, 14], "#e0e6ff", 0.35, 6);
  b.lamp("car", [0, 2.5, 0], "#fff8e8", 0.7, 4);

  carIndicator("7");
  hallIndicator("1");
  floorSign("7F");

  const slide = (g: HorrorGame, open: boolean, seconds: number) => {
    g.run({
      type: "move",
      target: "door-l",
      to: [open ? -0.9 : -0.3, 1.05, 1.12],
      duration: seconds,
    });
    g.run({
      type: "move",
      target: "door-r",
      to: [open ? 0.9 : 0.3, 1.05, 1.12],
      duration: seconds,
    });
  };
  const count = (g: HorrorGame, floors: string[], step: number) => {
    floors.forEach((f, i) => {
      g.later(i * step, () => {
        carIndicator(f);
        hallIndicator(f);
      });
    });
  };

  return {
    custom: {
      callLamp: (g) => {
        callLampMat.emissiveColor = new Color3(1, 0.6, 0.2);
        count(g, ["2", "3", "4", "5", "6", "7"], 0.8);
        g.later(5, () => {
          callLampMat.emissiveColor = Color3.Black();
        });
      },
      openDoors: (g) => slide(g, true, 1.2),
      closeDoors: (g) => slide(g, false, 1.2),
      closeDoorsSlow: (g) => {
        slide(g, false, 3.5);
        g.run({
          type: "sound",
          sound: "creak",
          at: [0, 1.2, 1.1],
          volume: 0.6,
        });
      },
      rideDown: (g) => count(g, ["7", "6", "5", "4"], 1.8),
      arriveFloor4: () => floorSign("4F"),
      rideLoop: (g) => count(g, ["4", "3", "4", "3", "4"], 1.3),
      rideUp: (g) =>
        count(g, ["4", "5", "6", "7", "8", "9", "10", "11", "12", "13"], 0.75),
      arriveFloor13: () => {
        floorSign("13F");
        carIndicator("13");
        hallIndicator("13");
      },
    },
  };
};
