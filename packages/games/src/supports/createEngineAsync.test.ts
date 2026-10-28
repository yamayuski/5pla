import { Engine } from "@babylonjs/core/Engines/engine";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
import { expect, it } from "vite-plus/test";
import "./createEngineAsync";

it("WebGL と WebGPU の両方に createDynamicTexture がある", () => {
  expect(typeof Engine.prototype.createDynamicTexture).toBe("function");
  expect(typeof WebGPUEngine.prototype.createDynamicTexture).toBe("function");
});
