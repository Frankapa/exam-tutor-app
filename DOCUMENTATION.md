# PastQuestion — AI Exam Tutor

**Full project documentation**

---

## 1. Overview

PastQuestion is a practice tool for Nigerian secondary school students
preparing for WAEC and JAMB exams. Instead of a fixed bank of past
questions, it generates a fresh multiple-choice question every time using
Google's Gemini AI — so no two sessions are the same, and there's no
answer key to memorize. Students also get instant marking, a plain-language
AI explanation of any question they get wrong, and a free-form box to ask
the tutor anything.

**Built for:** a coding challenge focused on useful products for people in
Africa. Scoped deliberately small and finished end-to-end, rather than
left as an ambitious but incomplete platform.

**Live demo flow:** pick a subject → answer AI-generated questions one at
a time → get instant right/wrong feedback with a short explanation → ask
the AI tutor to break down anything confusing → see a final score and a
list of topics to review.

---

## 2. Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev server, simple build, no unnecessary framework weight |
| Backend | Node.js + Express (ESM) | Small, well-understood API layer; ESM to match the frontend's `import` style |
| AI | Google Gemini API (`gemini-3.5-flash-lite`) | Free tier with no card required, and a high daily quota suited to many small calls |
| Styling | Plain CSS (no framework) | Custom exam-booklet visual identity — didn't need a component library |
| Hosting (backend) | Render | Free/cheap always-on Node hosting, simple env var management |
| Hosting (frontend) | Vercel | Zero-config Vite deploys, generous free tier |

No database is used — the app is fully stateless. Every question is
generated fresh per request; nothing is persisted between sessions.

---

## 3. Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React frontend  │  HTTPS  │  Express backend  │  HTTPS  │   Gemini API     │
│  (Vercel)        │ ──────> │  (Render)         │ ──────> │  (Google)        │
│                  │ <────── │                   │ <────── │                  │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

The frontend never talks to Gemini directly. This matters for two
reasons:

1. **Security** — the Gemini API key lives only in the backend's
   environment variables. It's never sent to, or visible in, the
   browser.
2. **Control** — the backend can validate, reshape, and add error
   handling around whatever Gemini returns before the frontend ever sees
   it (see §6, "How question generation works").

---

## 4. Project structure

```
exam-tutor-app/
├── README.md                     # Setup-focused quick start
├── DOCUMENTATION.md              # This file
├── .gitignore
│
├── server/                       # Express backend
│   ├── package.json
│   ├── .env.example               # Template for required env vars
│   └── src/
│       ├── index.js               # App entry point: middleware, routes, listen
│       ├── routes/
│       │   └── tutor.js           # All /api/tutor/* endpoints
│       └── services/
│           └── geminiClient.js    # Wraps calls to the Gemini API
│
└── client/                       # React frontend (Vite)
    ├── package.json
    ├── .env.example                # Template for VITE_API_BASE_URL
    ├── vite.config.js              # Dev server + local API proxy config
    ├── index.html
    └── src/
        ├── main.jsx                # React root
        ├── App.jsx                 # Top-level quiz state machine
        ├── index.css               # Global styles (design system)
        ├── data/
        │   └── subjects.js         # List of subjects + questions-per-session
        ├── api/
        │   └── tutor.js            # fetch() helpers for talking to the backend
        └── components/
            ├── Header.jsx
            ├── SubjectPicker.jsx
            ├── QuestionCard.jsx     # Core quiz UI: question, options, explain button
            ├── SummaryPanel.jsx     # End-of-session score + weak topics
            └── AskTutor.jsx         # Free-form "ask anything" box
```

---

## 5. Design system

The visual identity is "Naija Pride" — Nigerian flag colors (emerald
green, cream, gold) instead of a generic bright rainbow palette, paired
with light gamification to make repeated practice feel rewarding rather
than flat:

- **Emerald green** as the dominant accent — subject tag, buttons,
  progress bar fill
- **Warm cream card surfaces** on a soft neutral page background
- **Gold** for the streak badge and feedback callouts
- **Segmented progress bar** across the top of each question, showing
  how far through the 10-question session the student is
- **Streak counter** (🔥) that increments on consecutive correct answers
  and resets on a miss, shown live during the quiz and as a "best streak"
  on the summary screen
- **A small confetti burst** animates outward from the correct answer the
  moment it's revealed — the one deliberately delightful "reward" beat in
  an otherwise calm, focused interface
- Green for correct answers, a soft red for wrong ones (with
  strikethrough)

All colors live in `client/src/index.css` as CSS custom properties
(`--green`, `--gold`, `--wrong-icon`, etc.), so the palette can be
adjusted project-wide from one `:root` block. An earlier "notebook /
past-questions-booklet" visual direction (cream paper, red margin line)
was explored and replaced with this version after design feedback.

---

## 6. How question generation works

This is the core mechanic that makes the app "AI-native" rather than a
static quiz with a chatbot bolted on.

1. When a student picks a subject, the frontend calls
   `POST /api/tutor/generate-question` with `{ subject, previousQuestions }`.
2. The backend builds a prompt instructing Gemini to act as an
   "item-writer," produce one WAEC/JAMB-difficulty multiple-choice
   question, and — critically — to avoid repeating anything in
   `previousQuestions` (a running list the frontend keeps of everything
   already asked this session).
3. The request sets `responseMimeType: "application/json"`, which tells
   Gemini to return **strict JSON only**, no markdown fences or
   commentary — making it parseable without guesswork.
4. The backend parses the response and validates its shape before ever
   sending it to the frontend: exactly 4 options, a `correctIndex`
   between 0 and 3, a non-empty question and explanation. If Gemini ever
   returns something malformed (which does happen occasionally), the
   backend responds with a clean `502` and a friendly message instead of
   forwarding broken data to the UI.
5. The frontend shows a "Generating your question..." state while this
   is in flight, then renders the question once it arrives.

This same validation-first pattern is why a `429` (rate limit) or a
malformed response never crashes the app — every failure mode has an
explicit, human-readable message defined in `server/src/routes/tutor.js`.

---

## 7. API reference

All endpoints are mounted under `/api/tutor`. All responses are JSON.

### `GET /api/health`

Simple liveness check.

**Response `200`:**
```json
{ "status": "ok" }
```

---

### `POST /api/tutor/generate-question`

Generates one fresh multiple-choice question.

**Request body:**
```json
{
  "subject": "Mathematics",
  "previousQuestions": ["What is the LCM of 6 and 8?"]
}
```
`previousQuestions` is optional — omit it or send `[]` for the first
question of a session.

**Response `200`:**
```json
{
  "question": "Simplify: 3(2x − 4) − 2(x − 5)",
  "options": ["4x − 2", "4x + 2", "8x − 22", "4x − 22"],
  "correctIndex": 0,
  "note": "Expand both brackets first: 6x − 12 − 2x + 10 = 4x − 2."
}
```

**Error responses:**
- `400` — `subject` missing
- `429` — Gemini's free-tier quota temporarily exhausted
- `502` — Gemini returned unparseable or malformed JSON
- `500` — any other failure reaching Gemini

---

### `POST /api/tutor/explain`

Gets a step-by-step explanation of a specific question, used after a
student answers.

**Request body:**
```json
{
  "subject": "Mathematics",
  "question": "Simplify: 3(2x − 4) − 2(x − 5)",
  "options": ["4x − 2", "4x + 2", "8x − 22", "4x − 22"],
  "correctAnswer": "4x − 2"
}
```

**Response `200`:**
```json
{ "explanation": "Start by expanding each bracket separately..." }
```

**Error responses:** `400` (missing fields), `429`, `500` — same pattern
as above.

---

### `POST /api/tutor/ask`

Free-form question to the tutor, unrelated to any specific quiz item.

**Request body:**
```json
{ "question": "What is the difference between a noun clause and a noun phrase?" }
```

**Response `200`:**
```json
{ "answer": "A noun phrase is a group of words built around a noun..." }
```

**Error responses:** `400` (empty question), `429`, `500`.

---

## 8. Environment variables

### Backend (`server/.env`)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Your free key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | No | `gemini-3.5-flash-lite` | Which Gemini model to call. Flash-Lite is used specifically for its higher free-tier daily quota |
| `PORT` | No | `4000` | Port the Express server listens on |

### Frontend (`client/.env`)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `""` (relative paths) | Set this to your deployed backend URL (e.g. Render) once deployed. Left unset, requests go to relative paths, which Vite's dev proxy forwards to `localhost:4000` locally |

Both `.env` files are gitignored on purpose and must be created locally
from their `.env.example` templates — they are never committed.

---

## 9. Running locally

Requires Node.js 18+.

```bash
# Terminal 1 — backend
cd server
cp .env.example .env
# edit .env, paste in your real GEMINI_API_KEY
npm install
npm run dev
# → running on http://localhost:4000

# Terminal 2 — frontend
cd client
npm install
npm run dev
# → running on http://localhost:5173
```

Open `http://localhost:5173`. The Vite dev server proxies any `/api/...`
request to the backend automatically (see `client/vite.config.js`), so no
extra configuration is needed for local development.

---

## 10. Deployment

### Backend → Render

1. Push the project to GitHub (see §12 if you need a refresher).
2. On Render: **New → Web Service** → connect the repo.
3. Set **Root Directory** to `server`.
4. **Build Command:** `npm install` · **Start Command:** `npm start`
5. Add environment variables `GEMINI_API_KEY` and `GEMINI_MODEL` in
   Render's dashboard (Environment tab).
6. Deploy. Test with `https://your-app.onrender.com/api/health`.

### Frontend → Vercel

1. On Vercel: **Add New → Project** → import the same GitHub repo.
2. Set **Root Directory** to `client`. Vercel auto-detects Vite.
3. Add environment variable `VITE_API_BASE_URL` set to your Render URL
   (no trailing slash).
4. Deploy. Vercel gives you a URL like `your-app.vercel.app`.

### Alternative: single-service deployment

Express can serve the built React files directly instead of running two
separate services — see the "Optional: serve everything from one place"
section in `README.md` for the exact code snippet.

---

## 11. Testing the API directly (Postman)

Useful for confirming the backend works independently of the frontend.

| Request | Method | URL | Body |
|---|---|---|---|
| Health check | GET | `{{base_url}}/api/health` | — |
| Generate question | POST | `{{base_url}}/api/tutor/generate-question` | `{"subject": "Mathematics", "previousQuestions": []}` |
| Explain | POST | `{{base_url}}/api/tutor/explain` | `{"subject": "Mathematics", "question": "What is 2 + 2?", "options": ["2","3","4","5"], "correctAnswer": "4"}` |
| Ask | POST | `{{base_url}}/api/tutor/ask` | `{"question": "What is a noun clause?"}` |

Set up a Postman **Environment** with a `base_url` variable
(`http://localhost:4000` locally, your Render URL in production) so you
can flip between them without editing every request.

---

## 12. Common issues and fixes

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find module 'dotenv'` / `ERR_MODULE_NOT_FOUND` | `npm install` hasn't been run in that copy of the project | Run `npm install` inside `server/` |
| `npm error ... Could not read package.json` | Running `npm install`/`npm run dev` from the wrong folder | `cd server` (or `cd client`) first — each has its own `package.json` |
| `GEMINI_API_KEY is missing` | `.env` not created, misnamed (e.g. `.env.txt`), or server started before the file existed | Confirm the file is exactly named `.env`, restart the server after editing it |
| Answer text cuts off mid-sentence | Gemini's "thinking" tokens ate the output budget | Already fixed in this codebase via a higher `maxOutputTokens`; Flash-Lite also reduces this |
| `429 RESOURCE_EXHAUSTED` | Free-tier daily quota hit for that model | Wait for the daily reset, or confirm you're using `gemini-3.5-flash-lite`, not a general-purpose Flash model |
| `404 ... no longer available to new users` | A specific Gemini model version was retired | Update `GEMINI_MODEL` to the version Google's own error message recommends, or use `gemini-flash-latest` to always track the current version |
| Frontend can't reach the backend at all | Backend not running, or app opened as a file instead of via `http://localhost:5173` | Confirm the backend terminal is running; always open the app through the Vite dev server URL |

---

## 13. Known limitations / trade-offs

- **No persistence.** Scores and session history are not saved anywhere
  — refreshing the page loses progress. Adding a database is the natural
  next step if this becomes a real product.
- **API cost scales with usage.** Every question, explanation, and
  free-form question is a live Gemini call. Flash-Lite's free tier is
  generous, but a genuinely popular deployment would eventually need a
  paid Gemini plan.
- **No user accounts.** Anyone can use the app; there's no login, so
  there's no way to track an individual student's progress over time.
- **Only two subjects** are wired up (Mathematics, English Language).
  Adding more is a one-line change in `client/src/data/subjects.js`, but
  more subject-specific prompt tuning may improve question quality
  further.

---

## 14. Possible next steps

- Persist session results (e.g. via a lightweight database) so students
  can track improvement over time.
- Add more subjects and calibrate prompts per-subject for consistent
  difficulty.
- Cache/batch question generation (e.g. request 3–5 questions per call
  instead of one) to reduce API usage per session.
- Add a "difficulty" selector so students can choose easier or harder
  questions.
- Offline-friendly mode for low-connectivity use, given the target
  audience.
