/* Lemma — AI study companion for math & STEM. Vanilla JS, no build step. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = document.getElementById('app');
const ico = (n, cls = '') => `<img class="ic ${cls}" src="/img/icons/${n}.webp" alt="">`;
const SVG = { x: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', send: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
  clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>' };
const svg = n => `<svg class="sv" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG[n]}</svg>`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- data ---------- */
const TUTORS = {
  nova: { name: 'Nova', tag: 'After a bad exam', blurb: 'Patient and warm.',
    style: 'Warm, calm and patient. You notice effort and name it. You never rush. Gentle humour.' },
  max: { name: 'Max', tag: 'For the "why"', blurb: 'Playful analogies.',
    style: 'Playful and curious. You explain with vivid everyday analogies (pizza, skateboards, video games) before the formal version. Enthusiastic but never childish.' },
  ada: { name: 'Ada', tag: 'For exam drills', blurb: 'Direct. No fluff.',
    style: 'Direct, sharp and efficient like a great coach. High standards, dry wit, zero fluff. You respect the student enough to be honest, and you are never harsh about feelings.' },
};
for (const k in TUTORS) TUTORS[k].img = `/img/${k}.webp`;
const pic = (mood, id = S.profile?.tutor || 'nova') => `/img/${id}${mood ? '-' + mood : ''}.webp`; // moods: '', 'cheer', 'care'
const SUBJECTS = {
  'Math': ['Linear equations', 'Quadratics', 'Functions & graphs', 'Trigonometry', 'Derivatives', 'Integrals', 'Probability'],
  'Physics': ['Kinematics', "Newton's laws", 'Energy & work', 'Momentum', 'Circuits', 'Waves'],
  'Chemistry': ['Moles & stoichiometry', 'Balancing equations', 'Atomic structure', 'Acids & bases', 'Thermochemistry', 'Equilibrium'],
  'Statistics': ['Mean & variance', 'Probability rules', 'Normal distribution', 'Hypothesis tests', 'Regression'],
  'Computer Science': ['Big-O complexity', 'Recursion', 'Binary & logic', 'Sorting', 'Graphs & trees'],
};
const SITUATIONS = {
  failed: { ico: 'comeback', bg: 'var(--coral-s)', t: 'I failed an exam', d: 'Get a comeback plan.' },
  exam: { ico: 'exam', bg: 'var(--yellow-s)', t: 'Exam coming up', d: 'Find and fix weak spots.' },
  homework: { ico: 'homework', bg: 'var(--purple-s)', t: 'Homework', d: 'Get unstuck.' },
};

/* ---------- state ---------- */
const S = Object.assign({ profile: null, xp: 0, streak: 0, lastDay: null, plan: null, done: {}, memory: { notes: [], topics: {} } },
  JSON.parse(localStorage.getItem('lemma') || 'null') || {});
S.memory = S.memory || { notes: [], topics: {} };
const save = () => localStorage.setItem('lemma', JSON.stringify(S));
const track = (topic, ok) => { const t = S.memory.topics[topic] = S.memory.topics[topic] || { n: 0, ok: 0 }; t.n++; if (ok) t.ok++; save(); };
const weakTopics = () => Object.entries(S.memory.topics).filter(([, v]) => v.n >= 2 && v.ok / v.n < 0.6).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).map(([k]) => k);
const strongTopics = () => Object.entries(S.memory.topics).filter(([, v]) => v.n >= 3 && v.ok / v.n >= 0.8).map(([k]) => k);
const T = () => TUTORS[S.profile?.tutor || 'nova'];
function touchStreak() {
  const day = d => new Date(d).toISOString().slice(0, 10);
  const today = day(Date.now());
  if (S.lastDay === today) return;
  S.streak = S.lastDay === day(Date.now() - 864e5) ? S.streak + 1 : 1;
  S.lastDay = today; save();
}

/* ---------- rendering text with math ---------- */
function rich(text) {
  const parts = String(text).split(/(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$)/g);
  return parts.map((p, i) => {
    if (i % 2) {
      const display = p.startsWith('$$') || p.startsWith('\\[');
      const tex = p.replace(/^(\$\$|\\\[|\\\(|\$)|(\$\$|\\\]|\\\)|\$)$/g, '');
      try { return window.katex ? katex.renderToString(tex, { displayMode: display, throwOnError: false }) : esc(p); } catch { return esc(p); }
    }
    return esc(p).replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>').replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
  }).join('');
}

/* ---------- model calls ---------- */
async function post(body) {
  const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { let m = 'The tutor is unreachable right now.'; try { m = (await r.json()).error || m; } catch {} throw new Error(m); }
  return r;
}
async function ask(system, messages, max_tokens = 1500) {
  return (await (await post({ system, messages, max_tokens })).json()).text;
}
async function stream(system, messages, onText) {
  const r = await post({ system, messages, stream: true, max_tokens: 1500 });
  const rd = r.body.getReader(), dec = new TextDecoder();
  let buf = '', full = '';
  for (;;) {
    const { done, value } = await rd.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      const d = line.slice(5).trim();
      if (d === '[DONE]') continue;
      try { const t = JSON.parse(d).choices?.[0]?.delta?.content; if (t) { full += t; onText(full); } } catch {}
    }
  }
  return full;
}
function persona(mode, voice) {
  const p = S.profile, t = T();
  const modes = {
    solve: 'MODE: solving a problem the student brings (typed or as a photo). First make sure you understand the problem, then guide.',
    comeback: `MODE: the student failed or did badly on an exam. Order of work: (1) acknowledge the feeling in one or two honest sentences, no toxic positivity, no lecture; (2) ask ONE question at a time to learn what happened: which exam, which questions went wrong, whether it was knowledge gaps, time pressure, panic or careless slips, and when the retake or next exam is; (3) after two or three exchanges, tell them you have enough to build a comeback plan and that they can press the green "Build my plan" button.`,
    why: 'MODE: the student just answered a practice question and wants to understand it. Find the misconception with a question before explaining.',
  };
  return `You are ${t.name}, an AI study companion for math and STEM inside the web app Lemma. You are an AI, not a human, and you say so plainly if asked.
PERSONALITY: ${t.style}
STUDENT: ${p.name}, ${p.level}, studying ${p.subject}.
${memoryBlock()}
${modes[mode]}
TEACHING RULES:
- Be Socratic. Never dump a full solution up front. Give ONE step, hint or guiding question per message, then stop and wait.
- If the student is stuck twice on the same step, or explicitly asks for the full solution, give a clean numbered worked solution.
- Always check the student's working yourself before saying it is right. If it is wrong, point to the exact line and ask them to look again.
- Keep every message under 50 words: two or three short sentences. No preamble, no recap of what the student just said.
- Write math in LaTeX: $...$ inline and $$...$$ on its own line. No markdown headings or tables.
- Celebrate real progress briefly and specifically.
CARE RULES:
- A bad exam is an event, not an identity. Never call the student lazy or bad at the subject.
- If the student expresses hopelessness beyond exam stress or any thought of harming themselves, stop tutoring, respond with care, and encourage them to talk to someone they trust or a local crisis line right now.
- Stay on studying and the student's wellbeing around it. You are not a romantic or adult companion.${voice ? `
VOICE MODE (overrides the format rules above): your reply is read aloud. Maximum 30 words. No LaTeX, no symbols, no lists. Say math in plain words, for example "x squared plus three x". One idea per reply, then a short question.` : ''}`;
}

/* ---------- memory ---------- */
function memoryBlock() {
  const m = S.memory, weak = weakTopics(), strong = strongTopics();
  if (!m.notes.length && !weak.length && !strong.length) return 'MEMORY: this is your first session with this student.';
  return `MEMORY (what you remember from earlier sessions; use it naturally when relevant, never recite it as a list):
${m.notes.map(n => '- ' + n).join('\n')}${weak.length ? `\n- Weak topics from practice results: ${weak.join(', ')}` : ''}${strong.length ? `\n- Strong topics: ${strong.join(', ')}` : ''}`;
}
async function remember(msgs) {
  const p = S.profile;
  const transcript = msgs.map(m => `${m.role === 'user' ? p.name : 'Tutor'}: ${typeof m.content === 'string' ? m.content : m.content[0].text}`).join('\n').slice(-6000);
  try {
    const out = await ask(`You keep a tutor's long-term memory about one student. From the session transcript, extract up to 3 NEW facts worth remembering for future sessions: which exam went wrong and why, exam dates, specific misconceptions, topics they struggle with, what kind of explanation worked, how they felt.
One fact per line, third person, max 12 words each, plain text, no LaTeX, no bullets. Do not repeat anything already known. If there is nothing new worth keeping, output exactly NONE.
Already known:\n${S.memory.notes.join('\n') || '(nothing yet)'}`, [{ role: "user", content: transcript }], 1200);
    const lines = out.split('\n').map(x => x.replace(/^[-•\d.\s]+/, '').trim()).filter(x => x && !/^none\.?$/i.test(x)).slice(0, 3);
    if (!lines.length) return;
    S.memory.notes = [...lines, ...S.memory.notes].slice(0, 10); save();
    if ($('#mem-slot')) $('#mem-slot').innerHTML = memCard();
  } catch {}
}
function memCard() {
  const m = S.memory, weak = weakTopics();
  if (!m.notes.length && !weak.length) return '';
  return `<div class="mem"><div class="mem-h"><img src="${pic('')}" alt=""><b>${T().name} remembers</b><button class="linkish" onclick="forgetAll()">Forget</button></div>
    <ul>${m.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
    ${weak.length ? `<div class="chips">${weak.map(w => `<span class="weak">Weak: ${esc(w)}</span>`).join('')}</div>` : ''}</div>`;
}
window.forgetAll = () => { if (confirm('Erase the tutor memory?')) { S.memory = { notes: [], topics: {} }; save(); home(); } };

/* ---------- speech ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function say(text, onend) {
  if (!window.speechSynthesis) return void (onend && onend());
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/\$\$?[\s\S]+?\$\$?/g, ' ').replace(/[*`#_]/g, ''));
  const vs = speechSynthesis.getVoices();
  u.voice = vs.find(v => /Google US English|Samantha|Aria|Jenny/.test(v.name)) || vs.find(v => v.lang === 'en-US') || null;
  u.rate = 1.04; u.pitch = 1.1;
  let done = false; const fin = () => { if (!done) { done = true; onend && onend(); } };
  u.onend = fin; u.onerror = fin;
  speechSynthesis.speak(u);
}
window.speechSynthesis?.getVoices();

/* ---------- shared bits ---------- */
function nav() {
  return `<div class="nav"><div class="logo"><i>λ</i>Lemma</div><div class="sp"></div>
    <div class="pill fire">${ico('streak')} <b>${S.streak}</b> day${S.streak === 1 ? '' : 's'}</div>
    <div class="pill xp">${ico('xp')} <b>${S.xp}</b> XP</div>
    <img class="me" src="${T().img}" title="Change tutor or start over" alt="${T().name}"></div>`;
}
function confetti() {
  const colors = ['#1DBF6A', '#7A5AF8', '#FFC83D', '#FF6A5C', '#15141B'];
  for (let i = 0; i < 46; i++) {
    const c = document.createElement('i'); c.className = 'confetti';
    c.style.cssText = `left:${Math.random() * 100}vw;background:${colors[i % 5]};animation-duration:${1.4 + Math.random() * 1.6}s;animation-delay:${Math.random() * .4}s`;
    document.body.appendChild(c); setTimeout(() => c.remove(), 3600);
  }
}

/* ---------- onboarding ---------- */
function onboarding(step = 0, d = { name: '', subject: 'Math', level: 'University', situation: 'failed', tutor: 'nova' }) {
  const pct = [25, 60, 100][step];
  const body = [
    () => `<h1>Let's set you up.</h1><p class="sub">Three quick questions.</p>
      <label class="label">Your name</label>
      <input class="field" id="name" placeholder="First name" value="${esc(d.name)}" maxlength="30" autocomplete="given-name">
      <label class="label">Subject</label>
      <div class="chips" data-k="subject">${Object.keys(SUBJECTS).map(s => `<button class="chip ${d.subject === s ? 'on' : ''}" data-v="${s}">${s}</button>`).join('')}</div>
      <label class="label">Level</label>
      <div class="chips" data-k="level">${['High school', 'University'].map(s => `<button class="chip ${d.level === s ? 'on' : ''}" data-v="${s}">${s}</button>`).join('')}</div>`,
    () => `<h1>What brings you here?</h1><p class="sub"></p>
      <div class="opts" data-k="situation">${Object.entries(SITUATIONS).map(([k, s]) => `<button class="opt ${d.situation === k ? 'on' : ''}" data-v="${k}">
        <div class="ico" style="background:${s.bg}">${ico(s.ico)}</div><div><b>${s.t}</b><span>${s.d}</span></div></button>`).join('')}</div>`,
    () => `<h1>Pick your tutor.</h1><p class="sub">You can switch later.</p>
      <div class="tutors" data-k="tutor">${Object.entries(TUTORS).map(([k, t]) => `<button class="tutor t-${k} ${d.tutor === k ? 'on' : ''}" data-v="${k}">
        <img src="${t.img}" alt=""><div><b>${t.name}</b><span>${t.blurb}</span><em>${t.tag}</em></div></button>`).join('')}</div>`,
  ][step]();
  app.innerHTML = `<div class="ob"><div class="ob-bar"><i style="width:${pct}%"></i></div>${body}
    <div class="foot">${step ? '<button class="btn ghost" id="back">Back</button>' : '<span></span>'}
    <button class="btn go big" id="next">${step === 2 ? "Let's go" : 'Continue'}</button></div></div>`;
  $$('[data-k]').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    d[g.dataset.k] = b.dataset.v; $$('[data-v]', g).forEach(x => x.classList.toggle('on', x === b));
  }));
  const nameEl = $('#name'); if (nameEl) { nameEl.focus(); nameEl.oninput = () => d.name = nameEl.value; nameEl.onkeydown = e => e.key === 'Enter' && $('#next').click(); }
  if ($('#back')) $('#back').onclick = () => onboarding(step - 1, d);
  $('#next').onclick = () => {
    if (step < 2) return onboarding(step + 1, d);
    S.profile = { ...d, name: d.name.trim() || 'friend' }; touchStreak(); save();
    d.situation === 'failed' ? session('comeback') : home();
  };
}

/* ---------- home ---------- */
function home() {
  touchStreak();
  const p = S.profile, t = T();
  const greet = S.plan ? [`Day ${Math.min(Object.keys(S.done).length + 1, S.plan.days.length)} of your comeback.`, esc(S.plan.pep)]
    : S.memory.notes.length ? [`Welcome back, ${esc(p.name)}.`, `Last time: ${esc(S.memory.notes[0])}`]
    : p.situation === 'failed' ? [`Rough exam, ${esc(p.name)}?`, `Tell me what happened.`]
    : p.situation === 'exam' ? [`Let's get you ready.`, `Pick a topic. I'll find the gaps.`]
    : [`What are we solving, ${esc(p.name)}?`, `Bring me any problem.`];
  const nodes = S.plan
    ? S.plan.days.map((d, i) => `<button class="node ${S.done[i] ? 'done' : ''}" data-day="${i}"><div class="n">${S.done[i] ? svg('check') : d.day}</div>
        <div><b>${esc(d.focus)}</b><span>${esc(d.task)}</span></div><div class="go-t">${d.minutes || 20} min</div></button>`).join('')
    : SUBJECTS[p.subject].map((s, i) => `<button class="node" data-topic="${esc(s)}"><div class="n">${i + 1}</div>
        <div><b>${esc(s)}</b></div><div class="go-t">Practice</div></button>`).join('');
  app.innerHTML = `<div class="wrap t-${p.tutor}">${nav()}
    <div class="hero"><img src="${pic(S.plan ? 'cheer' : '')}" alt="${t.name}"><div class="say"><h2>${greet[0]}</h2><p>${greet[1]}</p>
      <div class="cta">${S.plan ? `<button class="btn go" id="h-next">Continue</button>` : p.situation === 'failed'
        ? `<button class="btn go" id="h-come">Talk to ${t.name}</button>` : `<button class="btn go" id="h-solve">Solve a problem</button>`}</div></div></div>
    <div class="acts">
      <button class="act a1" id="a-solve">${ico('solve')}<b>Solve</b><span>Hints first</span></button>
      <button class="act a2" id="a-prac">${ico('practice')}<b>Practice</b><span>5 questions</span></button>
      <button class="act a3" id="a-come">${ico('comeback')}<b>Bad exam?</b><span>Get a plan</span></button>
      <button class="act a4" id="a-mock">${ico('mock')}<b>Mock exam</b><span>6 minutes</span></button>
    </div>
    <div id="mem-slot">${memCard()}</div>
    <div class="sec">${S.plan ? 'Your plan' : esc(p.subject)}</div>
    ${S.plan ? `<div class="plan-head"><h3>${esc(S.plan.headline)}</h3><ul>${S.plan.diagnosis.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
    <div class="path">${nodes}</div>
    ${S.plan ? `<p class="center" style="margin-top:18px"><button class="linkish" id="clear-plan">Clear plan</button></p>` : ''}
  </div>`;
  const on = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
  on('#a-solve', () => session('solve')); on('#h-solve', () => session('solve'));
  on('#a-come', () => session('comeback')); on('#a-mock', mock); on('#h-come', () => session('comeback'));
  on('#a-prac', () => practice(SUBJECTS[p.subject][Math.floor(Math.random() * SUBJECTS[p.subject].length)]));
  on('#h-next', () => { const i = S.plan.days.findIndex((_, i) => !S.done[i]); const k = i < 0 ? 0 : i; practice(S.plan.days[k].focus, k); });
  on('#clear-plan', () => { S.plan = null; S.done = {}; save(); home(); });
  $$('.node').forEach(n => n.onclick = () => n.dataset.day != null ? practice(S.plan.days[+n.dataset.day].focus, +n.dataset.day) : practice(n.dataset.topic));
  $('.me').onclick = () => { if (confirm('Switch tutor?')) onboarding(2, { ...S.profile }); };
  $('.logo').onclick = landing;
}

/* ---------- tutor session (chat) ---------- */
function session(mode, ctx) {
  const p = S.profile, t = T();
  const title = { solve: 'Solve', comeback: 'Bad exam', why: 'Review' }[mode];
  const opener = {
    solve: `What are we solving, ${p.name}? Type it or send a photo.`,
    comeback: `Hey ${p.name}. Bad exam? Tell me what happened.`,
  }[mode];
  const quick = { solve: ['Hint', "I'm stuck", 'Explain differently', 'Full solution'],
    comeback: ['Ran out of time', 'I blanked', "It didn't stick"], why: ['Hint', 'Explain differently', 'Full solution'] }[mode];
  const msgs = []; // {role, content} sent to the model
  let busy = false, image = null, userTurns = 0;

  app.innerHTML = `<div class="session t-${p.tutor}">
    <div class="s-top"><button class="x" id="close" aria-label="Close">${svg('x')}</button><h3>${title}</h3>
      <button class="btn accent call-b" id="voice">${svg('mic')} Voice</button></div>
    <div class="s-body"><aside class="stage"><div class="av"><img src="${pic(mode === 'comeback' ? 'care' : '')}" alt="${t.name}"></div>
        <div><div class="nm">${t.name}</div><div class="st" id="st">Listening</div></div><div class="ai">AI, not a human</div></aside>
      <main class="chat"><div class="msgs" id="msgs"></div><div class="quick" id="quick"></div><div class="thumb" id="thumb"></div>
        <form class="composer" id="form"><div class="box"><textarea id="in" rows="1" placeholder="Message ${t.name}"></textarea>
          <button type="button" class="icon" id="cam" title="Send a photo" aria-label="Send a photo">${svg('cam')}</button>
          <button type="button" class="icon" id="mic" title="Speak" aria-label="Speak">${svg('mic')}</button><input type="file" id="file" accept="image/*" hidden></div>
          <button class="send" aria-label="Send">${svg('send')}</button></form></main></div>
    <div class="call" id="call" hidden><button class="x" id="call-x" aria-label="Leave voice mode">${svg('x')}</button>
      <div class="call-av"><img src="${pic(mode === 'comeback' ? 'care' : '')}" alt="${t.name}"></div>
      <div class="call-cap" id="cap"></div><div class="call-you" id="you"></div>
      <button class="mic-big" id="micb" aria-label="Talk">${svg('mic')}</button><div class="call-st" id="cst">Tap to talk</div></div></div>`;
  const box = $('#msgs'), input = $('#in'), stage = $('.session'), st = $('#st');
  const scroll = () => box.scrollTop = box.scrollHeight;
  const bubble = (role, html) => { const el = document.createElement('div'); el.className = 'msg ' + role; el.innerHTML = html; box.appendChild(el); scroll(); return el; };
  const setTalking = on => { stage.classList.toggle('talking', on); st.textContent = on ? 'Thinking…' : 'Listening'; };
  function chips() {
    const q = $('#quick');
    q.innerHTML = (mode === 'comeback' && userTurns >= 2 ? `<button class="chip plan" data-plan>Build my plan</button>` : '') +
      (userTurns >= 1 || mode !== 'why' ? quick.map(x => `<button class="chip">${x}</button>`).join('') : '');
    $$('.chip', q).forEach(c => c.onclick = () => c.dataset.plan != null ? buildPlan(msgs) : send(c.textContent));
  }
  async function reply() {
    busy = true; setTalking(true);
    const el = bubble('a', '<span class="dots"><i></i><i></i><i></i></span>');
    try {
      const full = await stream(persona(mode, call), msgs, txt => { el.innerHTML = rich(txt); scroll(); if (call) $('#cap').innerHTML = rich(txt); });
      msgs.push({ role: 'assistant', content: full });
      if (call) { callState('speaking'); say(full, () => call && listen()); }
    } catch (e) { el.classList.add('err'); el.textContent = e.message; msgs.pop(); }
    busy = false; setTalking(false); chips(); if (!call) input.focus();
  }
  /* voice mode: listen -> think -> speak -> listen */
  let call = false, rec = null;
  const callState = k => { const c = $('#call'); if (!c) return; c.dataset.s = k;
    $('#cst').textContent = { idle: 'Tap to talk', listening: 'Listening…', thinking: 'Thinking…', speaking: 'Tap to interrupt' }[k]; };
  function listen() {
    if (!call || busy) return;
    if (!SR) { callState('idle'); $('#cst').textContent = 'Voice needs Chrome or Edge.'; return; }
    try { rec && rec.abort(); } catch {}
    rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; let final = '';
    rec.onresult = ev => { let txt = ''; for (const r of ev.results) { txt += r[0].transcript; if (r.isFinal) final = txt; } $('#you').textContent = txt; };
    rec.onend = () => { if (!call) return; if (final.trim()) { callState('thinking'); send(final); } else callState('idle'); };
    rec.onerror = () => {};
    try { rec.start(); callState('listening'); $('#you').textContent = ''; } catch { callState('idle'); }
  }
  function setCall(on) {
    call = on; $('#call').hidden = !on; window.speechSynthesis?.cancel(); try { rec && rec.abort(); } catch {}
    if (on) { const last = msgs.filter(m => m.role === 'assistant').pop(); $('#cap').innerHTML = last ? rich(last.content) : ''; listen(); }
  }
  $('#call-x').onclick = () => setCall(false);
  $('#micb').onclick = () => { const s = $('#call').dataset.s; if (s === 'speaking') { speechSynthesis.cancel(); listen(); } else if (s === 'listening') rec && rec.stop(); else if (s !== 'thinking') listen(); };
  function send(text) {
    text = (text || '').trim();
    if (busy || (!text && !image)) return;
    bubble('u', (image ? `<img src="${image}" alt="Your photo">` : '') + rich(text));
    msgs.push({ role: 'user', content: image ? [{ type: 'text', text: text || 'Here is a photo of my problem.' }, { type: 'image_url', image_url: { url: image } }] : text });
    image = null; $('#thumb').innerHTML = ''; input.value = ''; input.style.height = 'auto'; userTurns++;
    reply();
  }
  $('#form').onsubmit = e => { e.preventDefault(); send(input.value); };
  input.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } };
  input.oninput = () => { input.style.height = 'auto'; input.style.height = input.scrollHeight + 'px'; };
  $('#close').onclick = () => { setCall(false); if (userTurns >= 1) remember(msgs.slice()); home(); };
  $('#voice').onclick = () => setCall(true);
  $('#cam').onclick = () => $('#file').click();
  $('#file').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1280 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      image = c.toDataURL('image/jpeg', .85); $('#thumb').innerHTML = `<img src="${image}" alt="Attached photo">`; input.focus();
    };
    img.src = URL.createObjectURL(f); e.target.value = '';
  };
  if (!SR) $('#mic').style.display = 'none';
  else $('#mic').onclick = e => {
    const b = e.currentTarget, r = new SR(); r.lang = 'en-US'; r.interimResults = false;
    b.classList.add('rec'); r.onresult = ev => { input.value = (input.value + ' ' + ev.results[0][0].transcript).trim(); input.oninput(); };
    r.onend = r.onerror = () => b.classList.remove('rec'); r.start();
  };

  if (mode === 'why') { msgs.push({ role: 'user', content: ctx }); chips(); reply(); }
  else { msgs.push({ role: 'assistant', content: opener }); bubble('a', rich(opener)); chips(); input.focus(); }
}

/* ---------- comeback plan ---------- */
async function buildPlan(msgs) {
  const p = S.profile, t = T();
  app.innerHTML = `<div class="wrap t-${p.tutor}"><div class="load"><img src="${pic('care')}" alt=""><h2>Building your plan…</h2></div></div>`;
  const transcript = msgs.map(m => `${m.role === 'user' ? p.name : t.name}: ${typeof m.content === 'string' ? m.content : m.content[0].text}`).join('\n');
  try {
    const text = await ask(`You are ${t.name}, an AI study coach. From the conversation, write a comeback plan for ${p.name} (${p.level}, ${p.subject}) after a bad exam.
Return ONLY valid JSON, no code fence, no LaTeX, no backslashes:
{"headline": "specific, encouraging title (max 6 words)",
 "diagnosis": ["exactly 3 honest observations about what went wrong, max 9 words each"],
 "days": [{"day": 1, "focus": "one specific topic to practise (2-4 words, usable as a quiz topic)", "task": "what to do, max 9 words, starts with a verb", "minutes": 20}],
 "pep": "one short sentence in your own voice, max 10 words"}
Give 5 days. Order days so the biggest cause of lost marks comes first. If the cause was time pressure or panic, include a timed-practice day and a day on exam technique for this subject. Base everything on what the student said; do not invent details they did not mention.`,
      [{ role: "user", content: transcript }], 2500);
    const plan = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    if (!Array.isArray(plan.days) || !plan.days.length) throw new Error('empty');
    S.plan = plan; S.done = {}; save(); remember(msgs.slice()); confetti(); home(); window.scrollTo(0, 0);
  } catch (e) {
    app.innerHTML = `<div class="wrap"><div class="load"><h2>That didn't work.</h2><p class="muted">${esc(e.message)}</p><button class="btn" id="b">Back home</button></div></div>`;
    $('#b').onclick = home;
  }
}

/* ---------- practice (5 adaptive questions) ---------- */
function parseQ(text) {
  const q = { choices: {} }; let cur = null;
  for (const line of text.split('\n')) {
    let m;
    if ((m = line.match(/^\s*(TOPIC|Q|ANSWER|HINT|WHY):\s*(.*)$/))) { cur = m[1]; q[cur] = m[2]; }
    else if ((m = line.match(/^\s*([ABCD])\)\s*(.*)$/))) { cur = m[1]; q.choices[cur] = m[2]; }
    else if (cur) { if ('ABCD'.includes(cur)) q.choices[cur] += '\n' + line; else q[cur] += '\n' + line; }
  }
  q.ANSWER = (q.ANSWER || '').trim().charAt(0).toUpperCase();
  if (new Set(Object.values(q.choices).map(v => v.replace(/\s+/g, ''))).size < 4) throw new Error('That question failed to load.');
  if (!q.Q || Object.keys(q.choices).length !== 4 || !'ABCD'.includes(q.ANSWER) || !q.ANSWER) throw new Error('That question failed to load.');
  return q;
}
function practice(topic, dayIdx = null) {
  const p = S.profile, t = T(), N = 5;
  const results = []; const asked = []; let level = 2, next = null, earned = 0;
  const gen = () => genQ(topic, level, asked);

  const shell = inner => { app.innerHTML = `<div class="prac t-${p.tutor}"><div class="p-top"><button class="x" id="close">${svg('x')}</button>
    <div class="segs">${Array.from({ length: N }, (_, i) => `<i class="${results[i] == null ? (i === results.length ? 'cur' : '') : results[i] ? 'ok' : 'no'}"></i>`).join('')}</div>
    <div class="pill xp">${ico('xp')} <b>${S.xp}</b></div></div>${inner}</div>`; $('#close').onclick = home; };

  async function load() {
    shell(`<div class="load"><img src="${t.img}" alt=""><h3>${results.length ? 'Next question…' : 'Picking a question…'}</h3></div>`);
    try { const q = await (next || gen()); next = null; show(q); }
    catch (e) { next = null; shell(`<div class="load"><h3>${esc(e.message)}</h3><button class="btn" id="re">Try again</button></div>`); $('#re').onclick = load; }
  }
  function show(q) {
    asked.push(q.Q.slice(0, 90)); let pick = null;
    shell(`<span class="tag">${esc(q.TOPIC || topic)} · level ${level}</span><div class="q">${rich(q.Q)}</div>
      <div class="choices" id="ch">${'ABCD'.split('').map(k => `<button class="choice" data-k="${k}"><span class="k">${k}</span><span>${rich(q.choices[k])}</span></button>`).join('')}</div>
      <div id="hint"></div>
      <div class="p-foot" id="foot"><div class="in"><button class="btn ghost" id="hintb">${ico('hint')} Hint</button><button class="btn go big" id="check" disabled>Check</button></div></div>`);
    $$('.choice').forEach(c => c.onclick = () => { pick = c.dataset.k; $$('.choice').forEach(x => x.classList.toggle('on', x === c)); $('#check').disabled = false; });
    $('#hintb').onclick = () => { $('#hint').innerHTML = `<div class="hint"><img src="${t.img}" alt=""><div>${rich(q.HINT || 'Write down what you know.')}</div></div>`; };
    $('#check').onclick = () => {
      const ok = pick === q.ANSWER; results.push(ok); track(topic, ok);
      if (ok) { S.xp += 10; earned += 10; save(); }
      level = Math.max(1, Math.min(3, level + (ok ? 1 : -1)));
      if (results.length < N) next = gen().catch(() => null).then(x => x || gen());
      $('#ch').classList.add('locked');
      $$('.choice').forEach(c => { if (c.dataset.k === q.ANSWER) c.classList.add('ok'); else if (c.dataset.k === pick) c.classList.add('no'); c.classList.remove('on'); });
      $$('.segs i')[results.length - 1].className = ok ? 'ok' : 'no';
      $('.pill.xp b').textContent = S.xp;
      const foot = $('#foot'); foot.className = 'p-foot ' + (ok ? 'ok' : 'no');
      foot.innerHTML = `<div class="in"><img class="fb-m" src="${pic(ok ? 'cheer' : 'care')}" alt=""><div class="fb"><b>${ok ? 'Correct! +10 XP' : `Not quite. It's ${q.ANSWER}.`}</b><p>${rich(q.WHY || '')}</p></div>
        <div class="bs"><button class="btn ghost" id="why">Ask why</button><button class="btn ${ok ? 'go' : ''} big" id="cont">${results.length < N ? 'Continue' : 'Finish'}</button></div></div>`;
      $('#cont').onclick = () => results.length < N ? load() : finish();
      $('#why').onclick = () => session('why', `I just answered this practice question.\n\nQuestion: ${q.Q}\nA) ${q.choices.A}\nB) ${q.choices.B}\nC) ${q.choices.C}\nD) ${q.choices.D}\n\nI chose ${pick}. The correct answer is ${q.ANSWER}. ${ok ? 'I got it right but I want to be sure I understand why.' : 'Help me see where my thinking went wrong.'}`);
    };
  }
  function finish() {
    const score = results.filter(Boolean).length;
    if (dayIdx != null && S.plan) { S.done[dayIdx] = true; S.xp += 20; earned += 20; }
    save();
    const line = score === N ? 'Flawless.' : score >= 3 ? 'Solid. We fix the misses next.' : 'Tough set. Now we know where to work.';
    shell(`<div class="result"><img src="${pic(score >= 3 ? 'cheer' : 'care')}" alt=""><div class="score">${score}/${N}</div><h2>${esc(topic)}</h2>
      <p class="muted">${line}</p>
      <div class="stats"><div class="pill xp">${ico('xp')} <b>+${earned}</b> XP</div><div class="pill fire">${ico('streak')} <b>${S.streak}</b></div>${dayIdx != null ? '<div class="pill">Plan day done</div>' : ''}</div>
      <div class="stats" style="margin-top:10px"><button class="btn ghost" id="again">Again</button><button class="btn go big" id="homeb">Home</button></div></div>`);
    if (score >= 3) confetti();
    $('#again').onclick = () => practice(topic, dayIdx); $('#homeb').onclick = home;
  }
  load();
}


/* ---------- question generator (shared by practice and mock exam) ---------- */
function genQ(topic, level, asked = []) {
  const p = S.profile;
  const attempt = () => ask(`You write practice questions for a study app. Be mathematically exact: solve the question yourself and make sure exactly one choice is correct.`,
    [{ role: 'user', content: `Write ONE multiple-choice question for a ${p.level} student. Subject: ${p.subject}. Topic: ${topic}. Difficulty ${level} of 3.
It must be answerable in under two minutes with at most a few lines of working. Wrong choices should each come from a specific common mistake. Each choice is only a short final answer (a number or one expression, no explanation), and all four must be different. Vary which letter is correct.
Write math in LaTeX with $...$. Do not repeat these earlier questions: ${asked.join(' | ') || 'none'}.
Output exactly this format and nothing else:
TOPIC: <2-4 word sub-topic>
Q: <the question>
A) <choice>
B) <choice>
C) <choice>
D) <choice>
ANSWER: <letter>
HINT: <one nudge that does not reveal the answer, max 15 words>
WHY: <the key reasoning in at most 30 words>` }], 3000).then(parseQ);
  return attempt().catch(attempt); // one retry if the format or the choices are bad
}

/* ---------- timed mock exam ---------- */
function mock() {
  const p = S.profile, t = T(), N = 5, SECS = 360;
  const wrap = inner => { app.innerHTML = `<div class="prac t-${p.tutor}">${inner}</div>`; };
  wrap(`<div class="p-top"><button class="x" id="close">${svg('x')}</button><div class="segs"></div></div>
    <div class="result"><img src="${pic('')}" alt=""><h1>Mock exam</h1>
    <p class="muted">${N} questions · ${SECS / 60} minutes · no hints</p>
    <button class="btn go big" id="start">Start</button></div>`);
  $('#close').onclick = home;
  $('#start').onclick = async () => {
    wrap(`<div class="load"><img src="${pic('')}" alt=""><h3>Writing your exam…</h3></div>`);
    const pool = [...new Set([...weakTopics().filter(w => SUBJECTS[p.subject].includes(w)), ...SUBJECTS[p.subject].slice().sort(() => Math.random() - .5)])].slice(0, N);
    const got = await Promise.allSettled(pool.map(tp => genQ(tp, 2).then(q => ({ ...q, main: tp }))));
    const qs = got.filter(g => g.status === 'fulfilled').map(g => g.value);
    if (qs.length < 3) { wrap(`<div class="load"><h3>The exam failed to load.</h3><button class="btn" id="b">Back home</button></div>`); $('#b').onclick = home; return; }
    run(qs);
  };
  function run(qs) {
    const picks = qs.map(() => null); let i = 0, left = SECS, timer;
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const draw = () => {
      const q = qs[i];
      wrap(`<div class="p-top"><button class="x" id="close">${svg('x')}</button>
        <div class="segs">${qs.map((_, k) => `<i data-k="${k}" class="${k === i ? 'cur' : picks[k] ? 'ans' : ''}" style="cursor:pointer"></i>`).join('')}</div>
        <div class="pill clock ${left <= 60 ? 'low' : ''}" id="clock">${svg('clock')} <b>${fmt(left)}</b></div></div>
        <span class="tag">Question ${i + 1} of ${qs.length} · ${esc(q.main)}</span><div class="q">${rich(q.Q)}</div>
        <div class="choices">${'ABCD'.split('').map(k => `<button class="choice ${picks[i] === k ? 'on' : ''}" data-k="${k}"><span class="k">${k}</span><span>${rich(q.choices[k])}</span></button>`).join('')}</div>
        <div class="p-foot"><div class="in"><button class="btn ghost" id="prev" ${i ? '' : 'disabled'}>Back</button>
          ${i < qs.length - 1 ? '<button class="btn big" id="next">Next</button>' : '<button class="btn go big" id="submit">Hand in</button>'}</div></div>`);
      $('#close').onclick = () => { if (confirm('Leave the exam?')) { clearInterval(timer); home(); } };
      $$('.choice').forEach(c => c.onclick = () => { picks[i] = c.dataset.k; $$('.choice').forEach(x => x.classList.toggle('on', x === c)); });
      $$('.segs i').forEach(s => s.onclick = () => { i = +s.dataset.k; draw(); });
      if ($('#prev')) $('#prev').onclick = () => { i--; draw(); };
      if ($('#next')) $('#next').onclick = () => { i++; draw(); };
      if ($('#submit')) $('#submit').onclick = () => { const blank = picks.filter(x => !x).length; if (!blank || confirm(`${blank} unanswered. Hand in anyway?`)) done(); };
    };
    const done = () => { clearInterval(timer); review(qs, picks, SECS - left); };
    timer = setInterval(() => {
      left--; const c = $('#clock'); if (!c) return void clearInterval(timer);
      c.querySelector('b').textContent = fmt(left); c.classList.toggle('low', left <= 60);
      if (left <= 0) done();
    }, 1000);
    draw();
  }
  function review(qs, picks, used) {
    const oks = qs.map((q, k) => picks[k] === q.ANSWER), score = oks.filter(Boolean).length;
    qs.forEach((q, k) => track(q.main, oks[k]));
    S.xp += score * 10;
    const missed = qs.filter((_, k) => !oks[k]).map(q => q.main);
    S.memory.notes = [`Mock exam: ${score}/${qs.length} in ${Math.round(used / 60)} min${missed.length ? `; lost marks on ${missed.join(', ')}` : '; no mistakes'}.`, ...S.memory.notes].slice(0, 10);
    save();
    wrap(`<div class="p-top"><button class="x" id="close">${svg('x')}</button><div class="segs">${oks.map(o => `<i class="${o ? 'ok' : 'no'}"></i>`).join('')}</div><div class="pill xp">${ico('xp')} <b>+${score * 10}</b></div></div>
      <div class="result" style="padding-top:0"><img src="${pic(score >= 3 ? 'cheer' : 'care')}" alt=""><div class="score">${score}/${qs.length}</div>
        <p class="muted">${Math.floor(used / 60)} min ${used % 60} s</p></div>
      <div class="hint" style="margin:0 0 26px"><img src="${pic(score >= 3 ? '' : 'care')}" alt=""><div id="rev"><span class="dots"><i></i><i></i><i></i></span></div></div>
      <div class="sec">Review</div>
      <div class="path">${qs.map((q, k) => `<div class="rv ${oks[k] ? 'ok' : 'no'}"><div class="rv-h"><span class="n">${oks[k] ? svg('check') : svg('x')}</span><b>${esc(q.main)}</b>
        <span class="muted">${picks[k] ? `You chose ${picks[k]}` : 'No answer'} · correct: ${q.ANSWER}</span></div>
        <div class="rv-q">${rich(q.Q)}</div><p class="rv-w">${rich(q.WHY || '')}</p>
        ${oks[k] ? '' : `<button class="btn ghost" data-why="${k}">Work through it</button>`}</div>`).join('')}</div>
      <div class="stats" style="margin-top:26px">${missed.length ? `<button class="btn go big" id="fix">Practise ${esc(missed[0])}</button>` : ''}<button class="btn ghost" id="homeb">Home</button></div>`);
    if (score >= 3) confetti();
    window.scrollTo(0, 0);
    $('#close').onclick = home; $('#homeb').onclick = home;
    if ($('#fix')) $('#fix').onclick = () => practice(missed[0]);
    $$('[data-why]').forEach(b => b.onclick = () => { const q = qs[+b.dataset.why], k = +b.dataset.why;
      session('why', `In a timed mock exam I got this question wrong.\n\nQuestion: ${q.Q}\nA) ${q.choices.A}\nB) ${q.choices.B}\nC) ${q.choices.C}\nD) ${q.choices.D}\n\nI chose ${picks[k] || 'nothing (ran out of time)'}. The correct answer is ${q.ANSWER}. Help me see where my thinking went wrong.`); });
    stream(`You are ${t.name}, an AI study coach. Personality: ${t.style} Give ${p.name} a debrief of their timed mock exam in under 35 words: the result in a few words, the one thing to fix first, and one next step. Plain text, no LaTeX, no lists. If time ran out or questions were blank, address pacing.`,
      [{ role: 'user', content: `Result ${score}/${qs.length}. Time used ${used}s of ${SECS}s.\n` + qs.map((q, k) => `${q.main}: ${oks[k] ? 'correct' : picks[k] ? 'wrong' : 'left blank'}`).join('\n') }],
      txt => { const el = $('#rev'); if (el) el.innerHTML = rich(txt); }).catch(() => { const el = $('#rev'); if (el) el.textContent = 'Start with the ones you missed.'; });
  }
}

/* ---------- landing page ---------- */
function landing() {
  const start = () => S.profile ? home() : onboarding();
  const feats = [
    ['var(--purple-s)', 'solve', 'Solve together', 'One hint at a time.'],
    ['var(--coral-s)', 'comeback', 'Comeback plan', 'Five days, aimed at lost marks.'],
    ['var(--green-s)', 'voice', 'Voice mode', 'Think out loud. It answers.'],
    ['var(--yellow-s)', 'mock', 'Mock exam', '5 questions. 6 minutes.'],
    ['#E6F1FF', 'memory', 'Memory', 'Knows your weak spots.'],
    ['#F3F1EA', 'practice', 'Practice', 'Adapts as you answer.'],
  ];
  app.innerHTML = `<div class="land">
    <header class="l-nav"><div class="logo"><i>λ</i>Lemma</div><div class="sp"></div><button class="btn" data-start>${S.profile ? 'Open app' : 'Start free'}</button></header>
    <section class="l-hero"><div>
        <span class="tag">University math & science</span>
        <h1>Bad exam? Come back stronger.</h1>
        <p class="l-sub">An AI tutor that solves with you, not for you.</p>
        <div class="l-cta"><button class="btn go big" data-start>Start free</button><span class="muted">No sign-up</span></div></div>
      <div class="l-art"><div class="l-blob"></div><img class="m1" src="/img/nova-care.webp" alt="Nova, a round green mascot"><img class="m2" src="/img/max-cheer.webp" alt="Max, a purple cube mascot"><img class="m3" src="/img/ada.webp" alt="Ada, a yellow triangle mascot">
        <div class="l-b b1">I failed calculus.</div><div class="l-b b2">Let's find the lost marks.</div></div>
    </section>
    <section class="l-sec"><div class="l-grid">${feats.map(f => `<div class="l-card" style="background:${f[0]}">${ico(f[1], 'big')}<h3>${f[2]}</h3><p>${f[3]}</p></div>`).join('')}</div></section>
    <section class="l-sec"><h2>Pick your tutor</h2>
      <div class="tutors">${Object.entries(TUTORS).map(([k, t]) => `<div class="tutor t-${k}"><img src="${t.img}" alt=""><div><b>${t.name}</b><span>${t.blurb}</span><em>${t.tag}</em></div></div>`).join('')}</div></section>
    <section class="l-end"><img src="/img/nova-cheer.webp" alt=""><h2>Next exam, different result.</h2><button class="btn go big" data-start>Start free</button></section>
    <footer class="l-foot">Lemma is an AI, not a human tutor or a mental-health service. For adults 18+.</footer>
  </div>`;
  $$('[data-start]').forEach(b => b.onclick = start);
  window.scrollTo(0, 0);
}

/* ---------- boot ---------- */
S.profile ? home() : landing();
