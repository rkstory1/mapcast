"""align.py -> voice/NN.json: the script's own words (voice/voice-tts.json, tag removed) with times from Whisper
(voice/raw/NN.json). Words are matched with difflib on a plain spelling; script words Whisper heard differently
(numbers it wrote as digits, names) share the time of the unmatched run they sit in. The words keep the script
spelling, so every cue('...') in beats.ts finds its word. Prints what did not match, to spot a misread voice."""
import json, re, difflib
def norm(w): return re.sub(r"[^a-z0-9]", '', w.lower().replace('’', "'"))
tts = json.load(open('voice/voice-tts.json'))
for k in sorted(tts, key=int):
    sw = re.sub(r'^\[[a-z ]+\]\s*', '', tts[k]).split()
    ww = [w for w in json.load(open(f'voice/raw/{k}.json')) if w['end'] > w['start']]
    a, b = [norm(w) for w in sw], [norm(w['text']) for w in ww]
    out = [None] * len(sw)
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            for q in range(i2 - i1): out[i1 + q] = (ww[j1 + q]['start'], ww[j1 + q]['end'])
        elif i2 > i1:
            if j2 > j1: s, e = ww[j1]['start'], ww[j2 - 1]['end']
            else:
                s = ww[j1 - 1]['end'] if j1 > 0 else 0
                e = ww[j1]['start'] if j1 < len(ww) else s + .3
            step = (e - s) / (i2 - i1)
            for q in range(i2 - i1): out[i1 + q] = (s + q * step, s + (q + 1) * step)
    json.dump([{'text': w, 'start': round(t[0], 3), 'end': round(t[1], 3)} for w, t in zip(sw, out)], open(f'voice/{k}.json', 'w'))
    bad = [(' '.join(sw[i1:i2]), ' '.join(w['text'] for w in ww[j1:j2])) for t, i1, i2, j1, j2 in sm.get_opcodes() if t != 'equal']
    print(k, len(sw), 'words | not matched:', bad if bad else '-')
