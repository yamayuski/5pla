/**
 * glTF の extras に載せる 5pla スキーマ。
 *
 * glTF はメッシュ、PBR、KHR_lights_punctual のライト、透視カメラ、親子関係を持つ。
 * フォグ、DefaultRenderingPipeline、パーティクル、Havok 物理、半球光、
 * ArcRotate の軌道パラメータは持てない。それらを含むエディタ文書全体を
 * `scene.extras["5pla"].document` に入れる。
 *
 * 各ノードの `extras["5pla"]` には id と物理だけを置き、ビューアでノードを
 * 開いたときに設定が追えるようにする。
 *
 * エディタ専用のグリッド、軸、操作カメラ、ギズモは文書に入らないので
 * 書き出されない。
 */
import type { EditorDocument, EditorNode, MeshPhysics } from "../store/types";

export const FIVEPLA_EXTRAS_KEY = "5pla";
export const EXTRAS_VERSION = 1 as const;
export const EXTRAS_GENERATOR = "5pla-editor";

export interface FivePlaSceneExtras {
  version: typeof EXTRAS_VERSION;
  generator: typeof EXTRAS_GENERATOR;
  document: EditorDocument;
}

export interface FivePlaNodeExtras {
  version: typeof EXTRAS_VERSION;
  id: string;
  exportName: string;
  type: EditorNode["type"];
  physics: MeshPhysics | null;
  materialId: string | null;
}

/** Babylon の metadata.gltf.extras に入れるオブジェクト。 */
export function gltfMetadata(extras: unknown): {
  gltf: { extras: Record<string, unknown> };
} {
  return {
    gltf: {
      extras: {
        [FIVEPLA_EXTRAS_KEY]: extras,
      },
    },
  };
}
