/**
 * 文書のノードからメッシュ・ライト・カメラを作る。
 * ライブ編集ではギズモ用の TransformNode を持ち、書き出しではそのラッパを作らない。
 */
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import type { Camera } from "@babylonjs/core/Cameras/camera";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Light } from "@babylonjs/core/Lights/light";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import type { ShadowLight } from "@babylonjs/core/Lights/shadowLight";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { CameraNode, LightKind, LightNode, MeshNode, Vec3 } from "../store/types";
import { tagEditor, type EditorMetadata } from "./metadata";
import { vec3 } from "./transform";

export interface LiveEntity {
  handle: TransformNode;
  signature: string;
  light?: Light;
  camera?: Camera;
}

export function meshSignature(node: MeshNode): string {
  const size = node.mesh.size;
  return [
    node.mesh.kind,
    size.width,
    size.height,
    size.depth,
    size.diameter,
    node.mesh.assetId ?? "",
  ].join(":");
}

export function lightSignature(node: LightNode): string {
  return node.light.kind;
}

export function cameraSignature(node: CameraNode): string {
  return node.camera.kind;
}

export function createPrimitive(scene: Scene, node: MeshNode): TransformNode {
  const { kind, size } = node.mesh;
  switch (kind) {
    case "box":
      return MeshBuilder.CreateBox(
        node.id,
        { width: size.width, height: size.height, depth: size.depth },
        scene,
      );
    case "sphere":
      return MeshBuilder.CreateSphere(node.id, { diameter: size.diameter, segments: 24 }, scene);
    case "plane":
      return MeshBuilder.CreatePlane(node.id, { width: size.width, height: size.height }, scene);
    case "ground":
      return MeshBuilder.CreateGround(node.id, { width: size.width, height: size.height }, scene);
    case "cylinder":
      return MeshBuilder.CreateCylinder(
        node.id,
        { height: size.height, diameter: size.diameter },
        scene,
      );
    case "gltf":
      return new TransformNode(node.id, scene);
  }
}

function proxyMaterial(scene: Scene, name: string, color: Color3): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.emissiveColor = color;
  material.diffuseColor = color;
  material.disableLighting = true;
  material.metadata = { editorOnly: true } satisfies EditorMetadata;
  return material;
}

export function createLiveMesh(scene: Scene, node: MeshNode): LiveEntity {
  const handle = createPrimitive(scene, node);
  tagEditor(handle, node.id);
  if (handle instanceof AbstractMesh) handle.isPickable = true;
  return { handle, signature: meshSignature(node) };
}

export function createLiveLight(scene: Scene, node: LightNode): LiveEntity {
  const handle = new TransformNode(node.id, scene);
  tagEditor(handle, node.id);
  const light = createLight(scene, node, `${node.id}:light`);
  light.parent = handle;
  if (isShadowLight(light)) {
    light.position.set(0, 0, 0);
    if (node.light.kind !== "point") light.direction.copyFromFloats(0, 0, 1);
  }
  const proxy = MeshBuilder.CreateSphere(
    `${node.id}:proxy`,
    { diameter: 0.22, segments: 8 },
    scene,
  );
  proxy.parent = handle;
  proxy.material = proxyMaterial(scene, `${node.id}:proxyMat`, new Color3(1, 0.82, 0.35));
  proxy.metadata = { editorId: node.id, editorProxy: true, editorOnly: true };
  proxy.isPickable = true;
  return { handle, signature: lightSignature(node), light };
}

export function createLiveCamera(scene: Scene, node: CameraNode): LiveEntity {
  const handle = new TransformNode(node.id, scene);
  tagEditor(handle, node.id);
  const camera = createCamera(scene, node, `${node.id}:camera`);
  camera.parent = handle;
  if (camera instanceof UniversalCamera) {
    camera.position.set(0, 0, 0);
    camera.rotationQuaternion = Quaternion.Identity();
  }
  const proxy = MeshBuilder.CreateBox(
    `${node.id}:proxy`,
    { width: 0.28, height: 0.18, depth: 0.34 },
    scene,
  );
  proxy.parent = handle;
  proxy.material = proxyMaterial(scene, `${node.id}:proxyMat`, new Color3(0.45, 0.75, 1));
  proxy.metadata = { editorId: node.id, editorProxy: true, editorOnly: true };
  proxy.isPickable = true;
  return { handle, signature: cameraSignature(node), camera };
}

export function applyLiveLight(entity: LiveEntity, node: LightNode): void {
  const light = entity.light;
  if (!light) return;
  light.diffuse = Color3.FromArray(node.light.color);
  light.intensity = node.light.intensity;
  if (light instanceof HemisphericLight) {
    light.groundColor = Color3.FromArray(node.light.groundColor);
    light.direction.copyFromFloats(0, 1, 0);
    return;
  }
  if (isShadowLight(light)) {
    light.range = node.light.range;
    if (node.light.kind === "point") {
      light.direction = vec3(node.light.direction);
    } else {
      light.direction.copyFromFloats(0, 0, 1);
    }
    if (light instanceof SpotLight) {
      light.angle = node.light.angle;
      light.innerAngle = node.light.angle * 0.5;
      light.exponent = node.light.exponent;
    }
  }
}

export function applyLiveCamera(entity: LiveEntity, node: CameraNode): void {
  const camera = entity.camera;
  if (!camera) return;
  camera.fov = node.camera.fov;
  camera.minZ = node.camera.minZ;
  camera.maxZ = node.camera.maxZ;
  if (camera instanceof ArcRotateCamera) {
    camera.alpha = node.camera.alpha;
    camera.beta = node.camera.beta;
    camera.radius = node.camera.radius;
    camera.target = vec3(node.camera.target);
    entity.handle.position.copyFrom(camera.target);
    return;
  }
  if (camera instanceof UniversalCamera) {
    camera.position.set(0, 0, 0);
    camera.rotationQuaternion = Quaternion.Identity();
  }
}

export function assignMaterial(handle: TransformNode, material: Material): void {
  const apply = (mesh: AbstractMesh) => {
    if (mesh.metadata?.editorProxy || mesh.metadata?.editorOnly) return;
    mesh.material = material;
    mesh.receiveShadows = true;
  };
  if ("material" in handle) apply(handle as AbstractMesh);
  for (const mesh of handle.getChildMeshes(false)) apply(mesh);
}

export function createLight(scene: Scene, node: LightNode, name: string): Light {
  const props = node.light;
  switch (props.kind) {
    case "point": {
      const light = new PointLight(name, Vector3.Zero(), scene);
      light.falloffType = Light.FALLOFF_GLTF;
      return light;
    }
    case "spot": {
      const light = new SpotLight(
        name,
        Vector3.Zero(),
        new Vector3(0, -1, 0),
        props.angle,
        props.exponent,
        scene,
      );
      light.falloffType = Light.FALLOFF_GLTF;
      return light;
    }
    case "directional": {
      const light = new DirectionalLight(name, new Vector3(0, -1, 0), scene);
      light.falloffType = Light.FALLOFF_GLTF;
      return light;
    }
    case "hemispheric":
      return new HemisphericLight(name, new Vector3(0, 1, 0), scene);
  }
}

export function createCamera(scene: Scene, node: CameraNode, name: string): Camera {
  const props = node.camera;
  if (props.kind === "arcRotate") {
    return new ArcRotateCamera(
      name,
      props.alpha,
      props.beta,
      props.radius,
      vec3(props.target),
      scene,
    );
  }
  return new UniversalCamera(name, Vector3.Zero(), scene);
}

/** ハンドルのローカル回転から、ライトのローカルな向きを求める。 */
export function aimFromRotation(rotation: Vec3, kind: LightKind): Vector3 {
  const matrix = new Matrix();
  Matrix.RotationYawPitchRollToRef(rotation[1], rotation[0], rotation[2], matrix);
  return Vector3.TransformNormal(localLightAxis(kind), matrix);
}

export function applyExportedLight(light: Light, node: LightNode): void {
  light.diffuse = Color3.FromArray(node.light.color);
  light.intensity = node.light.intensity;
  if (light instanceof HemisphericLight) {
    light.groundColor = Color3.FromArray(node.light.groundColor);
    light.direction = aimFromRotation(node.transform.rotation, node.light.kind);
    return;
  }
  if (!isShadowLight(light)) return;
  light.position.copyFrom(vec3(node.transform.position));
  light.range = node.light.range;
  if (node.light.kind !== "point") {
    light.direction = aimFromRotation(node.transform.rotation, node.light.kind);
  }
  if (light instanceof SpotLight) {
    light.angle = node.light.angle;
    light.innerAngle = node.light.angle * 0.5;
    light.exponent = node.light.exponent;
  }
}

export function applyExportedCamera(camera: Camera, node: CameraNode): void {
  camera.fov = node.camera.fov;
  camera.minZ = node.camera.minZ;
  camera.maxZ = node.camera.maxZ;
  if (camera instanceof ArcRotateCamera) {
    camera.alpha = node.camera.alpha;
    camera.beta = node.camera.beta;
    camera.radius = node.camera.radius;
    camera.setTarget(vec3(node.camera.target));
    return;
  }
  if (camera instanceof UniversalCamera) {
    camera.position.set(
      node.transform.position[0],
      node.transform.position[1],
      node.transform.position[2],
    );
    camera.rotationQuaternion = Quaternion.FromEulerAngles(
      node.transform.rotation[0],
      node.transform.rotation[1],
      node.transform.rotation[2],
    );
  }
}

export function localLightAxis(kind: LightNode["light"]["kind"]): Vector3 {
  return kind === "hemispheric" ? new Vector3(0, 1, 0) : new Vector3(0, 0, 1);
}

function isShadowLight(light: Light): light is ShadowLight {
  return (
    light instanceof PointLight || light instanceof SpotLight || light instanceof DirectionalLight
  );
}

export function detachEditorHandles(
  handle: TransformNode,
  handles: ReadonlySet<TransformNode>,
): TransformNode[] {
  const children: TransformNode[] = [];
  for (const child of handle.getChildren()) {
    if (child instanceof TransformNode && handles.has(child)) children.push(child);
  }
  for (const child of children) child.parent = null;
  return children;
}
