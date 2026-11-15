# Music and mix

## Picking music
- 2 to 5 calm instrumental tracks for a 10 to 20 minute video: lo-fi, soft piano, gentle acoustic, warm electronic.
  One for the hook and first section, a change at each big section, a hopeful one for the close.
- The voice must stay clear: `./py voiceband.py music/*` shows how much of each track sits in the 1 to 4 kHz voice
  band. Under about 2% is good; over 5% fights the voice (busy guitars, vocals, bright synths). LRA under about 6
  means a steady bed without big swells.
- Rights: only music the user may use on YouTube (YouTube Audio Library, a paid library subscription, or their own).
  Credit it in the description if the licence asks.
- Track longer than its section: mix.py trims it. Shorter: mix.py loops it (pick tracks that loop cleanly).

## project.json
```
"music": [ { "file": "music/a-track.mp3", "from": 1 }, { "file": "music/b-track.mp3", "from": 9 } ]
```
`from` = the part where the track starts (it crossfades in 0.6 s before that part, over 2.5 s). Put the changes at a
section breath (a longer pause set in `breaths`).

## The mix (mix.py)
- Voice: each part levelled to -17 LUFS, a 70 Hz high-pass, light compression.
- Music at -28 LUFS before ducking, sidechain ratio 5, release 800 ms: a steady bed that dips under speech and comes
  up a little in the breaths, with no pumping between words.
- Master: one static gain to -14 LUFS (YouTube's level) and an oversampled limiter at about -1.5 dBTP. Never
  loudnorm (it pumps).
- `./py gap.py`: the voice should be about 18 to 22 dB above the music while talking. Measure, then listen on
  headphones. A mix where the music came up 4 dB OVER the voice in the pauses was the most common complaint;
  -28 LUFS with ratio 5 fixed it.
