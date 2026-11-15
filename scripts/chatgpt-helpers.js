// Paste once per ChatGPT page with javascript_tool (Claude in Chrome), in the image chat for this video (one chat per video, so the style carries over).
// Every call must finish in under 45 s (the CDP limit), so waits run in 35 s steps; call mcStep() again until it saves.
// Images are tracked by src, not by count: ChatGPT drops old images from the page as the chat grows.
window.mcImgs = () => [...document.querySelectorAll('img')].filter(i => i.naturalWidth > 1000);
window.mcSave = async (src, name) => { const b = await (await fetch(src)).blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove(); return b.size; };
window.mcSend = async (text) => { const el = document.querySelector('div.ProseMirror[contenteditable="true"]'); el.focus(); document.execCommand('selectAll', false, null); document.execCommand('insertText', false, text); await new Promise(r => setTimeout(r, 800)); const b = [...document.querySelectorAll('button')].find(b => /send/i.test((b.getAttribute('aria-label') || '') + (b.dataset.testid || ''))); if (!b) return 'no send button'; b.click(); return 'sent'; };
window.mcSeen = window.mcSeen || new Set(mcImgs().map(i => i.src));   // images already in the chat are old
window.mcNew = () => mcImgs().filter(i => !mcSeen.has(i.src));
// mcQueue = [[prompt, 'A.png'], ...]; set window.mcNextSave to the file name of the sheet now drawing.
window.mcStep = async () => { const t0 = Date.now(); let prev = '', same = 0;
  while ((Date.now() - t0) / 1000 < 36) { const nw = mcNew(); const stop = !!document.querySelector('[data-testid="stop-button"]'); const last = nw[nw.length - 1];
    if (last && !stop) { if (last.src === prev) { same++; if (same >= 3) break; } else { prev = last.src; same = 0; } } await new Promise(r => setTimeout(r, 2500)); }
  if (same < 3) return { waiting: true, nNew: mcNew().length };
  const save = window.mcNextSave; const sz = await mcSave(prev, save); mcNew().forEach(i => mcSeen.add(i.src));
  const nx = (window.mcQueue || []).shift(); let sent = 'none'; if (nx) { window.mcNextSave = nx[1]; sent = await mcSend(nx[0]); }
  return { saved: save, sz, sent, next: window.mcNextSave, left: (window.mcQueue || []).length }; };
'mapcast helpers ready';
