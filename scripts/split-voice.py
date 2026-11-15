"""split-voice.py voice/full.mp3 -> voice/NN.mp3, one file per script part, cut from ONE long recording.
For a voice made anywhere (your own microphone, any TTS app): read the whole script in one take, save it as one file,
run this. It transcribes the file with Whisper, matches it to the script's words, and cuts at the silence between the
last word of one part and the first word of the next. Then run the normal steps (raw copies, align.py, timeline.py)."""
import json, re, sys, os, difflib, subprocess, shutil
src = sys.argv[1] if len(sys.argv) > 1 else 'voice/full.mp3'
py = sys.executable
raw = 'voice/raw/full.json'; os.makedirs('voice/raw', exist_ok=True)
if not os.path.exists(raw):
    shutil.copy(src, 'voice/raw/full' + os.path.splitext(src)[1])
    subprocess.run([py, os.path.join(os.path.dirname(__file__), 'transcribe.py'), 'voice/raw/full' + os.path.splitext(src)[1]], check=True)
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
tts = json.load(open('voice/voice-tts.json')); keys = sorted(tts, key=int)
sw, owner = [], []
for k in keys:
    for w in re.sub(r'^\[[a-z ]+\]\s*', '', tts[k]).split(): sw.append(norm(w)); owner.append(k)
ww = json.load(open(raw)); b = [norm(w['text']) for w in ww]
hit = {}
for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, sw, b, autojunk=False).get_opcodes():
    if tag == 'equal':
        for q in range(i2 - i1): hit[i1 + q] = ww[j1 + q]
first = {k: min((hit[i]['start'] for i in hit if owner[i] == k), default=None) for k in keys}
last = {k: max((hit[i]['end'] for i in hit if owner[i] == k), default=None) for k in keys}
miss = [k for k in keys if first[k] is None]
if miss: sys.exit(f'parts not found in the recording: {miss}. Was every part read, in order?')
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
for i, k in enumerate(keys):
    s = 0 if i == 0 else (last[keys[i - 1]] + first[k]) / 2
    e = dur if i == len(keys) - 1 else (last[k] + first[keys[i + 1]]) / 2
    s = max(s, first[k] - .35); e = min(e, last[k] + .45)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{s:.3f}', '-to', f'{e:.3f}', '-i', src, '-c:a', 'libmp3lame', '-q:a', '2', f'voice/{k}.mp3'], check=True)
    print(f'part {k}: {s:7.2f} to {e:7.2f} s')
print('cut', len(keys), 'parts. Next: copy them to voice/raw, transcribe, align.py, timeline.py (SKILL.md step 4)')
