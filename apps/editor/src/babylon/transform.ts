/**
 * 文書のローカル変換と Babylon ノードの変換を対応させる。
 */
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Transform, Vec3 } from "../store/types";

export function vec3(value: Vec3): Vector3 {
  return new Vector3(value[0], value[1], value[2]);
}

export function applyTransform(node: TransformNode, transform: Transform): void {
  node.position.set(transform.position[0], transform.position[1], transform.position[2]);
  if (node.rotationQuaternion) node.rotationQuaternion = null;
  node.rotation.set(transform.rotation[0], transform.rotation[1], transform.rotation[2]);
  node.scaling.set(transform.scaling[0], transform.scaling[1], transform.scaling[2]);
}

export function readTransform(node: TransformNode): Transform {
  const rotation = node.rotationQuaternion
    ? node.rotationQuaternion.toEulerAngles()
    : node.rotation;
  return {
    position: [node.position.x, node.position.y, node.position.z],
    rotation: [rotation.x, rotation.y, rotation.z],
    scaling: [node.scaling.x, node.scaling.y, node.scaling.z],
  };
}
