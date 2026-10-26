import { beforeEach, describe, expect, it } from "vite-plus/test";
import { canParent, parseEditorDocument } from "./document";
import { HISTORY_LIMIT, resetEditorStore, useEditorStore } from "./editorStore";

describe("editor store", () => {
  beforeEach(() => {
    resetEditorStore();
  });

  it("starts with a ground, a box, a light, and a camera", () => {
    const document = useEditorStore.getState().document;
    expect(document.version).toBe(1);
    expect(document.nodes.map((node) => node.type)).toEqual(["mesh", "mesh", "light", "camera"]);
    const camera = document.nodes.find((node) => node.type === "camera");
    expect(camera?.type === "camera" && camera.camera.active).toBe(true);
  });

  it("undoes and redoes a mesh add as one step", () => {
    const before = useEditorStore.getState().document.nodes.length;
    useEditorStore.getState().addMesh("sphere");
    expect(useEditorStore.getState().document.nodes).toHaveLength(before + 1);
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().document.nodes).toHaveLength(before);
    useEditorStore.getState().redo();
    expect(useEditorStore.getState().document.nodes).toHaveLength(before + 1);
  });

  it("groups a gesture into a single history entry", () => {
    const id = useEditorStore.getState().document.nodes[0]?.id;
    expect(id).toBeTruthy();
    if (!id) return;
    const original = useEditorStore.getState().document.nodes[0]?.name;
    useEditorStore.getState().beginGesture();
    useEditorStore.getState().renameNode(id, "Temp");
    useEditorStore.getState().renameNode(id, "Renamed");
    useEditorStore.getState().endGesture();
    expect(useEditorStore.getState().past).toHaveLength(1);
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().document.nodes[0]?.name).toBe(original);
  });

  it("duplicates a node and its descendants with new ids", () => {
    const store = useEditorStore.getState();
    const parent = store.addMesh("box");
    const child = store.addMesh("sphere");
    store.setParent(child, parent);
    store.selectNode(parent);
    const copy = store.duplicateSelection();
    const document = useEditorStore.getState().document;
    expect(copy).toBeTruthy();
    expect(document.nodes.filter((node) => node.name.startsWith("Box"))).toHaveLength(3);
    const clonedChild = document.nodes.find(
      (node) => node.parentId === copy && node.type === "mesh" && node.mesh.kind === "sphere",
    );
    expect(clonedChild).toBeTruthy();
  });

  it("refuses to parent a node onto its descendant", () => {
    const store = useEditorStore.getState();
    const parent = store.addMesh("box");
    const child = store.addMesh("sphere");
    expect(store.setParent(child, parent)).toBe(true);
    expect(canParent(useEditorStore.getState().document.nodes, parent, child)).toBe(false);
    expect(store.setParent(parent, child)).toBe(false);
  });

  it("deletes descendants and clears a missing selection", () => {
    const store = useEditorStore.getState();
    const parent = store.addMesh("box");
    const child = store.addMesh("sphere");
    store.setParent(child, parent);
    store.selectNode(parent);
    store.deleteSelection();
    const ids = useEditorStore.getState().document.nodes.map((node) => node.id);
    expect(ids).not.toContain(parent);
    expect(ids).not.toContain(child);
    expect(useEditorStore.getState().ui.selection.type).toBe("scene");
  });

  it("keeps only one active camera", () => {
    const store = useEditorStore.getState();
    const id = store.addCamera("universal");
    store.setActiveCamera(id);
    const active = useEditorStore
      .getState()
      .document.nodes.filter((node) => node.type === "camera" && node.camera.active);
    expect(active).toHaveLength(1);
    expect(active[0]?.id).toBe(id);
  });

  it("adds and removes the default rendering pipeline", () => {
    const store = useEditorStore.getState();
    expect(store.document.scene.postProcesses).toBeNull();
    store.setPostProcesses({
      bloom: { enabled: true, threshold: 0.2, weight: 0.4, kernel: 32, scale: 0.5 },
      fxaa: { enabled: true },
      imageProcessing: { enabled: true, exposure: 1.2, contrast: 1.1 },
      vignette: { enabled: true, weight: 2, color: [0, 0, 0] },
      chromaticAberration: { enabled: true, aberrationAmount: 4 },
      grain: { enabled: false, intensity: 0, animated: false },
    });
    expect(useEditorStore.getState().document.scene.postProcesses?.bloom.threshold).toBe(0.2);
    store.setPostProcesses(null);
    expect(useEditorStore.getState().document.scene.postProcesses).toBeNull();
  });

  it("limits history", () => {
    const id = useEditorStore.getState().document.nodes[0]?.id;
    expect(id).toBeTruthy();
    if (!id) return;
    for (let index = 0; index < HISTORY_LIMIT + 5; index += 1) {
      useEditorStore.getState().renameNode(id, `Name ${index}`);
    }
    expect(useEditorStore.getState().past.length).toBeLessThanOrEqual(HISTORY_LIMIT);
  });

  it("rejects an unsupported document version", () => {
    expect(() => parseEditorDocument({ version: 2 })).toThrow(/version/i);
  });

  it("round-trips a document through JSON", () => {
    const store = useEditorStore.getState();
    store.updateFog({ mode: "exp2", density: 0.04 });
    store.addParticle();
    const original = useEditorStore.getState().document;
    const parsed = parseEditorDocument(JSON.parse(JSON.stringify(original)));
    expect(parsed).toEqual(original);
  });
});
