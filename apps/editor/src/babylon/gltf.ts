/**
 * data URL の glTF を AssetContainer として読み、指定の親の下にインスタンスを作る。
 */
import { LoadAssetContainerAsync } from "@babylonjs/core/Loading/sceneLoader";
import type { AssetContainer } from "@babylonjs/core/assetContainer";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Node } from "@babylonjs/core/node";
import type { Scene } from "@babylonjs/core/scene";
import { assetExtension } from "../store/document";
import type { AssetDef } from "../store/types";
import { tagEditor } from "./metadata";

export class GltfInstances {
  private readonly containers = new Map<string, AssetContainer>();

  public async attach(
    scene: Scene,
    asset: AssetDef,
    root: TransformNode,
    editorId: string | null,
  ): Promise<void> {
    const container = await this.container(scene, asset);
    const entries = container.instantiateModelsToScene(
      (sourceName) => `${root.name}:${sourceName}`,
      false,
    );
    for (const child of entries.rootNodes) {
      child.parent = root;
      if (editorId) this.tagTree(child, editorId);
    }
  }

  public dispose(): void {
    for (const container of this.containers.values()) container.dispose();
    this.containers.clear();
  }

  private async container(scene: Scene, asset: AssetDef): Promise<AssetContainer> {
    const cached = this.containers.get(asset.id);
    if (cached) return cached;
    const container = await LoadAssetContainerAsync(asset.dataUrl, scene, {
      pluginExtension: assetExtension(asset.name),
    });
    this.containers.set(asset.id, container);
    return container;
  }

  private tagTree(node: Node, editorId: string): void {
    tagEditor(node, editorId);
    for (const child of node.getChildren()) this.tagTree(child, editorId);
  }
}
