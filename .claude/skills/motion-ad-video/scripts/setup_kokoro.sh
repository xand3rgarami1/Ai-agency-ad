#!/usr/bin/env bash
# Install the Python audio deps and fetch the Kokoro TTS model (open-weight, Apache-2.0).
# The model comes from GitHub releases, which works where huggingface.co is blocked.
# Usage: setup_kokoro.sh <project-dir>
set -euo pipefail
proj="${1:?usage: setup_kokoro.sh <project-dir>}"
models="$proj/audio/models"
mkdir -p "$models"
pip install -q -r "$proj/audio/requirements.txt"
base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
	[ -s "$models/$f" ] || curl -fsSL -o "$models/$f" "$base/$f"
done
ls -la "$models"
python3 -c "import kokoro_onnx, soundfile, scipy, pyloudnorm; print('kokoro ready')"
