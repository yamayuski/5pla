import { SceneManager } from "@5pla/games/sceneManager";
import { createEngineAsync } from "@5pla/games/supports/createEngineAsync";

// Side effects
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/PBR/pbrMaterial";
// import "@babylonjs/loaders/glTF/2.0";

window.addEventListener("load", async () => {
  const params = new URLSearchParams(window.location.search);
  const horrorSlug = params.get("horror");
  // クエリなしはホラー候補の一覧。タイトル画面は ?title=1
  if (!horrorSlug && !params.has("title")) {
    const { showHorrorLauncher } = await import("@5pla/games/horror/launcher");
    await showHorrorLauncher();
    return;
  }

  const root = document.getElementById("root") as HTMLCanvasElement | null;
  if (!root || root.tagName !== "CANVAS") {
    throw new Error("No root or invalid canvas");
  }

  const engine = await createEngineAsync(root);
  window.addEventListener("resize", () => {
    engine.resize();
  });
  if (horrorSlug) {
    const { startHorror } = await import("@5pla/games/horror/registry");
    const { showHorrorBackLink } = await import("@5pla/games/horror/launcher");
    const horror = await startHorror(engine, root, horrorSlug);
    if (horror) {
      showHorrorBackLink();
      engine.runRenderLoop(() => {
        horror.render();
      });
      return;
    }
  }
  const sceneManager = new SceneManager(engine);
  await sceneManager.startTitle();
  engine.runRenderLoop(() => {
    sceneManager.render();
  });
});
