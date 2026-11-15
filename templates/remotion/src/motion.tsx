// mapcast motion: the advanced layer on top of kit.tsx, for hand-built showcase edits (examples/showcase is the worked
// example). A camera that glides over a map of full-frame scene cards with real motion blur and a zoom out that
// reveals the map; cuts (3D card flip, whip pan, iris, push); and small pieces (springs, rising text, a highlight that
// wipes on, pills, an odometer, confetti). Every time is in seconds, so cue the starts to spoken words with cue().
import React, { useId } from 'react';
import { AbsoluteFill, spring } from 'remotion';
import { useT, eo, eio, clamp } from './lib';
import { C, HEAD } from './kit';

const W = 1920, H = 1080;
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const fade = (t: number, a: number, d = .3) => eo((t - a) / d);
/** a spring from 0 to 1 that starts at `at` (lower damping = more bounce) */
export const sp = (t: number, at: number, damping = 12, stiffness = 170) =>
  t < at ? 0 : spring({ frame: (t - at) * 30, fps: 30, config: { damping, stiffness, mass: .7 } });
/** an SVG filter id that is safe inside url(#...) */
const useFid = () => 'f' + useId().replace(/[^a-zA-Z0-9]/g, '');
/** a horizontal + vertical motion blur filter; wrap the moving layer in <Blurred> */
const Blur: React.FC<{ id: string; x: number; y?: number }> = ({ id, x, y = 0 }) =>
  <svg width={0} height={0} style={{ position: 'absolute' }}><filter id={id} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${x.toFixed(1)} ${y.toFixed(1)}`} /></filter></svg>;

/** text in the channel font */
export const T: React.FC<{ s: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ s, c = C.ink, w = 600, style, children }) =>
  <span style={{ fontFamily: HEAD, fontWeight: w, fontSize: s, color: c, letterSpacing: '-.035em', lineHeight: 1.04, ...style }}>{children}</span>;
/** words on a coloured block that wipes on (left to right) at `at` */
export const Hi: React.FC<{ at: number; bg: string; c: string; children: React.ReactNode }> = ({ at, bg, c, children }) => {
  const t = useT(), k = eio((t - at) / .35);
  return <span style={{ position: 'relative', display: 'inline-block', padding: '0 .14em' }}>
    <span style={{ position: 'absolute', left: 0, top: '.06em', bottom: '-.02em', width: `${k * 100}%`, background: bg, borderRadius: '.12em' }} />
    <span style={{ position: 'relative', color: k > .5 ? c : undefined }}>{children}</span></span>;
};
/** anything that rises and fades in at `at` */
export const Rise: React.FC<{ at: number; children: React.ReactNode; d?: number; style?: React.CSSProperties }> = ({ at, children, d = .35, style }) => {
  const t = useT(), k = eo((t - at) / d);
  return <div style={{ opacity: k, transform: `translateY(${(1 - k) * 46}px)`, ...style }}>{children}</div>;
};
/** a pill of text that springs in at `at` */
export const Pill: React.FC<{ at: number; bg: string; c: string; s?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, bg, c, s = 46, children, style }) => {
  const t = useT(), k = sp(t, at, 13, 220);
  return <div style={{ display: 'inline-block', background: bg, color: c, fontFamily: HEAD, fontWeight: 600, fontSize: s, padding: '.2em .6em .26em', borderRadius: '.4em',
    transform: `scale(${k})`, transformOrigin: '0 50%', letterSpacing: '-.01em', ...style }}>{children}</div>;
};
/** a number that rolls like an odometer from `from` to `to` (same digit count), each digit a little later */
export const Odometer: React.FC<{ from: string; to: string; at: number; s: number; color?: string }> = ({ from, to, at, s, color = C.white }) => {
  const t = useT();
  return <div style={{ display: 'flex', height: s, overflow: 'hidden', fontFamily: HEAD, fontWeight: 600, fontSize: s, color, letterSpacing: '-.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
    {to.split('').map((d, i) => {
      const a = +from[i] || 0, b = +d, spins = 1 + i, k = eio((t - at - i * .09) / (.75 + i * .08));
      const pos = lerp(a + 10 * spins, b, k), strip = Array.from({ length: 10 * (spins + 2) }, (_, j) => j % 10);
      return <div key={i} style={{ width: s * .62, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: -pos * s, filter: k > 0 && k < 1 ? `blur(${6 * (1 - k)}px)` : undefined }}>
          {strip.map((n, j) => <div key={j} style={{ height: s, textAlign: 'center' }}>{n}</div>)}</div></div>;
    })}
  </div>;
};
/** a burst of confetti from x,y at `at`, in the theme colours */
export const Confetti: React.FC<{ at: number; x: number; y: number; n?: number }> = ({ at, x, y, n = 46 }) => {
  const t = useT(), q = t - at; if (q < 0 || q > 1.6) return null;
  return <>{Array.from({ length: n }, (_, i) => {
    const a = ((i * 137.5) % 360) * Math.PI / 180, v = 900 + (i * 53) % 700, s = 18 + (i * 7) % 18, c = [C.hot, C.cool, C.sun, C.ink][i % 4];
    return <div key={i} style={{ position: 'absolute', left: x + Math.cos(a) * v * q, top: y + Math.sin(a) * v * q * .8 + 900 * q * q, width: s, height: s * 1.6, background: c, borderRadius: 4,
      transform: `rotate(${(i * 29) % 360 + q * 500}deg)`, opacity: 1 - clamp((q - 1.1) / .4) }} />;
  })}</>;
};

// ---------------------------------------------------------------- the map camera
export type Cam = { x: number; y: number; z: number };
/** a camera move: from the previous position to `to` between t0 and t1. dip > 0 pulls out mid-move (a pan that
 *  shows the canvas between cards, about .4); dip 0 is a straight zoom (motion blur stays low on zooms) */
export type Move = { t0: number; t1: number; to: Cam; dip?: number };
const camAt = (t: number, start: Cam, moves: Move[]): Cam => {
  let c = start;
  for (const m of moves) {
    if (t >= m.t1) { c = m.to; continue; }
    if (t <= m.t0) break;
    const k = eio((t - m.t0) / (m.t1 - m.t0)), z = Math.exp(lerp(Math.log(c.z), Math.log(m.to.z), k));
    return { x: lerp(c.x, m.to.x, k), y: lerp(c.y, m.to.y, k), z: z * (1 - (m.dip || 0) * Math.sin(Math.PI * k)) };
  }
  return c;
};
/** full-frame scene cards placed on a dotted canvas (x, y = card centre in canvas pixels; a card is 1920 x 1080).
 *  The camera follows `moves`; at z = 1 over a card, the card fills the frame like a normal scene. `node` is a card
 *  in the middle of the map that slams in at `node.at` with dashed links to every card (from `node.links`), and each
 *  card's `tag` shows above or below it from `node.links` on. Card scenes read the global time, so they keep their cues. */
export const MapCamera: React.FC<{
  cards: { x: number; y: number; el: React.ReactNode; tag?: string }[]; moves: Move[]; start?: Cam;
  node?: { x: number; y: number; label: string; at: number; links: number; size?: number };
}> = ({ cards, moves, start = { x: cards[0].x, y: cards[0].y, z: 1 }, node }) => {
  const t = useT(), id = useFid();
  const st0 = { ...start, z: start.z * (1.06 - .06 * eo(t / 1.2)) };               // a small settle on the opening shot
  const c = camAt(t, st0, moves), p = camAt(t - 1 / 30, st0, moves);
  const zooming = moves.some((m) => !m.dip && t > m.t0 && t < m.t1), kb = zooming ? .06 : .45;
  const bx = Math.min(70, Math.abs((c.x - p.x) * p.z) * kb), by = Math.min(70, Math.abs((c.y - p.y) * p.z) * kb);
  const OX = 3000, OY = 2000, r = 46 * clamp((1 - c.z) / .08);                     // round corners once the camera pulls away
  return <AbsoluteFill style={{ background: C.canvas, overflow: 'hidden' }}>
    <Blur id={id} x={bx} y={by} />
    <AbsoluteFill style={{ overflow: 'hidden', filter: bx + by > .6 ? `url(#${id})` : undefined }}>
      <div style={{ position: 'absolute', left: -OX, top: -OY, width: 9000, height: 6000, transformOrigin: `${OX}px ${OY}px`,
        transform: `translate(${W / 2 - c.x * c.z}px, ${H / 2 - c.y * c.z}px) scale(${c.z})`, backgroundImage: `radial-gradient(${C.dot} 7px, transparent 7px)`, backgroundSize: '90px 90px' }}>
        {node && <svg width={9000} height={6000} style={{ position: 'absolute', left: 0, top: 0 }}>
          {cards.map((cd, i) => {
            const k = eo((t - node.links - i * .08) / .6);
            return k > 0 && <line key={i} x1={node.x + OX} y1={node.y + OY} x2={lerp(node.x, cd.x, k) + OX} y2={lerp(node.y, cd.y, k) + OY} stroke={C.ink} strokeWidth={14} strokeDasharray="44 36" strokeLinecap="round" opacity={.55} />;
          })}</svg>}
        {cards.map((cd, i) => <div key={i} style={{ position: 'absolute', left: cd.x + OX - W / 2, top: cd.y + OY - H / 2, width: W, height: H, borderRadius: r, overflow: 'hidden',
          boxShadow: c.z < .98 ? `0 40px 0 ${C.ink}22` : undefined }}>{cd.el}</div>)}
        {node && cards.map((cd, i) => cd.tag && <div key={'t' + i} style={{ position: 'absolute', left: cd.x + OX - W / 2 + 10, top: cd.y + OY + (cd.y <= node.y ? -H / 2 - 230 : H / 2 + 70), opacity: fade(t, node.links + .2 + i * .1, .4) }}>
          <span style={{ background: C.ink, color: C.white, fontFamily: HEAD, fontWeight: 600, fontSize: 120, padding: '14px 46px 20px', borderRadius: 30 }}>{cd.tag}</span></div>)}
        {node && t >= node.at && <div style={{ position: 'absolute', left: node.x + OX - 1150, top: node.y + OY - 280, width: 2300, height: 560, background: C.white, border: `16px solid ${C.ink}`, borderRadius: 90,
          transform: `scale(${sp(t, node.at, 10, 190)})`, boxShadow: `0 46px 0 ${C.ink}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <T s={node.size ?? 220} style={{ whiteSpace: 'nowrap' }}>{node.label}</T></div>}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>;
};

// ---------------------------------------------------------------- cuts: `a` is the scene before, `b` the scene after
/** the whole frame turns over like a card (3D), from a to b, starting at `at` */
export const Flip: React.FC<{ at: number; d?: number; a: React.ReactNode; b: React.ReactNode }> = ({ at, d = .62, a, b }) => {
  const t = useT(); if (t < at) return <>{a}</>; if (t > at + d) return <>{b}</>;
  const k = eio((t - at) / d);
  return <AbsoluteFill style={{ background: C.ink, perspective: 2400 }}>
    <AbsoluteFill style={{ transformStyle: 'preserve-3d', transform: `scale(${1 - .22 * Math.sin(k * Math.PI)}) rotateY(${k * 180}deg)` }}>
      <AbsoluteFill style={{ backfaceVisibility: 'hidden' }}>{a}</AbsoluteFill>
      <AbsoluteFill style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>{b}</AbsoluteFill>
    </AbsoluteFill></AbsoluteFill>;
};
/** a whip pan: a leaves to the left and b comes in from the right, with motion blur */
export const Whip: React.FC<{ at: number; d?: number; a: React.ReactNode; b: React.ReactNode }> = ({ at, d = .4, a, b }) => {
  const t = useT(), id = useFid(); if (t < at) return <>{a}</>; if (t > at + d) return <>{b}</>;
  const k = eio((t - at) / d), bl = Math.sin(((t - at) / d) * Math.PI) * 40;
  return <AbsoluteFill style={{ background: C.ink }}><Blur id={id} x={bl} />
    <AbsoluteFill style={{ transform: `translateX(${-k * W}px)`, filter: `url(#${id})` }}>{a}</AbsoluteFill>
    <AbsoluteFill style={{ transform: `translateX(${(1 - k) * W}px)`, filter: `url(#${id})` }}>{b}</AbsoluteFill></AbsoluteFill>;
};
/** b opens in a growing circle centred on x,y (put x,y on the thing the next scene grows from) */
export const Iris: React.FC<{ at: number; d?: number; x: number; y: number; a: React.ReactNode; b: React.ReactNode }> = ({ at, d = .55, x, y, a, b }) => {
  const t = useT(); if (t < at) return <>{a}</>; if (t > at + d) return <>{b}</>;
  return <AbsoluteFill>{a}<AbsoluteFill style={{ clipPath: `circle(${eio((t - at) / d) * 2300}px at ${x}px ${y}px)` }}>{b}</AbsoluteFill></AbsoluteFill>;
};
/** b fades in over a while settling from a slight zoom (a calm cut, good into an end card) */
export const Push: React.FC<{ at: number; d?: number; a: React.ReactNode; b: React.ReactNode }> = ({ at, d = .45, a, b }) => {
  const t = useT(); if (t < at) return <>{a}</>;
  const k = fade(t, at, .35);
  return <AbsoluteFill>{t < at + d && a}<AbsoluteFill style={{ opacity: k, transform: `scale(${1.12 - .12 * eo((t - at) / .6)})` }}>{b}</AbsoluteFill></AbsoluteFill>;
};
