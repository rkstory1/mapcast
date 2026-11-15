// node thumbs.mjs -> ../out/thumbs/thumbnail-a.jpg, -b, -c (1920x1080) and a small 246 px sheet to judge them at phone size
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'child_process';
import { mkdirSync } from 'fs';
import path from 'path';
mkdirSync('../out/thumbs', { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const bx = process.env.BROWSER ? { browserExecutable: process.env.BROWSER } : {};
for (const k of ['A', 'B', 'C']) {
  const composition = await selectComposition({ serveUrl, id: 'Thumb' + k, ...bx });
  await renderStill({ composition, serveUrl, output: `../out/thumbs/thumbnail-${k.toLowerCase()}.jpg`, imageFormat: 'jpeg', jpegQuality: 92, ...bx });
}
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', '../out/thumbs/thumbnail-%c.jpg'.replace('%c', 'a'), '-i', '../out/thumbs/thumbnail-b.jpg', '-i', '../out/thumbs/thumbnail-c.jpg',
  '-filter_complex', '[0]scale=246:-1[a];[1]scale=246:-1[b];[2]scale=246:-1[c];[a][b][c]hstack=3', '../out/thumbs/small-sheet.jpg']);
console.log('thumbs done: out/thumbs (thumbnail-a/b/c.jpg, small-sheet.jpg)');
