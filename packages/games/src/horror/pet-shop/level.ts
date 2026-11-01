import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 閉店後のショッピングモール内ペットショップ。店内は x=-4〜4, z=0〜10、南（z=0）が店の入口 shop-door。
 * 東西の壁に2段のショーケース（ガラス張り、子犬・子猫 pet-*）。北壁中央に布を掛けた大型ケージ big-cage（x=0, z=9）と布 cloth、
 * その東に「STAFF ONLY」のバックヤード扉 staff-door（開かない）。中央にレジとエサ棚 food。
 * フック：petsStare（全部の動物が大型ケージの方を向いて固まる）、petsHide（全部がケースの奥に縮こまる）。
 * 最後は大型ケージの中にうずくまる crouch。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const floor = b.mat("#c8c8c0");
  const wall = b.mat("#e8e4d8");
  const ceiling = b.mat("#f0f0e8");
  const caseMat = b.mat("#d8d8d0");
  const glass = b.mat("#a0c0c8", { alpha: 0.25, specular: 0.9 });
  const counter = b.mat("#6a8a5a");
  const clothMat = b.mat("#3a2a50");
  const dark = b.mat("#050505");

  b.room("shop", [0, 0, 5], 8, 10, 2.8, { floor, wall, ceiling }, ["s"]);
  b.wallWithGap("front", "x", [0, 0, 0], 8, 2.8, [0, 1.8, 2.3], glass);
  b.door("shop-door", [-0.9, 0, 0], 1.8, 2.3, 0, glass, {
    open: true,
    interactive: false,
  });
  b.box("mall", [10, 0.2, 4], [0, -0.1, -2], b.mat("#8a8a84"));
  b.box("mall-block", [10, 4, 0.2], [0, 2, -2.2], dark).isVisible = false;
  b.box("mall-w", [0.2, 4, 2.2], [-4.5, 2, -1.1], dark).isVisible = false;
  b.box("mall-e", [0.2, 4, 2.2], [4.5, 2, -1.1], dark).isVisible = false;
  b.sign("shop-sign", ["ペットショップ わんにゃん"], [2.6, 0.4], [0, 2.55, -0.05], Math.PI, {
    bg: "#f8f0e0",
    fg: "#d05020",
    glow: 0.5,
  });

  // ---- ショーケースと動物 ----
  const pets: TransformNode[] = [];
  const eyeMat = b.mat("#000000", { emissive: "#203020" });
  const furs = ["#c8a070", "#f0ece0", "#5a4a3a", "#a0a0a0", "#d8b890", "#303030"];
  let n = 0;
  for (const side of [-1, 1]) {
    b.box(`case-${side}`, [0.5, 2.3, 8], [side * 3.75, 1.15, 5], caseMat);
    for (const [row, y] of [0.5, 1.4].entries()) {
      b.box(`shelf-${side}-${row}`, [0.6, 0.05, 8], [side * 3.22, y - 0.02, 5], caseMat, { collide: false });
      b.box(`top-${side}-${row}`, [0.6, 0.05, 8], [side * 3.22, y + 0.78, 5], caseMat, { collide: false });
      for (let k = 0; k < 5; k++) {
        const z = 1.6 + k * 1.5;
        b.box(`glass-${side}-${row}-${k}`, [0.03, 0.75, 1.4], [side * 2.93, y + 0.38, z], glass, {
          collide: false,
        });
        b.box(`hole-${side}-${row}-${k}`, [0.02, 0.7, 1.35], [side * 3.49, y + 0.38, z], b.mat("#f4f0e4", { emissive: "#302c24" }), {
          collide: false,
        });
        if ((k + row) % 4 === 3) {
          continue; // 空きケース
        }
        const pet = new TransformNode(`pet-${n}`, b.scene);
        pet.position.set(side * 3.2, y + 0.12, z);
        const fur = b.mat(furs[n % furs.length] ?? "#c8a070");
        const body = MeshBuilder.CreateSphere(`pet-${n}-body`, { diameter: 0.28 }, b.scene);
        body.scaling = new Vector3(1, 0.8, 1.3);
        body.material = fur;
        body.parent = pet;
        const head = MeshBuilder.CreateSphere(`pet-${n}-head`, { diameter: 0.18 }, b.scene);
        head.position = new Vector3(0, 0.14, 0.14);
        head.material = fur;
        head.parent = pet;
        for (const ex of [-0.04, 0.04]) {
          const eye = MeshBuilder.CreateSphere(`pet-${n}-eye-${ex}`, { diameter: 0.03 }, b.scene);
          eye.position = new Vector3(ex, 0.16, 0.22);
          eye.material = eyeMat;
          eye.parent = pet;
        }
        pet.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        pets.push(pet);
        n++;
      }
    }
  }
  // ケース前の見えない柵（ガラスに入り込まない）
  for (const side of [-1, 1]) {
    b.box(`case-guard-${side}`, [0.1, 2.2, 8], [side * 2.85, 1.1, 5], dark).isVisible = false;
  }

  // ---- 大型ケージと布 ----
  // 格子越しに中の人影を「見た」判定が通るよう、ケージはピック対象外にする
  b.box("big-cage", [1.8, 1.4, 1.2], [0, 0.7, 9.3], b.mat("#8a8a8a", { alpha: 0.3, specular: 0.6 })).isPickable = false;
  const cloth = b.box("cloth", [1.9, 1.45, 1.25], [0, 0.73, 9.3], clothMat);
  b.register("cloth", cloth);
  b.sign("cage-tag", ["大型犬用", "※ 布をめくらないでください"], [0.9, 0.3], [0, 1.6, 8.66], 0, {
    bg: "#f8f8f0",
    fg: "#a01010",
    glow: 0.4,
  });
  const crouch = b.figure(
    "crouch",
    [0, 0, 9.3],
    { skin: "#b8bcb8", cloth: "#d0ccc4", hair: "#050505", eyes: "#300000", height: 0.72 },
    false,
  );
  crouch.rotation.y = Math.PI;
  b.door("staff-door", [1.8, 0, 9.95], 0.9, 2.1, 0, b.mat("#5a6a7a"), {
    open: false,
    interactive: false,
    locked: true,
  });
  b.sign("staff-sign", ["STAFF ONLY"], [0.8, 0.2], [2.25, 2.25, 9.9], 0, {
    bg: "#202020",
    fg: "#ffffff",
    glow: 0.4,
  });

  // ---- レジとエサ棚 ----
  b.box("register-counter", [1.6, 1.0, 0.7], [1.6, 0.5, 3.5], counter);
  const food = b.box("food", [1.2, 1.2, 0.5], [-1.4, 0.6, 5], b.mat("#d8a040"));
  b.register("food", food);
  b.sign("food-label", ["ごはん（閉店後に配る）"], [1.1, 0.25], [-1.4, 1.35, 4.74], 0, {
    bg: "#f8f8f0",
    fg: "#303030",
    glow: 0.3,
  });

  // ---- 照明 ----
  b.lamp("shop", [0, 2.6, 3], "#f8f8ff", 0.55, 8, true);
  b.lamp("shop", [0, 2.6, 7.5], "#f8f8ff", 0.55, 8, true);
  b.lamp("cases", [0, 1.6, 5], "#fff0d0", 0.25, 6, false);
  const red = b.lamp("red", [0, 2.6, 9], "#ff2010", 0.35, 8, true);
  red.light.setEnabled(false);

  // ---- 動き ----
  const cagePos = new Vector3(0, 0.8, 9.3);
  return {
    custom: {
      petsStare: (g) => {
        for (const p of pets) {
          p.lookAt(new Vector3(cagePos.x, p.position.y, cagePos.z));
        }
        g.audio?.play("rattle", { x: 0, y: 1, z: 5 }, 0.3);
      },
      petsHide: (g) => {
        for (const p of pets) {
          p.position.x += p.position.x < 0 ? -0.25 : 0.25;
          p.scaling.setAll(0.8);
          p.rotation.set(0, p.position.x < 0 ? -Math.PI / 2 : Math.PI / 2, 0);
        }
        g.audio?.play("rattle", { x: 0, y: 1, z: 5 }, 0.6);
      },
    },
  };
};
