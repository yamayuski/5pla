import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/**
 * 深夜のマンションのゴミ置き場。小部屋 x=-3〜3, z=0〜12（屋根付き）。
 * 入口 z=0。奥 z=11 に大きなゴミ収集箱（bin-lid が蓋）。黒い袋が床に並ぶ。
 * 異変の後、入口にシャッター（shutter）が降りる。
 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
	const floor = b.mat("#4a4a46");
	const wall = b.mat("#2c2f2e");
	const bag = b.mat("#0c0c0e", { specular: 0.6 });
	const metal = b.mat("#3a5a48", { specular: 0.4 });
	const lampMat = b.mat("#d8ffd0", { emissive: "#506850" });

	b.room("station", [0, 0, 6], 6, 12, 3, { floor, wall, ceiling: wall }, []);
	for (const [i, x, z] of [
		[0, -2.2, 3],
		[1, -1.2, 4.5],
		[2, 1.5, 3.5],
		[3, 2.2, 6],
		[4, -2.3, 7],
		[5, 0.4, 8],
	] as const) {
		b.box(`bag-${i}`, [0.6, 0.55, 0.5], [x, 0.28, z], bag, { collide: false });
	}
	b.box("bin", [3, 1.1, 1.2], [0, 0.55, 11.2], metal);
	const lid = b.box("bin-lid", [3, 0.1, 1.2], [0, 1.15, 11.2], metal, {
		collide: false,
	});
	b.register("bin-lid", lid);
	b.box("fixture", [0.4, 0.08, 0.4], [0, 2.95, 5], lampMat, { collide: false });
	b.sign(
		"rule",
		["燃えるゴミ 火・金", "夜間 持ち込み禁止"],
		[1.8, 0.5],
		[0, 1.8, 0.15],
		Math.PI,
		{ bg: "#f0f0e0", fg: "#a01010", glow: 0.2 },
	);
	const sh = b.box("shutter", [6, 3, 0.15], [0, 1.5, 1.2], b.mat("#777b7a"));
	sh.setEnabled(false);
	b.register("shutter", sh);

	b.lamp("light-a", [0, 2.8, 3], "#d8ffd0", 0.5, 8, false);
	b.lamp("light-b", [0, 2.8, 9], "#d8ffd0", 0.4, 8, false);
	b.figure(
		"ghost",
		[0, 0, 80],
		{
			skin: "#bcb8a8",
			hair: "#101010",
			cloth: "#202020",
			eyes: "#000000",
			height: 1.0,
		},
		false,
	);
	return {};
};
