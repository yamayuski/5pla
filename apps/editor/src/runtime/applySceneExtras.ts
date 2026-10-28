/**
 * ゲームが書き出した GLB を読み、extras に入っているフォグ、ポストプロセス、
 * パーティクル、物理、glTF に乗らないライトやカメラをシーンへ戻す。
 *
 * メッシュの座標は glTF 本体が持つ。このヘルパーは transform を上書きしない。
 * 半球光と ArcRotate は glTF に残らないことがあるので、名前が無ければ作り直す。
 */
import type { Camera } from "@babylonjs/core/Cameras/camera";
import { AppendSceneAsync } from "@babylonjs/core/Loading/sceneLoader";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { Node } from "@babylonjs/core/node";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { Scene } from "@babylonjs/core/scene";
import { physicsShape } from "../babylon/effects";
import {
  applyExportedCamera,
  applyExportedLight,
  createCamera,
  createLight,
} from "../babylon/entities";
import "../babylon/sideEffects";
import { exportNameMap, exportNameOf } from "../export/names";
import { readEditorDocumentFromGlb, readSceneExtrasFromGlb } from "../export/glb";
import type { FivePlaSceneExtras } from "../export/schema";
import type { EditorDocument } from "../store/types";
import { BUILTIN_PARTICLE_TEXTURE } from "./builtinParticleTexture";

export interface ApplySceneExtrasOptions {
  /** 既定 true。物理を張らないときは false */
  physics?: boolean;
  /** 既定 true。描画先が無いエンジンでは false */
  postProcesses?: boolean;
  /** 既定 true */
  particles?: boolean;
  /** パイプラインを張るカメラ。省略時は activeCamera */
  camera?: Camera;
}

function fogMode(mode: EditorDocument["scene"]["fog"]["mode"]): number {
  switch (mode) {
    case "exp":
      return Scene.FOGMODE_EXP;
    case "exp2":
      return Scene.FOGMODE_EXP2;
    case "linear":
      return Scene.FOGMODE_LINEAR;
    default:
      return Scene.FOGMODE_NONE;
  }
}

function findExported(scene: Scene, name: string): Node | null {
  return (
    scene.getMeshByName(name) ??
    scene.getLightByName(name) ??
    scene.getCameraByName(name) ??
    scene.getTransformNodeByName(name) ??
    scene.getNodeByName(name)
  );
}

/** 文書の環境設定と、glTF から落ちたノードをシーンへ適用する。 */
export async function applySceneExtras(
  scene: Scene,
  document: EditorDocument,
  options: ApplySceneExtrasOptions = {},
): Promise<void> {
  const clear = document.scene.clearColor;
  scene.clearColor = new Color4(clear[0], clear[1], clear[2], clear[3]);
  scene.fogMode = fogMode(document.scene.fog.mode);
  scene.fogColor = Color3.FromArray(document.scene.fog.color);
  scene.fogDensity = document.scene.fog.density;
  scene.fogStart = document.scene.fog.start;
  scene.fogEnd = document.scene.fog.end;

  const names = exportNameMap(document.nodes);
  restoreLightsAndCameras(scene, document, names);
  if (options.particles !== false) createParticles(scene, document, names);
  if (options.postProcesses !== false) {
    const camera = options.camera ?? scene.activeCamera ?? scene.cameras[0] ?? null;
    applyPipeline(scene, camera, document);
  }
  if (options.physics !== false && document.scene.physics.enabled) {
    await applyPhysics(scene, document, names);
  }
}

/**
 * GLB をシーンへ追加し、extras の 5pla 文書があれば適用する。
 * 文書が無い GLB はそのまま追加して null を返す。
 */
export async function loadGlbWithExtras(
  scene: Scene,
  bytes: Uint8Array,
  options?: ApplySceneExtrasOptions,
): Promise<EditorDocument | null> {
  const document = readEditorDocumentFromGlb(bytes);
  await AppendSceneAsync(bytes, scene, { pluginExtension: ".glb" });
  if (document) await applySceneExtras(scene, document, options);
  return document;
}

export function readExtras(bytes: Uint8Array): FivePlaSceneExtras | null {
  return readSceneExtrasFromGlb(bytes);
}

function restoreLightsAndCameras(
  scene: Scene,
  document: EditorDocument,
  names: Map<string, string>,
): void {
  for (const node of document.nodes) {
    const exportName = exportNameOf(names, node.id);
    if (node.type === "light") {
      const existing = scene.getLightByName(exportName);
      const light = existing ?? createLight(scene, node, exportName);
      applyExportedLight(light, node);
      continue;
    }
    if (node.type !== "camera") continue;
    const existing = scene.getCameraByName(exportName);
    const camera = existing ?? createCamera(scene, node, exportName);
    applyExportedCamera(camera, node);
    if (node.camera.active) scene.activeCamera = camera;
  }
}

function createParticles(scene: Scene, document: EditorDocument, names: Map<string, string>): void {
  for (const particle of document.particles) {
    const system = new ParticleSystem(particle.name, 2000, scene);
    const emitterName = particle.emitterNodeId ? exportNameOf(names, particle.emitterNodeId) : null;
    const found = emitterName ? findExported(scene, emitterName) : null;
    const mesh = found instanceof AbstractMesh ? found : (found?.getChildMeshes(false)[0] ?? null);
    system.emitter =
      mesh ?? new Vector3(particle.position[0], particle.position[1], particle.position[2]);
    const asset = particle.textureAssetId ? document.assets[particle.textureAssetId] : undefined;
    system.particleTexture = new Texture(
      asset?.dataUrl ?? BUILTIN_PARTICLE_TEXTURE,
      scene,
      false,
      true,
    );
    system.emitRate = particle.emitRate;
    system.color1 = new Color4(
      particle.color[0],
      particle.color[1],
      particle.color[2],
      particle.color[3],
    );
    system.color2 = system.color1.clone();
    system.colorDead = new Color4(
      particle.colorDead[0],
      particle.colorDead[1],
      particle.colorDead[2],
      particle.colorDead[3],
    );
    system.minSize = particle.minSize;
    system.maxSize = particle.maxSize;
    system.minLifeTime = particle.minLifeTime;
    system.maxLifeTime = particle.maxLifeTime;
    system.direction1 = Vector3.FromArray(particle.direction1);
    system.direction2 = Vector3.FromArray(particle.direction2);
    system.minEmitPower = particle.emitPower * 0.5;
    system.maxEmitPower = particle.emitPower;
    if (particle.playing) system.start();
  }
}

function applyPipeline(scene: Scene, camera: Camera | null, document: EditorDocument): void {
  const settings = document.scene.postProcesses;
  if (!settings || !camera) return;
  const pipeline = new DefaultRenderingPipeline("5pla", true, scene, [camera]);
  pipeline.bloomEnabled = settings.bloom.enabled;
  pipeline.bloomThreshold = settings.bloom.threshold;
  pipeline.bloomWeight = settings.bloom.weight;
  pipeline.bloomKernel = settings.bloom.kernel;
  pipeline.bloomScale = settings.bloom.scale;
  pipeline.fxaaEnabled = settings.fxaa.enabled;
  pipeline.imageProcessingEnabled = settings.imageProcessing.enabled || settings.vignette.enabled;
  pipeline.imageProcessing.exposure = settings.imageProcessing.exposure;
  pipeline.imageProcessing.contrast = settings.imageProcessing.contrast;
  pipeline.imageProcessing.vignetteEnabled = settings.vignette.enabled;
  pipeline.imageProcessing.vignetteWeight = settings.vignette.weight;
  pipeline.imageProcessing.vignetteColor = new Color4(
    settings.vignette.color[0],
    settings.vignette.color[1],
    settings.vignette.color[2],
    1,
  );
  pipeline.chromaticAberrationEnabled = settings.chromaticAberration.enabled;
  if (settings.chromaticAberration.enabled) {
    pipeline.chromaticAberration.aberrationAmount = settings.chromaticAberration.aberrationAmount;
  }
  pipeline.grainEnabled = settings.grain.enabled;
  if (settings.grain.enabled) {
    pipeline.grain.intensity = settings.grain.intensity;
    pipeline.grain.animated = settings.grain.animated;
  }
}

async function applyPhysics(
  scene: Scene,
  document: EditorDocument,
  names: Map<string, string>,
): Promise<void> {
  const havokModule = await import("@babylonjs/havok");
  const havok = await havokModule.default();
  const plugin = new HavokPlugin(true, havok);
  const gravity = Vector3.FromArray(document.scene.physics.gravity);
  if (!scene.getPhysicsEngine()) scene.enablePhysics(gravity, plugin);
  else scene.getPhysicsEngine()?.setGravity(gravity);

  for (const node of document.nodes) {
    if (node.type !== "mesh" || !node.mesh.physics?.enabled) continue;
    const found = findExported(scene, exportNameOf(names, node.id));
    const mesh = firstMesh(found);
    if (!mesh) continue;
    new PhysicsAggregate(
      mesh,
      physicsShape(node.mesh.physics.shape),
      { mass: node.mesh.physics.mass, restitution: 0.1 },
      scene,
    );
  }
}

function firstMesh(node: Node | null): AbstractMesh | null {
  if (!node) return null;
  if (node.getClassName() === "Mesh" || node.getClassName() === "GroundMesh") {
    return node as AbstractMesh;
  }
  const children = node.getChildMeshes(false);
  return children[0] ?? null;
}
