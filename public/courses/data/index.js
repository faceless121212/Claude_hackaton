// Course catalog. To add a course: drop a file in ./courses and register it here.
import howAiWorks from './courses/how-ai-works.js';
import promptingAndAgents from './courses/prompting-and-agents.js';
import mathematicalThinking from './courses/mathematical-thinking.js';
import probabilityBasics from './courses/probability-basics.js';
import dataAnalysis from './courses/data-analysis.js';
import thinkingInCode from './courses/thinking-in-code.js';
import algorithmsBasics from './courses/algorithms-basics.js';
import scientificThinking from './courses/scientific-thinking.js';

export const COURSES = [
  howAiWorks,
  promptingAndAgents,
  mathematicalThinking,
  probabilityBasics,
  thinkingInCode,
  algorithmsBasics,
  dataAnalysis,
  scientificThinking,
];

// Courses the learner generated with AI (see ../generate.js). They live in localStorage and are
// appended to COURSES at load, so the rest of the app treats them like any built-in course.
const CUSTOM_KEY = 'lemma.courses.custom';

function readCustom() {
  try {
    const list = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
    if (!Array.isArray(list)) return [];
    // `id`, `icon` and `color` end up in HTML/style unescaped, so re-check them even though we wrote them.
    return list
      .filter((c) => c && typeof c.id === 'string' && /^custom-[a-z0-9-]+$/.test(c.id) && typeof c.title === 'string'
        && Array.isArray(c.levels) && c.levels.length && c.levels.every((l) => Array.isArray(l?.lessons) && l.lessons.length))
      .map((c) => ({
        ...c,
        custom: true,
        category: 'mine',
        icon: typeof c.icon === 'string' && c.icon.length <= 16 && !/[\u0000-\u007f]/.test(c.icon) ? c.icon : '✨',
        color: /^#[0-9a-f]{6}$/i.test(c.color) ? c.color : '#7c5cff',
      }));
  } catch { return []; }
}

function writeCustom() {
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(COURSES.filter((c) => c.custom))); return true; } catch { return false; }
}

for (const c of readCustom()) if (!COURSES.some((x) => x.id === c.id)) COURSES.push(c);

/** Add (or replace) an AI-generated course and persist it. Returns false if it could not be saved. */
export function addCourse(course) {
  const i = COURSES.findIndex((c) => c.id === course.id);
  if (i >= 0 && !COURSES[i].custom) return false;
  if (i >= 0) COURSES[i] = course; else COURSES.push(course);
  return writeCustom();
}

/** Remove an AI-generated course. Built-in courses cannot be removed. */
export function removeCourse(id) {
  const i = COURSES.findIndex((c) => c.id === id && c.custom);
  if (i < 0) return false;
  COURSES.splice(i, 1);
  writeCustom();
  return true;
}

export const CATEGORIES = [
  { id: 'mine', label: 'My courses', icon: '✨', blurb: 'Made for you by AI' },
  { id: 'ai', label: 'AI', icon: '🧠', blurb: 'Understand and use modern AI' },
  { id: 'math', label: 'Math', icon: '🧩', blurb: 'Build real number sense' },
  { id: 'cs', label: 'Computer Science', icon: '💻', blurb: 'Think like a programmer' },
  { id: 'data', label: 'Data', icon: '📊', blurb: 'Make sense of numbers' },
  { id: 'science', label: 'Science', icon: '🔬', blurb: 'See how the world works' },
];

// Guided sequences of courses, shown as "Learning paths".
export const PATHS = [
  { id: 'ai-foundations', title: 'AI Foundations', icon: '🤖', color: '#7c5cff',
    blurb: 'From next-word prediction to building with agents.',
    courses: ['how-ai-works', 'prompting-and-agents', 'thinking-in-code'] },
  { id: 'math-core', title: 'Math Core', icon: '📐', color: '#f59e0b',
    blurb: 'Patterns, logic and chance — the tools behind everything else.',
    courses: ['mathematical-thinking', 'probability-basics', 'data-analysis'] },
  { id: 'cs-core', title: 'Programming & CS', icon: '⌨️', color: '#3b82f6',
    blurb: 'Go from first variables to efficient algorithms.',
    courses: ['thinking-in-code', 'algorithms-basics'] },
];

export const FEATURED_COURSE_ID = 'how-ai-works';

export function getCourse(id) { return COURSES.find((c) => c.id === id); }

export function findLesson(course, lessonId) {
  for (const level of course.levels) {
    const lesson = level.lessons.find((l) => l.id === lessonId);
    if (lesson) return { level, lesson };
  }
  return null;
}

export function courseStats(course) {
  const lessons = course.levels.reduce((n, l) => n + l.lessons.length, 0);
  const xp = course.levels.reduce((n, l) => n + l.lessons.reduce((m, s) => m + (s.xp ?? 10), 0), 0);
  return { levels: course.levels.length, lessons, xp };
}
