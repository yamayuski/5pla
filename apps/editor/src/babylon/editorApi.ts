/**
 * React からシーンブリッジを呼ぶための小さな窓口。
 * 親子付けはワールド座標を保ったまま行うので、Babylon 側で計算する。
 */
import type { Vec3 } from "../store/types";

export interface EditorApi {
  reparent: (id: string, parentId: string | null) => void;
  setLightDirection: (id: string, direction: Vec3) => void;
}

let api: EditorApi | null = null;

export function registerEditorApi(next: EditorApi | null): void {
  api = next;
}

export function getEditorApi(): EditorApi | null {
  return api;
}
