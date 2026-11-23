// Level system: XP, user levels, streaks, daily goal and per-course unlocks.
// Everything is persisted in localStorage and exposed through plain functions,
// so other parts of the app can read progress or award XP without touching the UI.

const KEY = 'learnapp.progress.v1';
export const DAILY_GOAL = 30;
export const PERFECT_BONUS = 5;
export const REPLAY_XP = 5;

export const LEVEL_TITLES = [
  'Novice', 'Explorer', 'Thinker', 'Problem Solver', 'Scholar',
  'Strategist', 'Expert', 'Master', 'Sage', 'Legend',
];

const listeners = new Set();
let state = load();

// Inside Lemma, XP and the streak belong to Lemma's own state (window.Lemma.S), so practice,
// mock exams and course lessons all feed one total. Standalone, we keep our own.
const lemma = () => globalThis.Lemma;
export function totalXp() { return lemma() ? lemma().S.xp : state.xp; }

function blank() {
  return { xp: 0, completed: {}, streak: { count: 0, lastDay: null }, daily: { day: null, xp: 0 }, activeCourse: null };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...blank(), ...JSON.parse(raw) };
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return blank();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((fn) => fn(state));
}

function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function getState() { return state; }
/** Clears course progress (and standalone XP). Lemma's XP and streak are left alone. */
export function reset() { state = blank(); save(); }

// ---- User level -----------------------------------------------------------

/** Total XP needed to reach level n (level 1 = 0 XP, 2 = 50, 3 = 150, 4 = 300 ...). */
export function xpForLevel(n) { return 25 * n * (n - 1); }

export function levelInfo(xp = totalXp()) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1],
    xp,
    into: xp - base,
    span: next - base,
    toNext: next - xp,
    pct: Math.round(((xp - base) / (next - base)) * 100),
  };
}

// ---- Streak & daily goal --------------------------------------------------

export function streak() {
  if (lemma()) {
    const { streak: count, lastDay } = lemma().S;
    return { count, activeToday: lastDay === new Date().toISOString().slice(0, 10) };
  }
  const { count, lastDay } = state.streak;
  if (!lastDay) return { count: 0, activeToday: false };
  const today = dayKey();
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (lastDay === today) return { count, activeToday: true };
  if (lastDay === dayKey(y)) return { count, activeToday: false };
  return { count: 0, activeToday: false };
}

export function daily() {
  const xp = state.daily.day === dayKey() ? state.daily.xp : 0;
  return { xp, goal: DAILY_GOAL, pct: Math.min(100, Math.round((xp / DAILY_GOAL) * 100)), done: xp >= DAILY_GOAL };
}

function touchStreak() {
  const today = dayKey();
  const current = streak();
  if (!current.activeToday) state.streak = { count: current.count + 1, lastDay: today };
}

// ---- Course progress ------------------------------------------------------

export function isLessonDone(courseId, lessonId) {
  return Boolean(state.completed[courseId]?.[lessonId]);
}

/**
 * Per-course progress. Lessons unlock in order; a course level unlocks when
 * every lesson of the previous level is done.
 */
export function courseProgress(course) {
  let done = 0;
  let total = 0;
  let nextLesson = null;
  let currentLevel = 0;
  let previousLevelsDone = true;

  const levels = course.levels.map((lvl, i) => {
    const lessons = lvl.lessons.map((lesson) => {
      const isDone = isLessonDone(course.id, lesson.id);
      let status = 'locked';
      if (isDone) status = 'done';
      else if (!nextLesson) { status = 'current'; nextLesson = lesson; currentLevel = i; }
      return { lesson, status };
    });
    const lvlDone = lessons.filter((l) => l.status === 'done').length;
    done += lvlDone;
    total += lessons.length;
    const complete = lvlDone === lessons.length;
    const status = complete ? 'done' : previousLevelsDone ? 'active' : 'locked';
    previousLevelsDone = previousLevelsDone && complete;
    return { level: lvl, index: i, status, done: lvlDone, total: lessons.length, lessons };
  });

  const complete = total > 0 && done === total;
  if (complete) currentLevel = course.levels.length - 1;
  return {
    done, total, complete, levels, nextLesson,
    started: done > 0,
    pct: total ? Math.round((done / total) * 100) : 0,
    currentLevel: currentLevel + 1,
    levelCount: course.levels.length,
  };
}

export function setActiveCourse(courseId) {
  if (state.activeCourse !== courseId) { state.activeCourse = courseId; save(); }
}

/** Award raw XP (for other features: daily challenges, AI tutor, etc.). */
export function addXp(amount) {
  const before = levelInfo().level;
  const today = dayKey();
  state.daily = { day: today, xp: (state.daily.day === today ? state.daily.xp : 0) + amount };
  if (lemma()) {
    lemma().S.xp += amount;
    lemma().touchStreak();
    lemma().save();
  } else {
    state.xp += amount;
    touchStreak();
  }
  save();
  const after = levelInfo().level;
  return { leveledUp: after > before, level: after };
}

/** Mark a lesson finished and award XP. Returns a summary for the results screen. */
export function completeLesson(course, lesson, { mistakes = 0 } = {}) {
  const before = courseProgress(course);
  const firstTime = !isLessonDone(course.id, lesson.id);
  const perfect = mistakes === 0;
  const base = firstTime ? lesson.xp ?? 10 : REPLAY_XP;
  const bonus = firstTime && perfect ? PERFECT_BONUS : 0;
  const xpBefore = totalXp();

  if (firstTime) {
    state.completed[course.id] = { ...state.completed[course.id], [lesson.id]: { at: Date.now(), mistakes } };
  }
  state.activeCourse = course.id;
  const { leveledUp, level } = addXp(base + bonus);

  const after = courseProgress(course);
  const lvlIndex = course.levels.findIndex((l) => l.lessons.includes(lesson));
  return {
    xpGained: base + bonus, base, bonus, perfect, firstTime,
    xpBefore, leveledUp, level,
    levelCompleted: firstTime && after.levels[lvlIndex]?.status === 'done' ? after.levels[lvlIndex] : null,
    courseCompleted: !before.complete && after.complete,
    nextLesson: after.nextLesson,
  };
}
