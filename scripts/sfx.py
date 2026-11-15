"""sfx.py -> out/mix.wav with sound effects: runs after mix.py. Each effect in project.json "sfx" is
{"file": "sfx/pop.wav", "at": "1:ten" or seconds, "off": -0.1, "peak": -14} (at = part:first words of a cue, like
cue() in the edit). Each effect is set to its peak level (dBFS, before the master), mixed on out/mix-pre.wav, then the
whole mix is mastered again to -14 LUFS with the same limiter as mix.py."""
import json, re, subprocess
cfg = json.load(open('project.json')); TL = json.load(open('remotion/src/timeline.json')); END = TL['end']
P = {p['n']: p['words'] for p in TL['parts']}
def norm(w): return re.sub(r"[^a-z0-9.%-]", '', w.lower())
def cue(spec):
    if isinstance(spec, (int, float)): return float(spec)
    n, ph = spec.split(':', 1); after = 0.0
    if '@' in ph: ph, after = ph.split('@'); after = float(after)
    q = [norm(x) for x in ph.split()]; ws = P[int(n)]
    for i in range(len(ws)):
        if ws[i]['s'] >= after and all(i + k < len(ws) and norm(ws[i + k]['w']) == x for k, x in enumerate(q)): return ws[i]['s']
    raise SystemExit(f'cue not found: {spec}')
def peak(f):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', f, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'max_volume: (-?[\d.]+) dB', r)[-1])
def lufs(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1])
if not cfg.get('sfx'): raise SystemExit('no sound effects in project.json "sfx" (references/sound.md)')
ins, f, lab, pk = ['-i', 'out/mix-pre.wav'], [], ['[0:a]'], {}
for k, e in enumerate(cfg['sfx']):
    t = max(0, cue(e['at']) + e.get('off', 0)); ms = int(t * 1000)
    if e['file'] not in pk: pk[e['file']] = peak(e['file'])
    g = e.get('peak', -14) - pk[e['file']]; ins += ['-i', e['file']]
    trim = f",atrim=0:{e['len']},afade=t=out:st={e['len'] - .15:.2f}:d=0.15" if 'len' in e else ''
    f.append(f'[{k + 1}:a]aresample=48000,aformat=channel_layouts=stereo{trim},volume={g:.2f}dB,adelay={ms}|{ms}[s{k}]'); lab.append(f'[s{k}]')
    print(f"  {t:6.2f}s  {e['file']}")
f.append(f"{''.join(lab)}amix=inputs={len(lab)}:normalize=0,atrim=0:{END}[o]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(f), '-map', '[o]', 'out/mix-sfx.wav'], check=True)
g = -14 - lufs('out/mix-sfx.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/mix-sfx.wav', '-af', f'volume={g:.2f}dB,aresample=192000,alimiter=limit=0.72:level=false,aresample=48000', 'out/mix.wav'], check=True)
print('mix with sfx', lufs('out/mix.wav'), 'LUFS')
