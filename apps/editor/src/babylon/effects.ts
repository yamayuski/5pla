/**
 * ポストプロセス、パーティクル、Havok。編集中のシミュレーションは明示したときだけ回す。
 */
import type { Camera } from "@babylonjs/core/Cameras/camera";
import type { ShadowLight } from "@babylonjs/core/Lights/shadowLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import type { Scene } from "@babylonjs/core/scene";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { BUILTIN_PARTICLE_TEXTURE } from "../runtime/builtinParticleTexture";
import type {
  EditorDocument,
  ParticleDef,
  PhysicsShapeKind,
  PostProcessesSettings,
  Vec4,
} from "../store/types";
import type { LiveEntity } from "./entities";

let havokPromise: Promise<unknown> | null = null;

async function loadHavok(): Promise<unknown> {
  if (!havokPromise) {
    havokPromise = import("@babylonjs/havok").then((mod) => mod.default());
  }
  return havokPromise;
}

export function physicsShape(kind: PhysicsShapeKind): PhysicsShapeType {
  switch (kind) {
    case "box":
      return PhysicsShapeType.BOX;
    case "sphere":
      return PhysicsShapeType.SPHERE;
    case "cylinder":
      return PhysicsShapeType.CYLINDER;
    case "capsule":
      return PhysicsShapeType.CAPSULE;
    case "convexHull":
      return PhysicsShapeType.CONVEX_HULL;
    case "mesh":
      return PhysicsShapeType.MESH;
  }
}

function color4(value: Vec4): Color4 {
  return new Color4(value[0], value[1], value[2], value[3]);
}

export class PostProcessController {
  private pipeline: DefaultRenderingPipeline | null = null;
  private camera: Camera | null = null;

  public sync(scene: Scene, camera: Camera | null, settings: PostProcessesSettings | null): void {
    if (!settings || !camera) {
      this.dispose();
      return;
    }
    if (!this.pipeline || this.camera !== camera) {
      this.dispose();
      this.camera = camera;
      this.pipeline = new DefaultRenderingPipeline("5pla", true, scene, [camera]);
    }
    const pipeline = this.pipeline;
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

  public dispose(): void {
    this.pipeline?.dispose();
    this.pipeline = null;
    this.camera = null;
  }
}

export class ParticleController {
  private readonly systems = new Map<string, ParticleSystem>();
  private readonly textures = new Map<string, Texture>();

  public sync(
    scene: Scene,
    document: EditorDocument,
    entities: ReadonlyMap<string, LiveEntity>,
  ): void {
    const alive = new Set(document.particles.map((particle) => particle.id));
    for (const [id, system] of this.systems) {
      if (alive.has(id)) continue;
      system.dispose();
      this.systems.delete(id);
    }
    for (const particle of document.particles) {
      const system = this.systemFor(scene, particle);
      this.apply(scene, document, system, particle, entities);
    }
  }

  public dispose(): void {
    for (const system of this.systems.values()) system.dispose();
    this.systems.clear();
    for (const texture of this.textures.values()) texture.dispose();
    this.textures.clear();
  }

  private systemFor(scene: Scene, particle: ParticleDef): ParticleSystem {
    const existing = this.systems.get(particle.id);
    if (existing) {
      existing.name = particle.name;
      return existing;
    }
    const system = new ParticleSystem(particle.name, 2000, scene);
    this.systems.set(particle.id, system);
    return system;
  }

  private apply(
    scene: Scene,
    document: EditorDocument,
    system: ParticleSystem,
    particle: ParticleDef,
    entities: ReadonlyMap<string, LiveEntity>,
  ): void {
    const handle = particle.emitterNodeId
      ? entities.get(particle.emitterNodeId)?.handle
      : undefined;
    const mesh =
      handle instanceof AbstractMesh ? handle : (handle?.getChildMeshes(false)[0] ?? null);
    system.emitter = mesh ?? Vector3.FromArray(particle.position);
    system.particleTexture = this.texture(scene, document, particle);
    system.emitRate = particle.emitRate;
    system.minSize = particle.minSize;
    system.maxSize = particle.maxSize;
    system.minLifeTime = particle.minLifeTime;
    system.maxLifeTime = particle.maxLifeTime;
    system.direction1 = Vector3.FromArray(particle.direction1);
    system.direction2 = Vector3.FromArray(particle.direction2);
    system.minEmitPower = particle.emitPower * 0.5;
    system.maxEmitPower = particle.emitPower;
    system.color1 = color4(particle.color);
    system.color2 = color4(particle.color);
    system.colorDead = color4(particle.colorDead);
    system.gravity = new Vector3(0, -0.2, 0);
    system.updateSpeed = 0.016;
    if (particle.playing && !system.isStarted()) system.start();
    if (!particle.playing && system.isStarted()) system.stop();
  }

  private texture(scene: Scene, document: EditorDocument, particle: ParticleDef): Texture {
    const key = particle.textureAssetId ?? "builtin";
    const cached = this.textures.get(key);
    if (cached) return cached;
    const asset = particle.textureAssetId ? document.assets[particle.textureAssetId] : undefined;
    const url = asset?.dataUrl ?? BUILTIN_PARTICLE_TEXTURE;
    const texture = new Texture(url, scene, false, true);
    this.textures.set(key, texture);
    return texture;
  }
}

export class ShadowController {
  private readonly generators = new Map<string, ShadowGenerator>();

  public sync(entities: ReadonlyMap<string, LiveEntity>, document: EditorDocument): void {
    const wanted = new Set<string>();
    const casters: AbstractMesh[] = [];
    for (const node of document.nodes) {
      if (node.type !== "mesh") continue;
      const handle = entities.get(node.id)?.handle;
      if (!handle) continue;
      if ("receiveShadows" in handle) {
        (handle as AbstractMesh).receiveShadows = true;
      }
      for (const mesh of handle.getChildMeshes(false)) {
        if (mesh.metadata?.editorProxy || mesh.metadata?.editorOnly) continue;
        mesh.receiveShadows = true;
        casters.push(mesh);
      }
      if (handle.getClassName() === "Mesh" || handle.getClassName() === "GroundMesh") {
        casters.push(handle as AbstractMesh);
      }
    }
    for (const node of document.nodes) {
      if (node.type !== "light" || !node.light.shadows) continue;
      if (node.light.kind === "hemispheric") continue;
      const light = entities.get(node.id)?.light;
      if (!light) continue;
      wanted.add(node.id);
      let generator = this.generators.get(node.id);
      if (!generator) {
        generator = new ShadowGenerator(1024, light as ShadowLight);
        generator.useBlurExponentialShadowMap = true;
        this.generators.set(node.id, generator);
      }
      for (const mesh of casters) generator.addShadowCaster(mesh, true);
    }
    for (const [id, generator] of this.generators) {
      if (wanted.has(id)) continue;
      generator.dispose();
      this.generators.delete(id);
    }
  }

  public dispose(): void {
    for (const generator of this.generators.values()) generator.dispose();
    this.generators.clear();
  }
}

export class PhysicsController {
  private plugin: HavokPlugin | null = null;
  private aggregates: PhysicsAggregate[] = [];

  public async sync(
    scene: Scene,
    document: EditorDocument,
    entities: ReadonlyMap<string, LiveEntity>,
    simulate: boolean,
  ): Promise<void> {
    const enabled = document.scene.physics.enabled && simulate;
    if (!enabled) {
      this.clearAggregates();
      scene.physicsEnabled = false;
      return;
    }
    await this.ensure(scene, document.scene.physics.gravity);
    scene.physicsEnabled = true;
    scene.getPhysicsEngine()?.setGravity(Vector3.FromArray(document.scene.physics.gravity));
    this.clearAggregates();
    for (const node of document.nodes) {
      if (node.type !== "mesh" || !node.mesh.physics?.enabled) continue;
      const handle = entities.get(node.id)?.handle;
      if (!handle) continue;
      const mesh = physicsTarget(handle);
      if (!mesh) continue;
      this.aggregates.push(
        new PhysicsAggregate(
          mesh,
          physicsShape(node.mesh.physics.shape),
          { mass: node.mesh.physics.mass, restitution: 0.1 },
          scene,
        ),
      );
    }
  }

  public dispose(): void {
    this.clearAggregates();
    this.plugin?.dispose();
    this.plugin = null;
  }

  private async ensure(scene: Scene, gravity: [number, number, number]): Promise<void> {
    if (this.plugin && scene.getPhysicsEngine()) return;
    const havok = await loadHavok();
    this.plugin = new HavokPlugin(true, havok);
    scene.enablePhysics(Vector3.FromArray(gravity), this.plugin);
  }

  private clearAggregates(): void {
    for (const aggregate of this.aggregates) aggregate.dispose();
    this.aggregates = [];
  }
}

function physicsTarget(handle: TransformNode): AbstractMesh | null {
  if (handle.getClassName() === "Mesh" || handle.getClassName() === "GroundMesh") {
    return handle as AbstractMesh;
  }
  const meshes = handle
    .getChildMeshes(false)
    .filter((mesh) => !mesh.metadata?.editorProxy && !mesh.metadata?.editorOnly);
  return meshes[0] ?? null;
}
