/**
 * シーン、ノード階層、マテリアル、パーティクルの一覧。
 */
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { getEditorApi } from "../babylon/editorApi";
import { useEditorStore } from "../store/editorStore";
import type { EditorNode } from "../store/types";
import { tokens } from "./tokens.stylex";

const styles = stylex.create({
  panel: {
    backgroundColor: tokens.panel,
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    borderRightColor: tokens.line,
    overflow: "auto",
    padding: "8px",
    minHeight: "0",
  },
  group: {
    margin: "12px 0 4px",
    color: tokens.muted,
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  item: {
    display: "block",
    width: "100%",
    textAlign: "left",
    backgroundColor: "transparent",
    borderWidth: "0",
    borderRadius: "4px",
    padding: "4px 6px",
    cursor: "pointer",
  },
  selected: {
    backgroundColor: tokens.panel2,
    color: tokens.accent,
  },
  meta: {
    color: tokens.muted,
    marginLeft: "6px",
    fontSize: "11px",
  },
});

export function Outliner() {
  const document = useEditorStore((state) => state.document);
  const selection = useEditorStore((state) => state.ui.selection);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const roots = document.nodes.filter((node) => node.parentId === null);
  return (
    <aside {...stylex.props(styles.panel)}>
      <div {...stylex.props(styles.group)}>Scene</div>
      <button
        type="button"
        {...stylex.props(styles.item, selection.type === "scene" && styles.selected)}
        onClick={() => useEditorStore.getState().selectScene()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          reparent(event.dataTransfer.getData("text/plain"), null);
        }}
      >
        Scene settings
      </button>
      <div {...stylex.props(styles.group)}>Hierarchy</div>
      {roots.map((node) => (
        <NodeRow
          key={node.id}
          node={node}
          nodes={document.nodes}
          depth={0}
          selectedId={selection.type === "node" ? selection.id : null}
          dropTarget={dropTarget}
          onDropTarget={setDropTarget}
        />
      ))}
      <div {...stylex.props(styles.group)}>Materials</div>
      {document.materials.map((material) => (
        <button
          key={material.id}
          type="button"
          {...stylex.props(
            styles.item,
            selection.type === "material" && selection.id === material.id && styles.selected,
          )}
          onClick={() => useEditorStore.getState().selectMaterial(material.id)}
        >
          {material.name}
          <span {...stylex.props(styles.meta)}>{material.kind}</span>
        </button>
      ))}
      <div {...stylex.props(styles.group)}>Particles</div>
      {document.particles.map((particle) => (
        <button
          key={particle.id}
          type="button"
          {...stylex.props(
            styles.item,
            selection.type === "particle" && selection.id === particle.id && styles.selected,
          )}
          onClick={() => useEditorStore.getState().selectParticle(particle.id)}
        >
          {particle.name}
        </button>
      ))}
    </aside>
  );
}

function NodeRow(props: {
  node: EditorNode;
  nodes: EditorNode[];
  depth: number;
  selectedId: string | null;
  dropTarget: string | null;
  onDropTarget: (id: string | null) => void;
}) {
  const children = props.nodes.filter((node) => node.parentId === props.node.id);
  const selected = props.selectedId === props.node.id;
  return (
    <div>
      <button
        type="button"
        draggable
        {...stylex.props(styles.item, selected && styles.selected)}
        style={{ paddingLeft: 8 + props.depth * 14 }}
        onClick={() => useEditorStore.getState().selectNode(props.node.id)}
        onDragStart={(event) => {
          event.dataTransfer.setData("text/plain", props.node.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(event) => {
          event.preventDefault();
          props.onDropTarget(props.node.id);
        }}
        onDragLeave={() => props.onDropTarget(null)}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          props.onDropTarget(null);
          reparent(event.dataTransfer.getData("text/plain"), props.node.id);
        }}
      >
        {props.node.name}
        <span {...stylex.props(styles.meta)}>
          {props.node.type === "mesh" ? props.node.mesh.kind : props.node.type}
        </span>
      </button>
      {children.map((child) => (
        <NodeRow
          key={child.id}
          node={child}
          nodes={props.nodes}
          depth={props.depth + 1}
          selectedId={props.selectedId}
          dropTarget={props.dropTarget}
          onDropTarget={props.onDropTarget}
        />
      ))}
    </div>
  );
}

function reparent(id: string, parentId: string | null): void {
  if (!id || id === parentId) return;
  const api = getEditorApi();
  if (api) api.reparent(id, parentId);
  else useEditorStore.getState().setParent(id, parentId);
}
