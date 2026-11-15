# beats.ts: every scene kind

`b(part, 'first spoken words', kind, { props })`. The beat starts 0.08 s before its first word and lasts until the
next beat. Inner cues (c, subC, ...) are also spoken words of the SAME part; use 2 or 3 words so they are unique.
Colours: 'sun', 'ink', 'hot', 'cool', 'canvas', 'white' (theme.json roles) or '#hex'. Drawings: names in
remotion/public/art without .svg (a .jpg/.png with its extension also works).

| kind | what it shows | props |
|---|---|---|
| `c` | a colour scene that wipes in, with a slow camera push | `bg`, `lay` (L, R, C, 2, 3, arrow), `arts: []`, `slam` (headline), `tags: [{ t, c? }]`, `fig: { to, pre?, unit?, label, c? }`, `tall: []` (names of tall drawings, shown bigger) |
| `m` | a mind-map page: a node card on the left, the layout on the right | `node` (card label) + the same layout props as `c` |
| `tour` | the progress map: all sections as cards on the canvas; the camera glides to `focus`, finished ones get a check | `nodes: []` (the same list every time), `focus` (0-based), `art?`, `tag?` |
| `section` | a chapter title on the canvas | `n` (number, 0 hides it), `title`, `label` ('PART', 'STEP', 'RULE'...), `alt` (hot pill) |
| `big` | one huge number or word (hooks, stats) | `bg`, `big`, `sub?`, `subC?`, `art?` |
| `board` | a recurring model in columns that fills up; rows of labels under it | `cols: [{ name, art?, c? }]`, `rows?: [{ title?, items: [], c: [] or '', color? }]`, `full?`, `bg?` |
| `layers` | stacked isometric slabs (levels of an idea) | `title?`, `layers: [{ name, note?, c?, color? }]` (top first) |
| `cmp` | two cards side by side | `bg`, `title?`, `l` and `r`: `{ t, art?, c?, bad? }` |
| `rows` | a list, row by row | `bg`, `title?`, `rows: [{ t, c?, art?, n?, mark?, to? }]`, `size?` |
| `bars` | bars that grow to a value | `title`, `bars: [{ l, v (0-100), c?, label?, color? }]`, `bg?` |
| `curve` | expectation (straight) vs reality (flat, then up) | `expect?`, `real?`, `gap?`, `gapC?`, `x?` |
| `growth` | compounding: one line up, one down, formulas on cue | `up`, `upC?`, `down?`, `downC?`, `x?`, `title?` |
| `grid` | a tracker (a month of days, X on each) | `title`, `n?` (28), `missed?: []` |
| `quote` | a short credited quote | `text`, `by`, `bg?` |
| `card` | the user's own framework as a card | `head`, `rows: [[key, text, cue]]`, `flip?`, `color?`, `foot?` |
| `end` | the end screen (20 s, two video slots, subscribe) | none; always the last beat, on 'subscribe' |

## Pacing
- A new beat every 3 to 6 s; inside a long beat, something new on a cue word (a tag, a second drawing, a figure).
- Every beat shows its main drawing or headline from its first frame; only the second element waits for a cue.
- Colour rhythm: alternate backgrounds so two neighbours never share a colour; canvas scenes (m, tour, section,
  curve, growth, quote) between colour scenes give the eye a rest.
- The progress map at every section start; a section card for the big chapters.
- Adding a new scene kind: write it in scenes.tsx in the same style, add a case in Video.tsx, document it here.
