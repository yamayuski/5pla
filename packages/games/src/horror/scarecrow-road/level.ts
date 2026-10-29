import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { LevelBuilder } from "./kit/builders";
import type { BuildLevel } from "./kit/game";

/** 夜の農道。x=-3〜3, z=0〜26 の一本道。奥(z=26)に鉄の門 gate。かかしは道の両脇。 */
export const buildLevel: BuildLevel = (b: LevelBuilder) => {
	const road = b.mat("#3a3830");
	const hedge = b.mat("#18221a");
	const sky = b.mat("#05060a");
	const straw = b.mat("#b89a4a", { emissive: "#2a2208" });
	const wood = b.mat("#4a3322");
	const cloth = b.mat("#5a3a2a");

	b.room(
		"road",
		[0, 0, 13],
		6,
		26,
		4,
		{ floor: road, wall: hedge, ceiling: sky },
		["s"],
	);
	b.wallWithGap("back", "x", [0, 0, 26], 6, 4, [0, 1.1, 26], hedge);
	b.door("gate", [-1, 0, 25.8], 2, 2.2, 0, b.mat("#2a2a2c"), {
		open: true,
		interactive: false,
	});
	b.box("start-block", [6, 4, 0.2], [0, 2, -0.2], hedge);

	const makeScarecrow = (
		name: string,
		x: number,
		z: number,
		rot: number,
		show: boolean,
	) => {
		const g = new TransformNode(name, b.scene);
		g.position.set(x, 0, z);
		g.rotation.y = rot;
		b.box(`${name}-pole`, [0.08, 1.9, 0.08], [0, 0.95, 0], wood, {
			collide: false,
			parent: g,
		});
		b.box(`${name}-arm`, [1.4, 0.07, 0.07], [0, 1.45, 0], wood, {
			collide: false,
			parent: g,
		});
		b.box(`${name}-body`, [0.4, 0.7, 0.2], [0, 1.2, 0], cloth, {
			collide: false,
			parent: g,
		});
		b.box(`${name}-head`, [0.3, 0.3, 0.3], [0, 1.8, 0], straw, {
			collide: false,
			parent: g,
		});
		g.setEnabled(show);
		b.register(name, g);
	};
	makeScarecrow("sc-a", -2.4, 6, Math.PI / 2, true);
	makeScarecrow("sc-b", 2.4, 12, -Math.PI / 2, true);
	makeScarecrow("sc-c", -2.4, 18, Math.PI / 2, true);
	makeScarecrow("sc-d", 0, 21, Math.PI, false);

	b.sign(
		"sign",
		["出口", "この先 ×"],
		[1.2, 0.5],
		[2.9, 1.8, 4],
		-Math.PI / 2,
		{
			bg: "#d8d0b8",
			fg: "#2a1a0a",
			glow: 0.2,
		},
	);
	b.lamp("lantern", [0, 3, 3], "#ffb060", 0.5, 8, false);

	b.figure(
		"ghost",
		[0, 0, 24],
		{
			skin: "#b8a060",
			hair: "#6a5a20",
			cloth: "#4a3020",
			eyes: "#000000",
			height: 1.0,
			longHair: false,
		},
		false,
	);
	return {};
};
