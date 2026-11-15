"""srt.py -> out/captions.srt from the aligned voice words (voice/NN.json) placed on the timeline.
Spoken numbers become digits (merged into one token, so a number never splits across two lines): add this video's
numbers to numbers.txt in the video folder, one per line as "spoken words = written form", e.g.
  twenty five = 25
  nineteen eighty seven = 1987
  fifteen to thirty minutes = 15 to 30 minutes
Lines up to about 42 characters, broken at sentence ends."""
import json, re, os
TL = json.load(open('remotion/src/timeline.json'))
NUM = [tuple(x.strip() for x in l.split('=', 1)) for l in (open('numbers.txt') if os.path.exists('numbers.txt') else []) if '=' in l and not l.startswith('#')]
NUM.sort(key=lambda x: -len(x[0].split()))
def ts(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f'{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}'
key = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
cues = []
for p in TL['parts']:
    ws = json.load(open(f"voice/{p['n']:02d}.json")); off = p['start']; toks = []; i = 0
    while i < len(ws):
        for phrase, rep in NUM:
            q = phrase.split()
            if i + len(q) <= len(ws) and [key(w['text']) for w in ws[i:i + len(q)]] == [key(x) for x in q]:
                tail = re.sub(r'^.*?([.,!?]*)$', r'\1', ws[i + len(q) - 1]['text'])
                toks.append({'text': rep + tail, 'start': ws[i]['start'], 'end': ws[i + len(q) - 1]['end']}); i += len(q); break
        else:
            toks.append(ws[i]); i += 1
    line, start = [], None
    for j, w in enumerate(toks):
        txt = w['text']
        if start is None: start = off + w['start']
        line.append(txt)
        soon = any(x['text'][-1] in '.?!' for x in toks[j + 1:j + 3])
        n = len(' '.join(line))
        if txt[-1] in '.?!' or (n > 30 and not soon) or n > 46 or j == len(toks) - 1:
            cues.append((start, off + w['end'] + .15, ' '.join(line))); line, start = [], None
os.makedirs('out', exist_ok=True)
with open('out/captions.srt', 'w') as f:
    for k, (a, b, t) in enumerate(cues, 1):
        b = min(b, cues[k][0] - .02) if k < len(cues) else b
        f.write(f'{k}\n{ts(a)} --> {ts(b)}\n{t}\n\n')
print(len(cues), 'captions -> out/captions.srt')
