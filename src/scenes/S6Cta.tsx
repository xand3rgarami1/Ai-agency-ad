import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, COLORS, FONTS} from '../config/brand';
import {cue, sceneStart, word} from '../config/timing';
import {EASE_IN_OUT, EASE_OUT, mix, prog, reveal} from '../components/anim';
import {KineticWords, lineWords} from '../components/Text';

const Logo: React.FC = () => {
	if (BRAND.logoSrc) return <Img src={staticFile(BRAND.logoSrc)} alt={BRAND.agencyName} style={{height: 100, width: 'auto', display: 'block'}} />;
	if (!BRAND.showLogoPlaceholder) return null;
	return (
		<div
			style={{
				width: 88,
				height: 88,
				borderRadius: 22,
				border: `2px dashed ${COLORS.borderStrong}`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: FONTS.mono,
				fontSize: 20,
				letterSpacing: '0.1em',
				color: COLORS.text3,
			}}
		>
			LOGO
		</div>
	);
};

export const S6Cta: React.FC = () => {
	const frame = useCurrentFrame();
	const tCard = sceneStart('endcard');
	const card = prog(frame, tCard - 0.3, 0.6, EASE_IN_OUT);
	const tCta = cue('s6.cta');
	const ctaIn = prog(frame, tCta - 0.05, 0.5, EASE_OUT);
	const brandIn = prog(frame, tCta + 0.25, 0.5, EASE_OUT);
	const breathe = 0.5 + 0.5 * Math.sin(frame / 14);
	const big = {weight: 900, tracking: '-0.045em', lineHeight: 0.95, motion: {y: 50, blur: 18, scale: 1.08}};

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 70% 30% at 50% 66%, rgba(124,77,255,${0.1 + 0.08 * ctaIn * breathe}) 0%, transparent 70%)`}} />
			{/* Setup line: centred, then lifts and quiets when the end card lands. */}
			<div
				style={{
					position: 'absolute',
					left: 70,
					right: 70,
					top: mix(700, 440, card),
					transform: `scale(${mix(1, 0.72, card)})`,
					transformOrigin: '50% 0%',
				}}
			>
				{[[0, 3], [3, 6], [6, 9]].map(([a, b]) => (
					<KineticWords key={a} words={lineWords('fix', a, b)} size={84} weight={700} tracking="-0.03em" color={card > 0.5 ? COLORS.text2 : COLORS.white} />
				))}
			</div>

			<div style={{position: 'absolute', left: 60, right: 60, top: 720}}>
				<KineticWords words={[{text: 'Let\u2019s', t: word('fix', 9)}]} size={176} {...big} />
				<KineticWords
					words={[
						{text: 'fix', t: word('fix', 10)},
						{text: 'that', t: word('fix', 11), suffix: <span style={{color: COLORS.purple}}>.</span>},
					]}
					size={176}
					{...big}
				/>
			</div>

			<div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
				<div
					style={{
						padding: '30px 54px',
						borderRadius: 999,
						background: `linear-gradient(180deg, #9B71FF 0%, ${COLORS.purple} 100%)`,
						boxShadow: `0 0 ${40 + 30 * breathe * ctaIn}px rgba(139,92,246,0.55), inset 0 1px 0 rgba(255,255,255,0.35)`,
						fontFamily: FONTS.body,
						fontSize: 42,
						fontWeight: 700,
						letterSpacing: '-0.01em',
						color: '#fff',
						whiteSpace: 'nowrap',
						...reveal(ctaIn, {y: 40, blur: 12, scale: 0.9}),
					}}
				>
					{BRAND.ctaLabel}
				</div>
				{BRAND.url ? (
					<div style={{fontFamily: FONTS.body, fontSize: 34, fontWeight: 500, color: COLORS.text2, ...reveal(brandIn, {y: 16, blur: 8})}}>{BRAND.url}</div>
				) : null}
			</div>

			<div style={{position: 'absolute', left: 0, right: 0, top: 1400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, ...reveal(brandIn, {y: 24, blur: 10})}}>
				<div style={{width: 120, height: 2, background: COLORS.purple, opacity: 0.7}} />
				<div style={{display: 'flex', alignItems: 'center', gap: 24}}>
					<Logo />
					{!BRAND.logoSrc || BRAND.showNameWithLogo ? (
						<div style={{fontFamily: FONTS.display, fontSize: 48, fontWeight: 700, letterSpacing: '-0.02em', color: COLORS.white}}>{BRAND.agencyName}</div>
					) : null}
				</div>
			</div>
		</AbsoluteFill>
	);
};
