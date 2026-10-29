import type { HorrorConfig } from "./kit/types";

/**
 * 「隧道」の演出データ。
 * 坑口 z=0、トンネルは z=0〜56（幅 x=-2.2〜2.2）。外 z<0 に止まった車。
 * 中ほど z=28 の東壁に非常ボタン。北の出口 z=56 は通行止めの鉄柵。
 * 最後は暗闇型：明かりもライトも消えた真っ暗闇で、両側から壁を叩く音が近づき、フラッシュの一瞬に一発。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
	slug: "trash-station",
	title: "ゴミ出しの夜",
	intro: [
		"午前二時。出し忘れたゴミ袋を持って、一階のゴミ置き場へ。",
		"収集箱の蓋は、閉まっている。",
	],
	spawn: { position: [0, 1.6, 1.8], lookAt: [0, 1.6, 11] },
	fog: { color: [0.04, 0.035, 0.03], density: 0.035 },
	ambient: { intensity: 0.05, color: [1, 0.9, 0.8] },
	flashlight: {
		enabled: true,
		intensity: 0.75,
		angleDeg: 40,
		range: 14,
		color: [1, 0.97, 0.9],
	},
	walkSpeed: 0.09,
	droneLevel: 0.05,
	triggers: [
		// ---- 0〜1分: 止まった車 ----
		{
			id: "intro",
			when: { type: "time", at: 1 },
			actions: [
				{
					type: "subtitle",
					text: "蛍光灯が低く唸る。袋が、昼より多い気がする。",
				},
				{ type: "objective", text: "奥の収集箱の蓋を開ける" },
			],
		},
		{
			id: "sos",
			when: {
				type: "interact",
				target: "bin-lid",
				label: "蓋を開ける",
				maxDistance: 2.6,
			},
			unless: ["lock"],
			actions: [
				{
					type: "sound",
					sound: "buzz",
					at: { node: "bin-lid" },
					volume: 0.6,
				},
				{
					type: "sound",
					sound: "static",
					at: { node: "bin-lid" },
					volume: 0.4,
				},
				{
					type: "subtitle",
					text: "ギィ。……中は空っぽだった。背後で、袋の擦れる音がした。",
					duration: 5,
				},
				{ type: "objective", text: "外へ戻る" },
			],
		},
		// ---- 1〜3分: 小さな異変 ----
		{
			id: "hands-1",
			when: { type: "time", at: 68 },
			actions: [
				{ type: "sound", sound: "knock", at: [-2, 0.5, 6], volume: 0.7 },
				{
					type: "subtitle",
					text: "コン。ゴミ袋を叩く音。振り返っても、誰もいない。",
					duration: 5,
				},
			],
		},
		{
			id: "horn",
			when: { type: "time", at: 102 },
			actions: [
				{ type: "sound", sound: "buzz", at: [0, 1, 11], volume: 1 },
				{ type: "sound", sound: "rumble", at: [0, 1, 11], volume: 0.4 },
				{
					type: "subtitle",
					text: "部屋の下から、トラックのクラクション。長く、長く鳴り続ける。",
					duration: 4,
				},
				{ type: "heartbeat", bpm: 80 },
			],
		},
		{
			id: "hands-2",
			when: { type: "time", at: 136 },
			actions: [
				{ type: "sound", sound: "footsteps", at: "behind", volume: 0.6 },
				{
					type: "subtitle",
					text: "自分の足音が、半拍遅れてもう一つ聞こえる。手形が増えている。",
					duration: 5,
				},
			],
		},
		{
			id: "lights-out-1",
			when: { type: "time", at: 168 },
			actions: [
				{ type: "lights", group: "light-a", on: false },
				{ type: "lights", group: "light-a", on: false },
				{ type: "sound", sound: "thud", at: [0, 2, 6], volume: 0.5 },
				{ type: "drone", level: 0.22 },
				{
					type: "subtitle",
					text: "南側の蛍光灯が消えた。来た道が、暗闇に沈む。",
					duration: 4,
				},
			],
		},
		// ---- 3〜4分: 閉じ込められる ----
		{
			id: "lock",
			when: { type: "time", at: 200 },
			actions: [
				{ type: "visible", target: "shutter", visible: true },
				{ type: "visible", target: "shutter", visible: true },
				{ type: "sound", sound: "rumble", at: [0, 2, 1.2], volume: 1 },
				{ type: "sound", sound: "slam", at: [0, 1, 1.2], volume: 0.9 },
				{ type: "shake", intensity: 0.05, duration: 2 },
				{ type: "fog", density: 0.07, duration: 4 },
				{ type: "lights", group: "light-b", on: false },
				{ type: "drone", level: 0.45 },
				{ type: "heartbeat", bpm: 104 },
				{
					type: "subtitle",
					text: "ガシャン。部屋の両端に、鉄の柵が降りた。出口がない。",
					duration: 5,
				},
				{ type: "objective", text: "" },
			],
		},
		{
			id: "hands-3",
			when: { type: "after", trigger: "lock", delay: 8 },
			actions: [
				{ type: "lights", group: "light-b", on: false },
				{ type: "flashlight", state: "dim" },
				{ type: "flicker", duration: 1.5 },
				{
					type: "subtitle",
					text: "ライトが弱くなってきた。最後の蛍光灯が、北の柵のそばに一つだけ。",
					duration: 5,
				},
			],
		},
		// ---- 4〜5分: 真っ暗闇 ----
		{
			id: "blackout",
			when: { type: "after", trigger: "lock", delay: 45 },
			unless: SCARES,
			actions: [
				{ type: "lights", group: "light-b", on: false },
				{ type: "flashlight", state: "off" },
				{ type: "drone", level: 0 },
				{ type: "heartbeat", bpm: 0 },
				{
					type: "subtitle",
					text: "全部、消えた。何も見えない。",
					duration: 3,
				},
			],
		},
		{
			id: "slaps",
			when: { type: "after", trigger: "blackout", delay: 3.5 },
			actions: [
				{ type: "sound", sound: "knock", at: [-2, 0.5, 5], volume: 0.6 },
				{ type: "sound", sound: "knock", at: [2, 0.5, 5], volume: 0.6 },
				{ type: "sound", sound: "footsteps", at: "behind", volume: 0.9 },
				{
					type: "subtitle",
					text: "コツ。コツ。コツ。両側のゴミ袋を叩く音が、近づいてくる。",
					duration: 4,
				},
			],
		},
		{
			id: "slaps-near",
			when: { type: "after", trigger: "blackout", delay: 7 },
			actions: [
				{ type: "sound", sound: "knock", at: "player", volume: 1 },
				{ type: "sound", sound: "breath", at: "behind", volume: 1 },
			],
		},
		{
			id: "scare-hit",
			when: { type: "after", trigger: "blackout", delay: 9.5 },
			actions: [{ type: "jumpscare", figure: "ghost" }],
		},
		{
			id: "scare-timeout",
			when: { type: "time", at: 320 },
			unless: SCARES,
			actions: [{ type: "jumpscare", figure: "ghost" }],
		},
		...SCARES.map((id) => ({
			id: `end-${id}`,
			when: { type: "after" as const, trigger: id, delay: 2.4 },
			actions: [
				{
					type: "end" as const,
					title: "ゴミ出しの夜",
					text: "このゴミ置き場では、夜に出したはずの袋が、朝には一つ多いという。\n数えた住人は、翌日から姿を見ない。\n\n翌朝、収集箱の中に、見慣れた部屋着の袋が一つ置かれていた。",
				},
			],
		})),
	],
};
