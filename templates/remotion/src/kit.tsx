// mapcast kit: the motion primitives of the animated explainer look. Flat vector art in bold flat colour, kinetic
// headlines, chips, counting figures, arrows, strikes, and the mind-map node card. Colours and font come from theme.json.
import React from 'react';
import { AbsoluteFill, Img, staticFile, spring, useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/fonts';
import { useT, eo, eio, clamp } from './lib';
import TH from './theme.json';

loadFont({ family: 'Geist', url: staticFile('fonts/Geist-SemiBold.woff2'), weight: '600' });
loadFont({ family: 'Geist', url: staticFile('fonts/Geist-Medium.woff2'), weight: '500' });

export const C = TH.c;
export const HEAD = `${TH.font}, system-ui, sans-serif`;
/** colour by role name ('sun', 'ink', 'hot', 'cool', 'canvas', 'white') or a literal #hex */
export const col = (k?: string) => (!k ? C.sun : k.startsWith('#') ? k : (C as any)[k] || C.sun);
/** text colour that reads on a background: white on ink, ink on everything else */
export const ink = (bg: string) => (bg === C.ink ? C.white : C.ink);
export const live = (t: number, a: number, b: number) => t >= a - .05 && t <= b + .4;

/** springy entrance with a small overshoot, then a slow idle float */
export const usePop = (at: number, k = 1) => {
  const f = useCurrentFrame(), t = f / 30;
  const s = spring({ frame: f - Math.round(at * 30), fps: 30, config: { damping: 11, stiffness: 140, mass: .7 } });
  return { s: t < at ? 0 : s, float: Math.sin(t * 1.6 * k) * 6 };
};
export const Art: React.FC<{ name: string; h?: number }> = ({ name, h }) =>
  <Img src={staticFile(name.includes('.') ? `art/${name}` : `art/${name}.svg`)} style={{ width: '100%', height: h ?? '100%', objectFit: 'contain', display: 'block' }} />;
/** a drawing (or any child) that pops in at `at`, centred on x,y, w wide */
export const Pop: React.FC<{ at: number; x: number; y: number; w: number; art?: string; children?: React.ReactNode; bob?: boolean }> =
  ({ at, x, y, w, art, children, bob = true }) => {
    const { s, float } = usePop(at, (Math.abs(x) % 7) / 7 + .7);
    return <div style={{ position: 'absolute', left: x - w / 2, top: y - w / 2 + (bob ? float : 0), width: w, height: art ? w : undefined, transform: `scale(${s})`, transformOrigin: '50% 60%' }}>
      {art ? <Art name={art} h={w} /> : children}
    </div>;
  };
/** kinetic headline: slams in from 1.3x with a fade */
export const Slam: React.FC<{ at: number; children: React.ReactNode; size?: number; color?: string; x?: number; y?: number; align?: 'left' | 'center'; w?: number }> =
  ({ at, children, size = 120, color = C.ink, x = 960, y = 540, align = 'center', w }) => {
    const t = useT(), p = eo((t - at) / .28);
    if (t < at) return null;
    return <div style={{ position: 'absolute', left: align === 'center' ? 120 : x, right: align === 'center' ? 120 : undefined, width: align === 'left' ? w : undefined, top: y,
      transform: `translateY(-50%) scale(${1.3 - .3 * p})`, opacity: p, textAlign: align, fontFamily: HEAD, fontWeight: 600, fontSize: size, color,
      letterSpacing: '-.035em', lineHeight: 1.02, transformOrigin: align === 'center' ? '50% 50%' : '0 50%' }}>{children}</div>;
  };
/** a chip of text on a solid block */
export const Tag: React.FC<{ at: number; children: React.ReactNode; bg?: string; color?: string; x: number; y: number; size?: number; maxW?: number; inline?: boolean }> =
  ({ at, children, bg = C.ink, color = C.white, x, y, size = 44, maxW = 900, inline }) => {
    const t = useT(), p = eo((t - at) / .3);
    if (t < at) return null;
    return <div style={{ position: inline ? 'relative' : 'absolute', left: inline ? 0 : x, top: inline ? 0 : y, transform: `translateY(${(1 - p) * 24}px)`, opacity: p, background: bg, color, fontFamily: HEAD, fontWeight: 600,
      fontSize: size, padding: '12px 26px 14px', borderRadius: 14, letterSpacing: '-.01em', width: 'max-content', maxWidth: maxW, lineHeight: 1.15, textAlign: 'center' }}>{children}</div>;
  };
/** a coloured scene that wipes in from the right; its content gets a slow camera push so nothing is ever static */
export const Wipe: React.FC<{ a: number; b: number; bg: string; children?: React.ReactNode }> = ({ a, b, bg, children }) => {
  const t = useT(); if (!live(t, a, b)) return null;
  const p = eio((t - a + .05) / .35), push = 1 + .035 * clamp((t - a) / Math.max(b - a, 1));
  return <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`, background: bg }}>
    <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: '50% 55%' }}>{children}</AbsoluteFill>
  </AbsoluteFill>;
};
export const Eye: React.FC<{ size?: number; color?: string }> = ({ size = 46, color = C.ink }) =>
  <svg viewBox="0 0 48 30" width={size}><path d="M2 15 C12 1 36 1 46 15 C36 29 12 29 2 15Z" fill="none" stroke={color} strokeWidth={3.5} /><circle cx={24} cy={15} r={6.5} fill={color} /></svg>;
/** a mind-map card: eye icon and a label; grey until `on`, then ink; `done` adds a check (progress callbacks) */
export const NodeCard: React.FC<{ x: number; y: number; label: string; on: number; w?: number; done?: number }> = ({ x, y, label, on, w = 500, done }) => {
  const t = useT(), p = eo((t - on) / .5), d = done ? eo((t - done) / .4) : 0;
  return <div style={{ position: 'absolute', left: x - w / 2, top: y - 120, width: w, minHeight: 240, background: C.white, borderRadius: 36, border: `4px solid ${p > .5 ? C.ink : '#DADBE6'}`,
    boxShadow: `0 14px 0 ${C.ink}14`, padding: '34px 36px', boxSizing: 'border-box', transform: `scale(${.94 + .06 * p})` }}>
    <Eye size={54} color={p > .5 ? C.ink : C.mute} />
    <div style={{ marginTop: 16, fontFamily: HEAD, fontWeight: 600, fontSize: 50, color: p > .5 ? C.ink : C.mute, lineHeight: 1.06, letterSpacing: '-.02em' }}>{label}</div>
    {d > 0 && <div style={{ position: 'absolute', right: -26, top: -26, width: 84, height: 84, borderRadius: 999, background: C.cool, transform: `scale(${d})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 40 40" width={46}><path d="M8 21 L17 30 L33 11" fill="none" stroke={C.white} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
  </div>;
};
/** a big number that counts up on a white block, with a label under it */
export const Fig: React.FC<{ at: number; to: number; pre?: string; unit?: string; label: string; x: number; y: number; color?: string; bg?: string; size?: number }> =
  ({ at, to, pre = '', unit = '', label, x, y, color = C.ink, bg = C.white, size = 190 }) => {
    const t = useT(), p = eo((t - at) / 1.1), q = eo((t - at) / .35);
    if (t < at) return null;
    const v = to * p, txt = to >= 1000 ? Math.round(v).toLocaleString('en-US') : (Number.isInteger(to) ? Math.round(v) : v.toFixed(1));
    return <div style={{ position: 'absolute', left: x, top: y, opacity: q, transform: `translateY(${(1 - q) * 30}px)`, background: bg, borderRadius: 30, padding: '26px 44px 30px' }}>
      <div style={{ fontFamily: HEAD, fontWeight: 600, fontSize: size, color, letterSpacing: '-.05em', lineHeight: 1 }}>{pre}{txt}{unit}</div>
      <div style={{ fontFamily: HEAD, fontWeight: 600, fontSize: 40, color, opacity: .8, marginTop: 10 }}>{label}</div>
    </div>;
  };
export const Arrow: React.FC<{ at: number; x: number; y: number; w?: number; color?: string }> = ({ at, x, y, w = 140, color = C.ink }) => {
  const t = useT(), p = eo((t - at) / .4);
  return <svg style={{ position: 'absolute', left: x, top: y - 30 }} width={w + 20} height={60}>
    <line x1={0} y1={30} x2={(w - 20) * p} y2={30} stroke={color} strokeWidth={12} strokeLinecap="round" />
    {p > .9 && <path d={`M${w - 34} 8 L${w - 4} 30 L${w - 34} 52`} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />}
  </svg>;
};
/** a thick line drawn across something (a myth, a wrong idea) */
export const Strike: React.FC<{ at: number; x: number; y: number; w: number; h: number; color?: string }> = ({ at, x, y, w, h, color = C.ink }) => {
  const t = useT(), p = eo((t - at) / .3), L = Math.hypot(w, h);
  return <svg style={{ position: 'absolute', left: x, top: y }} width={w} height={h}><line x1={0} y1={h} x2={w} y2={0} stroke={color} strokeWidth={24} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} /></svg>;
};
/** small channel name (or logo file in public/) bottom right, on every shot except the end screen */
export const Watermark: React.FC = () => TH.watermark
  ? <div style={{ position: 'absolute', right: 40, bottom: 30, opacity: .9 }}><Img src={staticFile(TH.watermark)} style={{ width: 70 }} /></div>
  : <div style={{ position: 'absolute', right: 44, bottom: 30, fontFamily: HEAD, fontWeight: 600, fontSize: 26, color: C.ink, opacity: .55, background: `${C.white}AA`, padding: '6px 14px', borderRadius: 10 }}>{TH.channel}</div>;
