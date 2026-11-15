---
name: mapcast
description: Make long-form animated explainer videos for YouTube in the viral "animated summary" style (flat vector drawings in bold colour, a mind-map canvas the camera travels across, kinetic headlines, charts drawn live, something moving every second), from an idea to a finished 4K video, thumbnails and upload copy. Guides the user step by step and waits for their OK at every gate - install the tools, channel profile, a researched topic with title, thumbnail direction and hook, the fact-checked script, the voice (ElevenLabs, or any audio the user records or generates), the drawings, the Remotion edit, music and mix, the 4K render, captions, thumbnails and the upload text. Use it whenever someone wants to make an animated explainer, book summary, self-improvement, psychology, money, history or "how it works" video in this style, says "make a mapcast video", "new video on <topic>", "animated summary video", "explainer video like the big summary channels", or asks to install or set up mapcast.
---

# mapcast: animated explainer videos, from idea to upload

mapcast turns a topic into a finished long-form animated video in the style the big summary and explainer channels
use: flat vector drawings in a few bold colours, a white mind-map canvas whose cards the camera glides between, big
headlines that slam in, boards and charts that fill up as the narrator speaks, and a new picture every few seconds.
Everything is timed to the spoken words, so the screen always shows what the voice says.

Who does what: **you (Claude) run the whole pipeline; the user decides.** Never skip a gate. At each gate show the
result, ask one clear question, and wait. The user can say "do it all" to merge gates; respect that, but still stop
before anything that costs money (voice credits, paid images) unless they already said yes to the cost.

Talk to the user in plain, friendly language. Explain each step in one or two sentences the first time it comes up,
because many users are new to video tools. Say what you are about to install or run before you do it.

## The order (the way the biggest YouTubers work)

```
0. Setup        install the tools (once per computer)          gate: user OKs the install
1. Channel      channel profile (once per channel)             gate: user confirms the profile
2. Pitch        researched topic, 3 titles, thumbnail, hook    gate: user picks / approves
3. Script       facts checked, full narration                  gate: user approves the script
4. Voice        ElevenLabs, or the user's own audio            gate: user picks the route (and the cost)
5. Art          the drawings, in one consistent style          gate: user OKs the look (stills)
6. Edit         beats.ts: a scene on every few spoken words    (QC stills, user may review)
7. Music        2 to 5 calm tracks, mixed under the voice      gate: user provides or OKs the music
8. Render       4K master, 1080p and phone copies, checks
9. Package      captions, 3 thumbnails, upload copy            gate: user picks the thumbnail and uploads
```
Title, thumbnail and hook come BEFORE the script: the video is designed to be clicked and watched first, and the
script is written to pay off that promise. Never write the script before the pitch is approved.

Paths: `SKILL` = this skill's folder (where this file is). Video folders live in `$MAPCAST_HOME` (default
`~/mapcast-videos`), one per video, `NNN-short-topic`. Every command below runs from the video folder unless it says
`remotion/`. `./py` in a video folder is the skill's own Python (with the packages installed by setup).

---

## Step 0. Setup (first time on a computer)

1. Run `bash SKILL/scripts/setup.sh check` and show the user the list.
2. If anything is missing, tell them what will be installed and why, in one short list:
   - **Node.js 20+** runs Remotion, the video engine (React code rendered to video frames).
   - **ffmpeg** cuts, mixes and encodes audio and video.
   - **Python 3.9 to 3.12** with numpy, pillow, scipy (image and audio maths), **vtracer** (turns drawings into sharp
     vector SVGs), **faster-whisper** (finds the exact time of every spoken word, free and offline).
   - **Remotion** and its headless browser, installed once in `~/.mapcast/kit` and shared by every video.
   Ask "Shall I install these?" and wait. Then run `bash SKILL/scripts/setup.sh install`.
   - On a Mac without Homebrew, the script prints the official Homebrew command. It needs the user's password, so
     the user runs it in their own terminal; then run install again. On Linux it prints the apt command to run.
   - Windows: use WSL (Ubuntu) and follow the Linux path.
3. Prove it works: `bash SKILL/scripts/setup.sh demo` builds a 2-minute demo video (the Pomodoro Technique, starter
   drawings, estimated timing, no voice needed) and renders a contact sheet of stills. Show the user
   `remotion/out/demo/sheet-01.jpg` from the demo folder. This is also the best way to show what the style looks like.

## Step 1. Channel profile (first video on a channel)

Ask these in one message (offer the defaults in brackets), then write `$MAPCAST_HOME/channel.json`
(format in `references/channel.md`):
- Channel name and one-line tagline (shown on the end screen and as the small watermark).
- Niche and audience: who watches, which country first (ad rates are highest for US viewers), which language.
- Palette: show the presets in `references/channel.md` (sunny, midnight, mint, candy) or their own 4 brand colours.
- Voice route: ElevenLabs (which voice; the voice ID from their ElevenLabs Voice Library), or their own voice/any
  other TTS (they record or generate the audio and give you the file).
- The recurring character for the drawings (one line, e.g. "a young woman with a yellow jacket and short curly hair").
Every new video folder copies the profile in. The user can change it any time.

## Step 2. Pitch: topic, titles, thumbnail direction, hook (gate)

Read `references/research.md` first. In short:
1. `bash SKILL/scripts/setup.sh new 001-short-topic` makes the video folder. Fill `brief.md` as you go.
2. If the user gave a topic, research it; if they gave a niche, find 3 candidate topics. Use
   `./py ytsearch.py "query" "query 2"` (no API key): what wins for the search, how old the winners are, whether
   small channels break through, and the copycat check (fresh videos on the same angle with tiny views mean the angle
   is flooded). `THUMBS=out/research ./py ytsearch.py "query"` also saves the winners' thumbnails as a contact sheet.
3. Pick the angle only this video can give: one true story, one surprising number, one framework of the user's own.
4. Write in brief.md and show the user:
   - why this topic, now, with the numbers you found;
   - **3 titles** for YouTube's Test & compare, each searched so no fresh channel already uses it;
   - **one thumbnail direction** that complements title A (never repeats it): background colour, 2 to 3 huge words,
     one chip, one big drawing, readable at phone size;
   - **the hook**, written as it will be spoken: the story or fact by second 8, the open question by second 20,
     paid off at the end;
   - the section plan and the target length (long-form: 10 to 20 minutes; aim for 50%+ average view duration).
   Ask: "Which title and is the hook right?" Wait.

## Step 3. Facts and script (gate)

Read `references/script.md` (structure, voice rules, YouTube's monetisation rules).
1. Check every claim at its primary source (the book, the study, the official site). Log a table in brief.md: part,
   claim, status, source. Fix the script to the source, never the other way round.
2. Write `script.md`: one `### NN Title` heading and one fenced block per part, 10 to 30 s each, a direction tag first
   ([curious], [warm], [calm], [serious], [excited]), numbers written as spoken, short clear sentences.
   Re-hook every 45 to 60 s. One framework or example that is the user's own (the human contribution). End with the
   comment question and subscribe; add a disclaimer part for money, health or legal topics.
3. `./py script2tts.py` writes voice/voice-tts.json and prints the word count, length and credit estimate.
   Show the script and the numbers. Ask for the user's edits; YouTube wants a human pass on every script. Wait.

## Step 4. Voice (gate)

Ask which route (unless the profile already says), and give the cost first:
- **A. ElevenLabs** (Claude makes it). `./py tts.py --estimate` prints the characters (about 1 credit each). Ask
  "This costs about N credits, go ahead?" Then either the ElevenLabs MCP connector if this Claude has it (one
  generation per part, the text exactly from voice-tts.json, save as voice/NN.mp3), or the API:
  the user runs `export ELEVENLABS_API_KEY=...` in the terminal (never paste it in chat, never write it in a file),
  then `./py tts.py`. Model: `eleven_v3` reads the direction tags; set `voice.model` in project.json to change it.
- **B. Own audio** (the user records it or uses any other TTS app). Ask for either one file per part
  (`voice/01.mp3`, `voice/02.mp3`...) or ONE file of the whole script read in order (`voice/full.mp3` or .wav/.m4a):
  then `./py split-voice.py voice/full.mp3` cuts it into parts at the pauses.
Then, for both routes:
```
cp voice/[0-9]*.mp3 voice/raw/ && ./py transcribe.py voice/raw/[0-9]*.mp3   # word timings (free, offline)
./py align.py          # puts the timings on the script's own words; prints anything misread
./py timeline.py       # remotion/src/timeline.json and the real video length
```
Listen-check: if align.py shows a part with many unmatched words, the voice misread it; regenerate that part (A) or
ask the user to re-record it (B). Set longer breaths in project.json `breaths` after the hook and at each section.

## Step 5. Art (gate)

Read `references/art.md`. In short: every drawing comes from ONE image chat in ONE style, made as 2x2 sheets, cut out
and traced to SVG so it stays sharp at 4K.
1. Write `art.md` (one line per drawing, grouped as objects / characters / scenes). Plan from the script: a drawing
   for every named object, idea and story moment. A 10-minute video needs about 40 to 70 drawings (10 to 18 sheets).
2. `./py prompts.py` writes `art-src/prompts.md` (the exact prompts, palette included) and `art-src/sheets.txt`.
3. Make the sheets, by the user's choice:
   - **ChatGPT in the user's Chrome** (Claude in Chrome): one new chat, paste `SKILL/scripts/chatgpt-helpers.js`
     with javascript_tool, queue the prompts, save each sheet as `art-src/<letter>.png` (details in art.md).
   - **The user makes them** in ChatGPT, Gemini, Midjourney or any image tool: give them prompts.md, they save the
     sheets into art-src/ with the letter names.
4. `./py slice.py --all` cuts every sheet into `remotion/public/art/<name>.svg`. Open a few PNGs to check the
   cut-outs (white sneakers, holes, stray bits); fix with the flags in art.md.
5. Look check (gate): with the drawings in, render 6 to 10 stills of the first minute (step 6 commands) and show
   them. Ask "Is this the look you want?" before building the rest.

## Step 6. Edit

Read `references/beats.md` (every scene kind and its props). The edit is `remotion/src/beats.ts`: one line per beat,
`b(part, 'first spoken words', kind, {props})`. A beat starts on its words and lasts until the next beat.
- A new beat every 3 to 6 seconds, and on every named person, object, number or idea. Never a static frame.
- Open each section with the progress map (`tour`): it shows where the viewer is, ticks off what they have seen, and
  re-hooks them. Use `section` cards for big chapters, `board` for a recurring model that fills up, `big` for hook
  numbers, `cmp`, `rows`, `bars`, `curve`, `growth`, `grid` for ideas and data, `quote` for short credited quotes,
  `card` for the user's own framework, `end` last.
- Real people are named in type, never drawn as a likeness. No logos or copyrighted characters in drawings.
- Edit the thumbnail words in `remotion/src/Thumb.tsx` (THUMBS) now too.
Checks after every edit:
```
./py checkcues.py                                           # every cue is a spoken phrase, beats in order
cd remotion && node stills.mjs Video 0.5 out/s2 $(seq 0 2 900) && cd .. && bash sheet.sh remotion/out/s2
```
Read every contact sheet. Fix: empty frames, text over drawings, text running off a card, a drawing cut at the edge,
a beat that shows only a title for more than 2 s. You can also preview live: `cd remotion && npx remotion studio`.
Before the voice exists you can build on `./py est-timeline.py` (estimated timing); run timeline.py when the voice is in.

## Step 7. Music and mix (gate)

Read `references/sound.md`. Ask the user for 2 to 5 calm instrumental tracks they have the rights to (YouTube Audio
Library is free; Epidemic Sound, Artlist and similar need a subscription; use the Epidemic Sound connector if this
Claude has it). Save them in `music/`.
```
./py voiceband.py music/*      # under about 2% in the voice band = the voice stays clear over it
```
Add them to project.json `music` with the part each one starts at (change music at section breaths), then
`./py mix.py` and `./py gap.py` (target: the voice about 20 dB above the music while talking). -14 LUFS master.

## Step 8. Render

```
cd remotion && CONC=2 node render.mjs 2      # 4K master in 30 s segments, each flash-checked; re-run to resume
cd .. && bash finish.sh                       # out/<slug>-4k.mp4, -1080p.mp4, -phone.mp4 with the mix, flash check
```
Run the render in the background and tell the user roughly how long (about 1 to 2 minutes per 30 s of video on a
recent laptop). CONC=4 can run out of memory on 16 GB; keep 2. Then 2 s stills from the final 1080p
(`ffmpeg -i out/<slug>-1080p.mp4 -vf fps=0.5,scale=480:-1,tile=6x6 out/final-%02d.jpg`) and read them.

## Step 9. Package (gate)

```
./py srt.py                          # out/captions.srt (add the video's numbers to numbers.txt first)
cd remotion && node thumbs.mjs       # out/thumbs/thumbnail-a/b/c.jpg and small-sheet.jpg (phone size)
```
Fill `upload.md`: titles, description that opens with the hook, chapters from timeline.py's part starts, sources,
music credits, tags, pinned comment, settings ("Altered or synthetic content: Yes" for an AI voice). Show the user the
phone copy, the thumbnail sheet and upload.md. The user watches, picks the thumbnail and uploads it themselves.

---

## Rules that protect the channel (YouTube, 2026)

- YouTube demonetises "inauthentic" mass-produced content: near-identical template videos, and AI presenters on
  money, health or legal topics. So: every script gets the user's own human pass and one idea of their own; every
  video has its own scenes and drawings; never an AI avatar; disclose AI voice with the "altered or synthetic" setting.
- Never copy another channel's script, scenes, drawings, title or thumbnail. Study what works (format, pacing,
  structure); make everything new.
- Quote books in short lines only, credited. Paraphrase the ideas, name the author and the book.
- Facts from primary sources, logged in brief.md. If a fact cannot be confirmed, cut it.
- Never store API keys or passwords in any file. Never sign in or upload for the user.

## Files

| File | Does |
|---|---|
| `scripts/setup.sh` | `check`, `install`, `new NNN-topic`, `demo` |
| `scripts/ytsearch.py` | YouTube search results with views, age and length (no API key); THUMBS= saves thumbnails |
| `scripts/script2tts.py` | script.md to voice/voice-tts.json, with words, length and credits |
| `scripts/tts.py` | ElevenLabs voice by API, one file per part (key from the environment only) |
| `scripts/split-voice.py` | one long recording cut into the script's parts |
| `scripts/transcribe.py`, `align.py`, `timeline.py` | word timings (Whisper), on the script's words, into timeline.json |
| `scripts/est-timeline.py` | an estimated timeline from the script, to edit before the voice exists |
| `scripts/prompts.py`, `slice.py`, `chatgpt-helpers.js` | image prompts from art.md; sheets cut into SVG drawings; ChatGPT helpers |
| `scripts/checkcues.py`, `sheet.sh` | cue check; contact sheets of stills |
| `scripts/voiceband.py`, `mix.py`, `gap.py` | music check; the -14 LUFS ducked mix; voice-to-music gap |
| `scripts/srt.py`, `flicker.py`, `finish.sh` | captions; one-frame flash check; final files |
| `templates/remotion/` | the kit: `kit.tsx` primitives, `scenes.tsx` scene kinds, `Video.tsx`, `beats.ts` (demo), `Thumb.tsx`, `theme.json`, render/stills/thumbs scripts |
| `templates/project/` | per-video files: script.md (demo), brief.md, art.md, project.json, numbers.txt, upload.md |
| `assets/starter-art/` | 14 drawings for the demo only; make new ones for real videos |
| `references/` | research, script, art, beats, sound, channel profile and palettes, lessons |

Read `references/lessons.md` before the first render: every mistake already made with this pipeline, so it is not repeated.
