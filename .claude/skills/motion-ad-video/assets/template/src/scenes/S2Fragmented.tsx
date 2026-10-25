import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, TYPE} from '../config/brand';
import {cue, word} from '../config/timing';
import {EASE_OUT, mix, prog, reveal} from '../components/anim';
import {Connector, curve, GlowDefs} from '../components/Connector';
import {KineticWords, lineWords, Slam} from '../components/Text';
import {Icon} from '../ui/Icon';
import {Badge, Panel} from '../ui/Panel';
import {Row} from '../ui/Rows';

const W = 600;

const Sheet = () => (
	<Panel title="Orders_FINAL_v3.xlsx" icon="grid" width={W} right={<Badge>Edited</Badge>}>
		<Row head widths={[150, 200, '*']} cells={['Order', 'Account', 'Status']} />
		<Row mono widths={[150, 200, '*']} cells={['10471', 'Wholesale', 'Pending']} />
		<Row mono widths={[150, 200, '*']} cells={['10472', 'Retail', 'Re-entered']} />
		<Row mono widths={[150, 200, '*']} cells={['10472', 'Retail', 'Duplicate']} style={{background: 'rgba(255,255,255,0.06)', color: COLORS.text2}} />
		<Row mono widths={[150, 200, '*']} cells={['10473', 'Hotel', 'Missing info']} style={{borderBottom: 'none'}} />
	</Panel>
);

const Crm: React.FC<{errorAt: number}> = ({errorAt}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, errorAt, 0.35);
	return (
		<div style={{position: 'relative'}}>
			<Panel title="CRM · Contacts" icon="contact" width={W - 40}>
				<Row head widths={['*', 170]} cells={['Contact', 'Owner']} />
				<Row widths={['*', 170]} cells={['New inquiry', '—']} />
				<Row widths={['*', 170]} cells={['Quote request', '—']} />
				<Row widths={['*', 170]} cells={['Follow-up overdue', '—']} style={{borderBottom: 'none'}} />
			</Panel>
			<div style={{position: 'absolute', right: -18, top: -30, ...reveal(p, {y: 16, blur: 6, scale: 0.85})}}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 10,
						padding: '12px 20px',
						borderRadius: 16,
						background: '#1D1D26',
						border: `1.5px solid ${COLORS.borderStrong}`,
						fontSize: 26,
						fontWeight: 600,
						color: COLORS.white,
						boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
					}}
				>
					<Icon name="warning" size={28} color={COLORS.white} />
					Sync failed
				</div>
			</div>
		</div>
	);
};

const Inbox = () => (
	<Panel title="Inbox" icon="mail" width={W - 20} right={<Badge tone="outline">37 unread</Badge>}>
		{['Where is my order?', 'Re: Re: Updated quote', 'Can you resend the invoice?'].map((s, i) => (
			<div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, height: 62, borderBottom: i < 2 ? `1px solid ${COLORS.border}` : 'none', fontSize: 27, fontWeight: 500}}>
				<div style={{width: 12, height: 12, borderRadius: 6, background: COLORS.white, opacity: 0.8}} />
				{s}
			</div>
		))}
	</Panel>
);

const Invoices = () => (
	<Panel title="Accounting · Invoices" icon="invoice" width={W - 20}>
		<Row mono widths={[220, '*']} cells={['INV-2201', 'Draft']} />
		<Row mono widths={[220, '*']} cells={['INV-2202', 'Not sent']} />
		<div style={{marginTop: 18, fontSize: 25, fontWeight: 600, color: COLORS.text2, display: 'flex', gap: 12, alignItems: 'center'}}>
			<Icon name="doc" size={26} color={COLORS.text2} />
			Manual export required
		</div>
	</Panel>
);

const PANELS = [
	{node: 'sheet', x: 40, y: 360, rot: -3.5, delay: 0.1},
	{node: 'crm', x: 500, y: 790, rot: 3, delay: 0.28},
	{node: 'inbox', x: 40, y: 1060, rot: 2.2, delay: 0.46},
	{node: 'inv', x: 480, y: 1330, rot: -2.6, delay: 0.64},
] as const;

export const S2Fragmented: React.FC<{start: number}> = ({start}) => {
	const frame = useCurrentFrame();
	const tHold = word('holding', 10);
	const heavy = prog(frame, tHold - 0.05, 0.5, EASE_OUT);

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: mix(1, 0.4, heavy), filter: heavy > 0 ? `blur(${heavy * 3}px)` : undefined, transform: `translateY(${heavy * 30}px) scale(${mix(1, 0.97, heavy)})`}}>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					<GlowDefs />
					{/* Broken links between systems: dashed, never meeting. */}
					<Connector dashed path={curve({x: 400, y: 760}, {x: 560, y: 880}, 'y')} draw={1} opacity={prog(frame, start + 0.6, 0.3)} />
					<Connector dashed path={curve({x: 600, y: 1130}, {x: 500, y: 1180}, 'x')} draw={1} opacity={prog(frame, start + 0.75, 0.3)} />
					<Connector dashed path={curve({x: 380, y: 1370}, {x: 520, y: 1440}, 'x')} draw={1} opacity={prog(frame, start + 0.9, 0.3)} />
				</svg>
				{PANELS.map((p, i) => {
					const pin = prog(frame, start + p.delay, 0.45, EASE_OUT);
					const drift = Math.sin((frame + i * 23) / 26) * 6;
					const errorAt = cue('s2.error');
					const node = p.node === 'sheet' ? <Sheet /> : p.node === 'crm' ? <Crm errorAt={errorAt} /> : p.node === 'inbox' ? <Inbox /> : <Invoices />;
					return (
						<div
							key={p.node}
							style={{
								position: 'absolute',
								left: p.x,
								top: p.y + drift,
								transform: `rotate(${p.rot}deg)`,
								...reveal(pin, {y: 70, blur: 16, scale: 0.92}),
							}}
						>
							{node}
						</div>
					);
				})}
			</AbsoluteFill>

			<div style={{position: 'absolute', top: 170, left: 70, right: 70}}>
				<KineticWords words={lineWords('holding', 0, 7)} size={TYPE.lead} weight={600} color={COLORS.white} lead={0.1} />
				<KineticWords words={lineWords('holding', 7, 10)} size={TYPE.lead} weight={600} color={COLORS.text2} lead={0.1} />
			</div>

			<AbsoluteFill style={{background: `linear-gradient(180deg, transparent 62%, rgba(0,0,0,${0.92 * heavy}) 76%)`}} />
			<div style={{position: 'absolute', top: 1290, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
				<Slam text="HOLDING" t={tHold} size={TYPE.h1 + 36} />
				<div style={{display: 'flex', gap: 34}}>
					<Slam text="YOU" t={word('holding', 11)} size={TYPE.h1 + 36} />
					<Slam text="BACK." t={word('holding', 12)} size={TYPE.h1 + 36} color={COLORS.purpleBright} />
				</div>
			</div>
		</AbsoluteFill>
	);
};
