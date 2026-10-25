#!/usr/bin/env bash
# Summarise a reference video for pacing analysis: specs, 1 fps contact sheets, cut times.
# Usage: reference_sheet.sh <video> <out-dir>
set -euo pipefail
src="${1:?usage: reference_sheet.sh <video> <out-dir>}"
out="${2:?usage: reference_sheet.sh <video> <out-dir>}"
mkdir -p "$out"
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of compact "$src"
# 24 frames (6x4) per sheet, one per second
ffmpeg -v error -y -i "$src" -vf "fps=1,scale=270:-1,tile=6x4" "$out/sheet_%02d.png"
echo "contact sheets:"; ls "$out"/sheet_*.png
echo "cuts (scene change > 0.3), seconds:"
ffmpeg -v error -i "$src" -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 \
	| grep -o 'pts_time:[0-9.]*' | cut -d: -f2 | tr '\n' ' '; echo
