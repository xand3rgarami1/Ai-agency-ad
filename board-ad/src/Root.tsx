import React from 'react';
import {Composition} from 'remotion';
import {AgencyAd} from './AgencyAd';
import {DURATION_FRAMES, FPS, HEIGHT, WIDTH} from './config/timing';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="AgencyAd" component={AgencyAd} durationInFrames={DURATION_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{withAudio: true}} />
	</>
);
