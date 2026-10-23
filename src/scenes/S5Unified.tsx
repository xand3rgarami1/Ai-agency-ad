import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../config/brand';
import {word} from '../config/timing';
import {EASE_IN_OUT, EASE_OUT, prog, reveal} from '../components/anim';
import {KineticWords, lineWords} from '../components/Text';
import {Icon, IconName} from '../ui/Icon';
import {Panel, Status} from '../ui/Panel';

const MODULES: {name: string; icon: IconName}[] = [
	{name: 'CRM', icon: 'contact'},
	{name: 'Orders', icon: 'order'},
	{name: 'Accounting', icon: 'invoice'},
	{name: 'Documents', icon: 'doc'},
];

const QUALITIES = [
	{label: 'Data sync', value: 'Real-time'},
	{label: 'Manual steps', value: 'Automated'},
	{label: 'Workflows', value: 'Active'},
];

// Smooth upward curve (no axis values: this is an illustration, not a claim).
const CHART_PTS = [0.08, 0.1, 0.16, 0.14, 0.22, 0.3, 0.28, 0.38, 0.5, 0.48, 0.62, 0.74, 0.86];

const Chart: React.FC<{p: number}> = ({p}) => {
	const W = 860;
	const H = 230;
	const pts = CHART_PTS.map((v, i) => ({x: (i / (CHART_PTS.length - 1)) * W, y: H - v * H}));
	const d = pts.reduce((acc, pt, i) => {
		if (i === 0) return `M${pt.x},${pt.y}`;
		const prev = pts[i - 1];
		const cx = (prev.x + pt.x) / 2;
		return `${acc} C${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
	}, '');
	return (
		<svg width={W} height={H + 10} style={{overflow: 'visible'}}>
			<defs>
				<linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.35} />
					<stop offset="100%" stopColor={COLORS.purple} stopOpacity={0} />
				</linearGradient>
				<clipPath id="reveal">
					<rect x={0} y={-20} width={W * p} height={H + 40} />
				</clipPath>
			</defs>
			{[0.25, 0.5, 0.75].map((g) => (
				<line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} />
			))}
			<g clipPath="url(#reveal)">
				<path d={`${d} L${W},${H} L0,${H} Z`} fill="url(#area)" />
				<path d={d} fill="none" stroke={COLORS.purpleBright} strokeWidth={5} strokeLinecap="round" />
			</g>
			{p > 0.02 ? (() => {
				const i = Math.min(pts.length - 1, Math.round(p * (pts.length - 1)));
				return <circle cx={W * p} cy={pts[i].y} r={9} fill="#fff" style={{filter: `drop-shadow(0 0 10px ${COLORS.purple})`}} />;
			})() : null}
		</svg>
	);
};

export const S5Unified: React.FC<{start: number}> = ({start}) => {
	const frame = useCurrentFrame();
	const tDesigned = word('designed', 0);
	const chart = prog(frame, tDesigned - 0.1, 1.4, EASE_IN_OUT);
	const stag = (i: number) => prog(frame, start + 0.08 + i * 0.07, 0.45, EASE_OUT);
	const head = {weight: 800, tracking: '-0.04em', lineHeight: 1.0, align: 'left' as const, motion: {y: 26, blur: 10}};
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 40% at 50% 62%, rgba(124,77,255,0.13) 0%, transparent 70%)'}} />
			<div style={{position: 'absolute', top: 180, left: 70, right: 70}}>
				<KineticWords words={lineWords('built', 0, 2)} size={100} {...head} />
				<KineticWords words={lineWords('built', 2)} size={100} {...head} />
				<KineticWords words={lineWords('designed', 0, 2)} size={100} {...head} color={COLORS.text2} />
				<KineticWords words={lineWords('designed', 2)} size={100} {...head} color={COLORS.purpleBright} />
			</div>

			<div style={{position: 'absolute', left: 60, top: 640, ...reveal(stag(0), {y: 80, blur: 14})}}>
				<Panel title="Operations" icon="grid" width={960} active={0.55} right={<Status label="All systems connected" on={1} />} bodyStyle={{display: 'flex', flexDirection: 'column', gap: 22}}>
					<div style={{display: 'flex', gap: 16}}>
						{MODULES.map((m, i) => (
							<div
								key={m.name}
								style={{
									flex: 1,
									borderRadius: 18,
									background: 'rgba(255,255,255,0.035)',
									border: `1px solid ${COLORS.border}`,
									padding: '18px 18px 16px',
									display: 'flex',
									flexDirection: 'column',
									gap: 12,
									...reveal(stag(i + 1), {y: 24, blur: 8}),
								}}
							>
								<Icon name={m.icon} size={34} color={COLORS.purpleBright} />
								<div style={{fontSize: 27, fontWeight: 600, whiteSpace: 'nowrap'}}>{m.name}</div>
								<Status label="Synced" on={1} style={{fontSize: 22}} />
							</div>
						))}
					</div>
					<div style={{borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.border}`, padding: '22px 26px 18px', ...reveal(stag(5), {y: 24, blur: 8})}}>
						<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18}}>
							<div style={{fontSize: 27, fontWeight: 600}}>Capacity</div>
							<div style={{fontFamily: FONTS.mono, fontSize: 22, color: COLORS.text3, letterSpacing: '0.1em'}}>LIVE</div>
						</div>
						<Chart p={chart} />
					</div>
					<div style={{display: 'flex', gap: 16}}>
						{QUALITIES.map((q, i) => (
							<div key={q.label} style={{flex: 1, borderRadius: 18, background: 'rgba(255,255,255,0.035)', border: `1px solid ${COLORS.border}`, padding: '18px 20px', ...reveal(stag(6 + i), {y: 24, blur: 8})}}>
								<div style={{fontSize: 22, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.text3}}>{q.label}</div>
								<div style={{fontSize: 30, fontWeight: 700, marginTop: 8}}>{q.value}</div>
							</div>
						))}
					</div>
				</Panel>
			</div>
		</AbsoluteFill>
	);
};
