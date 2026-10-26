/**
 * ファイル操作、履歴、ギズモ、スナップ。
 */
import * as stylex from "@stylexjs/stylex";
import { useRef } from "react";
import { downloadBytes, downloadText, readFileAsDataUrl } from "../export/download";
import { exportDocumentGlb } from "../export/exportGlb";
import { readEditorDocumentFromGlb } from "../export/glb";
import { createId } from "../store/ids";
import { parseEditorDocument } from "../store/document";
import { useEditorStore } from "../store/editorStore";
import type { GizmoTool, MeshKind, LightKind, CameraKind, MaterialKind } from "../store/types";
import { tokens } from "./tokens.stylex";
import { Button } from "./ui";

const styles = stylex.create({
  bar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center",
    padding: "6px 8px",
    backgroundColor: tokens.panel,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: tokens.line,
  },
  status: {
    marginLeft: "auto",
    color: tokens.muted,
    fontSize: "12px",
  },
  file: {
    display: "none",
  },
});

const ADD_OPTIONS: { value: string; label: string }[] = [
  { value: "mesh:box", label: "Box" },
  { value: "mesh:sphere", label: "Sphere" },
  { value: "mesh:plane", label: "Plane" },
  { value: "mesh:ground", label: "Ground" },
  { value: "mesh:cylinder", label: "Cylinder" },
  { value: "light:point", label: "Point Light" },
  { value: "light:spot", label: "Spot Light" },
  { value: "light:directional", label: "Directional Light" },
  { value: "light:hemispheric", label: "Hemispheric Light" },
  { value: "camera:arcRotate", label: "Arc Rotate Camera" },
  { value: "camera:universal", label: "Universal Camera" },
  { value: "material:pbr", label: "PBR Material" },
  { value: "material:standard", label: "Standard Material" },
  { value: "particle", label: "Particle System" },
];

export function Toolbar() {
  const jsonInput = useRef<HTMLInputElement>(null);
  const glbInput = useRef<HTMLInputElement>(null);
  const tool = useEditorStore((state) => state.ui.tool);
  const snap = useEditorStore((state) => state.ui.snapEnabled);
  const preview = useEditorStore((state) => state.ui.previewActiveCamera);
  const simulate = useEditorStore((state) => state.ui.simulatePhysics);
  const physicsOn = useEditorStore((state) => state.document.scene.physics.enabled);
  const status = useEditorStore((state) => state.ui.status);
  const canUndo = useEditorStore((state) => state.past.length > 0 || state.gesture !== null);
  const canRedo = useEditorStore((state) => state.future.length > 0);

  const add = (value: string) => {
    const store = useEditorStore.getState();
    if (value === "particle") {
      store.addParticle();
      return;
    }
    const [group, kind] = value.split(":");
    if (group === "mesh") store.addMesh(kind as MeshKind);
    if (group === "light") store.addLight(kind as LightKind);
    if (group === "camera") store.addCamera(kind as CameraKind);
    if (group === "material") store.addMaterial(kind as MaterialKind);
  };

  return (
    <div {...stylex.props(styles.bar)}>
      <Button label="New" onClick={() => useEditorStore.getState().newDocument()} />
      <Button label="Open" onClick={() => jsonInput.current?.click()} />
      <Button
        label="Save"
        title="Download the editor JSON"
        onClick={() => {
          const document = useEditorStore.getState().document;
          downloadText(JSON.stringify(document, null, 2), "scene.5pla.json", "application/json");
        }}
      />
      <Button
        label="Export GLB"
        onClick={() => {
          void exportCurrent();
        }}
      />
      <Button label="Import GLB" onClick={() => glbInput.current?.click()} />
      <Button
        label="Undo"
        title="Ctrl+Z"
        disabled={!canUndo}
        onClick={() => useEditorStore.getState().undo()}
      />
      <Button
        label="Redo"
        title="Ctrl+Shift+Z"
        disabled={!canRedo}
        onClick={() => useEditorStore.getState().redo()}
      />
      <ToolButton tool="translate" current={tool} label="Move" title="W" />
      <ToolButton tool="rotate" current={tool} label="Rotate" title="E" />
      <ToolButton tool="scale" current={tool} label="Scale" title="R" />
      <Button
        label="Snap"
        active={snap}
        onClick={() => useEditorStore.getState().setSnapEnabled(!snap)}
      />
      <Button
        label="Preview camera"
        active={preview}
        onClick={() => useEditorStore.getState().setPreviewActiveCamera(!preview)}
      />
      <Button
        label="Simulate physics"
        active={simulate}
        disabled={!physicsOn}
        onClick={() => useEditorStore.getState().setSimulatePhysics(!simulate)}
      />
      <label>
        <span {...stylex.props(styles.status)}>Add</span>{" "}
        <select
          defaultValue="mesh:box"
          onChange={(event) => {
            add(event.target.value);
            event.target.value = "mesh:box";
          }}
        >
          {ADD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <span {...stylex.props(styles.status)}>{status ?? "Editor camera"}</span>
      <input
        ref={jsonInput}
        {...stylex.props(styles.file)}
        type="file"
        accept="application/json,.json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void openJson(file);
        }}
      />
      <input
        ref={glbInput}
        {...stylex.props(styles.file)}
        type="file"
        accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void openGlb(file);
        }}
      />
    </div>
  );
}

function ToolButton(props: { tool: GizmoTool; current: GizmoTool; label: string; title: string }) {
  return (
    <Button
      label={props.label}
      title={props.title}
      active={props.current === props.tool}
      onClick={() => useEditorStore.getState().setTool(props.tool)}
    />
  );
}

async function exportCurrent(): Promise<void> {
  const store = useEditorStore.getState();
  store.setStatus("Exporting GLB…");
  try {
    const bytes = await exportDocumentGlb(store.document);
    downloadBytes(bytes, "scene.glb", "model/gltf-binary");
    store.setStatus("Exported scene.glb");
  } catch (error) {
    store.setStatus(error instanceof Error ? error.message : "Export failed");
  }
}

async function openJson(file: File): Promise<void> {
  const store = useEditorStore.getState();
  try {
    const document = parseEditorDocument(JSON.parse(await file.text()));
    store.loadDocument(document);
    store.setStatus(`Opened ${file.name}`);
  } catch (error) {
    store.setStatus(error instanceof Error ? error.message : "Open failed");
  }
}

async function openGlb(file: File): Promise<void> {
  const store = useEditorStore.getState();
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const embedded = readEditorDocumentFromGlb(bytes);
    if (embedded) {
      store.loadDocument(embedded);
      store.setStatus(`Restored editor document from ${file.name}`);
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    store.addGltfAsset({
      id: createId(),
      name: file.name,
      mime: file.type || "model/gltf-binary",
      dataUrl,
    });
    store.setStatus(`Imported ${file.name}`);
  } catch (error) {
    store.setStatus(error instanceof Error ? error.message : "Import failed");
  }
}
