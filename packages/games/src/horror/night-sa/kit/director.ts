import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { HorrorAction, TriggerCondition, TriggerDef } from "./types";

export interface DirectorContext {
  playerPosition(): Vector3;
  isLookingAt(
    target: string,
    maxAngleDeg: number,
    maxDistance: number,
  ): boolean;
  run(action: HorrorAction): void;
}

/**
 * config.ts のトリガー配列を毎フレーム評価し、条件を満たしたら演出を実行する。
 * 演出の中身は知らない（ctx.run に丸投げ）ので、作品ごとの差分はデータだけになる。
 */
export class Director {
  /** トリガー id → 発火した時刻（プレイ開始からの秒） */
  private readonly fired = new Map<string, number>();

  public constructor(
    private readonly triggers: readonly TriggerDef[],
    private readonly ctx: DirectorContext,
  ) {}

  public hasFired(id: string): boolean {
    return this.fired.has(id);
  }

  private isArmed(t: TriggerDef): boolean {
    if (t.once !== false && this.fired.has(t.id)) {
      return false;
    }
    if ((t.unless ?? []).some((u) => this.fired.has(u))) {
      return false;
    }
    if (t.requiresAny && !t.requiresAny.some((r) => this.fired.has(r))) {
      return false;
    }
    return (t.requires ?? []).every((r) => this.fired.has(r));
  }

  public update(elapsed: number): void {
    for (const t of this.triggers) {
      if (t.when.type === "interact" || !this.isArmed(t)) {
        continue;
      }
      if (t.once === false) {
        const last = this.fired.get(t.id);
        if (last !== undefined && elapsed - last < 3) {
          continue;
        }
      }
      if (this.check(t.when, elapsed)) {
        this.fire(t, elapsed);
      }
    }
  }

  /** いま調べられる interact トリガー（視線の先のメッシュ名で絞る） */
  public interactable(
    targetName: string,
    distance: number,
  ): TriggerDef | undefined {
    return this.triggers.find(
      (t) =>
        t.when.type === "interact" &&
        t.when.target === targetName &&
        distance <= (t.when.maxDistance ?? 2.6) &&
        this.isArmed(t),
    );
  }

  public fire(t: TriggerDef, elapsed: number): void {
    this.fired.set(t.id, elapsed);
    for (const a of t.actions) {
      this.ctx.run(a);
    }
  }

  private check(c: TriggerCondition, elapsed: number): boolean {
    switch (c.type) {
      case "time":
        return elapsed >= c.at;
      case "zone": {
        const p = this.ctx.playerPosition();
        const dx = p.x - c.center[0];
        const dz = p.z - c.center[2];
        return dx * dx + dz * dz <= c.radius * c.radius;
      }
      case "look":
        return this.ctx.isLookingAt(
          c.target,
          c.maxAngleDeg ?? 12,
          c.maxDistance ?? 30,
        );
      case "lookAway":
        return !this.ctx.isLookingAt(c.target, c.minAngleDeg ?? 70, 999);
      case "after": {
        const at = this.fired.get(c.trigger);
        return at !== undefined && elapsed - at >= c.delay;
      }
      case "interact":
        return false;
    }
  }
}
