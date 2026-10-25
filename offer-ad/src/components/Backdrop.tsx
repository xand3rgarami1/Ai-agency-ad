import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {HEIGHT, WIDTH} from '../config/timing';

/** Black stage with an optional soft purple light and a faint dot grid. */
export const Backdrop: React.FC<{glow?: number; glowY?: number; grid?: number}> = ({glow = 0, glowY = 50, grid = 0}) => (
	<AbsoluteFill style={{background: '#000'}}>
		{grid > 0 ? (
			<AbsoluteFill
				style={{
					opacity: grid,
					backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1.6px, transparent 1.6px)',
					backgroundSize: '54px 54px',
					backgroundPosition: '27px 27px',
					maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 100%)',
					WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 100%)',
				}}
			/>
		) : null}
		{glow > 0 ? (
			<AbsoluteFill
				style={{
					opacity: glow,
					background: `radial-gradient(ellipse 70% 38% at 50% ${glowY}%, rgba(124,77,255,0.30) 0%, rgba(124,77,255,0.08) 45%, transparent 75%)`,
				}}
			/>
		) : null}
	</AbsoluteFill>
);

/** Film grain + vignette, deterministic per frame. */
export const Finish: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
			<svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, opacity: 0.045, mixBlendMode: 'screen'}}>
				<filter id="grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width={WIDTH} height={HEIGHT} filter="url(#grain)" />
			</svg>
		</AbsoluteFill>
	);
};
