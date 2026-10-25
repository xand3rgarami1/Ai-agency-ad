---
name: motion-ad-video
description: Produce a finished, rendered motion-graphics promo video (vertical 9:16 Reels/TikTok/Shorts ad, or other formats) with Remotion + React + TypeScript. Covers kinetic typography synced word by word to a voiceover, code-built mock software UI and workflow diagrams, local text-to-speech narration (Kokoro) or a configured TTS service, original synthesised music and sound effects with ducking and mastering, a configurable brand end card (logo, name, CTA, URL), and validation of the final MP4 (specs, loudness, frame contact sheets). Use this whenever someone wants a video ad, promo, product or agency launch video, social reel, explainer, animated commercial or "motion graphics" made, wants a reference video's style recreated, or wants changes to such a video (new voice, logo, name, CTA, timing), even if they don't mention Remotion and only describe the video they want.
---

# Motion ad video

Turn a brief (script, brand, audience, maybe a reference video) into a **rendered, inspected MP4**
plus an editable project. The deliverable is the video, not a storyboard or a pile of components:
keep going until the file is rendered, measured and looked at.

The bundled template (`assets/template/`) is a complete, working 30 s 9:16 ad. Its config, timing
engine, components, audio pipeline and scripts are reusable as they are; its six scenes are a
worked example you rewrite for each new brief.

## Files in this skill

- `assets/template/`: the Remotion project (copy it with `scripts/scaffold.sh`).
- `scripts/scaffold.sh <dest>`: copy the template, `npm install`, typecheck.
- `scripts/setup_kokoro.sh <project>`: Python audio deps plus the Kokoro TTS model.
- `scripts/reference_sheet.sh <video> <out>`: contact sheets and cut times for a reference video.
- `scripts/extract_logo.py <image> <out> [--box …]`: cut a logo out of a screenshot or PNG onto
  transparency, in white, black and colour versions.
- `scripts/verify_video.sh <mp4>`: spec checks, loudness, per-second levels, contact sheet.
- `references/design.md`: safe zones, type scale, colour, motion vocabulary, mock-UI rules,
  frame review. Read it before planning scenes.
- `references/audio.md`: TTS choice, Kokoro voices, fitting narration, music/SFX, mastering.
  Read it before generating audio.
- `references/troubleshooting.md`: known failures and fixes.

## Template map (what to edit)

| Purpose | File |
|---|---|
| Brand: name, logo, CTA, URL, colours, fonts, type scale | `src/config/brand.ts` |
| Narration text, voice, speed, pauses | `src/config/voiceover.json` |
| Format (width, height, fps, runtime), scene boundaries, SFX/UI cues anchored to spoken words | `src/config/timeline.json` |
| Generated word timings (output of the audio build; don't hand-edit except to match a human read) | `src/config/timeline.generated.json` |
| Timing helpers: `word()`, `cue()`, `sceneStart()`, `SCENES` | `src/config/timing.ts` |
| Animation primitives: `prog`, `reveal`, `conceal`, `springAt`, `rand` | `src/components/anim.ts` |
| Text: `KineticWords`, `lineWords`, `Slam`, `MaskLine`, `Kicker`, `StackHeadline` | `src/components/` |
| `Scene` (time window plus enter/exit), `Connector`, `Backdrop`, `Finish` | `src/components/` |
| UI kit: `Panel`, `Badge`, `Status`, `Icon`, `Row`, `Bar` | `src/ui/` |
| Example scenes S1–S6 and the composition | `src/scenes/`, `src/AgencyAd.tsx`, `src/Root.tsx` |
| Narration and word timings | `audio/build_voiceover.py` |
| Music, SFX, ducking, mastered `public/audio/mix.wav` | `audio/build_audio.py` (`npm run audio`) |
| Many inspection stills from one bundle | `scripts/stills.mjs` |

Scenes use **absolute seconds**: `Scene` only gates visibility and doesn't offset frames, so a
scene can call `word('build', 6)` or `cue('s4.connect')` directly.

## Other runtimes and formats

`timeline.json` → `format` is the single source for width, height, fps and duration. Remotion,
the narration builder and the music builder all read it. Scene layouts, however, are absolute
pixels designed for 1080×1920:
- For 1080×1080 or 1920×1080, re-lay out each scene. Headline band at the top, the visual in the
  middle, and the safe zones from `references/design.md` adjusted to the platform. Also update
  the full-frame `<svg width={1080} height={1920}>` overlays in the scenes.
- For a shorter spot, drop or merge beats rather than speeding everything up. About 2.4 spoken
  words per second plus a ≥1.5 s end card is a natural fit, so 15 s holds ~30 words.
- The CTA scene's end-card beat is the `endcard` anchor. Keep it on the last line's payoff word.

## Workflow

### 1. Pin down the brief

Get, from the request or by asking only for what's genuinely missing:
- the script (use it verbatim) and the runtime;
- the format (default 1080×1920, 30 fps, H.264 + AAC);
- the brand: name, colours, logo file, CTA, URL;
- the audience and positioning;
- what to avoid;
- any reference video.

Never invent a URL, logo, statistic, testimonial or customer. Leave a clear placeholder
(`brand.ts` supports this) and list it in the hand-off.

### 2. Probe the environment

Check `node -v`, `ffmpeg`, `fc-list | grep -i inter`, Chromium (`/opt/pw-browsers`), Python
packages, and network reach (npm, pypi, github.com, huggingface.co). For narration, follow the
provider order in `references/audio.md` §1. If credentials exist, prove they work with a cheap
read-only call before relying on them, with timeouts.

### 3. Study the reference (if given)

Run `scripts/reference_sheet.sh <video> <scratch>/ref` and look at the sheets. Note the pacing
(seconds per beat), how text enters (blur, mask, scale, tracking), the transitions, the type style
and the layout. Borrow rhythm and technique; don't copy its content, footage or branding.

### 4. Scaffold and set the brand

`scripts/scaffold.sh <project-dir>` (inside the user's repo or working directory). Then edit
`brand.ts`. For a logo given as an image or screenshot, run
`python3 scripts/extract_logo.py <img> <project>/public/brand --name <brand> [--box x0,y0,x1,y1]`.
Open `<name>-check.png` to confirm clean edges. Use the white version on dark backgrounds. If the
logo is already a wordmark, decide whether the name also needs a text line
(`showNameWithLogo` stacks it underneath).

### 5. Narration first, then timing

Write the script into `voiceover.json`, run `scripts/setup_kokoro.sh <project>` if using Kokoro,
then `npm run audio`. Read the printed in/out times and fit the runtime (`references/audio.md` §3).
The visuals are timed to the voice, not the other way round.

If the brief's storyboard times don't fit natural narration, follow the voice. Set scene anchors
in `timeline.json` and note the change for the user.

### 6. Plan scenes against the real word times

Write a short beat table: scene, time window, narration, visual, on-screen text, cue sounds. Map the
brief's story onto the template's dramatic arc where it fits:

hook → problem (greyscale, fragmented) → rapid problem beats → turn (riser + drop) → solution (accent
colour, connections, automation) → calm proof (dashboard) → CTA end card held ≥2 s.

Read `references/design.md` now.

### 7. Build the scenes

Rewrite `src/scenes/*` for the new story using the components; add or remove scenes in
`AgencyAd.tsx` and the `ORDER` list in `timing.ts`. Add cues to `timeline.json` for every visual
event that should make a sound, and read those same cues in the scene so picture and sound share
one time. Keep everything deterministic (frame-driven only). Run `npx tsc --noEmit` often.

### 8. Look at it before rendering

Render stills across every beat (`node scripts/stills.mjs <dir> 0.2 1.0 …`), tile them into a
contact sheet, and review them against `references/design.md` §8. Fix and repeat. This loop is
cheap (seconds) compared with a full render (minutes) and catches most defects.

### 9. Audio pass

`npm run audio -- --skip-vo` after any cue or scene-boundary change. Check the printed loudness and
the per-section balance (`references/audio.md` §6).

### 10. Render and verify

`npm run render`, then `scripts/verify_video.sh output/<file>.mp4 [secs w h fps]`. Every line
should say `ok`, with about −14 LUFS and a peak ≤ −1 dBTP. Review the generated contact sheet and
a few full-size frames from the actual MP4 (`ffmpeg -ss <t> -i … -frames:v 1`). If anything is
off, fix it and render again.

### 11. Hand off

- Send the MP4 to the user (with a file-sending tool if available).
- Give the exact paths (video, contact sheet, `voiceover/script.md`, project) and a concise summary:
  specs as measured, the scene timeline, the voice used and why, and what's synthetic.
- Disclose placeholders and limitations, and ask the user to listen, since you can't.
- Write or update a project README with the edit map and the regenerate commands.
- Commit if working in a repo.

## Follow-up changes

Re-run only what a change touches:
- **Name, logo, CTA, URL, colours:** edit `brand.ts`, check the end-card still, render, verify.
- **Voice or script:** edit `voiceover.json`, then `npm run audio` (everything re-syncs through
  the anchors). Check stills at the beat boundaries, render, verify, and update
  `voiceover/script.md`.
- **A human recording:** replace `public/audio/vo.wav` with the recording (48 kHz), with each line
  placed at its in-point from `voiceover/script.md`. Then `npm run audio -- --skip-vo` and render.
  Word reveals still use the TTS timings, so if the read differs noticeably, edit the word
  `start`s in `timeline.generated.json` to match. This is the one case where hand-editing it is
  right.
- **"I can't hear it":** measure the file before changing anything (`references/audio.md` §7).
