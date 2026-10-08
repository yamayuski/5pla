/**
 * DOM で重ねる最小限の HUD（タイトル、字幕、目的、調べる表示、フラッシュ、暗転、エンディング）。
 * @babylonjs/gui に依存しないよう素の DOM で作る。
 */
export class HorrorHud {
  private readonly root: HTMLDivElement;
  private readonly subtitle: HTMLDivElement;
  private readonly objective: HTMLDivElement;
  private readonly prompt: HTMLDivElement;
  private readonly flash: HTMLDivElement;
  private readonly fade: HTMLDivElement;
  private readonly screen: HTMLDivElement;
  private subtitleTimer: number | null = null;

  public constructor() {
    this.root = this.div(
      "position:fixed;inset:0;pointer-events:none;z-index:10;font-family:'Hiragino Mincho ProN','Yu Mincho',serif;color:#ddd;",
    );
    document.body.appendChild(this.root);
    const cross = this.div(
      "position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px;border-radius:50%;background:rgba(255,255,255,.35);",
    );
    this.subtitle = this.div(
      "position:absolute;left:0;right:0;bottom:12%;text-align:center;font-size:22px;letter-spacing:.08em;text-shadow:0 0 6px #000,0 0 2px #000;opacity:0;transition:opacity .4s;padding:0 8%;",
    );
    this.objective = this.div(
      "position:absolute;left:24px;top:20px;font-size:15px;opacity:.75;text-shadow:0 0 4px #000;",
    );
    this.prompt = this.div(
      "position:absolute;left:50%;top:56%;transform:translateX(-50%);font-size:15px;padding:4px 10px;border:1px solid rgba(255,255,255,.4);background:rgba(0,0,0,.4);display:none;",
    );
    this.flash = this.div(
      "position:absolute;inset:0;background:#fff;opacity:0;",
    );
    this.fade = this.div(
      "position:absolute;inset:0;background:#000;opacity:0;transition:opacity 1.2s;",
    );
    this.screen = this.div(
      "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:rgba(0,0,0,.92);text-align:center;padding:24px;pointer-events:auto;cursor:pointer;",
    );
    this.root.append(
      cross,
      this.subtitle,
      this.objective,
      this.prompt,
      this.flash,
      this.fade,
      this.screen,
    );
  }

  private div(style: string): HTMLDivElement {
    const d = document.createElement("div");
    d.style.cssText = style;
    return d;
  }

  /** タイトル画面を出し、クリックされたら解決する */
  public showTitle(title: string, lines: string[]): Promise<void> {
    this.screen.replaceChildren();
    const h = this.div("font-size:42px;letter-spacing:.3em;color:#e8e2d0;");
    h.textContent = title;
    this.screen.appendChild(h);
    for (const line of lines) {
      const p = this.div("font-size:16px;opacity:.8;max-width:640px;");
      p.textContent = line;
      this.screen.appendChild(p);
    }
    const help = this.div(
      "margin-top:24px;font-size:13px;opacity:.6;font-family:sans-serif;",
    );
    help.textContent =
      "WASD/矢印: 移動　マウス: 視点　E/クリック: 調べる・開ける　F: 懐中電灯　ヘッドホン推奨";
    const start = this.div(
      "margin-top:12px;font-size:18px;border:1px solid #888;padding:8px 28px;",
    );
    start.textContent = "クリックではじめる";
    this.screen.append(help, start);
    this.screen.style.display = "flex";
    return new Promise((resolve) => {
      this.screen.addEventListener(
        "click",
        () => {
          this.screen.style.display = "none";
          resolve();
        },
        { once: true },
      );
    });
  }

  public showPaused(visible: boolean): void {
    if (this.screen.dataset.ended === "1") {
      return;
    }
    if (visible) {
      this.screen.replaceChildren();
      const p = this.div("font-size:18px;");
      p.textContent = "クリックで再開";
      this.screen.appendChild(p);
      this.screen.style.display = "flex";
    } else {
      this.screen.style.display = "none";
    }
  }

  public onScreenClick(cb: () => void): void {
    this.screen.addEventListener("click", cb);
  }

  public showEnding(title: string, text: string): void {
    this.screen.dataset.ended = "1";
    this.screen.replaceChildren();
    const h = this.div(
      "font-size:34px;letter-spacing:.25em;color:#b33;opacity:0;transition:opacity 2s;",
    );
    h.textContent = title;
    const p = this.div(
      "font-size:16px;max-width:640px;opacity:0;transition:opacity 2s 1s;line-height:1.9;white-space:pre-line;",
    );
    p.textContent = text;
    const again = this.div(
      "margin-top:24px;font-size:15px;border:1px solid #666;padding:6px 22px;opacity:0;transition:opacity 1s 3s;",
    );
    again.textContent = "もう一度";
    again.addEventListener("click", () => window.location.reload());
    this.screen.append(h, p, again);
    this.screen.style.background = "#000";
    this.screen.style.cursor = "default";
    this.screen.style.display = "flex";
    requestAnimationFrame(() => {
      h.style.opacity = "1";
      p.style.opacity = "0.85";
      again.style.opacity = "1";
    });
  }

  public setSubtitle(text: string, seconds = 4): void {
    this.subtitle.textContent = text;
    this.subtitle.style.opacity = "1";
    if (this.subtitleTimer !== null) {
      window.clearTimeout(this.subtitleTimer);
    }
    this.subtitleTimer = window.setTimeout(() => {
      this.subtitle.style.opacity = "0";
    }, seconds * 1000);
  }

  public setObjective(text: string): void {
    this.objective.textContent = text ? `― ${text}` : "";
  }

  public setPrompt(text: string | null): void {
    if (text) {
      this.prompt.textContent = `[E] ${text}`;
      this.prompt.style.display = "block";
    } else {
      this.prompt.style.display = "none";
    }
  }

  /** 画面を一瞬光らせる */
  public flashScreen(color = "#fff", seconds = 0.35): void {
    this.flash.style.transition = "none";
    this.flash.style.background = color;
    this.flash.style.opacity = "1";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.flash.style.transition = `opacity ${seconds}s`;
        this.flash.style.opacity = "0";
      });
    });
  }

  public setBlackout(on: boolean, seconds = 1.2): void {
    this.fade.style.transition = `opacity ${seconds}s`;
    this.fade.style.opacity = on ? "1" : "0";
  }

  public dispose(): void {
    this.root.remove();
  }
}
