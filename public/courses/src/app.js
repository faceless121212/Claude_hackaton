import { COURSES, CATEGORIES, PATHS, FEATURED_COURSE_ID, getCourse, findLesson, courseStats } from './data/index.js';
import * as progress from './progress.js';

const app = document.getElementById('app');
const topbar = document.getElementById('topbar');

// ---- helpers ----------------------------------------------------------------

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Tiny formatter for lesson text: paragraphs, **bold**, `code`. */
function rich(text) {
  return esc(text)
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>')}</p>`)
    .join('');
}

const bar = (pct, color) => `<div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%;${color ? `background:${color}` : ''}"></span></div>`;

const ui = { category: 'all', query: '' };

// ---- top bar ----------------------------------------------------------------

function renderTopbar() {
  const lvl = progress.levelInfo();
  const st = progress.streak();
  topbar.innerHTML = `
    <a class="brand" href="/"><span class="brand-mark">λ</span>Lemma</a>
    <nav class="nav">
      <a href="/">Tutor</a>
      <a href="#/" data-nav="home">Courses</a>
      <a href="#/profile" data-nav="profile">Levels</a>
    </nav>
    <div class="stats">
      <span class="stat ${st.activeToday ? 'is-hot' : ''}" title="Day streak">🔥 <b>${st.count}</b></span>
      <span class="stat" title="Total XP">⚡ <b>${lvl.xp}</b> XP</span>
      <a class="level-chip" href="#/profile" title="${esc(lvl.title)} — ${lvl.toNext} XP to next level">
        <span class="ring" style="--pct:${lvl.pct}"><span>${lvl.level}</span></span>
        <span class="level-chip-text"><b>Level ${lvl.level}</b><small>${esc(lvl.title)}</small></span>
      </a>
    </div>`;
  const route = location.hash.startsWith('#/profile') ? 'profile' : 'home';
  topbar.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === route));
}

// ---- course selection (home) ------------------------------------------------

function courseCard(course) {
  const p = progress.courseProgress(course);
  const s = courseStats(course);
  return `
    <a class="course-card" href="#/course/${course.id}" style="--c:${course.color}">
      <div class="course-art"><span>${course.icon}</span>${course.isNew ? '<em class="badge">NEW</em>' : ''}${p.complete ? '<em class="badge badge-done">✓ Done</em>' : ''}</div>
      <div class="course-body">
        <h3>${esc(course.title)}</h3>
        <p>${esc(course.tagline)}</p>
        ${p.started
          ? `<div class="course-progress">${bar(p.pct, course.color)}<small>Level ${p.currentLevel} of ${p.levelCount} · ${p.pct}%</small></div>`
          : `<small class="meta">${s.lessons} lessons · ${esc(course.difficulty)}</small>`}
      </div>
    </a>`;
}

function continueCard() {
  const course = getCourse(progress.getState().activeCourse);
  const lvl = progress.levelInfo();
  const day = progress.daily();
  const levelPanel = `
    <div class="panel level-panel">
      <div class="level-panel-head">
        <span class="ring ring-lg" style="--pct:${lvl.pct}"><span>${lvl.level}</span></span>
        <div><small>Your level</small><h3>${esc(lvl.title)}</h3></div>
      </div>
      ${bar(lvl.pct)}
      <small>${lvl.toNext} XP to Level ${lvl.level + 1}</small>
      <div class="daily">
        <div class="daily-row"><span>🎯 Daily goal</span><b>${day.xp} / ${day.goal} XP</b></div>
        ${bar(day.pct, 'var(--green)')}
      </div>
    </div>`;

  let main;
  const p = course && progress.courseProgress(course);
  if (course && !p.complete) {
    main = `
      <div class="panel continue" style="--c:${course.color}">
        <div class="continue-art">${course.icon}</div>
        <div class="continue-body">
          <small>Continue · Level ${p.currentLevel} of ${p.levelCount}</small>
          <h2>${esc(course.title)}</h2>
          <p>Next: <b>${esc(p.nextLesson.title)}</b></p>
          ${bar(p.pct, course.color)}
          <a class="btn btn-primary" href="#/lesson/${course.id}/${p.nextLesson.id}">Continue</a>
        </div>
      </div>`;
  } else {
    const featured = getCourse(FEATURED_COURSE_ID) ?? COURSES[0];
    const s = courseStats(featured);
    main = `
      <div class="panel continue" style="--c:${featured.color}">
        <div class="continue-art">${featured.icon}</div>
        <div class="continue-body">
          <small>${course ? 'Course complete. Try this next' : 'Start here'}</small>
          <h2>${esc(featured.title)}</h2>
          <p>${esc(featured.tagline)}</p>
          <small class="meta">${s.lessons} lessons · ${s.xp} XP</small>
          <a class="btn btn-primary" href="#/course/${featured.id}">Start course</a>
        </div>
      </div>`;
  }
  return `<section class="hero">${main}${levelPanel}</section>`;
}

function catalogHtml() {
  const q = ui.query.trim().toLowerCase();
  const matches = (c) => (ui.category === 'all' || c.category === ui.category)
    && (!q || `${c.title} ${c.tagline} ${c.description}`.toLowerCase().includes(q));
  const found = COURSES.filter(matches);
  if (!found.length) return `<p class="empty">No courses match “${esc(ui.query)}”. Try another word.</p>`;
  return `<section class="cat-section"><div class="course-grid">${found.map(courseCard).join('')}</div></section>`;
}

function pathsHtml() {
  return `
    <section class="cat-section">
      <div class="cat-head"><h2>Paths</h2><span>Courses in order</span></div>
      <div class="path-grid">
        ${PATHS.map((path) => {
          const courses = path.courses.map(getCourse).filter(Boolean);
          const next = courses.find((c) => !progress.courseProgress(c).complete) ?? courses[0];
          const done = courses.filter((c) => progress.courseProgress(c).complete).length;
          return `
            <div class="path-card" style="--c:${path.color}">
              <div class="path-head"><span class="path-icon">${path.icon}</span><div><h3>${esc(path.title)}</h3><small>${done} of ${courses.length} done</small></div></div>
              <p>${esc(path.blurb)}</p>
              <ol class="path-steps">
                ${courses.map((c) => {
                  const cp = progress.courseProgress(c);
                  return `<li class="${cp.complete ? 'done' : cp.started ? 'started' : ''}"><a href="#/course/${c.id}"><span class="dot">${cp.complete ? '✓' : c.icon}</span>${esc(c.title)}</a></li>`;
                }).join('')}
              </ol>
              <a class="btn btn-ghost" href="#/course/${next.id}">${done ? 'Continue path' : 'Start path'}</a>
            </div>`;
        }).join('')}
      </div>
    </section>`;
}

function renderHome() {
  app.innerHTML = `
    <div class="page">
      ${continueCard()}
      <section class="chooser">
        <h1>What do you want to learn?</h1>
        <div class="chooser-row">
          <div class="chips" role="tablist" aria-label="Course categories">
            <button class="chip ${ui.category === 'all' ? 'active' : ''}" data-cat="all">All</button>
            ${CATEGORIES.map((c) => `<button class="chip ${ui.category === c.id ? 'active' : ''}" data-cat="${c.id}">${c.icon} ${esc(c.label)}</button>`).join('')}
          </div>
          <input class="search" id="search" type="search" placeholder="Search courses" aria-label="Search courses" value="${esc(ui.query)}">
        </div>
      </section>
      <div id="catalog">${catalogHtml()}</div>
      ${pathsHtml()}
    </div>`;

  app.querySelectorAll('[data-cat]').forEach((btn) => btn.addEventListener('click', () => {
    ui.category = btn.dataset.cat;
    app.querySelectorAll('[data-cat]').forEach((b) => b.classList.toggle('active', b === btn));
    document.getElementById('catalog').innerHTML = catalogHtml();
  }));
  document.getElementById('search').addEventListener('input', (e) => {
    ui.query = e.target.value;
    document.getElementById('catalog').innerHTML = catalogHtml();
  });
}

// ---- course page: levels & lesson path --------------------------------------

const OFFSETS = [0, 46, 70, 46, 0, -46, -70, -46];

function renderCourse(courseId) {
  const course = getCourse(courseId);
  if (!course) return renderNotFound();
  const p = progress.courseProgress(course);
  const s = courseStats(course);
  let n = 0;

  const levelsHtml = p.levels.map((lv) => `
    <section class="level level-${lv.status}">
      <header class="level-head">
        <span class="level-num">${lv.status === 'done' ? '✓' : lv.status === 'locked' ? '🔒' : lv.index + 1}</span>
        <div>
          <small>Level ${lv.index + 1}${lv.status === 'done' ? ' · Complete' : lv.status === 'locked' ? ' · Locked' : ''}</small>
          <h2>${esc(lv.level.title)}</h2>
          <p>${esc(lv.level.summary)}</p>
        </div>
        <span class="level-count">${lv.done}/${lv.total}</span>
      </header>
      <ol class="nodes">
        ${lv.lessons.map(({ lesson, status }) => {
          const off = OFFSETS[n++ % OFFSETS.length];
          const label = `${esc(lesson.title)} — ${status === 'done' ? 'completed' : status === 'current' ? 'up next' : 'locked'}`;
          const inner = status === 'done' ? '✓' : status === 'current' ? '▶' : '🔒';
          const node = status === 'locked'
            ? `<span class="node node-locked" aria-label="${label}">${inner}</span>`
            : `<a class="node node-${status}" href="#/lesson/${course.id}/${lesson.id}" aria-label="${label}">${inner}</a>`;
          return `
            <li class="node-row" style="--off:${off}px">
              ${status === 'current' ? '<span class="start-tip">START</span>' : ''}
              ${node}
              <div class="node-label"><b>${esc(lesson.title)}</b><small>${lesson.minutes ?? 5} min · ${lesson.xp ?? 10} XP</small></div>
            </li>`;
        }).join('')}
      </ol>
    </section>`).join('');

  const cta = p.complete
    ? `<a class="btn btn-primary" href="#/lesson/${course.id}/${course.levels[0].lessons[0].id}">Practice again</a>`
    : `<a class="btn btn-primary" href="#/lesson/${course.id}/${p.nextLesson.id}">${p.started ? 'Continue' : 'Start course'}</a>`;

  app.innerHTML = `
    <div class="page course-page" style="--c:${course.color}">
      <aside class="course-side">
        <a class="back" href="#/">← All courses</a>
        <div class="panel course-info">
          <div class="course-art course-art-lg"><span>${course.icon}</span></div>
          <h1>${esc(course.title)}</h1>
          <p>${esc(course.description)}</p>
          <div class="facts">
            <span><b>${s.levels}</b> levels</span><span><b>${s.lessons}</b> lessons</span><span><b>${s.xp}</b> XP</span>
          </div>
          <div class="course-progress">
            ${bar(p.pct, course.color)}
            <small>${p.complete ? 'Course complete 🎉' : `Level ${p.currentLevel} of ${p.levelCount} · ${p.done}/${p.total} lessons`}</small>
          </div>
          ${cta}
        </div>
      </aside>
      <div class="levels">${levelsHtml}</div>
    </div>`;
  app.querySelector('.node-current')?.scrollIntoView({ block: 'center' });
}

// ---- lesson player ----------------------------------------------------------
// Other teams can replace the player: set window.LessonPlayer = { start({ course, lesson, onComplete, onExit }) }
// and call onComplete({ mistakes }) when the learner finishes.

let player = null;

function renderLesson(courseId, lessonId) {
  const course = getCourse(courseId);
  const found = course && findLesson(course, lessonId);
  if (!found) return renderNotFound();
  const { lesson, level } = found;
  const status = progress.courseProgress(course).levels.flatMap((l) => l.lessons).find((l) => l.lesson === lesson).status;
  if (status === 'locked') { location.hash = `#/course/${course.id}`; return; }
  progress.setActiveCourse(course.id);

  const finish = ({ mistakes = 0 } = {}) => showResults(course, lesson, progress.completeLesson(course, lesson, { mistakes }));
  const exit = () => { location.hash = `#/course/${course.id}`; };

  if (window.LessonPlayer?.start) {
    app.innerHTML = '<div class="page" id="lesson-root"></div>';
    window.LessonPlayer.start({ course, level, lesson, root: document.getElementById('lesson-root'), onComplete: finish, onExit: exit });
    return;
  }

  player = { course, lesson, level, idx: 0, mistakes: 0, selected: null, wrong: new Set(), attempts: 0, solved: false, revealed: false, finish };
  document.body.classList.add('in-lesson');
  drawStep();
}

function drawStep() {
  const { course, lesson, idx } = player;
  const step = lesson.steps[idx];
  const pct = Math.round((idx / lesson.steps.length) * 100);
  let body;
  if (step.type === 'info') {
    body = `<div class="step-card"><h2>${esc(step.title)}</h2><div class="rich">${rich(step.body)}</div></div>`;
  } else if (step.type === 'choice') {
    body = `
      <div class="step-card">
        <div class="rich prompt">${rich(step.prompt)}</div>
        <div class="options" role="radiogroup">
          ${step.options.map((o, i) => `<button class="option" data-opt="${i}" role="radio" aria-checked="false"><kbd>${i + 1}</kbd><span>${rich(o).replace(/^<p>|<\/p>$/g, '')}</span></button>`).join('')}
        </div>
      </div>`;
  } else {
    body = `
      <div class="step-card">
        <div class="rich prompt">${rich(step.prompt)}</div>
        <input class="answer" id="answer" type="text" inputmode="${typeof step.answer === 'number' ? 'decimal' : 'text'}" autocomplete="off" placeholder="Type your answer" aria-label="Your answer">
      </div>`;
  }

  app.innerHTML = `
    <div class="lesson" style="--c:${course.color}">
      <div class="lesson-top">
        <a class="close" href="#/course/${course.id}" aria-label="Exit lesson">✕</a>
        ${bar(pct, course.color)}
        <span class="lesson-count">${idx + 1}/${lesson.steps.length}</span>
      </div>
      <div class="lesson-main">
        <small class="lesson-title">${esc(course.title)} · ${esc(lesson.title)}</small>
        ${body}
      </div>
      <div class="lesson-foot" id="foot">
        <div class="feedback" id="feedback" aria-live="polite"></div>
        <button class="btn btn-primary" id="action" ${step.type === 'info' ? '' : 'disabled'}>${step.type === 'info' ? 'Continue' : 'Check'}</button>
      </div>
    </div>`;

  const action = document.getElementById('action');
  action.addEventListener('click', onAction);
  app.querySelectorAll('.option').forEach((btn) => btn.addEventListener('click', () => selectOption(Number(btn.dataset.opt))));
  const input = document.getElementById('answer');
  if (input) {
    input.addEventListener('input', () => { if (!player.solved && !player.revealed) action.disabled = !input.value.trim(); });
    input.focus();
  }
}

function selectOption(i) {
  if (!player || player.solved || player.revealed || player.wrong.has(i)) return;
  player.selected = i;
  app.querySelectorAll('.option').forEach((b) => {
    const on = Number(b.dataset.opt) === i;
    b.classList.toggle('selected', on);
    b.setAttribute('aria-checked', on);
  });
  document.getElementById('action').disabled = false;
  document.getElementById('feedback').innerHTML = '';
  document.getElementById('foot').className = 'lesson-foot';
}

function isInputCorrect(step, raw) {
  const given = raw.trim().toLowerCase().replace(/,/g, '');
  if (typeof step.answer === 'number') return given !== '' && Math.abs(Number(given) - step.answer) < 1e-9;
  return given === String(step.answer).trim().toLowerCase();
}

function onAction() {
  const step = player.lesson.steps[player.idx];
  if (step.type === 'info' || player.solved || player.revealed) return nextStep();

  const foot = document.getElementById('foot');
  const feedback = document.getElementById('feedback');
  const action = document.getElementById('action');
  const input = document.getElementById('answer');
  const correct = step.type === 'choice' ? player.selected === step.answer : isInputCorrect(step, input.value);

  if (correct) {
    player.solved = true;
    foot.className = 'lesson-foot is-right';
    feedback.innerHTML = `<b>✓ Correct!</b>${rich(step.explain)}`;
    app.querySelector(`.option[data-opt="${player.selected}"]`)?.classList.add('right');
    if (input) { input.classList.add('right'); input.disabled = true; }
    action.textContent = 'Continue';
    action.focus();
    return;
  }

  player.mistakes++;
  player.attempts++;
  if (step.type === 'choice') {
    player.wrong.add(player.selected);
    const btn = app.querySelector(`.option[data-opt="${player.selected}"]`);
    btn.classList.remove('selected');
    btn.classList.add('wrong');
    btn.disabled = true;
    player.selected = null;
  }
  const remaining = step.type === 'choice' ? step.options.length - player.wrong.size : 2 - player.attempts;
  if (remaining <= 1 && step.type === 'choice' || remaining <= 0) {
    player.revealed = true;
    foot.className = 'lesson-foot is-wrong';
    const answer = step.type === 'choice' ? step.options[step.answer] : step.answer;
    feedback.innerHTML = `<b>The answer is ${esc(answer)}</b>${rich(step.explain)}`;
    app.querySelector(`.option[data-opt="${step.answer}"]`)?.classList.add('right');
    if (input) input.disabled = true;
    action.textContent = 'Continue';
    action.disabled = false;
  } else {
    foot.className = 'lesson-foot is-wrong';
    feedback.innerHTML = '<b>Not quite.</b><p>Try again.</p>';
    action.disabled = true;
    if (input) { input.select(); }
  }
}

function nextStep() {
  player.idx++;
  Object.assign(player, { selected: null, wrong: new Set(), attempts: 0, solved: false, revealed: false });
  if (player.idx >= player.lesson.steps.length) {
    const { finish, mistakes } = player;
    player = null;
    finish({ mistakes });
  } else {
    drawStep();
  }
}

function showResults(course, lesson, r) {
  document.body.classList.add('in-lesson');
  const lvl = progress.levelInfo();
  const st = progress.streak();
  const next = r.nextLesson;
  const headline = r.courseCompleted ? 'Course complete!' : r.levelCompleted ? `Level ${r.levelCompleted.index + 1} complete!` : r.perfect ? 'Perfect lesson!' : 'Lesson complete!';
  const emoji = r.courseCompleted ? '🏆' : r.levelCompleted ? '🎉' : r.perfect ? '🌟' : '✅';

  app.innerHTML = `
    <div class="lesson results" style="--c:${course.color}">
      <div class="confetti" aria-hidden="true">${Array.from({ length: 28 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 7) * 0.12}s;--h:${(i * 47) % 360}"></i>`).join('')}</div>
      <div class="results-card">
        <div class="results-emoji">${emoji}</div>
        <h1>${headline}</h1>
        <p>${esc(lesson.title)}${r.firstTime ? '' : ' · practice round'}</p>
        <div class="result-stats">
          <div><b>+${r.xpGained}</b><small>XP${r.bonus ? ` · +${r.bonus} perfect` : ''}</small></div>
          <div><b>🔥 ${st.count}</b><small>day streak</small></div>
          <div><b>${lvl.level}</b><small>${esc(lvl.title)}</small></div>
        </div>
        ${r.leveledUp ? `<div class="levelup">⬆ Level up: <b>Level ${lvl.level}, ${esc(lvl.title)}</b></div>` : ''}
        <div class="result-level">
          ${bar(lvl.pct)}
          <small>${lvl.toNext} XP to Level ${lvl.level + 1}</small>
        </div>
        <div class="result-actions">
          ${next ? `<a class="btn btn-primary" id="next" href="#/lesson/${course.id}/${next.id}">Next lesson</a>` : `<a class="btn btn-primary" id="next" href="#/">Pick another course</a>`}
          <a class="btn btn-ghost" href="#/course/${course.id}">Back to course</a>
        </div>
      </div>
    </div>`;
  renderTopbar();
  document.getElementById('next').focus();
}

// ---- profile / levels -------------------------------------------------------

function renderProfile() {
  const lvl = progress.levelInfo();
  const st = progress.streak();
  const day = progress.daily();
  const started = COURSES.map((c) => ({ c, p: progress.courseProgress(c) })).filter((x) => x.p.started);
  const ladder = progress.LEVEL_TITLES.map((title, i) => {
    const n = i + 1;
    const state = n < lvl.level ? 'done' : n === lvl.level ? 'current' : 'locked';
    return `<li class="rung rung-${state}"><span class="rung-num">${state === 'done' ? '✓' : n}</span><div><b>${esc(title)}</b><small>${progress.xpForLevel(n)} XP</small></div>${state === 'current' ? '<em>You are here</em>' : ''}</li>`;
  }).join('');

  app.innerHTML = `
    <div class="page profile">
      <section class="panel profile-head">
        <span class="ring ring-xl" style="--pct:${lvl.pct}"><span>${lvl.level}</span></span>
        <div class="profile-main">
          <small>Level ${lvl.level}</small>
          <h1>${esc(lvl.title)}</h1>
          ${bar(lvl.pct)}
          <small>${lvl.into} / ${lvl.span} XP · ${lvl.toNext} XP to Level ${lvl.level + 1}</small>
        </div>
        <div class="profile-stats">
          <div><b>⚡ ${lvl.xp}</b><small>total XP</small></div>
          <div><b>🔥 ${st.count}</b><small>day streak</small></div>
          <div><b>🎯 ${day.xp}/${day.goal}</b><small>today</small></div>
        </div>
      </section>
      <div class="profile-cols">
        <section class="panel">
          <h2>Level ladder</h2>
          <ol class="ladder">${ladder}</ol>
        </section>
        <section class="panel">
          <h2>Your courses</h2>
          ${started.length ? started.map(({ c, p }) => `
            <a class="mini-course" href="#/course/${c.id}" style="--c:${c.color}">
              <span class="mini-icon">${c.icon}</span>
              <div><b>${esc(c.title)}</b>${bar(p.pct, c.color)}<small>${p.complete ? 'Complete' : `Level ${p.currentLevel} of ${p.levelCount}`} · ${p.done}/${p.total} lessons</small></div>
            </a>`).join('') : '<p class="empty">Nothing started yet. <a href="#/">Pick a course →</a></p>'}
          <h2 class="how-title">Earning XP</h2>
          <ul class="how">
            <li><b>10–20</b><small>per lesson</small></li>
            <li><b>+${progress.PERFECT_BONUS}</b><small>no mistakes</small></li>
            <li><b>${progress.REPLAY_XP}</b><small>replay</small></li>
            <li><b>10</b><small>tutor question</small></li>
          </ul>
          <button class="btn btn-ghost btn-small" id="reset">Reset progress</button>
        </section>
      </div>
    </div>`;
  document.getElementById('reset').addEventListener('click', () => {
    if (confirm('Reset all XP, your level and course progress? This can\'t be undone.')) { progress.reset(); route(); }
  });
}

function renderNotFound() {
  app.innerHTML = '<div class="page"><p class="empty">That page doesn’t exist. <a href="#/">Back to courses →</a></p></div>';
}

// ---- router -----------------------------------------------------------------

function route() {
  player = null;
  document.body.classList.remove('in-lesson');
  const [, view, a, b] = location.hash.replace(/^#/, '').split('/');
  if (view === 'course') renderCourse(a);
  else if (view === 'lesson') renderLesson(a, b);
  else if (view === 'profile') renderProfile();
  else renderHome();
  renderTopbar();
  if (view !== 'course') window.scrollTo(0, 0);
}

document.addEventListener('keydown', (e) => {
  if (!player) return;
  if (e.key === 'Enter') {
    const action = document.getElementById('action');
    if (action && !action.disabled && document.activeElement !== action) { e.preventDefault(); action.click(); }
  } else if (/^[1-9]$/.test(e.key) && document.activeElement?.tagName !== 'INPUT') {
    selectOption(Number(e.key) - 1);
  }
});

window.addEventListener('hashchange', route);
progress.subscribe(renderTopbar);

// Public API for the other parts of the app.
window.Lemma = { progress, courses: COURSES, getCourse };
route();
