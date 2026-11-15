#!/bin/bash
# mapcast setup.
#   setup.sh check            what is installed and what is missing (changes nothing)
#   setup.sh install          installs what is missing: Node, ffmpeg, Python packages, Remotion and its browser
#   setup.sh new 001-my-topic  a new video folder in the workspace, ready to work in
#   setup.sh demo             a demo video folder, rendered as stills on an estimated timeline (proves the install works)
#   setup.sh showcase         the 30 s showcase (motion.tsx: map camera, flip, whip, iris) as a project, with a contact sheet
# Shared installs live in ~/.mapcast (Python venv and Remotion node_modules, installed once for every video).
# Video folders live in $MAPCAST_HOME (default ~/mapcast-videos).
set -e
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
HOME_DIR="${MAPCAST_HOME:-$HOME/mapcast-videos}"
SHARED="${MAPCAST_SHARED:-$HOME/.mapcast}"
VENV="$SHARED/venv"; KIT="$SHARED/kit"
ok() { printf "  \033[32mOK\033[0m       %s\n" "$1"; }
no() { printf "  \033[31mMISSING\033[0m  %s\n" "$1"; MISSING=1; }
have() { command -v "$1" >/dev/null 2>&1; }
OS="$(uname -s)"

check() {
  MISSING=0
  echo "mapcast check ($OS)"
  if have node && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ]; then ok "node $(node -v)"; else no "node 20 or newer"; fi
  have npm && ok "npm $(npm -v)" || no "npm"
  have ffmpeg && ok "ffmpeg" || no "ffmpeg"
  have ffprobe && ok "ffprobe" || no "ffprobe (comes with ffmpeg)"
  PY=$(pybin); [ -n "$PY" ] && ok "python $($PY -V 2>&1 | cut -d' ' -f2)" || no "python 3.9 to 3.12"
  if [ -x "$VENV/bin/python" ] && "$VENV/bin/python" -c "import numpy, PIL, scipy, vtracer, faster_whisper" 2>/dev/null; then ok "python packages (numpy, pillow, scipy, vtracer, faster-whisper)"; else no "python packages in $VENV"; fi
  [ -d "$KIT/node_modules/remotion" ] && ok "remotion $(node -p "require('$KIT/node_modules/remotion/package.json').version")" || no "remotion in $KIT"
  echo "  workspace: $HOME_DIR"
  [ -f "$HOME_DIR/channel.json" ] && ok "channel profile ($HOME_DIR/channel.json)" || echo "  (no channel profile yet: the skill asks for it on the first video)"
  [ "$MISSING" = 0 ] && echo "Everything is ready." || echo "Run: setup.sh install"
}

pybin() {   # a Python the packages have wheels for (3.9 to 3.12 preferred)
  for p in python3.12 python3.11 python3.10 python3.13 python3; do
    if have $p && $p -c 'import sys; exit(0 if (3,9) <= sys.version_info[:2] <= (3,13) else 1)' 2>/dev/null; then echo $p; return; fi
  done
}

install() {
  mkdir -p "$SHARED"
  if [ "$OS" = Darwin ]; then
    if ! have brew; then
      echo "Homebrew is needed to install Node, ffmpeg and Python on a Mac. It asks for your Mac password, so run it yourself:"
      echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
      echo "then run setup.sh install again."; exit 1
    fi
    have node && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] || brew install node
    have ffmpeg || brew install ffmpeg
    [ -n "$(pybin)" ] || brew install python@3.12
  else
    NEED=""
    have node && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] || NEED="$NEED nodejs npm"
    have ffmpeg || NEED="$NEED ffmpeg"
    [ -n "$(pybin)" ] || NEED="$NEED python3 python3-venv"
    if [ -n "$NEED" ]; then
      echo "Install these with your package manager (needs your password), then run setup.sh install again:"
      echo "  sudo apt-get update && sudo apt-get install -y$NEED   (Node must be 20 or newer: https://nodejs.org)"; exit 1
    fi
  fi
  PY=$(pybin)
  if ! [ -x "$VENV/bin/python" ]; then echo "creating the Python environment in $VENV"; $PY -m venv "$VENV"; fi
  "$VENV/bin/python" -m pip install -q --upgrade pip
  "$VENV/bin/python" -m pip install -q numpy pillow scipy vtracer faster-whisper
  mkdir -p "$KIT"; cp "$SKILL/templates/remotion/package.json" "$KIT/package.json"
  echo "installing Remotion (a few minutes the first time)"
  (cd "$KIT" && npm install --no-fund --no-audit --loglevel=error)
  (cd "$KIT" && npx --yes remotion browser ensure >/dev/null 2>&1 || true)
  check
}

new() {
  NAME="$1"; [ -n "$NAME" ] || { echo "usage: setup.sh new 001-short-topic"; exit 1; }
  D="$HOME_DIR/$NAME"; [ -e "$D" ] && { echo "$D already exists"; exit 1; }
  [ -d "$KIT/node_modules/remotion" ] || { echo "Remotion is not installed yet: run setup.sh install"; exit 1; }
  mkdir -p "$D"/{voice/raw,music,art-src,out}
  cp -R "$SKILL/templates/project/." "$D/"
  cp "$SKILL"/scripts/*.py "$SKILL"/scripts/finish.sh "$SKILL"/scripts/sheet.sh "$D/"
  cp -R "$SKILL/templates/remotion" "$D/remotion"; rm -f "$D/remotion/package-lock.json"
  ln -s "$KIT/node_modules" "$D/remotion/node_modules"
  mkdir -p "$D/remotion/public/art"
  printf '#!/bin/sh\nexec "%s" "$@"\n' "$VENV/bin/python" > "$D/py"; chmod +x "$D/py" "$D"/*.sh
  "$VENV/bin/python" - "$D" "$NAME" "$HOME_DIR/channel.json" <<'PY'
import json, sys, os
d, name, ch = sys.argv[1:4]
p = json.load(open(f'{d}/project.json')); p['slug'] = name; json.dump(p, open(f'{d}/project.json', 'w'), indent=1)
if os.path.exists(ch):
    c = json.load(open(ch)); th = json.load(open(f'{d}/remotion/src/theme.json'))
    for k in ('channel', 'tagline', 'watermark', 'preset', 'font'):
        if k in c.get('theme', {}): th[k] = c['theme'][k]
    if 'c' in c.get('theme', {}): th['c'].update(c['theme']['c'])
    json.dump(th, open(f'{d}/remotion/src/theme.json', 'w'), indent=1)
    if c.get('voice'): p['voice'].update(c['voice']); json.dump(p, open(f'{d}/project.json', 'w'), indent=1)
    if c.get('character'): p['character'] = c['character']; json.dump(p, open(f'{d}/project.json', 'w'), indent=1)
PY
  echo "$D"
}

demo() {
  D=$(new "${1:-000-demo}" | tail -1)
  cp "$SKILL"/assets/starter-art/*.svg "$D/remotion/public/art/"
  cd "$D"
  ./py script2tts.py && ./py est-timeline.py && ./py checkcues.py
  cd remotion && node stills.mjs Video 0.5 out/demo 1 4 8 12 16 20 24 28 32 36 40 44 48 52 56 60 64 68 >/dev/null
  cd .. && bash sheet.sh remotion/out/demo
  echo "demo ready: $D (contact sheet in remotion/out/demo/sheet-01.jpg)"
}

showcase() {
  D=$(new "${1:-000-showcase}" | tail -1); E="$SKILL/examples/showcase"
  cp "$SKILL"/assets/starter-art/*.svg "$D/remotion/public/art/"
  cp "$E/Showcase.tsx" "$E/Root.tsx" "$E/timeline.json" "$D/remotion/src/"
  cp "$E/script.md" "$E/brief.md" "$E/project.json" "$D/"; mkdir -p "$D/sfx"
  "$VENV/bin/python" - "$D" <<'PY'
import json, sys
d = sys.argv[1]; p = json.load(open(f'{d}/project.json')); p['slug'] = d.rstrip('/').split('/')[-1]; json.dump(p, open(f'{d}/project.json', 'w'), indent=1)
PY
  cd "$D/remotion" && node stills.mjs Video 0.5 out/showcase 0.5 2 3.5 4.4 6 7.5 9.5 12 14.5 16.4 17.5 19.1 20 21.5 23 24.6 25.9 28 >/dev/null
  cd .. && bash sheet.sh remotion/out/showcase
  echo "showcase ready: $D (contact sheet in remotion/out/showcase/sheet-01.jpg; to finish it: $E/README.md)"
}

case "$1" in
  check) check ;; install) install ;; new) new "$2" ;; demo) demo "$2" ;; showcase) showcase "$2" ;;
  *) echo "usage: setup.sh check | install | new 001-topic | demo | showcase"; exit 1 ;;
esac
