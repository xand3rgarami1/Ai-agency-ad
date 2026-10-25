import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {FONTS} from './config/brand';
import {SCENES} from './config/timing';
import {Backdrop, Finish} from './components/Backdrop';
import {Scene} from './components/Scene';
import {S1Hook, S2Reasons, S3Value, S4System, S5Money, S6Simple, S7Cta} from './scenes/OfferScenes';

const win = (id: string) => {
	const s = SCENES.find((x) => x.id === id);
	if (!s) throw new Error(`Scene ${id} missing`);
	return s;
};

/** Offer-led version: missed-call recovery. */
export const AgencyAd: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
	const hook = win('opening');
	const reasons = win('fragmented');
	const value = win('leads');
	const system = win('system');
	const money = win('unified');
	const simple = win('simple');
	const cta = win('cta');
	return (
		<AbsoluteFill style={{background: '#000', fontFamily: FONTS.body, color: '#fff'}}>
			<Backdrop />
			<Scene start={hook.start} end={hook.end} exit="zoomThrough" exitDur={0.18}>
				<S1Hook />
			</Scene>
			<Scene start={reasons.start} end={reasons.end} enter="rise" enterDur={0.22}>
				<Backdrop grid={0.4} />
				<S2Reasons />
			</Scene>
			<Scene start={value.start} end={value.end} enter="cut" exit="zoomThrough" exitDur={0.16}>
				<Backdrop grid={0.4} />
				<S3Value end={value.end} />
			</Scene>
			<Scene start={system.start} end={system.end} enter="blurZoom" exit="recede" exitDur={0.25}>
				<Backdrop grid={0.6} />
				<S4System />
			</Scene>
			<Scene start={money.start} end={money.end} enter="blurZoom" exit="recede" exitDur={0.25}>
				<Backdrop grid={0.4} />
				<S5Money />
			</Scene>
			<Scene start={simple.start} end={simple.end} enter="rise" exit="fade" exitDur={0.2}>
				<S6Simple />
			</Scene>
			<Scene start={cta.start} end={cta.end} enter="fade" enterDur={0.25}>
				<S7Cta />
			</Scene>
			<Finish />
			{withAudio ? <Audio src={staticFile('audio/mix.wav')} /> : null}
		</AbsoluteFill>
	);
};
