import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, COLORS, FONTS} from '../config/brand';
import {cue, cueDef, FPS, sceneStart, word} from '../config/timing';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, mix, prog, reveal, springAt} from '../components/anim';
import {KineticWords, lineWords, Slam} from '../components/Text';
import {Icon, IconName} from '../ui/Icon';
import {Badge, Panel, Status} from '../ui/Panel';

const heavy = {weight: 900, tracking: '-0.04em', lineHeight: 0.98, motion: {y: 50, blur: 18}};
const upper = (s: string) => s.toUpperCase();
const noPunct = (s: string) => s.replace(/[.,]$/, '');

/** Arrival time of item i of a `stack` cue (same curve build_audio.py uses for its clicks). */
const stackTime = (id: string, i: number) => {
	const d = cueDef(id);
	const n = d.count ?? 1;
	return cue(id) + (d.dur ?? 0) * (n > 1 ? (i / (n - 1)) ** 0.8 : 0);
};

/* ---------------- shared data: the four places a lead can land ---------------- */

type Source = {
	id: string;
	label: string;
	icon: IconName;
	body: string;
	meta: string;
	x: number;
	y: number;
	rot: number;
	w: number;
	inquiry: string;
	owner: string;
	next: string;
	cue: string;
};

const SOURCES: Source[] = [
	{id: 'text', label: 'Text message', icon: 'message', body: 'Hi! Do you have availability next week?', meta: 'Unread · 2 days', x: 60, y: 620, rot: -4, w: 580, inquiry: 'Next-week availability', owner: 'Front desk', next: 'Reply · Today 10 AM', cue: 's2.text'},
	{id: 'dm', label: 'Direct message', icon: 'contact', body: 'How much for 50 units?', meta: 'Seen', x: 470, y: 870, rot: 3.5, w: 550, inquiry: 'Price for 50 units', owner: 'Sales', next: 'Send quote · Today', cue: 's2.dm'},
	{id: 'note', label: 'Sticky note', icon: 'doc', body: 'Call back re: quote, Tuesday', meta: '', x: 90, y: 1110, rot: -6, w: 420, inquiry: 'Quote callback', owner: 'Sales', next: 'Call back · Tue 2 PM', cue: 's2.note'},
	{id: 'email', label: 'Email', icon: 'mail', body: 'Re: Booking for 40 guests', meta: 'Flagged · 5 days', x: 430, y: 1300, rot: 2.5, w: 590, inquiry: 'Booking for 40 guests', owner: 'Events', next: 'Confirm date · Wed', cue: 's2.email'},
];

const SourceCard: React.FC<{s: Source; question?: number[]}> = ({s, question}) => {
	if (s.id === 'note') {
		return (
			<div style={{width: s.w, height: 300, background: '#E8E4DA', color: '#1B1B1F', borderRadius: 6, padding: '34px 34px', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', position: 'relative'}}>
				<div style={{fontFamily: FONTS.mono, fontSize: 22, letterSpacing: '0.12em', opacity: 0.55, marginBottom: 18}}>STICKY NOTE</div>
				<div style={{fontSize: 40, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em'}}>{s.body}</div>
				<Questions q={question} dark />
			</div>
		);
	}
	return (
		<div style={{position: 'relative'}}>
			<Panel title={s.label} icon={s.icon} width={s.w} right={s.meta ? <Badge>{s.meta}</Badge> : undefined} bodyStyle={{padding: '24px 26px 28px'}}>
				<div style={{fontSize: 32, fontWeight: 600, lineHeight: 1.3}}>{s.body}</div>
			</Panel>
			<Questions q={question} />
		</div>
	);
};

/** "Owner ?" / "Next ?" tags that pop onto a card. */
const Questions: React.FC<{q?: number[]; dark?: boolean}> = ({q, dark}) => {
	if (!q) return null;
	return (
		<div style={{position: 'absolute', right: -10, top: -54, display: 'flex', gap: 10}}>
			{['Owner ?', 'Next step ?'].map((label, i) => (
				<div
					key={label}
					style={{
						padding: '10px 18px',
						borderRadius: 999,
						background: '#1D1D26',
						border: `1.5px solid ${COLORS.borderStrong}`,
						color: COLORS.white,
						fontSize: 25,
						fontWeight: 700,
						boxShadow: dark ? '0 10px 24px rgba(0,0,0,0.5)' : undefined,
						...reveal(q[i], {y: 14, blur: 6, scale: 0.85}),
					}}
				>
					{label}
				</div>
			))}
		</div>
	);
};

/* ---------------- 1. Hook: your leads live in 5 places ---------------- */

const CHIPS: {label: string; icon: IconName; x: number; y: number}[] = [
	{label: 'Texts', icon: 'message', x: 90, y: 1030},
	{label: 'DMs', icon: 'contact', x: 640, y: 980},
	{label: 'Sticky notes', icon: 'doc', x: 330, y: 1190},
	{label: 'Email', icon: 'mail', x: 110, y: 1370},
	{label: 'Voicemail', icon: 'phone', x: 620, y: 1330},
];

export const S1Hook: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 230, left: 60, right: 60}}>
				<KineticWords words={lineWords('hook', 0, 4, upper)} size={96} {...heavy} />
			</div>
			<div style={{position: 'absolute', top: 380, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 36}}>
				<Slam text="5" t={word('hook', 4)} size={300} color={COLORS.white} />
				<Slam text="PLACES." t={word('hook', 5)} size={150} style={{alignSelf: 'flex-end', marginBottom: 34}} />
			</div>
			{CHIPS.map((c, i) => {
				const p = springAt(frame, stackTime('s1.chips', i), 16, 160);
				const drift = Math.sin((frame + i * 17) / 22) * 8;
				return (
					<div
						key={c.label}
						style={{
							position: 'absolute',
							left: c.x,
							top: c.y + drift,
							display: 'flex',
							alignItems: 'center',
							gap: 14,
							padding: '20px 30px',
							borderRadius: 999,
							background: '#15151D',
							border: `1.5px solid ${COLORS.borderStrong}`,
							fontSize: 34,
							fontWeight: 600,
							transform: `rotate(${(i % 2 ? 1 : -1) * 3}deg)`,
							...reveal(Math.min(1, p), {y: 40, blur: 10, scale: 0.7}),
						}}
					>
						<Icon name={c.icon} size={34} color={COLORS.white} />
						{c.label}
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/* ---------------- 2. A text. A DM. A sticky note. An email. ---------------- */

export const S2Sources: React.FC = () => {
	const frame = useCurrentFrame();
	const heads: [number, number | undefined][] = [
		[0, 2],
		[2, 4],
		[4, 7],
		[7, undefined],
	];
	return (
		<AbsoluteFill>
			{heads.map(([a, b], i) => {
				const next = heads[i + 1];
				return (
					<div key={a} style={{position: 'absolute', top: 200, left: 60, right: 60}}>
						<KineticWords
							words={lineWords('sources', a, b, upper)}
							size={i === 3 ? 92 : 124}
							{...heavy}
							outAt={next ? word('sources', next[0]) - 0.16 : undefined}
						/>
					</div>
				);
			})}
			{SOURCES.map((s) => {
				const p = prog(frame, cue(s.cue) - 0.08, 0.4, EASE_OUT);
				return (
					<div key={s.id} style={{position: 'absolute', left: s.x, top: s.y + Math.sin((frame + s.x) / 25) * 6, transform: `rotate(${s.rot}deg)`, ...reveal(p, {y: 70, blur: 14, scale: 0.9})}}>
						<SourceCard s={s} />
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/* ---------------- 3. Nobody owns it; leads go cold ---------------- */

export const S3Cold: React.FC<{end: number}> = ({end}) => {
	const frame = useCurrentFrame();
	const q1 = prog(frame, cue('s3.q1'), 0.3);
	const q2 = prog(frame, cue('s3.q2'), 0.3);
	const tCold = word('cold', 0);
	const cold = prog(frame, cue('s3.cold'), 0.8, EASE_IN_OUT);
	const pressure = prog(frame, end - 0.5, 0.5, EASE_IN);
	return (
		<AbsoluteFill style={{transform: `scale(${mix(1, 1.05, pressure)})`}}>
			<div style={{position: 'absolute', top: 190, left: 60, right: 60}}>
				<KineticWords words={lineWords('owner', 0, 5)} size={62} weight={700} color={COLORS.text2} tracking="-0.02em" outAt={tCold - 0.2} />
				<KineticWords words={lineWords('owner', 5, undefined, upper)} size={104} {...heavy} outAt={tCold - 0.2} />
			</div>
			<div style={{position: 'absolute', top: 190, left: 60, right: 60}}>
				<KineticWords words={lineWords('cold', 0, 3)} size={62} weight={700} color={COLORS.text2} tracking="-0.02em" />
				<KineticWords words={lineWords('cold', 3, undefined, upper)} size={110} {...heavy} />
			</div>
			{SOURCES.map((s, i) => (
				<div
					key={s.id}
					style={{
						position: 'absolute',
						left: s.x,
						top: s.y + Math.sin((frame + s.x) / 25) * 6 + cold * (40 + i * 25),
						transform: `rotate(${s.rot + cold * (i % 2 ? 3 : -3)}deg)`,
						opacity: 1 - cold * 0.55,
						filter: cold > 0 ? `grayscale(1) blur(${cold * 5}px)` : undefined,
					}}
				>
					<SourceCard s={s} question={[q1, q2]} />
				</div>
			))}
		</AbsoluteFill>
	);
};

/* ---------------- 4+5. Everything flies into one board; owners and next actions fill in ---------------- */

const BOARD = {x: 40, y: 640, w: 1000};
const ROW_H = 124;
const HEAD_H = 68 + 52;

export const S4Board: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const start = sceneStart('system');
	const tAssign = sceneStart('unified');
	const boardIn = prog(frame, start + 0.1, 0.5, EASE_OUT);
	const glow = prog(frame, cue('s4.board'), 0.8, EASE_IN_OUT);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 75% 35% at 50% 52%, rgba(124,77,255,${0.16 * glow}) 0%, transparent 70%)`}} />
			{/* headlines */}
			<div style={{position: 'absolute', top: 190, left: 60, right: 60}}>
				<KineticWords words={lineWords('board', 0, 5)} size={62} weight={700} color={COLORS.text2} tracking="-0.02em" outAt={tAssign - 0.2} />
				<KineticWords words={lineWords('board', 5, undefined, upper)} size={150} {...heavy} color={COLORS.purpleBright} outAt={tAssign - 0.2} />
			</div>
			<div style={{position: 'absolute', top: 190, left: 60, right: 60}}>
				<KineticWords words={lineWords('assign', 0, 3)} size={62} weight={700} color={COLORS.text2} tracking="-0.02em" />
				<KineticWords words={lineWords('assign', 3, 5, (s) => upper(noPunct(s)))} size={110} {...heavy} />
				<KineticWords words={lineWords('assign', 5, undefined, upper)} size={92} {...heavy} color={COLORS.purpleBright} />
			</div>

			{/* the board */}
			<div style={{position: 'absolute', left: BOARD.x, top: BOARD.y, ...reveal(boardIn, {y: 60, blur: 14, scale: 0.96})}}>
				<Panel title="Leads" icon="pipeline" width={BOARD.w} active={0.25 + glow * 0.6} right={<Status label="All inquiries" on={glow} />} bodyStyle={{padding: 0}}>
					<div style={{display: 'flex', height: 52, alignItems: 'center', padding: '0 26px', borderBottom: `1px solid ${COLORS.border}`, fontSize: 22, fontWeight: 600, letterSpacing: '0.1em', color: COLORS.text3}}>
						<div style={{width: 420}}>INQUIRY</div>
						<div style={{width: 210}}>OWNER</div>
						<div style={{flex: 1}}>NEXT ACTION</div>
					</div>
					{SOURCES.map((s, i) => {
						const pRow = prog(frame, stackTime('s4.fly', i) + 0.25, 0.3, EASE_OUT);
						const pOwner = prog(frame, stackTime('s5.owner', i), 0.3, EASE_OUT);
						const pNext = prog(frame, stackTime('s5.next', i), 0.3, EASE_OUT);
						return (
							<div key={s.id} style={{display: 'flex', alignItems: 'center', height: ROW_H, padding: '0 26px', borderBottom: i < 3 ? `1px solid ${COLORS.border}` : 'none', opacity: pRow}}>
								<div style={{width: 420}}>
									<div style={{fontSize: 30, fontWeight: 700}}>{s.inquiry}</div>
									<div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 23, color: COLORS.text3}}>
										<Icon name={s.icon} size={24} color={COLORS.text3} />
										{s.label}
									</div>
								</div>
								<div style={{width: 210}}>
									{pOwner > 0 ? (
										<div style={{display: 'inline-flex', padding: '8px 16px', borderRadius: 999, border: `1.5px solid ${COLORS.purple}`, color: COLORS.white, fontSize: 25, fontWeight: 600, whiteSpace: 'nowrap', ...reveal(pOwner, {x: -20, y: 0, blur: 6})}}>
											{s.owner}
										</div>
									) : (
										<div style={{fontSize: 26, color: COLORS.text4}}>—</div>
									)}
								</div>
								<div style={{flex: 1}}>
									{pNext > 0 ? (
										<div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 26, fontWeight: 600, whiteSpace: 'nowrap', ...reveal(pNext, {x: -20, y: 0, blur: 6})}}>
											<div style={{width: 12, height: 12, borderRadius: 6, background: COLORS.purple, boxShadow: `0 0 12px ${COLORS.purpleGlow}`}} />
											{s.next}
										</div>
									) : (
										<div style={{fontSize: 26, color: COLORS.text4}}>—</div>
									)}
								</div>
							</div>
						);
					})}
				</Panel>
			</div>

			{/* cards flying in from where they were scattered */}
			{SOURCES.map((s, i) => {
				const ta = stackTime('s4.fly', i);
				const p = prog(frame, ta - 0.25, 0.55, EASE_IN_OUT);
				if (t > ta + 0.35) return null;
				const tx = BOARD.x + 26;
				const ty = BOARD.y + HEAD_H + i * ROW_H;
				return (
					<div
						key={s.id}
						style={{
							position: 'absolute',
							left: mix(s.x, tx, p),
							top: mix(s.y, ty, p),
							transformOrigin: '0 0',
							transform: `rotate(${mix(s.rot, 0, p)}deg) scale(${mix(1, 0.55, p)})`,
							opacity: (1 - prog(frame, ta + 0.05, 0.3)) * Math.min(1, prog(frame, start, 0.25) * 2),
							filter: p > 0 && p < 1 ? `blur(${Math.sin(p * Math.PI) * 4}px)` : undefined,
						}}
					>
						<SourceCard s={s} />
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/* ---------------- 6. Nothing slips. Nothing doubles up. ---------------- */

export const S6Simple: React.FC = () => {
	const frame = useCurrentFrame();
	const items = [
		{words: lineWords('simple', 0, 2), t: cue('s6.slips')},
		{words: lineWords('simple', 2), t: cue('s6.doubles')},
	];
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 470, left: 70, right: 40, display: 'flex', flexDirection: 'column', gap: 60}}>
				{items.map((it, i) => {
					const p = springAt(frame, it.t - 0.05, 14, 170);
					return (
						<div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 30}}>
							<div style={{width: 92, height: 92, flexShrink: 0, marginTop: 0, borderRadius: 24, background: COLORS.purple, boxShadow: `0 0 40px ${COLORS.purpleGlow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...reveal(Math.min(1, p), {y: 0, blur: 8, scale: 0.5})}}>
								<Icon name="check" size={64} color="#fff" stroke={3} />
							</div>
							<KineticWords words={it.words} size={84} align="left" {...heavy} />
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', top: 1050, left: 60, right: 60}}>
				<KineticWords words={lineWords('team', 0, 4)} size={66} weight={700} color={COLORS.text2} tracking="-0.02em" />
				<KineticWords words={lineWords('team', 4, undefined, upper)} size={112} {...heavy} color={COLORS.purpleBright} />
			</div>
		</AbsoluteFill>
	);
};

/* ---------------- 7. CTA and end card ---------------- */

export const S7Cta: React.FC = () => {
	const frame = useCurrentFrame();
	const card = prog(frame, sceneStart('endcard') - 0.2, 0.6, EASE_IN_OUT);
	const tCta = cue('s7.cta');
	const ctaIn = prog(frame, tCta - 0.05, 0.5, EASE_OUT);
	const brandIn = prog(frame, tCta + 0.25, 0.5, EASE_OUT);
	const breathe = 0.5 + 0.5 * Math.sin(frame / 14);
	const size = mix(140, 112, card);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 70% 30% at 50% 62%, rgba(124,77,255,${0.1 + 0.08 * ctaIn * breathe}) 0%, transparent 70%)`}} />
			<div style={{position: 'absolute', left: 60, right: 60, top: mix(700, 470, card)}}>
				<KineticWords words={lineWords('cta', 0, 2, upper)} size={size} {...heavy} />
				<KineticWords words={lineWords('cta', 2, 4, upper)} size={size} {...heavy} />
				<KineticWords
					words={lineWords('cta', 4, 5, upper).map((w) => ({...w, text: noPunct(w.text), suffix: <span style={{color: COLORS.purple}}>.</span>}))}
					size={size}
					{...heavy}
					color={COLORS.purpleBright}
				/>
				<div style={{height: 26}} />
				<KineticWords words={lineWords('cta', 5)} size={60} weight={700} color={COLORS.text2} tracking="-0.02em" />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1170, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
				<div
					style={{
						padding: '30px 54px',
						borderRadius: 999,
						background: `linear-gradient(180deg, #9B71FF 0%, ${COLORS.purple} 100%)`,
						boxShadow: `0 0 ${40 + 30 * breathe * ctaIn}px rgba(139,92,246,0.55), inset 0 1px 0 rgba(255,255,255,0.35)`,
						fontSize: 42,
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
			<div style={{position: 'absolute', left: 0, right: 0, top: 1410, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, ...reveal(brandIn, {y: 24, blur: 10})}}>
				<div style={{width: 120, height: 2, background: COLORS.purple, opacity: 0.7}} />
				{BRAND.logoSrc ? <Img src={staticFile(BRAND.logoSrc)} alt={BRAND.agencyName} style={{height: 100, width: 'auto'}} /> : null}
				{BRAND.showNameWithLogo || !BRAND.logoSrc ? (
					<div style={{fontSize: 34, fontWeight: 600, letterSpacing: '0.32em', marginRight: '-0.32em', textTransform: 'uppercase', color: COLORS.text2}}>{BRAND.agencyName}</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};
