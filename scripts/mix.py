"""mix.py -> out/mix.wav: the voice parts at their timeline starts and the music under them, at -14 LUFS.
Voice: each part levelled to -17 LUFS, high-pass, light compression. Music: the tracks in project.json "music"
([{"file": "music/a.mp3", "from": 1}, {"file": "music/b.mp3", "from": 9}] = track a from part 1, track b from part 9),
each levelled to MUSIC_LUFS (-28) with 2.5 s crossfades at the changes, ducked under the voice by a sidechain
(ratio 5, release 800 ms: a steady bed with no pumping between words). Master: static gain to -14 LUFS and an
oversampled limiter at about -1.5 dBTP (never loudnorm). Also writes out/music-ducked.wav for gap.py."""
import os, json, re, subprocess
cfg = json.load(open('project.json')); MUSIC_LUFS = float(os.environ.get('MUSIC_LUFS', cfg.get('music_lufs', -28)))
RATIO, REL, TH = os.environ.get('RATIO', '5'), os.environ.get('REL', '800'), os.environ.get('TH', '0.02')
TL = json.load(open('remotion/src/timeline.json')); END = TL['end']; st = {p['n']: p['start'] for p in TL['parts']}
if TL.get('estimated'): raise SystemExit('timeline.json is still estimated: run timeline.py on the real voice first')
os.makedirs('out', exist_ok=True)
def lufs(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1])
ins, f, lab = [], [], []
for p in TL['parts']:
    src = f"voice/{p['n']:02d}.mp3"; g = -17 - lufs(src); ms = int(p['start'] * 1000); i = len(ins) // 2
    ins += ['-i', src]; f.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g:.2f}dB,adelay={ms}|{ms}[v{i}]'); lab.append(f'[v{i}]')
f.append(f"{''.join(lab)}amix=inputs={len(lab)}:normalize=0,highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,apad=whole_dur={END}[vox]")
f.append('[vox]asplit=2[vm][vs]')
tracks = cfg.get('music', [])
if not tracks: raise SystemExit('add the music tracks to project.json "music" first (references/sound.md)')
cuts = [0 if k == 0 else st[t['from']] - .6 for k, t in enumerate(tracks)] + [END]
ml = []
for k, tr in enumerate(tracks):
    m = tr['file']; gm = MUSIC_LUFS - lufs(m); j = len(ins) // 2; ins += ['-i', m]
    t0, t1 = cuts[k], cuts[k + 1]; dur = t1 - t0 + (2.5 if k < len(tracks) - 1 else 0); ms = int(t0 * 1000)
    fi = 'afade=t=in:st=0:d=2.5,' if k else ''
    fo = f'afade=t=out:st={dur - 2.5:.2f}:d=2.5' if k < len(tracks) - 1 else f'afade=t=out:st={max(dur - 4.5, 0):.2f}:d=4'
    f.append(f'[{j}:a]aresample=48000,aformat=channel_layouts=stereo,volume={gm:.2f}dB,aloop=loop=-1:size=2147483647,atrim=0:{dur:.2f},{fi}{fo},adelay={ms}|{ms}[m{k}]'); ml.append(f'[m{k}]')
f.append(f"{''.join(ml)}amix=inputs={len(ml)}:normalize=0,apad=whole_dur={END}[mu]")
f.append(f'[mu][vs]sidechaincompress=threshold={TH}:ratio={RATIO}:attack=20:release={REL}:makeup=1,asplit=2[duck][dk2]')
f.append(f'[vm][duck]amix=inputs=2:normalize=0,atrim=0:{END}[pre]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(f), '-map', '[pre]', 'out/mix-pre.wav', '-map', '[dk2]', 'out/music-ducked.wav'], check=True)
g = -14 - lufs('out/mix-pre.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/mix-pre.wav', '-af', f'volume={g:.2f}dB,aresample=192000,alimiter=limit=0.72:level=false,aresample=48000', 'out/mix.wav'], check=True)
print('mix', lufs('out/mix.wav'), 'LUFS, length', f'{int(END // 60)}:{int(END % 60):02d}')
