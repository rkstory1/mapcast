"""script2tts.py -> voice/voice-tts.json from script.md (each part is "### NN Title" followed by a fenced block).
Prints parts, words, characters (about 1 ElevenLabs credit per character) and the voice length at 165 words a minute,
and warns about long dashes and questions (both read badly in text to speech)."""
import re, json, os
s = open('script.md').read()
blocks = re.findall(r'### (\d+) (.*?)\n```\n(.*?)\n```', s, re.S)
if not blocks: raise SystemExit('no parts found: every part needs "### NN Title" and a fenced block under it')
d = {n: b.strip() for n, _, b in blocks}
os.makedirs('voice/raw', exist_ok=True); json.dump(d, open('voice/voice-tts.json', 'w'), indent=1)
clean = lambda b: re.sub(r'\[[a-z ]+\]\s*', '', b)
w = sum(len(clean(b).split()) for b in d.values()); c = sum(len(clean(b)) for b in d.values())
print(f'{len(d)} parts, {w} words, {c} characters (about {c} ElevenLabs credits), about {w / 165:.1f} min of voice')
for n, b in d.items():
    if '—' in b or '–' in b: print(f'  part {n}: long dash, rewrite as two sentences')
    if '?' in clean(b): print(f'  part {n}: a question; statements read better in TTS (keep it if you want it)')
    if re.search(r'\d', clean(b)): print(f'  part {n}: digits; write numbers the way they are said')
