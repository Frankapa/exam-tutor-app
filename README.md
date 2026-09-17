# PastQuestion — AI Exam Tutor

A small practice tool for WAEC/JAMB students: work through exam-style
questions, get instant marking, and ask an AI tutor to explain anything
step by step.

The project has two parts:

- **`server/`** — an Express API that holds the Google Gemini API key and
  proxies requests to it. The frontend never talks to Gemini directly,
  so the key is never exposed to the browser.
- **`client/`** — a React app (built with Vite) for the quiz UI.

This project uses Google's Gemini API (via Google AI Studio) instead of a
paid API, because Gemini has an ongoing free tier — no credit card, and no
trial credit that runs out.

## Getting a free Gemini API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with any Google account (no card required)
3. Click **Create API key**
4. Copy the key — you'll paste it into `server/.env` below

## A note on which model to use

This project defaults to `gemini-3.5-flash-lite` (see `server/.env.example`),
not one of the general-purpose "flash" models. Google's Flash-Lite models
are built specifically for high-volume, simple calls — which is exactly
this app's pattern, since every question, explanation, and free-form
question is a separate API call. General-purpose Flash models have a much
smaller free daily quota and will hit `429 Too Many Requests` errors far
faster under the same usage. If you ever see a 429, wait a few minutes —
it's a temporary daily quota limit, not a bug.

## Running it locally

You'll need Node.js 18 or later (for built-in `fetch`).

### 1. Start the backend

```bash
cd server
cp .env.example .env
# open .env and paste in your real Gemini API key
npm install
npm run dev
```

The server starts on `http://localhost:4000`. You can check it's alive at
`http://localhost:4000/api/health`.

### 2. Start the frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

This starts the Vite dev server on `http://localhost:5173`. It's already
configured (see `vite.config.js`) to forward any `/api/...` request to the
backend on port 4000, so you don't need to change anything to develop
locally.

Open `http://localhost:5173` in your browser.

## Deploying it

This is a normal two-service app:

1. **Deploy `server/`** to a host that can hold a secret environment
   variable — Render works well for this (set Root Directory to `server`,
   Build Command to `npm install`, Start Command to `npm start`). Set
   `GEMINI_API_KEY` and `GEMINI_MODEL` as environment variables in the
   host's dashboard — never commit them or put them in the frontend.
2. **Point the frontend at your deployed backend.** Copy
   `client/.env.example` to `client/.env` and set:

   ```
   VITE_API_BASE_URL=https://your-app-name.onrender.com
   ```

   (No trailing slash.) Leave this file absent or empty during local
   development — the app falls back to relative paths, which Vite's dev
   proxy forwards to `localhost:4000` automatically.
3. **Build the frontend** with `npm run build` inside `client/`, which
   outputs static files to `client/dist/`. Deploy those static files
   anywhere (Netlify, Vercel, GitHub Pages, or served directly by the
   Express server — see below).

### Optional: serve everything from one place

If you'd rather run a single service instead of two, you can have Express
serve the built React files directly. After running `npm run build` in
`client/`, add this near the bottom of `server/src/index.js` (before
`app.listen`):

```js
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../../client/dist")));
```

Then deploy just the `server/` folder (with `client/dist` copied inside
it, or built as part of your deploy step). In this setup you can leave
`VITE_API_BASE_URL` unset, since the frontend and backend share the same
origin.

## Project structure

```
exam-tutor-app/
  server/
    src/
      index.js              # Express app entry point
      routes/tutor.js        # /api/tutor/generate-question, /explain, /ask
      services/geminiClient.js     # wraps the Gemini API call
    .env.example
    package.json
  client/
    src/
      main.jsx
      App.jsx                # top-level quiz state machine
      index.css
      data/subjects.js       # list of subjects + questions-per-session count
      api/tutor.js            # fetch helpers for the backend
      components/
        Header.jsx
        SubjectPicker.jsx
        QuestionCard.jsx
        SummaryPanel.jsx
        AskTutor.jsx
    index.html
    package.json
    vite.config.js
  README.md
```

## How questions are generated

Questions are no longer hardcoded. Each time a student starts a subject or
moves to the next question, the frontend calls
`POST /api/tutor/generate-question` with the subject and the list of
questions already asked in that session. The backend prompts Gemini to
write one fresh multiple-choice question as strict JSON
(`{ question, options, correctIndex, note }`), telling it to avoid
repeating anything already asked. This means no two runs of the quiz look
the same, and there's no fixed answer key to memorize.

To add a new subject, just add its name to the `SUBJECTS` array in
`client/src/data/subjects.js` — no other code changes needed, since the
question-generation prompt already takes the subject as a parameter.
