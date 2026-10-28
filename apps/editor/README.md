# 5pla scene editor / シーンエディタ

ブラウザで Babylon.js のシーンを置いて、`.glb` と JSON で書き出す。ゲーム本体とは別アプリ。

Place a Babylon.js scene in the browser and export `.glb` plus JSON. This app is separate from the games.

## 起動 / Run

Node.js 24（`.nvmrc` / `.node-version`）。パッケージマネージャは pnpm。ワークスペースのコマンドは Vite+ の `vp`。

Node.js 24 (`.nvmrc` / `.node-version`). The package manager is pnpm. Workspace commands go through the Vite+ `vp` CLI.

```sh
pnpm install
vp -C apps/editor dev
```

http://localhost:5174

```sh
vp -C apps/editor test
vp -C apps/editor build
```

リポジトリ直下の `pnpm test` / `pnpm build` は `vp run -r` で各パッケージのスクリプトを回す。

From the repo root, `pnpm test` and `pnpm build` run each package script with `vp run -r`.

## 画面 / Layout

- 中央: ビューポート。クリックで選択。W 移動、E 回転、R 拡大縮小。グリッドと軸はエディタ専用。
- 左: 階層。ドラッグで親子。
- 右: 選択中の数値、マテリアル、ライト、カメラ、物理、フォグ、ポストプロセス、パーティクル。
- 上: New / Open / Save（`scene.5pla.json`）、Export GLB、Import GLB、Undo / Redo、Snap。

Center is the viewport: click to select, W move, E rotate, R scale. The grid and axes are editor-only. The left side is the hierarchy (drag to parent). The right side edits the selection, materials, lights, cameras, physics, fog, post-processes, and particles. The toolbar saves `scene.5pla.json`, exports GLB, imports GLB, and undo/redo/snap.

操作カメラはシーンのカメラとは別。シーンカメラの Active と Preview は再生用。

The orbit camera you fly with is not a scene camera. Active and Preview apply to the scene cameras.

## 書き出し / Export

`GLTF2Export` はメッシュ、PBR、対応するライトとカメラ、親子を glTF に書く。フォグ、`DefaultRenderingPipeline`、パーティクル、Havok、半球光、ArcRotate の軌道は `scene.extras["5pla"].document` にエディタ文書ごと入る。ノードの `extras["5pla"]` は id、物理、マテリアル id。グリッド、軸、ギズモ、操作カメラは書き出さない。

`GLTF2Export` writes meshes, PBR, supported lights and cameras, and parents. Fog, `DefaultRenderingPipeline`, particles, Havok, hemispheric lights, and ArcRotate orbit values live in `scene.extras["5pla"].document`. Each node `extras["5pla"]` holds the id, physics, and material id. Grid, axes, gizmos, and the editor camera are omitted.

## ゲームから読む / Load in a game

```ts
import { loadGlbWithExtras } from "@5pla/editor/runtime/applySceneExtras";

const bytes = new Uint8Array(await file.arrayBuffer());
const document = await loadGlbWithExtras(scene, bytes);
```

`loadGlbWithExtras` は GLB をシーンに追加し、extras にあれば clearColor、フォグ、落ちたライトとカメラ、パーティクル、物理、ポストプロセスを戻す。メッシュの座標は glTF 側を上書きしない。文書だけ欲しいときは `readExtras`。

`loadGlbWithExtras` appends the GLB, then restores clearColor, fog, lights and cameras glTF dropped, particles, physics, and post-processes when extras are present. It does not overwrite mesh transforms. `readExtras` returns the document only.

物理を張らない、ポストプロセスを掛けないときは `{ physics: false, postProcesses: false }`。
