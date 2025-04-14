import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import { SkyMaterial } from "@babylonjs/materials/sky";

export function createSky(scene: Scene): Mesh {
  const skyMat = new SkyMaterial("sky", scene);
  skyMat.backFaceCulling = false;
  skyMat.luminance = 1;
  skyMat.inclination = -0.35;

  const skybox = MeshBuilder.CreateBox("skybox", {
    size: 10000,
    updatable: false,
  });
  skybox.infiniteDistance = true;

  skybox.material = skyMat;
  return skybox;
}
