#!/bin/bash
# sheet.sh <stills dir> -> <stills dir>/sheet-NN.jpg: 6x6 contact sheets of the stills, to read the whole video fast
d=${1:-remotion/out/s2}
ffmpeg -v error -y -pattern_type glob -i "$d/t*.jpg" -vf "scale=480:-1,tile=6x6:padding=4:color=white" "$d/sheet-%02d.jpg" && ls "$d"/sheet-*.jpg
