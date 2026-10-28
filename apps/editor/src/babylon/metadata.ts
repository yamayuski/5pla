/**
 * エディタがシーンへ付けた印。書き出し対象の判定と選択に使う。
 */
import type { Node } from "@babylonjs/core/node";

export interface EditorMetadata {
  editorId?: string;
  editorOnly?: boolean;
  editorProxy?: boolean;
}

export function readMetadata(node: Node): EditorMetadata {
  const metadata = node.metadata as EditorMetadata | null | undefined;
  return metadata ?? {};
}

export function editorIdOf(node: Node | null | undefined): string | null {
  let current = node ?? null;
  while (current) {
    const id = readMetadata(current).editorId;
    if (id) return id;
    current = current.parent;
  }
  return null;
}

export function tagEditor(node: Node, editorId: string): void {
  const metadata = readMetadata(node);
  metadata.editorId = editorId;
  node.metadata = metadata;
}
