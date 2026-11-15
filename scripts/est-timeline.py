"""est-timeline.py -> remotion/src/timeline.json ESTIMATED from the script (165 words a minute), so the edit can be
built and previewed before any voice exists. timeline.py replaces it with the real timing once the voice is in."""
import json, re
WPM = 165; INTRO, GAP, TAIL = 0.4, 0.5, 22.0
tts = json.load(open('voice/voice-tts.json')); cfg = json.load(open('project.json'))
breath = {int(k): v for k, v in cfg.get('breaths', {}).items()}
parts, t = [], INTRO
for k in sorted(tts, key=int):
    ws = re.sub(r'^\[[a-z ]+\]\s*', '', tts[k]).split()
    per = [max(.18, len(re.sub(r'\W', '', w)) * .055) + (.25 if w[-1] in '.!?' else .1 if w[-1] in ',;:' else 0) for w in ws]
    scale = (len(ws) / WPM * 60) / sum(per); s = 0; words = []
    for w, d in zip(ws, per):
        words.append({'w': w.strip(' ,.!:;"?').lower(), 's': round(t + s, 3), 'e': round(t + s + d * scale * .85, 3)}); s += d * scale
    parts.append({'n': int(k), 'start': round(t, 3), 'dur': round(s, 3), 'words': words})
    t += s + breath.get(int(k), GAP)
end = t - breath.get(parts[-1]['n'], GAP) + TAIL
json.dump({'fps': 30, 'end': round(end, 3), 'estimated': True, 'parts': parts}, open('remotion/src/timeline.json', 'w'))
print('ESTIMATED timeline:', f'{int(end // 60)}:{int(end % 60):02d}', f'({len(parts)} parts)')
