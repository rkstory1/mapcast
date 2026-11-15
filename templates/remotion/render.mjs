// node render.mjs [scale] -> out/master-<scale>x.mp4   (scale 2 = the 4K master, 1 = a quick 1080p)
// Renders 30 s segments, each in a fresh browser, checks each for one-frame flashes with ../flicker.py, retries up to
// TRIES times and keeps the cleanest try. Segments already done are skipped, so it can be re-run after a stop.
// Segments are joined without re-encoding. Env: CONC (parallel frames, default 2: 4 ran out of memory on a 16 GB Mac),
// TRIES (default 3), BROWSER=/path/to/chrome only if Remotion's own headless shell will not start, ONLY=<start frame>.
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import TL from './src/timeline.json' with { type: 'json' };

const scale = +(process.argv[2] || 2), SEG = 900, total = Math.ceil(TL.end * 30);
const dir = `out/seg-${scale}x`; mkdirSync(dir, { recursive: true });
const pad = (n) => String(n).padStart(5, '0');
const PY = process.env.PY || path.resolve('../py');
const flashes = (f) => +execFileSync(PY, ['../flicker.py', f]).toString().split('\n')[0].split(',')[1].trim().split(' ')[0];
const segs = []; for (let s = 0; s < total; s += SEG) segs.push([s, Math.min(s + SEG, total) - 1]);

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const bx = process.env.BROWSER ? { browserExecutable: process.env.BROWSER } : {};
const conc = +(process.env.CONC || 2);
const composition = await selectComposition({ serveUrl, id: 'Video', ...bx });
const only = process.env.ONLY ? +process.env.ONLY : null;
for (const [s, e] of segs) {
  if (only !== null && s !== only) continue;
  const f = `${dir}/s${pad(s)}-${pad(e)}.mp4`, mark = f.replace('.mp4', '.flashes');
  if (existsSync(f) && existsSync(mark)) continue;
  let best = Infinity;
  for (let t = 0; t < +(process.env.TRIES || 3) && best > 0; t++) {
    const tmp = f.replace('.mp4', '.try.mp4');
    await renderMedia({ composition, serveUrl, codec: 'h264', outputLocation: tmp, frameRange: [s, e], scale, crf: scale === 1 ? 12 : 16,
      x264Preset: scale === 1 ? 'slow' : undefined, muted: true, concurrency: conc, logLevel: 'error', overwrite: true, ...bx });
    const n = flashes(tmp);
    console.log(`frames ${s}-${e} try ${t + 1}: ${n} flashes`);
    if (n < best) { best = n; renameSync(tmp, f); } else rmSync(tmp);
  }
  writeFileSync(mark, String(best));
}
if (only !== null) process.exit(0);
writeFileSync('out/segs.txt', segs.map(([s, e]) => `file '${path.resolve(`${dir}/s${pad(s)}-${pad(e)}.mp4`)}'`).join('\n'));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'out/segs.txt', '-c', 'copy', `out/master-${scale}x.mp4`], { stdio: 'inherit' });
const left = segs.filter(([s, e]) => +readFileSync(`${dir}/s${pad(s)}-${pad(e)}.flashes`, 'utf8'));
console.log('done', `out/master-${scale}x.mp4`, left.length ? `segments still with flashes: ${JSON.stringify(left)}` : 'all segments clean');
