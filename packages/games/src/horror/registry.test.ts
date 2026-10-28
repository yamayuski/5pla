import { expect, it } from "vite-plus/test";
import { config as camp } from "./camp-tent/config";
import { config as lastTrain } from "./last-train/config";
import { config as nightShift } from "./night-shift/config";
import { listHorrorEntries, listHorrorSlugs } from "./registry";

it("index.ts があるシーンを自動で列挙する", async () => {
  const slugs = listHorrorSlugs();
  expect(slugs).toContain("after-festival");
  expect(slugs).toContain("ryokan-loop");
  expect(slugs).toContain("camp-tent");
  expect(slugs).toContain("hide-and-seek");
  expect(new Set(slugs).size).toBe(slugs.length);

  const entries = await listHorrorEntries();
  expect(entries.map((entry) => entry.slug)).toEqual(
    [...slugs].sort((a, b) => a.localeCompare(b, "en")),
  );
  expect(entries.find((entry) => entry.slug === "camp-tent")?.title).toBe(
    "消えた焚き火",
  );
  expect(entries.every((entry) => entry.title.length > 0)).toBe(true);
});

it("last-train だけ視線中心を目の高さに固定する", () => {
  expect(lastTrain.lookNodeCenter).toBe("eye");
  expect(camp.lookNodeCenter).toBeUndefined();
  expect(nightShift.lookNodeCenter).toBeUndefined();
});
