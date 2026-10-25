# Voice, music and mix reference

## Contents
1. Choosing a TTS provider
2. Kokoro (local fallback)
3. Fitting the narration to the runtime
4. Word timings
5. Music and SFX (`build_audio.py`)
6. Mixing and mastering
7. What you can and can't verify

## 1. Choosing a TTS provider

Order of preference:
1. A human recording the user supplies (best for paid campaigns).
2. A TTS service that is already configured and **actually works**: ElevenLabs, OpenAI,
   Amazon Polly (generative/neural), Google, Azure. Finding credentials in the environment isn't
   enough. Make one cheap, read-only call first (e.g. Polly `describe_voices`, ElevenLabs
   `/v1/voices`) with short timeouts. In the original session AWS keys were present but Polly
   rejected them ("security token invalid"). Never ask for or add new paid credentials yourself.
3. Kokoro, run locally (free, Apache-2.0). This is the reliable fallback.

Tell the user which one you used and why. If the voice is synthetic, say so plainly and offer the
human re-record path (`voiceover/script.md` has every line's in/out time).

## 2. Kokoro (local fallback)

- Install with `scripts/setup_kokoro.sh <project>`. The model downloads from GitHub releases;
  huggingface.co is often blocked in sandboxes.
- Voices, by the model's published quality grades: `af_heart` (A, warm natural female, the best
  choice when asked for "professional"), `af_bella` (A−), then male `am_michael`, `am_fenrir`,
  `am_puck` (C+), British `bm_george`/`bm_fewis` (C). If the user asks for a male voice, use
  `am_michael`, and say the female voices are higher quality.
- `speed` is nonlinear and changes little below about 1.1. Above ~1.15 it starts to sound
  rushed; that was the complaint that led to switching voices in the original session.
- Set `lang="en-us"`. "AI" is read as "A.I.".

## 3. Fitting the narration to the runtime

`src/config/voiceover.json` holds the voice, speed, lead-in and per-line `pauseAfter`.
`build_voiceover.py` places the lines back to back and exits with an error if the narration ends
later than 1.4 s before the end; that space is reserved for a readable end card.

To fit:
1. Generate once and read the printed in/out times.
2. Adjust pauses first (0.22–0.7 s; longer before the big turn, shorter between list items).
3. Only then nudge speed, preferring a better voice at natural pace over a sped-up one.

Roughly 72 words fit 30 s with ~2 s of end card at a natural pace.

## 4. Word timings

Kokoro returns audio only, so `build_voiceover.py` estimates word starts: it finds internal pauses
(commas) from the audio envelope, then spreads the words inside each phrase by character length.
That's accurate to roughly ±0.1 s, which is enough because words are revealed slightly ahead of
speech. If a provider returns real timestamps (ElevenLabs `with-timestamps`, Polly speech marks),
write those into `timeline.generated.json` instead, using the same shape.

`timeline.generated.json` is generated output; don't hand-edit it. Cuts and cues live in
`timeline.json` as anchors (`"line:wordIndex"`, `"line:end"`, `"scene:id"` or seconds, plus an
`offset`), and both the scenes and `build_audio.py` resolve them. Change the voice, rebuild,
and everything re-syncs.

## 5. Music and SFX (`build_audio.py`)

Everything is synthesised with numpy/scipy, so it's original and license-free:
- Pads: detuned additive saws with brightness per section. Plus a sub, a soft kick, hats and a
  16th-note arpeggio.
- Arrangement follows the scenes: a dark drone (hook) → muted, tense minor progression (problem)
  → riser and a 0.12 s drop-out → full, confident section on the drop (solution) → open major
  (dashboard) → sparse pad (CTA setup) → resolving add9 chord with bells on the end card.
- SFX types, keyed by `type` in `timeline.json` cues: `impact`, `impactSoft`, `whoosh`, `cut`,
  `click`, `tick`, `blip`, `slide`, `typing` (dur, count), `stack` (dur, count), `riser` (dur, ends
  at `at`), `shimmer`, `chime`, `pulse`, `scan`, `check`, `resolve`.
- Visual events that make sound (typing, stacking rows, checkmarks) read their timing from the
  same cue so they line up exactly.

To change the mood, edit `CHORDS`, the progressions, and the `chord(...)` gains/brightness in
`build_music`. Keep the per-section structure tied to `scenes`.

## 6. Mixing and mastering

- Music is ducked ~8 dB under the voice by an envelope follower.
- Stems are balanced by loudness: music ~13 LU under the voice, SFX ~9 LU under it.
- The mix is gained to −14 LUFS and run through a look-ahead limiter at −1.2 dBFS, and written to
  `public/audio/mix.wav`. The composition plays only this file. Summing separate stems inside
  Remotion either clips or ends up ~5 dB too quiet once peaks are respected.
- Unmastered stems (`stem_vo/music/sfx.wav`, −6 dB) are kept for re-mixing elsewhere.
- Check section balance, not just the integrated number. The first mix of the original session had
  the problem section's music 25 dB under the voice, which is effectively silent:

```bash
python3 - <<'EOF'
import soundfile as sf, numpy as np
db=lambda x:20*np.log10(np.sqrt((x**2).mean())+1e-9)
vo=sf.read('public/audio/stem_vo.wav')[0]; mu=sf.read('public/audio/stem_music.wav')[0]
print(' '.join(f"{t}:{db(mu[t*48000:(t+1)*48000])-db(vo[t*48000:(t+1)*48000]):.0f}" for t in range(0,28,2)))
EOF
```

Music 6–17 dB under the voice is the useful range, and the solution section should be the loudest.

## 7. What you can and can't verify

You can't listen. Verify with numbers: integrated loudness and true peak (`verify_video.sh`), the
per-second level table (no unexpected silence), and the section balance above. Then tell the user
plainly that they should listen before running the ad.

If the user says they can't hear the audio, measure the file first. If it's fine, the usual cause
is the phone: iPhone silent mode (a crossed-out bell in the status bar) mutes in-app video
previews, or the player itself is muted.
