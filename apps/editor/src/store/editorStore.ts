/**
 * エディタ文書の単一の情報源。履歴は文書のスナップショットで、UI 状態は履歴に入れない。
 */
import { create } from "zustand";
import {
  cameraKindLabel,
  canParent,
  collectDescendants,
  createCameraNode,
  createDefaultDocument,
  createLightNode,
  createMaterialDef,
  createMeshNode,
  createParticleDef,
  findNode,
  lightKindLabel,
  meshKindLabel,
  nextName,
  parseEditorDocument,
} from "./document";
import { createId } from "./ids";
import type {
  AssetDef,
  CameraKind,
  CameraProps,
  EditorDocument,
  EditorNode,
  EditorUi,
  GizmoTool,
  LightKind,
  LightProps,
  MaterialDef,
  MaterialKind,
  MeshKind,
  MeshProps,
  ParticleDef,
  PostProcessesSettings,
  Selection,
  Transform,
} from "./types";

export const HISTORY_LIMIT = 100;

export interface EditorState {
  document: EditorDocument;
  past: EditorDocument[];
  future: EditorDocument[];
  /** ドラッグ中など、確定前の文書。endGesture で 1 件の履歴になる */
  gesture: EditorDocument | null;
  ui: EditorUi;
  newDocument: () => void;
  loadDocument: (document: EditorDocument) => void;
  undo: () => void;
  redo: () => void;
  beginGesture: () => void;
  endGesture: () => void;
  cancelGesture: () => void;
  selectScene: () => void;
  selectNode: (id: string) => void;
  selectMaterial: (id: string) => void;
  selectParticle: (id: string) => void;
  setTool: (tool: GizmoTool) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setSnapTranslate: (value: number) => void;
  setSnapRotateDegrees: (value: number) => void;
  setSnapScale: (value: number) => void;
  setPreviewActiveCamera: (enabled: boolean) => void;
  setSimulatePhysics: (enabled: boolean) => void;
  setStatus: (status: string | null) => void;
  updateClearColor: (color: EditorDocument["scene"]["clearColor"]) => void;
  updateFog: (patch: Partial<EditorDocument["scene"]["fog"]>) => void;
  updatePhysicsWorld: (patch: Partial<EditorDocument["scene"]["physics"]>) => void;
  setPostProcesses: (value: PostProcessesSettings | null) => void;
  updatePostProcesses: (recipe: (current: PostProcessesSettings) => PostProcessesSettings) => void;
  addMesh: (kind: MeshKind) => string;
  addLight: (kind: LightKind) => string;
  addCamera: (kind: CameraKind) => string;
  addMaterial: (kind: MaterialKind) => string;
  addParticle: () => string;
  addGltfAsset: (asset: AssetDef) => string;
  addAsset: (asset: AssetDef) => void;
  deleteSelection: () => void;
  duplicateSelection: () => string | null;
  renameNode: (id: string, name: string) => void;
  renameMaterial: (id: string, name: string) => void;
  renameParticle: (id: string, name: string) => void;
  setParent: (id: string, parentId: string | null, transform?: Transform) => boolean;
  updateTransform: (id: string, transform: Transform) => void;
  updateMesh: (id: string, patch: Partial<MeshProps>) => void;
  updateLight: (id: string, patch: Partial<LightProps>) => void;
  updateCamera: (id: string, patch: Partial<CameraProps>) => void;
  setActiveCamera: (id: string) => void;
  updateMaterial: (id: string, patch: Partial<MaterialDef>) => void;
  updateParticle: (id: string, patch: Partial<ParticleDef>) => void;
}

function defaultUi(): EditorUi {
  return {
    selection: { type: "scene" },
    tool: "translate",
    snapEnabled: false,
    snapTranslate: 0.5,
    snapRotateDegrees: 15,
    snapScale: 0.1,
    previewActiveCamera: false,
    simulatePhysics: false,
    status: null,
  };
}

function reconcileSelection(ui: EditorUi, document: EditorDocument): EditorUi {
  const selection = ui.selection;
  if (selection.type === "node" && !findNode(document.nodes, selection.id)) {
    return { ...ui, selection: { type: "scene" } };
  }
  if (
    selection.type === "material" &&
    !document.materials.some((material) => material.id === selection.id)
  ) {
    return { ...ui, selection: { type: "scene" } };
  }
  if (
    selection.type === "particle" &&
    !document.particles.some((particle) => particle.id === selection.id)
  ) {
    return { ...ui, selection: { type: "scene" } };
  }
  return ui;
}

function sameDocument(a: EditorDocument, b: EditorDocument): boolean {
  return a === b;
}

export const useEditorStore = create<EditorState>((set, get) => {
  const commit = (recipe: (document: EditorDocument) => EditorDocument) => {
    const current = get();
    const next = recipe(current.document);
    if (sameDocument(next, current.document)) return;
    const ui = reconcileSelection(current.ui, next);
    if (current.gesture) {
      set({ document: next, ui });
      return;
    }
    set({
      document: next,
      ui,
      past: [...current.past, current.document].slice(-HISTORY_LIMIT),
      future: [],
    });
  };

  const select = (selection: Selection) => {
    set({ ui: { ...get().ui, selection } });
  };

  return {
    document: createDefaultDocument(),
    past: [],
    future: [],
    gesture: null,
    ui: defaultUi(),
    newDocument: () => {
      const current = get();
      const document = createDefaultDocument();
      set({
        document,
        gesture: null,
        past: [...current.past, current.document].slice(-HISTORY_LIMIT),
        future: [],
        ui: {
          ...current.ui,
          selection: { type: "scene" },
          previewActiveCamera: false,
          simulatePhysics: false,
          status: null,
        },
      });
    },
    loadDocument: (document) => {
      const parsed = parseEditorDocument(document);
      const current = get();
      set({
        document: parsed,
        past: [...current.past, current.document].slice(-HISTORY_LIMIT),
        future: [],
        gesture: null,
        ui: reconcileSelection(
          {
            ...current.ui,
            selection: { type: "scene" },
            previewActiveCamera: false,
            simulatePhysics: false,
            status: null,
          },
          parsed,
        ),
      });
    },
    undo: () => {
      const current = get();
      if (current.gesture) {
        set({
          document: current.gesture,
          gesture: null,
          ui: reconcileSelection(current.ui, current.gesture),
        });
        return;
      }
      const previous = current.past[current.past.length - 1];
      if (!previous) return;
      set({
        document: previous,
        past: current.past.slice(0, -1),
        future: [current.document, ...current.future].slice(0, HISTORY_LIMIT),
        ui: reconcileSelection(current.ui, previous),
      });
    },
    redo: () => {
      const current = get();
      if (current.gesture) return;
      const next = current.future[0];
      if (!next) return;
      set({
        document: next,
        future: current.future.slice(1),
        past: [...current.past, current.document].slice(-HISTORY_LIMIT),
        ui: reconcileSelection(current.ui, next),
      });
    },
    beginGesture: () => {
      const current = get();
      if (current.gesture) return;
      set({ gesture: current.document });
    },
    endGesture: () => {
      const current = get();
      if (!current.gesture) return;
      if (current.gesture === current.document) {
        set({ gesture: null });
        return;
      }
      set({
        gesture: null,
        past: [...current.past, current.gesture].slice(-HISTORY_LIMIT),
        future: [],
      });
    },
    cancelGesture: () => {
      const current = get();
      if (!current.gesture) return;
      set({
        document: current.gesture,
        gesture: null,
        ui: reconcileSelection(current.ui, current.gesture),
      });
    },
    selectScene: () => select({ type: "scene" }),
    selectNode: (id) => select({ type: "node", id }),
    selectMaterial: (id) => select({ type: "material", id }),
    selectParticle: (id) => select({ type: "particle", id }),
    setTool: (tool) => set({ ui: { ...get().ui, tool } }),
    setSnapEnabled: (snapEnabled) => set({ ui: { ...get().ui, snapEnabled } }),
    setSnapTranslate: (snapTranslate) => set({ ui: { ...get().ui, snapTranslate } }),
    setSnapRotateDegrees: (snapRotateDegrees) => set({ ui: { ...get().ui, snapRotateDegrees } }),
    setSnapScale: (snapScale) => set({ ui: { ...get().ui, snapScale } }),
    setPreviewActiveCamera: (previewActiveCamera) =>
      set({ ui: { ...get().ui, previewActiveCamera } }),
    setSimulatePhysics: (simulatePhysics) => set({ ui: { ...get().ui, simulatePhysics } }),
    setStatus: (status) => {
      if (get().ui.status === status) return;
      set({ ui: { ...get().ui, status } });
    },
    updateClearColor: (clearColor) => {
      commit((document) => ({
        ...document,
        scene: { ...document.scene, clearColor },
      }));
    },
    updateFog: (patch) => {
      commit((document) => ({
        ...document,
        scene: {
          ...document.scene,
          fog: { ...document.scene.fog, ...patch },
        },
      }));
    },
    updatePhysicsWorld: (patch) => {
      commit((document) => ({
        ...document,
        scene: {
          ...document.scene,
          physics: { ...document.scene.physics, ...patch },
        },
      }));
    },
    setPostProcesses: (postProcesses) => {
      commit((document) => ({
        ...document,
        scene: { ...document.scene, postProcesses },
      }));
    },
    updatePostProcesses: (recipe) => {
      commit((document) => {
        if (!document.scene.postProcesses) return document;
        return {
          ...document,
          scene: {
            ...document.scene,
            postProcesses: recipe(document.scene.postProcesses),
          },
        };
      });
    },
    addMesh: (kind) => {
      const id = createId();
      commit((document) => ({
        ...document,
        nodes: [
          ...document.nodes,
          createMeshNode(id, nextName(document.nodes, meshKindLabel(kind)), kind),
        ],
      }));
      get().selectNode(id);
      return id;
    },
    addLight: (kind) => {
      const id = createId();
      commit((document) => ({
        ...document,
        nodes: [
          ...document.nodes,
          createLightNode(id, nextName(document.nodes, lightKindLabel(kind)), kind),
        ],
      }));
      get().selectNode(id);
      return id;
    },
    addCamera: (kind) => {
      const id = createId();
      commit((document) => {
        const hasActive = document.nodes.some(
          (node) => node.type === "camera" && node.camera.active,
        );
        return {
          ...document,
          nodes: [
            ...document.nodes,
            createCameraNode(id, nextName(document.nodes, cameraKindLabel(kind)), kind, !hasActive),
          ],
        };
      });
      get().selectNode(id);
      return id;
    },
    addMaterial: (kind) => {
      const id = createId();
      commit((document) => ({
        ...document,
        materials: [
          ...document.materials,
          createMaterialDef(
            id,
            nextName(document.materials, kind === "pbr" ? "PBR" : "Standard"),
            kind,
          ),
        ],
      }));
      get().selectMaterial(id);
      return id;
    },
    addParticle: () => {
      const id = createId();
      commit((document) => ({
        ...document,
        particles: [
          ...document.particles,
          createParticleDef(id, nextName(document.particles, "Particles")),
        ],
      }));
      get().selectParticle(id);
      return id;
    },
    addGltfAsset: (asset) => {
      const id = createId();
      commit((document) => {
        const node = createMeshNode(
          id,
          nextName(document.nodes, asset.name.replace(/\.(glb|gltf)$/i, "")),
          "gltf",
        );
        node.mesh.assetId = asset.id;
        node.transform.position = [0, 0, 0];
        node.transform.rotation = [0, 0, 0];
        return {
          ...document,
          assets: { ...document.assets, [asset.id]: asset },
          nodes: [...document.nodes, node],
        };
      });
      get().selectNode(id);
      return id;
    },
    addAsset: (asset) => {
      commit((document) => ({
        ...document,
        assets: { ...document.assets, [asset.id]: asset },
      }));
    },
    deleteSelection: () => {
      const selection = get().ui.selection;
      if (selection.type === "node") {
        const remove = collectDescendants(get().document.nodes, selection.id);
        commit((document) => {
          const assets = { ...document.assets };
          const remaining = document.nodes.filter((node) => !remove.has(node.id));
          for (const node of document.nodes) {
            if (!remove.has(node.id) || node.type !== "mesh") continue;
            const assetId = node.mesh.assetId;
            if (!assetId) continue;
            const stillUsed = remaining.some(
              (candidate) => candidate.type === "mesh" && candidate.mesh.assetId === assetId,
            );
            if (!stillUsed) delete assets[assetId];
          }
          return { ...document, nodes: remaining, assets };
        });
        return;
      }
      if (selection.type === "material") {
        const materialId = selection.id;
        commit((document) => ({
          ...document,
          materials: document.materials.filter((material) => material.id !== materialId),
          nodes: document.nodes.map((node) => {
            if (node.type !== "mesh" || node.mesh.materialId !== materialId) {
              return node;
            }
            return { ...node, mesh: { ...node.mesh, materialId: null } };
          }),
        }));
        return;
      }
      if (selection.type === "particle") {
        const particleId = selection.id;
        commit((document) => ({
          ...document,
          particles: document.particles.filter((particle) => particle.id !== particleId),
        }));
      }
    },
    duplicateSelection: () => {
      const selection = get().ui.selection;
      if (selection.type !== "node") return null;
      const sourceId = selection.id;
      const idMap = new Map<string, string>();
      let rootId: string | null = null;
      commit((document) => {
        const ids = collectDescendants(document.nodes, sourceId);
        if (!ids.has(sourceId)) return document;
        for (const id of ids) idMap.set(id, createId());
        const mappedRoot = idMap.get(sourceId);
        if (!mappedRoot) return document;
        rootId = mappedRoot;
        const clones: EditorNode[] = [];
        for (const node of document.nodes) {
          if (!ids.has(node.id)) continue;
          const cloned = structuredClone(node);
          const mapped = idMap.get(node.id);
          if (!mapped) continue;
          cloned.id = mapped;
          cloned.parentId =
            node.parentId && ids.has(node.parentId)
              ? (idMap.get(node.parentId) ?? null)
              : node.parentId;
          if (node.id === sourceId) {
            cloned.name = nextName([...document.nodes, ...clones], node.name);
            cloned.transform = {
              ...cloned.transform,
              position: [
                cloned.transform.position[0] + 0.5,
                cloned.transform.position[1],
                cloned.transform.position[2],
              ],
            };
          }
          clones.push(cloned);
        }
        return { ...document, nodes: [...document.nodes, ...clones] };
      });
      if (rootId) get().selectNode(rootId);
      return rootId;
    },
    renameNode: (id, name) => {
      commit((document) => ({
        ...document,
        nodes: document.nodes.map((node) => (node.id === id ? { ...node, name } : node)),
      }));
    },
    renameMaterial: (id, name) => {
      commit((document) => ({
        ...document,
        materials: document.materials.map((material) =>
          material.id === id ? { ...material, name } : material,
        ),
      }));
    },
    renameParticle: (id, name) => {
      commit((document) => ({
        ...document,
        particles: document.particles.map((particle) =>
          particle.id === id ? { ...particle, name } : particle,
        ),
      }));
    },
    setParent: (id, parentId, transform) => {
      if (!canParent(get().document.nodes, id, parentId)) return false;
      commit((document) => ({
        ...document,
        nodes: document.nodes.map((node) => {
          if (node.id !== id) return node;
          return {
            ...node,
            parentId,
            transform: transform ?? node.transform,
          };
        }),
      }));
      return true;
    },
    updateTransform: (id, transform) => {
      commit((document) => ({
        ...document,
        nodes: document.nodes.map((node) => (node.id === id ? { ...node, transform } : node)),
      }));
    },
    updateMesh: (id, patch) => {
      commit((document) => ({
        ...document,
        nodes: document.nodes.map((node) => {
          if (node.id !== id || node.type !== "mesh") return node;
          return { ...node, mesh: { ...node.mesh, ...patch } };
        }),
      }));
    },
    updateLight: (id, patch) => {
      commit((document) => ({
        ...document,
        nodes: document.nodes.map((node) => {
          if (node.id !== id || node.type !== "light") return node;
          return { ...node, light: { ...node.light, ...patch } };
        }),
      }));
    },
    updateCamera: (id, patch) => {
      commit((document) => ({
        ...document,
        nodes: document.nodes.map((node) => {
          if (node.id !== id || node.type !== "camera") return node;
          return { ...node, camera: { ...node.camera, ...patch } };
        }),
      }));
    },
    setActiveCamera: (id) => {
      commit((document) => ({
        ...document,
        nodes: document.nodes.map((node) => {
          if (node.type !== "camera") return node;
          const active = node.id === id;
          if (node.camera.active === active) return node;
          return { ...node, camera: { ...node.camera, active } };
        }),
      }));
    },
    updateMaterial: (id, patch) => {
      commit((document) => ({
        ...document,
        materials: document.materials.map((material) =>
          material.id === id ? { ...material, ...patch } : material,
        ),
      }));
    },
    updateParticle: (id, patch) => {
      commit((document) => ({
        ...document,
        particles: document.particles.map((particle) =>
          particle.id === id ? { ...particle, ...patch } : particle,
        ),
      }));
    },
  };
});

/** テストがストアのシングルトンを初期状態に戻す。 */
export function resetEditorStore(): void {
  useEditorStore.setState({
    document: createDefaultDocument(),
    past: [],
    future: [],
    gesture: null,
    ui: defaultUi(),
  });
}
