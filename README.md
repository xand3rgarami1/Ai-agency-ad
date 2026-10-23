# AI Agency Ad — 30s vertical motion graphics spot

Final video: **`output/ai-agency-ad_30s_1080x1920.mp4`**
1080×1920 (9:16) · 30 fps · 900 frames · H.264 High, yuv420p · AAC 320 kb/s 48 kHz stereo · −14 LUFS integrated, −1.1 dBTP

Built with **Remotion 4 + React + TypeScript**. All UI, typography and motion are code, so every
frame is deterministic and editable. Music and sound effects are synthesised from scratch in
Python (no samples). Narration is generated locally with the open‑weight Kokoro TTS model.

## Quick start

```bash
npm install
npm run studio          # live preview / scrub in the browser
npm run render          # -> output/ai-agency-ad_30s_1080x1920.mp4
```

Regenerating audio (only needed after changing script, timing or sound):

```bash
pip install -r audio/requirements.txt
# Kokoro model files (~350 MB, Apache-2.0) go in audio/models/ (git-ignored):
curl -L -o audio/models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -L -o audio/models/voices-v1.0.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
npm run audio           # narration + timings + music + sfx + mastered mix
npm run audio -- --skip-vo   # keep narration, rebuild music/sfx/mix only
```

## Where to change things

| What | File |
|---|---|
| Agency name, logo, CTA text, URL | `src/config/brand.ts` (`BRAND`) |
| Colours, fonts, type scale | `src/config/brand.ts` (`COLORS`, `FONTS`, `TYPE`) |
| Narration text, voice, speed, pauses | `src/config/voiceover.json` → `npm run audio` |
| Scene boundaries, SFX / UI cue times | `src/config/timeline.json` (anchored to spoken words) |
| Generated word timings (don't hand-edit) | `src/config/timeline.generated.json` |
| Scene visuals | `src/scenes/S1Opening.tsx` … `S6Cta.tsx` |
| Reusable pieces | `src/components/` (kinetic text, scene transitions, connectors, backdrop), `src/ui/` (panels, icons, rows) |

**Logo:** the Twiddle wordmark is in `public/brand/` (`twiddle-logo-white.png` used on the black end
card, plus a transparent black version). It was cut out of the supplied screenshot; for the sharpest
result replace it with the original vector file and point `logoSrc` at it. With `logoSrc: null` a
dashed "LOGO" slot is shown. `showNameWithLogo` prints `agencyName` beside the logo (off, since the
logo is already the wordmark).
**URL:** `url: null` hides the line; no URL is invented.

## Structure

```
src/config/      brand.ts, timing.ts, voiceover.json, timeline.json, timeline.generated.json
src/components/  anim.ts, Text.tsx (KineticWords, Slam, MaskLine), Scene.tsx (enter/exit),
                 StackHeadline.tsx, Connector.tsx (purple workflow paths + pulses), Backdrop.tsx
src/ui/          Panel.tsx, Icon.tsx, Rows.tsx
src/scenes/      S1Opening, S2Fragmented, S3Problems (3a/3b/3c), S4System, S5Unified, S6Cta
audio/           build_voiceover.py (Kokoro TTS + word timings), build_audio.py (music, sfx, ducking, master)
public/audio/    mix.wav (what the video plays), stem_vo/music/sfx.wav (for re-mixing), vo.wav (raw)
voiceover/       script.md (script with exact in/out times, for a human re-record)
scripts/         stills.mjs (render inspection frames)
output/          final MP4 + contact sheet
```

## Timeline (as rendered)

| Scene | Time | Narration |
|---|---|---|
| 1 Opening | 0.00–3.15 | "Your business didn't reach eight figures by accident." |
| 2 Fragmented systems | 3.15–6.88 | "But the systems that got you here might be what's holding you back." |
| 3a / 3b / 3c Problems | 6.88–12.43 | "Leads slipping through. Orders entered manually. Your team buried in repetitive work." |
| 4 Connected system | 12.43–21.10 | "We build custom AI systems that connect … without adding more complexity." |
| 5 Unified dashboard | 21.10–24.35 | "Built around your business. Designed for growth." |
| 6 CTA / end card | 24.35–30.00 | "If your systems can't keep up with your revenue, let's fix that." (end card from 26.95, held to 30.0) |

Scene boundaries follow the natural narration instead of the brief's nominal storyboard times:
read at a natural pace, lines 7–9 do not fit the 2 s / 3 s windows in the brief, so every cut is
anchored to the spoken word in `timeline.json` and stays in sync if the VO is regenerated.

## Notes / limitations

- The narration is synthetic (Kokoro `am_michael`). For a paid campaign, a human voice actor is
  recommended: record against `voiceover/script.md`, replace `public/audio/vo.wav`, run
  `npm run audio -- --skip-vo`, then `npm run render`.
- The dashboard chart has no axis values and no metrics are claimed; mock UI copy is generic
  (no customer names, logos or testimonials).
- Fonts: Inter / Inter Display / JetBrains Mono from the system. On another machine install
  them (all OFL) or the render falls back to system sans.
