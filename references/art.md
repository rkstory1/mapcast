# Art: one style, 2x2 sheets, cut out and traced to SVG

## The look
Flat vector illustration in the modern animated-explainer style: bold flat colours only from the video's palette
(theme.json), darker flat tones of the same colours for simple shadows, no outlines, no gradients, no textures, clean
geometric shapes, no text in the drawings. One recurring character (project.json "character") so the video has a
face to follow. prompts.py writes all of this into every prompt, so you never type the style by hand.

## Why sheets of four
One image per drawing is slow and drifts in style. A 2x2 sheet gives four drawings in one generation, in the same
style, and big enough to cut out cleanly (a 3x3 sheet makes the drawings too small). Always one chat per video, so
each sheet says "the same style and character as the earlier sheets in this chat".

## Backgrounds
- Objects on **pure white**: slice.py flood-fills the white from the cell edges.
- Characters and scenes on **pure green #00FF00**: slice.py keys the green out. White on a white background (white
  sneakers, a white shirt, a white mug) gets eaten by the flood fill, so anything with a character goes on green.

## Making the sheets
Route 1, ChatGPT in the user's Chrome (Claude in Chrome tools):
1. Open chatgpt.com in a new tab (the user is signed in), start a new chat, name it after the video.
2. Paste `SKILL/scripts/chatgpt-helpers.js` with javascript_tool. Then queue the prompts from art-src/prompts.md:
   `window.mcQueue = [[prompt2, 'B.png'], [prompt3, 'C.png'], ...]; window.mcNextSave = 'A.png'; await mcSend(prompt1)`.
3. Call `await mcStep()` again and again (each call waits up to 36 s): when a sheet is finished it is downloaded to
   the Downloads folder under its letter name and the next prompt is sent. Move the files into art-src/.
4. ChatGPT sometimes shows two versions and asks which is better: pick one (click it) and call mcStep again.
5. Click the message box by its ref (find "message"), never by screen coordinates.
Route 2, the user makes them: give them art-src/prompts.md. Any image tool works (ChatGPT, Gemini, Midjourney,
Ideogram, Leonardo). They save each sheet as art-src/A.png, B.png ... in order.

## Cutting out
`./py slice.py --all` reads art-src/sheets.txt and writes remotion/public/art/<name>.svg (and .png).
Open the PNGs of each sheet once. Fixes, one sheet at a time (`./py slice.py art-src/C.png name1 name2 name3 name4 --flag`):
- `--holes`: white holes inside a drawing (a tyre, a cup handle) stayed white. Clears enclosed white areas.
- `--close`: white parts of a drawing on a white sheet were cut away. Keeps them (or remake the sheet on green).
- A drawing crossed into the next cell and lost a piece: remake that sheet asking for "wide empty space between".
- The order of the four drawings changed: check every sheet against its list before slicing; rename to fit.
- Drawings are traced with vtracer at native size. Its defaults work; custom settings or upscaling crashed it or made
  1 MB files.

## Rules
- Real people are never drawn as a likeness: name them in type, show their objects (a book, a medal, a desk).
- No logos, brands or copyrighted characters in the drawings.
- Reuse generic objects across videos (a clock is a clock); every video still needs its own key story scenes.
