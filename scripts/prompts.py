"""prompts.py -> art-src/prompts.md and art-src/sheets.txt from art.md (the list of drawings this video needs).
art.md lists one drawing per line under a heading, "- name: what it shows". Headings:
  ## objects      things, sent 4 per sheet on white
  ## characters   the recurring character, 4 poses per sheet on pure green (so white clothes survive the cut-out)
  ## scenes       small scenes with the character, 4 per sheet on pure green
The style text uses the palette in remotion/src/theme.json, so every drawing matches the video's colours.
Send the prompts in order in ONE image chat (ChatGPT or any image model) and save sheet N as art-src/<letter>.png."""
import json, re, string
th = json.load(open('remotion/src/theme.json'))['c']; cfg = json.load(open('project.json'))
char = cfg.get('character', 'a young adult with short dark hair, a teal hoodie, dark trousers and white sneakers, a simple friendly face with minimal features')
pal = f"bold flat colours only from this palette: {th['sun']}, {th['ink']}, {th['hot']}, {th['cool']}, white, with darker flat tones of the same colours for simple shadow shapes"
STYLE = (f"Style: flat vector illustration, modern animated explainer video style, {pal}. No outlines, no gradients, no textures, "
         "clean geometric shapes. No text, no letters, no numbers, no logos. Each item fully separate with wide empty space around it, nothing touching "
         "or overlapping, nothing cut off at the edge. Landscape 16:9, 2 by 2 grid.")
BG = {'objects': 'on a plain pure white background', 'characters': 'on a plain solid pure green background, color #00FF00, edge to edge, no white anywhere in the background',
      'scenes': 'on a plain solid pure green background, color #00FF00, edge to edge, no white anywhere in the background'}
groups, cur = {}, None
for line in open('art.md'):
    h = re.match(r'##\s*(\w+)', line)
    if h: cur = h.group(1).lower(); groups.setdefault(cur, []); continue
    m = re.match(r'-\s*([a-z0-9-]+)\s*:\s*(.+)', line.strip())
    if m and cur in BG: groups[cur].append((m.group(1), m.group(2).strip()))
out, sheets, L = ['# Image prompts (send in order, one chat, save sheet N as art-src/<letter>.png)\n'], [], iter(string.ascii_uppercase + string.ascii_lowercase)
first = True
for g, items in groups.items():
    for i in range(0, len(items), 4):
        batch = items[i:i + 4]; letter = next(L)
        while len(batch) < 4: batch.append(('-', 'a small simple star shape'))
        listed = ', '.join(f'{k + 1}) {d}' for k, (_, d) in enumerate(batch))
        if g == 'objects': body = f"Create an image. A sticker sheet of 4 separate objects arranged in a 2 by 2 grid, {BG[g]}: {listed}."
        elif g == 'characters': body = f"Create an image. A character sheet showing the SAME character in 4 separate poses, arranged in a 2 by 2 grid, {BG[g]}. The character: {char}. Poses: {listed}."
        else: body = f"Create an image. A sheet of 4 separate small scenes with the SAME character ({char}), arranged in a 2 by 2 grid, {BG[g]}: {listed}."
        if not first: body += ' Keep exactly the same style, palette and character as the earlier sheets in this chat.'
        first = False
        out.append(f"## Sheet {letter} ({g})\nSave as art-src/{letter}.png\n```\n{body} {STYLE}\n```\n")
        sheets.append(f"{letter}.png {'--green ' if g != 'objects' else ''}{' '.join(n for n, _ in batch)}")
open('art-src/prompts.md', 'w').write('\n'.join(out)); open('art-src/sheets.txt', 'w').write('\n'.join(sheets) + '\n')
print(len(sheets), 'sheets ->', 'art-src/prompts.md, art-src/sheets.txt')
