#!/usr/bin/env bash
# Validate a rendered ad: container/stream specs, loudness, per-second audio levels,
# and a 1 fps contact sheet to inspect visually.
# Usage: verify_video.sh <mp4> [expected-seconds=30] [width=1080] [height=1920] [fps=30]
set -euo pipefail
f="${1:?usage: verify_video.sh <mp4> [seconds] [w] [h] [fps]}"
secs="${2:-30}"; w="${3:-1080}"; h="${4:-1920}"; fps="${5:-30}"
fail=0
probe() { ffprobe -v error -select_streams "$1" -show_entries "stream=$2" -of default=nw=1:nk=1 "$f" | head -1; }
check() { if [ "$2" = "$3" ]; then echo "ok   $1 = $2"; else echo "FAIL $1 = $2 (want $3)"; fail=1; fi; }
check video_codec "$(probe v:0 codec_name)" h264
check width "$(probe v:0 width)" "$w"
check height "$(probe v:0 height)" "$h"
check fps "$(probe v:0 r_frame_rate)" "$fps/1"
check pix_fmt "$(probe v:0 pix_fmt)" yuv420p
check frames "$(probe v:0 nb_frames)" "$((secs * fps))"
check audio_codec "$(probe a:0 codec_name || echo none)" aac
echo "size: $(du -h "$f" | cut -f1)"
echo "loudness (target about -14 LUFS, true peak <= -1 dBTP):"
ffmpeg -hide_banner -i "$f" -map 0:a -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E "I:|Peak:" || true
echo "per-second mean volume (dB) - silence or big dips show up here:"
for ((t = 0; t < secs; t++)); do
	v=$(ffmpeg -hide_banner -ss "$t" -t 1 -i "$f" -map 0:a -af volumedetect -f null - 2>&1 | grep -o 'mean_volume: [-0-9.]*' | cut -d' ' -f2)
	printf "%s:%s " "$t" "$v"
done; echo
sheet="${f%.*}_contact-sheet.png"
ffmpeg -v error -y -i "$f" -vf "fps=1,scale=270:-1,tile=6x$(((secs + 5) / 6))" -frames:v 1 "$sheet"
echo "contact sheet: $sheet"
exit $fail
