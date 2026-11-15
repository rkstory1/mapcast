// node stills.mjs <composition id> <scale> <outdir> t1 t2 ... : one bundle, many stills (times in seconds)
// Every 2 s for QC:  node stills.mjs Video 0.5 out/s2 $(seq 0 2 600)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'fs';
import path from 'path';
const [id, scale, out, ...ts] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const bx = process.env.BROWSER ? { browserExecutable: process.env.BROWSER } : {};
const composition = await selectComposition({ serveUrl, id, ...bx });
let n = 0;
for (const t of ts) {
  const frame = Math.round(+t * 30); if (frame >= composition.durationInFrames) continue;
  try { await renderStill({ composition, serveUrl, frame, output: `${out}/t${(+t).toFixed(1).padStart(7, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 85, scale: +scale, ...bx }); n++; }
  catch (e) { console.log('ERR', t, String(e.message).split('\n')[0].slice(0, 200)); }
}
console.log('stills', n);
