"""slice.py sheet.png name1 name2 name3 name4 [--grid=2x2] [--green] [--holes] [--close]
   slice.py --all   (every line of art-src/sheets.txt: "A.png [--green] name1 name2 name3 name4")
-> remotion/public/art/<name>.svg (and .png). Cuts an image sheet into its cells, removes the background, crops to the
drawing and traces it to SVG with vtracer, so every drawing stays sharp at 4K. Names '-' are skipped.
White sheets: the background is flood-filled from the cell edges (--holes also clears enclosed white areas larger than
1.5% of the cell, like the inside of a tyre; --close keeps white parts of the subject that touch the edge).
Green sheets (--green): pure #00FF00 is keyed out, so white clothes and white objects survive."""
import sys, os, numpy as np, vtracer
from PIL import Image
from collections import deque
from scipy import ndimage
OUT = 'remotion/public/art'; os.makedirs(OUT, exist_ok=True)

def cut(src, names, cols=2, rows=2, green=False, holes=False, close=False):
    im = Image.open(src).convert('RGB'); W, H = im.size
    for k, name in enumerate(names):
        if name == '-': continue
        r, c = divmod(k, cols)
        cell = np.array(im.crop((c * W // cols, r * H // rows, (c + 1) * W // cols, (r + 1) * H // rows))).astype(int)
        h, w, _ = cell.shape; white = cell.min(axis=2) > 232
        if green:
            g = cell[:, :, 1] - np.maximum(cell[:, :, 0], cell[:, :, 2])
            alpha = ~ndimage.binary_dilation(g > 70, iterations=1)
        else:
            bg = np.zeros((h, w), bool); seen = np.zeros((h, w), bool)
            q = deque([(0, x) for x in range(w)] + [(h - 1, x) for x in range(w)] + [(y, 0) for y in range(h)] + [(y, w - 1) for y in range(h)])
            while q:
                y, x = q.popleft()
                if y < 0 or x < 0 or y >= h or x >= w or seen[y, x] or not white[y, x]: continue
                seen[y, x] = True; bg[y, x] = True; q.extend([(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)])
            if holes:
                lab, n = ndimage.label(white & ~bg)
                for i in range(1, n + 1):
                    m = lab == i
                    if m.sum() > 0.015 * h * w: bg |= m
            alpha = ~bg
        lab, n = ndimage.label(alpha)                       # drop stray bits cut from neighbouring cells
        if n > 1:
            sizes = ndimage.sum(alpha, lab, range(1, n + 1)); alpha = np.isin(lab, np.nonzero(sizes >= 0.02 * sizes.sum())[0] + 1)
        if close and not green:
            closed = ndimage.binary_closing(np.pad(alpha, 40), structure=np.ones((31, 31), bool))[40:-40, 40:-40]
            alpha = alpha | (closed & white)
        px = cell.copy()
        if green:                                           # remove green spill on the edges
            edge = alpha & ~ndimage.binary_erosion(alpha, iterations=2)
            spill = (px[:, :, 1] - np.maximum(px[:, :, 0], px[:, :, 2]) > 30) & edge
            px[:, :, 1] = np.where(spill, np.maximum(px[:, :, 0], px[:, :, 2]), px[:, :, 1])
        out = Image.fromarray(np.dstack([px.astype(np.uint8), np.where(alpha, 255, 0).astype(np.uint8)]), 'RGBA')
        bb = out.getbbox()
        if not bb: print('EMPTY', name, 'in', src); continue
        out = out.crop(bb); out.save(f'{OUT}/{name}.png')
        vtracer.convert_image_to_svg_py(f'{OUT}/{name}.png', f'{OUT}/{name}.svg')
        print(name, out.size)

if '--all' in sys.argv:
    for line in open('art-src/sheets.txt'):
        p = line.split()
        if not p: continue
        names = [x for x in p[1:] if not x.startswith('--')]
        if not os.path.exists(f'art-src/{p[0]}'): print('missing', p[0]); continue
        cut(f'art-src/{p[0]}', names, green='--green' in p, holes='--holes' in p, close='--close' in p)
else:
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    grid = next((a.split('=')[1] for a in sys.argv if a.startswith('--grid=')), '2x2'); cols, rows = map(int, grid.split('x'))
    cut(args[0], args[1:], cols, rows, '--green' in sys.argv, '--holes' in sys.argv, '--close' in sys.argv)
