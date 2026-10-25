import React, {CSSProperties} from 'react';
import {COLORS, FONTS} from '../config/brand';
import {Icon, IconName} from './Icon';

type Props = {
	title: string;
	icon?: IconName;
	/** right side of the header (badge, status) */
	right?: React.ReactNode;
	width: number;
	height?: number;
	/** 0..1 how "connected" the panel looks: purple border + glow */
	active?: number;
	style?: CSSProperties;
	bodyStyle?: CSSProperties;
	children?: React.ReactNode;
};

/** Software window used for every mock interface. */
export const Panel: React.FC<Props> = ({title, icon, right, width, height, active = 0, style, bodyStyle, children}) => {
	const border = active > 0 ? `rgba(139,92,246,${0.25 + active * 0.55})` : COLORS.border;
	return (
		<div
			style={{
				width,
				height,
				borderRadius: 26,
				background: 'linear-gradient(180deg, #15151D 0%, #0C0C11 100%)',
				border: `1.5px solid ${border}`,
				boxShadow: `0 40px 100px rgba(0,0,0,0.65), 0 0 ${active * 60}px rgba(139,92,246,${active * 0.35}), inset 0 1px 0 rgba(255,255,255,0.06)`,
				overflow: 'hidden',
				fontFamily: FONTS.body,
				color: COLORS.white,
				...style,
			}}
		>
			<div
				style={{
					height: 68,
					display: 'flex',
					alignItems: 'center',
					gap: 14,
					padding: '0 24px',
					borderBottom: `1px solid ${COLORS.border}`,
					background: 'rgba(255,255,255,0.025)',
				}}
			>
				{icon ? <Icon name={icon} size={30} color={active > 0.5 ? COLORS.purpleBright : COLORS.text2} /> : null}
				<div style={{fontSize: 28, fontWeight: 600, color: COLORS.white, letterSpacing: '-0.01em', flex: 1, whiteSpace: 'nowrap'}}>{title}</div>
				{right}
			</div>
			<div style={{padding: 24, ...bodyStyle}}>{children}</div>
		</div>
	);
};

export const Badge: React.FC<{children: React.ReactNode; tone?: 'neutral' | 'purple' | 'outline'; style?: CSSProperties}> = ({children, tone = 'neutral', style}) => (
	<div
		style={{
			fontFamily: FONTS.body,
			fontSize: 24,
			fontWeight: 600,
			padding: '6px 14px',
			borderRadius: 999,
			whiteSpace: 'nowrap',
			color: tone === 'purple' ? COLORS.white : COLORS.text2,
			background: tone === 'purple' ? COLORS.purple : tone === 'outline' ? 'transparent' : 'rgba(255,255,255,0.08)',
			border: tone === 'outline' ? `1.5px solid ${COLORS.borderStrong}` : '1.5px solid transparent',
			...style,
		}}
	>
		{children}
	</div>
);

/** Status dot + label (e.g. "Connected"). */
export const Status: React.FC<{label: string; on: number; style?: CSSProperties}> = ({label, on, style}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, fontWeight: 500, color: on > 0.5 ? COLORS.white : COLORS.text3, ...style}}>
		<div
			style={{
				width: 12,
				height: 12,
				borderRadius: 6,
				background: on > 0.5 ? COLORS.purple : 'rgba(255,255,255,0.25)',
				boxShadow: on > 0.5 ? `0 0 14px ${COLORS.purpleGlow}` : undefined,
			}}
		/>
		{label}
	</div>
);
