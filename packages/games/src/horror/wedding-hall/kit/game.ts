import "@babylonjs/core/Collisions/collisionCoordinator";
import "@babylonjs/core/Culling/ray";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { Scene } from "@babylonjs/core/scene";
import { HorrorAudio } from "./audio";
import { LevelBuilder, Registry, v3 } from "./builders";
import { Director } from "./director";
import { HorrorHud } from "./hud";
import type { HorrorAction, HorrorConfig, SoundPosition } from "./types";

export interface LevelHooks {
  /** config の { type: "custom", name } から呼ばれる作品固有の演出 */
  custom?: Record<string, (game: HorrorGame) => void>;
  /** 毎フレーム呼ばれる作品固有の更新 */
  update?: (game: HorrorGame, dt: number) => void;
}

export type BuildLevel = (
  b: LevelBuilder,
  game: HorrorGame,
) => LevelHooks | undefined;

interface Tween {
  node: TransformNode;
  from: Vector3;
  to: Vector3;
  t: number;
  duration: number;
}

/**
 * 一人称ホラーの土台。カメラ・懐中電灯・フォグ・音・HUD・トリガー実行をまとめる。
 * 作品ごとの差分は config（トリガーデータ）と buildLevel（マップ）だけ。
 */
export class HorrorGame {
  public readonly scene: Scene;
  public readonly camera: UniversalCamera;
  public readonly flashlight: SpotLight;
  public readonly hud = new HorrorHud();
  public readonly registry = new Registry();
  public audio: HorrorAudio | null = null;
  public elapsed = 0;

  private readonly director: Director;
  private readonly ambient: HemisphericLight;
  private readonly pipeline: DefaultRenderingPipeline;
  private hooks: LevelHooks = {};
  private playing = false;
  private started = false;
  private cinematic = false;
  private ended = false;
  private flashlightOn = true;
  private flashlightForcedOff = false;
  private flashlightDim = false;
  private flickerUntil = 0;
  private shakeUntil = 0;
  private shakeIntensity = 0;
  private shakeOffset = { x: 0, z: 0 };
  private fogTween: { from: number; to: number; t: number; d: number } | null =
    null;
  private tweens: Tween[] = [];
  private timers: { at: number; fn: () => void }[] = [];
  private interactPressed = false;
  private stepDistance = 0;
  private readonly eyeHeight: number;
  private lastPos: Vector3;

  public constructor(
    engine: AbstractEngine,
    private readonly canvas: HTMLCanvasElement,
    public readonly config: HorrorConfig,
    buildLevel: BuildLevel,
  ) {
    const scene = new Scene(engine);
    this.scene = scene;
    const fogColor = Color3.FromArray([...config.fog.color]);
    scene.clearColor = Color4.FromColor3(fogColor, 1);
    scene.fogMode = Scene.FOGMODE_EXP2;
    scene.fogColor = fogColor;
    scene.fogDensity = config.fog.density;
    scene.collisionsEnabled = true;
    scene.ambientColor = new Color3(0.02, 0.02, 0.02);

    this.ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
    this.ambient.intensity = config.ambient.intensity;
    this.ambient.diffuse = Color3.FromArray([...config.ambient.color]);
    this.ambient.groundColor = this.ambient.diffuse.scale(0.3);
    this.ambient.specular = Color3.Black();

    const spawn = v3(config.spawn.position);
    this.eyeHeight = spawn.y;
    const camera = new UniversalCamera("player", spawn.clone(), scene);
    camera.setTarget(v3(config.spawn.lookAt));
    camera.minZ = 0.05;
    camera.maxZ = 200;
    camera.fov = 1.05;
    camera.speed = config.walkSpeed;
    camera.inertia = 0.6;
    camera.angularSensibility = 2200;
    camera.keysUp = [87, 38];
    camera.keysDown = [83, 40];
    camera.keysLeft = [65, 37];
    camera.keysRight = [68, 39];
    camera.keysUpward = [];
    camera.keysDownward = [];
    camera.checkCollisions = true;
    camera.ellipsoid = new Vector3(0.3, 0.7, 0.3);
    camera.attachControl(true);
    this.camera = camera;
    this.lastPos = spawn.clone();

    const fl = config.flashlight;
    this.flashlight = new SpotLight(
      "flashlight",
      new Vector3(0.12, -0.12, 0),
      new Vector3(0, -0.04, 1),
      (fl.angleDeg * Math.PI) / 180,
      6,
      scene,
    );
    this.flashlight.parent = camera;
    this.flashlight.diffuse = Color3.FromArray([...fl.color]);
    this.flashlight.specular = this.flashlight.diffuse.scale(0.4);
    this.flashlight.range = fl.range;
    this.flashlight.intensity = fl.intensity;
    this.flashlightOn = fl.enabled;
    this.flashlight.setEnabled(fl.enabled);

    this.pipeline = new DefaultRenderingPipeline(
      "horror-pipeline",
      true,
      scene,
      [camera],
    );
    this.pipeline.fxaaEnabled = true;
    this.pipeline.grainEnabled = true;
    this.pipeline.grain.intensity = 12;
    this.pipeline.grain.animated = true;
    this.pipeline.imageProcessingEnabled = true;
    this.pipeline.imageProcessing.vignetteEnabled = true;
    this.pipeline.imageProcessing.vignetteWeight = 2.2;
    this.pipeline.imageProcessing.vignetteColor = new Color4(0, 0, 0, 0);
    this.pipeline.chromaticAberrationEnabled = true;
    this.pipeline.chromaticAberration.aberrationAmount = 0;

    const builder = new LevelBuilder(scene, this.registry);
    this.hooks = buildLevel(builder, this) ?? {};

    this.director = new Director(config.triggers, {
      playerPosition: () => this.camera.position,
      isLookingAt: (t, a, d) => this.isLookingAt(t, a, d),
      run: (a) => this.run(a),
    });

    scene.onBeforeRenderObservable.add(() => this.update());
    this.bindInput();
  }

  // ---------- 開始・入力 ----------

  public async start(): Promise<void> {
    await this.hud.showTitle(this.config.title, this.config.intro);
    this.audio = new HorrorAudio();
    await this.audio.resume();
    this.audio.setDrone(this.config.droneLevel, 4);
    this.started = true;
    this.lockPointer();
  }

  private lockPointer(): void {
    void this.canvas.requestPointerLock?.();
  }

  private bindInput(): void {
    document.addEventListener("pointerlockchange", () => {
      const locked = document.pointerLockElement === this.canvas;
      if (!this.started || this.ended) {
        return;
      }
      this.playing = locked || this.cinematic;
      this.hud.showPaused(!locked && !this.cinematic);
    });
    this.hud.onScreenClick(() => {
      if (this.started && !this.ended) {
        this.lockPointer();
      }
    });
    window.addEventListener("keydown", (e) => {
      if (!this.playing || this.cinematic) {
        return;
      }
      if (e.code === "KeyE") {
        this.interactPressed = true;
      } else if (e.code === "KeyF") {
        this.toggleFlashlight();
      }
    });
    this.canvas.addEventListener("pointerdown", () => {
      if (this.playing && !this.cinematic) {
        this.interactPressed = true;
      } else if (this.started && !this.ended) {
        this.lockPointer();
      }
    });
  }

  private toggleFlashlight(): void {
    if (this.flashlightForcedOff) {
      this.audio?.play("rattle", null, 0.3);
      this.hud.setSubtitle("……つかない。", 2);
      return;
    }
    this.flashlightOn = !this.flashlightOn;
    this.flashlight.setEnabled(this.flashlightOn);
    this.audio?.play("drip", null, 0.3);
  }

  public render(): void {
    this.scene.render();
  }

  /** 秒数後に関数を呼ぶ（一時停止中は進まない） */
  public later(seconds: number, fn: () => void): void {
    this.timers.push({ at: this.elapsed + seconds, fn });
  }

  public node(name: string): TransformNode | undefined {
    return this.registry.nodes.get(name);
  }

  public forward(): Vector3 {
    const f = this.camera.getDirection(Vector3.Forward());
    f.y = 0;
    return f.normalize();
  }

  // ---------- 毎フレーム ----------

  private update(): void {
    const dt = Math.min(0.1, this.scene.getEngine().getDeltaTime() / 1000);
    this.camera.position.y = this.eyeHeight;
    if (!this.playing) {
      return;
    }
    this.elapsed += dt;

    const due = this.timers.filter((t) => t.at <= this.elapsed);
    this.timers = this.timers.filter((t) => t.at > this.elapsed);
    for (const t of due) {
      t.fn();
    }

    for (const door of this.registry.doors.values()) {
      if (door.amount !== door.target) {
        const step = door.speed * dt;
        door.amount =
          door.amount < door.target
            ? Math.min(door.target, door.amount + step)
            : Math.max(door.target, door.amount - step);
      }
      door.pivot.rotation.y = door.baseRotY - door.amount * door.swing;
    }

    this.tweens = this.tweens.filter((tw) => {
      tw.t = Math.min(1, tw.t + dt / tw.duration);
      const e = tw.t * tw.t * (3 - 2 * tw.t);
      tw.node.position = Vector3.Lerp(tw.from, tw.to, e);
      return tw.t < 1;
    });

    if (this.fogTween) {
      const f = this.fogTween;
      f.t = Math.min(1, f.t + dt / f.d);
      this.scene.fogDensity = f.from + (f.to - f.from) * f.t;
      if (f.t >= 1) {
        this.fogTween = null;
      }
    }

    this.updateLights();
    this.updateShake();
    this.updateSteps();

    if (this.audio) {
      const up = this.camera.getDirection(Vector3.Up());
      this.audio.updateListener(
        this.camera.position,
        this.camera.getDirection(Vector3.Forward()),
        up,
      );
    }

    if (!this.cinematic) {
      this.updateInteract();
    }
    this.director.update(this.elapsed);
    this.hooks.update?.(this, dt);
  }

  private updateLights(): void {
    const flicker = this.elapsed < this.flickerUntil;
    const base =
      this.config.flashlight.intensity * (this.flashlightDim ? 0.25 : 1);
    const sway = Math.sin(this.elapsed * 1.7) * 0.015;
    this.flashlight.direction.set(sway, -0.04 + sway * 0.5, 1);
    if (flicker) {
      const on = Math.random() > 0.45;
      this.flashlight.intensity = on ? base * Math.random() : 0;
    } else {
      this.flashlight.intensity = base;
    }
    for (const lamps of this.registry.lampGroups.values()) {
      for (const lamp of lamps) {
        if (!lamp.light.isEnabled()) {
          continue;
        }
        const k = flicker ? (Math.random() > 0.5 ? 1 : 0.05) : 1;
        lamp.light.intensity = lamp.baseIntensity * k;
        if (lamp.bulb) {
          lamp.bulb.emissiveColor = lamp.color.scale(k);
        }
      }
    }
  }

  private updateShake(): void {
    this.camera.rotation.x -= this.shakeOffset.x;
    this.camera.rotation.z -= this.shakeOffset.z;
    this.shakeOffset = { x: 0, z: 0 };
    if (this.elapsed < this.shakeUntil) {
      const i = this.shakeIntensity;
      this.shakeOffset = {
        x: (Math.random() - 0.5) * i,
        z: (Math.random() - 0.5) * i,
      };
      this.camera.rotation.x += this.shakeOffset.x;
      this.camera.rotation.z += this.shakeOffset.z;
    }
  }

  private updateSteps(): void {
    const p = this.camera.position;
    const d = Math.hypot(p.x - this.lastPos.x, p.z - this.lastPos.z);
    this.lastPos = p.clone();
    this.stepDistance += d;
    if (this.stepDistance > 0.85) {
      this.stepDistance = 0;
      this.audio?.play("step", null, 0.6);
    }
  }

  private pickCenter(maxDistance: number) {
    const ray = this.camera.getForwardRay(maxDistance);
    return this.scene.pickWithRay(
      ray,
      (m) => m.isPickable && m.isEnabled() && m.isVisible,
    );
  }

  private registeredName(mesh: AbstractMesh | null): string | null {
    let n: TransformNode | null = mesh;
    while (n) {
      if (this.registry.nodes.get(n.name) === n) {
        return n.name;
      }
      n = n.parent as TransformNode | null;
    }
    return null;
  }

  private updateInteract(): void {
    const pick = this.pickCenter(3);
    const name = pick?.hit ? this.registeredName(pick.pickedMesh) : null;
    const dist = pick?.distance ?? 99;
    let label: string | null = null;
    let action: (() => void) | null = null;
    if (name) {
      const trig = this.director.interactable(name, dist);
      const door = this.registry.doors.get(name);
      if (trig && trig.when.type === "interact") {
        label = trig.when.label ?? "調べる";
        action = () => this.director.fire(trig, this.elapsed);
      } else if (door?.interactive && dist < 2.4) {
        label = door.target > 0.5 ? "閉める" : "開ける";
        action = () => {
          if (door.locked) {
            this.audio?.play("rattle", door.panel.getAbsolutePosition(), 0.8);
            this.hud.setSubtitle("鍵がかかっている。", 2);
            return;
          }
          door.speed = 1.2;
          door.target = door.target > 0.5 ? 0 : 1;
          this.audio?.play("creak", door.panel.getAbsolutePosition(), 0.5);
        };
      }
    }
    this.hud.setPrompt(label);
    if (this.interactPressed && action) {
      action();
    }
    this.interactPressed = false;
  }

  private isLookingAt(
    target: string,
    maxAngleDeg: number,
    maxDistance: number,
  ): boolean {
    const node = this.node(target);
    if (!node || !node.isEnabled()) {
      return false;
    }
    let center: Vector3;
    if (node instanceof AbstractMesh) {
      center = node.getBoundingInfo().boundingSphere.centerWorld;
    } else {
      const { min, max } = node.getHierarchyBoundingVectors();
      center = min.add(max).scale(0.5);
    }
    const to = center.subtract(this.camera.position);
    const dist = to.length();
    if (dist > maxDistance) {
      return false;
    }
    const fwd = this.camera.getDirection(Vector3.Forward());
    const angle = Math.acos(
      Math.min(1, Math.max(-1, Vector3.Dot(fwd, to.normalize()))),
    );
    if ((angle * 180) / Math.PI > maxAngleDeg) {
      return false;
    }
    // 壁越しは見えていないことにする
    const pick = this.pickCenter(dist);
    if (pick?.hit && pick.distance < dist - 0.6) {
      return this.registeredName(pick.pickedMesh) === target;
    }
    return true;
  }

  // ---------- 演出 ----------

  private soundPos(at: SoundPosition | undefined): Vector3 | null {
    if (at === undefined || at === "player") {
      return null;
    }
    if (at === "behind") {
      return this.camera.position.subtract(this.forward().scale(2.2));
    }
    if ("node" in at) {
      return this.node(at.node)?.getAbsolutePosition() ?? null;
    }
    return v3(at);
  }

  public run(a: HorrorAction): void {
    switch (a.type) {
      case "sound":
        this.audio?.play(a.sound, this.soundPos(a.at), a.volume ?? 1);
        break;
      case "subtitle":
        this.hud.setSubtitle(a.text, a.duration ?? 4);
        break;
      case "objective":
        this.hud.setObjective(a.text);
        break;
      case "flicker":
        this.flickerUntil = this.elapsed + a.duration;
        this.audio?.play("buzz", null, 0.4);
        break;
      case "flashlight":
        this.flashlightForcedOff = a.state === "off";
        this.flashlightDim = a.state === "dim";
        this.flashlightOn = a.state !== "off";
        this.flashlight.setEnabled(this.flashlightOn);
        break;
      case "lights":
        for (const lamp of this.registry.lampGroups.get(a.group) ?? []) {
          lamp.light.setEnabled(a.on);
          if (lamp.bulb) {
            lamp.bulb.emissiveColor = a.on ? lamp.color : Color3.Black();
          }
        }
        break;
      case "door": {
        const door = this.registry.doors.get(a.door);
        if (!door) {
          break;
        }
        if (a.state === "open") {
          door.speed = 0.8;
          door.target = 1;
          this.audio?.play("creak", door.panel.getAbsolutePosition(), 0.7);
        } else if (a.state === "close") {
          door.speed = 0.8;
          door.target = 0;
        } else if (a.state === "slam") {
          door.speed = 8;
          door.target = 0;
          door.locked = true;
          this.audio?.play("slam", door.panel.getAbsolutePosition(), 1);
        } else {
          door.locked = a.state === "lock";
        }
        break;
      }
      case "visible":
        this.node(a.target)?.setEnabled(a.visible);
        break;
      case "move": {
        const node = this.node(a.target);
        if (node) {
          this.tweens.push({
            node,
            from: node.position.clone(),
            to: v3(a.to),
            t: 0,
            duration: Math.max(0.01, a.duration),
          });
        }
        break;
      }
      case "face": {
        const node = this.node(a.target);
        if (node) {
          const p = this.camera.position;
          node.lookAt(new Vector3(p.x, node.getAbsolutePosition().y, p.z));
        }
        break;
      }
      case "fog":
        this.fogTween = {
          from: this.scene.fogDensity,
          to: a.density,
          t: 0,
          d: Math.max(0.01, a.duration),
        };
        break;
      case "drone":
        this.audio?.setDrone(a.level, 1.5);
        break;
      case "heartbeat":
        this.audio?.setHeartbeat(a.bpm);
        break;
      case "shake":
        this.shakeIntensity = a.intensity;
        this.shakeUntil = this.elapsed + a.duration;
        break;
      case "custom":
        this.hooks.custom?.[a.name]?.(this);
        break;
      case "jumpscare":
        this.jumpscare(a.figure);
        break;
      case "end":
        this.end(a.title, a.text);
        break;
    }
  }

  /** 最後の一発。人影を目の前に出し、光と爆音と揺れで締める */
  private jumpscare(figureName: string): void {
    const fig = this.node(figureName);
    if (!fig) {
      return;
    }
    this.cinematic = true;
    this.hud.setPrompt(null);
    this.camera.detachControl();
    this.camera.rotation.x = 0;
    const fwd = this.forward();
    const eye = this.camera.position;
    const s = fig.scaling.y;
    const y = eye.y - 1.49 * s;
    const far = eye.add(fwd.scale(1.6));
    const near = eye.add(fwd.scale(0.5));
    fig.position = new Vector3(far.x, y, far.z);
    fig.lookAt(new Vector3(eye.x, y, eye.z));
    fig.setEnabled(true);
    this.tweens.push({
      node: fig,
      from: fig.position.clone(),
      to: new Vector3(near.x, y, near.z),
      t: 0,
      duration: 0.16,
    });
    const glare = new PointLight(
      "jumpscare-light",
      eye.add(fwd.scale(0.2)),
      this.scene,
    );
    glare.diffuse = new Color3(1, 0.85, 0.8);
    glare.intensity = 2.5;
    glare.range = 4;
    this.flashlight.setEnabled(true);
    this.flashlightForcedOff = false;
    this.flashlightDim = false;
    this.pipeline.chromaticAberration.aberrationAmount = 60;
    this.audio?.setHeartbeat(0);
    this.audio?.setDrone(0, 0.05);
    this.audio?.play("stinger", null, 1.3);
    this.hud.flashScreen("#fff", 0.3);
    this.shakeIntensity = 0.07;
    this.shakeUntil = this.elapsed + 1.1;
    this.flickerUntil = this.elapsed + 1.1;
    this.later(1.15, () => {
      this.hud.setBlackout(true, 0.05);
      fig.setEnabled(false);
      glare.dispose();
      this.pipeline.chromaticAberration.aberrationAmount = 0;
    });
  }

  private end(title: string, text: string): void {
    this.ended = true;
    this.cinematic = true;
    this.hud.setPrompt(null);
    this.hud.setObjective("");
    this.hud.setBlackout(true, 0.5);
    this.camera.detachControl();
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    this.audio?.setHeartbeat(0);
    this.audio?.setDrone(0.15, 3);
    this.hud.showEnding(title, text);
  }
}

/** registry.ts から呼ばれる起動関数を作るヘルパー */
export async function startHorrorGame(
  engine: AbstractEngine,
  canvas: HTMLCanvasElement,
  config: HorrorConfig,
  buildLevel: BuildLevel,
): Promise<{ render(): void }> {
  const game = new HorrorGame(engine, canvas, config, buildLevel);
  void game.start();
  return game;
}
