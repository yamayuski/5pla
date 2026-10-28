import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { startHorrorGame } from "@5pla/horror-kit/game";
import { config } from "./config";
import { buildLevel } from "./level";

/** ?horror=hide-and-seek で起動 */
export function start(engine: AbstractEngine, canvas: HTMLCanvasElement) {
  return startHorrorGame(engine, canvas, config, buildLevel);
}
