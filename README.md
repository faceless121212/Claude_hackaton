# Spark — learn by doing

A Brilliant-style learning app. This part covers **course selection** and the **level system**.

## Run

No build step — it is plain HTML/CSS/ES modules. Serve the folder with any static server:

```bash
npx serve .
```

(Opening `index.html` from disk will not work: browsers block ES modules on `file://`.)

## What's here

| File | What it does |
| --- | --- |
| `src/app.js` | Screens: course catalog, course page with level path, lesson player, results, levels/profile |
| `src/progress.js` | Level system: XP, user levels, streak, daily goal, lesson/level unlocks (localStorage) |
| `src/data/index.js` | Course catalog, categories and learning paths |
| `src/data/courses/*.js` | Course content — one file per course |

## Courses

- **AI:** How AI Works (5 levels, 15 lessons), Prompting & AI Agents
- **Math:** Mathematical Thinking, Probability Basics
- **Computer Science:** Thinking in Code, Algorithm Fundamentals
- **Data:** Exploring Data
- **Science:** Scientific Thinking

## Level system

- Each course is split into **levels**; a level unlocks when every lesson in the previous one is done, and lessons unlock in order.
- Finishing a lesson awards its XP (10–20), **+5** for no mistakes; replaying gives 5 XP.
- User level `n` needs `25 · n · (n − 1)` total XP (50, 150, 300, 500 …), with titles from Novice to Legend.
- Any day with XP earned extends the streak; the daily goal is 30 XP.

## Plugging in other features

```js
const { progress, courses, getCourse } = window.Spark;

progress.addXp(20);                         // award XP from anywhere (daily challenge, AI tutor…)
progress.levelInfo();                       // { level, title, xp, toNext, pct }
progress.courseProgress(getCourse('how-ai-works')); // per-level and per-lesson status
progress.subscribe((state) => { /* re-render on change */ });
```

To swap in a different lesson player, define `window.LessonPlayer` before the app loads:

```js
window.LessonPlayer = {
  start({ course, level, lesson, root, onComplete, onExit }) {
    // render into `root`, then call onComplete({ mistakes }) or onExit()
  },
};
```

## Adding a course

Create `src/data/courses/<id>.js` (copy an existing one) and register it in `src/data/index.js`.
Step types: `info` (title, body), `choice` (prompt, options, answer index, explain), `input` (prompt, answer, explain).
