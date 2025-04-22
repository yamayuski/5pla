import { SceneManager } from "@5pla/games/sceneManager";
import { createEngineAsync } from "@5pla/games/supports/createEngineAsync";

// Side effects
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/PBR/pbrMaterial";
// import "@babylonjs/loaders/glTF/2.0";

window.addEventListener("load", async () => {
  const root = document.getElementById("root") as HTMLCanvasElement | null;
  if (!root || root.tagName !== "CANVAS") {
    throw new Error("No root or invalid canvas");
  }

  const engine = await createEngineAsync(root);
  window.addEventListener("resize", () => {
    engine.resize();
  });
  const sceneManager = new SceneManager(engine);
  await sceneManager.startTitle();
  engine.runRenderLoop(() => {
    sceneManager.render();
  });
});
