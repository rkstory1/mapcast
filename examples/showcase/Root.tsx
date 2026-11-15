import { Composition } from 'remotion';
import { Showcase } from './Showcase';
import TL from './timeline.json';

// the showcase is registered as "Video", so render.mjs and stills.mjs work on it unchanged
export const Root = () => <Composition id="Video" component={Showcase} durationInFrames={Math.ceil((TL as any).end * 30)} fps={30} width={1920} height={1080} />;
