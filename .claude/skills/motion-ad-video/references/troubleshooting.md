# Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Remotion tries to download Chrome, or fails to launch a browser | No bundled headless shell | `remotion.config.ts` already points at `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell` when it exists. Elsewhere, set `Config.setBrowserExecutable` to any local Chromium. |
| Output `pix_fmt=yuvj420p` (full range) | JPEG frame capture | Keep `setVideoImageFormat('png')` and `setPixelFormat('yuv420p')`. Platforms expect TV-range yuv420p. |
| File is ~100 MB for 30 s | Per-frame grain at high opacity plus a low CRF | Grain opacity ≈0.045, CRF 18, `x264 preset slow` gives ~10 MB with no visible loss. |
| Kokoro model download 403 | huggingface.co blocked | Use the GitHub release URLs in `setup_kokoro.sh`. |
| `pip install` hangs | Slow index connection | `pip install --timeout 30 …`, then retry. |
| A provider call hangs forever | No client timeout | Set connect/read timeouts (boto3 `Config(connect_timeout=10, read_timeout=20, retries={'max_attempts': 1})`). |
| `build_voiceover.py`: "too long for a 30s spot" | Narration plus pauses past `DURATION - 1.4` | Shorten pauses, then raise speed slightly, or pick a faster-paced voice. |
| Words appear late or early | Estimated word timings | Adjust `lead` on that `KineticWords`, or the cue `offset`. Don't edit the generated JSON. |
| Big headline wraps badly | Auto-wrap | Split into one `KineticWords` per line with word slices. |
| Mix sounds quiet after "normalising" | Peak-limited gain | Use the limiter path in `build_audio.py`, not plain peak normalisation. |
| Music inaudible in one section | Section gains plus ducking | Check per-section balance (references/audio.md §6) and raise that section's `chord()`/pluck gains. |
| `remotion still` is slow for many frames | Re-bundles every call | `node scripts/stills.mjs <dir> <sec>…` bundles once. |
| User hears no sound | Phone silent mode or muted player | Measure the file first (`verify_video.sh`); if it's fine, explain silent mode/unmute. |
| Removing temp files with `rm -f $DIR/*` is refused | Safety check on unguarded variables | Use `rm -f "${DIR:?}"/*.png` or a literal absolute path. |
