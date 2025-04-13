import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";

export function createLogo(scene: Scene): TransformNode {
  const root = new TransformNode("logoRoot", scene);

  const five1 = MeshBuilder.CreateBox(
    "five1",
    {
      width: 1,
      height: 0.1,
    },
    scene,
  );
  five1.position.y = 1;
  five1.parent = root;

  const five2 = MeshBuilder.CreateBox(
    "five2",
    {
      width: 0.1,
      height: 1,
    },
    scene,
  );
  five2.position.x = -0.45;
  five2.position.y = 0.5;
  five2.parent = root;

  const five3 = MeshBuilder.CreateBox(
    "five3",
    {
      width: 0.6,
      height: 0.1,
    },
    scene,
  );
  five3.position.y = 0;
  five3.parent = root;

  const five4 = MeshBuilder.CreateBox(
    "five4",
    {
      width: 0.1,
      height: 0.5,
    },
    scene,
  );
  five4.position.x = 0.25;
  five4.position.y = -0.25;
  five4.parent = root;

  const five5 = MeshBuilder.CreateBox(
    "five5",
    {
      width: 0.6,
      height: 0.1,
    },
    scene,
  );
  five5.position.y = -0.5;
  five5.parent = root;

  return root;
}
