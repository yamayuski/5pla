import type { HorrorConfig } from "./kit/types";

/** 「かかしの一本道」: 振り向くたびにかかしが近づく。道の奥(z=26)の門が閉まる。 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
	slug: "scarecrow-road",
	title: "かかしの一本道",
	intro: [
		"終バスを逃し、田んぼ道を歩いて帰るしかない。",
		"街灯は、ひとつもない。",
	],
	spawn: { position: [0, 1.6, 1], lookAt: [0, 1.5, 12] },
	fog: { color: [0.02, 0.03, 0.04], density: 0.045 },
	ambient: { intensity: 0.06, color: [0.7, 0.8, 1] },
	flashlight: {
		enabled: true,
		intensity: 0.8,
		angleDeg: 38,
		range: 14,
		color: [1, 0.97, 0.9],
	},
	walkSpeed: 0.08,
	droneLevel: 0.08,
	triggers: [
		{
			id: "intro",
			when: { type: "time", at: 1 },
			actions: [
				{
					type: "subtitle",
					text: "虫の声だけが響く。道の脇に、かかしが立っている。",
				},
				{ type: "objective", text: "道の奥まで歩く" },
			],
		},
		{
			id: "shift-1",
			when: { type: "time", at: 70 },
			actions: [
				{ type: "move", target: "sc-a", to: [-1.2, 0, 5], duration: 0.1 },
				{ type: "sound", sound: "rattle", at: "behind", volume: 0.5 },
				{
					type: "subtitle",
					text: "一番手前のかかしが、さっきより道に近い気がする。",
					duration: 5,
				},
			],
		},
		{
			id: "shift-2",
			when: { type: "time", at: 120 },
			actions: [
				{ type: "move", target: "sc-b", to: [1.0, 0, 8], duration: 0.1 },
				{ type: "sound", sound: "step", at: "behind", volume: 0.5 },
				{ type: "heartbeat", bpm: 80 },
				{
					type: "subtitle",
					text: "ざ、ざ、と藁を踏む音。振り向くと、右のかかしが前へ出ていた。",
					duration: 5,
				},
			],
		},
		{
			id: "whisper",
			when: { type: "time", at: 170 },
			actions: [
				{ type: "sound", sound: "whisper", at: "behind", volume: 0.6 },
				{ type: "drone", level: 0.2 },
				{
					type: "subtitle",
					text: "「……おいで……」耳元で藁がこすれた。",
					duration: 4,
				},
			],
		},
		{
			id: "gate-shut",
			when: { type: "time", at: 205 },
			actions: [
				{ type: "door", door: "gate", state: "slam" },
				{ type: "door", door: "gate", state: "lock" },
				{ type: "sound", sound: "slam", at: [0, 1, 26], volume: 0.9 },
				{ type: "move", target: "sc-c", to: [-0.6, 0, 14], duration: 0.1 },
				{ type: "shake", intensity: 0.03, duration: 1 },
				{ type: "heartbeat", bpm: 100 },
				{
					type: "subtitle",
					text: "奥の鉄門が勝手に閉まった。引き返すしかない。",
					duration: 5,
				},
				{ type: "objective", text: "引き返す" },
			],
		},
		{
			id: "light-out",
			when: { type: "after", trigger: "gate-shut", delay: 15 },
			actions: [
				{ type: "flicker", duration: 1.5 },
				{ type: "flashlight", state: "dim" },
				{ type: "sound", sound: "breath", at: "behind", volume: 0.8 },
				{ type: "drone", level: 0.4 },
				{ type: "visible", target: "sc-d", visible: true },
				{
					type: "subtitle",
					text: "ライトが弱まる。道の真ん中に、見覚えのないかかしが立っている。",
					duration: 5,
				},
			],
		},
		{
			id: "scare-hit",
			when: { type: "look", target: "sc-d", maxAngleDeg: 20, maxDistance: 30 },
			requires: ["light-out"],
			unless: SCARES,
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
					title: "かかしの一本道",
					text: "翌朝、農道には誰もいなかった。\n畑のかかしは、昨日より一体多く並んでいたという。",
				},
			],
		})),
	],
};
