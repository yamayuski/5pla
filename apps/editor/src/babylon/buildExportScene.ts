/**
 * 文書だけから書き出し用シーンを作る。グリッドや操作カメラは含めない。
 */
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Light } from "@babylonjs/core/Lights/light";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Node } from "@babylonjs/core/node";
import type { Scene } from "@babylonjs/core/scene";
import { buildNodeExtras, buildSceneExtras } from "../export/extras";
import { exportNameMap, exportNameOf } from "../export/names";
import { gltfMetadata } from "../export/schema";
import type { EditorDocument } from "../store/types";
import {
  applyExportedCamera,
  applyExportedLight,
  assignMaterial,
  createCamera,
  createLight,
  createPrimitive,
} from "./entities";
import { GltfInstances } from "./gltf";
import { MaterialLibrary } from "./materials";
import { applyTransform } from "./transform";
import "./sideEffects";

export async function populateExportScene(scene: Scene, document: EditorDocument): Promise<void> {
  const names = exportNameMap(document.nodes);
  const materials = new MaterialLibrary(scene);
  materials.sync(document.materials, document.assets);
  const gltf = new GltfInstances();
  const objects = new Map<string, Node>();

  for (const node of document.nodes) {
    const exportName = exportNameOf(names, node.id);
    if (node.type === "mesh") {
      const handle = createPrimitive(scene, node);
      handle.name = exportName;
      if (node.mesh.kind === "gltf" && node.mesh.assetId) {
        const asset = document.assets[node.mesh.assetId];
        if (asset) await gltf.attach(scene, asset, handle, null);
      }
      if (node.mesh.kind !== "gltf" || node.mesh.materialId) {
        assignMaterial(handle, materials.get(node.mesh.materialId));
      }
      objects.set(node.id, handle);
      continue;
    }
    if (node.type === "light") {
      objects.set(node.id, createLight(scene, node, exportName));
      continue;
    }
    objects.set(node.id, createCamera(scene, node, exportName));
  }

  for (const node of document.nodes) {
    const object = objects.get(node.id);
    if (!object) continue;
    const parent = node.parentId ? (objects.get(node.parentId) ?? null) : null;
    object.parent = parent;
    object.metadata = gltfMetadata(buildNodeExtras(node, exportNameOf(names, node.id)));
    if (node.type === "mesh" && object instanceof TransformNode) {
      applyTransform(object, node.transform);
      continue;
    }
    if (node.type === "light" && object instanceof Light) {
      applyExportedLight(object, node);
      continue;
    }
    if (node.type === "camera" && object instanceof Camera) {
      applyExportedCamera(object, node);
    }
  }

  scene.metadata = gltfMetadata(buildSceneExtras(document));
}
