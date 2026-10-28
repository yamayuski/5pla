/**
 * GLB の JSON チャンクを読み、scene.extras["5pla"] から文書を取り出す。
 * ローダがシーン extras を metadata にコピーしないため、バイト列からも読めるようにする。
 */
import { parseSceneExtras, readSceneExtrasValue } from "./extras";
import type { FivePlaSceneExtras } from "./schema";
import { FIVEPLA_EXTRAS_KEY } from "./schema";
import type { EditorDocument } from "../store/types";

const GLB_MAGIC = 0x46546c67;
const GLB_JSON = 0x4e4f534a;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readGlbJson(bytes: Uint8Array): unknown {
  if (bytes.byteLength < 20) throw new Error("GLB is too small");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== GLB_MAGIC) throw new Error("Not a GLB file");
  const chunkLength = view.getUint32(12, true);
  const chunkType = view.getUint32(16, true);
  if (chunkType !== GLB_JSON) throw new Error("GLB JSON chunk is missing");
  const jsonBytes = bytes.subarray(20, 20 + chunkLength);
  const text = new TextDecoder().decode(jsonBytes).trim();
  return JSON.parse(text) as unknown;
}

export function sceneExtrasFromGltf(gltf: unknown): FivePlaSceneExtras | null {
  if (!isRecord(gltf) || !Array.isArray(gltf.scenes)) return null;
  const scene = gltf.scenes[0];
  if (!isRecord(scene)) return null;
  return readSceneExtrasValue(scene.extras);
}

export function readEditorDocumentFromGlb(bytes: Uint8Array): EditorDocument | null {
  try {
    return sceneExtrasFromGltf(readGlbJson(bytes))?.document ?? null;
  } catch {
    return null;
  }
}

export function readSceneExtrasFromGlb(bytes: Uint8Array): FivePlaSceneExtras | null {
  try {
    const extras = sceneExtrasFromGltf(readGlbJson(bytes));
    return extras ? parseSceneExtras(extras) : null;
  } catch {
    return null;
  }
}

export function gltfNodeNames(gltf: unknown): string[] {
  if (!isRecord(gltf) || !Array.isArray(gltf.nodes)) return [];
  const names: string[] = [];
  for (const node of gltf.nodes) {
    if (isRecord(node) && typeof node.name === "string") names.push(node.name);
  }
  return names;
}

export { FIVEPLA_EXTRAS_KEY };
