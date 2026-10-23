import React, {CSSProperties} from 'react';
import {COLORS, FONTS} from '../config/brand';

/** Simple table row used by the mock spreadsheet / lists. */
export const Row: React.FC<{cells: React.ReactNode[]; widths: (number | string)[]; head?: boolean; style?: CSSProperties; mono?: boolean}> = ({cells, widths, head, style, mono}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			height: head ? 48 : 58,
			borderBottom: `1px solid ${COLORS.border}`,
			fontFamily: mono ? FONTS.mono : FONTS.body,
			fontSize: head ? 22 : 27,
			fontWeight: head ? 600 : 500,
			letterSpacing: head ? '0.08em' : '-0.005em',
			textTransform: head ? 'uppercase' : undefined,
			color: head ? COLORS.text3 : COLORS.white,
			...style,
		}}
	>
		{cells.map((c, i) => (
			<div key={i} style={{width: widths[i], flex: widths[i] === '*' ? 1 : undefined, padding: '0 10px', whiteSpace: 'nowrap', overflow: 'hidden'}}>
				{c}
			</div>
		))}
	</div>
);

/** Grey placeholder bar standing in for secondary text. */
export const Bar: React.FC<{w: number | string; h?: number; o?: number; style?: CSSProperties}> = ({w, h = 14, o = 0.12, style}) => (
	<div style={{width: w, height: h, borderRadius: h / 2, background: `rgba(255,255,255,${o})`, ...style}} />
);
