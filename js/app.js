/* MIND+ — big ideas from great books, five minutes a day.
   Vanilla JS, no build step, no dependencies.
   Library:  content/*.js push book objects onto window.MIND_BOOKS.
   Progress: kept on this device only, in localStorage under KEY. */
(function () {
'use strict';

const VERSION = '1.0.0';
const KEY = 'mindplus.v1';

/* ───────── library config ───────── */
const SHELVES = [
  ['power', 'Power & Strategy'], ['stoic', 'Stoic Mind'], ['mind', 'Psychology & Decisions'],
  ['habits', 'Habits & Focus'], ['talk', 'Communication'], ['money', 'Money & Markets'],
  ['build', 'Build a Business'], ['drive', 'Drive']
];
const TOPICS = ['Strategy', 'Power', 'Psychology', 'Decision-making', 'Stoicism', 'Philosophy', 'Habits', 'Productivity',
  'Time management', 'Communication', 'Negotiation', 'Investing', 'Trading', 'Economics', 'Business', 'Startups',
  'Problem solving', 'Motivation', 'Personal development', 'Leadership'];
const START_TOPICS = ['Psychology', 'Business', 'Personal development', 'Habits', 'Communication', 'Economics',
  'Time management', 'Motivation', 'Strategy', 'Problem solving'];
const STEPS = [1, 3, 7, 16, 35, 90];   // recall spacing in days, by box

/* cover palettes: [background, ink, accent] */
const PAL = {
  noir: ['#16130d', '#efe6d0', '#d4a72c'], blood: ['#8a1e1b', '#f8e9cb', '#efb54a'], navy: ['#1e2b45', '#ece2cb', '#d19a4c'],
  slate: ['#2a3040', '#e8ebf2', '#7fb7ff'], stone: ['#e7e0d0', '#28231b', '#9a7440'], clay: ['#b2512d', '#fdf0dc', '#f7d08d'],
  olive: ['#565d33', '#f4ecd4', '#e0c979'], ink: ['#0f1a2b', '#e6edf7', '#5fd0b0'], cream: ['#f1e7d2', '#2b2118', '#c4472e'],
  plum: ['#4b2547', '#f6e7f0', '#e79cc3'], forest: ['#1d4838', '#eef1dd', '#a5d8ab'], ice: ['#dbe7ed', '#152630', '#2b7c8e'],
  sky: ['#2c5c8c', '#eef5fb', '#ffd166'], mustard: ['#dba82f', '#1e1706', '#7d2f12'], teal: ['#0e5358', '#e6f4f1', '#f4bc86'],
  paper: ['#efe9dc', '#1f2a2e', '#d2542d'], violet: ['#3a2a6c', '#efeaff', '#b9a0ff'], rust: ['#7b3b1e', '#fbead7', '#f2a660'],
  rose: ['#b13b49', '#fff1e6', '#ffc2b8'], carbon: ['#1b1e24', '#f2f2ee', '#ff6a55'], orange: ['#e5733a', '#fff6ea', '#40200c'],
  sepia: ['#3b2c1d', '#f1e3c8', '#dba843']
};

/* cover art: small generative motifs drawn in a 100×100 box */
const ART = {
  rings: () => [38, 29, 20].map((r, i) => `<circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--ca)" stroke-width="2.4" opacity="${0.35 + i * 0.25}"/>`).join('') + '<circle cx="50" cy="50" r="9" fill="var(--ca)"/>',
  rays: () => { let s = ''; for (let i = 0; i < 9; i++) { const a = Math.PI * (0.12 + 0.76 * i / 8), len = i % 2 ? 56 : 74; s += `<path d="M50 88L${(50 - Math.cos(a) * len * 0.62).toFixed(1)} ${(88 - Math.sin(a) * len).toFixed(1)}" stroke="var(--ca)" stroke-width="2.6" stroke-linecap="round" opacity="${i % 2 ? 0.55 : 1}"/>`; } return s + '<circle cx="50" cy="88" r="6" fill="var(--ca)"/>'; },
  columns: () => [20, 35, 50, 65, 80].map(x => `<rect x="${x - 4.5}" y="34" width="9" height="46" rx="2" fill="var(--ca)" opacity=".85"/>`).join('') + '<path d="M10 30 50 10l40 20z" fill="var(--ca)"/><rect x="10" y="82" width="80" height="6" rx="1.5" fill="var(--ca)"/>',
  steps: () => [0, 1, 2, 3, 4].map(i => `<rect x="${12 + i * 16}" y="${74 - i * 14}" width="12" height="${16 + i * 14}" rx="2.5" fill="var(--ca)" opacity="${0.4 + i * 0.15}"/>`).join(''),
  grid: () => { let s = ''; for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { const hot = r === 1 && c === 3; s += `<circle cx="${14 + c * 18}" cy="${14 + r * 18}" r="${hot ? 7 : 3.4}" fill="${hot ? 'var(--ca)' : 'var(--ci)'}" opacity="${hot ? 1 : 0.4}"/>`; } return s; },
  wave: () => [0, 1, 2, 3].map(i => { const y = 26 + i * 16; return `<path d="M6 ${y}C22 ${y - 18} 34 ${y + 18} 50 ${y}S78 ${y - 18} 94 ${y}" fill="none" stroke="var(--ca)" stroke-width="2.8" stroke-linecap="round" opacity="${1 - i * 0.22}"/>`; }).join(''),
  split: () => '<circle cx="38" cy="50" r="28" fill="var(--ca)" opacity=".92"/><circle cx="62" cy="50" r="28" fill="none" stroke="var(--ci)" stroke-width="2.6"/>',
  peak: () => '<path d="M6 86 38 30l18 30 10-14 28 40z" fill="var(--ca)"/><circle cx="74" cy="22" r="8" fill="none" stroke="var(--ca)" stroke-width="2.6"/>',
  orbit: () => [0, 60, 120].map(d => `<ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="var(--ca)" stroke-width="2.2" transform="rotate(${d} 50 50)" opacity=".8"/>`).join('') + '<circle cx="50" cy="50" r="6.5" fill="var(--ca)"/>',
  chart: () => '<path d="M8 78 24 60l12 10 16-30 12 14 20-34" fill="none" stroke="var(--ca)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="92" cy="20" r="5.5" fill="var(--ca)"/><path d="M8 90h84" stroke="var(--ci)" stroke-width="1.6" opacity=".4"/>',
  arch: () => [0, 1, 2].map(i => { const r = 34 - i * 11; return `<path d="M${50 - r} 90V52a${r} ${r} 0 0 1 ${r * 2} 0V90" fill="none" stroke="var(--ca)" stroke-width="2.8" opacity="${1 - i * 0.25}"/>`; }).join(''),
  diamond: () => [40, 28, 16].map((r, i) => `<path d="M50 ${50 - r} ${50 + r} 50 50 ${50 + r} ${50 - r} 50z" fill="${i === 2 ? 'var(--ca)' : 'none'}" stroke="var(--ca)" stroke-width="2.6" opacity="${0.5 + i * 0.25}"/>`).join(''),
  glass: () => '<path d="M22 10h56L50 50zM22 90h56L50 50z" fill="none" stroke="var(--ca)" stroke-width="2.8" stroke-linejoin="round"/><path d="M34 82h32L50 62z" fill="var(--ca)"/><path d="M40 22h20L50 36z" fill="var(--ca)" opacity=".6"/>',
  star: () => { let s = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 26 : 42; s += `<path d="M50 50L${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}" stroke="var(--ca)" stroke-width="3" stroke-linecap="round"/>`; } return s + '<circle cx="50" cy="50" r="5.5" fill="var(--cb)" stroke="var(--ca)" stroke-width="2.4"/>'; }
};

/* ───────── helpers ───────── */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hash = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0).toString(36); };
const pad = n => String(n).padStart(2, '0');
const dkey = d => { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const toDate = k => { const p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
const addDays = (k, n) => { const d = toDate(k); d.setDate(d.getDate() + n); return dkey(d); };
const dayDiff = (a, b) => Math.round((toDate(b) - toDate(a)) / 864e5);
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
const clip = (s, n) => s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  today: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3 7 7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7"/>'),
  lib: svg('<rect x="3.5" y="4" width="4.5" height="16" rx="1"/><rect x="9.75" y="4" width="4.5" height="16" rx="1"/><path d="m16.6 6.3 3.3-.9 2.6 13.4-3.3.9z"/>'),
  stash: svg('<path d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-4.2L5.5 21V4.5a1 1 0 0 1 1-1z"/>'),
  you: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  left: svg('<path d="m15 5-7 7 7 7"/>'),
  right: svg('<path d="m9 5 7 7-7 7"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  note: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
  share: svg('<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7"/>'),
  search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
  flame: svg('<path d="M12 3c.6 3-1.2 4.6-2.6 6.4C8.1 11 7 12.6 7 14.6a5 5 0 0 0 10 0c0-1.9-.9-3.4-1.9-4.8-.4 1.2-1.1 1.9-2 2.2.5-2.8.3-6.3-1.1-9z"/>'),
  loop: svg('<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5"/><path d="M4 20v-4.5h4.5"/>'),
  shuffle: svg('<path d="M3 7h3.5c2.5 0 3.8 1.4 5 3.2l1 1.6c1.2 1.8 2.5 3.2 5 3.2H21"/><path d="m18 12.5 3 2.5-3 2.5"/><path d="M3 17h3.5c1.5 0 2.6-.5 3.5-1.3"/><path d="M21 7h-3.5c-1.5 0-2.6.5-3.5 1.3"/><path d="m18 4.5 3 2.5-3 2.5"/>')
};

/* ───────── data ───────── */
const order = SHELVES.map(s => s[0]);
const BOOKS = (window.MIND_BOOKS || []).slice().sort((a, b) => order.indexOf(a.shelf) - order.indexOf(b.shelf));
const BOOK = {}, IDEA = {}, ALL = [];
BOOKS.forEach(b => {
  BOOK[b.id] = b;
  b.ideas.forEach((it, i) => { it.id = b.id + ':' + hash(it.t); it.n = i; it.book = b; IDEA[it.id] = it; ALL.push(it); });
});

const UA = navigator.userAgent || '';
const IOS = /iphone|ipad|ipod/i.test(UA);
const MOBILE = IOS || /android/i.test(UA);
const STANDALONE = navigator.standalone === true || !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches);

/* ───────── state ───────── */
const blank = () => ({ v: 1, on: false, topics: [], shelf: [], cur: null, read: {}, stash: {}, days: {}, goal: 5, best: 0, tipOff: false });
let S = (() => {
  try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && o.v === 1) return Object.assign(blank(), o); } catch (e) { /* fall through */ }
  return blank();
})();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ } };

let tab = 'today', q = '', fshelf = 'all', sheetBook = null, R = null, Q = null, pendingReload = false, toastT = 0, raf = 0;
const ob = { step: 0, topics: new Set(START_TOPICS), picks: null };

const prog = b => b.ideas.reduce((n, it) => n + (S.read[it.id] ? 1 : 0), 0);
const finished = b => prog(b) >= b.ideas.length;
const todayStat = () => S.days[dkey()] || { r: 0, v: 0 };
const active = k => { const d = S.days[k]; return !!d && d.r + d.v > 0; };
function streak() { let k = dkey(), n = 0; if (!active(k)) k = addDays(k, -1); while (active(k)) { n++; k = addDays(k, -1); } return n; }
function bump(kind) { const k = dkey(), d = S.days[k] || (S.days[k] = { r: 0, v: 0 }); d[kind]++; const s = streak(); if (s > (S.best || 0)) S.best = s; }
function markRead(it) { if (S.read[it.id]) return false; S.read[it.id] = 1; bump('r'); return true; }
const stashIds = () => Object.keys(S.stash).filter(id => IDEA[id]).sort((a, b) => S.stash[b].ts - S.stash[a].ts);
function dueList() { const t = dkey(); return Object.keys(S.stash).filter(id => IDEA[id] && S.stash[id].due <= t).sort((a, b) => (S.stash[a].due < S.stash[b].due ? -1 : 1)); }
const newStash = () => ({ ts: Date.now(), box: 0, due: addDays(dkey(), 1), note: '' });

/* next unread ideas from the shelf, current book first */
function nextUnread(n) {
  const ids = S.shelf.slice();
  if (S.cur && ids.includes(S.cur)) { ids.splice(ids.indexOf(S.cur), 1); ids.unshift(S.cur); }
  const out = [];
  for (const id of ids) {
    const b = BOOK[id]; if (!b) continue;
    for (const it of b.ideas) { if (!S.read[it.id]) { out.push(it); if (out.length >= n) return out; } }
  }
  return out;
}
function recs(n, skipShelf, topics) {
  topics = topics || S.topics;
  return BOOKS.filter(b => !skipShelf || !S.shelf.includes(b.id))
    .map((b, i) => ({ b, i, s: (b.tags || []).reduce((x, t) => x + (topics.includes(t) ? 2 : 0), 0) + (b.star ? 4 : 0) }))
    .sort((x, y) => y.s - x.s || x.i - y.i).slice(0, n).map(x => x.b);
}
function iotd() { return ALL[parseInt(hash(dkey()), 36) % ALL.length]; }

/* ───────── shared bits of UI ───────── */
function cover(b, cls) {
  const p = PAL[b.pal] || PAL.noir, t = b.title;
  const mw = Math.max.apply(null, t.split(/\s+/).map(w => w.length));
  const base = t.length <= 12 ? 15 : t.length <= 20 ? 13 : t.length <= 32 ? 11.2 : 9.6;
  const fs = Math.min(base, 80 / (mw * 0.6)).toFixed(1);
  return `<div class="cover ${cls || ''}" style="--cb:${p[0]};--ci:${p[1]};--ca:${p[2]}"><svg viewBox="0 0 100 100" aria-hidden="true">${(ART[b.art] || ART.rings)()}</svg><div class="ct" style="font-size:${fs}cqw">${esc(t)}</div><div class="cau">${esc(b.author)}</div></div>`;
}
function tile(b) {
  const pr = prog(b), n = b.ideas.length;
  return `<button class="bk" data-a="book" data-id="${b.id}">${cover(b)}<div class="bk-t">${esc(b.title)}</div><div class="bk-m">${pr >= n ? 'Finished' : pr ? pr + ' of ' + n + ' read' : n + ' ideas'}</div>${pr && pr < n ? `<div class="pbar"><i style="width:${Math.round(pr / n * 100)}%"></i></div>` : ''}</button>`;
}
function ring(done, goal, big) {
  const p = Math.min(1, done / goal), c = 2 * Math.PI * 18;
  return `<div class="ring${big ? ' big' : ''}" role="img" aria-label="${done} of ${goal} today"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" class="tr"/><circle cx="22" cy="22" r="18" class="fg" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - p)).toFixed(1)}" transform="rotate(-90 22 22)"/></svg><span>${p >= 1 ? I.check : done + '/' + goal}</span></div>`;
}
const stMark = it => S.stash[it.id] ? `<span class="st sv">${I.stash}</span>` : S.read[it.id] ? `<span class="st ok">${I.check}</span>` : '';
function ideaBody(it) {
  const e = S.stash[it.id];
  return it.b.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('') +
    (it.q ? `<blockquote><p>“${esc(it.q)}”</p>${it.by ? `<cite>${esc(it.by)}</cite>` : ''}</blockquote>` : '') +
    (it.a ? `<div class="try"><span>Try it</span>${esc(it.a)}</div>` : '') +
    (e && e.note ? `<div class="mynote"><span>Your note</span>${esc(e.note)}</div>` : '');
}
function cardHTML(it, mode) {
  const eye = mode === 'book' ? `Idea ${it.n + 1} of ${it.book.ideas.length}` : esc(it.book.title);
  return `<div class="rc-in"><div class="rc-eye"><i></i>${eye}</div><h2>${esc(it.t)}</h2>${ideaBody(it)}</div>`;
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2300); }
function modal(html, top) { const m = $('#modal'); m.className = top ? 'top' : ''; m.innerHTML = `<div class="md" role="dialog" aria-modal="true">${html}</div>`; m.hidden = false; }
function closeModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; }
function show(sel) { const el = $(sel); el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); document.body.classList.add('lock'); }
function hide(sel) { $(sel).hidden = true; document.body.classList.toggle('lock', !$('#sheet').hidden || !$('#reader').hidden); }

/* ───────── onboarding ───────── */
function vOnb() {
  if (ob.step === 0) {
    const f = ['meditations', '48-laws', 'atomic-habits'].map(id => BOOK[id]).filter(Boolean);
    const fan = f.length === 3 ? `<div class="fan">${cover(f[0], 'f1')}${cover(f[2], 'f3')}${cover(f[1], 'f2')}</div>` : '';
    return `<div class="onb-wrap"><div class="brand">MIND<b>+</b></div>${fan}
      <h1>Big ideas.<br>Five minutes a day.</h1>
      <p class="sub">The best thinking from ${BOOKS.length} great books, cut into cards you can read in a queue.</p>
      <ul class="points">
        <li>${I.check}<span><b>Read</b> a handful of ideas a day, one swipe at a time.</span></li>
        <li>${I.check}<span><b>Stash</b> the ones worth keeping and add your own take.</span></li>
        <li>${I.check}<span><b>Recall</b> them on a schedule, right before you’d forget.</span></li>
      </ul>
      <div class="onb-foot"><button class="btn primary big" data-a="onb-next">Get started</button></div></div>`;
  }
  if (ob.step === 1) {
    const n = ob.topics.size;
    return `<div class="onb-wrap"><div class="dots"><i class="on"></i><i></i></div>
      <h1>What do you want to get sharper at?</h1>
      <p class="sub">Pick at least three. It decides what gets put in front of you.</p>
      <div class="chips">${TOPICS.map(t => `<button class="chip${ob.topics.has(t) ? ' on' : ''}" data-a="topic" data-t="${esc(t)}" aria-pressed="${ob.topics.has(t)}">${esc(t)}</button>`).join('')}</div>
      <div class="onb-foot"><button class="btn primary big" data-a="onb-next"${n < 3 ? ' disabled' : ''}>${n < 3 ? 'Pick ' + (3 - n) + ' more' : 'Continue'}</button></div></div>`;
  }
  const list = recs(12, false, Array.from(ob.topics));
  if (!ob.picks) ob.picks = new Set(list.slice(0, 3).map(b => b.id));
  return `<div class="onb-wrap"><div class="dots"><i class="on"></i><i class="on"></i></div>
    <h1>Start your shelf</h1>
    <p class="sub">Picked for your topics. Add what you want to read first. You can change it any time.</p>
    <div class="picks">${list.map(b => { const on = ob.picks.has(b.id); return `<button class="pick${on ? ' on' : ''}" data-a="pick" data-id="${b.id}" aria-pressed="${on}">${cover(b)}<span class="tx"><b>${esc(b.title)}</b><span>${esc(b.author)} · ${b.ideas.length} ideas</span></span><span class="tog">${on ? I.check : I.plus}</span></button>`; }).join('')}</div>
    <div class="onb-foot"><button class="btn primary big" data-a="onb-done"${ob.picks.size ? '' : ' disabled'}>${ob.picks.size ? 'Start with ' + plural(ob.picks.size, 'book') : 'Pick at least one'}</button></div></div>`;
}

/* ───────── today ───────── */
function vToday() {
  const now = new Date(), d = todayStat(), done = d.r + d.v, goal = S.goal, st = streak(), due = dueList().length;
  const next = nextUnread(goal), cur = next.length ? next[0].book : null, hr = now.getHours();
  const greet = hr < 5 ? 'Still up?' : hr < 12 ? 'Good morning.' : hr < 18 ? 'Good afternoon.' : 'Good evening.';
  const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  let hero;
  if (cur) {
    const pr = prog(cur), label = done >= goal ? 'Keep going' : next.length < goal - done ? 'Read the last ' + next.length : done ? `Continue · ${goal - done} to go` : `Read today’s ${goal}`;
    hero = `<div class="hero">${cover(cur)}<div class="hero-b"><div class="label">${pr ? 'Continue' : 'Up next'}</div><div class="hero-t">${esc(cur.title)}</div><div class="hero-m">Idea ${pr + 1} of ${cur.ideas.length} · ${esc(cur.author)}</div><button class="btn primary" data-a="session">${label}${I.right}</button></div></div>`;
  } else {
    hero = `<div class="hero empty"><div class="hero-b"><div class="label">${S.shelf.length ? 'Shelf finished' : 'Shelf empty'}</div><div class="hero-t">${S.shelf.length ? 'You’ve read everything on your shelf.' : 'Pick your first book.'}</div><div class="hero-m">Add a book and your daily ideas start here.</div><button class="btn primary" data-a="tab" data-tab="library">Browse the library${I.right}</button></div></div>`;
  }
  const tip = !STANDALONE && MOBILE && !S.tipOff ? `<div class="note-card"><div><b>Put MIND+ on your home screen</b><span>${IOS ? 'In Safari, tap Share, then “Add to Home Screen”.' : 'Open the browser menu, then “Add to Home screen”.'} It opens full-screen and works offline.</span></div><button class="iconbtn sm" data-a="tip-off" aria-label="Dismiss">${I.x}</button></div>` : '';
  const recall = due ? `<button class="strip" data-a="recall"><span class="ic">${I.loop}</span><span class="tx"><b>${plural(due, 'idea')} ready for recall</b><span>Two minutes. Say it, then check it.</span></span><span class="go">Start</span></button>` : '';
  const io = iotd();
  const shelf = S.shelf.map(id => BOOK[id]).filter(Boolean).sort((a, b) => finished(a) - finished(b));
  const picks = recs(8, true);
  return `<header class="top"><div><div class="kicker">${esc(dateStr)}</div><h1 class="title">${greet}</h1></div>
      <div class="top-r"><button class="pill${st ? '' : ' cold'}" data-a="tab" data-tab="you" aria-label="${st} day streak">${I.flame}${st}</button>${ring(done, goal)}</div></header>
    ${tip}${hero}${recall}
    <section class="sec"><div class="sec-h"><h2 class="label">Idea of the day</h2></div>
      <button class="iotd" data-a="iotd"><div class="rc-eye"><i></i>${esc(io.book.title)}</div><h3>${esc(io.t)}</h3><span class="src">${esc(io.book.author)} · tap to read</span></button></section>
    <section class="sec"><div class="sec-h"><h2 class="label">Your shelf</h2><button class="link" data-a="tab" data-tab="library">Add books</button></div>
      ${shelf.length ? `<div class="hs">${shelf.map(tile).join('')}</div>` : '<p class="empty">Nothing here yet. Add a book from the library.</p>'}</section>
    ${picks.length ? `<section class="sec"><div class="sec-h"><h2 class="label">Picked for you</h2></div><div class="hs">${picks.map(tile).join('')}</div></section>` : ''}`;
}

/* ───────── library ───────── */
function libBody() {
  const s = q.trim().toLowerCase();
  if (s.length >= 2) {
    const bs = BOOKS.filter(b => (b.title + ' ' + b.author).toLowerCase().includes(s));
    const is = ALL.filter(it => (it.t + ' ' + it.b).toLowerCase().includes(s)).slice(0, 40);
    if (!bs.length && !is.length) return `<p class="empty" style="margin-top:18px">Nothing matches “${esc(q.trim())}”. Try a book, an author, or a word like “habit”.</p>`;
    return (bs.length ? `<section class="sec"><div class="sec-h"><h2 class="label">Books</h2></div><div class="grid">${bs.map(tile).join('')}</div></section>` : '') +
      (is.length ? `<section class="sec"><div class="sec-h"><h2 class="label">Ideas</h2></div><div class="rows">${is.map(it => `<button class="row" data-a="read" data-id="${it.book.id}" data-i="${it.n}"><span class="tx"><b>${esc(it.t)}</b><span>${esc(it.book.title)}</span></span>${stMark(it)}</button>`).join('')}</div></section>` : '');
  }
  const chips = `<div class="chips scroll">${[['all', 'All']].concat(SHELVES).map(([id, name]) => `<button class="chip${fshelf === id ? ' on' : ''}" data-a="fshelf" data-s="${id}">${esc(name)}</button>`).join('')}</div>`;
  if (fshelf !== 'all') return chips + `<section class="sec"><div class="grid">${BOOKS.filter(b => b.shelf === fshelf).map(tile).join('')}</div></section>`;
  return chips + SHELVES.map(([id, name]) => {
    const bs = BOOKS.filter(b => b.shelf === id);
    return bs.length ? `<section class="sec"><div class="sec-h"><h2 class="label">${esc(name)}</h2><button class="link" data-a="fshelf" data-s="${id}">See all ${bs.length}</button></div><div class="hs">${bs.map(tile).join('')}</div></section>` : '';
  }).join('');
}
function vLibrary() {
  return `<div class="h-row"><h1 class="title">Library</h1><button class="iconbtn" data-a="surprise" aria-label="Surprise me with a random idea">${I.shuffle}</button></div>
    <label class="search">${I.search}<input id="q" type="search" placeholder="Search ${BOOKS.length} books, ${ALL.length} ideas" value="${esc(q)}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search"></label>
    <div id="lib-body">${libBody()}</div>`;
}

/* ───────── stash ───────── */
function vStash() {
  const ids = stashIds(), tk = dkey(), due = dueList().length;
  if (!ids.length) return `<div class="h-row"><h1 class="title">Stash</h1></div><p class="empty">Nothing stashed yet.<br>Tap <b>Stash</b> on any idea you want to keep. It comes back for recall after 1, 3, 7, 16 and 35 days — right before you’d forget it.</p>`;
  const nd = dayDiff(tk, ids.map(id => S.stash[id].due).sort()[0]);
  const strip = due
    ? `<button class="strip" data-a="recall"><span class="ic">${I.loop}</span><span class="tx"><b>${plural(due, 'idea')} ready for recall</b><span>Say it in your own words, then check.</span></span><span class="go">Start</span></button>`
    : `<div class="strip quiet"><span class="ic">${I.loop}</span><span class="tx"><b>All caught up</b><span>Next recall ${nd <= 1 ? 'tomorrow' : 'in ' + nd + ' days'}.</span></span></div>`;
  return `<div class="h-row"><h1 class="title">Stash</h1><span class="kicker" style="margin:0">${plural(ids.length, 'idea')}</span></div>${strip}
    <section class="sec"><div class="rows">${ids.map((id, i) => {
      const it = IDEA[id], e = S.stash[id], dd = dayDiff(tk, e.due);
      return `<button class="row" data-a="stash-open" data-i="${i}"><span class="tx"><b>${esc(it.t)}</b><span>${esc(it.book.title)}${e.note ? ' · ' + esc(clip(e.note.replace(/\s+/g, ' '), 44)) : ''}</span></span><span class="when${dd <= 0 ? ' due' : ''}">${dd <= 0 ? 'Due' : dd + 'd'}</span></button>`;
    }).join('')}</div></section>`;
}

/* ───────── you ───────── */
function vYou() {
  const st = streak(), readN = Object.keys(S.read).filter(id => IDEA[id]).length, fin = BOOKS.filter(finished).length;
  const stN = stashIds().length, rev = Object.keys(S.days).reduce((n, k) => n + (S.days[k].v || 0), 0);
  const tk = dkey(), dow = (new Date().getDay() + 6) % 7, start = addDays(tk, -(dow + 77));
  let cells = '';
  for (let i = 0; i < 84; i++) {
    const k = addDays(start, i), d = S.days[k], n = d ? d.r + d.v : 0, l = !n ? 0 : n >= S.goal ? 3 : n * 2 >= S.goal ? 2 : 1;
    cells += `<i class="l${l}${k > tk ? ' fut' : ''}${k === tk ? ' now' : ''}"></i>`;
  }
  return `<div class="h-row"><h1 class="title">You</h1><div class="brand">MIND<b>+</b></div></div>
    <div class="stats">
      <div class="stat hot"><b>${st}</b><span>day streak · best ${Math.max(S.best || 0, st)}</span></div>
      <div class="stat"><b>${readN}</b><span>of ${ALL.length} ideas read</span></div>
      <div class="stat"><b>${fin}</b><span>of ${BOOKS.length} books finished</span></div>
      <div class="stat"><b>${stN}</b><span>stashed · ${plural(rev, 'recall')}</span></div>
    </div>
    <section class="sec"><div class="sec-h"><h2 class="label">Last 12 weeks</h2></div><div class="heat" aria-hidden="true">${cells}</div></section>
    <section class="sec"><div class="sec-h"><h2 class="label">Settings</h2></div>
      <div class="set"><div class="tx"><b>Daily goal</b><span>Ideas to read or recall each day.</span></div><div class="seg">${[3, 5, 10].map(g => `<button class="${S.goal === g ? 'on' : ''}" data-a="goal" data-g="${g}" aria-pressed="${S.goal === g}">${g}</button>`).join('')}</div></div>
      <div class="set"><div class="tx"><b>Topics</b><span>${S.topics.length ? esc(clip(S.topics.join(', '), 64)) : 'None picked'}</span></div><button class="btn sm" data-a="topics">Edit</button></div>
      <div class="set"><div class="tx"><b>Backup</b><span>Progress lives on this phone only. Copy a backup now and then.</span></div><div style="display:flex;gap:8px"><button class="btn sm" data-a="export">Copy</button><button class="btn sm" data-a="import">Restore</button></div></div>
      <div class="set"><div class="tx"><b>Start over</b><span>Wipe all progress on this device.</span></div><button class="btn sm danger" data-a="reset">Reset</button></div>
    </section>
    <p class="fine">MIND+ ${VERSION} · ${BOOKS.length} books, ${ALL.length} ideas. Every summary is original, written for this app, and no substitute for the book. If one lands, buy it and read the real thing.</p>`;
}

/* ───────── book sheet ───────── */
function openBook(id, fresh) {
  const b = BOOK[id]; if (!b) return;
  const el = $('#sheet'), sc = fresh ? 0 : el.scrollTop;
  sheetBook = id;
  const pr = prog(b), n = b.ideas.length, on = S.shelf.includes(id), mins = Math.max(2, Math.round(n * 0.45));
  const first = b.ideas.findIndex(it => !S.read[it.id]);
  el.innerHTML = `<div class="sh">
    <div class="sh-top"><button class="iconbtn" data-a="sheet-close" aria-label="Close">${I.x}</button><button class="btn sm${on ? ' on' : ''}" data-a="shelf" data-id="${id}" aria-pressed="${on}">${on ? I.check + 'On your shelf' : I.plus + 'Add to shelf'}</button></div>
    <div class="bkhead">${cover(b)}<div><h1>${esc(b.title)}</h1><div class="by">${esc(b.author)}</div><div class="meta">${esc(b.year)} · ${n} ideas · ${mins} min</div></div></div>
    <p class="blurb">${esc(b.blurb)}</p>
    <div class="cta"><button class="btn primary big" data-a="read" data-id="${id}">${pr >= n ? 'Read again' : pr ? 'Continue · idea ' + (first + 1) : 'Start reading'}</button></div>
    <section class="sec"><div class="sec-h"><h2 class="label">The ideas</h2><span class="label">${pr}/${n} read</span></div><div class="rows">${b.ideas.map((it, i) => `<button class="row${S.read[it.id] ? ' done' : ''}" data-a="read" data-id="${id}" data-i="${i}"><span class="n">${i + 1}</span><span class="tx"><b>${esc(it.t)}</b></span>${stMark(it)}</button>`).join('')}</div></section>
    <p class="fine">An original summary written for MIND+ — the ideas, not the text. If it lands, buy the book.</p>
  </div>`;
  if (fresh) show('#sheet');
  el.scrollTop = sc;
}

/* ───────── reader ───────── */
function openReader(cards, start, mode, title) {
  if (!cards || !cards.length) return;
  Q = null;
  R = { cards, n: cards.length, i: -1, mode, title };
  const el = $('#reader');
  el.className = 'overlay';
  el.innerHTML = `<div class="r-top"><div class="r-bars">${cards.map(() => '<i></i>').join('')}</div>
      <div class="r-head"><button class="iconbtn" data-a="r-close" aria-label="Close">${I.x}</button><div class="r-ttl"></div><div class="r-cnt"></div></div></div>
    <div class="r-track" id="rt">${cards.map((it, i) => `<section class="rc" data-i="${i}">${cardHTML(it, mode)}</section>`).join('')}<section class="rc" id="r-end"></section></div>
    <div class="r-foot" id="rf"><button class="fbtn" data-a="r-prev" aria-label="Previous idea">${I.left}</button>
      <button class="fbtn" id="r-stash" data-a="r-stash" aria-label="Stash this idea">${I.stash}<span>Stash</span></button>
      <button class="fbtn" data-a="r-note" aria-label="Add your note">${I.note}</button>
      <button class="fbtn" data-a="r-share" aria-label="Share this idea">${I.share}</button>
      <button class="fbtn next" data-a="r-next"><span id="r-next-l">Next</span>${I.right}</button></div>`;
  show('#reader');
  const tr = $('#rt');
  tr.scrollLeft = start * tr.clientWidth;
  tr.addEventListener('scroll', onTrack, { passive: true });
  setIdx(start);
}
function onTrack() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    const tr = $('#rt'); if (!tr || !R || !tr.clientWidth) return;
    const i = Math.round(tr.scrollLeft / tr.clientWidth);
    if (i !== R.i) setIdx(i);
  });
}
function setIdx(i) {
  if (!R) return;
  R.i = i;
  const end = i >= R.n, it = R.cards[Math.min(i, R.n - 1)];
  $$('#reader .r-bars i').forEach((b, j) => b.classList.toggle('on', j <= i));
  $('#reader .r-ttl').textContent = end ? '' : R.title;
  $('#reader .r-cnt').textContent = end ? '' : (i + 1) + '/' + R.n;
  $('#rf').style.display = end ? 'none' : '';
  if (end) { drawEnd(); return; }
  if (markRead(it)) save();
  $('#rf [data-a="r-prev"]').disabled = i === 0;
  $('#r-next-l').textContent = i === R.n - 1 ? 'Finish' : 'Next';
  syncStash();
}
function syncStash() {
  if (!R || R.i >= R.n) return;
  const b = $('#r-stash'), on = !!S.stash[R.cards[R.i].id];
  b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);   // label stays "Stash"; the filled gold icon shows the state
}
function redrawCard() { if (!R || R.i >= R.n) return; const c = $(`#rt .rc[data-i="${R.i}"]`); if (c) c.innerHTML = cardHTML(R.cards[R.i], R.mode); }
function go(d) { const tr = $('#rt'); if (!tr || !R) return; const i = Math.max(0, Math.min(R.n, R.i + d)); tr.scrollTo({ left: i * tr.clientWidth, behavior: 'smooth' }); }
function drawEnd() {
  const d = todayStat(), done = d.r + d.v, st = streak(), due = dueList().length, more = nextUnread(1).length > 0;
  let h = done >= S.goal ? 'Goal hit.' : 'Nice work.', sub = `${plural(d.r, 'new idea')} today · ${st}-day streak`, extra = '';
  const b = R.cards[0].book;
  if (R.mode === 'book' && finished(b)) { h = 'Book finished.'; sub = `All ${b.ideas.length} ideas from ${esc(b.title)}. ${sub}`; }
  if (R.mode === 'single') extra = `<button class="btn big" data-a="book-from-reader" data-id="${b.id}">More from ${esc(clip(b.title, 26))}</button>`;
  const tip = stashIds().length ? '' : '<p class="tip">Stash the ideas you want to keep. They come back for recall right before you’d forget them.</p>';
  $('#r-end').innerHTML = `<div class="rc-in end-in">${ring(done, S.goal, true)}<h2>${h}</h2><p>${sub}</p>${tip}
    <div class="end-btns">${more && R.mode !== 'stash' ? '<button class="btn primary big" data-a="session">Keep going</button>' : ''}${due ? `<button class="btn big" data-a="recall">${I.loop}Recall · ${due} due</button>` : ''}${extra}<button class="btn big ghost" data-a="r-close">Done</button></div></div>`;
}
function closeReader() {
  hide('#reader'); $('#reader').innerHTML = ''; R = null; Q = null;
  if (pendingReload) { location.reload(); return; }
  if (sheetBook && !$('#sheet').hidden) openBook(sheetBook);
  render();
}

/* ───────── recall (spaced repetition over the stash) ───────── */
function openRecall() {
  const ids = dueList().slice(0, 15);
  if (!ids.length) { toast('Nothing due for recall yet'); return; }
  R = null; Q = { ids, i: 0, shown: false, res: [0, 0, 0] };
  $('#reader').className = 'overlay';
  show('#reader'); drawRecall();
}
function drawRecall() {
  const el = $('#reader'), n = Q.ids.length;
  const head = cnt => `<div class="r-head"><button class="iconbtn" data-a="r-close" aria-label="Close">${I.x}</button><div class="r-ttl">Recall</div><div class="r-cnt">${cnt}</div></div>`;
  if (Q.i >= n) {
    el.innerHTML = `<div class="r-top">${head('')}</div><div class="q-body"><div class="rc-in end-in"><div class="bigcheck">${I.check}</div><h2>Recall done.</h2>
      <p>${plural(n, 'idea')} · ${Q.res[2]} solid, ${Q.res[1]} fuzzy, ${Q.res[0]} forgotten</p><p class="tip">Forgotten ideas come back tomorrow. Solid ones wait longer each time.</p>
      <div class="end-btns"><button class="btn primary big" data-a="r-close">Done</button></div></div></div>`;
    return;
  }
  const it = IDEA[Q.ids[Q.i]];
  el.innerHTML = `<div class="r-top"><div class="r-bars">${Q.ids.map((_, j) => `<i class="${j < Q.i ? 'on' : ''}"></i>`).join('')}</div>${head((Q.i + 1) + '/' + n)}</div>
    <div class="q-body"><div class="rc-in"><div class="rc-eye"><i></i>${esc(it.book.title)}</div><h2>${esc(it.t)}</h2>
      ${Q.shown ? ideaBody(it) : '<p class="q-hint">Explain this idea in your own words — out loud if you can. Then check yourself.</p>'}</div></div>
    <div class="r-foot q-foot">${Q.shown
      ? '<button class="fbtn g0" data-a="q-grade" data-g="0">Forgot</button><button class="fbtn g1" data-a="q-grade" data-g="1">Fuzzy</button><button class="fbtn g2" data-a="q-grade" data-g="2">Got it</button>'
      : '<button class="btn primary big" data-a="q-show">Show the idea</button>'}</div>`;
}

/* ───────── actions ───────── */
const ACT = {
  tab(el) { tab = el.dataset.tab; q = ''; render(); window.scrollTo(0, 0); },
  'onb-next'() { ob.step++; render(); window.scrollTo(0, 0); },
  topic(el) {
    const t = el.dataset.t;
    if (!S.on) { if (ob.topics.has(t)) ob.topics.delete(t); else ob.topics.add(t); ob.picks = null; render(); return; }
    const i = S.topics.indexOf(t); if (i >= 0) S.topics.splice(i, 1); else S.topics.push(t);
    save(); el.classList.toggle('on');
  },
  pick(el) { const id = el.dataset.id; if (ob.picks.has(id)) ob.picks.delete(id); else ob.picks.add(id); render(); },
  'onb-done'() {
    const list = recs(12, false, Array.from(ob.topics));
    S.topics = Array.from(ob.topics); S.shelf = list.filter(b => ob.picks.has(b.id)).map(b => b.id); S.cur = S.shelf[0] || null; S.on = true;
    save(); tab = 'today'; render(); window.scrollTo(0, 0);
  },
  'tip-off'() { S.tipOff = true; save(); render(); },
  session() {
    const d = todayStat(), done = d.r + d.v, cards = nextUnread(done >= S.goal ? S.goal : S.goal - done);
    if (!cards.length) { if (R) closeReader(); tab = 'library'; render(); toast('Shelf finished — add your next book'); return; }
    openReader(cards, 0, 'session', 'Today');
  },
  recall() { openRecall(); },
  iotd() { openReader([iotd()], 0, 'single', 'Idea of the day'); },
  surprise() { const pool = ALL.filter(it => !S.read[it.id]), src = pool.length ? pool : ALL; openReader([src[Math.floor(Math.random() * src.length)]], 0, 'single', 'Surprise idea'); },
  book(el) { openBook(el.dataset.id, true); },
  'book-from-reader'(el) { const id = el.dataset.id; closeReader(); openBook(id, true); },
  'sheet-close'() { hide('#sheet'); sheetBook = null; render(); },
  shelf(el) {
    const id = el.dataset.id, i = S.shelf.indexOf(id);
    if (i >= 0) { S.shelf.splice(i, 1); if (S.cur === id) S.cur = null; toast('Removed from your shelf'); } else { S.shelf.push(id); toast('Added to your shelf'); }
    save(); openBook(id);
  },
  read(el) {
    const b = BOOK[el.dataset.id]; if (!b) return;
    let i = el.dataset.i != null ? +el.dataset.i : b.ideas.findIndex(it => !S.read[it.id]);
    if (i < 0) i = 0;
    if (!S.shelf.includes(b.id)) S.shelf.push(b.id);
    S.cur = b.id; save();
    openReader(b.ideas, i, 'book', b.title);
  },
  fshelf(el) {
    fshelf = el.dataset.s;
    const body = $('#lib-body'); if (!body) return;
    body.innerHTML = libBody(); window.scrollTo(0, 0);
    const on = $('.chips.scroll .chip.on'), bar = on && on.parentNode;      // keep the chosen shelf chip in view
    if (on) bar.scrollLeft = on.offsetLeft - bar.offsetLeft - (bar.clientWidth - on.offsetWidth) / 2;
  },
  'stash-open'(el) { openReader(stashIds().map(id => IDEA[id]), +el.dataset.i, 'stash', 'Your stash'); },
  'r-close'() { closeReader(); },
  'r-prev'() { go(-1); },
  'r-next'() { go(1); },
  'r-stash'() {
    const it = R && R.cards[R.i]; if (!it) return;
    if (S.stash[it.id]) {
      if (S.stash[it.id].note && !confirm('Remove this from your stash? Your note goes with it.')) return;
      delete S.stash[it.id]; toast('Removed from stash');
    } else { S.stash[it.id] = newStash(); toast('Stashed — back for recall tomorrow'); }
    save(); syncStash(); redrawCard(); drawTabs();
  },
  'r-note'() {
    const it = R && R.cards[R.i]; if (!it) return;
    const cur = (S.stash[it.id] || {}).note || '';
    modal(`<h3>Your note</h3><p class="sub">${esc(it.t)}</p><textarea id="note-ta" placeholder="How does this apply to you? One line is enough.">${esc(cur)}</textarea><div class="cta"><button class="btn" data-a="modal-close">Cancel</button><button class="btn primary" data-a="note-save" data-id="${it.id}">Save</button></div>`, true);
    const ta = $('#note-ta'); ta.focus(); ta.setSelectionRange(cur.length, cur.length);
  },
  'note-save'(el) {
    const id = el.dataset.id, v = $('#note-ta').value.trim();
    if (!S.stash[id]) { if (!v) { closeModal(); return; } S.stash[id] = newStash(); }
    S.stash[id].note = v; save(); closeModal(); syncStash(); redrawCard(); drawTabs();
    toast(v ? 'Note saved to your stash' : 'Note cleared');
  },
  async 'r-share'() {
    const it = R && R.cards[R.i]; if (!it) return;
    const text = `${it.t}\n\n${it.b}\n\n— from ${it.book.title} by ${it.book.author}`;
    try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast('Copied'); } } catch (e) { /* share sheet dismissed */ }
  },
  'q-show'() { Q.shown = true; drawRecall(); },
  'q-grade'(el) {
    const g = +el.dataset.g, e = S.stash[Q.ids[Q.i]];
    if (e) {
      if (g === 2) e.box = Math.min((e.box || 0) + 1, STEPS.length - 1); else if (g === 0) e.box = 0;
      e.due = addDays(dkey(), g === 2 ? STEPS[e.box] : g === 1 ? Math.max(1, Math.round(STEPS[e.box || 0] / 2)) : 1);
      e.seen = (e.seen || 0) + 1;
    }
    Q.res[g]++; bump('v'); save(); Q.i++; Q.shown = false; drawRecall();
  },
  goal(el) { S.goal = +el.dataset.g; save(); render(); },
  topics() { modal(`<h3>Your topics</h3><p class="sub">These decide what shows up under “Picked for you”.</p><div class="chips">${TOPICS.map(t => `<button class="chip${S.topics.includes(t) ? ' on' : ''}" data-a="topic" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div><div class="cta"><button class="btn primary" data-a="modal-close">Done</button></div>`); },
  'modal-close'() { closeModal(); if (S.on && !R && !Q && $('#sheet').hidden) render(); },
  async export() {
    const data = JSON.stringify(S);
    try { await navigator.clipboard.writeText(data); toast('Backup copied — paste it somewhere safe'); }
    catch (e) { modal(`<h3>Backup</h3><p class="sub">Select all of this, copy it, and keep it somewhere safe.</p><textarea readonly>${esc(data)}</textarea><div class="cta"><button class="btn primary" data-a="modal-close">Done</button></div>`, true); }
  },
  import() { modal('<h3>Restore a backup</h3><p class="sub">Paste a backup copied from MIND+. It replaces the progress on this device.</p><textarea id="imp-ta" placeholder="Paste backup text"></textarea><div class="cta"><button class="btn" data-a="modal-close">Cancel</button><button class="btn primary" data-a="import-go">Restore</button></div>', true); },
  'import-go'() {
    try {
      const o = JSON.parse($('#imp-ta').value);
      if (!o || o.v !== 1 || typeof o.read !== 'object' || typeof o.stash !== 'object') throw new Error('shape');
      S = Object.assign(blank(), o); save(); closeModal(); render(); toast('Backup restored');
    } catch (e) { toast('That isn’t a MIND+ backup'); }
  },
  reset() { if (!confirm('Wipe all MIND+ progress on this device? This can’t be undone.')) return; try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } location.reload(); }
};

/* ───────── render + wiring ───────── */
function drawTabs() {
  const due = dueList().length;
  $('#tabbar').innerHTML = [['today', 'Today', I.today], ['library', 'Library', I.lib], ['stash', 'Stash', I.stash], ['you', 'You', I.you]]
    .map(([id, name, icon]) => `<button class="tab${tab === id ? ' on' : ''}" data-a="tab" data-tab="${id}"${tab === id ? ' aria-current="page"' : ''}>${icon}<span>${name}</span>${id === 'stash' && due ? `<i class="badge">${due}</i>` : ''}</button>`).join('');
}
function render() {
  document.body.classList.toggle('onb', !S.on);
  if (!S.on) { $('#view').innerHTML = vOnb(); return; }
  $('#view').innerHTML = ({ today: vToday, library: vLibrary, stash: vStash, you: vYou }[tab] || vToday)();
  drawTabs();
}

document.addEventListener('click', e => {
  if (e.target === $('#modal')) { ACT['modal-close'](); return; }
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const fn = ACT[el.dataset.a];
  if (fn) fn(el, e);
});
document.addEventListener('input', e => { if (e.target.id === 'q') { q = e.target.value; const b = $('#lib-body'); if (b) b.innerHTML = libBody(); } });
document.addEventListener('keydown', e => {
  if (!$('#modal').hidden) { if (e.key === 'Escape') ACT['modal-close'](); return; }
  if (!$('#reader').hidden) {
    if (e.key === 'Escape') closeReader();
    else if (R && e.key === 'ArrowRight') go(1);
    else if (R && e.key === 'ArrowLeft') go(-1);
  } else if (!$('#sheet').hidden && e.key === 'Escape') ACT['sheet-close']();
});
document.addEventListener('touchstart', () => {}, { passive: true });   // lets :active styles fire on iOS
document.addEventListener('visibilitychange', () => {                    // coming back tomorrow: refresh the day
  if (!document.hidden && S.on && !R && !Q && $('#sheet').hidden && $('#modal').hidden && tab !== 'library') render();
});
render();

/* offline support. Skipped on localhost so edits show up straight away (add ?sw=1 to test it there). */
if ('serviceWorker' in navigator) {
  const dev = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && !/[?&]sw=1/.test(location.search);
  if (!dev) {
    const had = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!had || reloaded) return;            // first install: nothing to refresh
      reloaded = true;
      if (R || Q) pendingReload = true; else location.reload();
    });
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
}
})();
