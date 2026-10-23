import fs from 'fs';
import {Config} from '@remotion/cli/config';

// Use the locally installed Chromium headless shell when present (no download needed).
const localShell = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (fs.existsSync(localShell)) {
	Config.setBrowserExecutable(localShell);
}

Config.setVideoImageFormat('png');
Config.setCodec('h264');
Config.setCrf(18);
Config.setX264Preset('slow');
Config.setPixelFormat('yuv420p');
Config.setAudioCodec('aac');
Config.setAudioBitrate('320k');
Config.setConcurrency(4);
Config.setOverwriteOutput(true);
