"""transcribe.py a.mp3 b.mp3 ... -> a.json, b.json: word timings with faster-whisper, on this computer, free.
MODEL=small.en by default (English); for other languages set MODEL=large-v3-turbo and WLANG=hi, es, de ...
The model downloads once on first use (about 500 MB for small.en)."""
import sys, json, os, subprocess
import numpy as np
from faster_whisper import WhisperModel
lang = os.environ.get("WLANG") or None
m = WhisperModel(os.environ.get('MODEL', 'small.en'), device='cpu', compute_type='int8')
for f in sys.argv[1:]:
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
    segs, _ = m.transcribe(a, word_timestamps=True, beam_size=5, language=lang)
    words = [{'text': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3)} for s in segs for w in s.words]
    json.dump(words, open(f.rsplit('.', 1)[0] + '.json', 'w'))
    print('##', f, len(words), 'words:', ' '.join(w['text'] for w in words)[:300])
