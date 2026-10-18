import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";

/**
 * ホラー候補の起動口。apps/web から `?horror=<slug>` で呼ばれる。
 * 各作品は packages/games/src/horror/<slug>/index.ts で `start` を export するだけで
 * ここに自動登録される（import.meta.glob）ので、作品を足してもこのファイルは変わらない。
 */
export interface HorrorHandle {
  render(): void;
}

interface HorrorModule {
  start(
    engine: AbstractEngine,
    canvas: HTMLCanvasElement,
  ): Promise<HorrorHandle>;
}

const modules = import.meta.glob<HorrorModule>("./*/index.ts");

export function listHorrorSlugs(): string[] {
  return Object.keys(modules).map((k) => k.split("/")[1] ?? k);
}

export async function startHorror(
  engine: AbstractEngine,
  canvas: HTMLCanvasElement,
  slug: string,
): Promise<HorrorHandle | null> {
  const load = modules[`./${slug}/index.ts`];
  if (!load) {
    console.warn(`horror "${slug}" not found`, listHorrorSlugs());
    return null;
  }
  const mod = await load();
  return mod.start(engine, canvas);
}
