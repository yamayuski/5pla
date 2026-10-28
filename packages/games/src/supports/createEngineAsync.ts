import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { Engine } from "@babylonjs/core/Engines/engine";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
// DynamicTexture は WebGL 用の createDynamicTexture しか足さない。
// WebGPUEngine は ThinEngine を継承しないので、使っているエンジン側にも足す。
import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import "@babylonjs/core/Engines/WebGPU/Extensions/engine.dynamicTexture";

/**
 * WebGLEngine か WebGPU Engine を初期化します
 */
export async function createEngineAsync(
  canvas: HTMLCanvasElement,
): Promise<AbstractEngine> {
  if (await WebGPUEngine.IsSupportedAsync) {
    const engine = new WebGPUEngine(canvas, {
      adaptToDeviceRatio: true,
      antialias: true,
      audioEngine: true,
    });
    await engine.initAsync();
    return engine;
  }
  const engine = new Engine(
    canvas,
    true,
    {
      adaptToDeviceRatio: true,
      antialias: true,
      audioEngine: true,
    },
    true,
  );
  return engine;
}
