import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { Vec3 } from "./types";

export interface Door {
  name: string;
  pivot: TransformNode;
  panel: Mesh;
  /** 現在の開き具合 0〜1 */
  amount: number;
  target: number;
  speed: number;
  swing: number;
  baseRotY: number;
  locked: boolean;
  interactive: boolean;
}

export interface Lamp {
  light: PointLight;
  bulb: StandardMaterial | null;
  baseIntensity: number;
  color: Color3;
}

/** レベル構築時に名前で登録されたものの置き場。トリガーデータは名前で参照する */
export class Registry {
  public readonly nodes = new Map<string, TransformNode>();
  public readonly doors = new Map<string, Door>();
  public readonly lampGroups = new Map<string, Lamp[]>();
  public readonly materials: StandardMaterial[] = [];
}

export interface FigureStyle {
  skin?: string;
  cloth?: string;
  hair?: string;
  eyes?: string;
  height?: number;
  longHair?: boolean;
}

export const v3 = (v: Vec3): Vector3 => new Vector3(v[0], v[1], v[2]);

/**
 * MeshBuilder のプリミティブだけで部屋・ドア・照明・看板・人影を組み立てる。
 */
export class LevelBuilder {
  private readonly matCache = new Map<string, StandardMaterial>();

  public constructor(
    public readonly scene: Scene,
    public readonly registry: Registry,
  ) {}

  public mat(
    hex: string,
    opts: { emissive?: string; alpha?: number; specular?: number } = {},
  ): StandardMaterial {
    const key = `${hex}|${opts.emissive ?? ""}|${opts.alpha ?? 1}|${opts.specular ?? 0.05}`;
    const cached = this.matCache.get(key);
    if (cached) {
      return cached;
    }
    const m = new StandardMaterial(`mat-${key}`, this.scene);
    m.diffuseColor = Color3.FromHexString(hex);
    const s = opts.specular ?? 0.05;
    m.specularColor = new Color3(s, s, s);
    if (opts.emissive) {
      m.emissiveColor = Color3.FromHexString(opts.emissive);
    }
    if (opts.alpha !== undefined) {
      m.alpha = opts.alpha;
    }
    m.maxSimultaneousLights = 8;
    this.matCache.set(key, m);
    this.registry.materials.push(m);
    return m;
  }

  public box(
    name: string,
    size: Vec3,
    pos: Vec3,
    material: StandardMaterial,
    opts: { collide?: boolean; rotY?: number; parent?: TransformNode } = {},
  ): Mesh {
    const b = MeshBuilder.CreateBox(
      name,
      { width: size[0], height: size[1], depth: size[2] },
      this.scene,
    );
    b.position = v3(pos);
    b.rotation.y = opts.rotY ?? 0;
    b.material = material;
    b.checkCollisions = opts.collide ?? true;
    if (opts.parent) {
      b.parent = opts.parent;
    }
    return b;
  }

  public cylinder(
    name: string,
    height: number,
    diameter: number,
    pos: Vec3,
    material: StandardMaterial,
    opts: { collide?: boolean; diameterTop?: number; tess?: number } = {},
  ): Mesh {
    const c = MeshBuilder.CreateCylinder(
      name,
      {
        height,
        diameterBottom: diameter,
        diameterTop: opts.diameterTop ?? diameter,
        tessellation: opts.tess ?? 16,
      },
      this.scene,
    );
    c.position = v3(pos);
    c.material = material;
    c.checkCollisions = opts.collide ?? true;
    return c;
  }

  /**
   * 床・天井・4 方の壁を持つ箱部屋。skip に "n"(+z) "s"(-z) "e"(+x) "w"(-x) を渡すと
   * その壁を作らない（ドアや通路は別途 box で開口部付きの壁を組む）。
   */
  public room(
    name: string,
    center: Vec3,
    w: number,
    d: number,
    h: number,
    mats: {
      floor: StandardMaterial;
      wall: StandardMaterial;
      ceiling: StandardMaterial;
    },
    skip: ("n" | "s" | "e" | "w")[] = [],
  ): void {
    const [x, y, z] = center;
    const t = 0.2;
    this.box(`${name}-floor`, [w, t, d], [x, y - t / 2, z], mats.floor);
    this.box(`${name}-ceil`, [w, t, d], [x, y + h + t / 2, z], mats.ceiling);
    if (!skip.includes("n")) {
      this.box(`${name}-n`, [w, h, t], [x, y + h / 2, z + d / 2], mats.wall);
    }
    if (!skip.includes("s")) {
      this.box(`${name}-s`, [w, h, t], [x, y + h / 2, z - d / 2], mats.wall);
    }
    if (!skip.includes("e")) {
      this.box(`${name}-e`, [t, h, d], [x + w / 2, y + h / 2, z], mats.wall);
    }
    if (!skip.includes("w")) {
      this.box(`${name}-w`, [t, h, d], [x - w / 2, y + h / 2, z], mats.wall);
    }
  }

  /**
   * 開口部付きの壁（x 方向または z 方向に伸びる）。gap は [開口の中心オフセット, 幅, 高さ]
   */
  public wallWithGap(
    name: string,
    axis: "x" | "z",
    center: Vec3,
    length: number,
    h: number,
    gap: readonly [number, number, number],
    material: StandardMaterial,
  ): void {
    const [cx, cy, cz] = center;
    const [off, gw, gh] = gap;
    const t = 0.2;
    const leftLen = length / 2 + off - gw / 2;
    const rightLen = length / 2 - off - gw / 2;
    const leftC = -length / 2 + leftLen / 2;
    const rightC = length / 2 - rightLen / 2;
    const place = (
      n: string,
      along: number,
      len: number,
      y: number,
      hh: number,
    ) => {
      if (len <= 0.01 || hh <= 0.01) {
        return;
      }
      if (axis === "x") {
        this.box(n, [len, hh, t], [cx + along, y, cz], material);
      } else {
        this.box(n, [t, hh, len], [cx, y, cz + along], material);
      }
    };
    place(`${name}-l`, leftC, leftLen, cy + h / 2, h);
    place(`${name}-r`, rightC, rightLen, cy + h / 2, h);
    place(`${name}-top`, off, gw, cy + gh + (h - gh) / 2, h - gh);
  }

  /** ヒンジ位置を軸に回るドア。rotY=0 のとき +x 方向へ幅 width 伸びる */
  public door(
    name: string,
    hinge: Vec3,
    width: number,
    height: number,
    rotY: number,
    material: StandardMaterial,
    opts: {
      locked?: boolean;
      interactive?: boolean;
      openAngleDeg?: number;
      open?: boolean;
    } = {},
  ): Door {
    const pivot = new TransformNode(`${name}-pivot`, this.scene);
    pivot.position = v3(hinge);
    pivot.rotation.y = rotY;
    const panel = this.box(
      name,
      [width, height, 0.06],
      [width / 2, height / 2, 0],
      material,
      { parent: pivot },
    );
    const knob = MeshBuilder.CreateSphere(
      `${name}-knob`,
      { diameter: 0.07 },
      this.scene,
    );
    knob.parent = panel;
    knob.position = new Vector3(width / 2 - 0.1, -0.05, 0.05);
    knob.material = this.mat("#b8a36a", { specular: 0.6 });
    const door: Door = {
      name,
      pivot,
      panel,
      amount: opts.open ? 1 : 0,
      target: opts.open ? 1 : 0,
      speed: 1.2,
      swing: ((opts.openAngleDeg ?? 95) * Math.PI) / 180,
      baseRotY: rotY,
      locked: opts.locked ?? false,
      interactive: opts.interactive ?? true,
    };
    this.registry.doors.set(name, door);
    this.registry.nodes.set(name, panel);
    return door;
  }

  /** 電球付きの点光源。group 名で lights アクションからまとめて点け消しできる */
  public lamp(
    group: string,
    pos: Vec3,
    hex: string,
    intensity: number,
    range: number,
    withBulb = true,
  ): Lamp {
    const light = new PointLight(`${group}-light`, v3(pos), this.scene);
    const color = Color3.FromHexString(hex);
    light.diffuse = color;
    light.specular = color.scale(0.3);
    light.intensity = intensity;
    light.range = range;
    let bulb: StandardMaterial | null = null;
    if (withBulb) {
      const s = MeshBuilder.CreateBox(
        `${group}-bulb`,
        { width: 0.5, height: 0.05, depth: 0.12 },
        this.scene,
      );
      s.position = v3(pos).add(new Vector3(0, 0.05, 0));
      bulb = new StandardMaterial(`${group}-bulb-mat`, this.scene);
      bulb.emissiveColor = color;
      bulb.disableLighting = true;
      s.material = bulb;
    }
    const lamp: Lamp = { light, bulb, baseIntensity: intensity, color };
    const list = this.registry.lampGroups.get(group) ?? [];
    list.push(lamp);
    this.registry.lampGroups.set(group, list);
    return lamp;
  }

  /** 文字を描いた板（駅名標・張り紙など） */
  public sign(
    name: string,
    lines: string[],
    size: readonly [number, number],
    pos: Vec3,
    rotY: number,
    colors: { bg: string; fg: string; glow?: number } = {
      bg: "#e8e8e0",
      fg: "#111",
    },
  ): Mesh {
    const resW = 512;
    const resH = Math.max(64, Math.round((resW * size[1]) / size[0]));
    const tex = new DynamicTexture(
      `${name}-tex`,
      { width: resW, height: resH },
      this.scene,
      true,
    );
    const ctx = tex.getContext() as unknown as CanvasRenderingContext2D;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, resW, resH);
    ctx.fillStyle = colors.fg;
    const fontPx = Math.floor((resH / (lines.length + 0.6)) * 0.75);
    ctx.font = `bold ${fontPx}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lines.forEach((line, i) => {
      ctx.fillText(line, resW / 2, (resH / lines.length) * (i + 0.5));
    });
    tex.update();
    const plane = MeshBuilder.CreatePlane(
      name,
      { width: size[0], height: size[1], sideOrientation: 2 },
      this.scene,
    );
    plane.position = v3(pos);
    plane.rotation.y = rotY;
    const m = new StandardMaterial(`${name}-mat`, this.scene);
    m.diffuseTexture = tex;
    m.emissiveTexture = tex;
    m.emissiveColor = new Color3(1, 1, 1).scale(colors.glow ?? 0.15);
    m.specularColor = Color3.Black();
    m.maxSimultaneousLights = 8;
    plane.material = m;
    this.registry.nodes.set(name, plane);
    return plane;
  }

  /** プリミティブで作る人影（ジャンプスケア用）。足元が原点、ローカル +z が正面 */
  public figure(
    name: string,
    pos: Vec3,
    style: FigureStyle = {},
    visible = false,
  ): TransformNode {
    const root = new TransformNode(name, this.scene);
    root.position = v3(pos);
    const hgt = style.height ?? 1.0;
    root.scaling = new Vector3(hgt, hgt, hgt);
    const skin = this.mat(style.skin ?? "#d9d6cf", {
      emissive: "#2a2826",
    });
    const cloth = this.mat(style.cloth ?? "#cfcac0", { emissive: "#141312" });
    const hair = this.mat(style.hair ?? "#050505");
    const eye = this.mat("#000000", {
      emissive: style.eyes ?? "#000000",
    });
    const part = (m: Mesh, p: Vec3, material: StandardMaterial) => {
      m.parent = root;
      m.position = v3(p);
      m.material = material;
      m.isPickable = false;
      return m;
    };
    part(
      MeshBuilder.CreateCylinder(
        `${name}-body`,
        {
          height: 1.3,
          diameterTop: 0.3,
          diameterBottom: 0.6,
          tessellation: 12,
        },
        this.scene,
      ),
      [0, 0.65, 0],
      cloth,
    );
    part(
      MeshBuilder.CreateSphere(
        `${name}-head`,
        { diameter: 0.26, segments: 12 },
        this.scene,
      ),
      [0, 1.47, 0],
      skin,
    );
    part(
      MeshBuilder.CreateSphere(
        `${name}-hairback`,
        { diameter: 0.3, segments: 10 },
        this.scene,
      ),
      [0, 1.5, -0.035],
      hair,
    );
    if (style.longHair ?? true) {
      part(
        MeshBuilder.CreateCylinder(
          `${name}-hairlong`,
          {
            height: 0.85,
            diameterTop: 0.3,
            diameterBottom: 0.4,
            tessellation: 10,
          },
          this.scene,
        ),
        [0, 1.12, -0.09],
        hair,
      );
      for (const sx of [-1, 1]) {
        const strand = part(
          MeshBuilder.CreateBox(
            `${name}-strand${sx}`,
            { width: 0.07, height: 0.55, depth: 0.03 },
            this.scene,
          ),
          [sx * 0.075, 1.3, 0.12],
          hair,
        );
        strand.rotation.z = sx * 0.08;
      }
    }
    for (const sx of [-1, 1]) {
      part(
        MeshBuilder.CreateSphere(
          `${name}-eye${sx}`,
          { diameter: 0.05, segments: 8 },
          this.scene,
        ),
        [sx * 0.048, 1.49, 0.112],
        eye,
      );
      const arm = part(
        MeshBuilder.CreateCylinder(
          `${name}-arm${sx}`,
          { height: 0.95, diameter: 0.06, tessellation: 8 },
          this.scene,
        ),
        [sx * 0.24, 0.95, 0.12],
        skin,
      );
      arm.rotation.x = -0.5;
      arm.rotation.z = sx * 0.12;
    }
    const mouth = part(
      MeshBuilder.CreateSphere(
        `${name}-mouth`,
        { diameter: 0.1, segments: 8 },
        this.scene,
      ),
      [0, 1.39, 0.105],
      eye,
    );
    mouth.scaling = new Vector3(0.45, 1.0, 0.25);
    root.setEnabled(visible);
    this.registry.nodes.set(name, root);
    return root;
  }

  public register(name: string, node: TransformNode): void {
    this.registry.nodes.set(name, node);
  }
}
