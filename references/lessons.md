# Lessons (mistakes already made with this pipeline; do not repeat them)

## Render
- The installed Google Chrome dropped whole layers on random frames (3 to 29 one-frame flashes per 30 s). Remotion's
  own headless shell gave 0. render.mjs uses the shell, renders 30 s segments in fresh browsers and flash-checks each.
  Use BROWSER= only if the shell will not start, and then check every file with flicker.py.
- CONC=4 ran out of memory on a 16 GB Mac at 4K. CONC=2 works, about 1 to 2 minutes per 30 s segment.
- The headless shell can stall while the computer's display sleeps: keep the machine awake during a render
  (macOS: `caffeinate -dims node render.mjs 2`).
- A counting number can look like a flash to flicker.py; look at those frames before re-rendering.

## Edit
- A cue on a common word ("the", "and", a name said twice) matched an earlier word and the beat started too early,
  breaking the order. Use two or three words, and run checkcues.py after every change.
- Text cued to a word near the end of a beat showed for under a second, and drawings cued late left frames empty.
  Every beat shows its main drawing or headline from its first frame.
- Read contact sheets every 2 s before rendering; a frame that only shows a label for 3 s looks broken.

## Art
- A sheet came back with its drawings in a different order than the prompt: check every sheet before slicing.
- Flood fill ate white sneakers on a white sheet. Characters go on pure green (#00FF00) and are keyed.
- 3x3 sheets made drawings too small for a clean cut; 2x2 is the right size.
- vtracer crashed with custom settings and made 1 MB files when the input was upscaled: defaults, native size.

## Sound
- Music measured with plain RMS looked fine but sat 4 dB OVER the voice in the pauses (lo-fi bass fools RMS).
  Measure in LUFS with gap.py. -28 LUFS music, ratio 5, release 800 ms gave the voice about 20 dB of room.
- Some music libraries refuse edits over 300 s per track: place the music changes so no section is longer.

## Voice
- Report the video length from the sum of the real part durations (timeline.py), never from an estimate.
- A direction tag the model does not support was read out loud: tts.py removes tags for models without tag support.
