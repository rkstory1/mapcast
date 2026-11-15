// Timing helpers. Everything is timed in seconds from timeline.json, so every cue is a spoken word.
import TL from './timeline.json';
import { useCurrentFrame } from 'remotion';

export const FPS = 30;
export const useT = () => useCurrentFrame() / FPS;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const eio = (x: number) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

type Word = { w: string; s: number; e: number };
const PARTS = (TL as any).parts as { n: number; start: number; dur: number; words: Word[] }[];
export const END = (TL as any).end as number;
export const ESTIMATED = !!(TL as any).estimated;
export const P = (n: number) => PARTS[n - 1];
export const pEnd = (n: number) => P(n).start + P(n).dur;
const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9.%-]/g, '');
/** time of a word (or the first word of a phrase) in part n, the first match after `after` seconds */
export const cue = (n: number, phrase: string, after = 0): number => {
  if (!P(n)) throw new Error(`part ${n} is not in timeline.json`);
  const ws = P(n).words, q = phrase.split(' ').map(norm);
  for (let i = 0; i < ws.length; i++) {
    if (ws[i].s < after) continue;
    if (q.every((x, k) => ws[i + k] && norm(ws[i + k].w) === x)) return ws[i].s;
  }
  throw new Error(`cue not found: part ${n} "${phrase}" (run: ./py checkcues.py)`);
};
