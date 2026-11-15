# Channel profile and palettes

`$MAPCAST_HOME/channel.json` (default ~/mapcast-videos/channel.json). Every `setup.sh new` copies it into the new
video (remotion/src/theme.json and project.json). Example:
```json
{
  "theme": {
    "channel": "Brain Atlas",
    "tagline": "Big ideas, drawn simply. New video every week.",
    "watermark": "",
    "preset": "sunny",
    "c": { "sun": "#FFD93B", "ink": "#2B2D6E", "hot": "#FF6B5A", "cool": "#19C3B1", "canvas": "#F7F6F2", "white": "#FFFFFF", "mute": "#9A9CB3", "dot": "#DDDCE6" }
  },
  "voice": { "provider": "elevenlabs", "voice_id": "<from the ElevenLabs Voice Library>", "model": "eleven_v3" },
  "character": "a young woman with short curly hair, a mustard jacket, dark jeans and white sneakers, a simple friendly face",
  "niche": "psychology and self-improvement", "audience": "25 to 40, US first", "language": "en"
}
```
`watermark`: empty shows the channel name as small type; or put a logo file in remotion/public/ and give its name
(e.g. "logo.svg"). Never put API keys in this file.

## Colour roles
- `sun`: the main bright scene colour (most colour scenes and the thumbnail A background)
- `ink`: the dark colour, all text on light colours, and the dark scenes
- `hot`: the warm accent (strikes, the "bad" side, alerts)
- `cool`: the second accent (the "good" side, checks, growth lines)
- `canvas`, `dot`: the mind-map canvas and its dot grid; `white`: cards; `mute`: grey labels

## Presets
| preset | sun | ink | hot | cool | canvas | feel |
|---|---|---|---|---|---|---|
| sunny | #FFD93B | #2B2D6E | #FF6B5A | #19C3B1 | #F7F6F2 | bright, friendly, the classic summary look |
| midnight | #7C9CFF | #141A33 | #FF7A59 | #3DDC97 | #F3F4F8 | calm, modern, tech and money |
| mint | #8FE3C0 | #173B3F | #FF8A65 | #4C8DF6 | #F5F8F6 | fresh, health and habits |
| candy | #FFB3C7 | #3A1F5D | #FF5C5C | #2EC4B6 | #FBF7F4 | playful, psychology and relationships |
Keep text contrast at least 4.5:1: ink on sun/cool/canvas, white on ink. Check new brand colours before using them.
