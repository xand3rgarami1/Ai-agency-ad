# Twiddle — "Chaos to one board" ad (30s, 9:16)

Final video: `output/twiddle-one-board_30s_1080x1920.mp4` (1080×1920, 30 fps, H.264/AAC, −14 LUFS)

Angle: one place for every inquiry, owner and next action. Hook: "Your leads live in five places."
Built from the `motion-ad-video` skill template.

- Script / voice: `src/config/voiceover.json` (Kokoro `af_heart`), timings in `voiceover/script.md`
- Scenes: `src/scenes/BoardScenes.tsx` (5 places → text/DM/sticky note/email → nobody owns it, leads go cold → cards fly into one board → owner + next action fill in → nothing slips → CTA)
- Brand / CTA: `src/config/brand.ts`
- Rebuild: `npm run audio` (Kokoro models in `audio/models/`, see the skill's `scripts/setup_kokoro.sh`), then `npm run render`
