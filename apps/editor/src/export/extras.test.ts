import { describe, expect, it } from "vite-plus/test";
import { createDefaultDocument, parseEditorDocument } from "../store/document";
import { createId } from "../store/ids";
import type { EditorDocument } from "../store/types";
import { buildNodeExtras, buildSceneExtras, documentFromExtras, parseSceneExtras } from "./extras";
import { exportNameMap } from "./names";
import { readGlbJson, sceneExtrasFromGltf } from "./glb";

function sample(): EditorDocument {
  const document = createDefaultDocument();
  document.scene.fog = {
    mode: "exp",
    color: [0.1, 0.05, 0.08],
    density: 0.045,
    start: 2,
    end: 30,
  };
  document.scene.physics = { enabled: true, gravity: [0, -3.5, 0] };
  document.scene.postProcesses = {
    bloom: { enabled: true, threshold: 0.7, weight: 0.2, kernel: 48, scale: 0.5 },
    fxaa: { enabled: true },
    imageProcessing: { enabled: true, exposure: 0.9, contrast: 1.2 },
    vignette: { enabled: true, weight: 2.2, color: [0.05, 0, 0] },
    chromaticAberration: { enabled: true, aberrationAmount: 12 },
    grain: { enabled: true, intensity: 18, animated: true },
  };
  const mesh = document.nodes.find((node) => node.type === "mesh" && node.mesh.kind === "box");
  if (mesh?.type === "mesh") {
    mesh.mesh.physics = { enabled: true, shape: "box", mass: 2 };
  }
  document.particles.push({
    id: createId(),
    name: "Dust",
    emitterNodeId: mesh?.id ?? null,
    position: [0, 1, 0],
    textureAssetId: null,
    emitRate: 12,
    color: [0.8, 0.7, 0.6, 1],
    colorDead: [0, 0, 0, 0],
    minSize: 0.05,
    maxSize: 0.2,
    minLifeTime: 0.4,
    maxLifeTime: 1.2,
    direction1: [0, 1, 0],
    direction2: [0.2, 1, 0],
    emitPower: 0.4,
    playing: true,
  });
  return parseEditorDocument(document);
}

describe("scene extras", () => {
  it("round-trips fog, post, particles, and physics through JSON", () => {
    const document = sample();
    const extras = buildSceneExtras(document);
    const parsed = parseSceneExtras(JSON.parse(JSON.stringify(extras)));
    expect(parsed.version).toBe(1);
    expect(parsed.generator).toBe("5pla-editor");
    expect(documentFromExtras(parsed)).toEqual(document);
    expect(parsed.document.scene.fog.mode).toBe("exp");
    expect(parsed.document.scene.postProcesses?.grain.intensity).toBe(18);
    expect(parsed.document.scene.physics.gravity).toEqual([0, -3.5, 0]);
    expect(parsed.document.particles[0]?.name).toBe("Dust");
  });

  it("puts physics on the node extras", () => {
    const document = sample();
    const mesh = document.nodes.find((node) => node.type === "mesh" && node.mesh.physics);
    expect(mesh).toBeTruthy();
    if (!mesh) return;
    const names = exportNameMap(document.nodes);
    const extras = buildNodeExtras(mesh, names.get(mesh.id) ?? mesh.name);
    expect(extras.physics).toEqual({ enabled: true, shape: "box", mass: 2 });
    expect(extras.exportName.length).toBeGreaterThan(0);
  });

  it("rejects an unknown extras version", () => {
    expect(() => parseSceneExtras({ version: 99, document: {} })).toThrow(/extras/i);
  });

  it("reads scene extras back out of a GLB json chunk", () => {
    const document = sample();
    const gltf = {
      scenes: [{ extras: { "5pla": buildSceneExtras(document) } }],
      nodes: [{ name: "Box" }, { name: "__editorGrid" }],
    };
    const json = JSON.stringify(gltf);
    const padded = json + " ".repeat((4 - (json.length % 4)) % 4);
    const jsonBytes = new TextEncoder().encode(padded);
    const header = new Uint8Array(20 + jsonBytes.length);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x46546c67, true);
    view.setUint32(4, 2, true);
    view.setUint32(8, header.byteLength, true);
    view.setUint32(12, jsonBytes.length, true);
    view.setUint32(16, 0x4e4f534a, true);
    header.set(jsonBytes, 20);
    expect(readGlbJson(header)).toEqual(gltf);
    expect(sceneExtrasFromGltf(readGlbJson(header))?.document.scene.fog.density).toBe(0.045);
  });
});
