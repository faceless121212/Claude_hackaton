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
