import React, {CSSProperties} from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../config/brand';
import {voLine} from '../config/timing';
import {conceal, EASE_IN, EASE_OUT, mix, prog, reveal, RevealOpts} from './anim';

export type TimedWord = {text: string; t: number; style?: CSSProperties; suffix?: React.ReactNode};

/** Words of a narration line (optionally a slice) with their spoken start times. */
export const lineWords = (id: string, from = 0, to?: number, transform?: (s: string) => string): TimedWord[] =>
	voLine(id)
		.words.slice(from, to)
		// typographic apostrophes for on-screen copy
		.map((w) => ({text: (transform ? transform(w.text) : w.text).replace(/'/g, '\u2019'), t: w.start}));

type KineticProps = {
	words: TimedWord[];
	size: number;
	weight?: number;
	color?: string;
	font?: string;
	align?: 'left' | 'center';
	lineHeight?: number;
	tracking?: string;
	/** seconds the word appears before it is spoken */
	lead?: number;
	dur?: number;
	motion?: RevealOpts;
	/** absolute seconds; when set the block leaves with a blur/rise */
	outAt?: number;
	style?: CSSProperties;
	upper?: boolean;
};

/** Word-by-word kinetic typography synced to narration timings. */
export const KineticWords: React.FC<KineticProps> = ({
	words,
	size,
	weight = 700,
	color = COLORS.white,
	font = FONTS.display,
	align = 'center',
	lineHeight = 1.02,
	tracking = '-0.035em',
	lead = 0.08,
	dur = 0.34,
	motion,
	outAt,
	style,
	upper,
}) => {
	const frame = useCurrentFrame();
	const out = outAt === undefined ? 0 : prog(frame, outAt, 0.2, EASE_IN);
	return (
		<div
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: align === 'center' ? 'center' : 'flex-start',
				columnGap: '0.24em',
				fontFamily: font,
				fontSize: size,
				fontWeight: weight,
				color,
				lineHeight,
				letterSpacing: tracking,
				textTransform: upper ? 'uppercase' : undefined,
				...conceal(out, {y: -30, blur: 12}),
				...style,
			}}
		>
			{words.map((w, i) => (
				<span key={i} style={{display: 'inline-block', whiteSpace: 'pre', ...reveal(prog(frame, w.t - lead, dur), motion), ...w.style}}>
					{w.text}
					{w.suffix}
				</span>
			))}
		</div>
	);
};

type SlamProps = {
	text: string;
	t: number;
	size: number;
	color?: string;
	weight?: number;
	style?: CSSProperties;
	/** start tracking (em) the letters collapse from */
	fromTracking?: number;
	toTracking?: number;
	fromScale?: number;
	dur?: number;
};

/** Heavy headline word that lands with tracking + scale + blur. */
export const Slam: React.FC<SlamProps> = ({
	text,
	t,
	size,
	color = COLORS.white,
	weight = 900,
	style,
	fromTracking = 0.32,
	toTracking = -0.045,
	fromScale = 1.35,
	dur = 0.42,
}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, t - 0.06, dur, EASE_OUT);
	return (
		<div
			style={{
				fontFamily: FONTS.display,
				fontWeight: weight,
				fontSize: size,
				lineHeight: 0.9,
				color,
				whiteSpace: 'nowrap',
				letterSpacing: `${mix(fromTracking, toTracking, p)}em`,
				opacity: Math.min(1, p * 2.2),
				transform: `scale(${mix(fromScale, 1, p)})`,
				filter: p < 1 ? `blur(${(1 - p) * 20}px)` : undefined,
				...style,
			}}
		>
			{text}
		</div>
	);
};

type MaskProps = {t: number; children: React.ReactNode; dur?: number; outAt?: number; style?: CSSProperties};

/** Line that slides up from behind a mask. */
export const MaskLine: React.FC<MaskProps> = ({t, children, dur = 0.45, outAt, style}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, t, dur, EASE_OUT);
	const o = outAt === undefined ? 0 : prog(frame, outAt, 0.25, EASE_IN);
	return (
		<div style={{overflow: 'hidden', paddingBottom: '0.08em', ...style}}>
			<div style={{transform: `translateY(${(1 - p) * 105 - o * 105}%)`, opacity: 1 - o * 0.5}}>{children}</div>
		</div>
	);
};

/** Small uppercase label in mono, used for section kickers. */
export const Kicker: React.FC<{t: number; children: React.ReactNode; color?: string; style?: CSSProperties}> = ({t, children, color = COLORS.purpleBright, style}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, t, 0.35);
	return (
		<div
			style={{
				fontFamily: FONTS.mono,
				fontSize: 28,
				fontWeight: 500,
				letterSpacing: '0.16em',
				textTransform: 'uppercase',
				color,
				...reveal(p, {y: 14, blur: 8}),
				...style,
			}}
		>
			{children}
		</div>
	);
};
