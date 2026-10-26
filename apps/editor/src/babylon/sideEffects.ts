/**
 * tree-shaking ビルドでもシーンコンポーネントと glTF ローダを残す。
 * ゲーム本体と同じく、副作用 import はまとめて一度だけ読む。
 */
import "@babylonjs/core/Culling/ray";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Materials/PBR/pbrMaterial";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Physics/v2/physicsEngineComponent";
import "@babylonjs/loaders/glTF/2.0";
import "@babylonjs/loaders/glTF/2.0/Extensions/ExtrasAsMetadata";
