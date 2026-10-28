/**
 * 書き出し時の glTF ノード名。文書の並び順で一意になる。
 */
import type { EditorNode } from "../store/types";

export function exportNameMap(nodes: readonly EditorNode[]): Map<string, string> {
  const used = new Set<string>();
  const names = new Map<string, string>();
  for (const node of nodes) {
    const base = (node.name.trim() || node.type).replaceAll(/[\r\n]/g, " ");
    let name = base;
    let index = 2;
    while (used.has(name)) {
      name = `${base}_${index}`;
      index += 1;
    }
    used.add(name);
    names.set(node.id, name);
  }
  return names;
}

export function exportNameOf(names: ReadonlyMap<string, string>, id: string): string {
  return names.get(id) ?? id;
}
