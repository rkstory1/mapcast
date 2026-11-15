// Three thumbnail concepts for YouTube's Test & compare, in the video's own flat look: one bold background colour,
// two or three huge words, one chip, one big drawing. Readable at 246 px. Edit THUMBS for every video.
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, HEAD, col } from './kit';

export const THUMBS = {
  a: { bg: 'sun', words: ['WORK', 'SMARTER'], chip: '25 MIN', chipBg: 'ink', art: 'stopwatch' },
  b: { bg: 'ink', title: 'THE 3 STEPS', list: ['FOCUS', 'BREAK', 'REPEAT'], art: 'brain' },
  c: { bg: 'hot', words: ['STOP', 'MULTI', 'TASKING'], art: 'phone-buzz', dark: '#1E1F54' },
};

const Art: React.FC<{ n: string; style: React.CSSProperties }> = ({ n, style }) =>
  <Img src={staticFile(n.includes('.') ? `art/${n}` : `art/${n}.svg`)} style={{ position: 'absolute', objectFit: 'contain', ...style }} />;
const BigT: React.FC<{ children: React.ReactNode; size: number; color?: string }> = ({ children, size, color = C.ink }) =>
  <div style={{ fontFamily: HEAD, fontWeight: 600, fontSize: size, color, letterSpacing: '-.045em', lineHeight: .92 }}>{children}</div>;
const Chip: React.FC<{ children: React.ReactNode; bg: string; color?: string; size: number }> = ({ children, bg, color = C.white, size }) =>
  <div style={{ display: 'inline-block', background: bg, color, fontFamily: HEAD, fontWeight: 600, fontSize: size, padding: '10px 30px 16px', borderRadius: 22, letterSpacing: '-.03em' }}>{children}</div>;
const fit = (words: string[], max: number) => Math.min(max, Math.floor(980 / (Math.max(...words.map(w => w.length)) * .62)));

const A = () => { const s = THUMBS.a; return <AbsoluteFill style={{ background: col(s.bg) }}>
  <div style={{ position: 'absolute', left: 90, top: 80 }}><BigT size={fit(s.words, 200)}>{s.words.map((w, i) => <div key={i}>{w}</div>)}</BigT></div>
  <div style={{ position: 'absolute', left: 100, top: 600 }}><Chip bg={col(s.chipBg)} size={130}>{s.chip}</Chip></div>
  <Art n={s.art} style={{ right: 60, bottom: 60, width: 820, height: 820 }} />
</AbsoluteFill>; };

const B = () => { const s = THUMBS.b; const tones = ['cool', 'hot', 'sun', 'white']; return <AbsoluteFill style={{ background: col(s.bg) }}>
  <div style={{ position: 'absolute', left: 90, top: 70 }}><BigT size={120} color={C.sun}>{s.title}</BigT></div>
  {s.list.map((w, i) => <div key={i} style={{ position: 'absolute', left: 90, top: 250 + i * Math.min(190, 760 / s.list.length) }}><Chip bg={col(tones[i % 4])} color={C.ink} size={120}>{w}</Chip></div>)}
  <Art n={s.art} style={{ right: 90, top: 280, width: 560, height: 560 }} />
</AbsoluteFill>; };

const Cc = () => { const s = THUMBS.c; return <AbsoluteFill style={{ background: col(s.bg) }}>
  <div style={{ position: 'absolute', left: 90, top: 110 }}><BigT size={fit(s.words, 210)} color={s.dark}>{s.words.map((w, i) => <div key={i}>{w}</div>)}</BigT></div>
  <Art n={s.art} style={{ right: 70, top: 170, width: 760, height: 740 }} />
</AbsoluteFill>; };

export const Thumb: React.FC<{ concept: 'a' | 'b' | 'c' }> = ({ concept }) => concept === 'a' ? <A /> : concept === 'b' ? <B /> : <Cc />;
