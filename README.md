# mapcast

A Claude Code skill that makes long-form animated explainer videos for YouTube, in the viral "animated summary"
style: flat vector drawings in bold colour, a mind-map canvas the camera travels across, headlines that slam in,
boards and charts that fill up as the narrator speaks. From an idea to a finished 4K video, thumbnails and upload copy.

Claude guides you through every step and waits for your OK:

1. **Setup**: installs Node, ffmpeg, Python packages and Remotion (once).
2. **Pitch**: researches the topic on YouTube and gives you 3 titles, a thumbnail direction and the hook.
3. **Script**: fact-checked, written for a voice over; you review it.
4. **Voice**: ElevenLabs, or any audio you record or generate (one file is fine, it cuts it into parts).
5. **Art**: image prompts in one style; ChatGPT (or any image tool) makes the sheets, mapcast cuts them into SVGs.
6. **Edit**: every scene timed to the spoken words in Remotion.
7. **Music and mix**: your music, ducked under the voice, -14 LUFS.
8. **Render**: 4K master, 1080p and a phone copy, flash-checked.
9. **Package**: captions, 3 thumbnails, title, description, chapters and tags.

## Install
Ask Claude Code:
```
Install the mapcast skill from https://github.com/rkstory1/mapcast into ~/.claude/skills/mapcast, then run its setup.
```
or by hand:
```
git clone https://github.com/rkstory1/mapcast.git ~/.claude/skills/mapcast
bash ~/.claude/skills/mapcast/scripts/setup.sh install
bash ~/.claude/skills/mapcast/scripts/setup.sh demo
bash ~/.claude/skills/mapcast/scripts/setup.sh showcase   # the 30 s showcase: map camera, 3D flip, whip, iris
```
Then tell Claude: "Make a mapcast video about <your topic>."

## Needs
macOS or Linux (Windows through WSL). Node 20+, ffmpeg, Python 3.9 to 3.12 (setup installs what is missing). An image
tool for the drawings (ChatGPT works well). For the voice: an ElevenLabs account, or your own recording.

## Licence
MIT. The demo and showcase drawings in assets/starter-art are for trying the skill; make your own art for your videos.
