/**
 * Zustand の文書を Babylon シーンへ同期し、選択とギズモの操作を文書へ戻す。
 * 操作カメラ、グリッド、軸、ギズモは文書の外に置く。
 */
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { ArcRotateCameraPointersInput } from "@babylonjs/core/Cameras/Inputs/arcRotateCameraPointersInput";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GizmoManager } from "@babylonjs/core/Gizmos/gizmoManager";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PointerEventTypes, type PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { Scene } from "@babylonjs/core/scene";
import { canParent, findNode } from "../store/document";
import { useEditorStore } from "../store/editorStore";
import type { EditorDocument, EditorNode, EditorUi, LightKind, Vec3 } from "../store/types";
import { registerEditorApi } from "./editorApi";
import {
  ParticleController,
  PhysicsController,
  PostProcessController,
  ShadowController,
} from "./effects";
import {
  applyLiveCamera,
  applyLiveLight,
  assignMaterial,
  cameraSignature,
  createLiveCamera,
  createLiveLight,
  createLiveMesh,
  detachEditorHandles,
  lightSignature,
  localLightAxis,
  meshSignature,
  type LiveEntity,
} from "./entities";
import { GltfInstances } from "./gltf";
import { createEditorHelpers, type EditorHelpers } from "./grid";
import { MaterialLibrary } from "./materials";
import { editorIdOf } from "./metadata";
import "./sideEffects";
import { applyTransform, readTransform, vec3 } from "./transform";

const EDITOR_CAMERA = "__editorCamera";

export class SceneBridge {
  private engine: Engine | null = null;
  private scene: Scene | null = null;
  private editorCamera: ArcRotateCamera | null = null;
  private helpers: EditorHelpers | null = null;
  private gizmos: GizmoManager | null = null;
  private readonly entities = new Map<string, LiveEntity>();
  private materialLibrary: MaterialLibrary | null = null;
  private readonly gltf = new GltfInstances();
  private readonly post = new PostProcessController();
  private readonly particles = new ParticleController();
  private readonly shadows = new ShadowController();
  private readonly physics = new PhysicsController();
  private unsubscribe: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private disposed = false;
  private syncing = false;
  private queued = false;
  private dragging = false;
  private wasDragging = false;
  private dragId: string | null = null;
  private onKey: ((event: KeyboardEvent) => void) | null = null;

  public constructor(private readonly canvas: HTMLCanvasElement) {}

  public async start(): Promise<void> {
    const engine = new Engine(this.canvas, true, {
      adaptToDeviceRatio: true,
      antialias: true,
      alpha: false,
    });
    this.engine = engine;
    const scene = new Scene(engine);
    this.scene = scene;
    scene.clearColor = new Color4(0.045, 0.048, 0.055, 1);
    this.editorCamera = this.createEditorCamera(scene);
    this.helpers = createEditorHelpers(scene);
    this.materialLibrary = new MaterialLibrary(scene);
    this.gizmos = this.createGizmos(scene);
    this.bindPointer(scene);
    this.bindKeys();
    this.resizeObserver = new ResizeObserver(() => engine.resize());
    this.resizeObserver.observe(this.canvas);
    registerEditorApi({
      reparent: (id, parentId) => this.reparent(id, parentId),
      setLightDirection: (id, direction) => this.setLightDirection(id, direction),
    });
    this.unsubscribe = useEditorStore.subscribe(() => {
      this.requestSync();
    });
    this.requestSync();
    engine.runRenderLoop(() => {
      this.watchGizmo();
      if (!this.disposed) scene.render();
    });
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    registerEditorApi(null);
    this.unsubscribe?.();
    this.resizeObserver?.disconnect();
    if (this.onKey) window.removeEventListener("keydown", this.onKey);
    this.gizmos?.dispose();
    this.post.dispose();
    this.particles.dispose();
    this.shadows.dispose();
    this.physics.dispose();
    this.gltf.dispose();
    this.helpers?.dispose();
    this.materialLibrary?.dispose();
    this.scene?.dispose();
    this.engine?.dispose();
  }

  private createEditorCamera(scene: Scene): ArcRotateCamera {
    const camera = new ArcRotateCamera(
      EDITOR_CAMERA,
      -Math.PI / 3,
      1.05,
      12,
      new Vector3(0, 0.5, 0),
      scene,
    );
    camera.lowerRadiusLimit = 0.25;
    camera.upperRadiusLimit = 400;
    camera.wheelPrecision = 40;
    camera.panningSensibility = 80;
    camera.minZ = 0.05;
    camera.maxZ = 1000;
    camera.attachControl(this.canvas, true);
    const pointers = camera.inputs.attached.pointers;
    if (pointers instanceof ArcRotateCameraPointersInput) {
      pointers.buttons = [1, 2];
    }
    this.canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
    scene.activeCamera = camera;
    return camera;
  }

  private createGizmos(scene: Scene): GizmoManager {
    const gizmos = new GizmoManager(scene);
    gizmos.usePointerToAttachGizmos = false;
    gizmos.clearGizmoOnEmptyPointerEvent = false;
    gizmos.enableAutoPicking = false;
    return gizmos;
  }

  private bindPointer(scene: Scene): void {
    scene.onPointerObservable.add((info) => {
      this.onPointer(info);
    });
  }

  private onPointer(info: PointerInfo): void {
    if (info.type !== PointerEventTypes.POINTERDOWN) return;
    const event = info.event;
    if (!(event instanceof PointerEvent) || event.button !== 0) return;
    if (this.gizmos?.isHovered || this.gizmos?.isDragging) return;
    const mesh = info.pickInfo?.hit ? info.pickInfo.pickedMesh : null;
    const id = editorIdOf(mesh);
    const store = useEditorStore.getState();
    if (id) store.selectNode(id);
    else store.selectScene();
  }

  private bindKeys(): void {
    this.onKey = (event) => {
      if (isTypingTarget(event.target)) return;
      const store = useEditorStore.getState();
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        if (event.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "y") {
        event.preventDefault();
        store.redo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "d") {
        event.preventDefault();
        store.duplicateSelection();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "s") {
        event.preventDefault();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        store.deleteSelection();
        return;
      }
      if (key === "w") store.setTool("translate");
      if (key === "e") store.setTool("rotate");
      if (key === "r") store.setTool("scale");
    };
    window.addEventListener("keydown", this.onKey);
  }

  private requestSync(): void {
    this.queued = true;
    if (this.syncing) return;
    this.syncing = true;
    void this.drain();
  }

  private async drain(): Promise<void> {
    try {
      while (this.queued && !this.disposed) {
        this.queued = false;
        await this.sync();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Scene sync failed";
      useEditorStore.getState().setStatus(message);
    } finally {
      this.syncing = false;
      if (this.queued && !this.disposed) this.requestSync();
    }
  }

  private async sync(): Promise<void> {
    const scene = this.scene;
    const library = this.materialLibrary;
    if (!scene || !library) return;
    const { document, ui } = useEditorStore.getState();
    this.applyEnvironment(scene, document);
    library.sync(document.materials, document.assets);
    await this.syncEntities(scene, document, library);
    this.parentAndTransform(document);
    this.shadows.sync(this.entities, document);
    this.particles.sync(scene, document, this.entities);
    this.applyPreview(scene, document, ui);
    const renderCamera = scene.activeCamera;
    this.post.sync(scene, renderCamera, document.scene.postProcesses);
    await this.physics.sync(scene, document, this.entities, ui.simulatePhysics);
    this.applyGizmos(document, ui);
  }

  private applyEnvironment(scene: Scene, document: EditorDocument): void {
    const clear = document.scene.clearColor;
    scene.clearColor = new Color4(clear[0], clear[1], clear[2], clear[3]);
    switch (document.scene.fog.mode) {
      case "exp":
        scene.fogMode = Scene.FOGMODE_EXP;
        break;
      case "exp2":
        scene.fogMode = Scene.FOGMODE_EXP2;
        break;
      case "linear":
        scene.fogMode = Scene.FOGMODE_LINEAR;
        break;
      default:
        scene.fogMode = Scene.FOGMODE_NONE;
    }
    scene.fogColor = new Color3(
      document.scene.fog.color[0],
      document.scene.fog.color[1],
      document.scene.fog.color[2],
    );
    scene.fogDensity = document.scene.fog.density;
    scene.fogStart = document.scene.fog.start;
    scene.fogEnd = document.scene.fog.end;
  }

  private async syncEntities(
    scene: Scene,
    document: EditorDocument,
    library: MaterialLibrary,
  ): Promise<void> {
    const alive = new Set(document.nodes.map((node) => node.id));
    for (const [id, entity] of this.entities) {
      if (alive.has(id)) continue;
      this.disposeEntity(entity);
      this.entities.delete(id);
    }
    for (const node of document.nodes) {
      const current = this.entities.get(node.id);
      const signature = signatureOf(node);
      if (!current || current.signature !== signature) {
        if (current) {
          const handles = new Set([...this.entities.values()].map((entry) => entry.handle));
          const children = detachEditorHandles(current.handle, handles);
          this.disposeEntity(current);
          const created = await this.createEntity(scene, node);
          created.handle.parent = null;
          for (const child of children) child.parent = created.handle;
          this.entities.set(node.id, created);
        } else {
          this.entities.set(node.id, await this.createEntity(scene, node));
        }
      }
      const entity = this.entities.get(node.id);
      if (!entity) continue;
      if (node.type === "mesh") {
        assignMaterial(entity.handle, library.get(node.mesh.materialId));
      }
      if (node.type === "light") applyLiveLight(entity, node);
      if (node.type === "camera") applyLiveCamera(entity, node);
    }
  }

  private async createEntity(scene: Scene, node: EditorNode): Promise<LiveEntity> {
    if (node.type === "light") return createLiveLight(scene, node);
    if (node.type === "camera") return createLiveCamera(scene, node);
    const entity = createLiveMesh(scene, node);
    if (node.mesh.kind === "gltf" && node.mesh.assetId) {
      const asset = useEditorStore.getState().document.assets[node.mesh.assetId];
      if (asset) await this.gltf.attach(scene, asset, entity.handle, node.id);
    }
    return entity;
  }

  private parentAndTransform(document: EditorDocument): void {
    for (const node of document.nodes) {
      const entity = this.entities.get(node.id);
      if (!entity) continue;
      const parent = node.parentId ? (this.entities.get(node.parentId)?.handle ?? null) : null;
      if (entity.handle.parent !== parent) entity.handle.parent = parent;
      if (this.dragging && this.dragId === node.id) continue;
      if (node.type === "camera" && node.camera.kind === "arcRotate") {
        entity.handle.position.copyFrom(vec3(node.camera.target));
        continue;
      }
      applyTransform(entity.handle, node.transform);
    }
  }

  private applyPreview(scene: Scene, document: EditorDocument, ui: EditorUi): void {
    const editorCamera = this.editorCamera;
    if (!editorCamera) return;
    if (!ui.previewActiveCamera) {
      this.detachSceneCameras();
      if (scene.activeCamera !== editorCamera) {
        editorCamera.attachControl(this.canvas, true);
        scene.activeCamera = editorCamera;
      }
      return;
    }
    const active = document.nodes.find((node) => node.type === "camera" && node.camera.active);
    const camera =
      active && active.type === "camera" ? this.entities.get(active.id)?.camera : undefined;
    if (!camera) {
      useEditorStore.getState().setStatus("No active scene camera to preview");
      return;
    }
    editorCamera.detachControl();
    camera.attachControl(this.canvas, true);
    scene.activeCamera = camera;
  }

  private detachSceneCameras(): void {
    for (const entity of this.entities.values()) {
      entity.camera?.detachControl();
    }
  }

  private applyGizmos(document: EditorDocument, ui: EditorUi): void {
    const gizmos = this.gizmos;
    if (!gizmos) return;
    const selected = ui.selection.type === "node" ? this.entities.get(ui.selection.id) : undefined;
    const node =
      ui.selection.type === "node" ? findNode(document.nodes, ui.selection.id) : undefined;
    gizmos.positionGizmoEnabled = !ui.previewActiveCamera && ui.tool === "translate";
    gizmos.rotationGizmoEnabled = !ui.previewActiveCamera && ui.tool === "rotate";
    gizmos.scaleGizmoEnabled = !ui.previewActiveCamera && ui.tool === "scale";
    if (!selected || !node || ui.previewActiveCamera) {
      gizmos.attachToNode(null);
      return;
    }
    gizmos.attachToNode(selected.handle);
    const snap = ui.snapEnabled;
    const rotate = (ui.snapRotateDegrees * Math.PI) / 180;
    if (gizmos.gizmos.positionGizmo) {
      gizmos.gizmos.positionGizmo.snapDistance = snap ? ui.snapTranslate : 0;
    }
    if (gizmos.gizmos.rotationGizmo) {
      gizmos.gizmos.rotationGizmo.snapDistance = snap ? rotate : 0;
    }
    if (gizmos.gizmos.scaleGizmo) {
      gizmos.gizmos.scaleGizmo.snapDistance = snap ? ui.snapScale : 0;
    }
  }

  /** ギズモは作り直されるので、ドラッグの開始と終了は毎フレーム見る。 */
  private watchGizmo(): void {
    const dragging = this.gizmos?.isDragging ?? false;
    if (dragging && !this.wasDragging) {
      this.dragging = true;
      this.dragId = this.currentNodeId();
      useEditorStore.getState().beginGesture();
    } else if (!dragging && this.wasDragging) {
      const id = this.dragId;
      this.dragging = false;
      this.dragId = null;
      if (id) this.commitHandle(id);
      useEditorStore.getState().endGesture();
    }
    this.wasDragging = dragging;
  }

  private currentNodeId(): string | null {
    const selection = useEditorStore.getState().ui.selection;
    return selection.type === "node" ? selection.id : null;
  }

  private commitHandle(id: string): void {
    const entity = this.entities.get(id);
    const node = findNode(useEditorStore.getState().document.nodes, id);
    if (!entity || !node) return;
    const store = useEditorStore.getState();
    if (node.type === "camera" && node.camera.kind === "arcRotate") {
      const position = readTransform(entity.handle).position;
      store.updateCamera(id, { target: position });
      store.updateTransform(id, {
        ...node.transform,
        position,
      });
      return;
    }
    const transform = readTransform(entity.handle);
    store.updateTransform(id, transform);
    if (node.type === "light" && node.light.kind !== "point") {
      store.updateLight(id, {
        direction: directionOf(entity.handle, node.light.kind),
      });
    }
  }

  private reparent(id: string, parentId: string | null): void {
    const state = useEditorStore.getState();
    if (!canParent(state.document.nodes, id, parentId)) return;
    const child = this.entities.get(id)?.handle;
    const parent = parentId ? (this.entities.get(parentId)?.handle ?? null) : null;
    if (!child) {
      state.setParent(id, parentId);
      return;
    }
    child.setParent(parent);
    state.setParent(id, parentId, readTransform(child));
  }

  private setLightDirection(id: string, direction: Vec3): void {
    const entity = this.entities.get(id);
    const node = findNode(useEditorStore.getState().document.nodes, id);
    if (!entity || node?.type !== "light") return;
    const axis = localLightAxis(node.light.kind);
    const target = vec3(direction);
    if (target.lengthSquared() < 1e-8) return;
    target.normalize();
    const rotation = Quaternion.FromUnitVectorsToRef(axis.normalize(), target, new Quaternion());
    entity.handle.rotationQuaternion = rotation;
    const euler = rotation.toEulerAngles();
    const store = useEditorStore.getState();
    store.updateTransform(id, {
      ...readTransform(entity.handle),
      rotation: [euler.x, euler.y, euler.z],
    });
    store.updateLight(id, {
      direction: [target.x, target.y, target.z],
    });
  }

  private disposeEntity(entity: LiveEntity): void {
    if (!entity.light?.isDisposed()) entity.light?.dispose();
    if (!entity.camera?.isDisposed()) entity.camera?.dispose();
    if (!entity.handle.isDisposed()) entity.handle.dispose(false, false);
  }
}

function signatureOf(node: EditorNode): string {
  if (node.type === "mesh") return meshSignature(node);
  if (node.type === "light") return lightSignature(node);
  return cameraSignature(node);
}

function directionOf(handle: TransformNode, kind: LightKind): Vec3 {
  const axis = localLightAxis(kind);
  const matrix = handle.getWorldMatrix();
  const parent = handle.parent;
  const local = parent ? parent.getWorldMatrix().clone().invert().multiply(matrix) : matrix;
  const dir = Vector3.TransformNormal(axis, local);
  if (dir.lengthSquared() < 1e-8) return [axis.x, axis.y, axis.z];
  dir.normalize();
  return [dir.x, dir.y, dir.z];
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}
