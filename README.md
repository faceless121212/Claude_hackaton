# Lemma

An AI study companion for university math and science. A tutor that gives hints, not answers, and short courses you can start from zero.

## What it does

**Tutor** (`/`)

- **Solve together**: type a problem or send a photo; one hint at a time.
- **Bad exam?**: talk it through, then get a five-day comeback plan.
- **Voice mode**: speak and hear replies aloud (Chrome or Edge).
- **Mock exam**: five questions, six minutes, no hints, then a review.
- **Adaptive practice**: short sets that get harder or easier as you answer.
- **Memory**: the tutor remembers weak topics; you can read and erase it.

Three mascot tutors (Nova, Max, Ada) share the same model with different personalities.

**Courses** (`/courses/`)

- Eight bite-size courses across AI, math, computer science, data and science.
- Each course is split into levels; lessons unlock in order.
- Every lesson earns XP toward your level (Novice to Legend) and a daily goal.

XP and streak are shared: what you earn with the tutor and in courses adds up to one total.

## Run it

Requires Node.js 18 or newer. There is nothing to install.

```bash
cp .env.example .env
```

Put your key in `.env` (either `FAL_KEY`, or `ANTHROPIC_API_KEY` to call Claude directly), then:

```bash
npm start
```

Open http://localhost:3000. Courses work without a key; the tutor needs one.

## How it is built

- `server.js`: a dependency-free Node server. Serves `public/` and forwards chat requests to Claude, through fal by default or directly when `ANTHROPIC_API_KEY` is set.
- `public/app.js`: the tutor in plain JavaScript (landing page, onboarding, home, chat, voice mode, practice, mock exam, memory).
- `public/courses/src/app.js`: the courses screens (catalog, course path, lesson player, results, levels).
- `public/courses/src/progress.js`: XP, levels, streak, daily goal and lesson unlocks.
- `public/courses/src/data/`: the catalog (`index.js`) and one file per course (`courses/`).
- `public/img/`: mascot art generated with fal.

All state is kept in the browser's local storage.

## Extending courses

Add a course by copying a file in `public/courses/src/data/courses/` and registering it in `public/courses/src/data/index.js`. Step types: `info` (title, body), `choice` (prompt, options, answer index, explain), `input` (prompt, answer, explain).

Other code can read progress or award XP:

```js
const { progress, courses, getCourse } = window.Lemma;

progress.addXp(20);       // award XP from anywhere
progress.levelInfo();     // { level, title, xp, toNext, pct }
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

Lemma is an AI. It is not a human tutor or a mental-health service, and it is written for adults.
