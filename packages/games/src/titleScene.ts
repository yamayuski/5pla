import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { Scene } from "@babylonjs/core/scene";
import type { SceneManager } from "./sceneManager";
import { createLogo } from "./title/createLogo";
import { createSky } from "./title/createSky";

export class TitleScene {
  private originalScene: Scene;
  private camera: ArcRotateCamera;

  public constructor(public readonly sceneManager: SceneManager) {
    this.originalScene = new Scene(this.sceneManager.engine);
    this.originalScene.clearColor = Color4.FromHexString("#F1F1F1");
    const light = new DirectionalLight(
      "light1",
      new Vector3(0.1, 0, -1),
      this.originalScene,
    );
    const light2 = new DirectionalLight(
      "light2",
      new Vector3(-0.1, 0, 1),
      this.originalScene,
    );
    light2.intensity = 0.1;
    light.position = new Vector3(2, 0, -10);
    const camera = new ArcRotateCamera(
      "camera1",
      Math.PI / 2,
      Math.PI / 2,
      10,
      Vector3.Zero(),
      this.originalScene,
    );
    camera.attachControl(true);
    camera.setTarget(new Vector3(0, 0, 0));
    this.camera = camera;
  }

  public async init() {
    const logo = createLogo(this.originalScene);
    this.originalScene.onBeforeRenderObservable.add(() => {
      logo.rotation.y += this.originalScene.getEngine().getDeltaTime() / 500;
    });
    createSky(this.originalScene);
    const pipeline = new DefaultRenderingPipeline(
      "pipeline",
      true,
      this.originalScene,
      [this.camera],
    );
    pipeline.samples = 4;
    pipeline.fxaaEnabled = true;
    pipeline.bloomEnabled = true;
    pipeline.imageProcessingEnabled = true;
    // pipeline.grainEnabled = true;
  }

  public getOriginalScene(): Scene {
    return this.originalScene;
  }
}
