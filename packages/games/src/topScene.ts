import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import type { SceneManager } from "./sceneManager";
import { createLogo } from "./top/logo";

export class TopScene {
  private originalScene: Scene;
  public constructor(public readonly sceneManager: SceneManager) {
    this.originalScene = new Scene(this.sceneManager.engine);
    this.originalScene.clearColor = Color4.FromHexString("#F1F1F1");
    const light = new DirectionalLight(
      "light1",
      new Vector3(0.1, 0, -1),
      this.originalScene,
    );
    light.position = new Vector3(2, 0, -10);
    const camera = new ArcRotateCamera(
      "camera1",
      Math.PI / 2,
      Math.PI / 2,
      100,
      Vector3.Zero(),
      this.originalScene,
    );
    camera.attachControl(true);
    camera.setTarget(new Vector3(0, 0, 0));
  }

  public async init() {
    createLogo(this.originalScene);
  }

  public getOriginalScene(): Scene {
    return this.originalScene;
  }
}
