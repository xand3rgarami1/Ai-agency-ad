# Twiddle — missed-call recovery offer ad (30s, 9:16)

Final video: `output/twiddle-missed-call-offer_30s_1080x1920.mp4` (1080×1920, 30 fps, H.264/AAC, −14 LUFS)

Offer-led companion to the systems ad in the repo root. Built from the `motion-ad-video` skill template.

- Script / voice: `src/config/voiceover.json` (Kokoro `af_heart`), timings in `voiceover/script.md`
- Scenes: `src/scenes/OfferScenes.tsx` (hook → why calls are missed → each call's value → answer/text/book system → $10K–$20K → no new staff/software → CTA)
- Brand / CTA: `src/config/brand.ts` (CTA "Recover Your Missed Calls")
- Rebuild: `npm run audio` (needs Kokoro models in `audio/models/`, see the skill's `scripts/setup_kokoro.sh`), then `npm run render`

The $10K–$20K/month figure is the client's own offer claim, shown with "can mean" wording and an on-screen "Results vary by business and call volume." line.
