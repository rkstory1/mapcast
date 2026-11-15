#!/bin/bash
# finish.sh: mux the render with out/mix.wav -> out/<slug>-4k.mp4 (upload this), a 1080p copy made from the 4K, and a
# small phone copy (720p) to watch on the go. Then flicker.py on all three.
set -e
cd "$(dirname "$0")"
SLUG=$(./py -c "import json;print(json.load(open('project.json'))['slug'])")
mux() { ffmpeg -v error -y -i "$1" -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$2"; }
if [ -f remotion/out/master-2x.mp4 ]; then
  mux remotion/out/master-2x.mp4 "out/$SLUG-4k.mp4"
  ffmpeg -v error -y -i "out/$SLUG-4k.mp4" -vf scale=1920:1080:flags=lanczos -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart "out/$SLUG-1080p.mp4"
else
  mux remotion/out/master-1x.mp4 "out/$SLUG-1080p.mp4"
fi
ffmpeg -v error -y -i "out/$SLUG-1080p.mp4" -vf scale=1280:720:flags=lanczos -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart "out/$SLUG-phone.mp4"
for f in out/$SLUG-*.mp4; do echo "$f: $(./py flicker.py "$f" | head -1)"; done
ls -la out/*.mp4
