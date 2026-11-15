"""tts.py [--estimate] [--parts 01,02] -> voice/NN.mp3 with ElevenLabs, one file per part, from voice/voice-tts.json.
Needs ELEVENLABS_API_KEY in the environment (never write the key into a file). The voice comes from project.json
voice.voice_id, the model from voice.model (default eleven_v3, which reads the [warm]/[curious] tags; for a model
without tag support the tags are removed). --estimate prints the character count (about 1 credit each) and stops.
Skips parts that already have a file, so a stopped run can be continued. Use the ElevenLabs MCP connector instead if
your Claude has it: same text, same voice, one generation per part."""
import json, os, re, sys, urllib.request
tts = json.load(open('voice/voice-tts.json')); v = json.load(open('project.json')).get('voice', {})
only = next((a.split('=', 1)[1] if '=' in a else sys.argv[sys.argv.index(a) + 1] for a in sys.argv if a.startswith('--parts')), None)
keys = [k for k in sorted(tts, key=int) if not only or k in only.split(',')]
model = v.get('model') or 'eleven_v3'; tags = 'v3' in model or 'v4' in model
text = {k: tts[k] if tags else re.sub(r'\[[a-z ]+\]\s*', '', tts[k]) for k in keys}
chars = sum(len(text[k]) for k in keys if not os.path.exists(f'voice/{k}.mp3'))
print(f'{len(keys)} parts, {chars} characters still to make (about {chars} credits), model {model}')
if '--estimate' in sys.argv: raise SystemExit
key = os.environ.get('ELEVENLABS_API_KEY') or sys.exit('set ELEVENLABS_API_KEY first (export it in the terminal, do not save it in a file)')
vid = v.get('voice_id') or sys.exit('set voice.voice_id in project.json')
for k in keys:
    out = f'voice/{k}.mp3'
    if os.path.exists(out): continue
    body = json.dumps({'text': text[k], 'model_id': model, 'voice_settings': {'stability': .5, 'similarity_boost': .75}}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128', body,
                                 {'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    try:
        with urllib.request.urlopen(req, timeout=300) as r: open(out, 'wb').write(r.read())
    except urllib.error.HTTPError as e: sys.exit(f'part {k}: ElevenLabs said {e.code} {e.read()[:300]!r}')
    print('made', out)
