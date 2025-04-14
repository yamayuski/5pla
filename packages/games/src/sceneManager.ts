import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import type { Scene } from "@babylonjs/core/scene";
import { TitleScene } from "./titleScene";

export class SceneManager {
  private activeScene: Scene | null = null;
  public constructor(public readonly engine: AbstractEngine) {}

  public async startTitle() {
    const scene = new TitleScene(this);
    await scene.init();
    this.activeScene = scene.getOriginalScene();
  }

  public render() {
    if (this.activeScene) {
      this.activeScene.render();
    }
  }
}
