import type { HorrorConfig } from "./kit/types";

/**
 * 「隧道」の演出データ。
 * 坑口 z=0、トンネルは z=0〜56（幅 x=-2.2〜2.2）。外 z<0 に止まった車。
 * 中ほど z=28 の東壁に非常ボタン。北の出口 z=56 は通行止めの鉄柵。
 * 最後は暗闇型：明かりもライトも消えた真っ暗闇で、両側から壁を叩く音が近づき、フラッシュの一瞬に一発。
 */
const SCARES = ["scare-hit", "scare-timeout"];

export const config: HorrorConfig = {
	slug: "footbridge",
	title: "歩道橋",
	intro: [
		"終電後、駅へ向かう近道の歩道橋。人影は無い。",
		"橋の中ほどに、押しボタンの箱がある。",
	],
	spawn: { position: [0, 1.6, 1.0], lookAt: [0, 1.6, 30] },
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
					text: "白い街灯が点々と続く。下の道路を、車が一台も通らない。",
				},
				{ type: "objective", text: "トンネルの中ほどのボタンを押す" },
			],
		},
		{
			id: "sos",
			when: {
				type: "interact",
				target: "ped-button",
				label: "ボタンを押す",
				maxDistance: 2,
			},
			unless: ["lock"],
			actions: [
				{
					type: "sound",
					sound: "buzz",
					at: { node: "ped-button" },
					volume: 0.6,
				},
				{
					type: "sound",
					sound: "static",
					at: { node: "ped-button" },
					volume: 0.4,
				},
				{
					type: "subtitle",
					text: "ピッ。……橋の下の信号は、変わらない。背後で、手すりを握る音がした。",
					duration: 5,
				},
				{ type: "objective", text: "橋を渡りきる" },
			],
		},
		// ---- 1〜3分: 小さな異変 ----
		{
			id: "hands-1",
			when: { type: "time", at: 68 },
			actions: [
				{ type: "sound", sound: "knock", at: [-1.3, 1.2, 22], volume: 0.7 },
				{
					type: "subtitle",
					text: "コン。手すりを叩く音。振り返っても、誰もいない。",
					duration: 5,
				},
			],
		},
		{
			id: "horn",
			when: { type: "time", at: 102 },
			actions: [
				{ type: "sound", sound: "buzz", at: [0, -4, 20], volume: 1 },
				{ type: "sound", sound: "rumble", at: [0, -4, 20], volume: 0.4 },
				{
					type: "subtitle",
					text: "橋の下から、トラックのクラクション。長く、長く鳴り続ける。",
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
				{ type: "sound", sound: "thud", at: [0, 3, 8], volume: 0.5 },
				{ type: "drone", level: 0.22 },
				{
					type: "subtitle",
					text: "南側の街灯が消えた。来た道が、暗闇に沈む。",
					duration: 4,
				},
			],
		},
		// ---- 3〜4分: 閉じ込められる ----
		{
			id: "lock",
			when: { type: "time", at: 200 },
			actions: [
				{ type: "visible", target: "gate-s", visible: true },
				{ type: "visible", target: "gate-n", visible: true },
				{ type: "sound", sound: "rumble", at: [0, 3, 3], volume: 1 },
				{ type: "sound", sound: "slam", at: [0, 1, 3], volume: 0.9 },
				{ type: "shake", intensity: 0.05, duration: 2 },
				{ type: "fog", density: 0.07, duration: 4 },
				{ type: "lights", group: "light-b", on: false },
				{ type: "drone", level: 0.45 },
				{ type: "heartbeat", bpm: 104 },
				{
					type: "subtitle",
					text: "ガシャン。橋の両端に、鉄の柵が降りた。出口がない。",
					duration: 5,
				},
				{ type: "objective", text: "" },
			],
		},
		{
			id: "hands-3",
			when: { type: "after", trigger: "lock", delay: 8 },
			actions: [
				{ type: "lights", group: "light-c", on: false },
				{ type: "flashlight", state: "dim" },
				{ type: "flicker", duration: 1.5 },
				{
					type: "subtitle",
					text: "ライトが弱くなってきた。最後の街灯が、北の柵のそばに一つだけ。",
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
				{ type: "lights", group: "light-d", on: false },
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
				{ type: "sound", sound: "knock", at: [-1.3, 1.2, 10], volume: 0.6 },
				{ type: "sound", sound: "knock", at: [1.3, 1.2, 10], volume: 0.6 },
				{ type: "sound", sound: "footsteps", at: "behind", volume: 0.9 },
				{
					type: "subtitle",
					text: "コツ。コツ。コツ。両側の手すりを叩く音が、近づいてくる。",
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
					title: "歩道橋",
					text: "鬼首隧道は昭和九年、工事中の落盤で多くの作業員が生き埋めになった。\n掘り出されなかった彼らは、今も内側から壁を叩いている。\n\n翌朝、坑口の脇で、エンジンのかかったままの車が見つかった。",
				},
			],
		})),
	],
};
