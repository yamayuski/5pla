import type { HorrorConfig } from "./kit/types";

/**
 * 「灯台の最上階」の演出データ。
 * 部屋は x=-3〜3, z=0〜7。扉 room-door（南）、テーブルの radio / switch、北のモニター log-a / log-b。
 * 最後は keeper（ソファに座る白い服の女）が現れる。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
	slug: "lighthouse",
	title: "消えた灯台守",
	intro: [
		"嵐の夜、岬の無人灯台に避難した。",
		"最上階の灯室に、まだ人の気配がある気がした。",
	],
	spawn: { position: [0, 1.6, 1.2], lookAt: [0, 1.5, 6] },
	fog: { color: [0.03, 0.02, 0.05], density: 0.015 },
	ambient: { intensity: 0.08, color: [0.8, 0.7, 1] },
	flashlight: {
		enabled: true,
		intensity: 0.5,
		angleDeg: 45,
		range: 10,
		color: [1, 0.97, 0.9],
	},
	walkSpeed: 0.08,
	droneLevel: 0.05,
	triggers: [
		{
			id: "intro",
			when: { type: "time", at: 1 },
			actions: [
				{
					type: "subtitle",
					text: "風が塔をきしませている。",
				},
				{ type: "objective", text: "灯火のスイッチを入れる" },
			],
		},
		{
			id: "lamp-on",
			when: {
				type: "interact",
				target: "switch",
				label: "スイッチを入れる",
				maxDistance: 2.4,
			},
			actions: [
				{ type: "lights", group: "lamp", on: true },
				{ type: "sound", sound: "chime", at: { node: "switch" }, volume: 0.5 },
				{
					type: "subtitle",
					text: "灯火が回りはじめた。海は真っ暗なままだ。",
					duration: 4,
				},
				{ type: "objective", text: "" },
			],
		},
		{
			id: "lamp-auto",
			when: { type: "time", at: 40 },
			unless: ["lamp-on"],
			actions: [
				{ type: "lights", group: "lamp", on: true },
				{
					type: "subtitle",
					text: "灯火がひとりでに回りはじめた。",
					duration: 4,
				},
				{ type: "objective", text: "" },
			],
		},
		// 小さな異変
		{
			id: "wall-knock",
			when: { type: "time", at: 75 },
			actions: [
				{ type: "sound", sound: "knock", at: [-3, 1.5, 3], volume: 0.8 },
				{
					type: "subtitle",
					text: "風が止んだ。……壁を、外側から叩く音。",
					duration: 5,
				},
				{ type: "heartbeat", bpm: 76 },
			],
		},
		{
			id: "tv-glitch",
			when: { type: "time", at: 125 },
			actions: [
				{ type: "visible", target: "log-a", visible: false },
				{ type: "visible", target: "log-b", visible: true },
				{ type: "sound", sound: "static", at: { node: "log-b" }, volume: 0.7 },
				{
					type: "subtitle",
					text: "日誌の文字が、見知らぬ筆跡に変わった。",
					duration: 5,
				},
			],
		},
		{
			id: "radio-whisper",
			when: { type: "time", at: 165 },
			actions: [
				{ type: "sound", sound: "whisper", at: { node: "radio" }, volume: 0.7 },
				{
					type: "subtitle",
					text: "無線機から、ささやきが漏れた。「……もう、船は来ない……」",
					duration: 5,
				},
				{ type: "drone", level: 0.18 },
			],
		},
		// 逃げ道が塞がる
		{
			id: "lock",
			when: { type: "time", at: 205 },
			actions: [
				{ type: "door", door: "room-door", state: "slam" },
				{ type: "door", door: "room-door", state: "lock" },
				{ type: "sound", sound: "slam", at: [0, 1, 0], volume: 0.8 },
				{ type: "shake", intensity: 0.03, duration: 1 },
				{ type: "fog", density: 0.035, duration: 4 },
				{
					type: "subtitle",
					text: "扉が勝手に閉まった。無線は鳴りっぱなしで、誰も出ない。",
					duration: 5,
				},
				{ type: "heartbeat", bpm: 96 },
			],
		},
		{
			id: "blackout",
			when: { type: "after", trigger: "lock", delay: 10 },
			actions: [
				{ type: "flicker", duration: 1.5 },
				{ type: "lights", group: "lamp", on: false },
				{ type: "lights", group: "red", on: true },
				{ type: "flashlight", state: "dim" },
				{ type: "sound", sound: "breath", at: "behind", volume: 0.8 },
				{ type: "drone", level: 0.4 },
				{
					type: "subtitle",
					text: "灯火が赤に変わった。無線機のつまみが、ひとりでに回る。",
					duration: 5,
				},
				{ type: "objective", text: "無線機を確かめる" },
			],
		},
		{
			id: "radio-take",
			when: {
				type: "interact",
				target: "radio",
				label: "無線機に出る",
				maxDistance: 2.4,
			},
			requires: ["blackout"],
			unless: SCARES,
			actions: [
				{ type: "visible", target: "keeper", visible: true },
				{ type: "face", target: "keeper" },
				{ type: "sound", sound: "giggle", at: { node: "keeper" }, volume: 0.7 },
				{ type: "heartbeat", bpm: 130 },
				{ type: "objective", text: "" },
				{
					type: "subtitle",
					text: "灯室のガラスの向こうに、雨合羽の人影が立っている。……ランプを抱えて。",
					duration: 5,
				},
			],
		},
		{
			id: "radio-auto",
			when: { type: "after", trigger: "blackout", delay: 35 },
			unless: ["radio-take", ...SCARES],
			actions: [
				{ type: "visible", target: "keeper", visible: true },
				{ type: "face", target: "keeper" },
				{ type: "sound", sound: "giggle", at: { node: "keeper" }, volume: 0.7 },
				{ type: "heartbeat", bpm: 130 },
				{ type: "objective", text: "" },
				{
					type: "subtitle",
					text: "灯室のガラスの向こうに、雨合羽の人影が立っている。",
					duration: 5,
				},
			],
		},
		{
			id: "scare-hit",
			when: {
				type: "look",
				target: "keeper",
				maxAngleDeg: 22,
				maxDistance: 20,
			},
			requiresAny: ["radio-take", "radio-auto"],
			unless: SCARES,
			actions: [{ type: "jumpscare", figure: "keeper" }],
		},
		{
			id: "scare-timeout",
			when: { type: "time", at: 320 },
			unless: SCARES,
			actions: [{ type: "jumpscare", figure: "keeper" }],
		},
		...SCARES.map((id) => ({
			id: `end-${id}`,
			when: { type: "after" as const, trigger: id, delay: 2.4 },
			actions: [
				{
					type: "end" as const,
					title: "消えた灯台守",
					text: "翌朝、巡視船は灯の消えた灯台を見つけた。\n五十年前の灯台日誌の最後に、あなたの名前が書かれていた。",
				},
			],
		})),
	],
};
