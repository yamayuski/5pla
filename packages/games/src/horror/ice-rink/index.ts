import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { config } from "./config";
import { startHorrorGame } from "./kit/game";
import { buildLevel } from "./level";

/** ?horror=ice-rink で起動 */
export function start(engine: AbstractEngine, canvas: HTMLCanvasElement) {
  return startHorrorGame(engine, canvas, config, buildLevel);
}
