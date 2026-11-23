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

export const CATEGORIES = [
  { id: 'ai', label: 'AI', icon: '<img class="ico" src="/img/c-how-ai-works.webp" alt="">', blurb: 'Understand and use modern AI' },
  { id: 'math', label: 'Math', icon: '<img class="ico" src="/img/c-mathematical-thinking.webp" alt="">', blurb: 'Build real number sense' },
  { id: 'cs', label: 'Computer Science', icon: '<img class="ico" src="/img/c-thinking-in-code.webp" alt="">', blurb: 'Think like a programmer' },
  { id: 'data', label: 'Data', icon: '<img class="ico" src="/img/c-data-analysis.webp" alt="">', blurb: 'Make sense of numbers' },
  { id: 'science', label: 'Science', icon: '<img class="ico" src="/img/c-scientific-thinking.webp" alt="">', blurb: 'See how the world works' },
];

// Guided sequences of courses, shown as "Learning paths".
export const PATHS = [
  { id: 'ai-foundations', title: 'AI Foundations', icon: '<img class="ico" src="/img/c-prompting-and-agents.webp" alt="">', color: '#7c5cff',
    blurb: 'From next-word prediction to building with agents.',
    courses: ['how-ai-works', 'prompting-and-agents', 'thinking-in-code'] },
  { id: 'math-core', title: 'Math Core', icon: '<img class="ico" src="/img/c-probability-basics.webp" alt="">', color: '#f59e0b',
    blurb: 'Patterns, logic and chance — the tools behind everything else.',
    courses: ['mathematical-thinking', 'probability-basics', 'data-analysis'] },
  { id: 'cs-core', title: 'Programming & CS', icon: '<img class="ico" src="/img/c-algorithms-basics.webp" alt="">', color: '#3b82f6',
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
