// Render inspection stills: node scripts/stills.mjs <outDir> <sec> <sec> ...
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const [outDir, ...secs] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const shell = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = fs.existsSync(shell) ? shell : undefined;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {withAudio: false};
const composition = await selectComposition({serveUrl, id: 'AgencyAd', inputProps, browserExecutable});
for (const s of secs) {
	const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * 30));
	const output = path.join(outDir, `t${Number(s).toFixed(2).padStart(5, '0')}.png`);
	await renderStill({serveUrl, composition, frame, output, inputProps, browserExecutable, imageFormat: 'png'});
	console.log('rendered', output);
}
