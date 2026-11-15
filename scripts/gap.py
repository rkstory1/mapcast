"""gap.py -> how far the music sits under the voice, in momentary LUFS on the separated stems (after mix.py).
Plain RMS overstates bass-heavy music, so this measures loudness the way ears hear it.
Target: voice 18 to 22 dB above the music while talking; music a little up in the breaths."""
import json, subprocess, numpy as np, re, tempfile
S = tempfile.mkdtemp()
def load(p): return np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','2','-ar','48000','-f','f32le','-'],capture_output=True).stdout,np.float32)
m, u = load('out/mix-pre.wav'), load('out/music-ducked.wav'); n=min(len(m),len(u)); v=m[:n]-u[:n]
for name,x in (('vox',v),('mus',u[:n])): x.astype(np.float32).tofile(f'{S}/{name}.raw')
def mom(name):
    r=subprocess.run(['ffmpeg','-hide_banner','-f','f32le','-ar','48000','-ac','2','-i',f'{S}/{name}.raw','-af','ebur128=metadata=1,ametadata=print:key=lavfi.r128.M','-f','null','-'],capture_output=True,text=True).stderr
    t=[float(x) for x in re.findall(r'pts_time:([\d.]+)',r)]; M=[float(x) for x in re.findall(r'lavfi.r128.M=(\S+)',r)]
    return np.array(t[:len(M)]), np.array(M)
tv,Mv=mom('vox'); tm,Mm=mom('mus'); k=min(len(Mv),len(Mm)); Mv,Mm,tv=Mv[:k],Mm[:k],tv[:k]
TL=json.load(open('remotion/src/timeline.json'))
sp=np.zeros(k,bool)
for p in TL['parts']:
    for w in p['words']: sp|=(tv>=w['s']+0.2)&(tv<=w['e']+0.2)
gap=(Mv-Mm)[sp & (Mv>-40)]
br=np.zeros(k,bool)
for i in range(len(TL['parts'])-1):
    e=TL['parts'][i]['start']+TL['parts'][i]['dur']; s2=TL['parts'][i+1]['start']
    if s2-e>0.6: br|=(tv>e+0.4)&(tv<s2)
print(f'while talking the voice is {np.median(gap):.1f} dB above the music (worst 10%: {np.percentile(gap,10):.1f} dB). '
      f'Music: {np.median(Mm[sp]):.1f} LUFS under speech, {np.median(Mm[br]) if br.any() else float("nan"):.1f} LUFS in the breaths.')
