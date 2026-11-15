import { Composition, Still } from 'remotion';
import { Thumb } from './Thumb';
import { Video } from './Video';
import TL from './timeline.json';

export const Root = () => <>
  <Composition id="Video" component={Video} durationInFrames={Math.ceil((TL as any).end * 30)} fps={30} width={1920} height={1080} />
  <Still id="ThumbA" component={Thumb} defaultProps={{ concept: 'a' as const }} width={1920} height={1080} />
  <Still id="ThumbB" component={Thumb} defaultProps={{ concept: 'b' as const }} width={1920} height={1080} />
  <Still id="ThumbC" component={Thumb} defaultProps={{ concept: 'c' as const }} width={1920} height={1080} />
</>;
