import generated from './timeline.generated.json';
import plan from './timeline.json';

export const FPS = 30;
export const DURATION_S = 30;
export const DURATION_FRAMES = DURATION_S * FPS;

export type Word = {text: string; start: number; end: number};
export type VoLine = {id: string; text: string; start: number; end: number; words: Word[]};

export const VO_LINES = generated.lines as VoLine[];

export type SceneId = keyof typeof plan.scenes;
type Anchor = {at: number | string; offset?: number};

const lineById = (id: string): VoLine => {
	const l = VO_LINES.find((x) => x.id === id);
	if (!l) throw new Error(`Unknown narration line "${id}"`);
	return l;
};

/** Resolve an anchor ("line:word", "line:end", "scene:id" or seconds) to seconds. */
export const resolve = (a: Anchor): number => {
	const off = a.offset ?? 0;
	if (typeof a.at === 'number') return a.at + off;
	const [kind, key] = a.at.split(':');
	if (kind === 'scene') return resolve((plan.scenes as Record<string, Anchor>)[key]) + off;
	const l = lineById(kind);
	if (key === 'end') return l.end + off;
	if (key === 'start') return l.start + off;
	const w = l.words[Number(key)];
	if (!w) throw new Error(`Line "${kind}" has no word ${key}`);
	return w.start + off;
};

export const sceneStart = (id: SceneId) => resolve(plan.scenes[id] as Anchor);

const ORDER: SceneId[] = ['opening', 'fragmented', 'leads', 'orders', 'team', 'system', 'unified', 'cta', 'end'];

/** Scene windows in seconds. 'endcard' is a beat inside the CTA scene, not a separate scene. */
export const SCENES = ORDER.slice(0, -1).map((id, i) => ({
	id,
	start: sceneStart(id),
	end: sceneStart(ORDER[i + 1]),
}));

export const cue = (id: string): number => {
	const c = plan.cues.find((x) => x.id === id);
	if (!c) throw new Error(`Unknown cue "${id}"`);
	return resolve(c as Anchor);
};

export const cueDef = (id: string) => plan.cues.find((x) => x.id === id) as Anchor & {dur?: number; count?: number};

/** Start time (s) of word `i` of narration line `id`. */
export const word = (id: string, i: number) => lineById(id).words[i].start;
export const voLine = lineById;

export const toFrame = (s: number) => Math.round(s * FPS);
