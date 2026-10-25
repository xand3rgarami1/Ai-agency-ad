import type {CSSProperties} from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {FPS} from '../config/timing';

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

/** 0..1 progress of an animation that starts at `start` seconds and lasts `dur` seconds. */
export const prog = (frame: number, start: number, dur: number, easing = EASE_OUT) =>
	interpolate(frame, [start * FPS, (start + dur) * FPS], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing,
	});

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

export const springAt = (frame: number, start: number, damping = 18, stiffness = 140) =>
	spring({frame: frame - Math.round(start * FPS), fps: FPS, config: {damping, stiffness, mass: 1}});

export type RevealOpts = {y?: number; x?: number; blur?: number; scale?: number};

/** Blur + rise + fade reveal used throughout for type and UI entrances. */
export const reveal = (p: number, {y = 36, x = 0, blur = 14, scale = 1}: RevealOpts = {}): CSSProperties => ({
	opacity: Math.min(1, p * 1.6),
	transform: `translate(${(1 - p) * x}px, ${(1 - p) * y}px) scale(${mix(scale, 1, p)})`,
	filter: p >= 1 ? undefined : `blur(${(1 - p) * blur}px)`,
});

/** Exit: blur + push + fade. p goes 0 -> 1 as the element leaves. */
export const conceal = (p: number, {y = -24, blur = 14, scale = 1}: RevealOpts = {}): CSSProperties => ({
	opacity: 1 - p,
	transform: `translateY(${p * y}px) scale(${mix(1, scale, p)})`,
	filter: p <= 0 ? undefined : `blur(${p * blur}px)`,
});

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export const rand = (seed: number) => {
	const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};
