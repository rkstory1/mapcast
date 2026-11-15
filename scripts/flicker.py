"""flicker.py video.mp4 -> frames that differ from both neighbours while the neighbours match each other (a one-frame
flash, the typical browser-render glitch). Run it on every final file. A counting number can show up as a false hit:
look at those frames before re-rendering."""
import subprocess, sys, numpy as np
W, H = 320, 180
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
frames = []
while True:
    b = p.stdout.read(W * H)
    if len(b) < W * H: break
    frames.append(np.frombuffer(b, np.uint8).astype(np.int16))
hits = []
for n in range(1, len(frames) - 1):
    a, c, z = frames[n - 1], frames[n], frames[n + 1]
    d1, d2, d0 = np.abs(c - a).mean(), np.abs(z - c).mean(), np.abs(z - a).mean()
    if min(d1, d2) > 1.5 and d0 < 0.5 * min(d1, d2):
        hits.append((n, round(n / 30, 2), round(float(d1), 2), round(float(d2), 2), round(float(d0), 2)))
print(len(frames), 'frames,', len(hits), 'flashes')
for h in hits: print(h)
