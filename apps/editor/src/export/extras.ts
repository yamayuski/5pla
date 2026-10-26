/**
 * エディタ文書と scene extras の相互変換。Babylon を起動せずに往復できる。
 */
import { parseEditorDocument } from "../store/document";
import type { EditorDocument, EditorNode } from "../store/types";
import {
  EXTRAS_GENERATOR,
  EXTRAS_VERSION,
  FIVEPLA_EXTRAS_KEY,
  type FivePlaNodeExtras,
  type FivePlaSceneExtras,
} from "./schema";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function buildSceneExtras(document: EditorDocument): FivePlaSceneExtras {
  return {
    version: EXTRAS_VERSION,
    generator: EXTRAS_GENERATOR,
    document: structuredClone(document),
  };
}

export function buildNodeExtras(node: EditorNode, exportName: string): FivePlaNodeExtras {
  return {
    version: EXTRAS_VERSION,
    id: node.id,
    exportName,
    type: node.type,
    physics: node.type === "mesh" ? node.mesh.physics : null,
    materialId: node.type === "mesh" ? node.mesh.materialId : null,
  };
}

/** extras を検証し、知っているフィールドだけで組み直す。 */
export function parseSceneExtras(value: unknown): FivePlaSceneExtras {
  if (!isRecord(value) || value.version !== EXTRAS_VERSION) {
    throw new Error("Unsupported 5pla extras");
  }
  return {
    version: EXTRAS_VERSION,
    generator: EXTRAS_GENERATOR,
    document: parseEditorDocument(value.document),
  };
}

export function documentFromExtras(extras: FivePlaSceneExtras): EditorDocument {
  return structuredClone(extras.document);
}

export function readSceneExtrasValue(value: unknown): FivePlaSceneExtras | null {
  if (!isRecord(value)) return null;
  const payload = value[FIVEPLA_EXTRAS_KEY];
  if (!isRecord(payload)) return null;
  try {
    return parseSceneExtras(payload);
  } catch {
    return null;
  }
}
