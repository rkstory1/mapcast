// mapcast scenes: every scene type a beat can use (see references/beats.md for each one's props).
// Each scene gets a (start) and b (end) in seconds and the part number p, so its inner cues are spoken words.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { cue, useT, eo, eio } from './lib';
import { C, HEAD, col, ink, live, Art, Pop, usePop, NodeCard, Eye } from './kit';
import TH from './theme.json';

const T: React.FC<{ s?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ s = 56, c = C.ink, w = 600, style, children }) =>
  <span style={{ fontFamily: HEAD, fontWeight: w, fontSize: s, color: c, letterSpacing: '-.025em', lineHeight: 1.1, ...style }}>{children}</span>;
const fade = (t: number, a: number, d = .35) => eo((t - a) / d);
const when = (p: number, c: string | undefined, d: number) => (c ? cue(p, c) : d);

/** section title on the canvas: a pill (PART, STEP, RULE...), a numbered circle and the title on a dashed line */
export const SectionCard: React.FC<{ a: number; b: number; n: number; title: string; label?: string; alt?: boolean }> = ({ a, b, n, title, label = 'PART', alt }) => {
  const t = useT(); if (!live(t, a, b)) return null;
  const p = fade(t, a, .4), q = fade(t, a + .35, .45);
  return <AbsoluteFill style={{ background: C.canvas, opacity: fade(t, a, .2) }}>
    <svg width={1920} height={1080} style={{ position: 'absolute' }}><line x1={0} y1={540} x2={1920 * q} y2={540} stroke={C.ink} strokeWidth={5} strokeDasharray="20 16" opacity={.45} /></svg>
    <div style={{ position: 'absolute', left: 220, top: 540, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 30 }}>
      <div style={{ background: alt ? C.hot : C.ink, color: C.white, fontFamily: HEAD, fontWeight: 600, fontSize: 46, padding: '14px 30px', borderRadius: 999, letterSpacing: '.04em', opacity: p, transform: `scale(${.8 + .2 * p})` }}>{label}</div>
      {n > 0 && <div style={{ width: 120, height: 120, borderRadius: 999, background: C.sun, border: `6px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 600, fontSize: 72, color: C.ink, opacity: p }}>{n}</div>}
      <div style={{ opacity: q, transform: `translateX(${(1 - q) * 40}px)`, background: C.canvas, padding: '0 24px' }}><T s={title.length > 22 ? 84 : 110}>{title}</T></div>
    </div>
  </AbsoluteFill>;
};

/** a short quote in a frame with big quote marks; keep quotes short and always credited */
export const Quote: React.FC<{ a: number; b: number; text: string; by: string; bg?: string }> = ({ a, b, text, by, bg = C.canvas }) => {
  const t = useT(); if (!live(t, a, b)) return null;
  const p = fade(t, a + .1, .5), c = ink(bg);
  return <AbsoluteFill style={{ background: bg, opacity: fade(t, a, .2) }}>
    <div style={{ position: 'absolute', left: 260, right: 260, top: 230, bottom: 230, border: `5px solid ${c}`, borderRadius: 28, opacity: p, transform: `scale(${.95 + .05 * p})` }} />
    <div style={{ position: 'absolute', left: 200, top: 150, fontFamily: 'Georgia, serif', fontSize: 260, color: C.hot, lineHeight: 1, opacity: p }}>“</div>
    <div style={{ position: 'absolute', right: 210, bottom: 40, fontFamily: 'Georgia, serif', fontSize: 260, color: C.hot, lineHeight: 1, opacity: p }}>”</div>
    <div style={{ position: 'absolute', left: 340, right: 340, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 34 }}>
      <div style={{ opacity: p }}><T s={text.length > 90 ? 56 : 64} c={c}>{text}</T></div>
      <div style={{ opacity: fade(t, a + .7) }}><T s={38} c={c} style={{ opacity: .7, letterSpacing: '.12em' }}>{by.toUpperCase()}</T></div>
    </div>
  </AbsoluteFill>;
};

/** the recurring board: 2 to 5 columns (a step name and a drawing each), then up to two rows of labels under them.
 *  cols: [{ name, art, c? }], rows: [{ title?, items: string[], c?: string[] | string, color? }], full: show all at once */
export const Board: React.FC<{ a: number; b: number; p: number; cols: any[]; rows?: any[]; full?: boolean; bg?: string }> = ({ a, b, p: part, cols, rows = [], full, bg = C.sun }) => {
  const t = useT(); if (!live(t, a, b)) return null;
  const n = cols.length, W = 1640, step = W / n, x0 = 140;
  const colAt = (i: number) => (full ? a - 1 : cols[i].c ? cue(part, cols[i].c) : a + .2 + i * .25);
  const rowAt = (r: any, i: number) => (full ? a - 1 : Array.isArray(r.c) ? cue(part, r.c[i]) : r.c ? cue(part, r.c) + i * .3 : 1e9);
  return <AbsoluteFill style={{ background: bg, opacity: fade(t, a, .25) }}>
    <svg width={1920} height={1080} style={{ position: 'absolute' }}>
      <line x1={x0} y1={560} x2={x0 + W * fade(t, a, .6)} y2={560} stroke={C.ink} strokeWidth={8} />
      {Array.from({ length: n + 1 }).map((_, i) => <line key={i} x1={x0 + i * step} y1={440} x2={x0 + i * step} y2={500 + 300 * fade(t, a + .2, .4)} stroke={C.ink} strokeWidth={8} />)}
    </svg>
    {cols.map((cc, i) => {
      const x = x0 + i * step + step / 2, s = fade(t, colAt(i));
      const on = t >= colAt(i) && (i === n - 1 || t < colAt(i + 1)) && !rows.length && !full;
      return <React.Fragment key={i}>
        {cc.art && <Pop at={colAt(i)} x={x} y={300} w={Math.min(230, step - 60)} art={cc.art} />}
        <div style={{ position: 'absolute', left: x - step / 2, width: step, top: 455, textAlign: 'center', opacity: s }}><T s={n > 4 ? 46 : 56} style={{ background: on ? C.white : 'transparent', padding: '4px 14px', borderRadius: 10 }}>{cc.name}</T></div>
        {rows.map((r, k) => {
          const v = fade(t, rowAt(r, i));
          return <div key={k} style={{ position: 'absolute', left: x - step / 2, width: step, top: 610 + k * 110, textAlign: 'center', opacity: v, transform: `translateY(${(1 - v) * 20}px)` }}>
            <T s={n > 4 ? 40 : 48} c={C.white} style={{ background: col(r.color || (k ? 'hot' : 'ink')), padding: '8px 22px', borderRadius: 12 }}>{r.items[i]}</T></div>;
        })}
      </React.Fragment>;
    })}
    {rows.map((r, k) => r.title && <div key={k} style={{ position: 'absolute', left: k ? undefined : 140, right: k ? 140 : undefined, top: 890, opacity: fade(t, rowAt(r, 0)) }}><T s={40} c={k ? C.hot : C.ink}>{r.title}</T></div>)}
  </AbsoluteFill>;
};

/** three stacked isometric slabs (bottom to top), each lands on its cue, with a note beside it.
 *  layers: [{ name, note, c, color? }] from the top layer down */
export const Layers: React.FC<{ a: number; b: number; p: number; title?: string; layers: any[] }> = (props) => {
  const t = useT(); return live(t, props.a, props.b) ? <LayersIn {...props} /> : null;
};
const LayersIn: React.FC<{ a: number; b: number; p: number; title?: string; layers: any[] }> = ({ a, p: part, title, layers }) => {
  const t = useT(), n = layers.length, cols = ['ink', 'hot', 'cool', 'mute'];
  return <AbsoluteFill style={{ background: C.sun, opacity: fade(t, a, .25) }}>
    {title && <div style={{ position: 'absolute', left: 260, top: 90, opacity: fade(t, a + .1) }}><T s={72}>{title}</T></div>}
    {layers.map((L, i) => {
      const at0 = when(part, L.c, a + .3 + (n - 1 - i) * .5), s = usePop(at0).s, y = 760 - (n - 1 - i) * 190, c = col(L.color || cols[i]);
      return <React.Fragment key={i}>
        <div style={{ position: 'absolute', left: 260, top: y - 120, width: 900, height: 240, transform: `scale(${s})`, transformOrigin: '50% 100%' }}>
          <svg viewBox="0 0 900 240" width={900} height={240} style={{ position: 'absolute' }}>
            <path d="M450 20 L860 110 L450 200 L40 110 Z" fill={c} />
            <path d="M40 110 L450 200 L450 236 L40 146 Z" fill={c} opacity={.7} /><path d="M860 110 L450 200 L450 236 L860 146 Z" fill={c} opacity={.5} />
          </svg>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 86, textAlign: 'center' }}><T s={50} c={C.white}>{L.name}</T></div>
        </div>
        {L.note && <div style={{ position: 'absolute', left: 1240, top: y - 40, opacity: fade(t, at0 + .2) }}><T s={52}>{L.note}</T></div>}
      </React.Fragment>;
    })}
  </AbsoluteFill>;
};

/** two cards side by side; l and r: { t, art?, c?, bad? } (bad = dark card) */
export const Compare: React.FC<{ a: number; b: number; p: number; bg: string; l: any; r: any; title?: string }> = (props) => {
  const t = useT(); return live(t, props.a, props.b) ? <CompareIn {...props} /> : null;
};
const CompareIn: React.FC<{ a: number; b: number; p: number; bg: string; l: any; r: any; title?: string }> = ({ a, p: part, bg, l, r, title }) => {
  const t = useT();
  const card = (c: any, x: number, k: number) => {
    const at0 = when(part, c.c, a + .2 + k * .4), s = usePop(at0).s;
    return <div style={{ position: 'absolute', left: x, top: title ? 300 : 230, width: 700, height: 620, background: c.bad ? C.ink : C.white, borderRadius: 40, transform: `scale(${s})`, boxShadow: `0 18px 0 ${C.ink}22` }}>
      {c.art && <div style={{ position: 'absolute', left: 200, top: 50, width: 300, height: 300 }}><Art name={c.art} /></div>}
      <div style={{ position: 'absolute', left: 50, right: 50, top: c.art ? 380 : 0, bottom: c.art ? undefined : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}><T s={c.art ? 52 : 64} c={c.bad ? C.white : C.ink}>{c.t}</T></div>
    </div>;
  };
  return <AbsoluteFill style={{ background: bg, opacity: fade(t, a, .25) }}>
    {title && <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: fade(t, a + .1) }}><T s={70} c={ink(bg)}>{title}</T></div>}
    {card(l, 200, 0)}{card(r, 1020, 1)}
  </AbsoluteFill>;
};

/** a list whose rows land one by one on their cues: { t, c?, art?, n?, mark?, to? } */
export const Rows: React.FC<{ a: number; b: number; p: number; bg: string; title?: string; rows: any[]; size?: number }> = ({ a, b, p: part, bg, title, rows, size = 60 }) => {
  const t = useT(); if (!live(t, a, b)) return null;
  const c = ink(bg), top = title ? 300 : 540 - rows.length * 75, gap = Math.min(170, 720 / rows.length);
  return <AbsoluteFill style={{ background: bg, opacity: fade(t, a, .25) }}>
    {title && <div style={{ position: 'absolute', left: 200, top: 150, opacity: fade(t, a + .1) }}><T s={72} c={c}>{title}</T></div>}
    {rows.map((r, i) => {
      const at0 = when(part, r.c, a + .3 + i * .3), q = fade(t, at0, .4), y = top + i * gap;
      return <div key={i} style={{ position: 'absolute', left: 200, top: y, opacity: q, transform: `translateX(${(1 - q) * 40}px)`, display: 'flex', alignItems: 'center', gap: 34 }}>
        {r.art ? <div style={{ width: 120, height: 120 }}><Art name={r.art} /></div> : <div style={{ width: 70, height: 70, borderRadius: 999, background: col(r.mark || 'hot'), color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 600, fontSize: 38 }}>{r.n ?? i + 1}</div>}
        <T s={size} c={c}>{r.t}</T>
        {r.to && <><T s={size} c={C.hot}>→</T><T s={size} c={c} style={{ background: bg === C.ink ? C.hot : C.white, padding: '4px 18px', borderRadius: 12 }}>{r.to}</T></>}
      </div>;
    })}
  </AbsoluteFill>;
};

/** horizontal bars that grow on their cues: { l (label), v (0 to 100), c, label? (text instead of v%), color? } */
export const Bars: React.FC<{ a: number; b: number; p: number; title: string; bars: any[]; bg?: string }> = ({ a, b, p: part, title, bars, bg = C.ink }) => {
  const t = useT(); if (!live(t, a, b)) return null;
  const c = ink(bg), gap = Math.min(250, 600 / bars.length);
  return <AbsoluteFill style={{ background: bg, opacity: fade(t, a, .25) }}>
    <div style={{ position: 'absolute', left: 200, top: 170 }}><T s={66} c={c}>{title}</T></div>
    {bars.map((r, i) => {
      const at0 = when(part, r.c, a + .4 + i * .5), q = eio((t - at0) / 1), y = 380 + i * gap;
      return <div key={i} style={{ position: 'absolute', left: 200, top: y, opacity: fade(t, at0, .3) }}>
        <T s={44} c={c} style={{ opacity: .85 }}>{r.l}</T>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 16 }}>
          <div style={{ width: 1180 * r.v / 100 * q, height: 90, background: col(r.color || 'sun'), borderRadius: 12 }} />
          <T s={90} c={c}>{r.label || `${Math.round(r.v * q)}%`}</T>
        </div>
      </div>;
    })}
  </AbsoluteFill>;
};

/** expectation vs reality: a dashed straight line and a real curve that stays flat, then shoots up. labels: expect, real, gap (gapC = its cue) */
export const Curve: React.FC<{ a: number; b: number; p: number; expect?: string; real?: string; gap?: string; gapC?: string; x?: string }> =
  ({ a, b, p: part, expect = 'what you expect', real = '', gap = '', gapC, x = 'time' }) => {
  const t = useT(); if (!live(t, a, b)) return null;
  const k = eio((t - a - .3) / 2.4), x0 = 260, y0 = 860, W = 1400;
  const exp = `M${x0} ${y0} L${x0 + W * k} ${y0 - 600 * k}`;
  const act = Array.from({ length: 61 }, (_, i) => { const u = i / 60 * k; return `${i ? 'L' : 'M'}${x0 + u * W} ${y0 - 640 * Math.pow(u, 3.4)}`; }).join(' ');
  const lab = gap ? fade(t, when(part, gapC, a + 2.4)) : 0;
  return <AbsoluteFill style={{ background: C.canvas, opacity: fade(t, a, .25) }}>
    <svg width={1920} height={1080} style={{ position: 'absolute' }}>
      <line x1={x0} y1={180} x2={x0} y2={y0} stroke={C.ink} strokeWidth={7} /><line x1={x0} y1={y0} x2={x0 + W + 60} y2={y0} stroke={C.ink} strokeWidth={7} />
      {gap && <path d={`M${x0} ${y0} L${x0 + W * .75} ${y0 - 450} L${x0 + W * .75} ${y0 - 640 * Math.pow(.75, 3.4)} Z`} fill={C.hot} opacity={.18 * lab} />}
      {k > 0 && <path d={exp} fill="none" stroke={C.mute} strokeWidth={10} strokeDasharray="24 18" />}
      {k > 0 && <path d={act} fill="none" stroke={C.cool} strokeWidth={16} strokeLinecap="round" />}
      <text x={x0 + W * .72} y={y0 - 470} textAnchor="end" fontFamily={HEAD} fontWeight={600} fontSize={44} fill={C.mute} opacity={fade(t, a + 1.5)}>{expect}</text>
      {real && <text x={x0 + W} y={y0 - 640} textAnchor="end" fontFamily={HEAD} fontWeight={600} fontSize={44} fill={C.cool} opacity={fade(t, a + 2.6)}>{real}</text>}
      {gap && <text x={x0 + W * .45} y={y0 - 120} textAnchor="middle" fontFamily={HEAD} fontWeight={600} fontSize={56} fill={C.hot} opacity={lab}>{gap}</text>}
      <text x={x0 + W} y={y0 + 70} textAnchor="end" fontFamily={HEAD} fontWeight={600} fontSize={40} fill={C.mute}>{x}</text>
    </svg>
  </AbsoluteFill>;
};

/** two compounding lines drawn live: up (rate above 1) and down (rate below 1), each with its formula label on its cue */
export const Growth: React.FC<{ a: number; b: number; p: number; up: string; upC?: string; down?: string; downC?: string; x?: string; title?: string }> =
  ({ a, b, p: part, up, upC, down, downC, x = '1 year', title }) => {
  const t = useT(); if (!live(t, a, b)) return null;
  const ua = when(part, upC, a + .3), da = when(part, downC, a + 2.6);
  const ku = eio((t - ua) / 2.2), kd = down ? eio((t - da) / 2) : 0, W = 1500, x0 = 300, y0 = 600;
  const path = (f: (u: number) => number, k: number) => Array.from({ length: 61 }, (_, i) => { const u = i / 60 * k; return `${i ? 'L' : 'M'}${x0 + u * (W - 200)} ${f(u)}`; }).join(' ');
  const upF = (u: number) => y0 - (Math.pow(1.01, u * 365) - 1) / 36.78 * 420, dnF = (u: number) => y0 + (1 - Math.pow(.99, u * 365)) * 300;
  return <AbsoluteFill style={{ background: C.canvas, opacity: fade(t, a, .25) }}>
    {title && <div style={{ position: 'absolute', left: 300, top: 70, opacity: fade(t, a + .1) }}><T s={64}>{title}</T></div>}
    <svg width={1920} height={1080} style={{ position: 'absolute' }}>
      <line x1={x0} y1={160} x2={x0} y2={960} stroke={C.ink} strokeWidth={6} /><line x1={x0} y1={y0} x2={x0 + W - 100} y2={y0} stroke={C.ink} strokeWidth={6} />
      <text x={x0 + W - 100} y={y0 + 60} textAnchor="end" fontFamily={HEAD} fontWeight={600} fontSize={34} fill={C.mute}>{x}</text>
      {ku > 0 && <path d={path(upF, ku)} fill="none" stroke={C.cool} strokeWidth={14} strokeLinecap="round" />}
      {kd > 0 && <path d={path(dnF, kd)} fill="none" stroke={C.hot} strokeWidth={14} strokeLinecap="round" />}
      <text x={x0 + W - 260} y={190} textAnchor="end" fontFamily={HEAD} fontWeight={600} fontSize={64} fill={C.ink} opacity={eo((t - ua - 2) / .4)}>{up}</text>
      {down && <text x={x0 + W - 260} y={y0 + 330} textAnchor="end" fontFamily={HEAD} fontWeight={600} fontSize={64} fill={C.hot} opacity={eo((t - da - 1.8) / .4)}>{down}</text>}
    </svg>
  </AbsoluteFill>;
};

/** a tracker grid (a month of days): an X lands on each day, `missed` days stay empty */
export const Grid: React.FC<{ a: number; b: number; title: string; n?: number; missed?: number[] }> = (props) => {
  const t = useT(); return live(t, props.a, props.b) ? <GridIn {...props} /> : null;
};
const GridIn: React.FC<{ a: number; b: number; title: string; n?: number; missed?: number[] }> = ({ a, title, n = 28, missed = [] }) => {
  const t = useT(), skip = new Set(missed);
  return <AbsoluteFill style={{ background: C.sun, opacity: fade(t, a, .25) }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center' }}><T s={72}>{title}</T></div>
    {Array.from({ length: n }).map((_, i) => {
      const x = 380 + (i % 7) * 170, y = 270 + Math.floor(i / 7) * 170, s = usePop(a + .4 + i * .09).s;
      return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 140, height: 140, background: C.white, borderRadius: 18, transform: `scale(${s})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <T s={100} c={skip.has(i) ? C.mute : C.hot}>{skip.has(i) ? '·' : '✕'}</T>
      </div>;
    })}
  </AbsoluteFill>;
};

/** your own framework as a card: a coloured header, then rows that write on at their cues.
 *  rows: [[key, text, cue]]; flip: true turns the card over first (front and back of one card) */
export const Card: React.FC<{ a: number; b: number; p: number; head: string; rows: string[][]; flip?: boolean; color?: string; foot?: string }> = ({ a, b, p: part, head, rows, flip, color = 'cool', foot }) => {
  const t = useT(); if (!live(t, a, b)) return null;
  const f = flip ? eio((t - a) / .7) : 1, c = col(color);
  return <AbsoluteFill style={{ background: C.ink, opacity: fade(t, a, .25) }}>
    <div style={{ position: 'absolute', left: 260, top: 110, width: 1400, height: 860, background: C.white, borderRadius: 40, transform: `perspective(2400px) rotateY(${(1 - f) * -180}deg)` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 150, background: c, borderRadius: '40px 40px 0 0', display: 'flex', alignItems: 'center', paddingLeft: 60 }}><T s={56} c={C.white}>{head}</T></div>
      {rows.map(([k, v, cc], i) => <div key={i} style={{ position: 'absolute', left: 60, right: 60, top: 200 + i * Math.min(160, 600 / rows.length), opacity: fade(t, when(part, cc, a + .6 + i * .4)), display: 'flex', gap: 30, alignItems: 'baseline', borderBottom: `3px solid ${C.ink}22`, paddingBottom: 26 }}>
        <T s={50} c={c} style={{ width: 330, flexShrink: 0 }}>{k}</T><T s={46}>{v}</T></div>)}
      {foot && <div style={{ position: 'absolute', left: 60, right: 60, bottom: 50, opacity: fade(t, a + .5) }}><T s={40} c={C.mute}>{foot}</T></div>}
    </div>
  </AbsoluteFill>;
};

/** the progress map: the video's sections as a chain of cards on the canvas. The camera glides from the last
 *  section to `focus` and the finished ones get a check, so viewers see how far they are (a re-hook every section).
 *  nodes: the section labels (same list every time), art: an optional drawing beside the focused card */
export const Tour: React.FC<{ a: number; b: number; nodes: string[]; focus: number; art?: string; tag?: string }> = ({ a, b, nodes, focus, art, tag }) => {
  const t = useT(); if (!live(t, a, b)) return null;
  const X = (i: number) => 700 + (i % 2) * 260, Y = (i: number) => 700 + i * 700;
  const from = Math.max(0, focus - 1), k = eio((t - a) / 1.3), z = 1.05 - .25 * Math.sin(Math.PI * k);
  const cx = X(from) + (X(focus) - X(from)) * k + 420, cy = Y(from) + (Y(focus) - Y(from)) * k;
  const H = Y(nodes.length) + 400;
  return <AbsoluteFill style={{ background: C.canvas, opacity: fade(t, a, .25), overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 2600, height: H, transformOrigin: '0 0', transform: `translate(${960 - cx * z}px, ${540 - cy * z}px) scale(${z})`,
      backgroundImage: `radial-gradient(${C.dot} 3px, transparent 3px)`, backgroundSize: '60px 60px' }}>
      <svg width={2600} height={H} style={{ position: 'absolute' }}>
        {nodes.slice(0, -1).map((_, j) => <line key={j} x1={X(j)} y1={Y(j) + 120} x2={X(j + 1)} y2={Y(j + 1) - 120} stroke={C.ink} strokeWidth={5} strokeDasharray="18 16" opacity={.5} />)}
        {(art || tag) && <line x1={X(focus) + 250} y1={Y(focus)} x2={X(focus) + 420} y2={Y(focus)} stroke={C.ink} strokeWidth={5} strokeDasharray="18 16" opacity={.5 * fade(t, a + 1.3)} />}
      </svg>
      {nodes.map((n, i) => <NodeCard key={i} x={X(i)} y={Y(i)} label={n} on={i <= focus ? (i === focus ? a + 1.1 : a - 5) : 1e9} done={i < focus ? a - 5 : undefined} />)}
      {art && <Pop at={a + 1.35} x={X(focus) + 740} y={Y(focus)} w={480} art={art} />}
      {tag && <div style={{ position: 'absolute', left: X(focus) + 470, top: Y(focus) + 230, opacity: fade(t, a + 1.6), fontFamily: HEAD, fontWeight: 600, fontSize: 44, color: C.white, background: C.ink, padding: '12px 26px', borderRadius: 14 }}>{tag}</div>}
    </div>
  </AbsoluteFill>;
};

/** one big number or word that fills the frame (hooks, stats), with a chip under it */
export const Big: React.FC<{ a: number; b: number; p: number; bg: string; big: string; sub?: string; subC?: string; art?: string }> = ({ a, b, p: part, bg, big, sub, subC, art }) => {
  const t = useT(); if (!live(t, a, b)) return null;
  const c = ink(bg), p = eo((t - a - .05) / .28), sa = when(part, subC, a + .5), q = fade(t, sa, .3);
  return <AbsoluteFill style={{ background: bg }}>
    {art && <Pop at={a + .25} x={1500} y={560} w={560} art={art} />}
    <div style={{ position: 'absolute', left: art ? 160 : 0, right: art ? 760 : 0, top: 470, transform: `translateY(-50%) scale(${1.35 - .35 * p})`, opacity: p, textAlign: art ? 'left' : 'center',
      fontFamily: HEAD, fontWeight: 600, fontSize: big.length > 6 ? 230 : 330, color: c, letterSpacing: '-.05em', lineHeight: .95 }}>{big}</div>
    {sub && <div style={{ position: 'absolute', left: art ? 160 : 0, right: art ? undefined : 0, top: 700, display: 'flex', justifyContent: art ? 'flex-start' : 'center', opacity: q, transform: `translateY(${(1 - q) * 24}px)` }}>
      <span style={{ background: bg === C.ink ? C.sun : C.ink, color: bg === C.ink ? C.ink : C.white, fontFamily: HEAD, fontWeight: 600, fontSize: 56, padding: '12px 30px 16px', borderRadius: 16 }}>{sub}</span></div>}
  </AbsoluteFill>;
};

export const EndScreen: React.FC<{ a: number }> = ({ a }) => {
  const t = useT(); if (t < a - .05) return null;
  return <AbsoluteFill style={{ background: C.ink, opacity: fade(t, a, .3) }}>
    <div style={{ position: 'absolute', left: 150, top: 330, width: 640 }}>
      <div style={{ width: 150, height: 150, background: C.white, borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={96} /></div>
      <div style={{ marginTop: 48 }}><T s={TH.channel.length > 16 ? 64 : 84} c={C.white}>Subscribe to {TH.channel}</T></div>
      <div style={{ marginTop: 18 }}><T s={36} c={C.white} w={500} style={{ opacity: .75 }}>{TH.tagline}</T></div>
    </div>
    {/* the two 16:9 slots for YouTube's end screen elements */}
    <div style={{ position: 'absolute', right: 150, top: 150, display: 'flex', flexDirection: 'column', gap: 48 }}>
      {['Watch next', 'Best for you'].map((l, i) => <div key={i} style={{ width: 640, height: 360, background: `${C.white}1F`, borderRadius: 20, position: 'relative', opacity: fade(t, a + .3 + i * .2, .5) }}>
        <div style={{ position: 'absolute', left: 24, top: 20 }}><T s={24} c={C.white}>{l}</T></div></div>)}
    </div>
  </AbsoluteFill>;
};
