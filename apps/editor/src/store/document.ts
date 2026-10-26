/**
 * エディタ文書の生成・検証・親子関係。Babylon には依存しない。
 */
import { createId } from "./ids";
import {
  DOCUMENT_VERSION,
  type AssetDef,
  type CameraKind,
  type CameraNode,
  type CameraProps,
  type EditorDocument,
  type EditorNode,
  type FogMode,
  type FogSettings,
  type LightKind,
  type LightNode,
  type LightProps,
  type MaterialDef,
  type MaterialKind,
  type MaterialTextures,
  type MeshKind,
  type MeshNode,
  type MeshPhysics,
  type MeshProps,
  type MeshSize,
  type ParticleDef,
  type PhysicsShapeKind,
  type PhysicsWorldSettings,
  type PostProcessesSettings,
  type SceneSettings,
  type Transform,
  type Vec3,
  type Vec4,
} from "./types";

const FOG_MODES: readonly FogMode[] = ["none", "exp", "exp2", "linear"];
const MESH_KINDS: readonly MeshKind[] = ["box", "sphere", "plane", "ground", "cylinder", "gltf"];
const SHAPES: readonly PhysicsShapeKind[] = [
  "box",
  "sphere",
  "cylinder",
  "capsule",
  "convexHull",
  "mesh",
];
const LIGHT_KINDS: readonly LightKind[] = ["point", "spot", "directional", "hemispheric"];
const CAMERA_KINDS: readonly CameraKind[] = ["arcRotate", "universal"];
const MATERIAL_KINDS: readonly MaterialKind[] = ["pbr", "standard"];

export function identityTransform(): Transform {
  return {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scaling: [1, 1, 1],
  };
}

export function defaultMeshSize(): MeshSize {
  return { width: 1, height: 1, depth: 1, diameter: 1 };
}

export function defaultPostProcesses(): PostProcessesSettings {
  return {
    bloom: { enabled: true, threshold: 0.8, weight: 0.3, kernel: 64, scale: 0.5 },
    fxaa: { enabled: true },
    imageProcessing: { enabled: true, exposure: 1, contrast: 1.05 },
    vignette: { enabled: true, weight: 1.8, color: [0, 0, 0] },
    chromaticAberration: { enabled: true, aberrationAmount: 8 },
    grain: { enabled: true, intensity: 12, animated: true },
  };
}

export function defaultPhysics(): MeshPhysics {
  return { enabled: true, shape: "box", mass: 1 };
}

function meshLabel(kind: MeshKind): string {
  switch (kind) {
    case "box":
      return "Box";
    case "sphere":
      return "Sphere";
    case "plane":
      return "Plane";
    case "ground":
      return "Ground";
    case "cylinder":
      return "Cylinder";
    case "gltf":
      return "Model";
  }
}

export function nextName(nodes: { name: string }[], base: string): string {
  const names = new Set(nodes.map((node) => node.name));
  if (!names.has(base)) return base;
  let index = 2;
  while (names.has(`${base} ${index}`)) index += 1;
  return `${base} ${index}`;
}

export function createMeshNode(id: string, name: string, kind: MeshKind): MeshNode {
  const transform = identityTransform();
  const size = defaultMeshSize();
  if (kind === "ground") {
    size.width = 20;
    size.height = 20;
  }
  if (kind === "box" || kind === "sphere" || kind === "cylinder") {
    transform.position = [0, 0.5, 0];
  }
  if (kind === "plane") {
    transform.rotation = [Math.PI / 2, 0, 0];
  }
  const mesh: MeshProps = {
    kind,
    materialId: null,
    physics: null,
    size,
    assetId: null,
  };
  return { id, name, parentId: null, transform, type: "mesh", mesh };
}

export function createLightNode(id: string, name: string, kind: LightKind): LightNode {
  const transform = identityTransform();
  const light: LightProps = {
    kind,
    color: [1, 0.95, 0.88],
    groundColor: [0.12, 0.13, 0.16],
    intensity: kind === "hemispheric" ? 0.65 : kind === "point" ? 8 : 2,
    range: 12,
    angle: Math.PI / 3,
    exponent: 2,
    shadows: false,
    // 回転 0 のとき、半球光は +Y、それ以外の指向性ライトは +Z を向く。
    direction: kind === "hemispheric" ? [0, 1, 0] : [0, 0, 1],
  };
  if (kind === "point") transform.position = [0, 2.5, 0];
  if (kind === "spot") transform.position = [0, 3, 0];
  if (kind === "directional") {
    transform.position = [4, 8, 2];
    light.direction = [-0.4, -1, -0.2];
  }
  return { id, name, parentId: null, transform, type: "light", light };
}

export function createCameraNode(
  id: string,
  name: string,
  kind: CameraKind,
  active: boolean,
): CameraNode {
  const transform = identityTransform();
  const target: Vec3 = [0, 0.5, 0];
  if (kind === "universal") transform.position = [0, 1.6, -4];
  if (kind === "arcRotate") transform.position = [...target];
  const camera: CameraProps = {
    kind,
    active,
    fov: 0.8,
    minZ: 0.1,
    maxZ: 200,
    alpha: -Math.PI / 3,
    beta: Math.PI / 3,
    radius: 8,
    target,
  };
  return { id, name, parentId: null, transform, type: "camera", camera };
}

export function createMaterialDef(
  id: string,
  name: string,
  kind: MaterialKind,
  albedo: Vec3 = [0.72, 0.64, 0.56],
): MaterialDef {
  return {
    id,
    name,
    kind,
    albedoColor: albedo,
    metallic: kind === "pbr" ? 0 : 0,
    roughness: 0.72,
    emissive: [0, 0, 0],
    alpha: 1,
    textures: {
      albedo: null,
      normal: null,
      metallicRoughness: null,
      emissive: null,
    },
  };
}

export function createParticleDef(id: string, name: string): ParticleDef {
  return {
    id,
    name,
    emitterNodeId: null,
    position: [0, 1, 0],
    textureAssetId: null,
    emitRate: 40,
    color: [0.85, 0.82, 0.75, 1],
    colorDead: [0.2, 0.18, 0.16, 0],
    minSize: 0.08,
    maxSize: 0.28,
    minLifeTime: 0.6,
    maxLifeTime: 1.8,
    direction1: [-0.3, 1, -0.3],
    direction2: [0.3, 1.4, 0.3],
    emitPower: 1,
    playing: true,
  };
}

export function createDefaultDocument(): EditorDocument {
  const groundMatId = createId();
  const boxMatId = createId();
  const ground = createMeshNode(createId(), "Ground", "ground");
  ground.mesh.materialId = groundMatId;
  const box = createMeshNode(createId(), "Box", "box");
  box.mesh.materialId = boxMatId;
  const light = createLightNode(createId(), "Hemisphere", "hemispheric");
  const camera = createCameraNode(createId(), "Camera", "arcRotate", true);
  return {
    version: DOCUMENT_VERSION,
    scene: {
      clearColor: [0.045, 0.048, 0.055, 1],
      fog: {
        mode: "none",
        color: [0.045, 0.048, 0.055],
        density: 0.03,
        start: 8,
        end: 40,
      },
      physics: { enabled: false, gravity: [0, -9.81, 0] },
      postProcesses: null,
    },
    nodes: [ground, box, light, camera],
    materials: [
      createMaterialDef(groundMatId, "Ground", "standard", [0.28, 0.29, 0.31]),
      createMaterialDef(boxMatId, "Box", "pbr", [0.55, 0.22, 0.2]),
    ],
    particles: [],
    assets: {},
  };
}

export function findNode(nodes: readonly EditorNode[], id: string): EditorNode | undefined {
  return nodes.find((node) => node.id === id);
}

export function collectDescendants(nodes: readonly EditorNode[], id: string): Set<string> {
  const result = new Set<string>([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const node of nodes) {
      if (node.parentId && result.has(node.parentId) && !result.has(node.id)) {
        result.add(node.id);
        grew = true;
      }
    }
  }
  return result;
}

/** parentId へ付け替えてよいか。自分自身と子孫は拒否する。 */
export function canParent(
  nodes: readonly EditorNode[],
  id: string,
  parentId: string | null,
): boolean {
  if (!findNode(nodes, id)) return false;
  if (parentId === null) return true;
  if (parentId === id) return false;
  if (!findNode(nodes, parentId)) return false;
  return !collectDescendants(nodes, id).has(parentId);
}

export function assetExtension(name: string): ".glb" | ".gltf" {
  return name.toLowerCase().endsWith(".gltf") ? ".gltf" : ".glb";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function vec3(value: unknown, fallback: Vec3): Vec3 {
  if (!Array.isArray(value)) return [...fallback];
  return [num(value[0], fallback[0]), num(value[1], fallback[1]), num(value[2], fallback[2])];
}

function vec4(value: unknown, fallback: Vec4): Vec4 {
  if (!Array.isArray(value)) return [...fallback];
  return [
    num(value[0], fallback[0]),
    num(value[1], fallback[1]),
    num(value[2], fallback[2]),
    num(value[3], fallback[3]),
  ];
}

function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return options.find((option) => option === value) ?? fallback;
}

function parseTransform(value: unknown): Transform {
  const record = isRecord(value) ? value : {};
  const base = identityTransform();
  return {
    position: vec3(record.position, base.position),
    rotation: vec3(record.rotation, base.rotation),
    scaling: vec3(record.scaling, base.scaling),
  };
}

function parseMeshSize(value: unknown, kind: MeshKind): MeshSize {
  const base = defaultMeshSize();
  if (kind === "ground") {
    base.width = 20;
    base.height = 20;
  }
  const record = isRecord(value) ? value : {};
  return {
    width: num(record.width, base.width),
    height: num(record.height, base.height),
    depth: num(record.depth, base.depth),
    diameter: num(record.diameter, base.diameter),
  };
}

function parsePhysics(value: unknown): MeshPhysics | null {
  if (!isRecord(value)) return null;
  return {
    enabled: bool(value.enabled, false),
    shape: oneOf(value.shape, SHAPES, "box"),
    mass: num(value.mass, 1),
  };
}

function parseMeshProps(value: unknown): MeshProps {
  const record = isRecord(value) ? value : {};
  const kind = oneOf(record.kind, MESH_KINDS, "box");
  return {
    kind,
    materialId: typeof record.materialId === "string" ? record.materialId : null,
    physics: parsePhysics(record.physics),
    size: parseMeshSize(record.size, kind),
    assetId: typeof record.assetId === "string" ? record.assetId : null,
  };
}

function parseLightProps(value: unknown): LightProps {
  const record = isRecord(value) ? value : {};
  const defaults = createLightNode("tmp", "tmp", "point").light;
  return {
    kind: oneOf(record.kind, LIGHT_KINDS, "point"),
    color: vec3(record.color, defaults.color),
    groundColor: vec3(record.groundColor, defaults.groundColor),
    intensity: num(record.intensity, defaults.intensity),
    range: num(record.range, defaults.range),
    angle: num(record.angle, defaults.angle),
    exponent: num(record.exponent, defaults.exponent),
    shadows: bool(record.shadows, false),
    direction: vec3(record.direction, defaults.direction),
  };
}

function parseCameraProps(value: unknown): CameraProps {
  const record = isRecord(value) ? value : {};
  const defaults = createCameraNode("tmp", "tmp", "arcRotate", false).camera;
  return {
    kind: oneOf(record.kind, CAMERA_KINDS, "arcRotate"),
    active: bool(record.active, false),
    fov: num(record.fov, defaults.fov),
    minZ: num(record.minZ, defaults.minZ),
    maxZ: num(record.maxZ, defaults.maxZ),
    alpha: num(record.alpha, defaults.alpha),
    beta: num(record.beta, defaults.beta),
    radius: num(record.radius, defaults.radius),
    target: vec3(record.target, defaults.target),
  };
}

function parseNode(value: unknown, index: number): EditorNode {
  if (!isRecord(value)) {
    throw new Error(`Invalid node at ${index}`);
  }
  const id = str(value.id, "");
  if (!id) throw new Error(`Node ${index} is missing an id`);
  const base = {
    id,
    name: str(value.name, "Node"),
    parentId: typeof value.parentId === "string" ? value.parentId : null,
    transform: parseTransform(value.transform),
  };
  if (value.type === "light") {
    return { ...base, type: "light", light: parseLightProps(value.light) };
  }
  if (value.type === "camera") {
    return { ...base, type: "camera", camera: parseCameraProps(value.camera) };
  }
  if (value.type === "mesh") {
    return { ...base, type: "mesh", mesh: parseMeshProps(value.mesh) };
  }
  throw new Error(`Node ${id} has an unknown type`);
}

function parseTextures(value: unknown): MaterialTextures {
  const record = isRecord(value) ? value : {};
  const slot = (key: string): string | null =>
    typeof record[key] === "string" ? record[key] : null;
  return {
    albedo: slot("albedo"),
    normal: slot("normal"),
    metallicRoughness: slot("metallicRoughness"),
    emissive: slot("emissive"),
  };
}

function parseMaterial(value: unknown, index: number): MaterialDef {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id) {
    throw new Error(`Invalid material at ${index}`);
  }
  const defaults = createMaterialDef(value.id, "Material", "pbr");
  return {
    id: value.id,
    name: str(value.name, defaults.name),
    kind: oneOf(value.kind, MATERIAL_KINDS, "pbr"),
    albedoColor: vec3(value.albedoColor, defaults.albedoColor),
    metallic: num(value.metallic, defaults.metallic),
    roughness: num(value.roughness, defaults.roughness),
    emissive: vec3(value.emissive, defaults.emissive),
    alpha: num(value.alpha, defaults.alpha),
    textures: parseTextures(value.textures),
  };
}

function parseParticle(value: unknown, index: number): ParticleDef {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id) {
    throw new Error(`Invalid particle system at ${index}`);
  }
  const defaults = createParticleDef(value.id, "Particles");
  return {
    id: value.id,
    name: str(value.name, defaults.name),
    emitterNodeId: typeof value.emitterNodeId === "string" ? value.emitterNodeId : null,
    position: vec3(value.position, defaults.position),
    textureAssetId: typeof value.textureAssetId === "string" ? value.textureAssetId : null,
    emitRate: num(value.emitRate, defaults.emitRate),
    color: vec4(value.color, defaults.color),
    colorDead: vec4(value.colorDead, defaults.colorDead),
    minSize: num(value.minSize, defaults.minSize),
    maxSize: num(value.maxSize, defaults.maxSize),
    minLifeTime: num(value.minLifeTime, defaults.minLifeTime),
    maxLifeTime: num(value.maxLifeTime, defaults.maxLifeTime),
    direction1: vec3(value.direction1, defaults.direction1),
    direction2: vec3(value.direction2, defaults.direction2),
    emitPower: num(value.emitPower, defaults.emitPower),
    playing: bool(value.playing, true),
  };
}

function parseAsset(value: unknown): AssetDef | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.dataUrl !== "string") {
    return null;
  }
  return {
    id: value.id,
    name: str(value.name, "asset"),
    mime: str(value.mime, "application/octet-stream"),
    dataUrl: value.dataUrl,
  };
}

function parseFog(value: unknown): FogSettings {
  const record = isRecord(value) ? value : {};
  return {
    mode: oneOf(record.mode, FOG_MODES, "none"),
    color: vec3(record.color, [0.05, 0.05, 0.05]),
    density: num(record.density, 0.02),
    start: num(record.start, 5),
    end: num(record.end, 40),
  };
}

function parseWorld(value: unknown): PhysicsWorldSettings {
  const record = isRecord(value) ? value : {};
  return {
    enabled: bool(record.enabled, false),
    gravity: vec3(record.gravity, [0, -9.81, 0]),
  };
}

function parsePost(value: unknown): PostProcessesSettings | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) return null;
  const defaults = defaultPostProcesses();
  const bloom = isRecord(value.bloom) ? value.bloom : {};
  const fxaa = isRecord(value.fxaa) ? value.fxaa : {};
  const image = isRecord(value.imageProcessing) ? value.imageProcessing : {};
  const vignette = isRecord(value.vignette) ? value.vignette : {};
  const chroma = isRecord(value.chromaticAberration) ? value.chromaticAberration : {};
  const grain = isRecord(value.grain) ? value.grain : {};
  return {
    bloom: {
      enabled: bool(bloom.enabled, defaults.bloom.enabled),
      threshold: num(bloom.threshold, defaults.bloom.threshold),
      weight: num(bloom.weight, defaults.bloom.weight),
      kernel: num(bloom.kernel, defaults.bloom.kernel),
      scale: num(bloom.scale, defaults.bloom.scale),
    },
    fxaa: { enabled: bool(fxaa.enabled, defaults.fxaa.enabled) },
    imageProcessing: {
      enabled: bool(image.enabled, defaults.imageProcessing.enabled),
      exposure: num(image.exposure, defaults.imageProcessing.exposure),
      contrast: num(image.contrast, defaults.imageProcessing.contrast),
    },
    vignette: {
      enabled: bool(vignette.enabled, defaults.vignette.enabled),
      weight: num(vignette.weight, defaults.vignette.weight),
      color: vec3(vignette.color, defaults.vignette.color),
    },
    chromaticAberration: {
      enabled: bool(chroma.enabled, defaults.chromaticAberration.enabled),
      aberrationAmount: num(chroma.aberrationAmount, defaults.chromaticAberration.aberrationAmount),
    },
    grain: {
      enabled: bool(grain.enabled, defaults.grain.enabled),
      intensity: num(grain.intensity, defaults.grain.intensity),
      animated: bool(grain.animated, defaults.grain.animated),
    },
  };
}

function parseScene(value: unknown): SceneSettings {
  if (!isRecord(value)) throw new Error("Invalid scene settings");
  return {
    clearColor: vec4(value.clearColor, [0.05, 0.05, 0.05, 1]),
    fog: parseFog(value.fog),
    physics: parseWorld(value.physics),
    postProcesses: parsePost(value.postProcesses),
  };
}

/** JSON から文書を復元する。壊れたファイルは例外にする。 */
export function parseEditorDocument(input: unknown): EditorDocument {
  if (!isRecord(input)) throw new Error("Invalid editor document");
  if (input.version !== DOCUMENT_VERSION) {
    throw new Error(`Unsupported document version: ${String(input.version)}`);
  }
  if (!Array.isArray(input.nodes)) throw new Error("Invalid editor document");
  const nodes = input.nodes.map((node, index) => parseNode(node, index));
  const materials = Array.isArray(input.materials)
    ? input.materials.map((material, index) => parseMaterial(material, index))
    : [];
  const particles = Array.isArray(input.particles)
    ? input.particles.map((particle, index) => parseParticle(particle, index))
    : [];
  const assets: Record<string, AssetDef> = {};
  if (isRecord(input.assets)) {
    for (const value of Object.values(input.assets)) {
      const asset = parseAsset(value);
      if (asset) assets[asset.id] = asset;
    }
  }
  const ids = new Set<string>();
  for (const node of nodes) {
    if (ids.has(node.id)) throw new Error(`Duplicate node id ${node.id}`);
    ids.add(node.id);
  }
  return {
    version: DOCUMENT_VERSION,
    scene: parseScene(input.scene),
    nodes,
    materials,
    particles,
    assets,
  };
}

export function meshKindLabel(kind: MeshKind): string {
  return meshLabel(kind);
}

export function lightKindLabel(kind: LightKind): string {
  switch (kind) {
    case "point":
      return "Point Light";
    case "spot":
      return "Spot Light";
    case "directional":
      return "Directional Light";
    case "hemispheric":
      return "Hemispheric Light";
  }
}

export function cameraKindLabel(kind: CameraKind): string {
  return kind === "arcRotate" ? "Arc Rotate Camera" : "Universal Camera";
}
