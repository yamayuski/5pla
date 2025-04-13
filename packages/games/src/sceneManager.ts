import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import type { Scene } from "@babylonjs/core/scene";
import { TopScene } from "./topScene";

export class SceneManager {
  private activeScene: Scene | null = null;
  public constructor(public readonly engine: AbstractEngine) {}

  public async startTop() {
    const scene = new TopScene(this);
    await scene.init();
    this.activeScene = scene.getOriginalScene();
  }

  public render() {
    if (this.activeScene) {
      this.activeScene.render();
    }
  }
}
