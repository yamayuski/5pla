import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Scene } from "@babylonjs/core/scene";
import { describe, expect, it } from "vite-plus/test";
import { applySceneExtras } from "../runtime/applySceneExtras";
import { createDefaultDocument } from "../store/document";
import { exportDocumentGlb } from "./exportGlb";
import { gltfNodeNames, readGlbJson, readSceneExtrasFromGlb } from "./glb";
import { buildSceneExtras } from "./extras";
import "../babylon/sideEffects";

describe("glb extras round trip", () => {
  it("exports a glb whose scene extras reload fog onto a scene", async () => {
    const document = createDefaultDocument();
    document.scene.clearColor = [0.2, 0.04, 0.05, 1];
    document.scene.fog = {
      mode: "exp2",
      color: [0.2, 0.04, 0.05],
      density: 0.08,
      start: 1,
      end: 12,
    };
    document.scene.physics = { enabled: true, gravity: [0, -2, 0] };
    const box = document.nodes.find((node) => node.type === "mesh" && node.mesh.kind === "box");
    if (box?.type === "mesh") {
      box.mesh.physics = { enabled: true, shape: "sphere", mass: 3 };
    }

    const bytes = await exportDocumentGlb(document);
    const gltf = readGlbJson(bytes);
    const names = gltfNodeNames(gltf);
    expect(names.some((name) => name.includes("__editor"))).toBe(false);
    expect(names).toContain("Box");
    expect(names).toContain("Ground");

    const extras = readSceneExtrasFromGlb(bytes);
    expect(extras?.document.scene.fog).toEqual(document.scene.fog);
    expect(extras?.document.scene.physics.gravity).toEqual([0, -2, 0]);
    expect(buildSceneExtras(document).document.scene.clearColor).toEqual(
      extras?.document.scene.clearColor,
    );

    const engine = new NullEngine();
    const scene = new Scene(engine);
    try {
      await applySceneExtras(scene, extras?.document ?? document, {
        physics: false,
        postProcesses: false,
        particles: false,
      });
      expect(scene.fogMode).toBe(Scene.FOGMODE_EXP2);
      expect(scene.fogDensity).toBeCloseTo(0.08);
      expect(scene.clearColor.r).toBeCloseTo(0.2);
      expect(scene.clearColor.g).toBeCloseTo(0.04);
    } finally {
      scene.dispose();
      engine.dispose();
    }
  });
});
