import { listHorrorEntries } from "./registry";

function pageUrl(search: string): string {
  const url = new URL(window.location.href);
  url.search = search;
  url.hash = "";
  return `${url.pathname}${url.search}`;
}

/** 起動中のシーンから一覧へ戻る */
export function showHorrorBackLink(): void {
  const link = document.createElement("a");
  link.href = pageUrl("");
  link.textContent = "一覧";
  link.style.cssText = [
    "position:fixed",
    "top:12px",
    "right:12px",
    "z-index:30",
    "padding:6px 12px",
    "border:1px solid rgba(255,255,255,.45)",
    "background:rgba(0,0,0,.55)",
    "color:#eee",
    "font:14px/1.2 sans-serif",
    "text-decoration:none",
    "pointer-events:auto",
  ].join(";");
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    window.location.assign(link.href);
  });
  document.body.appendChild(link);
}

/** 各ホラーシーンへの入口。新しい作品は horror/<slug>/index.ts を足すだけで並ぶ */
export async function showHorrorLauncher(): Promise<void> {
  const canvas = document.getElementById("root");
  if (canvas instanceof HTMLElement) {
    // index.html の canvas#root { display:block } が hidden 属性より強い
    canvas.style.display = "none";
  }
  document.body.style.overflow = "auto";
  document.body.style.background = "#111";

  const entries = await listHorrorEntries();
  const root = document.createElement("main");
  root.style.cssText =
    "max-width:720px;margin:0 auto;padding:32px 20px 64px;color:#eee;font-family:sans-serif;";

  const heading = document.createElement("h1");
  heading.textContent = "ホラー候補";
  heading.style.cssText = "font-size:28px;font-weight:600;letter-spacing:.08em;";

  const note = document.createElement("p");
  note.textContent = `${entries.length} シーン。クリックで個別に起動する。`;
  note.style.cssText = "margin:8px 0 20px;color:#aaa;font-size:14px;";

  const list = document.createElement("ul");
  list.style.cssText = "list-style:none;padding:0;margin:0;display:grid;gap:8px;";
  for (const entry of entries) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = pageUrl(`?horror=${encodeURIComponent(entry.slug)}`);
    link.style.cssText = [
      "display:flex",
      "justify-content:space-between",
      "gap:16px",
      "padding:12px 14px",
      "border:1px solid #333",
      "background:#1b1b1b",
      "color:#eee",
      "text-decoration:none",
    ].join(";");
    const title = document.createElement("span");
    title.textContent = entry.title;
    const slug = document.createElement("span");
    slug.textContent = entry.slug;
    slug.style.cssText = "color:#888;font-size:13px;";
    link.append(title, slug);
    item.appendChild(link);
    list.appendChild(item);
  }

  const titleLink = document.createElement("a");
  titleLink.href = pageUrl("?title=1");
  titleLink.textContent = "タイトル画面";
  titleLink.style.cssText =
    "display:inline-block;margin-top:24px;color:#bbb;font-size:14px;";

  root.append(heading, note, list, titleLink);
  document.body.appendChild(root);
}
