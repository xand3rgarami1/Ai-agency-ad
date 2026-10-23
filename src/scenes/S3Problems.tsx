import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../config/brand';
import {cue, cueDef} from '../config/timing';
import {EASE_IN, EASE_OUT, mix, prog, rand, reveal} from '../components/anim';
import {StackHeadline} from '../components/StackHeadline';
import {lineWords} from '../components/Text';
import {Badge, Panel} from '../ui/Panel';
import {Bar} from '../ui/Rows';

/* ---------- 3a: a lead lands in the pipeline and nobody picks it up ---------- */

const Card: React.FC<{lines: [number, number]; style?: React.CSSProperties}> = ({lines, style}) => (
	<div style={{borderRadius: 16, background: '#17171F', border: `1px solid ${COLORS.border}`, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, ...style}}>
		<Bar w={lines[0]} h={16} o={0.22} />
		<Bar w={lines[1]} h={14} o={0.1} />
	</div>
);

export const S3aLeads: React.FC<{start: number; end: number}> = ({start, end}) => {
	const frame = useCurrentFrame();
	const drop = cue('s3a.drop');
	const slip = cue('s3a.slip');
	const pin = prog(frame, drop, 0.35, EASE_OUT);
	const fall = prog(frame, slip, 0.55, EASE_IN);
	const hours = Math.round(mix(0, 72, prog(frame, drop + 0.15, slip - drop - 0.1, (x) => x)));
	const colW = 282;
	return (
		<AbsoluteFill>
			<StackHeadline index="01 / 03" lines={[lineWords('leads', 0, 1), lineWords('leads', 1, 2), lineWords('leads', 2)]} />
			<div style={{position: 'absolute', left: 60, top: 640, ...reveal(prog(frame, start, 0.35), {y: 50, blur: 10})}}>
				<Panel title="Sales pipeline" icon="pipeline" width={960} height={720} bodyStyle={{display: 'flex', gap: 18, height: 650, position: 'relative'}}>
					{['New', 'Contacted', 'Proposal'].map((c, i) => (
						<div key={c} style={{width: colW, display: 'flex', flexDirection: 'column', gap: 14}}>
							<div style={{fontSize: 24, fontWeight: 600, color: COLORS.text3, letterSpacing: '0.08em', textTransform: 'uppercase', paddingBottom: 6}}>{c}</div>
							{i === 1 ? (
								<>
									<Card lines={[180, 120]} />
									<Card lines={[150, 100]} />
								</>
							) : null}
							{i === 2 ? <Card lines={[170, 90]} /> : null}
							{i === 0 ? (
								<div
									style={{
										borderRadius: 16,
										background: '#1E1E28',
										border: `1.5px solid ${COLORS.borderStrong}`,
										padding: 18,
										display: 'flex',
										flexDirection: 'column',
										gap: 10,
										...reveal(pin, {y: -90, blur: 10}),
										transform: `translateY(${(1 - pin) * -90 + fall * 620}px) rotate(${fall * 9}deg)`,
										opacity: Math.min(1, pin * 1.6) * (1 - fall * 0.9),
										filter: fall > 0 ? `blur(${fall * 10}px)` : undefined,
									}}
								>
									<div style={{fontSize: 28, fontWeight: 700}}>New inquiry</div>
									<div style={{fontSize: 24, color: COLORS.text2}}>Quote request</div>
									<div style={{display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap'}}>
										<Badge style={{fontSize: 22}}>Unassigned</Badge>
									</div>
									<div style={{fontFamily: FONTS.mono, fontSize: 24, color: COLORS.white, marginTop: 4}}>Waiting {hours}h</div>
								</div>
							) : null}
						</div>
					))}
				</Panel>
			</div>
		</AbsoluteFill>
	);
};

/* ---------- 3b: the same order typed into three systems ---------- */

const FIELDS = [
	{label: 'Order #', value: '10482', w: 180},
	{label: 'Item', value: 'Bottled water, 24 pk', w: 420},
	{label: 'Qty', value: '40 cases', w: 200},
];
const TOTAL_CHARS = FIELDS.reduce((a, f) => a + f.value.length, 0);
const SYSTEMS = [
	{title: 'Sales order', icon: 'order' as const},
	{title: 'Accounting', icon: 'invoice' as const},
	{title: 'Inventory', icon: 'box' as const},
];

export const S3bOrders: React.FC<{start: number}> = ({start}) => {
	const frame = useCurrentFrame();
	const def = cueDef('s3b.typing');
	const t0 = cue('s3b.typing');
	const per = (def.dur ?? 1.4) / SYSTEMS.length;
	return (
		<AbsoluteFill>
			<StackHeadline index="02 / 03" lines={[lineWords('orders', 0, 1), lineWords('orders', 1, 2), lineWords('orders', 2)]} />
			{SYSTEMS.map((s, i) => {
				const ts = t0 + i * per;
				const pin = prog(frame, ts - 0.12, 0.3, EASE_OUT);
				const typed = Math.floor(TOTAL_CHARS * prog(frame, ts, per * 0.92, (x) => x));
				return (
					<div key={s.title} style={{position: 'absolute', left: 60, top: 640 + i * 250, ...reveal(pin, {y: 40, blur: 10})}}>
						<Panel
							title={s.title}
							icon={s.icon}
							width={960}
							right={i > 0 ? <Badge tone="outline">Entered again · {i + 1}×</Badge> : <Badge>Manual entry</Badge>}
							bodyStyle={{display: 'flex', gap: 20, paddingTop: 20, paddingBottom: 26}}
						>
							{FIELDS.map((f, fi) => {
								const before = FIELDS.slice(0, fi).reduce((a, x) => a + x.value.length, 0);
								const n = Math.max(0, Math.min(f.value.length, typed - before));
								const caret = typed < TOTAL_CHARS && pin > 0.5 && typed >= before && typed < before + f.value.length;
								return (
									<div key={f.label} style={{width: f.w}}>
										<div style={{fontSize: 22, fontWeight: 600, color: COLORS.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10}}>{f.label}</div>
										<div
											style={{
												height: 62,
												borderRadius: 12,
												border: `1.5px solid ${caret ? COLORS.white : COLORS.border}`,
												background: 'rgba(255,255,255,0.04)',
												display: 'flex',
												alignItems: 'center',
												padding: '0 14px',
												fontFamily: FONTS.mono,
												fontSize: 27,
												whiteSpace: 'nowrap',
												overflow: 'hidden',
											}}
										>
											{f.value.slice(0, n)}
											{caret ? <span style={{width: 3, height: 32, background: COLORS.white, marginLeft: 2}} /> : null}
										</div>
									</div>
								);
							})}
						</Panel>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/* ---------- 3c: repetitive admin piles up ---------- */

const TASKS = [
	'Re-key order into accounting',
	'Update inventory sheet',
	'Send order confirmation',
	'Copy lead into CRM',
	'Chase missing PO',
	'Reconcile invoices',
	'Export weekly report',
	'Re-send invoice copy',
	'Update order status',
	'Follow up on quote',
	'Merge duplicate records',
];
const ROW_H = 76;

export const S3cTeam: React.FC<{start: number; end: number}> = ({start, end}) => {
	const frame = useCurrentFrame();
	const def = cueDef('s3c.stack');
	const t0 = cue('s3c.stack');
	const dur = def.dur ?? 2;
	// accelerating arrivals: t_i = t0 + dur * (i/n)^0.8
	const arrivals = TASKS.map((_, i) => t0 + dur * Math.pow(i / (TASKS.length - 1), 0.8));
	const t = frame / 30;
	const count = arrivals.filter((a) => t >= a).length;
	const pressure = prog(frame, end - 0.75, 0.75, EASE_IN);
	const shakeX = pressure * (rand(frame) - 0.5) * 14;
	const shakeY = pressure * (rand(frame + 99) - 0.5) * 14;
	return (
		<AbsoluteFill style={{transform: `translate(${shakeX}px, ${shakeY}px) scale(${mix(1, 1.08, pressure)})`}}>
			<StackHeadline
				index="03 / 03"
				size={112}
				lines={[lineWords('team', 0, 2), lineWords('team', 2, 4), lineWords('team', 4, 5), lineWords('team', 5)]}
			/>
			<div style={{position: 'absolute', left: 60, top: 720, ...reveal(prog(frame, start, 0.35), {y: 50, blur: 10})}}>
				<Panel
					title="Ops team · Tasks"
					icon="tasks"
					width={960}
					height={760}
					right={<Badge tone="outline">{count + 26} open</Badge>}
					bodyStyle={{position: 'relative', height: 690, padding: 0}}
				>
					{TASKS.map((task, i) => {
						const p = prog(frame, arrivals[i], 0.28, EASE_OUT);
						if (p <= 0) return null;
						// rows that arrived later sit on top and push older rows down
						const above = arrivals.filter((a, j) => j > i && t >= a).reduce((acc, a) => acc + prog(frame, a, 0.28, EASE_OUT), 0);
						return (
							<div
								key={task}
								style={{
									position: 'absolute',
									left: 0,
									right: 0,
									top: 10 + above * ROW_H,
									height: ROW_H,
									display: 'flex',
									alignItems: 'center',
									gap: 20,
									padding: '0 26px',
									borderBottom: `1px solid ${COLORS.border}`,
									fontSize: 29,
									fontWeight: 500,
									...reveal(p, {y: -40, blur: 8}),
								}}
							>
								<div style={{width: 30, height: 30, borderRadius: 8, border: `2px solid ${COLORS.text3}`}} />
								<div style={{flex: 1}}>{task}</div>
								<div style={{fontSize: 22, fontWeight: 600, color: COLORS.text3, letterSpacing: '0.08em'}}>MANUAL</div>
							</div>
						);
					})}
					<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 180, background: 'linear-gradient(180deg, transparent, #0C0C11)'}} />
				</Panel>
			</div>
		</AbsoluteFill>
	);
};
