import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONTS, TYPE} from '../config/brand';
import {cue, word} from '../config/timing';
import {EASE_IN_OUT, EASE_OUT, mix, prog, reveal} from '../components/anim';
import {KineticWords, lineWords, Slam} from '../components/Text';

/** Rolling digit counter that lands on $10,000,000 — "eight figures" made literal. */
const Counter: React.FC<{t: number}> = ({t}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, t, 0.9, EASE_OUT);
	const value = Math.round(10_000_000 * p);
	const text = '$' + value.toLocaleString('en-US');
	return (
		<div style={{fontFamily: FONTS.mono, fontSize: 50, fontWeight: 500, color: COLORS.purpleBright, letterSpacing: '0.04em', ...reveal(prog(frame, t - 0.05, 0.3), {y: 16, blur: 8})}}>
			{text}
		</div>
	);
};

export const S1Opening: React.FC = () => {
	const frame = useCurrentFrame();
	const tEight = word('eight', 4);
	const tFigures = word('eight', 5);
	// Opening light line: expands on frame 0, becomes the accent under EIGHT FIGURES.
	const lineIn = prog(frame, 0, 0.45, EASE_OUT);
	const lineDrop = prog(frame, tFigures, 0.4, EASE_IN_OUT);
	const lineW = mix(0, 820, lineIn);
	const lineY = mix(960, 1196, lineDrop);
	const push = mix(1, 1.05, prog(frame, 0, 3.2, (x) => x));
	const hit = prog(frame, cue('s1.eight'), 0.5);
	const flash = (1 - hit) * (hit > 0 ? 1 : 0);

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 60% 30% at 50% 52%, rgba(124,77,255,${0.22 * flash + 0.08 * lineIn}) 0%, transparent 70%)`,
				}}
			/>
			<AbsoluteFill style={{transform: `scale(${push})`}}>
				<div style={{position: 'absolute', left: 540 - lineW / 2, top: lineY, width: lineW, height: 6, borderRadius: 3, background: COLORS.purple, boxShadow: `0 0 32px ${COLORS.purpleGlow}`}} />
				<div style={{position: 'absolute', top: 640, left: 80, right: 80}}>
					<KineticWords words={lineWords('eight', 0, 4)} size={TYPE.lead + 6} weight={600} color={COLORS.text2} lead={0.12} />
				</div>
				<div style={{position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
					<Slam text="EIGHT" t={tEight} size={TYPE.hero + 14} />
					<Slam text="FIGURES" t={tFigures} size={TYPE.hero + 14} />
				</div>
				<div style={{position: 'absolute', top: 1236, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<Counter t={tFigures + 0.05} />
				</div>
				<div style={{position: 'absolute', top: 1330, left: 80, right: 80}}>
					<KineticWords words={lineWords('eight', 6)} size={TYPE.h3 + 8} weight={400} color={COLORS.white} tracking="-0.02em" />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
