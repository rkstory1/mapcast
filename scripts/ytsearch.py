"""ytsearch.py "query" ["query" ...] : top YouTube search results with views, age, length and channel.

Use it before picking a topic or a title: what wins for the query, how old the winners are, and whether small
channels break through. No API key; reads the public results page (US English).
THUMBS=<dir> python3 ytsearch.py "query" also saves each result's thumbnail as <dir>/<views>-<id>.jpg (thumbnail
research), and a contact sheet <dir>/sheet.jpg when ffmpeg is present.
"""
import os
import sys, re, json, urllib.parse, subprocess


def search(q, n=10):
    html = subprocess.run(['curl', '-sL', '-A', 'Mozilla/5.0', '-H', 'Accept-Language: en-US',
                           'https://www.youtube.com/results?search_query=' + urllib.parse.quote(q) + '&hl=en&gl=US'],
                          capture_output=True, text=True).stdout
    m = re.search(r'var ytInitialData = (\{.*?\});</script>', html)
    if not m: return []
    out = []

    def walk(o):
        if isinstance(o, dict):
            if 'videoRenderer' in o:
                v = o['videoRenderer']
                out.append({'id': v.get('videoId', ''), 'title': ''.join(r['text'] for r in v['title']['runs']),
                            'views': v.get('viewCountText', {}).get('simpleText', ''),
                            'age': v.get('publishedTimeText', {}).get('simpleText', ''),
                            'len': v.get('lengthText', {}).get('simpleText', ''),
                            'channel': v.get('ownerText', {}).get('runs', [{}])[0].get('text', '')})
            for x in o.values(): walk(x)
        elif isinstance(o, list):
            for x in o: walk(x)
    walk(json.loads(m.group(1)))
    return out[:n]


for q in sys.argv[1:]:
    print('##', q)
    for r in search(q):
        print(f"{r['views']:>16} | {r['age']:>14} | {r['len']:>6} | {r['channel'][:22]:22} | {r['title']} | {r['id']}")
        d = os.environ.get('THUMBS')
        if d and r['id']:
            os.makedirs(d, exist_ok=True)
            n = re.sub(r'\D', '', r['views']) or '0'
            f = os.path.join(d, f"{int(n):012d}-{r['id']}.jpg")
            if not os.path.exists(f):
                for q2 in ('maxresdefault', 'hqdefault'):
                    subprocess.run(['curl', '-sfL', '-o', f, f"https://i.ytimg.com/vi/{r['id']}/{q2}.jpg"])
                    if os.path.exists(f) and os.path.getsize(f) > 5000: break
d = os.environ.get('THUMBS')
if d and os.path.isdir(d):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-pattern_type', 'glob', '-i', os.path.join(d, '0*.jpg'),
                    '-vf', 'scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:(ow-iw)/2:(oh-ih)/2,tile=4x6',
                    os.path.join(d, 'sheet%02d.jpg')])
