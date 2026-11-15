# Showcase: Parkinson's Law in 30 seconds

The worked example of `motion.tsx`: a camera over a map of four scene cards (whip pans with motion blur, a zoom out
that reveals the map), a 3D flip, a whip, an iris and a push into the end card, every start cued to a spoken word.

`setup.sh showcase` makes a project from it and renders a contact sheet with no sound (the timing comes from the
included `timeline.json`, so it needs no voice). To make it a finished video:

1. Voice: generate the three parts of `script.md` (any voice; ElevenLabs eleven_v4 reads the tags) as
   `voice/01.mp3` to `voice/03.mp3`, then `transcribe.py`, `align.py`, `timeline.py` as in SKILL.md step 4.
   A different voice changes the timing, and every cue follows it.
2. Music: one light, playful track (comedy or quirky, 100 to 120 bpm, little energy at 1 to 4 kHz: `voiceband.py`)
   cut to the video length, saved as `music/track.wav`. Then `./py mix.py`.
3. Sound effects: `project.json` "sfx" already places 28 of them on the cue words. Get these seven from any library
   (the showcase used Epidemic Sound) and save them in `sfx/`: `pop.wav` (a short cartoon pop), `tick.wav` (a ticking
   clock loop), `flyby.wav` (a fast bright swoosh, about 1 s), `whoosh.wav` (a very short swish), `stamp.wav` (a rubber
   stamp or hand stamp impact), `clink.wav` (a small object hitting a glass jar), `squeeze.wav` (a cartoon squeak or
   squeeze). Then `./py sfx.py`.
4. `node render.mjs 2` in remotion/ and `bash finish.sh`.

The flicker check reports 3 frames on this example. They are by design (the odometer digits rolling and the shake
when the stamp lands), not render errors.
