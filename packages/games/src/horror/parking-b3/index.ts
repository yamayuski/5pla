import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { config } from "./config";
import { startHorrorGame } from "@5pla/horror-kit/game";
import { buildLevel } from "./level";

/** ?horror=parking-b3 で起動 */
export function start(engine: AbstractEngine, canvas: HTMLCanvasElement) {
  return startHorrorGame(engine, canvas, config, buildLevel);
}
