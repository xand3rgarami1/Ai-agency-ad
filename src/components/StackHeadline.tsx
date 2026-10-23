import React from 'react';
import {COLORS, FONTS} from '../config/brand';
import {KineticWords, TimedWord} from './Text';

type Props = {
	/** each entry is one line of the headline */
	lines: TimedWord[][];
	size?: number;
	index?: string;
	accentLast?: boolean;
	outAt?: number;
};

/** Left-aligned, stacked uppercase headline used for the problem beats. */
export const StackHeadline: React.FC<Props> = ({lines, size = 118, index, accentLast, outAt}) => (
	<div style={{position: 'absolute', top: 190, left: 70, right: 70}}>
		{index ? (
			<div style={{position: 'absolute', right: 0, top: 6, fontFamily: FONTS.mono, fontSize: 28, color: COLORS.purpleBright, letterSpacing: '0.12em'}}>{index}</div>
		) : null}
		{lines.map((l, i) => (
			<KineticWords
				key={i}
				words={l.map((w) => ({...w, text: w.text.toUpperCase()}))}
				size={size}
				weight={900}
				align="left"
				lineHeight={0.98}
				tracking="-0.04em"
				color={accentLast && i === lines.length - 1 ? COLORS.purpleBright : COLORS.white}
				motion={{y: 50, blur: 18}}
				outAt={outAt}
			/>
		))}
	</div>
);
