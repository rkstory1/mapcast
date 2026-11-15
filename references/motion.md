# motion.tsx: the showcase layer

`beats.ts` is the fast way to edit a long video: one line per beat, scene kinds from `scenes.tsx`. For a short,
high-polish piece (a 30 to 60 s intro, a trailer, a Short, a channel teaser, a hero section of a long video) build a
hand-made edit with `templates/remotion/src/motion.tsx`. The worked example is `examples/showcase/Showcase.tsx`
(Parkinson's Law, 30 s); `setup.sh showcase` makes a project from it and renders a contact sheet.

## The pattern
- Each scene is a plain component that reads the global time (`useT()`) and cues its own moments with `cue(part,
  'words')`. Scenes do not know about cuts; a scene can sit on the map, in a flip or in a whip unchanged.
- The cut is a chain at the bottom: `<Push a={<Iris a={<Whip a={<Flip a={map} b={x} />} b={y} />} b={z} />} b={end} />`.
  Each cut shows `a` before its time, `b` after it, and both only during the transition.
- Register the composition as `Video` in Root.tsx, so render.mjs, stills.mjs and finish.sh work unchanged.

## Pieces
| Piece | Does |
|---|---|
| `MapCamera cards moves node` | full-frame scene cards on a dotted canvas; the camera follows `moves`. At z 1 over a card it is a normal scene. Pans with `dip: .42` pull out mid-move to show the canvas, with motion blur from the real camera speed; zooms (`dip: 0`) stay sharp. `node` slams in a centre card with dashed links and card tags (the map reveal) |
| `Flip at a b` | the frame turns over like a card in 3D ("so flip it", before and after, myth and truth) |
| `Whip at a b` | a fast pan to the next scene with horizontal motion blur |
| `Iris at x y a b` | the next scene opens in a circle from the point it grows out of |
| `Push at a b` | a calm fade and settle, for the end card |
| `Odometer from to at s` | a number that rolls like a counter (years, prices, scores) |
| `Hi at bg c` | a highlight block that wipes on behind words, on their cue |
| `Rise`, `Pill`, `T`, `sp` | text that rises in, a pill that springs in, channel-font text, a spring from 0 to 1 |
| `Confetti at x y` | a burst in the theme colours |

## Rules that came from the showcase
- Plan the map before the scenes: card positions about 3000 px apart horizontally and 1800 px vertically leave room
  for the centre node and the links. A zoom out to about 0.33 shows four cards; push in to about 0.45 after.
- Motion blur must follow what the eye tracks: the content at the centre of the frame. Measuring the canvas origin
  instead blurred the whole zoom out into mush.
- A counter that shows hours and minutes must round the total minutes first (it showed "3:60").
- Rolling digits and a stamp's impact shake show up as "flashes" in flicker.py. Look at those frames: fast motion by
  design is fine, a layer that vanishes for one frame is not.
- Sound effects make this style: a whoosh on every pan and cut, a pop on every drawing that springs in, a stamp on
  every slam, ticks under a clock. Place them on the same cue words with `sfx.py` (references/sound.md).
