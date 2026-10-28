/**
 * エディタが保存する文書の型。Babylon オブジェクトは持たず、JSON にできる形だけを置く。
 * glTF へ書き出すとき、この文書が scene.extras["5pla"].document に入る。
 */

export const DOCUMENT_VERSION = 1 as const;

export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

export interface Transform {
  position: Vec3;
  /** ラジアンのオイラー角 (Babylon の rotation と同じ XYZ) */
  rotation: Vec3;
  scaling: Vec3;
}

export type FogMode = "none" | "exp" | "exp2" | "linear";

export interface FogSettings {
  mode: FogMode;
  color: Vec3;
  density: number;
  start: number;
  end: number;
}

export interface PhysicsWorldSettings {
  enabled: boolean;
  gravity: Vec3;
}

export interface BloomSettings {
  enabled: boolean;
  threshold: number;
  weight: number;
  kernel: number;
  scale: number;
}

export interface PostProcessesSettings {
  bloom: BloomSettings;
  fxaa: { enabled: boolean };
  imageProcessing: { enabled: boolean; exposure: number; contrast: number };
  vignette: { enabled: boolean; weight: number; color: Vec3 };
  chromaticAberration: { enabled: boolean; aberrationAmount: number };
  grain: { enabled: boolean; intensity: number; animated: boolean };
}

export interface SceneSettings {
  clearColor: Vec4;
  fog: FogSettings;
  physics: PhysicsWorldSettings;
  /** null のときは DefaultRenderingPipeline を付けない */
  postProcesses: PostProcessesSettings | null;
}

export type MeshKind = "box" | "sphere" | "plane" | "ground" | "cylinder" | "gltf";

export type PhysicsShapeKind = "box" | "sphere" | "cylinder" | "capsule" | "convexHull" | "mesh";

export interface MeshPhysics {
  enabled: boolean;
  shape: PhysicsShapeKind;
  /** 0 は静的ボディ */
  mass: number;
}

export interface MeshSize {
  width: number;
  height: number;
  depth: number;
  diameter: number;
}

export interface MeshProps {
  kind: MeshKind;
  materialId: string | null;
  physics: MeshPhysics | null;
  size: MeshSize;
  /** kind が gltf のとき、assets のキー */
  assetId: string | null;
}

export type LightKind = "point" | "spot" | "directional" | "hemispheric";

export interface LightProps {
  kind: LightKind;
  color: Vec3;
  groundColor: Vec3;
  intensity: number;
  range: number;
  /** スポットの外側角度 (ラジアン) */
  angle: number;
  exponent: number;
  shadows: boolean;
  direction: Vec3;
}

export type CameraKind = "arcRotate" | "universal";

export interface CameraProps {
  kind: CameraKind;
  /** ゲーム側で使うカメラ。エディタの操作カメラとは別 */
  active: boolean;
  fov: number;
  minZ: number;
  maxZ: number;
  alpha: number;
  beta: number;
  radius: number;
  target: Vec3;
}

interface NodeBase {
  id: string;
  name: string;
  parentId: string | null;
  transform: Transform;
}

export interface MeshNode extends NodeBase {
  type: "mesh";
  mesh: MeshProps;
}

export interface LightNode extends NodeBase {
  type: "light";
  light: LightProps;
}

export interface CameraNode extends NodeBase {
  type: "camera";
  camera: CameraProps;
}

export type EditorNode = MeshNode | LightNode | CameraNode;

export type MaterialKind = "pbr" | "standard";

export interface MaterialTextures {
  albedo: string | null;
  normal: string | null;
  metallicRoughness: string | null;
  emissive: string | null;
}

export interface MaterialDef {
  id: string;
  name: string;
  kind: MaterialKind;
  albedoColor: Vec3;
  metallic: number;
  roughness: number;
  emissive: Vec3;
  alpha: number;
  textures: MaterialTextures;
}

export interface ParticleDef {
  id: string;
  name: string;
  /** 追従するノード。null なら position をワールド座標にする */
  emitterNodeId: string | null;
  position: Vec3;
  /** null のときは組み込みの丸テクスチャ */
  textureAssetId: string | null;
  emitRate: number;
  color: Vec4;
  colorDead: Vec4;
  minSize: number;
  maxSize: number;
  minLifeTime: number;
  maxLifeTime: number;
  direction1: Vec3;
  direction2: Vec3;
  emitPower: number;
  playing: boolean;
}

export interface AssetDef {
  id: string;
  name: string;
  mime: string;
  dataUrl: string;
}

export interface EditorDocument {
  version: typeof DOCUMENT_VERSION;
  scene: SceneSettings;
  nodes: EditorNode[];
  materials: MaterialDef[];
  particles: ParticleDef[];
  assets: Record<string, AssetDef>;
}

export type GizmoTool = "translate" | "rotate" | "scale";

export type Selection =
  | { type: "scene" }
  | { type: "node"; id: string }
  | { type: "material"; id: string }
  | { type: "particle"; id: string };

export interface EditorUi {
  selection: Selection;
  tool: GizmoTool;
  snapEnabled: boolean;
  snapTranslate: number;
  /** 度数法。ギズモへ渡すときにラジアンへ直す */
  snapRotateDegrees: number;
  snapScale: number;
  /** true のとき、active なシーンカメラでビューポートを描く */
  previewActiveCamera: boolean;
  /** 文書の physics.enabled が true のときだけシミュレーションする */
  simulatePhysics: boolean;
  status: string | null;
}
