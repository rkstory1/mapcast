// One entry per visual beat, in order. Every beat starts on a spoken word: b(part, 'first words of the beat', kind, props).
// A beat lasts until the next one starts, so plan a new beat every 3 to 6 seconds. Kinds and their props:
// references/beats.md. This file is the worked demo (a 2-minute video on the Pomodoro Technique); replace it per video.
export type Beat = { p: number; c: string; k: string; [x: string]: any };
const b = (p: number, c: string, k: string, o: any = {}): Beat => ({ p, c, k, ...o });

// the video's sections, the same list every time the progress map comes back
const SECTIONS = ['Focus', 'Break', 'Repeat'];

export const BEATS: Beat[] = [
  // 01 hook: the story is named in the first seconds
  b(1, 'in the late', 'big', { bg: 'sun', big: 'Rome', sub: 'late 1980s', subC: 'a university student', art: 'book-open' }),
  b(1, 'could not finish', 'c', { bg: 'hot', lay: 'R', arts: ['guy-think'], tall: ['guy-think'], slam: 'Could not finish one chapter' }),
  b(1, 'so he grabbed', 'c', { bg: 'cool', lay: 'L', arts: ['stopwatch'], slam: 'A kitchen timer', tags: [{ t: 'and a deal', c: 'made himself a' }] }),
  // 02 the payoff and the name
  b(2, 'work for just', 'c', { bg: 'ink', lay: 'C', slam: 'Work a few minutes. Nothing else.', arts: ['alarm-clock'] }),
  b(2, 'today his trick', 'm', { node: 'The Pomodoro Technique', lay: 'L', arts: ['trophy'], slam: 'A world famous focus method' }),
  // 03 the map of the video
  b(3, 'here is the', 'tour', { nodes: SECTIONS, focus: 0, art: 'checklist', tag: '3 steps' }),
  b(3, 'focus take a', 'board', { cols: [{ name: 'FOCUS', art: 'brain', c: 'focus' }, { name: 'BREAK', art: 'coffee-mug', c: 'take a short' }, { name: 'REPEAT', art: 'alarm-clock', c: 'and repeat' }] }),
  // 04 step one
  b(4, 'step one', 'section', { n: 1, title: 'Focus', label: 'STEP' }),
  b(4, 'pick one task', 'big', { bg: 'sun', big: '25', sub: 'minutes, one task', subC: 'twenty five minutes', art: 'stopwatch' }),
  b(4, 'no email no', 'c', { bg: 'hot', lay: '2', arts: ['phone-buzz', 'book-open'], tags: [{ t: 'No phone' }, { t: 'One thing', c: 'just one thing' }] }),
  // 05 step two (the progress map comes back: step one gets its check)
  b(5, 'step two', 'tour', { nodes: SECTIONS, focus: 1, art: 'coffee-mug', tag: '5 minute break' }),
  b(5, 'stand up get', 'rows', { bg: 'cool', title: 'A real break', rows: [{ t: 'Stand up', c: 'stand up' }, { t: 'Get some water', c: 'get some water' }, { t: 'Look out the window', c: 'look out the' }] }),
  // 06 step three
  b(6, 'step three', 'tour', { nodes: SECTIONS, focus: 2, art: 'alarm-clock', tag: '4 rounds' }),
  b(6, 'after four rounds', 'c', { bg: 'sun', lay: 'L', arts: ['gift'], slam: 'Then a long break', tags: [{ t: '15 to 30 minutes', c: 'of fifteen' }] }),
  // 07 why it works
  b(7, 'it works because', 'cmp', { bg: 'sun', l: { t: 'One huge job', art: 'checklist', bad: true }, r: { t: 'One small round', art: 'stopwatch', c: 'into one small' } }),
  b(7, 'and a break', 'c', { bg: 'sun', lay: 'L', arts: ['coffee-mug'], slam: 'A break you can see coming' }),
  // 08 the step for tonight, comment prompt, end screen
  b(8, 'so pick one', 'card', { head: 'TONIGHT', rows: [['Task', 'Pick one task', 'so pick one'], ['Timer', 'Twenty five minutes', 'set twenty five'], ['Go', 'Start the first round', 'and start']] }),
  b(8, 'tell us in', 'c', { bg: 'hot', lay: 'R', arts: ['guy-wave'], tall: ['guy-wave'], slam: 'Which task will you try it on' }),
  b(8, 'subscribe', 'end'),
];
