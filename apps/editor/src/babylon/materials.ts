/**
 * 文書のマテリアルを PBR / Standard に反映する。テクスチャは data URL から作る。
 */
import type { Material } from "@babylonjs/core/Materials/material";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Scene } from "@babylonjs/core/scene";
import type { AssetDef, MaterialDef, Vec3 } from "../store/types";

function color(value: Vec3): Color3 {
  return new Color3(value[0], value[1], value[2]);
}

function isPbr(material: Material): material is PBRMaterial {
  return material instanceof PBRMaterial;
}

export class MaterialLibrary {
  private readonly materials = new Map<string, Material>();
  private readonly textures = new Map<string, Texture>();
  readonly fallback: PBRMaterial;

  public constructor(private readonly scene: Scene) {
    this.fallback = new PBRMaterial("__editorFallback", scene);
    this.fallback.albedoColor = new Color3(0.62, 0.62, 0.64);
    this.fallback.metallic = 0;
    this.fallback.roughness = 0.8;
  }

  public sync(defs: readonly MaterialDef[], assets: Record<string, AssetDef>): void {
    const alive = new Set(defs.map((def) => def.id));
    for (const [id, material] of this.materials) {
      if (alive.has(id)) continue;
      material.dispose();
      this.materials.delete(id);
    }
    for (const def of defs) {
      const current = this.materials.get(def.id);
      const matches =
        current &&
        ((def.kind === "pbr" && isPbr(current)) ||
          (def.kind === "standard" && current instanceof StandardMaterial));
      const material = matches ? current : this.replace(def, current);
      this.apply(material, def, assets);
    }
  }

  public get(id: string | null): Material {
    if (!id) return this.fallback;
    return this.materials.get(id) ?? this.fallback;
  }

  public dispose(): void {
    for (const material of this.materials.values()) material.dispose();
    this.materials.clear();
    for (const texture of this.textures.values()) texture.dispose();
    this.textures.clear();
    this.fallback.dispose();
  }

  private replace(def: MaterialDef, current: Material | undefined): Material {
    current?.dispose(false, false);
    const material =
      def.kind === "pbr"
        ? new PBRMaterial(def.name, this.scene)
        : new StandardMaterial(def.name, this.scene);
    this.materials.set(def.id, material);
    return material;
  }

  private texture(assetId: string | null, assets: Record<string, AssetDef>): Texture | null {
    if (!assetId) return null;
    const cached = this.textures.get(assetId);
    if (cached) return cached;
    const asset = assets[assetId];
    if (!asset) return null;
    const texture = new Texture(asset.dataUrl, this.scene, false, true);
    this.textures.set(assetId, texture);
    return texture;
  }

  private apply(material: Material, def: MaterialDef, assets: Record<string, AssetDef>): void {
    material.name = def.name;
    const albedo = this.texture(def.textures.albedo, assets);
    const normal = this.texture(def.textures.normal, assets);
    const emissiveTex = this.texture(def.textures.emissive, assets);
    const metallic = this.texture(def.textures.metallicRoughness, assets);
    if (isPbr(material)) {
      material.albedoColor = color(def.albedoColor);
      material.metallic = def.metallic;
      material.roughness = def.roughness;
      material.emissiveColor = color(def.emissive);
      material.alpha = def.alpha;
      material.transparencyMode =
        def.alpha < 0.999 ? PBRMaterial.PBRMATERIAL_ALPHABLEND : PBRMaterial.PBRMATERIAL_OPAQUE;
      material.albedoTexture = albedo;
      material.bumpTexture = normal;
      material.emissiveTexture = emissiveTex;
      material.metallicTexture = metallic;
      material.useRoughnessFromMetallicTextureAlpha = false;
      material.useMetallnessFromMetallicTextureBlue = true;
      material.useRoughnessFromMetallicTextureGreen = true;
      return;
    }
    if (!(material instanceof StandardMaterial)) return;
    material.diffuseColor = color(def.albedoColor);
    material.specularColor = new Color3(def.metallic, def.metallic, def.metallic);
    material.specularPower = Math.max(1, (1 - def.roughness) * 64);
    material.emissiveColor = color(def.emissive);
    material.alpha = def.alpha;
    material.diffuseTexture = albedo;
    material.bumpTexture = normal;
    material.emissiveTexture = emissiveTex;
    material.specularTexture = metallic;
  }
}
