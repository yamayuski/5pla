/**
 * ワンショットホラー共通の型定義。
 * 演出トリガーはすべてこの型のデータとして各作品の config.ts に書き、
 * エンジン側（director.ts / game.ts）はデータを解釈するだけにしている。
 * 将来ほかの作品と共通化するときは kit/ ディレクトリごと切り出せばよい。
 */

export type Vec3 = readonly [number, number, number];

/** 手続き生成する効果音の名前（audio.ts の RECIPES と対応） */
export type SoundName =
  | "knock"
  | "creak"
  | "slam"
  | "whisper"
  | "footsteps"
  | "heartbeat"
  | "stinger"
  | "static"
  | "chime"
  | "drip"
  | "breath"
  | "thud"
  | "buzz"
  | "bell"
  | "rattle"
  | "giggle"
  | "rumble"
  | "phone"
  | "step";

/** トリガーの発火条件 */
export type TriggerCondition =
  /** プレイ開始からの経過秒 */
  | { type: "time"; at: number }
  /** プレイヤーが球状ゾーンに入った */
  | { type: "zone"; center: Vec3; radius: number }
  /** 名前付きメッシュを視界の中心付近に捉えた */
  | {
      type: "look";
      target: string;
      maxAngleDeg?: number;
      maxDistance?: number;
    }
  /** 別トリガーの発火から delay 秒後 */
  | { type: "after"; trigger: string; delay: number }
  /** 名前付きメッシュを見ながら E キー（またはクリック） */
  | { type: "interact"; target: string; label?: string; maxDistance?: number };

/** sound の再生位置。座標、プレイヤーの背後、プレイヤー自身、名前付きメッシュ */
export type SoundPosition = Vec3 | "behind" | "player" | { node: string };

/** トリガーで実行される演出 */
export type HorrorAction =
  | {
      type: "sound";
      sound: SoundName;
      at?: SoundPosition;
      volume?: number;
    }
  | { type: "subtitle"; text: string; duration?: number }
  | { type: "objective"; text: string }
  | { type: "flicker"; duration: number }
  | { type: "flashlight"; state: "on" | "off" | "dim" }
  | { type: "lights"; group: string; on: boolean }
  | {
      type: "door";
      door: string;
      state: "open" | "close" | "slam" | "lock" | "unlock";
    }
  | { type: "visible"; target: string; visible: boolean }
  | { type: "move"; target: string; to: Vec3; duration: number }
  | { type: "face"; target: string }
  | { type: "fog"; density: number; duration: number }
  | { type: "drone"; level: number }
  | { type: "heartbeat"; bpm: number }
  | { type: "shake"; intensity: number; duration: number }
  | { type: "custom"; name: string }
  | { type: "jumpscare"; figure: string }
  | { type: "end"; title: string; text: string };

export interface TriggerDef {
  id: string;
  when: TriggerCondition;
  actions: HorrorAction[];
  /** ここに挙げたトリガーがすべて発火済みのときだけ評価する */
  requires?: string[];
  /** ここに挙げたトリガーのどれか 1 つでも発火済みなら評価する（分岐の合流用） */
  requiresAny?: string[];
  /** ここに挙げたトリガーのどれかが発火済みなら評価しない（時間切れ救済の打ち消し用） */
  unless?: string[];
  /** 繰り返し発火させる場合 false（既定 true） */
  once?: boolean;
}

export interface HorrorConfig {
  slug: string;
  title: string;
  /** タイトル画面に出す導入文 */
  intro: string[];
  spawn: { position: Vec3; lookAt: Vec3 };
  fog: { color: Vec3; density: number };
  /** 環境光（ほぼ真っ暗にするなら 0.02〜0.06） */
  ambient: { intensity: number; color: Vec3 };
  flashlight: {
    enabled: boolean;
    intensity: number;
    angleDeg: number;
    range: number;
    color: Vec3;
  };
  /** 歩行速度（UniversalCamera.speed） */
  walkSpeed: number;
  /** 開始時のドローン音量 0〜1 */
  droneLevel: number;
  triggers: TriggerDef[];
}
