import { PBRMetallicRoughnessMaterial } from "@babylonjs/core/Materials/PBR/pbrMetallicRoughnessMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";

export function createLogo(scene: Scene): TransformNode {
  const five = createFive(scene);
  return five;
}

function createFive(scene: Scene): TransformNode {
  const root = new TransformNode("logoRoot", scene);

  // from 5.gltf
  const colors = [
    [1, 0, 0, 1],
    [1, 0.37626212298046485, 0, 1],
    [1, 1, 0, 1],
    [0, 0.21586050010324417, 0, 1],
    [0, 0, 1, 1],
  ] as const;

  const five1 = MeshBuilder.CreateBox(
    "five1",
    {
      width: 1,
      height: 0.3,
      depth: 0.3,
    },
    scene,
  );
  five1.position.y = 1;
  five1.parent = root;
  const five1mat = new PBRMetallicRoughnessMaterial("five1Material", scene);
  five1mat._albedoColor = new Color3(colors[0][0], colors[0][1], colors[0][2]);
  five1.material = five1mat;

  const five2 = five1.clone();
  const five2mat = five1mat.clone("five2Material");
  five2mat._albedoColor = new Color3(colors[1][0], colors[1][1], colors[1][2]);
  five2.material = five2mat;
  five2.scaling.x *= 0.5;
  five2.position.y -= 0.4;
  five2.position.x += 0.35;
  five2.rotation.z += Math.PI / 2;

  const five3 = five1.clone();
  const five3mat = five1mat.clone("five3Material");
  five3mat._albedoColor = new Color3(colors[2][0], colors[2][1], colors[2][2]);
  five3.material = five3mat;
  five3.position.y -= 0.8;
  five3.rotation.z += Math.PI;

  const five4 = five1.clone();
  const five4mat = five1mat.clone("five4Material");
  five4mat._albedoColor = new Color3(colors[3][0], colors[3][1], colors[3][2]);
  five4.material = five4mat;
  five4.scaling.x *= 0.5;
  five4.position.x = -0.35;
  five4.position.y -= 1.2;
  five4.rotation.z += Math.PI / 2;

  const five5 = five1.clone();
  const five5mat = five1mat.clone("five5Material");
  five5mat._albedoColor = new Color3(colors[4][0], colors[4][1], colors[4][2]);
  five5.material = five5mat;
  five5.position.y -= 1.6;

  return root;
}
