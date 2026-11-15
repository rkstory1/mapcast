"""checkcues.py: every cue in remotion/src/beats.ts must be a spoken phrase in its part, and beats must start in order.
Reads each b(part, 'cue', kind, {...}) and every c / subC / gapC / upC / downC inside it, plus the third item of card
rows. Use single quotes in beats.ts. A cue on a common word can match too early: use two or three words."""
import json, re
TL = json.load(open('remotion/src/timeline.json')); P = {p['n']: p for p in TL['parts']}
norm = lambda w: re.sub(r'[^a-z0-9.%-]', '', w.lower())
def cue(n, ph):
    if n not in P: return None
    ws = P[n]['words']; q = [norm(x) for x in ph.split(' ')]
    for i in range(len(ws)):
        if all(i + k < len(ws) and norm(ws[i + k]['w']) == x for k, x in enumerate(q)): return ws[i]['s']
src = open('remotion/src/beats.ts').read()
src = src[src.index('BEATS'):]
chunks = re.split(r"(?=\bb\(\d+,)", src)[1:]
bad, starts = [], []
for ch in chunks:
    m = re.match(r"b\((\d+), '([^']*)', '(\w+)'", ch)
    if not m: continue
    n = int(m.group(1)); phrases = [m.group(2)]
    phrases += re.findall(r"\b(?:c|subC|gapC|upC|downC): '([^']+)'", ch)
    phrases += re.findall(r"\[\s*'[^']*',\s*'[^']*',\s*'([^']+)'\s*\]", ch)
    for ph in phrases:
        if cue(n, ph) is None: bad.append(f"part {n}: '{ph}' not in the voice")
    starts.append((cue(n, m.group(2)) or -1, n, m.group(2)))
for (a, n1, c1), (b2, n2, c2) in zip(starts, starts[1:]):
    if b2 != -1 and a != -1 and b2 < a: bad.append(f"order: '{c2}' (part {n2}) starts before '{c1}' (part {n1})")
print(len(chunks), 'beats,', len(bad), 'problems'); [print('  ', x) for x in bad]
