"""voiceband.py music1.mp3 music2.mp3 ... : how much of each track's energy sits in the 1 to 4 kHz voice band.
Pick music under about 2% there (steady lo-fi and soft piano usually sit at 0.5 to 2%); LRA under about 6 means a steady bed."""
import sys, subprocess, numpy as np, re, os
def load(p):
    raw = subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar','22050','-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
def lra(p):
    r = subprocess.run(['ffmpeg','-hide_banner','-i',p,'-af','ebur128','-f','null','-'],capture_output=True,text=True).stderr
    return float(re.findall(r'LRA:\s+(-?[\d.]+) LU',r)[-1])
for p in sys.argv[1:]:
    x = load(p); n=4096; f=np.fft.rfftfreq(n,1/22050); P=np.zeros(len(f))
    for i in range(0,len(x)-n,n*4): P += np.abs(np.fft.rfft(x[i:i+n]*np.hanning(n)))**2
    tot=P[(f>40)].sum(); voice=P[(f>1000)&(f<4000)].sum()/tot; hi=P[(f>4000)].sum()/tot; low=P[(f<250)].sum()/tot
    cen=(f*P).sum()/P.sum()
    print(f"{os.path.basename(p):28s} voiceband {voice*100:5.1f}%  >4k {hi*100:4.1f}%  <250 {low*100:5.1f}%  centroid {cen:5.0f}Hz  LRA {lra(p):4.1f}")
