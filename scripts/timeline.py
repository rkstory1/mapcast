"""timeline.py -> remotion/src/timeline.json from the real voice (replaces the estimated one).
Parts back to back with a short breath (GAP); a longer breath where project.json "breaths" says so (after the hook and
at each section change, where the music comes up). TAIL keeps the end screen on for about 20 s after the last word."""
import json, subprocess
INTRO, GAP, TAIL = 0.4, 0.5, 22.0
cfg = json.load(open('project.json')); BREATH = {int(k): v for k, v in cfg.get('breaths', {}).items()}
tts = json.load(open('voice/voice-tts.json')); keys = sorted(tts, key=int)
def dur(f): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)
parts, t = [], INTRO
for k in keys:
    n = int(k); d = dur(f'voice/{k}.mp3'); ws = json.load(open(f'voice/{k}.json'))
    parts.append({'n': n, 'start': round(t, 3), 'dur': round(d, 3),
                  'words': [{'w': w['text'].strip(' ,.!:;"?').lower(), 's': round(t + w['start'], 3), 'e': round(t + w['end'], 3)} for w in ws]})
    t += d + BREATH.get(n, GAP)
end = t - BREATH.get(int(keys[-1]), GAP) + TAIL
json.dump({'fps': 30, 'end': round(end, 3), 'estimated': False, 'parts': parts}, open('remotion/src/timeline.json', 'w'))
print('video length', f'{int(end // 60)}:{int(end % 60):02d}', f'({sum(p["dur"] for p in parts) / 60:.1f} min of voice)')
for p in parts: print(f"  part {p['n']:02d} at {int(p['start'] // 60)}:{p['start'] % 60:05.2f}, {p['dur']:.1f} s")
