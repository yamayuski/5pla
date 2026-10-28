import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 深夜の歩道橋。橋は z=0〜40 を北へ一直線（幅 x=-1.3〜1.3）、高さ y=0 の床。
 * 南端 z=0 から入り、中ほど z=20 の東側に押しボタン箱。北端 z=40 に下り階段。
 * 異変の後、南北の端に防護柵（gate-s / gate-n）が出現して閉じ込められる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
	const deck = b.mat("#55575a");
	const rail = b.mat("#8a8d90", { specular: 0.5 });
	const dark = b.mat("#1a1c20");
	const lampMat = b.mat("#ffd890", { emissive: "#a07830" });

	b.room(
		"bridge",
		[0, 0, 20],
		2.6,
		40,
		3.2,
		{ floor: deck, wall: dark, ceiling: dark },
		[],
	);
	// 側面は手すり高さまでの壁に見せるため、上部を高い手すりで表現
	for (let z = 1; z < 40; z += 2) {
		for (const x of [-1.25, 1.25]) {
			b.cylinder(`post-${x}-${z}`, 1.2, 0.05, [x, 0.6, z], rail);
		}
	}
	b.box("rail-w", [0.06, 0.06, 40], [-1.25, 1.2, 20], rail, { collide: false });
	b.box("rail-e", [0.06, 0.06, 40], [1.25, 1.2, 20], rail, { collide: false });
	for (const z of [6, 16, 26, 36]) {
		b.box(`fixture-${z}`, [0.3, 0.1, 0.3], [0, 3.1, z], lampMat, {
			collide: false,
		});
	}
	b.sign(
		"bridge-name",
		["第二 歩道橋", "この橋 夜間 立入注意"],
		[1.6, 0.5],
		[0, 2.5, 0.2],
		Math.PI,
		{
			bg: "#2a4a2a",
			fg: "#e8f0e0",
			glow: 0.2,
		},
	);

	// 押しボタン
	b.box("pbox", [0.12, 0.5, 0.3], [1.22, 1.3, 20], b.mat("#c8c4b8"), {
		collide: false,
	});
	const btn = b.box(
		"ped-button",
		[0.06, 0.14, 0.14],
		[1.14, 1.3, 20],
		b.mat("#20a020", { emissive: "#105010" }),
		{ collide: false },
	);
	b.register("ped-button", btn);
	b.sign(
		"ped-label",
		["おしてください"],
		[0.4, 0.12],
		[1.16, 1.65, 20],
		-Math.PI / 2,
		{
			bg: "#f4f4ec",
			fg: "#206020",
			glow: 0.4,
		},
	);

	// 柵（最初は非表示）
	for (const [n, z] of [
		["gate-s", 3],
		["gate-n", 37],
	] as const) {
		const g = b.box(n, [2.6, 3.2, 0.2], [0, 1.6, z], rail);
		g.setEnabled(false);
		b.register(n, g);
		b.sign(
			`${n}-sign`,
			["立入禁止"],
			[1.2, 0.4],
			[0, 1.6, z + (z < 20 ? 0.12 : -0.12)],
			z < 20 ? Math.PI : 0,
			{
				bg: "#b01010",
				fg: "#ffffff",
				glow: 0.4,
			},
		).parent = g;
	}

	// 橋の下の道路（見た目）
	b.box("road-under", [30, 0.1, 40], [0, -6, 20], dark);

	b.lamp("light-a", [0, 2.9, 6], "#ffd890", 0.5, 9, false);
	b.lamp("light-b", [0, 2.9, 16], "#ffd890", 0.5, 9, false);
	b.lamp("light-c", [0, 2.9, 26], "#ffd890", 0.5, 9, false);
	b.lamp("light-d", [0, 2.9, 36], "#ffd890", 0.45, 9, false);

	b.figure(
		"ghost",
		[0, 0, 80],
		{
			skin: "#c8c0b4",
			hair: "#101010",
			cloth: "#e8e8e8",
			eyes: "#000000",
			height: 1.0,
		},
		false,
	);
	return {};
};
