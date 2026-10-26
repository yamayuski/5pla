import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { config } from "./config";
import { startHorrorGame } from "./kit/game";
import { buildLevel } from "./level";

/** ?horror=bowling-alley で起動 */
export function start(engine: AbstractEngine, canvas: HTMLCanvasElement) {
  return startHorrorGame(engine, canvas, config, buildLevel);
}
