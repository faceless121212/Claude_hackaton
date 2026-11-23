// "Explain it back" (screen at #/explain/:course/:levelIndex).
// After finishing a level the learner explains it aloud to their tutor, as if teaching a friend.
// The tutor listens (window.Voice), Claude judges the understanding, and the tutor answers in its own voice.
import * as progress from './progress.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PASS = 70;

/** Everything the level taught, as plain text for the grader. */
function reference(level) {
  return level.lessons.map((lesson) => `## ${lesson.title}\n${lesson.steps.map((s) => (s.type === 'info'
    ? `${s.title}: ${s.body}`
    : `Q: ${s.prompt}\nA: ${s.type === 'choice' ? s.options[s.answer] : s.answer}. ${s.explain ?? ''}`)).join('\n')}`).join('\n\n');
}

async function grade(course, level, text) {
  const tutor = window.Lemma.T();
  const system = `You are ${tutor.name}, an AI tutor. Personality: ${tutor.style}
A student just finished a course level and is explaining it back in their own words. It was spoken aloud and transcribed, so ignore transcription glitches, filler words and grammar. Judge understanding, not polish. Be specific, kind and honest: never praise something they did not say.
Return ONLY a JSON object, no other text:
{"score": <0-100>, "headline": "<at most 5 words>", "nailed": ["<up to 3 short points they got right>"], "missing": ["<up to 3 key ideas left out or wrong>"], "fix": "<one sentence: the single most useful correction or addition>", "say": "<2 short sentences spoken to the student in your voice: react to what they said, then give one pointer. Plain words, no symbols.>"}
Scoring: the student has about 30 seconds, so they cannot cover everything. Score whether what they said shows real understanding of the level's central idea, not how much of the level they recited. 80+ means the central idea is right with a reason or an example. 70-79 means the central idea is right but thin. 40-69 means vague or partly wrong. Below 40 means mostly missing or wrong. An empty or off-topic answer scores under 20. Parts of the level they simply did not mention go in "missing" but do not pull a correct explanation below 70.`;
  const user = `Course: ${course.title}\nLevel: ${level.title} — ${level.summary}\n\nWhat the level taught:\n${reference(level)}\n\nThe student's explanation:\n"""${text}"""`;
  const raw = await window.Lemma.ask(system, [{ role: 'user', content: user }], 700);
  const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
  const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).slice(0, 3) : []);
  return {
    score: Math.max(0, Math.min(100, Math.round(Number(json.score) || 0))),
    headline: String(json.headline || 'Here is my take'),
    nailed: list(json.nailed), missing: list(json.missing),
    fix: String(json.fix || ''), say: String(json.say || ''),
  };
}

export function renderExplain(root, course, levelIndex) {
  const level = course?.levels[levelIndex];
  const status = level && progress.courseProgress(course).levels[levelIndex].status;
  if (!level || status !== 'done') { location.hash = course ? `#/course/${course.id}` : '#/courses'; return; }

  const Voice = window.Voice;
  const lemma = window.Lemma;
  const tutorId = lemma.S.profile?.tutor || 'nova';
  const tutor = lemma.T();
  const ask = `Teach me! Explain "${level.title}" in your own words, as if I were a friend who has never heard of it. Say what it is, why it matters, and give one example.`;
  let mouth = () => {};
  let alive = true;
  const here = () => alive && root.isConnected && location.hash.startsWith('#/explain/');
  const leave = () => { alive = false; Voice.stop(); Voice.cancelListening(); };
  window.addEventListener('hashchange', leave, { once: true });

  function shell(mood, bubble, body) {
    root.innerHTML = `
      <div class="lesson explain" style="--c:${course.color}">
        <div class="lesson-top">
          <a class="close" href="#/course/${course.id}" aria-label="Close">✕</a>
          <small class="lesson-title">Explain it back · Level ${levelIndex + 1}: ${esc(level.title)}</small>
        </div>
        <div class="ex-main">
          <div class="ex-av" id="av">${Voice.mascot(tutorId, mood)}</div>
          <div class="ex-bubble" id="bubble">${bubble}</div>
          <div class="ex-stage" id="stage">${body}</div>
        </div>
      </div>`;
    if (mood) root.querySelector('.m-talk')?.remove(); // the talk frame only matches the neutral pose
    mouth = Voice.animator(root.querySelector('.mascot'));
  }
  const $ = (sel) => root.querySelector(sel);
  const say = (text) => Voice.speak(text, { tutor: tutorId, onLevel: (v) => mouth(v) });

  function intro(note = '') {
    shell('', esc(ask), `
      ${note ? `<p class="ex-note">${esc(note)}</p>` : ''}
      <div class="ex-actions">
        <button class="btn btn-primary" id="talk">🎙 Start explaining</button>
        <button class="btn btn-ghost" id="type">Type instead</button>
      </div>
      <small>About 30 seconds is plenty. ${esc(tutor.name)} is an AI and listens only while the mic is on.</small>`);
    $('#talk').onclick = () => { Voice.unlock(); record(); };
    $('#type').onclick = typed;
    Voice.ready.then(() => { if (here() && !Voice.canListen && $('#talk')) { $('#talk').remove(); $('#type').className = 'btn btn-primary'; } });
    if (!note) say(ask);
  }

  async function record() {
    Voice.stop();
    shell('', esc(ask), `
      <div class="ex-rec"><span class="ex-dot"></span><b id="rec-label">Listening…</b><span id="rec-time">0:00</span></div>
      <p class="ex-live" id="live"></p>
      <div class="ex-actions"><button class="btn btn-primary" id="done">I'm done</button><button class="btn btn-ghost" id="cancel">Cancel</button></div>`);
    const t0 = Date.now();
    const timer = setInterval(() => {
      const el = $('#rec-time');
      if (!el) return clearInterval(timer);
      const s = Math.floor((Date.now() - t0) / 1000);
      el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }, 500);
    $('#done').onclick = () => Voice.finishListening();
    $('#cancel').onclick = () => { Voice.cancelListening(); intro('No problem. Start again whenever you are ready.'); };
    let text = '';
    try {
      text = await Voice.listen({
        long: true, silenceMs: 2600, waitMs: 12000, maxMs: 90000,
        onLevel: (v) => $('#av')?.style.setProperty('--mic', v),
        onInterim: (t) => { const el = $('#live'); if (el) el.textContent = t; },
        onState: (k) => { if (k === 'transcribing' && $('#rec-label')) { $('#rec-label').textContent = 'Writing down what you said…'; $('.ex-rec').classList.add('busy'); } },
      });
    } catch (e) {
      clearInterval(timer);
      if (!here()) return;
      return intro(e.message === 'mic-denied' ? 'The microphone is blocked. Allow it in your browser, or type your explanation.'
        : e.message === 'unsupported' ? 'Voice input is not available in this browser. You can type your explanation.'
          : 'I could not hear that. Try again, or type your explanation.');
    }
    clearInterval(timer);
    if (!here() || !$('#done')) return; // cancelled or left
    if (text.trim().length < 15) return intro('I did not catch enough to go on. Try again and say a little more.');
    review(text);
  }

  function typed() {
    Voice.stop();
    shell('', esc(ask), `
      <textarea class="ex-text" id="text" rows="5" placeholder="Explain it in your own words…" aria-label="Your explanation"></textarea>
      <div class="ex-actions"><button class="btn btn-primary" id="send" disabled>Send explanation</button><button class="btn btn-ghost" id="back">Back</button></div>`);
    const box = $('#text');
    box.oninput = () => { $('#send').disabled = box.value.trim().length < 15; };
    $('#send').onclick = () => review(box.value.trim());
    $('#back').onclick = () => intro('Ready when you are.');
    box.focus();
  }

  async function review(text) {
    shell('', `<span class="ex-dots"><i></i><i></i><i></i></span> ${esc(tutor.name)} is thinking about what you said…`, `
      <details class="ex-said" open><summary>What you said</summary><p>${esc(text)}</p></details>`);
    $('#av').classList.add('thinking');
    let res;
    try { res = await grade(course, level, text); } catch {
      if (!here()) return;
      shell('care', 'I could not review that just now. Your explanation is safe, so try sending it again.', `
        <details class="ex-said" open><summary>What you said</summary><p>${esc(text)}</p></details>
        <div class="ex-actions"><button class="btn btn-primary" id="retry">Send again</button><a class="btn btn-ghost" href="#/course/${course.id}">Back to course</a></div>`);
      $('#retry').onclick = () => review(text);
      return;
    }
    if (!here()) return;
    const passed = res.score >= PASS;
    const award = progress.recordExplain(course, level, res.score, passed);
    const lvl = progress.levelInfo();
    const points = (title, items, cls) => (items.length ? `<div class="ex-card ${cls}"><b>${title}</b><ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '');
    shell(passed ? 'cheer' : '', esc(res.say || res.headline), `
      <div class="ex-score ${passed ? 'pass' : ''}">
        <span class="ring ring-lg" style="--pct:${res.score}"><span>${res.score}</span></span>
        <div><h2>${esc(res.headline)}</h2><small>${passed ? 'Explained' : `Reach ${PASS} to mark this level as explained`} · +${award.xp} XP${award.leveledUp ? ` · Level up! Level ${lvl.level}` : ''}</small></div>
      </div>
      <div class="ex-cards">
        ${points('✅ You nailed', res.nailed, 'good')}
        ${points('🧩 Still missing', res.missing, 'miss')}
        ${res.fix ? `<div class="ex-card fix"><b>🔧 One thing to add</b><p>${esc(res.fix)}</p></div>` : ''}
      </div>
      <details class="ex-said"><summary>What you said</summary><p>${esc(text)}</p></details>
      <div class="ex-actions">
        <a class="btn btn-primary" href="#/course/${course.id}">Continue</a>
        <button class="btn btn-ghost" id="again">${passed ? 'Explain again' : 'Try again'}</button>
      </div>`);
    $('#again').onclick = () => intro('Have another go. Say it your way.');
    if (passed && (award.first || award.leveledUp)) lemma.confetti();
    say(res.say || res.headline);
  }

  Voice.unlock();
  intro();
}
