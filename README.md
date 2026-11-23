# Solva

An AI study companion for university math and science. It solves problems with you one hint at a time, and it helps you recover after a bad exam.

## What it does

- **Talk to any tutor**: the landing page has a live chat with Nova, Max and Ada, no sign-up needed. Inside the app you can switch tutor from the home screen or in the middle of a conversation.
- **Solve together**: type a problem or send a photo; the tutor gives one step at a time and checks your working.
- **Bad exam?**: talk through what happened, then get a five-day comeback plan aimed at the marks you lost.
- **Voice mode**: speak to the tutor and hear replies aloud (Chrome or Edge).
- **Mock exam**: five questions, six minutes, no hints, then a question-by-question review.
- **Memory**: the tutor remembers weak topics and past sessions; you can read and erase it on the home screen.
- **Adaptive practice**: short question sets that get harder or easier as you answer.
- **Courses and levels**: Brilliant-style courses (How AI Works, Prompting & AI Agents, plus math, computer science, data and science) split into levels that unlock as you go. Lessons earn XP towards your level.

Three mascot tutors (Nova, Max, Ada) share the same model with different personalities.

## Run it

Requires Node.js 18 or newer. There is nothing to install.

```bash
cp .env.example .env
```

Put your key in `.env` or in a `keys.txt` file with the same format (either `FAL_KEY`, or `ANTHROPIC_API_KEY` to call Claude directly), then:

```bash
npm start
```

Open http://localhost:3000.

## How it is built

- `server.js`: a dependency-free Node server. Serves `public/` and forwards chat requests to Claude, through fal by default or directly when `ANTHROPIC_API_KEY` is set.
- `public/app.js`: the whole app in plain JavaScript (landing page, onboarding, home, tutor chat, voice mode, practice, mock exam, memory). State is kept in the browser's local storage.
- `public/courses/`: the courses and levels module, loaded as an ES module after `app.js`.
  - `app.js`: course catalog, course page with its level path, lesson player, results and the levels screen. These render inside a shadow root, so `courses.css` and `styles.css` cannot clash. Routes: `#/courses`, `#/course/:id`, `#/lesson/:course/:lesson`, `#/levels`.
  - `progress.js`: the level system (lesson and level unlocks, XP to level, daily goal). XP and the streak are Solva's own, read and written through `window.Solva`, so practice, mock exams and lessons add to one total.
  - `data/`: the catalog (`index.js`) and one file per course (`courses/*.js`). To add a course, copy a file and register it in `index.js`.
- `public/img/`: all art is generated with fal. `nova|max|ada*.webp` are the mascots, `s-*.webp` are mascot scenes for features, `i-*.webp` are subject and status icons, `c-*.webp` are course icons, `logo.webp` is the logo.
- `public/favicon.ico`, `icon-192.png`, `apple-touch-icon.png`: the browser-tab and home-screen icons, cut from the same artwork as the logo. `icon-512.png` is the full-size master.

Solva is an AI. It is not a human tutor or a mental-health service, and it is written for adults.

## Levels

- A course is split into levels. Lessons unlock in order, and a level unlocks when every lesson in the one before it is done.
- A lesson gives 10 to 20 XP, plus 5 for no mistakes. Replaying one gives 5 XP.
- Reaching level `n` takes `25 × n × (n − 1)` XP in total: 50, 150, 300, 500 and so on, from Novice up to Legend.
- Other code can use `window.Courses.progress`: `addXp(n)`, `levelInfo()`, `courseProgress(course)`, `subscribe(fn)`.
