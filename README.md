# Lemma

An AI study companion for university math and science. It solves problems with you one hint at a time, and it helps you recover after a bad exam.

## What it does

- **Solve together**: type a problem or send a photo; the tutor gives one step at a time and checks your working.
- **Bad exam?**: talk through what happened, then get a five-day comeback plan aimed at the marks you lost.
- **Voice mode**: speak to the tutor and hear replies aloud (Chrome or Edge).
- **Mock exam**: five questions, six minutes, no hints, then a question-by-question review.
- **Memory**: the tutor remembers weak topics and past sessions; you can read and erase it on the home screen.
- **Adaptive practice**: short question sets that get harder or easier as you answer.

Three mascot tutors (Nova, Max, Ada) share the same model with different personalities.

## Run it

Requires Node.js 18 or newer. There is nothing to install.

```bash
cp .env.example .env
```

Put your key in `.env` (either `FAL_KEY`, or `ANTHROPIC_API_KEY` to call Claude directly), then:

```bash
npm start
```

Open http://localhost:3000.

## How it is built

- `server.js`: a dependency-free Node server. Serves `public/` and forwards chat requests to Claude, through fal by default or directly when `ANTHROPIC_API_KEY` is set.
- `public/app.js`: the whole app in plain JavaScript (landing page, onboarding, home, tutor chat, voice mode, practice, mock exam, memory). State is kept in the browser's local storage.
- `public/img/`: mascot art generated with fal.

Lemma is an AI. It is not a human tutor or a mental-health service, and it is written for adults.
