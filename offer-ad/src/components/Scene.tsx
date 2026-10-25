import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS} from '../config/timing';
import {EASE_IN, EASE_OUT, mix, prog} from './anim';

export type Enter = 'cut' | 'blurZoom' | 'rise' | 'fade';
export type Exit = 'cut' | 'zoomThrough' | 'recede' | 'fade';

type Props = {
	start: number;
	end: number;
	enter?: Enter;
	exit?: Exit;
	enterDur?: number;
	exitDur?: number;
	children: React.ReactNode;
};

/**
 * Renders children only inside [start, end) seconds (absolute timeline, no frame offset,
 * so children use absolute cue times) and applies the entrance/exit treatment.
 */
export const Scene: React.FC<Props> = ({start, end, enter = 'cut', exit = 'cut', enterDur = 0.3, exitDur = 0.22, children}) => {
	const frame = useCurrentFrame();
	if (frame < Math.round(start * FPS) || frame >= Math.round(end * FPS)) return null;

	const pin = prog(frame, start, enterDur, EASE_OUT);
	const pout = prog(frame, end - exitDur, exitDur, EASE_IN);

	let scale = 1;
	let blur = 0;
	let opacity = 1;
	let y = 0;
	if (enter === 'blurZoom') {
		scale *= mix(1.12, 1, pin);
		blur += (1 - pin) * 18;
		opacity *= Math.min(1, pin * 2);
	} else if (enter === 'rise') {
		y += (1 - pin) * 80;
		blur += (1 - pin) * 10;
		opacity *= Math.min(1, pin * 2.5);
	} else if (enter === 'fade') {
		opacity *= pin;
	}
	if (exit === 'zoomThrough') {
		scale *= mix(1, 1.45, pout);
		blur += pout * 22;
		opacity *= 1 - pout;
	} else if (exit === 'recede') {
		scale *= mix(1, 0.92, pout);
		blur += pout * 10;
		opacity *= 1 - pout;
	} else if (exit === 'fade') {
		opacity *= 1 - pout;
	}

	return (
		<AbsoluteFill
			style={{
				opacity,
				transform: `translateY(${y}px) scale(${scale})`,
				filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};
