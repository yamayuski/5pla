/**
 * 文書を GLB にする。GLTF2Export がメッシュと対応ライトを書き、
 * フォグや物理は scene.extras["5pla"] に残す。
 */
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Scene } from "@babylonjs/core/scene";
import { GLTF2Export } from "@babylonjs/serializers/glTF/2.0/glTFSerializer";
import type { Node } from "@babylonjs/core/node";
import { populateExportScene } from "../babylon/buildExportScene";
import { readMetadata } from "../babylon/metadata";
import type { EditorDocument } from "../store/types";
import "../babylon/sideEffects";

export async function exportDocumentGlb(document: EditorDocument): Promise<Uint8Array> {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    await populateExportScene(scene, document);
    const data = await GLTF2Export.GLBAsync(scene, "scene", {
      shouldExportNode: (node: Node) => readMetadata(node).editorOnly !== true,
      exportWithoutWaitingForScene: true,
    });
    const file = data.files["scene.glb"];
    if (!(file instanceof Blob)) {
      throw new Error("GLB export did not produce a binary");
    }
    return new Uint8Array(await file.arrayBuffer());
  } finally {
    scene.dispose();
    engine.dispose();
  }
}
