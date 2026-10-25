import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {FONTS} from './config/brand';
import {SCENES} from './config/timing';
import {Backdrop, Finish} from './components/Backdrop';
import {Scene} from './components/Scene';
import {S1Hook, S2Sources, S3Cold, S4Board, S6Simple, S7Cta} from './scenes/BoardScenes';

const win = (id: string) => {
	const s = SCENES.find((x) => x.id === id);
	if (!s) throw new Error(`Scene ${id} missing`);
	return s;
};

/** "Chaos to one board": every inquiry, owner and next action in one place. */
export const AgencyAd: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
	const hook = win('opening');
	const sources = win('fragmented');
	const cold = win('leads');
	const board = win('system');
	const assign = win('unified');
	const simple = win('simple');
	const cta = win('cta');
	return (
		<AbsoluteFill style={{background: '#000', fontFamily: FONTS.body, color: '#fff'}}>
			<Backdrop />
			<Scene start={hook.start} end={hook.end} exit="zoomThrough" exitDur={0.16}>
				<S1Hook />
			</Scene>
			<Scene start={sources.start} end={sources.end} enter="blurZoom">
				<Backdrop grid={0.4} />
				<S2Sources />
			</Scene>
			<Scene start={cold.start} end={cold.end} enter="cut">
				<Backdrop grid={0.4} />
				<S3Cold end={cold.end} />
			</Scene>
			{/* one continuous scene across "system" and "unified" so the board never cuts */}
			<Scene start={board.start} end={assign.end} enter="cut" exit="recede" exitDur={0.25}>
				<Backdrop grid={0.6} />
				<S4Board />
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
