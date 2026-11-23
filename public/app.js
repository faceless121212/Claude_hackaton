/* Solva — AI study companion for math & STEM. Vanilla JS, no build step. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = document.getElementById('app');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- icons: small controls are line icons, everything illustrative is generated art in /img ---------- */
const svg = d => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC = {
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  send: svg('<path d="M12 19V5M5 12l7-7 7 7"/>'),
  cam: svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
  mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>'),
  wave: svg('<path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4"/>'),
  clock: svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>'),
  check: svg('<path d="M5 12l5 5 9-10"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
};
const art = (name, cls = '', alt = '') => `<img class="${cls}" src="/img/${name}.webp" alt="${esc(alt)}">`;

/* ---------- data ---------- */
const TUTORS = {
  nova: { name: 'Nova', tag: 'After a bad exam', blurb: 'Warm and patient',
    hi: "Hi, I'm Nova. Rough exam, or stuck on something?", tries: ['I failed my midterm', "I'm behind in calculus"],
    style: 'Warm, calm and patient. You notice effort and name it. You never rush. Gentle humour.' },
  max: { name: 'Max', tag: 'For "why?" questions', blurb: 'Playful analogies',
    hi: "Hey, I'm Max. Ask me why anything works.", tries: ['Why is 0! equal to 1?', 'What is a derivative, really?'],
    style: 'Playful and curious. You explain with vivid everyday analogies (pizza, skateboards, video games) before the formal version. Enthusiastic but never childish.' },
  ada: { name: 'Ada', tag: 'For exam drills', blurb: 'Direct exam coach',
    hi: "I'm Ada. Bring a problem, or ask for a quiz.", tries: ['Quiz me on integrals', 'Is the derivative of x² sin x equal to 2x cos x?'],
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
const SUBJ_IMG = { 'Math': 'i-math', 'Physics': 'i-physics', 'Chemistry': 'i-chemistry', 'Statistics': 'i-statistics', 'Computer Science': 'i-cs' };
const SITUATIONS = {
  failed: { img: 's-comeback', t: 'I failed an exam', d: 'Get a comeback plan' },
  exam: { img: 's-mock', t: 'Exam coming up', d: 'Drill weak spots' },
  homework: { img: 's-solve', t: 'Homework', d: 'Get unstuck' },
};
const GUEST = { name: 'there', level: 'University', subject: 'math and science' };

/* ---------- state ---------- */
const S = Object.assign({ profile: null, xp: 0, streak: 0, lastDay: null, plan: null, done: {}, memory: { notes: [], topics: {} } },
  JSON.parse(localStorage.getItem('solva') || localStorage.getItem('lemma') || 'null') || {}); // 'lemma' is the key from before the rename
S.memory = S.memory || { notes: [], topics: {} };
const save = () => localStorage.setItem('solva', JSON.stringify(S));
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
    return esc(p).replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])\*([^*\s][^*\n]*?)\*(?=[\s.,!?;:)]|$)/g, '$1<i>$2</i>').replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
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
  if (!full) throw new Error('No reply came back.');
  return full;
}
function persona(mode, voice, tutor) {
  const p = S.profile || GUEST, t = TUTORS[tutor || S.profile?.tutor || 'nova'];
  const modes = {
    demo: 'MODE: first contact on the landing page. The visitor is trying you out before signing up. Help with whatever study problem or exam worry they bring, in your own style. If they only say hello, ask what they are studying or stuck on.',
    solve: 'MODE: solving a problem the student brings (typed or as a photo). First make sure you understand the problem, then guide.',
    comeback: `MODE: the student failed or did badly on an exam. Order of work: (1) acknowledge the feeling in one or two honest sentences, no toxic positivity, no lecture; (2) ask ONE question at a time to learn what happened: which exam, which questions went wrong, whether it was knowledge gaps, time pressure, panic or careless slips, and when the retake or next exam is; (3) after two or three exchanges, tell them you have enough to build a comeback plan and that they can press the green "Build my comeback plan" button.`,
    why: 'MODE: the student just answered a practice question and wants to understand it. Find the misconception with a question before explaining.',
  };
  return `You are ${t.name}, an AI study companion for math and STEM inside the web app Solva. You are an AI, not a human, and you say so plainly if asked.
PERSONALITY: ${t.style}
STUDENT: ${mode === 'demo' ? 'a first-time visitor. You do not know their name or course yet.' : `${p.name}, ${p.level}, studying ${p.subject}.`}
${mode === 'demo' ? '' : memoryBlock()}
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
  return `<div class="nav"><div class="logo"><img src="/img/logo.webp" alt="">Solva</div><div class="sp"></div>
    <a class="pill courses" href="#/courses">${art('i-books', 'pi')} <b>Courses</b></a>
    <div class="pill fire" title="Day streak">${art('i-flame', 'pi', 'Streak')} <b>${S.streak}</b></div>
    <div class="pill xp" title="XP">${art('i-bolt', 'pi', 'XP')} <b>${S.xp}</b></div></div>`;
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
const OB = { name: '', subject: 'Math', level: 'University', situation: 'failed', tutor: 'nova' };
function onboarding(step = 0, d = { ...OB }) {
  const pct = [25, 60, 100][step];
  const body = [
    () => `<h1>Let's set you up.</h1>
      <label class="label" for="name">Your name</label>
      <input class="field" id="name" placeholder="First name" value="${esc(d.name)}" maxlength="30" autocomplete="given-name">
      <label class="label">Subject</label>
      <div class="subj" data-k="subject">${Object.keys(SUBJECTS).map(s => `<button class="sub-c ${d.subject === s ? 'on' : ''}" data-v="${s}">${art(SUBJ_IMG[s])}<b>${s}</b></button>`).join('')}</div>
      <label class="label">Level</label>
      <div class="chips" data-k="level">${['High school', 'University'].map(s => `<button class="chip ${d.level === s ? 'on' : ''}" data-v="${s}">${s}</button>`).join('')}</div>`,
    () => `<h1>What brings you here?</h1>
      <div class="opts" data-k="situation">${Object.entries(SITUATIONS).map(([k, s]) => `<button class="opt ${d.situation === k ? 'on' : ''}" data-v="${k}">
        ${art(s.img, 'ico')}<div><b>${s.t}</b></div></button>`).join('')}</div>`,
    () => `<h1>Pick your tutor.</h1>
      <div class="tutors" data-k="tutor">${Object.entries(TUTORS).map(([k, t]) => `<button class="tutor t-${k} ${d.tutor === k ? 'on' : ''}" data-v="${k}">
        <img src="${t.img}" alt=""><div><b>${t.name}</b><span>${t.blurb}</span></div></button>`).join('')}</div>`,
  ][step]();
  app.innerHTML = `<div class="ob"><div class="ob-bar"><i style="width:${pct}%"></i></div>${body}
    <div class="foot">${step ? '<button class="btn ghost" id="back">Back</button>' : '<span></span>'}
    <button class="btn go big" id="next">${step === 2 ? "Let's go" : 'Continue'}</button></div></div>`;
  window.scrollTo(0, 0);
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
const swapHtml = () => `<div class="swap" role="group" aria-label="Switch tutor">${Object.entries(TUTORS).map(([k, t]) =>
  `<button type="button" data-t="${k}" class="${k === S.profile.tutor ? 'on' : ''}" title="Talk to ${t.name}" aria-pressed="${k === S.profile.tutor}"><img src="${t.img}" alt="${t.name}"></button>`).join('')}</div>`;
function home() {
  touchStreak();
  const p = S.profile, t = T();
  const greet = S.plan ? [`Day ${Math.min(Object.keys(S.done).length + 1, S.plan.days.length)} of ${S.plan.days.length}, ${esc(p.name)}.`, esc(S.plan.pep)]
    : S.memory.notes.length ? [`Welcome back, ${esc(p.name)}.`, esc(S.memory.notes[0])]
    : p.situation === 'failed' ? [`Rough exam, ${esc(p.name)}?`, 'Tell me what happened.']
    : p.situation === 'exam' ? [`Let's get you ready, ${esc(p.name)}.`, '']
    : [`What are we cracking, ${esc(p.name)}?`, ''];
  const stat = s => { const v = S.memory.topics[s]; return v ? { pct: Math.round(v.ok / v.n * 100), txt: `${v.ok}/${v.n}` } : null; };
  const nodes = S.plan
    ? S.plan.days.map((d, i) => `<button class="node ${S.done[i] ? 'done' : ''}" data-day="${i}"><div class="n">${S.done[i] ? IC.check : d.day}</div>
        <div><b>${esc(d.focus)}</b><span>${esc(d.task)}</span></div><div class="go-t">${d.minutes || 20} min</div></button>`).join('')
    : SUBJECTS[p.subject].map((s, i) => { const st = stat(s); return `<button class="node" data-topic="${esc(s)}"><div class="n">${i + 1}</div>
        <div><b>${esc(s)}</b><div class="bar" role="img" aria-label="${st ? st.pct + '% correct' : 'Not started'}"><i style="width:${st ? st.pct : 0}%"></i></div></div><div class="go-t">${st ? st.txt : 'Start'}</div></button>`; }).join('');
  const acts = [['a-solve', 's-solve', 'Solve a problem', 'Type it or snap a photo'], ['a-prac', 's-practice', 'Quick practice', '5 questions'],
    ['a-come', 's-comeback', 'Bad exam?', 'Get a comeback plan'], ['a-mock', 's-mock', 'Mock exam', '6 minutes, no hints']];
  app.innerHTML = `<div class="wrap t-${p.tutor}">${nav()}
    <div class="hero"><div class="who"><img class="big" src="${pic(S.plan ? 'cheer' : '')}" alt="${t.name}">${swapHtml()}</div>
      <div class="say"><h2>${greet[0]}</h2>${greet[1] ? `<p>${greet[1]}</p>` : ''}
        <form class="composer h-ask" id="h-form"><div class="box"><textarea id="h-in" rows="1" placeholder="Ask ${t.name}…" aria-label="Message ${t.name}"></textarea></div>
          <button class="send" aria-label="Send">${IC.send}</button></form>
        ${S.plan ? `<div class="cta"><button class="btn go" id="h-next">Continue my plan</button></div>` : ''}</div></div>
    <div id="courses-slot"></div>
    <div class="acts">${acts.map(a => `<button class="act" id="${a[0]}">${art(a[1])}<b>${a[2]}</b></button>`).join('')}</div>
    <div id="mem-slot">${memCard()}</div>
    <div class="sec">${S.plan ? 'Your comeback plan' : `${art(SUBJ_IMG[p.subject], 'sec-i')}${esc(p.subject)} topics`}</div>
    ${S.plan ? `<div class="plan-head"><h3>${esc(S.plan.headline)}</h3><ul>${S.plan.diagnosis.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
    <div class="path ${S.plan ? '' : 'two'}">${nodes}</div>
    ${S.plan ? `<p class="center" style="margin-top:18px"><button class="linkish" id="clear-plan">Clear this plan</button></p>` : ''}
  </div>`;
  const on = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
  const chatMode = p.situation === 'failed' && !S.plan ? 'comeback' : 'solve';
  const hin = $('#h-in');
  $('#h-form').onsubmit = e => { e.preventDefault(); session(chatMode, null, hin.value); };
  hin.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); session(chatMode, null, hin.value); } };
  $$('.swap button').forEach(b => b.onclick = () => { if (b.dataset.t !== p.tutor) { p.tutor = b.dataset.t; save(); home(); } });
  on('#a-solve', () => session('solve')); on('#a-come', () => session('comeback')); on('#a-mock', mock);
  on('#a-prac', () => practice(SUBJECTS[p.subject][Math.floor(Math.random() * SUBJECTS[p.subject].length)]));
  on('#h-next', () => { const i = S.plan.days.findIndex((_, i) => !S.done[i]); const k = i < 0 ? 0 : i; practice(S.plan.days[k].focus, k); });
  on('#clear-plan', () => { S.plan = null; S.done = {}; save(); home(); });
  $$('.node').forEach(n => n.onclick = () => n.dataset.day != null ? practice(S.plan.days[+n.dataset.day].focus, +n.dataset.day) : practice(n.dataset.topic));
  $('.logo').onclick = landing;
  window.Courses?.homeCard($('#courses-slot'));
}

/* ---------- tutor session (chat) ---------- */
function session(mode, ctx, first) {
  const p = S.profile, mood = mode === 'comeback' ? 'care' : '';
  const title = () => `${{ solve: 'Solving with', comeback: 'Talking with', why: 'Understanding it with' }[mode]} ${T().name}`;
  const opener = {
    solve: `What are we solving, ${p.name}?`,
    comeback: `Hey ${p.name}. A bad exam stings, and that's okay. What happened?`,
  }[mode];
  first = (first || '').trim();
  const quick = { solve: ['Give me a hint', "I'm stuck", 'Explain it differently', 'Show the full solution'],
    comeback: ['I ran out of time', 'I blanked on everything', "I studied but it didn't stick"], why: ['Give me a hint', 'Explain it differently', 'Show the full solution'] }[mode];
  const msgs = []; // {role, content} sent to the model
  let busy = false, image = null, userTurns = 0;

  app.innerHTML = `<div class="session t-${p.tutor}">
    <div class="s-top"><button class="x" id="close" aria-label="Close">${IC.x}</button><h3>${title()}</h3>
      <button class="btn accent call-b" id="voice">${IC.wave} Voice</button></div>
    <div class="s-body"><aside class="stage"><div class="av"><img data-face src="${pic(mood)}" alt="${T().name}"></div>
        <div><div class="nm">${T().name}</div><div class="st" id="st">Listening</div></div>${swapHtml()}<div class="ai">AI, not a human</div></aside>
      <main class="chat"><div class="msgs" id="msgs" aria-live="polite"></div><div class="quick" id="quick"></div><div class="thumb" id="thumb"></div>
        <form class="composer" id="form"><div class="box"><textarea id="in" rows="1" placeholder="Message ${T().name}…" aria-label="Message ${T().name}"></textarea>
          <button type="button" class="icon" id="cam" title="Send a photo" aria-label="Send a photo">${IC.cam}</button>
          <button type="button" class="icon" id="mic" title="Dictate" aria-label="Dictate">${IC.mic}</button><input type="file" id="file" accept="image/*" hidden></div>
          <button class="send" aria-label="Send">${IC.send}</button></form></main></div>
    <div class="call" id="call" hidden><button class="x" id="call-x" aria-label="Leave voice mode">${IC.x}</button>
      <div class="call-av"><img data-face src="${pic(mood)}" alt="${T().name}"></div>
      <div class="call-cap" id="cap"></div><div class="call-you" id="you"></div>
      <button class="mic-big" id="micb" aria-label="Talk">${IC.mic}</button><div class="call-st" id="cst">Tap the mic and talk</div></div></div>`;
  const box = $('#msgs'), input = $('#in'), stage = $('.session'), st = $('#st');
  const scroll = () => box.scrollTop = box.scrollHeight;
  const bubble = (role, html) => { const el = document.createElement('div'); el.className = 'msg ' + role; el.innerHTML = html; box.appendChild(el); scroll(); return el; };
  const setTalking = on => { stage.classList.toggle('talking', on); st.textContent = on ? 'Thinking…' : 'Listening'; };
  // talk to any of the three tutors in the same conversation
  $$('.swap button').forEach(b => b.onclick = () => {
    const k = b.dataset.t; if (busy || k === p.tutor) return;
    stage.classList.replace('t-' + p.tutor, 't-' + k); p.tutor = k; save();
    $$('.swap button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    $$('[data-face]').forEach(i => { i.src = pic(mood); i.alt = T().name; });
    $('.stage .nm').textContent = T().name; $('.s-top h3').textContent = title(); input.placeholder = `Message ${T().name}…`;
    const n = document.createElement('div'); n.className = 'note'; n.textContent = `${T().name} joined`; box.appendChild(n); scroll(); input.focus();
  });
  function chips() {
    const q = $('#quick');
    q.innerHTML = (mode === 'comeback' && userTurns >= 2 ? `<button class="chip plan" data-plan>Build my comeback plan ${IC.arrow}</button>` : '') +
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
    } catch (e) { el.classList.add('err'); el.textContent = e.message + ' Try again.'; msgs.pop(); }
    busy = false; setTalking(false); chips(); if (!call) input.focus();
  }
  /* voice mode: listen -> think -> speak -> listen */
  let call = false, rec = null;
  const callState = k => { const c = $('#call'); if (!c) return; c.dataset.s = k;
    $('#cst').textContent = { idle: 'Tap the mic and talk', listening: 'Listening…', thinking: 'Thinking…', speaking: 'Tap to interrupt' }[k]; };
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
  else if (first) send(first); // typed on the home screen: go straight to the answer
  else { msgs.push({ role: 'assistant', content: opener }); bubble('a', rich(opener)); chips(); input.focus(); }
}

/* ---------- comeback plan ---------- */
async function buildPlan(msgs) {
  const p = S.profile, t = T();
  app.innerHTML = `<div class="wrap t-${p.tutor}"><div class="load"><img src="${pic('care')}" alt=""><h2>Building your comeback plan…</h2></div></div>`;
  const transcript = msgs.map(m => `${m.role === 'user' ? p.name : t.name}: ${typeof m.content === 'string' ? m.content : m.content[0].text}`).join('\n');
  try {
    const text = await ask(`You are ${t.name}, an AI study coach. From the conversation, write a comeback plan for ${p.name} (${p.level}, ${p.subject}) after a bad exam.
Return ONLY valid JSON, no code fence, no LaTeX, no backslashes:
{"headline": "specific, encouraging title (max 6 words)",
 "diagnosis": ["exactly 3 honest observations about what went wrong, kind and concrete, max 9 words each"],
 "days": [{"day": 1, "focus": "one specific topic to practise (2-4 words, usable as a quiz topic)", "task": "what to do, max 9 words, starts with a verb", "minutes": 20}],
 "pep": "one short sentence in your own voice, max 10 words"}
Give 5 days. Order days so the biggest cause of lost marks comes first. If the cause was time pressure or panic, include a timed-practice day and a day on exam technique for this subject. Base everything on what the student said; do not invent details they did not mention.`,
      [{ role: "user", content: transcript }], 2500);
    const plan = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    if (!Array.isArray(plan.days) || !plan.days.length) throw new Error('empty');
    S.plan = plan; S.done = {}; save(); remember(msgs.slice()); confetti(); home(); window.scrollTo(0, 0);
  } catch (e) {
    app.innerHTML = `<div class="wrap"><div class="load"><h2>That didn't work.</h2><p class="lead">${esc(e.message)}</p><button class="btn" id="b">Back home</button></div></div>`;
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
  if (!q.Q || Object.keys(q.choices).length !== 4 || !'ABCD'.includes(q.ANSWER) || !q.ANSWER) throw new Error('Could not read the question. Try again.');
  if (new Set(Object.values(q.choices).map(v => v.replace(/\s+/g, ''))).size < 4) throw new Error('Could not read the question. Try again.'); // two identical choices
  return q;
}
function practice(topic, dayIdx = null) {
  const p = S.profile, t = T(), N = 5;
  const results = []; const asked = []; let level = 2, next = null, earned = 0;
  const gen = () => genQ(topic, level, asked);

  const shell = inner => { app.innerHTML = `<div class="prac t-${p.tutor}"><div class="p-top"><button class="x" id="close" aria-label="Close">${IC.x}</button>
    <div class="segs">${Array.from({ length: N }, (_, i) => `<i class="${results[i] == null ? (i === results.length ? 'cur' : '') : results[i] ? 'ok' : 'no'}"></i>`).join('')}</div>
    <div class="pill xp">${art('i-bolt', 'pi', 'XP')} <b>${S.xp}</b></div></div>${inner}</div>`; $('#close').onclick = home; };

  async function load() {
    shell(`<div class="load"><img src="${t.img}" alt=""><h3>${results.length ? 'Next one…' : `${esc(topic)}…`}</h3></div>`);
    try { const q = await (next || gen()); next = null; show(q); }
    catch (e) { next = null; shell(`<div class="load"><h3>${esc(e.message)}</h3><button class="btn" id="re">Try again</button></div>`); $('#re').onclick = load; }
  }
  function show(q) {
    asked.push(q.Q.slice(0, 90)); let pick = null;
    shell(`<span class="tag">${esc(q.TOPIC || topic)} · level ${level}</span><div class="q">${rich(q.Q)}</div>
      <div class="choices" id="ch">${'ABCD'.split('').map(k => `<button class="choice" data-k="${k}"><span class="k">${k}</span><span>${rich(q.choices[k])}</span></button>`).join('')}</div>
      <div id="hint"></div>
      <div class="p-foot" id="foot"><div class="in"><button class="btn ghost" id="hintb">${art('i-bulb', 'pi')} Hint</button><button class="btn go big" id="check" disabled>Check</button></div></div>`);
    $$('.choice').forEach(c => c.onclick = () => { pick = c.dataset.k; $$('.choice').forEach(x => x.classList.toggle('on', x === c)); $('#check').disabled = false; });
    $('#hintb').onclick = () => { $('#hint').innerHTML = `<div class="hint"><img src="${t.img}" alt=""><div>${rich(q.HINT || 'Write down what you know first.')}</div></div>`; };
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
      foot.innerHTML = `<div class="in"><img class="fb-m" src="${pic(ok ? 'cheer' : 'care')}" alt=""><div class="fb"><b>${ok ? 'Correct! +10 XP' : `It's ${q.ANSWER}.`}</b><p>${rich(q.WHY || '')}</p></div>
        <div class="bs"><button class="btn ghost" id="why">Ask ${t.name} why</button><button class="btn ${ok ? 'go' : ''} big" id="cont">${results.length < N ? 'Continue' : 'Finish'}</button></div></div>`;
      $('#cont').onclick = () => results.length < N ? load() : finish();
      $('#why').onclick = () => session('why', `I just answered this practice question.\n\nQuestion: ${q.Q}\nA) ${q.choices.A}\nB) ${q.choices.B}\nC) ${q.choices.C}\nD) ${q.choices.D}\n\nI chose ${pick}. The correct answer is ${q.ANSWER}. ${ok ? 'I got it right but I want to be sure I understand why.' : 'Help me see where my thinking went wrong.'}`);
    };
  }
  function finish() {
    const score = results.filter(Boolean).length;
    if (dayIdx != null && S.plan) { S.done[dayIdx] = true; S.xp += 20; earned += 20; }
    save();
    const line = score === N ? 'Flawless.' : score >= 3 ? 'Solid. Let\'s fix the misses next.' : 'Tough set. The misses show where the marks are.';
    shell(`<div class="result"><img src="${pic(score >= 3 ? 'cheer' : 'care')}" alt=""><div class="score">${score}/${N}</div><h2>${esc(topic)}</h2>
      <p class="lead">${line}</p>
      <div class="stats"><div class="pill xp">${art('i-bolt', 'pi', 'XP')} <b>+${earned}</b></div><div class="pill fire">${art('i-flame', 'pi', 'Streak')} <b>${S.streak}</b></div>${dayIdx != null ? '<div class="pill">Plan day done</div>' : ''}</div>
      <div class="stats" style="margin-top:10px"><button class="btn ghost" id="again">Again</button><button class="btn go big" id="homeb">Done</button></div></div>`);
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
WHY: <the key reasoning in at most 25 words>` }], 3000).then(parseQ);
  return attempt().catch(attempt); // one retry if the format or the choices are bad
}

/* ---------- timed mock exam ---------- */
function mock() {
  const p = S.profile, t = T(), N = 5, SECS = 360;
  const wrap = inner => { app.innerHTML = `<div class="prac t-${p.tutor}">${inner}</div>`; };
  wrap(`<div class="p-top"><button class="x" id="close" aria-label="Close">${IC.x}</button><div class="segs"></div></div>
    <div class="result">${art('s-mock', 'pic')}<h1>${esc(p.subject)} mock exam</h1>
    <div class="stats"><div class="pill"><b>${N}</b> questions</div><div class="pill">${IC.clock} <b>${SECS / 60}</b> min</div><div class="pill">No hints</div></div>
    <button class="btn go big" id="start">Start the clock</button></div>`);
  $('#close').onclick = home;
  $('#start').onclick = async () => {
    wrap(`<div class="load"><img src="${pic('')}" alt=""><h3>Writing your exam…</h3></div>`);
    const pool = [...new Set([...weakTopics().filter(w => SUBJECTS[p.subject].includes(w)), ...SUBJECTS[p.subject].slice().sort(() => Math.random() - .5)])].slice(0, N);
    const got = await Promise.allSettled(pool.map(tp => genQ(tp, 2).then(q => ({ ...q, main: tp }))));
    const qs = got.filter(g => g.status === 'fulfilled').map(g => g.value);
    if (qs.length < 3) { wrap(`<div class="load"><h3>Could not write the exam. Try again.</h3><button class="btn" id="b">Back home</button></div>`); $('#b').onclick = home; return; }
    run(qs);
  };
  function run(qs) {
    const picks = qs.map(() => null); let i = 0, left = SECS, timer;
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const draw = () => {
      const q = qs[i];
      wrap(`<div class="p-top"><button class="x" id="close" aria-label="Close">${IC.x}</button>
        <div class="segs">${qs.map((_, k) => `<i data-k="${k}" class="${k === i ? 'cur' : picks[k] ? 'ans' : ''}" style="cursor:pointer"></i>`).join('')}</div>
        <div class="pill clock ${left <= 60 ? 'low' : ''}" id="clock">${IC.clock} <b>${fmt(left)}</b></div></div>
        <span class="tag">${i + 1}/${qs.length} · ${esc(q.main)}</span><div class="q">${rich(q.Q)}</div>
        <div class="choices">${'ABCD'.split('').map(k => `<button class="choice ${picks[i] === k ? 'on' : ''}" data-k="${k}"><span class="k">${k}</span><span>${rich(q.choices[k])}</span></button>`).join('')}</div>
        <div class="p-foot"><div class="in"><button class="btn ghost" id="prev" ${i ? '' : 'disabled'}>Back</button>
          ${i < qs.length - 1 ? '<button class="btn big" id="next">Next</button>' : '<button class="btn go big" id="submit">Hand in</button>'}</div></div>`);
      $('#close').onclick = () => { if (confirm('Leave the exam? Your answers will be lost.')) { clearInterval(timer); home(); } };
      $$('.choice').forEach(c => c.onclick = () => { picks[i] = c.dataset.k; $$('.choice').forEach(x => x.classList.toggle('on', x === c)); });
      $$('.segs i').forEach(s => s.onclick = () => { i = +s.dataset.k; draw(); });
      if ($('#prev')) $('#prev').onclick = () => { i--; draw(); };
      if ($('#next')) $('#next').onclick = () => { i++; draw(); };
      if ($('#submit')) $('#submit').onclick = () => { const blank = picks.filter(x => !x).length; if (!blank || confirm(`${blank} question${blank > 1 ? 's are' : ' is'} unanswered. Hand in anyway?`)) done(); };
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
    wrap(`<div class="p-top"><button class="x" id="close" aria-label="Close">${IC.x}</button><div class="segs">${oks.map(o => `<i class="${o ? 'ok' : 'no'}"></i>`).join('')}</div><div class="pill xp">${art('i-bolt', 'pi', 'XP')} <b>+${score * 10}</b></div></div>
      <div class="result" style="padding-top:0"><img src="${pic(score >= 3 ? 'cheer' : 'care')}" alt=""><div class="score">${score}/${qs.length}</div>
        <div class="stats"><div class="pill">${IC.clock} <b>${Math.floor(used / 60)}:${String(used % 60).padStart(2, '0')}</b> of ${SECS / 60}:00</div></div></div>
      <div class="hint" style="margin:0 0 26px"><img src="${pic(score >= 3 ? '' : 'care')}" alt=""><div id="rev"><span class="dots"><i></i><i></i><i></i></span></div></div>
      <div class="sec">Question by question</div>
      <div class="path">${qs.map((q, k) => `<div class="rv ${oks[k] ? 'ok' : 'no'}"><div class="rv-h"><span class="n">${oks[k] ? IC.check : IC.x}</span><b>${esc(q.main)}</b>
        <span>${picks[k] ? `You: ${picks[k]}` : 'Blank'} · Answer: ${q.ANSWER}</span></div>
        <div class="rv-q">${rich(q.Q)}</div><p class="rv-w">${rich(q.WHY || '')}</p>
        ${oks[k] ? '' : `<button class="btn ghost" data-why="${k}">Ask ${t.name} why</button>`}</div>`).join('')}</div>
      <div class="stats" style="margin-top:26px">${missed.length ? `<button class="btn go big" id="fix">Practise ${esc(missed[0])}</button>` : ''}<button class="btn ghost" id="homeb">Done</button></div>`);
    if (score >= 3) confetti();
    window.scrollTo(0, 0);
    $('#close').onclick = home; $('#homeb').onclick = home;
    if ($('#fix')) $('#fix').onclick = () => practice(missed[0]);
    $$('[data-why]').forEach(b => b.onclick = () => { const q = qs[+b.dataset.why], k = +b.dataset.why;
      session('why', `In a timed mock exam I got this question wrong.\n\nQuestion: ${q.Q}\nA) ${q.choices.A}\nB) ${q.choices.B}\nC) ${q.choices.C}\nD) ${q.choices.D}\n\nI chose ${picks[k] || 'nothing (ran out of time)'}. The correct answer is ${q.ANSWER}. Help me see where my thinking went wrong.`); });
    stream(`You are ${t.name}, an AI study coach. Personality: ${t.style} Give ${p.name} a debrief of their timed mock exam in under 35 words: one honest sentence on the result, then the single most valuable thing to fix first and why, then one concrete next step. Plain text, no LaTeX, no lists. If time ran out or questions were blank, address pacing.`,
      [{ role: 'user', content: `Result ${score}/${qs.length}. Time used ${used}s of ${SECS}s.\n` + qs.map((q, k) => `${q.main}: ${oks[k] ? 'correct' : picks[k] ? 'wrong' : 'left blank'}`).join('\n') }],
      txt => { const el = $('#rev'); if (el) el.innerHTML = rich(txt); }).catch(() => { const el = $('#rev'); if (el) el.textContent = 'Review the questions below, starting with the ones you missed.'; });
  }
}

/* ---------- talk to each tutor (live chat used on the landing page, no sign-up) ---------- */
function talk(root, begin) {
  const LIMIT = 6; // free messages per tutor before we ask the visitor to start
  const threads = { nova: [], max: [], ada: [] };
  let cur = 'nova', busy = false;
  root.innerHTML = `<div class="talk">
    <div class="talk-tabs" role="tablist" aria-label="Choose a tutor">${Object.entries(TUTORS).map(([k, t]) =>
      `<button type="button" class="talk-tab t-${k}" role="tab" data-t="${k}"><img src="${t.img}" alt=""><span><b>${t.name}</b><em>${t.tag}</em></span></button>`).join('')}</div>
    <div class="msgs" aria-live="polite"></div><div class="quick"></div>
    <form class="composer"><div class="box"><textarea rows="1"></textarea></div><button class="send" aria-label="Send">${IC.send}</button></form>
  </div>`;
  const wrap = $('.talk', root), box = $('.msgs', root), quick = $('.quick', root), input = $('textarea', root);
  const scroll = () => box.scrollTop = box.scrollHeight;
  const bubble = (role, html) => { const el = document.createElement('div'); el.className = 'msg ' + role; el.innerHTML = html; box.appendChild(el); scroll(); return el; };
  const turns = () => threads[cur].filter(m => m.role === 'user').length;
  function chips() {
    const t = TUTORS[cur], n = turns();
    quick.innerHTML = n === 0 ? t.tries.map(x => `<button type="button" class="chip">${esc(x)}</button>`).join('')
      : n >= 2 ? `<button type="button" class="chip plan" data-go>Keep going with ${t.name} ${IC.arrow}</button>` : '';
    $$('.chip', quick).forEach(c => c.onclick = () => c.dataset.go != null ? begin(cur) : send(c.textContent));
  }
  function draw() {
    const t = TUTORS[cur];
    wrap.className = 'talk t-' + cur;
    $$('.talk-tab', root).forEach(b => { const on = b.dataset.t === cur; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    box.innerHTML = `<div class="hello"><img src="${t.img}" alt="${t.name}"><div class="msg a">${esc(t.hi)}</div></div>`;
    threads[cur].forEach(m => bubble(m.role === 'user' ? 'u' : 'a', rich(m.content)));
    input.placeholder = `Message ${t.name}…`; input.setAttribute('aria-label', `Message ${t.name}`);
    chips();
  }
  async function send(text) {
    text = (text || '').trim();
    if (busy || !text) return;
    const who = cur, th = threads[who];
    if (turns() >= LIMIT) return begin(who);
    bubble('u', rich(text)); th.push({ role: 'user', content: text });
    input.value = ''; input.style.height = 'auto'; quick.innerHTML = '';
    busy = true; wrap.classList.add('busy');
    const el = bubble('a', '<span class="dots"><i></i><i></i><i></i></span>');
    try {
      const full = await stream(persona('demo', false, who), th, txt => { el.innerHTML = rich(txt); scroll(); });
      th.push({ role: 'assistant', content: full });
    } catch (e) { el.classList.add('err'); el.textContent = e.message + ' Try again.'; th.pop(); }
    busy = false; wrap.classList.remove('busy'); chips();
  }
  $$('.talk-tab', root).forEach(b => b.onclick = () => { if (!busy && b.dataset.t !== cur) { cur = b.dataset.t; draw(); input.focus({ preventScroll: true }); } });
  $('form', root).onsubmit = e => { e.preventDefault(); send(input.value); };
  input.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } };
  input.oninput = () => { input.style.height = 'auto'; input.style.height = input.scrollHeight + 'px'; };
  draw();
  return { ask(tutor, text) { if (busy) return; cur = tutor; draw(); root.scrollIntoView({ behavior: 'smooth', block: 'center' }); send(text); } };
}

/* ---------- landing page ---------- */
function landing() {
  const start = tutor => S.profile ? (tutor && (S.profile.tutor = tutor, save()), home()) : onboarding(0, { ...OB, tutor: tutor || OB.tutor });
  const feats = [['s-solve', 'Solve together', 'Type it or snap a photo'], ['s-comeback', 'Bad-exam comeback', 'A five-day plan'], ['s-voice', 'Voice mode', 'Talk it out loud'],
    ['s-mock', 'Mock exam', '5 questions, 6 minutes'], ['s-memory', 'Memory', 'Knows your weak spots'], ['s-practice', 'Adaptive practice', 'Harder as you improve']];
  const Q = { q: 'Differentiate $f(x)=x^2\\sin x$', c: { A: '$2x\\cos x$', B: '$2x\\sin x+x^2\\cos x$', C: '$x^2\\cos x$', D: '$2x\\sin x-x^2\\cos x$' }, a: 'B', why: "Product rule: $(uv)'=u'v+uv'$" };
  const plan = [['Chain rule', 20, 1], ['Integration by parts', 25, 1], ['Timed set', 20, 0], ['Exam technique', 15, 0], ['Full mock', 30, 0]];
  app.innerHTML = `<div class="land">
    <header class="l-nav"><div class="logo"><img src="/img/logo.webp" alt="">Solva</div><div class="sp"></div>
      <a class="pill courses" href="#/courses">${art('i-books', 'pi')} <b>Courses</b></a><button class="btn" data-start>${S.profile ? 'Open app' : 'Start free'}</button></header>
    <section class="l-hero"><div>
        <h1>Bad exam? Talk it through.</h1>
        <p class="l-sub">AI tutors for math and science. Hints first, answers last.</p>
        <div class="l-cta"><button class="btn go big" data-start>Start free</button></div>
        <div class="l-subj">${Object.keys(SUBJECTS).map(k => `<span>${art(SUBJ_IMG[k])}${k}</span>`).join('')}</div></div>
      <div id="talk"></div>
    </section>
    <section class="l-sec"><h2>What you get</h2>
      <div class="l-grid">${feats.map(f => `<button class="l-card" data-start>${art(f[0])}<b>${f[1]}</b><span>${f[2]}</span></button>`).join('')}</div></section>
    <section class="l-sec"><h2>Try one</h2>
      <div class="l-demo">
        <div class="l-q t-ada"><span class="tag">Derivatives</span><div class="q">${rich(Q.q)}</div>
          <div class="choices" id="dq">${'ABCD'.split('').map(k => `<button class="choice" data-k="${k}"><span class="k">${k}</span><span>${rich(Q.c[k])}</span></button>`).join('')}</div>
          <div id="dq-fb"></div></div>
        <div class="l-plan"><span class="tag">Sample comeback plan</span><h3>Calculus retake in 5 days</h3>
          <div class="path">${plan.map((d, i) => `<div class="node mini ${d[2] ? 'done' : ''}"><div class="n">${d[2] ? IC.check : i + 1}</div><b>${d[0]}</b><div class="go-t">${d[1]} min</div></div>`).join('')}</div></div>
      </div></section>
    <section class="l-sec" id="l-courses" hidden><h2>Courses</h2><div class="l-courses"></div></section>
    <section class="l-end">${art('nova-cheer')}<h2>Your next exam can go differently.</h2><button class="btn go big" data-start>Start free</button></section>
    <footer class="l-foot">Solva is an AI, not a human tutor or a mental-health service. 18+.</footer>
  </div>`;
  $$('[data-start]').forEach(b => b.onclick = () => start());
  $('.logo').onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const chat = talk($('#talk'), start);
  // sample question: answer it right here, then ask Ada why
  $$('#dq .choice').forEach(c => c.onclick = () => {
    const ok = c.dataset.k === Q.a;
    $('#dq').classList.add('locked');
    $$('#dq .choice').forEach(x => x.classList.add(x.dataset.k === Q.a ? 'ok' : x === c ? 'no' : 'off'));
    $('#dq-fb').innerHTML = `<div class="hint"><img src="/img/ada-${ok ? 'cheer' : 'care'}.webp" alt="Ada"><div><b>${ok ? 'Correct.' : `It's ${Q.a}.`}</b> ${rich(Q.why)}
      <button class="linkish" id="dq-why">Ask Ada why</button></div></div>`;
    $('#dq-why').onclick = () => chat.ask('ada', `Why is the derivative of x² sin x equal to 2x sin x + x² cos x? I ${ok ? 'got it right but want to be sure' : 'picked ' + Q.c[c.dataset.k].replace(/\$/g, '')}.`);
  });
  // courses come from the courses module, which loads after this script
  (function fill(tries) {
    const list = window.Courses?.courses, sec = $('#l-courses');
    if (!sec) return;
    if (!list) return void (tries && setTimeout(() => fill(tries - 1), 250));
    $('.l-courses', sec).innerHTML = list.map(c => `<a class="l-course" href="#/course/${c.id}" style="--c:${c.color}"><span class="c-art">${c.icon}</span><b>${esc(c.title)}</b>
      <small>${c.levels.reduce((n, l) => n + l.lessons.length, 0)} lessons</small></a>`).join('');
    sec.hidden = false;
  })(24);
  window.scrollTo(0, 0);
}

/* ---------- bridge for the courses + levels module (public/courses/) ---------- */
window.Solva = { S, save, touchStreak, nav, home, landing, T, pic, confetti };

/* ---------- boot ---------- */
S.profile ? home() : landing();
