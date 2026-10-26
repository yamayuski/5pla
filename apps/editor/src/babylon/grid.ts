/**
 * エディタ専用の地面グリッドと軸。文書にも glTF にも入れない。
 */
import { AxesViewer } from "@babylonjs/core/Debug/axesViewer";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";
import type { EditorMetadata } from "./metadata";

export interface EditorHelpers {
  dispose: () => void;
}

export function createEditorHelpers(scene: Scene): EditorHelpers {
  const grid = MeshBuilder.CreateGround("__editorGrid", { width: 40, height: 40 }, scene);
  const material = new GridMaterial("__editorGridMat", scene);
  material.majorUnitFrequency = 5;
  material.minorUnitVisibility = 0.45;
  material.gridRatio = 1;
  material.mainColor = new Color3(0.35, 0.36, 0.4);
  material.lineColor = new Color3(0.62, 0.58, 0.5);
  material.opacity = 0.9;
  material.backFaceCulling = false;
  grid.material = material;
  grid.isPickable = false;
  grid.position.y = 0;
  const metadata: EditorMetadata = { editorOnly: true };
  grid.metadata = metadata;
  grid.doNotSerialize = true;

  const axes = new AxesViewer(scene, 1.25);
  for (const axis of [axes.xAxis, axes.yAxis, axes.zAxis]) {
    axis.metadata = { editorOnly: true } satisfies EditorMetadata;
    axis.doNotSerialize = true;
    for (const mesh of axis.getChildMeshes(false)) mesh.isPickable = false;
  }

  return {
    dispose: () => {
      axes.dispose();
      grid.dispose(false, true);
      material.dispose();
    },
  };
}
