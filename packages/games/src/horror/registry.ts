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

export interface HorrorEntry {
  slug: string;
  title: string;
}

const configModules = import.meta.glob<{
  config: { title: string };
}>("./*/config.ts");

/** index.ts と config.ts が揃った作品を、slug 順で返す */
export async function listHorrorEntries(): Promise<HorrorEntry[]> {
  const startable = new Set(listHorrorSlugs());
  const loaded = await Promise.all(
    Object.entries(configModules).map(async ([key, load]) => {
      const slug = key.split("/")[1] ?? "";
      if (!startable.has(slug)) {
        return null;
      }
      const { config } = await load();
      return { slug, title: config.title || slug };
    }),
  );
  return loaded
    .filter((entry): entry is HorrorEntry => entry !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug, "en"));
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
