import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, COLORS, FONTS} from '../config/brand';
import {cue, FPS, sceneStart, voLine, word} from '../config/timing';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, mix, prog, reveal, springAt} from '../components/anim';
import {Connector, GlowDefs} from '../components/Connector';
import {KineticWords, lineWords, Slam} from '../components/Text';
import {Icon, IconName} from '../ui/Icon';
import {Badge, Panel, Status} from '../ui/Panel';

const heavy = {weight: 900, tracking: '-0.04em', lineHeight: 0.98, motion: {y: 50, blur: 18}};
const upper = (s: string) => s.toUpperCase();

/* ---------------- 1. Hook: a call rings out and goes to someone else ---------------- */

export const S1Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const tMissed = cue('s1.missed');
	const tAway = cue('s1.away');
	const missed = prog(frame, tMissed, 0.3);
	const away = prog(frame, tAway, 0.7, EASE_IN);
	const ringing = 1 - missed;
	const ring = (k: number) => ((frame / FPS + k * 0.33) % 1) * ringing;
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 200, left: 60, right: 60}}>
				<KineticWords words={lineWords('hook', 0, 3, upper)} size={128} {...heavy} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: 140,
					top: 700,
					width: 800,
					transform: `translateX(${away * 900}px) rotate(${away * 8}deg)`,
					opacity: 1 - away * 0.6,
					filter: away > 0 ? `blur(${away * 12}px)` : undefined,
				}}
			>
				{[0, 1, 2].map((k) => (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: 400 - 110,
							top: 70,
							width: 220,
							height: 220,
							borderRadius: 110,
							border: `3px solid rgba(255,255,255,${0.5 * (1 - ring(k))})`,
							transform: `scale(${1 + ring(k) * 1.4})`,
							opacity: ringing,
						}}
					/>
				))}
				<div
					style={{
						position: 'relative',
						borderRadius: 36,
						background: 'linear-gradient(180deg, #17171F, #0C0C11)',
						border: `1.5px solid ${COLORS.borderStrong}`,
						padding: '44px 40px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 18,
						boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
						...reveal(prog(frame, 0, 0.35), {y: 40, blur: 12, scale: 0.94}),
					}}
				>
					<div style={{width: 130, height: 130, borderRadius: 65, background: missed > 0.5 ? '#2A2A33' : '#1F1F28', border: `2px solid ${COLORS.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name={missed > 0.5 ? 'missed' : 'phone'} size={64} color={COLORS.white} />
					</div>
					<div style={{fontFamily: FONTS.mono, fontSize: 28, letterSpacing: '0.14em', color: COLORS.text3}}>{missed > 0.5 ? 'MISSED CALL' : 'INCOMING CALL'}</div>
					<div style={{fontFamily: FONTS.display, fontSize: 60, fontWeight: 800, letterSpacing: '-0.02em'}}>New customer</div>
					<div style={{fontSize: 30, color: COLORS.text2, height: 40}}>{missed > 0.5 ? 'No answer' : 'Ringing…'}</div>
				</div>
			</div>
			<div style={{position: 'absolute', top: 1260, left: 60, right: 60}}>
				<KineticWords words={lineWords('hook', 3, 6)} size={72} weight={700} color={COLORS.text2} tracking="-0.02em" />
				<KineticWords words={lineWords('hook', 6, 9, upper)} size={118} {...heavy} />
			</div>
		</AbsoluteFill>
	);
};

/* ---------------- 2. Why calls get missed: a call log fills up ---------------- */

const MISSED = [
	{line: 'hours', time: '9:47 PM', note: 'After hours', icon: 'clock' as IconName},
	{line: 'line', time: '11:12 AM', note: 'Line busy', icon: 'phone' as IconName},
	{line: 'busy', time: '12:30 PM', note: 'No answer', icon: 'missed' as IconName},
];

const CallRow: React.FC<{time: string; note: string; icon: IconName; p: number; tag?: React.ReactNode; dim?: number}> = ({time, note, icon, p, tag, dim = 0}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 20,
			height: 96,
			padding: '0 26px',
			borderBottom: `1px solid ${COLORS.border}`,
			opacity: 1 - dim * 0.5,
			...reveal(p, {y: -30, blur: 8}),
		}}
	>
		<div style={{width: 58, height: 58, borderRadius: 29, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Icon name="missed" size={30} color={COLORS.white} />
		</div>
		<div style={{flex: 1}}>
			<div style={{fontSize: 30, fontWeight: 600}}>Missed call</div>
			<div style={{fontSize: 24, color: COLORS.text3, display: 'flex', alignItems: 'center', gap: 8, marginTop: 4}}>
				<Icon name={icon} size={22} color={COLORS.text3} />
				{note}
			</div>
		</div>
		{tag ?? <div style={{fontFamily: FONTS.mono, fontSize: 26, color: COLORS.text2}}>{time}</div>}
	</div>
);

export const S2Reasons: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const outs = [word('line', 0) - 0.2, word('busy', 0) - 0.2, undefined];
	const count = MISSED.filter((m) => t >= voLine(m.line).start).length;
	return (
		<AbsoluteFill>
			{MISSED.map((m, i) => (
				<div key={m.line} style={{position: 'absolute', top: 260, left: 60, right: 60}}>
					<KineticWords words={lineWords(m.line, 0, undefined, upper)} size={i === 2 ? 112 : 128} {...heavy} outAt={outs[i]} />
				</div>
			))}
			<div style={{position: 'absolute', left: 60, top: 640, ...reveal(prog(frame, sceneStart('fragmented'), 0.35), {y: 40, blur: 10})}}>
				<Panel title="Recent calls" icon="phone" width={960} right={<Badge tone="outline">{count} missed</Badge>} bodyStyle={{padding: 0, minHeight: 300}}>
					{[...MISSED].reverse().map((m) => {
						const p = prog(frame, cue(`s2.row${MISSED.indexOf(m) + 1}`) - 0.05, 0.35);
						return p > 0 ? <CallRow key={m.line} {...m} p={p} /> : null;
					})}
				</Panel>
			</div>
		</AbsoluteFill>
	);
};

/* ---------------- 3. Each missed call has a value ---------------- */

const VALUES = [
	{label: 'Sale', cue: 's3.sale', word: 5},
	{label: 'Booking', cue: 's3.booking', word: 7},
	{label: 'Contract', cue: 's3.contract', word: 10},
];

export const S3Value: React.FC<{end: number}> = ({end}) => {
	const frame = useCurrentFrame();
	const pressure = prog(frame, end - 0.6, 0.6, EASE_IN);
	return (
		<AbsoluteFill style={{transform: `scale(${mix(1, 1.06, pressure)})`}}>
			<div style={{position: 'absolute', top: 200, left: 60, right: 60}}>
				<KineticWords words={lineWords('value', 0, 4)} size={72} weight={700} color={COLORS.text2} tracking="-0.02em" />
				{VALUES.map((v) => (
					<KineticWords
						key={v.label}
						words={lineWords('value', v.word === 5 ? 4 : v.word - 1, v.word + 1, upper).map((w) => ({...w, text: w.text.replace(/[,.]/g, '')}))}
						size={112}
						{...heavy}
					/>
				))}
			</div>
			<div style={{position: 'absolute', left: 60, top: 860}}>
				<Panel title="Recent calls" icon="phone" width={960} right={<Badge tone="outline">3 missed</Badge>} bodyStyle={{padding: 0}}>
					{[...MISSED].reverse().map((m, i) => {
						const v = VALUES[i];
						const p = prog(frame, cue(v.cue), 0.3);
						return (
							<CallRow
								key={m.line}
								{...m}
								p={1}
								tag={
									<div style={{...reveal(p, {x: 30, y: 0, blur: 6, scale: 0.9}), display: 'flex', alignItems: 'center', gap: 12}}>
										<Badge tone="outline" style={{fontSize: 26, color: COLORS.white}}>
											{v.label}
										</Badge>
										<div style={{fontFamily: FONTS.mono, fontSize: 22, color: COLORS.text3, letterSpacing: '0.1em'}}>LOST</div>
									</div>
								}
							/>
						);
					})}
				</Panel>
			</div>
		</AbsoluteFill>
	);
};

/* ---------------- 4. The system: answer, text back, book ---------------- */

export const S4System: React.FC = () => {
	const frame = useCurrentFrame();
	const tAnswer = cue('s4.answer');
	const tText = cue('s4.text');
	const tBook = cue('s4.book');
	const tConnect = cue('s4.connect');
	const pA = prog(frame, tAnswer, 0.35);
	const pT = prog(frame, tText, 0.45);
	const pB = prog(frame, tBook, 0.35);
	const draw1 = prog(frame, tConnect, 0.9, EASE_IN_OUT);
	const draw2 = prog(frame, tText - 0.1, 0.6, EASE_IN_OUT);
	const draw3 = prog(frame, tBook - 0.25, 0.5, EASE_IN_OUT);
	const pulseA = prog(frame, tText - 0.35, 0.4, EASE_IN_OUT);
	const pulseB = prog(frame, tBook - 0.35, 0.4, EASE_IN_OUT);
	const node = (p: number, i: number) => reveal(prog(frame, sceneStart('system') + 0.05 + i * 0.08, 0.4), {y: 40, blur: 12});
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 70% 40% at 50% 60%, rgba(124,77,255,${0.14 * draw1}) 0%, transparent 70%)`}} />
			<div style={{position: 'absolute', top: 180, left: 60, right: 60, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 34}}>
				<Slam text="ANSWERS." t={word('system', 6)} size={104} />
				<Slam text="TEXTS BACK." t={word('system', 7)} size={104} color={COLORS.purpleBright} />
				<Slam text="BOOKS." t={word('system', 10)} size={104} />
			</div>
			<div style={{position: 'absolute', top: 1470, left: 60, right: 60}}>
				<KineticWords words={lineWords('system', 11)} size={52} weight={600} color={COLORS.text2} tracking="-0.01em" />
			</div>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<GlowDefs />
				<Connector path={[{x: 540, y: 770}, {x: 540, y: 800}, {x: 540, y: 820}, {x: 540, y: 850}]} draw={Math.min(draw1, draw2)} pulses={[pulseA > 0 && pulseA < 1 ? pulseA : -1]} width={5} />
				<Connector path={[{x: 540, y: 1180}, {x: 540, y: 1210}, {x: 540, y: 1230}, {x: 540, y: 1260}]} draw={draw3} pulses={[pulseB > 0 && pulseB < 1 ? pulseB : -1]} width={5} />
			</svg>
			<div style={{position: 'absolute', left: 90, top: 560, ...node(pA, 0)}}>
				<Panel title="Call captured" icon="phone" width={900} active={pA} right={<Status label={pA > 0.5 ? 'Answered' : 'Waiting'} on={pA} />} bodyStyle={{fontSize: 28, color: COLORS.text2, padding: '22px 26px'}}>
					Caller details saved instantly
				</Panel>
			</div>
			<div style={{position: 'absolute', left: 90, top: 850, ...node(pT, 1)}}>
				<Panel title="Instant text back" icon="message" width={900} active={pT} right={<Status label={pT > 0.5 ? 'Sent' : 'Queued'} on={pT} />} bodyStyle={{padding: '22px 26px'}}>
					<div
						style={{
							maxWidth: 680,
							padding: '20px 24px',
							borderRadius: '24px 24px 24px 6px',
							background: pT > 0 ? COLORS.purple : '#1D1D26',
							fontSize: 29,
							fontWeight: 500,
							lineHeight: 1.3,
							...reveal(pT, {y: 20, blur: 6, scale: 0.92}),
						}}
					>
						Sorry we missed you! How can we help today?
					</div>
				</Panel>
			</div>
			<div style={{position: 'absolute', left: 90, top: 1260, ...node(pB, 2)}}>
				<Panel title="Appointment booked" icon="calendar" width={900} active={pB} right={<Status label={pB > 0.5 ? 'Confirmed' : 'Open'} on={pB} />} bodyStyle={{padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 18}}>
					<div style={{fontFamily: FONTS.mono, fontSize: 30, ...reveal(pB, {y: 12, blur: 6})}}>Thu · 10:00 AM</div>
					<div style={{fontSize: 28, color: COLORS.text2, ...reveal(pB, {y: 12, blur: 6})}}>added to your calendar</div>
				</Panel>
			</div>
		</AbsoluteFill>
	);
};

/* ---------------- 5. The money: $10K–$20K a month back ---------------- */

const RECOVERED = ['Booking recovered', 'Sale recovered', 'Quote request recovered', 'Booking recovered', 'Contract inquiry recovered', 'Sale recovered'];

export const S5Money: React.FC = () => {
	const frame = useCurrentFrame();
	const tTen = word('money', 3);
	const tTwenty = word('money', 5);
	const t0 = cue('s5.stack');
	const stackDur = 1.4;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 34% at 50% 30%, rgba(124,77,255,0.18) 0%, transparent 70%)'}} />
			<div style={{position: 'absolute', top: 200, left: 60, right: 60}}>
				<KineticWords words={lineWords('money', 0, 3)} size={64} weight={600} color={COLORS.text2} />
			</div>
			<div style={{position: 'absolute', top: 310, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 0}}>
				<Slam text="$10K" t={tTen} size={176} />
				<Slam text="–$20K" t={tTwenty} size={176} color={COLORS.purpleBright} />
			</div>
			<div style={{position: 'absolute', top: 510, left: 60, right: 60}}>
				<KineticWords words={lineWords('money', 8, 10)} size={76} weight={800} tracking="-0.03em" />
				<KineticWords words={lineWords('money', 10)} size={76} weight={800} tracking="-0.03em" color={COLORS.purpleBright} />
			</div>
			<div style={{position: 'absolute', left: 60, top: 790, ...reveal(prog(frame, tTen + 0.3, 0.45), {y: 60, blur: 12})}}>
				<Panel title="Recovered this month" icon="chart" width={960} active={0.6} right={<Status label="Live" on={1} />} bodyStyle={{padding: '6px 26px 10px', height: 560, overflow: 'hidden', position: 'relative'}}>
					{RECOVERED.map((r, i) => {
						const ti = t0 + stackDur * (i / (RECOVERED.length - 1)) ** 0.8;
						const p = prog(frame, ti, 0.3);
						const above = RECOVERED.slice(i + 1).reduce((a, _, j) => a + prog(frame, t0 + stackDur * ((i + 1 + j) / (RECOVERED.length - 1)) ** 0.8, 0.3), 0);
						if (p <= 0) return null;
						return (
							<div key={i} style={{position: 'absolute', left: 26, right: 26, top: 6 + above * 88, height: 88, display: 'flex', alignItems: 'center', gap: 18, borderBottom: `1px solid ${COLORS.border}`, fontSize: 29, fontWeight: 600, ...reveal(p, {y: -30, blur: 8})}}>
								<div style={{width: 34, height: 34, borderRadius: 9, background: COLORS.purple, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Icon name="check" size={26} color="#fff" stroke={3} />
								</div>
								<div style={{flex: 1}}>{r}</div>
								<div style={{fontFamily: FONTS.mono, fontSize: 22, color: COLORS.purpleBright, letterSpacing: '0.1em'}}>WAS MISSED</div>
							</div>
						);
					})}
					<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 140, background: 'linear-gradient(180deg, transparent, #0C0C11)'}} />
				</Panel>
			</div>
			<div style={{position: 'absolute', top: 1460, left: 60, right: 60, textAlign: 'center', fontSize: 26, color: COLORS.text3, ...reveal(prog(frame, tTen + 0.6, 0.4), {y: 10, blur: 4})}}>
				Results vary by business and call volume.
			</div>
		</AbsoluteFill>
	);
};

/* ---------------- 6. No new staff, no new software ---------------- */

export const S6Simple: React.FC = () => {
	const frame = useCurrentFrame();
	const items = [
		{words: lineWords('simple', 0, 3), t: cue('s6.staff')},
		{words: lineWords('simple', 3), t: cue('s6.software')},
	];
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
			<div style={{display: 'flex', flexDirection: 'column', gap: 70, width: 940, marginTop: -120}}>
				{items.map((it, i) => {
					const p = springAt(frame, it.t - 0.05, 14, 170);
					return (
						<div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 32}}>
							<div style={{width: 92, height: 92, flexShrink: 0, marginTop: 10, borderRadius: 24, background: COLORS.purple, boxShadow: `0 0 40px ${COLORS.purpleGlow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...reveal(Math.min(1, p), {y: 0, blur: 8, scale: 0.5})}}>
								<Icon name="check" size={64} color="#fff" stroke={3} />
							</div>
							<KineticWords words={it.words} size={104} align="left" {...heavy} />
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

/* ---------------- 7. CTA and end card ---------------- */

export const S7Cta: React.FC = () => {
	const frame = useCurrentFrame();
	const tCard = sceneStart('endcard');
	const card = prog(frame, tCard - 0.2, 0.6, EASE_IN_OUT);
	const tCta = cue('s7.cta');
	const ctaIn = prog(frame, tCta - 0.05, 0.5, EASE_OUT);
	const brandIn = prog(frame, tCta + 0.25, 0.5, EASE_OUT);
	const breathe = 0.5 + 0.5 * Math.sin(frame / 14);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 70% 30% at 50% 62%, rgba(124,77,255,${0.1 + 0.08 * ctaIn * breathe}) 0%, transparent 70%)`}} />
			<div style={{position: 'absolute', left: 60, right: 60, top: mix(620, 500, card)}}>
				{[[0, 2], [2, 4], [4, 6]].map(([a, b]) => (
					<KineticWords key={a} words={lineWords('cta', a, b, upper)} size={mix(120, 104, card)} {...heavy} />
				))}
				<KineticWords
					words={lineWords('cta', 6, 7, upper).map((w) => ({...w, text: w.text.replace('.', ''), suffix: <span style={{color: COLORS.purple}}>.</span>}))}
					size={mix(120, 104, card)}
					{...heavy}
					color={COLORS.purpleBright}
				/>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
				<div
					style={{
						padding: '30px 58px',
						borderRadius: 999,
						background: `linear-gradient(180deg, #9B71FF 0%, ${COLORS.purple} 100%)`,
						boxShadow: `0 0 ${40 + 30 * breathe * ctaIn}px rgba(139,92,246,0.55), inset 0 1px 0 rgba(255,255,255,0.35)`,
						fontSize: 44,
						fontWeight: 700,
						color: '#fff',
						whiteSpace: 'nowrap',
						...reveal(ctaIn, {y: 40, blur: 12, scale: 0.9}),
					}}
				>
					{BRAND.ctaLabel}
				</div>
				{BRAND.url ? <div style={{fontSize: 34, color: COLORS.text2, ...reveal(brandIn, {y: 16, blur: 8})}}>{BRAND.url}</div> : null}
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, ...reveal(brandIn, {y: 24, blur: 10})}}>
				<div style={{width: 120, height: 2, background: COLORS.purple, opacity: 0.7}} />
				{BRAND.logoSrc ? <Img src={staticFile(BRAND.logoSrc)} alt={BRAND.agencyName} style={{height: 100, width: 'auto'}} /> : null}
				{BRAND.showNameWithLogo || !BRAND.logoSrc ? (
					<div style={{fontSize: 34, fontWeight: 600, letterSpacing: '0.32em', marginRight: '-0.32em', textTransform: 'uppercase', color: COLORS.text2}}>{BRAND.agencyName}</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};
