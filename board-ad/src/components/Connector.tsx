import React from 'react';
import {COLORS} from '../config/brand';

export type Pt = {x: number; y: number};
export type Bezier = [Pt, Pt, Pt, Pt];

/** Cubic bezier that leaves `a` and enters `b` along the given axis. */
export const curve = (a: Pt, b: Pt, axis: 'x' | 'y' = 'y', bend = 0.5): Bezier => {
	if (axis === 'y') {
		const dy = (b.y - a.y) * bend;
		return [a, {x: a.x, y: a.y + dy}, {x: b.x, y: b.y - dy}, b];
	}
	const dx = (b.x - a.x) * bend;
	return [a, {x: a.x + dx, y: a.y}, {x: b.x - dx, y: b.y}, b];
};

export const pointOn = ([p0, p1, p2, p3]: Bezier, t: number): Pt => {
	const u = 1 - t;
	const a = u * u * u;
	const b = 3 * u * u * t;
	const c = 3 * u * t * t;
	const d = t * t * t;
	return {x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y};
};

const toD = ([p0, p1, p2, p3]: Bezier) => `M${p0.x},${p0.y} C${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;

type Props = {
	path: Bezier;
	/** 0..1 how much of the line is drawn */
	draw: number;
	/** positions (0..1) of travelling data pulses; values outside [0,1] are hidden */
	pulses?: number[];
	width?: number;
	opacity?: number;
	dashed?: boolean;
	color?: string;
};

/** Purple workflow connection with glow and travelling pulses. Render inside a full-frame <svg>. */
export const Connector: React.FC<Props> = ({path, draw, pulses = [], width = 4, opacity = 1, dashed, color = COLORS.purple}) => {
	const d = toD(path);
	if (dashed) {
		return <path d={d} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={3} strokeDasharray="10 12" opacity={opacity} />;
	}
	return (
		<g opacity={opacity}>
			<path d={d} fill="none" stroke={color} strokeWidth={width * 4} strokeOpacity={0.18} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} filter="url(#softGlow)" strokeLinecap="round" />
			<path d={d} fill="none" stroke={color} strokeWidth={width} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} strokeLinecap="round" />
			{pulses
				.filter((p) => p >= 0 && p <= 1 && p <= draw)
				.map((p, i) => {
					const pt = pointOn(path, p);
					return (
						<g key={i}>
							<circle cx={pt.x} cy={pt.y} r={18} fill={COLORS.purple} opacity={0.35} filter="url(#softGlow)" />
							<circle cx={pt.x} cy={pt.y} r={8} fill="#fff" />
						</g>
					);
				})}
		</g>
	);
};

/** Shared SVG defs (glow filter). Include once per <svg>. */
export const GlowDefs: React.FC = () => (
	<defs>
		<filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="8" />
		</filter>
	</defs>
);
