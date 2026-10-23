import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../config/brand';
import {cue, word} from '../config/timing';
import {EASE_IN_OUT, EASE_OUT, mix, prog, reveal, springAt} from '../components/anim';
import {Bezier, Connector, GlowDefs} from '../components/Connector';
import {KineticWords, lineWords} from '../components/Text';
import {Icon, IconName} from '../ui/Icon';
import {Panel, Status} from '../ui/Panel';

const NODE_W = 420;
const NODE_H = 250;
const HUB = {x: 540, y: 1035};

type NodeId = 'crm' | 'orders' | 'accounting' | 'docs';
const NODES: Record<NodeId, {title: string; icon: IconName; x: number; y: number; from: {x: number; y: number; rot: number}}> = {
	crm: {title: 'CRM', icon: 'contact', x: 70, y: 640, from: {x: 40, y: 560, rot: -6}},
	orders: {title: 'Orders', icon: 'order', x: 590, y: 640, from: {x: 640, y: 760, rot: 5}},
	accounting: {title: 'Accounting', icon: 'invoice', x: 70, y: 1180, from: {x: 20, y: 1240, rot: 4}},
	docs: {title: 'Documents', icon: 'doc', x: 590, y: 1180, from: {x: 620, y: 1100, rot: -5}},
};

/** Hand-tuned curves from each system into the hub. Parameter 0 = system, 1 = hub. */
const PATHS: Record<NodeId, Bezier> = {
	crm: [{x: 280, y: 890}, {x: 280, y: 1000}, {x: 380, y: 1035}, {x: 456, y: 1035}],
	orders: [{x: 800, y: 890}, {x: 800, y: 1000}, {x: 700, y: 1035}, {x: 624, y: 1035}],
	accounting: [{x: 280, y: 1180}, {x: 280, y: 1070}, {x: 380, y: 1035}, {x: 456, y: 1035}],
	docs: [{x: 800, y: 1180}, {x: 800, y: 1070}, {x: 700, y: 1035}, {x: 624, y: 1035}],
};

const Check: React.FC<{p: number; size?: number}> = ({p, size = 34}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: 9,
			flexShrink: 0,
			border: `2px solid ${p > 0 ? COLORS.purple : COLORS.text3}`,
			background: p > 0 ? COLORS.purple : 'transparent',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			transform: `scale(${p > 0 ? mix(0.7, 1, p) : 1})`,
			boxShadow: p > 0 ? `0 0 ${18 * p}px ${COLORS.purpleGlow}` : undefined,
		}}
	>
		{p > 0 ? <Icon name="check" size={size - 8} color="#fff" stroke={3} /> : null}
	</div>
);

const EventRow: React.FC<{t: number; frame: number; children: React.ReactNode}> = ({t, frame, children}) => {
	const p = prog(frame, t, 0.35, EASE_OUT);
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 27, fontWeight: 600, marginTop: 18, ...reveal(p, {y: 20, blur: 8})}}>
			<Check p={p} size={32} />
			{children}
		</div>
	);
};

export const S4System: React.FC<{start: number; end: number}> = ({start, end}) => {
	const frame = useCurrentFrame();
	const t = frame / 30;

	const tAlign = cue('s4.align');
	const tConnect = cue('s4.connect');
	const tOrder = cue('s4.order');
	const tFlow1 = cue('s4.flow1');
	const tFlow2 = cue('s4.flow2');
	const tDoc = cue('s4.doc');
	const tTasks = [cue('s4.task1'), cue('s4.task2'), cue('s4.task3'), cue('s4.task4')];
	const tScale = word('build', 15);
	const tAnd = word('build', 11);

	const align = springAt(frame, tAlign - 0.12, 20, 120);
	const connected = prog(frame, tConnect, 0.9, EASE_IN_OUT);
	const frameIn = prog(frame, tConnect + 0.3, 0.6, EASE_OUT);
	// Diagram shrinks up to make room for the automations list.
	const compact = prog(frame, tAnd - 0.25, 0.6, EASE_IN_OUT);
	const diagramScale = mix(1, 0.7, compact);
	const push = mix(1, 1.03, prog(frame, start, 5, (x) => x));

	// Data pulses: order travels Orders -> hub, then hub -> CRM / Accounting / Documents.
	const pIn = prog(frame, tOrder + 0.08, 0.38, EASE_IN_OUT);
	const pOut1 = prog(frame, tFlow1, 0.4, EASE_IN_OUT);
	const pOut2 = prog(frame, tFlow2, 0.4, EASE_IN_OUT);
	// After "scale": continuous stream of pulses on every path.
	const stream = (offset: number) => {
		if (t < tScale) return [];
		const ph = ((t - tScale) * 1.4 + offset) % 1;
		return [ph, (ph + 0.5) % 1];
	};
	const pulses: Record<NodeId, number[]> = {
		orders: [pIn > 0 && pIn < 1 ? pIn : -1, ...stream(0)],
		crm: [pOut1 > 0 && pOut1 < 1 ? 1 - pOut1 : -1, ...stream(0.25).map((x) => 1 - x)],
		accounting: [pOut2 > 0 && pOut2 < 1 ? 1 - pOut2 : -1, ...stream(0.5).map((x) => 1 - x)],
		docs: [pOut1 > 0 && pOut1 < 1 ? 1 - pOut1 : -1, ...stream(0.75).map((x) => 1 - x)],
	};
	const hubFlash = Math.max(prog(frame, tOrder + 0.46, 0.3) * (1 - prog(frame, tOrder + 0.76, 0.4)), 0);
	const orderNo = t < tScale ? 10482 : 10482 + Math.floor((t - tScale) * 6);

	const nodeBody = (id: NodeId) => {
		const on = connected;
		switch (id) {
			case 'crm':
				return (
					<>
						<Status label={on > 0.5 ? 'Connected' : 'Not connected'} on={on} />
						{t >= tFlow1 + 0.3 ? <EventRow t={tFlow1 + 0.3} frame={frame}>Record updated</EventRow> : null}
					</>
				);
			case 'orders':
				return (
					<>
						<Status label={on > 0.5 ? 'Connected' : 'Not connected'} on={on} />
						{t >= tOrder ? (
							<EventRow t={tOrder} frame={frame}>
								<span style={{fontFamily: FONTS.mono, fontWeight: 500}}>#{orderNo}</span> captured
							</EventRow>
						) : null}
					</>
				);
			case 'accounting':
				return (
					<>
						<Status label={on > 0.5 ? 'Connected' : 'Not connected'} on={on} />
						{t >= tFlow2 + 0.3 ? <EventRow t={tFlow2 + 0.3} frame={frame}>Invoice created</EventRow> : null}
					</>
				);
			case 'docs': {
				const scan = prog(frame, tDoc - 0.1, 0.55, EASE_IN_OUT);
				return (
					<>
						<Status label={on > 0.5 ? 'Connected' : 'Not connected'} on={on} />
						{t >= tDoc - 0.1 ? (
							<div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 16}}>
								<div style={{position: 'relative', width: 54, height: 66, borderRadius: 8, background: '#22222C', border: `1px solid ${COLORS.borderStrong}`, overflow: 'hidden'}}>
									{[14, 26, 38, 50].map((y) => (
										<div key={y} style={{position: 'absolute', left: 10, right: 10, top: y, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)'}} />
									))}
									<div style={{position: 'absolute', left: 0, right: 0, top: scan * 66 - 3, height: 4, background: COLORS.purpleBright, boxShadow: `0 0 12px ${COLORS.purple}`, opacity: scan < 1 ? 1 : 0}} />
								</div>
								<div style={{fontSize: 27, fontWeight: 600, ...reveal(prog(frame, tDoc + 0.35, 0.35), {y: 12, blur: 6})}}>PO processed</div>
							</div>
						) : null}
					</>
				);
			}
		}
	};

	const ids = Object.keys(NODES) as NodeId[];

	return (
		<AbsoluteFill style={{transform: `scale(${push})`}}>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 70% 32% at 50% 54%, rgba(124,77,255,${0.16 * connected}) 0%, transparent 70%)`}} />

			{/* ---------- diagram ---------- */}
			<AbsoluteFill style={{transformOrigin: '540px 560px', transform: `translateY(${-40 * compact}px) scale(${diagramScale})`}}>
				{/* system frame: one connected operation, not a pile of tools */}
				<div
					style={{
						position: 'absolute',
						left: 40,
						top: 606,
						width: 1000,
						height: 858,
						borderRadius: 40,
						border: `1.5px solid rgba(139,92,246,${0.45 * frameIn})`,
						background: `rgba(139,92,246,${0.035 * frameIn})`,
						opacity: frameIn,
					}}
				/>
				<div style={{position: 'absolute', top: 586, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: frameIn}}>
					<div style={{fontFamily: FONTS.mono, fontSize: 26, letterSpacing: '0.16em', color: COLORS.purpleBright, background: '#000', padding: '4px 22px'}}>
						ONE CONNECTED SYSTEM
					</div>
				</div>

				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					<GlowDefs />
					{ids.map((id, i) => (
						<Connector key={id} path={PATHS[id]} draw={prog(frame, tConnect + i * 0.1, 0.6, EASE_IN_OUT)} pulses={pulses[id]} width={5} />
					))}
				</svg>

				{/* hub */}
				<div
					style={{
						position: 'absolute',
						left: HUB.x - 84,
						top: HUB.y - 84,
						width: 168,
						height: 168,
						borderRadius: 84,
						background: 'radial-gradient(circle at 50% 35%, #2A1C55 0%, #0E0B18 70%)',
						border: `3px solid ${COLORS.purple}`,
						boxShadow: `0 0 ${50 + hubFlash * 60}px rgba(139,92,246,${0.45 + hubFlash * 0.4})`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: FONTS.display,
						fontWeight: 800,
						fontSize: 54,
						letterSpacing: '-0.02em',
						...reveal(springAt(frame, tConnect - 0.2, 14, 160), {y: 0, blur: 12, scale: 0.4}),
					}}
				>
					AI
				</div>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: connected}}>
					<circle cx={HUB.x} cy={HUB.y} r={112} fill="none" stroke={COLORS.purpleBright} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="6 14" transform={`rotate(${frame * 0.8} ${HUB.x} ${HUB.y})`} />
				</svg>

				{ids.map((id, i) => {
					const n = NODES[id];
					const x = mix(n.from.x, n.x, align);
					const y = mix(n.from.y, n.y, align);
					const rot = mix(n.from.rot, 0, align);
					const pin = prog(frame, start + 0.04 * i, 0.35, EASE_OUT);
					return (
						<div key={id} style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, ...reveal(pin, {y: 0, blur: 14, scale: 1.08})}}>
							<Panel title={n.title} icon={n.icon} width={NODE_W} height={NODE_H} active={connected} bodyStyle={{padding: '22px 26px'}}>
								{nodeBody(id)}
							</Panel>
						</div>
					);
				})}
			</AbsoluteFill>

			{/* ---------- automations list ---------- */}
			<div style={{position: 'absolute', left: 60, top: 1170, ...reveal(prog(frame, tAnd - 0.05, 0.45, EASE_OUT), {y: 60, blur: 12})}}>
				<Panel
					title="Automations"
					icon="tasks"
					width={960}
					active={0.4}
					right={<Status label="Running" on={1} />}
					bodyStyle={{padding: '8px 26px 14px'}}
				>
					{['Order confirmed', 'Inventory updated', 'Invoice sent', 'Team notified'].map((label, i) => {
						const p = prog(frame, tTasks[i], 0.3, EASE_OUT);
						return (
							<div key={label} style={{display: 'flex', alignItems: 'center', gap: 18, height: 66, borderBottom: i < 3 ? `1px solid ${COLORS.border}` : 'none', fontSize: 29, fontWeight: 500}}>
								<Check p={p} />
								<div style={{flex: 1, color: p > 0 ? COLORS.white : COLORS.text2}}>{label}</div>
								<div style={{fontSize: 22, fontWeight: 600, letterSpacing: '0.08em', color: p > 0 ? COLORS.purpleBright : COLORS.text4}}>{p > 0 ? 'AUTO' : 'QUEUED'}</div>
							</div>
						);
					})}
				</Panel>
			</div>

			{/* ---------- headlines (top band) ---------- */}
			<Headlines tConnect={tConnect} tAutomate={word('build', 9)} tAnd={tAnd} tScale={tScale} />
		</AbsoluteFill>
	);
};

const Headlines: React.FC<{tConnect: number; tAutomate: number; tAnd: number; tScale: number}> = ({tConnect, tAutomate, tAnd, tScale}) => {
	const W = (from: number, to?: number, upper = true) => lineWords('build', from, to, upper ? (s) => s.toUpperCase().replace(/,$/, '') : undefined);
	const box: React.CSSProperties = {position: 'absolute', top: 190, left: 60, right: 60};
	const heavy = {weight: 900, tracking: '-0.04em', lineHeight: 0.98, motion: {y: 50, blur: 18}};
	return (
		<>
			<div style={box}>
				<KineticWords words={W(0, 2, false)} size={60} weight={600} color={COLORS.text2} outAt={tConnect - 0.28} />
				<KineticWords words={W(2, 3)} size={124} {...heavy} outAt={tConnect - 0.28} />
				<KineticWords
					words={W(3, 5).map((w, i) => (i === 0 ? {...w, style: {color: COLORS.purpleBright}} : w))}
					size={124}
					{...heavy}
					outAt={tConnect - 0.28}
				/>
			</div>
			<div style={box}>
				<KineticWords words={W(5, 6, false)} size={60} weight={600} color={COLORS.text2} outAt={tAutomate - 0.25} lead={0.12} />
				<KineticWords words={W(6, 8)} size={112} {...heavy} outAt={tAutomate - 0.25} />
				<KineticWords words={W(8, 9)} size={112} {...heavy} color={COLORS.purpleBright} outAt={tAutomate - 0.25} />
			</div>
			<div style={{...box, top: 230}}>
				<KineticWords words={W(9, 10)} size={124} {...heavy} outAt={tAnd - 0.25} />
				<KineticWords words={W(10, 11)} size={124} {...heavy} color={COLORS.purpleBright} outAt={tAnd - 0.25} />
			</div>
			<div style={{...box, top: 170}}>
				<KineticWords words={W(11, 15, false)} size={56} weight={600} color={COLORS.text2} />
				<KineticWords words={W(15, 16)} size={150} {...heavy} color={COLORS.purpleBright} />
				<KineticWords words={W(16, 18, false)} size={64} weight={700} tracking="-0.02em" lead={0.1} />
				<KineticWords words={W(18, 20, false)} size={64} weight={700} tracking="-0.02em" lead={0.1} />
			</div>
		</>
	);
};
