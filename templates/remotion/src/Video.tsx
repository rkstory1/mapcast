// The video: one scene per beat in beats.ts. A beat starts on its cue word and lasts until the next beat starts.
// 1920x1080 at 30 fps; render.mjs renders it at scale 2 for the 4K master.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { cue, END, useT, eo, eio } from './lib';
import { C, col, ink, live, Wipe, Pop, Slam, Tag, Fig, Arrow, NodeCard, Watermark } from './kit';
import { SectionCard, Quote, Board, Layers, Compare, Rows, Bars, Curve, Growth, Grid, Card, Tour, Big, EndScreen } from './scenes';
import { BEATS, Beat } from './beats';

/** a white mind-map page that slides up, its node card on the left and the beat's content on the right */
const MapPage: React.FC<{ a: number; b: number; node: string; children?: React.ReactNode }> = ({ a, b, node, children }) => {
  const t = useT(); if (!live(t, a, b)) return null;
  const p = eio((t - a + .05) / .55), drift = (t - a) * 6;
  return <AbsoluteFill style={{ background: C.canvas, transform: `translateY(${(1 - p) * 1080}px)`,
    backgroundImage: `radial-gradient(${C.dot} 3px, transparent 3px)`, backgroundSize: '60px 60px', backgroundPosition: `0 ${-drift}px` }}>
    <svg width={1920} height={1080} style={{ position: 'absolute' }}>
      <line x1={330} y1={0} x2={330} y2={420} stroke={C.ink} strokeWidth={4} strokeDasharray="16 14" opacity={.45} />
      <line x1={330} y1={660} x2={330} y2={1080} stroke={C.ink} strokeWidth={4} strokeDasharray="16 14" opacity={.45} />
      <line x1={590} y1={540} x2={720} y2={540} stroke={C.ink} strokeWidth={4} strokeDasharray="16 14" opacity={.45} />
    </svg>
    <NodeCard x={330} y={540} label={node} on={a + .35} />
    {children}
  </AbsoluteFill>;
};

/** colour scene or map page: drawings and words placed by a layout preset
 *  lay: L art left / text right, R text left / art right, C headline top / art centre, 2 or 3 drawings in a row, arrow = 2 with an arrow */
const Layout: React.FC<{ s: Beat; a: number; bg: string; map?: boolean }> = ({ s, a, bg, map }) => {
  const c = ink(bg), arts: string[] = s.arts || [], tags = s.tags || [], lay = s.lay || 'L';
  const tagAt = (tg: any, i: number) => (tg.c ? cue(s.p, tg.c) : a + .45 + i * .35);
  const x0 = map ? 760 : 0, W = map ? 1160 : 1920;
  const tagBg = bg === C.ink ? C.sun : C.ink, tagCol = bg === C.ink ? C.ink : C.white;
  const out: React.ReactNode[] = [];
  const tall = (n: string) => (s.tall || []).includes(n) ? 1.4 : 1;
  if (lay === 'L' || lay === 'R') {
    const left = lay === 'L', artX = x0 + (left ? W * .27 : W * .73), txtX = x0 + (left ? W * .5 : 120);
    if (arts[0]) out.push(<Pop key="a" at={a + .15} x={artX} y={560} w={(map ? 440 : 560) * tall(arts[0])} art={arts[0]} />);
    if (s.slam) out.push(<Slam key="s" at={a + .05} size={map ? 76 : s.slam.length > 28 ? 92 : 120} color={c} x={txtX} y={tags.length ? 450 : 540} align="left" w={W * .46}>{s.slam}</Slam>);
    tags.forEach((tg: any, i: number) => out.push(<Tag key={'t' + i} at={tagAt(tg, i)} x={txtX + 4} y={(s.slam ? 600 : 470) + i * 110} bg={tagBg} color={tagCol} size={42} maxW={W * .45}>{tg.t}</Tag>));
    if (s.fig) out.push(<Fig key="f" at={s.fig.c ? cue(s.p, s.fig.c) : a + .3} {...s.fig} x={txtX} y={s.slam ? 600 : 330} />);
  } else if (lay === 'C') {
    if (s.slam) out.push(<Slam key="s" at={a + .05} size={s.slam.length > 30 ? 84 : 110} color={c} y={arts.length ? 250 : 470}>{s.slam}</Slam>);
    if (arts[0]) out.push(<Pop key="a" at={a + .3} x={960} y={660} w={460 * Math.min(tall(arts[0]), 1.2)} art={arts[0]} />);
    tags.forEach((tg: any, i: number) => out.push(<Tag key={'t' + i} at={tagAt(tg, i)} x={560} y={610 + i * 110} bg={tagBg} color={tagCol} size={46}>{tg.t}</Tag>));
  } else if (lay === '2' || lay === '3' || lay === 'arrow') {
    const n = lay === '3' ? 3 : 2, step = W / n;
    arts.slice(0, n).forEach((ar, i) => {
      const x = x0 + step * (i + .5), at = i === 0 ? a + .15 : (tags[i] && tags[i].c ? cue(s.p, tags[i].c) - .1 : a + .15 + i * .5);
      out.push(<Pop key={'a' + i} at={at} x={x} y={470} w={n === 3 ? (map ? 300 : 380) : (map ? 380 : 470)} art={ar} />);
      if (tags[i]) out.push(<div key={'t' + i} style={{ position: 'absolute', left: x - step / 2 + 20, width: step - 40, top: 790, display: 'flex', justifyContent: 'center' }}>
        <div><Tag inline at={tagAt(tags[i], i)} x={0} y={0} bg={tagBg} color={tagCol} size={n === 3 ? 38 : 44} maxW={step - 60}>{tags[i].t}</Tag></div></div>);
    });
    if (lay === 'arrow') out.push(<Arrow key="ar" at={a + .9} x={x0 + W / 2 - 80} y={470} w={160} color={c} />);
    if (s.slam) out.push(<Slam key="s" at={a + .05} size={70} color={c} y={150}>{s.slam}</Slam>);
  }
  return <>{out}</>;
};

const One: React.FC<{ s: Beat; a: number; b: number }> = ({ s, a, b }) => {
  const p = s.p;
  switch (s.k) {
    case 'c': { const bg = col(s.bg); return <Wipe a={a} b={b} bg={bg}><Layout s={s} a={a} bg={bg} /></Wipe>; }
    case 'm': return <MapPage a={a} b={b} node={s.node}><Layout s={s} a={a + .3} bg={C.canvas} map /></MapPage>;
    case 'big': return <Big a={a} b={b} p={p} bg={col(s.bg)} big={s.big} sub={s.sub} subC={s.subC} art={s.art} />;
    case 'tour': return <Tour a={a} b={b} nodes={s.nodes} focus={s.focus} art={s.art} tag={s.tag} />;
    case 'section': return <SectionCard a={a} b={b} n={s.n ?? 0} title={s.title} label={s.label} alt={s.alt} />;
    case 'quote': return <Quote a={a} b={b} text={s.text} by={s.by} bg={s.bg ? col(s.bg) : C.canvas} />;
    case 'board': return <Board a={a} b={b} p={p} cols={s.cols} rows={s.rows} full={s.full} bg={s.bg ? col(s.bg) : C.sun} />;
    case 'layers': return <Layers a={a} b={b} p={p} title={s.title} layers={s.layers} />;
    case 'cmp': return <Compare a={a} b={b} p={p} bg={col(s.bg)} l={s.l} r={s.r} title={s.title} />;
    case 'rows': return <Rows a={a} b={b} p={p} bg={col(s.bg)} title={s.title} rows={s.rows} size={s.size} />;
    case 'bars': return <Bars a={a} b={b} p={p} title={s.title} bars={s.bars} bg={s.bg ? col(s.bg) : C.ink} />;
    case 'curve': return <Curve a={a} b={b} p={p} expect={s.expect} real={s.real} gap={s.gap} gapC={s.gapC} x={s.x} />;
    case 'growth': return <Growth a={a} b={b} p={p} up={s.up} upC={s.upC} down={s.down} downC={s.downC} x={s.x} title={s.title} />;
    case 'grid': return <Grid a={a} b={b} title={s.title} n={s.n} missed={s.missed} />;
    case 'card': return <Card a={a} b={b} p={p} head={s.head} rows={s.rows} flip={s.flip} color={s.color} foot={s.foot} />;
    case 'end': return <EndScreen a={a} />;
  }
  throw new Error(`unknown beat kind "${s.k}" (part ${s.p}, "${s.c}")`);
};

const STARTS = BEATS.map((s, i) => (i === 0 ? 0 : cue(s.p, s.c) - .08));   // the first beat owns the frame from 0

export const Video: React.FC = () => {
  const t = useT(), last = STARTS[STARTS.length - 1], endBeat = BEATS[BEATS.length - 1].k === 'end';
  return <AbsoluteFill style={{ background: C.sun }}>
    {BEATS.map((s, i) => {
      const a = STARTS[i], b = i + 1 < BEATS.length ? STARTS[i + 1] : END;
      return t < a - .3 || t > b + .45 ? null : <One key={i} s={s} a={a} b={b} />;
    })}
    {(!endBeat || t < last) && <Watermark />}
  </AbsoluteFill>;
};
