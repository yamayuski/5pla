import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "@5pla/horror-kit/builders";
import type { BuildLevel } from "@5pla/horror-kit/game";

/**
 * 港の外れの堤防（屋外）。堤防の上は x=-1.5〜1.5, z=0〜24（幅3m）、両側は夜の海（y=-1.2）。
 * 南端（z=0〜2）が陸側の階段で、潮が満ちると flood（水面）と見えない壁で塞がる。先端（z=24）に赤い灯台 beacon（点滅）。
 * 自分の竿 rod と電気ウキ float（x=-3, z=12 の海面、フック floatSink で沈む）。
 * 少し先に座っている先客の釣り人 angler（フード姿、最初から居て海を向いている）、最後に飛び出すのは angler-face。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
  const concrete = b.mat("#5a5a58");
  const sea = b.mat("#04080c", { alpha: 0.92, specular: 1 });
  const tetra = b.mat("#6a6a66");
  const red = b.mat("#c02010", { emissive: "#400800" });
  const dark = b.mat("#000000");

  b.box("pier", [3, 1.2, 24], [0, -0.6, 12], concrete);
  b.box("sea", [60, 0.05, 60], [0, -1.2, 12], sea, { collide: false });
  for (const side of [-1, 1]) {
    b.box(`edge-${side}`, [0.1, 3, 24], [side * 1.55, 1.5, 12], dark).isVisible = false;
    for (let k = 0; k < 8; k++) {
      const t = b.box(`tetra-${side}-${k}`, [1.2, 1.2, 1.2], [side * 2.4, -1.0, 2 + k * 3], tetra, { collide: false });
      t.rotation.set(0.6 * k, 0.8 * k, 0.4);
    }
  }
  b.box("end-n", [3, 3, 0.1], [0, 1.5, 24], dark).isVisible = false;
  b.box("end-s", [3, 3, 0.1], [0, 1.5, -0.6], dark).isVisible = false;
  b.box("stairs", [3, 0.6, 1.5], [0, -0.3, -0.2], concrete);

  // ---- 満ち潮で塞がる陸側 ----
  const flood = b.box("flood", [3.2, 0.05, 2.6], [0, 0.05, 1.3], sea, { collide: false });
  flood.setEnabled(false);
  b.register("flood", flood);
  const floodWall = b.box("flood-wall", [3, 3, 0.1], [0, 1.5, 2.7], dark);
  floodWall.isVisible = false;
  floodWall.checkCollisions = false;
  b.register("flood-wall", floodWall);

  // ---- 灯台 ----
  b.cylinder("beacon-tower", 3, 0.8, [0, 1.5, 23.2], b.mat("#d8d8d0"));
  const beacon = b.cylinder("beacon", 0.4, 0.5, [0, 3.2, 23.2], red, { collide: false });
  b.register("beacon", beacon);
  const beaconLamp = b.lamp("beacon", [0, 3.4, 22.6], "#ff3020", 0.6, 10, false);

  // ---- 自分の竿とウキ ----
  const rod = b.box("rod", [0.03, 0.03, 2.4], [-1.0, 0.9, 9.5], b.mat("#202020"), { collide: false });
  rod.rotation.set(-0.5, -0.6, 0);
  b.register("rod", rod);
  b.box("rod-stand", [0.3, 0.5, 0.3], [-0.9, 0.25, 8.8], b.mat("#3060a0"));
  b.box("cooler", [0.6, 0.4, 0.4], [0.6, 0.2, 8.6], b.mat("#e0e0e0"));
  const float = new TransformNode("float", b.scene);
  float.position.set(-3.2, -1.15, 12);
  b.cylinder("float-top", 0.25, 0.04, [0, 0.12, 0], b.mat("#40ff60", { emissive: "#40ff60" }), { collide: false }).parent = float;
  b.register("float", float);
  b.lamp("float", [-3.2, -0.6, 12], "#40ff60", 0.25, 3, false);

  // ---- 先客の釣り人 ----
  const angler = b.figure(
    "angler",
    [1.0, -0.45, 15.5],
    { skin: "#101010", cloth: "#2a3a2a", hair: "#2a3a2a", eyes: "#000000", longHair: false, height: 1.0 },
    true,
  );
  angler.rotation.y = Math.PI / 2;
  // 人影のパーツはピックされないので、声をかける判定用の透明な箱を子に付ける
  b.box("angler-hit", [0.6, 1.2, 0.6], [0, 0.9, 0], dark, { collide: false, parent: angler }).visibility = 0;
  b.box("angler-rod", [0.03, 0.03, 2.4], [1.6, 0.9, 15.5], b.mat("#202020"), { collide: false }).rotation.set(0, Math.PI / 2, -0.5);
  b.figure("angler-face", [0, 0, 10], { skin: "#a8b0b0", cloth: "#2a3a2a", hair: "#050505", eyes: "#000000" }, false);

  b.lamp("street", [0, 4, 3], "#d8e0ff", 0.4, 10, true);
  b.cylinder("street-pole", 4, 0.12, [1.3, 2, 3], b.mat("#5a5a5a"), { collide: false });

  // ---- 動き ----
  let sink = false;
  return {
    update: (g, dt) => {
      const on = Math.floor(g.elapsed / 2) % 2 === 0;
      beaconLamp.light.setEnabled(on && beaconLamp.light.intensity > 0);
      beacon.visibility = on ? 1 : 0.4;
      if (sink) {
        float.position.y = Math.max(-2.5, float.position.y - dt * 0.4);
      } else {
        float.position.y = -1.15 + Math.sin(g.elapsed * 1.6) * 0.03;
      }
    },
    custom: {
      floatSink: (g) => {
        sink = true;
        g.audio?.play("drip", { x: -3.2, y: -1, z: 12 }, 0.7);
      },
      floatUp: () => {
        sink = false;
      },
      beaconOff: () => {
        beaconLamp.light.intensity = 0;
      },
      floodIn: (g) => {
        flood.setEnabled(true);
        floodWall.checkCollisions = true;
        g.audio?.play("rumble", { x: 0, y: 0, z: 1 }, 0.7);
      },
    },
  };
};
