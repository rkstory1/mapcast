// The mapcast showcase (30 s): Parkinson's Law. Built on motion.tsx: a camera over a map of four scene cards (whip pans
// with motion blur, a zoom out that reveals the map around the "Parkinson's Law" node), a 3D flip to the flip side,
// a whip, an iris and a push into the end card. Every start is a spoken word (cue). Copy the pattern, not the scenes:
// each scene is a plain component that reads the global time, and the cut at the bottom chains them.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { cue, useT, eo, eio, clamp } from './lib';
import { C, HEAD, Art, Watermark } from './kit';
import { lerp, fade, sp, T, Hi, Rise, Pill, Odometer, Confetti, MapCamera, Flip, Whip, Iris, Push } from './motion';

const W = 1920, H = 1080;
// ---------------------------------------------------------------- the jar (glass-jar.svg is 351 x 428)
const JW = 351, JH = 428;
/** the jar of TIME with the work inside: items drop in, swell to fill it, then the WORK level rises to the brim */
const Jar: React.FC<{ x: number; y: number; h: number; drop: number; swell: number; fill: number; label: number; wobble?: number }> = ({ x, y, h, drop, swell, fill, label, wobble = -9 }) => {
  const t = useT(), s = h / JH, w = JW * s;
  const ix = 24 * s, iy = 118 * s, iw = 302 * s, ih = 290 * s;           // the inside of the glass, in jar pixels
  const items = [
    { a: 'email-x', p0: [.22, .80], p1: [.27, .70] }, { a: 'checklist', p0: [.50, .82], p1: [.70, .70] },
    { a: 'phone-text', p0: [.78, .80], p1: [.50, .30] }, { a: 'paper-clips', p0: [.35, .55], p1: [.24, .30] },
    { a: 'coffee-mug', p0: [.66, .55], p1: [.76, .32] }];
  const sw = sp(t, swell, 9, 120), lv = eio((t - fill) / .9), wob = Math.sin((t - wobble) * 14) * 3 * Math.exp(-(t - wobble) * 3) * (t > wobble ? 1 : 0);
  return <div style={{ position: 'absolute', left: x - w / 2, top: y, width: w, height: h, transform: `rotate(${wob}deg)`, transformOrigin: '50% 100%' }}>
    <Art name="glass-jar" />
    <div style={{ position: 'absolute', left: ix, top: iy, width: iw, height: ih, overflow: 'hidden', borderRadius: 34 * s }}>
      {lv > 0 && <svg width={iw} height={ih} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={`M0 ${ih} L0 ${ih * (1 - lv * .97)} ${Array.from({ length: 13 }, (_, i) => `L${iw * i / 12} ${ih * (1 - lv * .97) + Math.sin(i * 1.3 + t * 7) * 7 * s * (1 - lv * .6)}`).join(' ')} L${iw} ${ih} Z`} fill={C.sun} opacity={.92} />
        <text x={iw / 2} y={ih - 26 * s} textAnchor="middle" fontFamily={HEAD} fontWeight={600} fontSize={42 * s} fill={C.ink} opacity={fade(t, fill + .5)} letterSpacing=".08em">WORK</text>
      </svg>}
      {items.map((it, i) => {
        const at = drop + i * .14, k = sp(t, at, 10, 200), fall = (1 - Math.min(1, (t - at) / .32)) * -ih;
        if (t < at) return null;
        const px = lerp(it.p0[0], it.p1[0], sw) * iw, py = lerp(it.p0[1], it.p1[1], sw) * ih + (t - at < .32 ? fall * (1 - eo((t - at) / .32)) : 0);
        const z = (.32 + .26 * sw) * iw;
        return <div key={i} style={{ position: 'absolute', left: px - z / 2, top: py - z / 2, width: z, height: z, transform: `scale(${.6 + .4 * k}) rotate(${(i % 2 ? 1 : -1) * 8 * (1 - sw)}deg)` }}><Art name={it.a} /></div>;
      })}
    </div>
    {/* TIME label on the lid */}
    <div style={{ position: 'absolute', left: 0, right: 0, top: 22 * s, display: 'flex', justifyContent: 'center', transform: `scale(${sp(t, label, 11, 220)})` }}>
      <span style={{ background: C.ink, color: C.white, fontFamily: HEAD, fontWeight: 600, fontSize: 40 * s, padding: `${4 * s}px ${16 * s}px`, borderRadius: 10 * s, letterSpacing: '.08em' }}>TIME</span>
    </div>
  </div>;
};

// ---------------------------------------------------------------- card 1: the clock that swallows the afternoon
const ClockCard: React.FC = () => {
  const t = useT(), tTen = cue(1, 'ten'), tTask = cue(1, 'task'), tSw = cue(1, 'swallow'), tAft = cue(1, 'afternoon');
  const a1 = 60 * eio((t - tTen) / (tTask - tTen + .2));                           // 10 minutes
  const a2 = 1380 * eio((t - tSw) / (tAft - tSw + .5));                            // ...and on to 4 hours
  const ang = a1 + a2, mins = ang / 6, full = clamp((ang - 300) / 60);
  const pop = sp(t, 0, 12, 160), gulp = t > tSw ? Math.sin((t - tSw) * 18) * .07 * Math.exp(-(t - tSw) * 4) : 0;
  const R = 300, cx = 560, cy = 560, rad = (d: number) => (d - 90) * Math.PI / 180;
  const wedge = Math.min(ang, 359.9), large = wedge > 180 ? 1 : 0;
  const tot = Math.round(mins), hh = Math.floor(tot / 60), mm = tot % 60;
  return <AbsoluteFill style={{ background: C.sun }}>
    <div style={{ position: 'absolute', left: cx - 380, top: cy - 400, width: 760, height: 800, transform: `scale(${pop * (1 + gulp)}, ${pop * (1 - gulp)})`, transformOrigin: '50% 90%' }}>
      <svg width={760} height={800} viewBox={`${cx - 380} ${cy - 400} 760 800`}>
        <rect x={cx - 50} y={cy - R - 92} width={100} height={60} rx={14} fill={C.ink} />
        <rect x={cx - 18} y={cy - R - 40} width={36} height={40} fill={C.ink} />
        <circle cx={cx} cy={cy + 14} r={R + 14} fill={C.ink} opacity={.18} />
        <circle cx={cx} cy={cy} r={R} fill={C.white} stroke={C.ink} strokeWidth={26} />
        {ang > 0 && <path d={`M${cx} ${cy} L${cx} ${cy - R + 13} A${R - 13} ${R - 13} 0 ${large} 1 ${cx + (R - 13) * Math.cos(rad(wedge))} ${cy + (R - 13) * Math.sin(rad(wedge))} Z`} fill={C.hot} />}
        {full > 0 && <circle cx={cx} cy={cy} r={R - 13} fill={C.hot} opacity={full} />}
        {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={cx + (R - 46) * Math.cos(rad(i * 30))} y1={cy + (R - 46) * Math.sin(rad(i * 30))} x2={cx + (R - 80) * Math.cos(rad(i * 30))} y2={cy + (R - 80) * Math.sin(rad(i * 30))} stroke={C.ink} strokeWidth={i % 3 ? 8 : 14} strokeLinecap="round" />)}
        <line x1={cx} y1={cy} x2={cx + 150 * Math.cos(rad(ang / 12))} y2={cy + 150 * Math.sin(rad(ang / 12))} stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={cx + 230 * Math.cos(rad(ang))} y2={cy + 230 * Math.sin(rad(ang))} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={24} fill={C.ink} />
      </svg>
    </div>
    <div style={{ position: 'absolute', left: 1040, top: 250 }}>
      <Pill at={tTen - .05} bg={C.ink} c={C.white} s={50}>A 10 minute task</Pill>
    </div>
    <div style={{ position: 'absolute', left: 1030, top: 360, opacity: fade(t, tTen), fontFamily: HEAD, fontWeight: 600, fontSize: 290, color: C.ink, letterSpacing: '-.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
      {hh}:{String(mm).padStart(2, '0')}</div>
    <div style={{ position: 'absolute', left: 1040, top: 690 }}>
      <Rise at={cue(1, 'whole') - .1}><T s={74}>your <Hi at={tAft} bg={C.hot} c={C.white}>whole afternoon</Hi></T></Rise>
    </div>
  </AbsoluteFill>;
};


// ---------------------------------------------------------------- card 2: 1955, one line
const YearCard: React.FC = () => {
  const t = useT(), tPut = cue(1, 'put'), tLine = cue(1, 'line'), k = eio((t - tPut) / (tLine - tPut + .25));
  return <AbsoluteFill style={{ background: C.ink }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center' }}><Odometer from="2026" to="1955" at={cue(1, 'nineteen') - .35} s={330} /></div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center' }}>
      <Pill at={cue(1, 'british')} bg={C.sun} c={C.ink} s={56} style={{ transformOrigin: '50% 50%' }}>a British historian</Pill></div>
    <svg width={W} height={H} style={{ position: 'absolute' }}>
      <path d={`M360 820 ${Array.from({ length: 40 }, (_, i) => `L${360 + i * 31 * k} ${820 + Math.sin(i * .9) * 5}`).join(' ')}`} fill="none" stroke={C.sun} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      {k > 0 && k < 1 && <circle cx={360 + 39 * 31 * k} cy={820} r={20} fill={C.white} />}
    </svg>
    <div style={{ position: 'absolute', left: 1380, top: 860 }}><Rise at={cue(1, 'one')}><T s={58} c={C.sun}>one line</T></Rise></div>
  </AbsoluteFill>;
};


// ---------------------------------------------------------------- card 3: the half joking essay
const EssayCard: React.FC = () => {
  const t = useT(), tIn = cue(1, 'in', 7.5), tHalf = cue(1, 'half'), hit = t - tHalf;
  const shake = hit > 0 && hit < .4 ? Math.sin(hit * 70) * 14 * (1 - hit / .4) : 0;
  const lines = [.92, .78, .86, .64, .9, .82, .7, .88, .52];
  return <AbsoluteFill style={{ background: C.cool, transform: `translate(${shake}px, ${shake * .4}px)` }}>
    <div style={{ position: 'absolute', left: 230, top: 110, width: 760, height: 880, background: C.white, borderRadius: 18, transform: 'rotate(-3deg)', boxShadow: `0 26px 0 ${C.ink}33` }}>
      <div style={{ position: 'absolute', left: 70, top: 80, width: 380 * eo((t - tIn + .3) / .4), height: 34, background: C.ink, borderRadius: 8 }} />
      {lines.map((L, i) => {
        const k = eo((t - tIn - .05 - i * .1) / .3);
        return <div key={i} style={{ position: 'absolute', left: 70, top: 180 + i * 70, width: 620 * L * k, height: 20, background: i === 0 ? C.ink : '#C9CAD8', borderRadius: 6 }}>
          {i === 0 && <div style={{ position: 'absolute', left: -12, top: -14, width: `${eio((t - tIn - .2) / .4) * 104}%`, height: 48, background: C.sun, opacity: .75, borderRadius: 6, zIndex: -1 }} />}</div>;
      })}
      {t >= tHalf && <div style={{ position: 'absolute', left: 120, top: 420, transform: `rotate(-13deg) scale(${lerp(2.3, 1, eo(hit / .16))})`, opacity: eo(hit / .1),
        border: `14px solid ${C.hot}`, borderRadius: 26, padding: '14px 34px', fontFamily: HEAD, fontWeight: 600, fontSize: 104, color: C.hot, letterSpacing: '.02em', whiteSpace: 'nowrap', background: `${C.white}D0` }}>HALF JOKING</div>}
    </div>
    <div style={{ position: 'absolute', left: 1080, top: 330 }}>
      <Rise at={cue(1, 'essay')}><T s={52} c={C.white} style={{ opacity: .9 }}>an essay in</T></Rise>
      <Rise at={cue(1, 'economist') - .05} style={{ marginTop: 14 }}><T s={100} c={C.white}>The Economist</T></Rise>
      <div style={{ marginTop: 34 }}><Pill at={cue(1, 'economist') + .35} bg={C.ink} c={C.white} s={48}>November 1955</Pill></div>
    </div>
  </AbsoluteFill>;
};

// ---------------------------------------------------------------- card 4: the law
const QUOTE = ['Work', 'expands', 'so', 'as', 'to', 'fill', 'the', 'time', 'available', 'for', 'its', 'completion.'];
const LawCard: React.FC = () => {
  const t = useT(), tWork = cue(2, 'work');
  const at = QUOTE.map((w, i) => (i === 0 ? tWork - .1 : cue(2, w.replace('.', '').toLowerCase(), tWork)));
  return <AbsoluteFill style={{ background: C.hot }}>
    <Jar x={560} y={150} h={790} drop={tWork} swell={cue(2, 'expands')} fill={cue(2, 'fill')} label={cue(2, 'time')} wobble={cue(2, 'expands')} />
    <div style={{ position: 'absolute', left: 1010, top: 150, fontFamily: 'Georgia, serif', fontSize: 240, color: C.sun, lineHeight: 1, opacity: fade(t, tWork - .2) }}>“</div>
    <div style={{ position: 'absolute', left: 1020, top: 330, width: 820, display: 'flex', flexWrap: 'wrap', columnGap: 26, rowGap: 6 }}>
      {QUOTE.map((w, i) => {
        const k = eo((t - at[i] + .04) / .22), hi = w === 'fill' || w === 'time';
        return <span key={i} style={{ opacity: k, transform: `translateY(${(1 - k) * 34}px)`, display: 'inline-block' }}>
          {hi ? <T s={92} c={C.white}><Hi at={at[i] + .05} bg={C.sun} c={C.ink}>{w}</Hi></T> : <T s={92} c={C.white}>{w}</T>}</span>;
      })}
    </div>
    <div style={{ position: 'absolute', left: 1022, top: 800, opacity: fade(t, cue(2, 'completion') + .3) }}><T s={38} c={C.white} w={500} style={{ opacity: .85 }}>C. Northcote Parkinson, 1955</T></div>
  </AbsoluteFill>;
};


// ---------------------------------------------------------------- the flip side
const FlipJar: React.FC = () => {
  const t = useT(), tLess = cue(3, 'less'), k = sp(t, tLess, 8, 120), z = lerp(1, .58, k);
  const sq = t > tLess ? Math.sin((t - tLess) * 20) * .08 * Math.exp(-(t - tLess) * 5) : 0;
  return <AbsoluteFill style={{ background: C.cool }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${z * (1 + sq)}, ${z * (1 - sq)})`, transformOrigin: '560px 940px' }}>
      <Jar x={560} y={150} h={790} drop={-9} swell={-9} fill={-9} label={-9} wobble={tLess} />
    </div>
    {/* the space the work no longer needs */}
    <svg width={W} height={H} style={{ position: 'absolute', opacity: clamp(k * 1.4) * (1 - fade(t, tLess + 1.1, .4)) }}>
      <rect x={560 - 324} y={150} width={648} height={790} rx={40} fill="none" stroke={C.white} strokeWidth={8} strokeDasharray="30 22" />
    </svg>
    <div style={{ position: 'absolute', left: 1040, top: 330 }}>
      <Rise at={cue(3, 'give') - .08}><T s={150} c={C.white}>Give it</T></Rise>
      <Rise at={tLess - .1} style={{ marginTop: 10 }}><T s={150} c={C.white}><Hi at={tLess + .05} bg={C.ink} c={C.white}>less time.</Hi></T></Rise>
    </div>
  </AbsoluteFill>;
};
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DeadlineScene: React.FC = () => {
  const t = useT(), tSet = cue(3, 'set'), tDl = cue(3, 'deadline'), tToo = cue(3, 'too'), tShort = cue(3, 'short');
  const X = (d: number) => 300 + d * 330, mv = sp(t, tToo, 11, 150), fx = lerp(X(4), X(2), mv);
  const bar = Math.min(eio((t - tDl) / .9) * (X(4) - X(0)), fx - X(0)), flag = sp(t, tDl, 11, 200);
  const ring = t > tShort ? Math.sin((t - tShort) * 60) * 9 * Math.exp(-(t - tShort) * 2.2) : 0;
  return <AbsoluteFill style={{ background: C.sun }}>
    <div style={{ position: 'absolute', left: 180, top: 120 }}>
      <Rise at={tSet - .05}><T s={92}>A deadline that feels</T></Rise>
      <Rise at={cue(3, 'a', tSet + .5) - .05} style={{ marginTop: 6 }}><T s={92}>a little <Hi at={tToo} bg={C.hot} c={C.white}>too short</Hi></T></Rise>
    </div>
    <svg width={W} height={H} style={{ position: 'absolute' }}>
      <line x1={X(0) - 40} y1={760} x2={X(0) - 40 + (X(4) - X(0) + 160) * eio((t - tSet) / .6)} y2={760} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      {DAYS.map((d, i) => <g key={i} opacity={fade(t, tSet + .1 + i * .06)}><line x1={X(i)} y1={742} x2={X(i)} y2={778} stroke={C.ink} strokeWidth={8} />
        <text x={X(i)} y={840} textAnchor="middle" fontFamily={HEAD} fontWeight={600} fontSize={44} fill={C.ink}>{d}</text></g>)}
      <rect x={X(0)} y={640} width={Math.max(0, bar)} height={74} rx={18} fill={C.hot} />
      {bar > 160 && <text x={X(0) + 30} y={691} fontFamily={HEAD} fontWeight={600} fontSize={40} fill={C.white}>work</text>}
      <g transform={`translate(${fx}, 760) scale(${flag})`}>
        <line x1={0} y1={0} x2={0} y2={-300} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
        <path d="M0 -304 L250 -258 L0 -212 Z" fill={C.ink} />
        <text x={18} y={-247} fontFamily={HEAD} fontWeight={600} fontSize={28} fill={C.white} letterSpacing=".03em">DEADLINE</text>
      </g>
    </svg>
    <div style={{ position: 'absolute', left: fx + 150, top: 230, width: 210, height: 210, transform: `scale(${sp(t, tShort - .05, 10, 220)}) rotate(${ring}deg)` }}><Art name="alarm-clock" /></div>
  </AbsoluteFill>;
};
const FitScene: React.FC = () => {
  const t = useT(), tWork = cue(3, 'work'), tShr = cue(3, 'shrinks'), tFit = cue(3, 'fit'), q = t - tFit;
  const squeeze = t > tShr ? 1 - .22 * Math.sin(clamp((t - tShr) / .5) * Math.PI) : 1;
  return <AbsoluteFill style={{ background: C.canvas }}>
    <Confetti at={tFit} x={1380} y={520} />
    <div style={{ position: 'absolute', left: 1380 - 330, top: 200, width: 660, height: 660, transform: `scale(${sp(t, tFit - .08, 9, 190)})`, transformOrigin: '50% 90%' }}><Art name="guy-celebrate" /></div>
    <div style={{ position: 'absolute', left: 180, top: 300 }}>
      <Rise at={tWork - .12}><T s={150}>The work</T></Rise>
      <div style={{ marginTop: 8, display: 'inline-block', transform: `scaleX(${squeeze})`, transformOrigin: '0 50%', opacity: fade(t, tShr - .1) }}><T s={150}>shrinks</T></div>
      <Rise at={tFit - .25} style={{ marginTop: 8 }}><T s={150}>to <Hi at={tFit} bg={C.cool} c={C.white}>fit.</Hi></T></Rise>
    </div>
  </AbsoluteFill>;
};
const EndCard: React.FC<{ a: number }> = ({ a }) => {
  const t = useT(), title = "Parkinson's Law";
  return <AbsoluteFill style={{ background: C.ink, transform: `scale(${1 + .03 * clamp((t - a) / 4)})` }}>
    <div style={{ position: 'absolute', left: 960 - 95, top: 150 + Math.sin((t - a) * 2.2) * 8, width: 190, height: 232, transform: `scale(${sp(t, a + .15, 10, 180)}) rotate(${Math.sin((t - a) * 1.6) * 3}deg)` }}><Art name="glass-jar" /></div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center' }}>
      {title.split('').map((ch, i) => { const k = sp(t, a + .3 + i * .035, 12, 210);
        return <span key={i} style={{ display: 'inline-block', transform: `translateY(${(1 - k) * 90}px)`, opacity: clamp(k * 1.5), whiteSpace: 'pre' }}><T s={170} c={C.white}>{ch}</T></span>; })}
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 650, textAlign: 'center' }}><Rise at={a + 1}><T s={64} c={C.sun} w={600}>Work fills the time you give it.</T></Rise></div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', opacity: fade(t, a + 1.8, .5) }}>
      <span style={{ background: `${C.white}1A`, color: C.white, fontFamily: HEAD, fontWeight: 500, fontSize: 34, padding: '10px 26px', borderRadius: 999 }}>Made with mapcast</span></div>
  </AbsoluteFill>;
};


// ---------------------------------------------------------------- the cut
export const Showcase: React.FC = () => {
  const t = useT();
  const pan = (at: number) => ({ t0: at, t1: at + .62, dip: .42 });
  const m4 = cue(2, 'today') - .12, flip = cue(3, 'so') - .1, whip = cue(3, 'set') - .26, iris = cue(3, 'and') - .2, end = cue(3, 'fit') + .55;
  const map = <MapCamera
    cards={[{ x: 0, y: 0, el: <ClockCard />, tag: 'the trap' }, { x: 3000, y: 0, el: <YearCard />, tag: '1955' },
      { x: 0, y: 1800, el: <EssayCard />, tag: 'the essay' }, { x: 3000, y: 1800, el: <LawCard />, tag: 'the law' }]}
    moves={[{ ...pan(cue(1, 'in') - .32), to: { x: 3000, y: 0, z: 1 } }, { ...pan(cue(1, 'in', 7.5) - .32), to: { x: 0, y: 1800, z: 1 } },
      { ...pan(cue(2, 'work') - .36), to: { x: 3000, y: 1800, z: 1 } },
      { t0: m4, t1: m4 + 1.05, to: { x: 1500, y: 900, z: .33 } }, { t0: m4 + 1.5, t1: cue(3, 'so') + .1, to: { x: 1500, y: 930, z: .45 } }]}
    node={{ x: 1500, y: 900, label: "Parkinson's Law", at: cue(2, "parkinson's") - .05, links: m4 + .4 }} />;
  return <AbsoluteFill style={{ background: C.ink }}>
    <Push at={end} a={
      <Iris at={iris} x={960} y={460} a={
        <Whip at={whip} a={<Flip at={flip} a={map} b={<FlipJar />} />} b={<DeadlineScene />} />} b={<FitScene />} />} b={<EndCard a={end} />} />
    {t < end && <Watermark />}
  </AbsoluteFill>;
};
