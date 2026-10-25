import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {FONTS} from './config/brand';
import {SCENES} from './config/timing';
import {Backdrop, Finish} from './components/Backdrop';
import {Scene} from './components/Scene';
import {S1Opening} from './scenes/S1Opening';
import {S2Fragmented} from './scenes/S2Fragmented';
import {S3aLeads, S3bOrders, S3cTeam} from './scenes/S3Problems';
import {S4System} from './scenes/S4System';
import {S5Unified} from './scenes/S5Unified';
import {S6Cta} from './scenes/S6Cta';

const win = (id: string) => {
	const s = SCENES.find((x) => x.id === id);
	if (!s) throw new Error(`Scene ${id} missing`);
	return s;
};

export const AgencyAd: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
	const opening = win('opening');
	const fragmented = win('fragmented');
	const leads = win('leads');
	const orders = win('orders');
	const team = win('team');
	const system = win('system');
	const unified = win('unified');
	const cta = win('cta');

	return (
		<AbsoluteFill style={{background: '#000', fontFamily: FONTS.body, color: '#fff'}}>
			<Backdrop />
			<Scene start={opening.start} end={opening.end} exit="zoomThrough" exitDur={0.2}>
				<S1Opening />
			</Scene>
			<Scene start={fragmented.start} end={fragmented.end} enter="blurZoom" exit="fade" exitDur={0.1}>
				<Backdrop grid={0.5} />
				<S2Fragmented start={fragmented.start} />
			</Scene>
			<Scene start={leads.start} end={leads.end} enter="rise" enterDur={0.22}>
				<S3aLeads start={leads.start} end={leads.end} />
			</Scene>
			<Scene start={orders.start} end={orders.end} enter="rise" enterDur={0.22}>
				<S3bOrders start={orders.start} />
			</Scene>
			<Scene start={team.start} end={team.end} enter="rise" enterDur={0.22} exit="zoomThrough" exitDur={0.16}>
				<S3cTeam start={team.start} end={team.end} />
			</Scene>
			<Scene start={system.start} end={system.end} enter="blurZoom" exit="recede" exitDur={0.25}>
				<Backdrop grid={0.6} />
				<S4System start={system.start} end={system.end} />
			</Scene>
			<Scene start={unified.start} end={unified.end} enter="blurZoom" exit="recede" exitDur={0.3}>
				<Backdrop grid={0.4} />
				<S5Unified start={unified.start} />
			</Scene>
			<Scene start={cta.start} end={cta.end} enter="fade" enterDur={0.25}>
				<S6Cta />
			</Scene>
			<Finish />
			{withAudio ? (
				// Mastered narration + music + SFX, built by audio/build_audio.py
				<Audio src={staticFile('audio/mix.wav')} />
			) : null}
		</AbsoluteFill>
	);
};
